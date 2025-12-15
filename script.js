
const $ = v=>{
    if(typeof v === "object") return v.reduce((pre,cur)=>[...pre,$(cur)],[]);
    return document.querySelector(v);
};
const $id = v=>document.getElementById(v);

const toJson = v=>JSON.stringify(v);
const fromJson = v=>JSON.parse(v);
const copy = v=>fromJson(toJson(v));

const obj_key_filter = (obj,keys)=>Object.entries(obj).filter(v=>keys.includes(v[0])).reduce((pre,cur)=>{pre[cur[0]]=cur[1];return pre},{});

const _alert = (title,text,height=250)=>{
    const [$title,$text] = $(["#alertTitle","#alertText"]);

    $title.innerHTML = title;
    $text.innerHTML = text;

    $("#alert").style.height=height+"px";
    $("#alert").showModal();
};

const _confirm = (title,text,callback)=>{
    const now = +new Date();
    _alert(title,`
        ${text}
        <table class="confirmTb">
            <tr>
                <td><button id="yesBtn${now}" class="confirmBtn">YES</button></td>
                <td><button id="noBtn${now}" class="confirmBtn">NO</button></td>
            </tr>
        </table>
    `);
    $("#yesBtn"+now).addEventListener('click',()=>{
        callback(true);
        $("#alert").close();
    });
    $("#noBtn"+now).addEventListener('click',()=>{
        callback(false);
        $("#alert").close();
    });
};

const _prompt = (title,text,callback,placeholder="")=>{
    const now = +new Date();
    _alert(title,`
        <label class="promptLbl">${text}</label>
        <input id="promptIpt${now}" class="promptIpt" placeholder="${placeholder}">
        <table class="promptTb confirmTb">
            <tr>
                <td><button id="yesBtn${now}" class="confirmBtn">SEND</button></td>
                <td><button id="noBtn${now}" class="confirmBtn">CANCEL</button></td>
            </tr>
        </table>
    `);
    $("#yesBtn"+now).addEventListener('click',()=>{
        callback($("#promptIpt"+now).value);
        $("#alert").close();
    });
    $("#noBtn"+now).addEventListener('click',()=>{
        callback(false);
        $("#alert").close();
    });
};

// settings

const langSet = {
    한국어 : {
        days : ["월","화","수","목","금","토","일"],
        time : {
            noon : ["오전","오후"],
            hour : "시",
            minute : "분",
            second : "초"
        }
    },
    English : {
        days : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        time : {
            noon : ["AM","PM"],
            hour : "h",
            minute : "m",
            second : "s"
        }
    },
    漢字 : {
        days : ["月","火","水","木","金","土","日"],
        time : {
            noon : ["오전","오후"],
            hour : "시",
            minute : "분",
            second : "초"
        }
    }
};

const basicBookMark = [
    {
        name : "Google",
        href : "https://google.com"
    },
    {
        name : "Naver",
        href : "https://naver.com"
    },
    {
        name : "Pixabay",
        href : "https://pixabay.com"
    }
];

const basic_settings = {
    // searchEngine
    usingSearchEngine : "Google",
    searchEngines : [{
        name : "Google",
        url : "https://www.google.com/search",
        arg : "q"
    },
    {
        name : "Naver",
        url : "https://search.naver.com/search.naver",
        arg : "query"
    }],

    // design
    clock_language : "한국어",
    clock_appearSec : true,
    clock_timeSign : false,
    font : "'BookkMyungjo'",
    title : "Search",
    titleColor : "black",
    titleAnimation : true,
    bgType : "color",
    bgValue : "white",
    showBookmark : false,

    // book mark
    bookmarks : basicBookMark
};
const designSettings = ["clock_language","clock_appearSec","clock_timeSign","font","title","titleColor","titleAnimation","byType","bgValue","showBookmark"];
let active_settings;

const initialize = (dat)=>{
    active_settings=fromJson(toJson(dat??basic_settings));
    const entBs = Object.entries(basic_settings);
    entBs.forEach(v=>{
        const [key,val] = v;
        active_settings[key] = active_settings[key]??fromJson(toJson(val));
    });
};

const save_path = "srchset";

// st = setting
const st = (value)=>{
    if(value) localStorage.setItem(save_path,toJson(value));
    const dat = fromJson(localStorage.getItem(save_path));
    if(dat)dat.title+="";
    return dat;
};

