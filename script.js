const $ = v=>document.querySelector(v);
const $id = v=>document.getElementById(v);

const toJson = v=>JSON.stringify(v);
const fromJson = v=>JSON.parse(v);
const copy = v=>fromJson(toJson(v));

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

// settings
const basic_settings = {
    clock_language : "한국어",
    clock_appearSec : true,
    clock_timeSign : false,
    font : "'BookkMyungjo'",
    title : "Search",
    titleColor : "black",
    titleAnimation : true,
    bgType : "color",
    bgValue : "white",
    bookmarks : basicBookMark,
    showBookmark : false
};
let active_settings;

const initialize = (dat)=>{
    active_settings=fromJson(toJson(dat??basic_settings));
    const entBs = Object.entries(basic_settings);
    entBs.forEach(v=>{
        const [key,val] = v;
        active_settings[key] = active_settings[key]??fromJson(toJson(val));
    });
};

// st = setting
const st = (value)=>{
    if(value) localStorage.setItem("settings",toJson(value));
    const dat = fromJson(localStorage.getItem("settings"));
    dat.title+="";
    return dat;
};

const autoInitializing = ()=>{ // 현 세팅값이 이상하면 초기화
    if(!st()) {
        initialize(basic_settings);
    } else {
        initialize(st());
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
const engines = [
    {
        name : "Google",
        url : "https://www.google.com/search",
        arg : "q"
    },
    {
        name : "Naver",
        url : "https://search.naver.com/search.naver",
        arg : "query"
    }
];
const changeEngine = engineName=>{
    const eng = engines.find(v=>v.name===engineName);
    if(!eng) return false;
    $schForm.action = eng.url;
    $schIpt.name = eng.arg;
    updatePlaceHolder();
    return true;
};

// engine Select
const updateEngineList = ()=>engines.forEach(eng=>{
    $engineSelect.innerHTML += `
    <option value="${eng.name}">${eng.name}</option>
    `;
});

updateEngineList();
changeEngine("Google");


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
    <button id="initializeBtn" onclick="initialize();openSetting();location.reload();">기본값으로 초기화</button>
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
        <button id="exportBtn" onclick="userSetExport()">
            설정 내보내기
        </button>
        <button id="importBtn" onclick="userSetImport()">
            설정 불러오기
        </button>
    `;
    updateSettingEvents();
};

const userSetExport = ()=>{
    navigator.clipboard.writeText(exportSet());
    alert('클립보드에 복사되었습니다.');
};
const userSetImport = ()=>{
    const dat = prompt('불러오실 설정데이터를 붙여넣기 하여 주십시오.');
    applySet(dat);
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
    const setRes = copy(active_settings); // 최종 적용될 것
    const newSet = fromJson(txt); // 들어온 정보

    Object.entries(newSet).forEach(v=>{
        const [key,val] = v;
        setRes[key] = val;
    });

    initialize(setRes);
};
const exportSet = ()=>toJson(active_settings);

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

    <button id="addBMBtn">
        +
    </button>
    ⌟
        `:"";
};
const deleteBookMark = function(name){
    active_settings.bookmarks=active_settings.bookmarks.filter(v=>v.name!==name);
    refreshBookMark();
};
refreshBookMark();