const autoInitializing = ()=>{ // 현 세팅값이 이상하면 초기화
    if(!st()) {
        console.log("초기 초기화중...");
        initialize(basic_settings);
        console.log("초기 초기화 완료");
    } else {
        // console.log("데이터 완전 확인 중...");
        initialize(st());
        // console.log("데이터 완전 확인 완료");
    }
};

autoInitializing();

let frames = 0;
let coloringLetter = 0;
// Title Animation
const titleAniF = function(){
    const pgTitle = active_settings.title;
    const $pgTitle = $id("pageTitle");

    const maxFrame = pgTitle.length*2+1;
    
    if(maxFrame < frames) {
        return;
    };

    let text = "";
    let cursor = "<span style='color:gray;'>_</span>";
    if(frames <= pgTitle.length+1) {
        if(frames === pgTitle.length+1) {
            cursor = "";
        }
        for(let i = 0; i < frames; i++) {
            if(pgTitle.length<=i) break;
            text+=`<span id='letter_${i}' class='titleLetter'>${pgTitle[i]}</span>`;
        }
        $pgTitle.innerHTML = `
        ${text}${cursor}
        `;
        setTimeout(titleAniF,300);
    } else {
        $id(`letter_${coloringLetter}`).style.color=active_settings.titleColor;
        coloringLetter++;
        setTimeout(titleAniF,100);
    }
    frames++;
};

// clock
const $clock = $id("clock");
const updateClock = (function foo(){
    const now = new Date();
    const usingLang = active_settings.clock_language;
    const appearSeconds = active_settings.clock_appearSec;
    const appearTimeSign = active_settings.clock_timeSign;
    $clock.innerHTML = `
    <span>
    ${now.getFullYear()} .  ${((now.getMonth()+1)+"").padStart(2,"0")} . ${(now.getDate()+"").padStart(2,"0")}
    ( ${langSet[usingLang]["days"][now.getDay()-1]} )
    </span>
    
    <span style="margin-left: 30px;">
    ${(now.getHours()+"").padStart(2,"0")} ${appearTimeSign?langSet[usingLang].time.hour:" : "}
    ${(now.getMinutes()+"").padStart(2,"0")} ${appearTimeSign?langSet[usingLang].time.minute:
        appearSeconds?" : ":""
    }
    ${appearSeconds?`${(now.getSeconds()+"").padStart(2,"0")} ${appearTimeSign?langSet[usingLang].time.second:""}`:""}
    </span>
    `;
    return foo;
})();
setInterval(updateClock,1000);

// searching...
const $schIpt = $id("searchIpt");
const $schForm = $id("searchForm");

// searchIpt placeholder
const $engineSelect = $id("searchEngine");
const updatePlaceHolder = ()=>$schIpt.placeholder=`${$engineSelect.value}에서 검색하기`;
$engineSelect.onchange = function(){changeEngine(this.value)};

// change Engine
const changeEngine = engineName=>{
    const eng = active_settings.searchEngines.find(v=>v.name===engineName);
    if(!eng) return false;
    active_settings.usingSearchEngine = engineName;
    $schForm.action = eng.url;
    $schIpt.name = eng.arg;
    updatePlaceHolder();
    updateEngineList();
    return true;
};

// engine Select
const updateEngineList = ()=>{$engineSelect.innerHTML="";(active_settings.searchEngines).forEach(eng=>{
    $engineSelect.innerHTML += `
    <option value="${eng.name}" ${eng.name===active_settings.usingSearchEngine?"selected":""}>${eng.name}</option>
    `;
})};

updateEngineList();


// setting
const openSetting = ()=>{
    const $sDlg = $id("settingDlg");
    if(!$sDlg.open) {
        $sDlg.showModal();
        updateSettingPage();
    } else
        $sDlg.close();
};

const updateSettingPage = ()=>{
    const $page = $id("settingMain");
    const fonts = [
        {name:"명조",value:"'BookkMyungjo'"},
        {name:"고딕",value:"'Pretendard'"},
        {name:"흘림체",value:"NohHaeChan"},
        {name:"픽셀",value:"'ThinRounded'"}
    ];
    $page.innerHTML = `
    <small>입력식 설정은 입력 후 포커스 이동 또는 엔터키를 눌러주십시오.</small>
    <h2>
        디자인<br>
        <small>일부는 새로고침시 적용</small>
    </h2>
    <table class="settingTable">
        <tr>
            <th>
                제목
            </th>
            <td>
                <input id="set_title" value="${active_settings.title}" class="tableIpt">
            </td>
        </tr>
        <tr>
            <th>제목 색상</th>
            <td>
                <input id="set_titleColor" value="${active_settings.titleColor}" class="tableIpt">
            </td>
        </tr>
        <tr>
            <th>제목 애니메이션</th>
            <td>
                <select id="set_titleAnimation">
                    <option value="true" ${active_settings.titleAnimation?"selected":""}>예</option>
                    <option value="false" ${active_settings.titleAnimation?"":"selected"}>아니오</option>
                </select>
            </td>
        </tr>
        <tr>
            <th>배경</th>
            <td>
                <select id="set_bgType">
                    <option value="color" ${active_settings.bgType==="color"?"selected":""}>색상</option>
                    <option value="image" ${active_settings.bgType==="image"?"selected":""}>이미지</option>
                </select>
                <input id="set_bgValue" value="${active_settings.bgValue}" class="tableIpt">
            </td>
        </tr>
        <tr>
            <th>글꼴</th>
            <td>
                <select id="set_font">
                    ${fonts.reduce((pre,cur)=>pre+`
                        <option style="font-family:${cur.value}" value="${cur.value}" 
                        ${active_settings.font===cur.value?"selected":""}>${cur.name}</option>
                        `,"")}
                </select>
            </td>
        </tr>
    </table>
    <h2>상단바</h2>
    <table class="settingTable">
        <tr>
            <th>시계 언어</th>
            <td>
                <select id="set_clock_language">
                    ${Object.entries(langSet).reduce((pre,cur)=>pre+`
                        <option
                        value="${cur[0]}"
                        ${cur[0]===active_settings.clock_language?"selected":""}
                        >${cur[0]}</option>
                        `,"")}
                </select>
            </td>
        </tr>
        <tr>
            <th>시간 초단위 표시</th>
            <td>
                <select id="set_clock_appearSec">
                    <option value="true" ${active_settings.clock_appearSec?"selected":""}>예</option>
                    <option value="false"${active_settings.clock_appearSec?"":"selected"}>아니오</option>
                </select>
            </td>
        </tr>
        <tr>
            <th>시간 표시</th>
            <td>
                <select id="set_clock_timeSign">
                    <option value="true" ${active_settings.clock_timeSign?"selected":""}>00시 00분 00초</option>
                    <option value="false" ${active_settings.clock_timeSign?"":"selected"}>00 : 00 : 00</option>
                </select>
            </td>
        </tr>
        <tr>
            <th>북마크 표시</th>
            <td>
                <select id="set_showBookmark">
                    <option value="true" ${active_settings.showBookmark?"selected":""}>예</option>
                    <option value="false"${active_settings.showBookmark?"":"selected"}>아니오</option>
                </select>
            </td>
        </tr>

        </table>
        <h2>설정 저장
        <small style="cursor:pointer" onclick="_alert(
        '설정 저장 도움말',
        '아무 설정이나 내보낸 후, 설정 불러오기로 불러오기가 가능합니다.<br>예시를 들자면, 만약 스타일 설정 내보내기 이후에 해당 설정을 불러오기하면 스타일 설정만 적용됩니다.'
        )">도움말</small>
        </h2>
        <table class="settingTable">
            <tr>
                <td>
                    <button id="exportBtn" class="saveloadBtn" onclick="userSetExport()">
                        설정 내보내기
                    </button>
                </td>
                <td>
                    <button id="importBtn" class="saveloadBtn" onclick="userSetImport()">
                        설정 불러오기
                    </button>
                </td>
            </tr>
            <tr>
                <td>
                    <button id="exportBtn" class="saveloadBtn" onclick="userSetExport('design')">
                        스타일 설정 내보내기
                    </button>
                </td>
                <td>
                    <button id="exportBtn" class="saveloadBtn" onclick="userSetExport('bookmark')">
                        북마크 설정 내보내기
                    </button>
                </td>
            </tr>
            <tr>
                <td>
                    <button id="initializeBtn" class="saveloadBtn">기본값으로 초기화</button>
                </td>
            </tr>
        </table>
    `;
    $("#initializeBtn").addEventListener('click',()=>{
        const sets = copy(active_settings);
        initialize();
        _confirm("초기화","초기화 하시겠습니까?",val=>{
            if(val) location.reload();
            initialize(sets);
        });
    });
    updateSettingEvents();
};

const userSetExport = (type)=>{
    navigator.clipboard.writeText(exportSet(type??null));
    _alert('설정 내보내기','클립보드에 복사되었습니다.');
};
const userSetImport = type=>{
    _prompt('설정 불러오기','불러오실 설정데이터를 붙여넣기 하여 주십시오.',applySet);
};

const updateSettingEvents = ()=>{
    const a_bs = Object.entries(active_settings);
    a_bs.forEach(v=>{
        const key = v[0];
        const ele = $id("set_"+key);
        if(ele) {
            ele.onchange=function(){
                active_settings[key] = this.value;
                if(this.value==="false"||this.value==="true")
                    active_settings[key] = (this.value==="true");
                else if(+this.value)
                    active_settings[key] = +this.value;

                st(active_settings);

                switch(key) {
                    case "showBookmark" :
                        refreshBookMark();
                        break;
                }
            };
        }
    });
};

const applySet = txt=>{
    if(!txt) return false;
    const setRes = copy(active_settings); // 최종 적용될 것
    const newSet = fromJson(txt); // 들어온 정보

    Object.entries(newSet).forEach(v=>{
        const [key,val] = v;
        setRes[key] = val;
    });

    initialize(setRes);
};
const exportSet = option=>{
    let thing = active_settings;
    if(option==="design") thing = obj_key_filter(active_settings,designSettings);
    if(option==="bookmark") thing = obj_key_filter(active_settings,["bookmarks"]);
    return toJson(thing);
};

document.title = active_settings.title;
if(active_settings.titleAnimation)
    titleAniF();
else {
    const $pgTitle = $id("pageTitle");
    $pgTitle.innerHTML = active_settings.title;
    $pgTitle.style.color = active_settings.titleColor;
}
setInterval(()=>document.querySelectorAll("*").forEach(v=>v.style.fontFamily=active_settings.font));
setInterval(()=>{
    st(active_settings);
    changeEngine(active_settings.usingSearchEngine);
},100);

if(active_settings.bgType === "color") {
    document.body.style.background=active_settings.bgValue;
} else if(active_settings.bgType === "image") {
    document.body.style.backgroundImage=`url("${active_settings.bgValue}")`;
} else {
    initialize();
}

// 북마크
const $bookmark = $id("bookMarks");
const refreshBookMark = function(){
    const bm = active_settings.bookmarks;
    $bookmark.innerHTML = active_settings.showBookmark?`
    ⌜
    ${bm.reduce((pre,cur)=>pre+`
        <a href="${cur.href}" class="bookmark" target="_blank">
            ${cur.name}
        </a>
        <button class="deleteBMBtn" onclick="deleteBookMark('${cur.name}')"></button>
        `,"")}

    <button id="addBMBtn" onclick="addBookMark()">
        +
    </button>
    ⌟
        `:"";
};
const deleteBookMark = function(name){
    active_settings.bookmarks=active_settings.bookmarks.filter(v=>v.name!==name);
    refreshBookMark();
};
const addBookMark = ()=>_prompt("북마크 추가","북마크 추가하기:",ipt=>{
    if(!ipt) return;
    const [name,url] = ipt.split(";;;");
    if(!url) {
        setTimeout(()=>{
            _alert("오류","입력 양식을 따라주시기 바랍니다.");
        });
        return;
    }
    
    active_settings.bookmarks.push({name:name,href:url});
    refreshBookMark();
},"(북마크명);;;(웹주소)");
refreshBookMark();

//information
$("#helpBtn").addEventListener('click',()=>_alert(
    `정보`,
    `
    <table class="settingTable">
        <tr>
            <th>Version</th>
            <td>1.0</td>
        </tr>
        <tr>
            <th>Released</th>
            <td>2025. 12. 15</td>
        </tr>
        <tr>
            <th>Fonts</th>
            <td><a href="https://noonnu.cc">눈누</a></td>
        </tr>
    </table>
    Made By HJ
    `
));