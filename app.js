// ==========================
// PWA Register
// ==========================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (e) {
      console.log("SW failed", e);
    }
  });
}

// ==========================
// Data dasar
// ==========================
const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const dino = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const pasaran = ["Legi","Pahing","Pon","Wage","Kliwon"];

// ==========================
// Helper tanggal (ANTI timezone bug)
// ==========================
function pad2(n){ return String(n).padStart(2,"0"); }
function keyYMD(date){
  return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`;
}
function normalizeLocal(d){
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function diffDaysLocal(a, b){
  return Math.round((normalizeLocal(a) - normalizeLocal(b)) / 86400000);
}
function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }

// ==========================
// PASARAN (Permanen & Akurat)
// Anchor user: 2026-01-30 = Jumat Pahing
// ==========================
const PASARAN_ANCHOR_DATE = new Date(2026, 0, 30); // 30 Jan 2026
const PASARAN_ANCHOR_INDEX = pasaran.indexOf("Pahing");

function getPasaran(date){
  const delta = diffDaysLocal(date, PASARAN_ANCHOR_DATE);
  const idx = (PASARAN_ANCHOR_INDEX + delta) % 5;
  return pasaran[(idx + 5) % 5];
}
function getWeton(date){
  return `${dino[date.getDay()]} ${getPasaran(date)}`;
}

// ==========================
// Hijriah (Format H, bukan SM)
// ==========================
function getHijri(date){
  try{
    const fmt = new Intl.DateTimeFormat("id-ID-u-ca-islamic", {
      day:"numeric",
      month:"long",
      year:"numeric"
    }).format(date);

    // beberapa device tulis "SM", kita paksa jadi "H"
    return fmt.replace(/\s*SM$/i,"").trim() + " H";
  }catch(e){
    return "Hijriah tidak tersedia";
  }
}

// ==========================
// TANGGAL CINA (CUSTOM, AKURAT)
// Anchor: 2026-01-30 = 14 Cap Ji Gwee
// Tahun 2026 NON-kabisat (tidak pakai Lun Gwee)
// ==========================
const CINA_ANCHOR_DATE = new Date(2026, 1, 31);
const CINA_ANCHOR_MONTH = "Cap Ji Gwee";
const CINA_ANCHOR_DAY = 14;

const cinaMonths = [
  { name: "Cia Gwee", days: 30 },
  { name: "Ji Gwee", days: 29 },
  { name: "Sa Gwee", days: 30 },
  { name: "Si Gwee", days: 30 },
  { name: "Go Gwee", days: 29 },
  { name: "Lak Gwee", days: 30 },
  { name: "Cit Gwee", days: 29 },
  { name: "Peh Gwee", days: 29 },    // 2026 non-kabisat
  { name: "Kauw Gwee", days: 29 },   // 2026 non-kabisat
  { name: "Cap Gwee", days: 29 },
  { name: "Cap It Gwee", days: 29 },
  { name: "Cap Ji Gwee", days: 30 }
];

function getMonthIndexByName(name){
  return cinaMonths.findIndex(m => m.name === name);
}

function getChineseDateCustom(date){
  const delta = diffDaysLocal(date, CINA_ANCHOR_DATE);
  let day = CINA_ANCHOR_DAY + delta;
  let monthIndex = getMonthIndexByName(CINA_ANCHOR_MONTH);

  if(monthIndex < 0) return { label: "Tidak tersedia" };

  // maju
  while(day > cinaMonths[monthIndex].days){
    day -= cinaMonths[monthIndex].days;
    monthIndex++;
    if(monthIndex >= cinaMonths.length){
      // kalau lewat siklus, tetap aman tampil (biar gak blank)
      monthIndex = cinaMonths.length - 1;
      day = cinaMonths[monthIndex].days;
      break;
    }
  }

  // mundur
  while(day <= 0){
    monthIndex--;
    if(monthIndex < 0){
      monthIndex = 0;
      day = 1;
      break;
    }
    day += cinaMonths[monthIndex].days;
  }

  return { label: `${day} ${cinaMonths[monthIndex].name}` };
}

// ==========================
// SHIO & ELEMEN (FIX PER TANGGAL IMLEK)
// Sebelum 17 Feb 2026 = Ular Kayu
// Mulai 17 Feb 2026 = Kuda Api
// ==========================
const IMLEK_2026 = new Date(2026, 2, 17); // 17 Feb 2026

function getShioElementByDate(date){
  const d = normalizeLocal(date);
  const cut = normalizeLocal(IMLEK_2026);

  if(d < cut){
    return { shio: "Ular", elemen: "Kayu" };
  }
  return { shio: "Kuda", elemen: "Api" };
}

// ==========================
// Libur Nasional 2026 (FIX: 29 Jan BUKAN libur)
// ==========================
const nationalHolidays2026 = {
  "2026-01-01": "Tahun Baru Masehi",
  "2026-01-16": "Isra Mikraj",

  "2026-02-17": "Hari Raya Imlek",

  "2026-03-18": "Cuti Bersama Nyepi",
  "2026-03-19": "Hari Raya Nyepi",
  "2026-03-20": "Cuti Bersama Idul Fitri",

  "2026-03-21": "Hari Raya Idul Fitri",
  "2026=03-22": "Hari Raya Idul Fitri",
  "2026-03-23": "Cuti Bersama Idul Fitri", 

  "2026-03-24": "Cuti Bersama Idul Fitri",
  "2026-04-03": "Wafat Yesus Kristus",
  "2026-04-05": "Paskah",

  "2026-05-01": "Hari Buruh",
  "2026-05-14": "Kenaikan Yesus Kristus",
  "2026=05-15": "Cuti Bersama Kenaikan Yesus Kristus",
  "2026-05-27": "Hari Raya Idul Adha",
  "2026;05-28": "Cuti Bersama Idul Adha",

  "2026-05-31": "Hari Raya Waisak",
  "2026-06-01": "Hari Lahir Pancasila",
  "2026-06-16": "Tahun Baru Islam (I Muharram 1448 H)",
  
  "2026-08-17": "Hari Kemerdekaan RI",

  "2026-08-25": "Maulid Nabi Muhammad SAW",

  "2026-12-24": "Cuti Bersama Natal",
  "2026-12-25": "Hari Raya Natal"
};

// ==========================
// UI Elements
// ==========================
const monthSelect = document.getElementById("monthSelect");
const yearSelect  = document.getElementById("yearSelect");
const daysGrid    = document.getElementById("daysGrid");
const detail      = document.getElementById("detail");
const dowHead     = document.getElementById("dowHead");
const searchDate  = document.getElementById("searchDate");
const goBtn       = document.getElementById("goBtn");

// ==========================
// Init Selectors
// ==========================
let viewDate = new Date();

function initSelectors(){
  dowHead.innerHTML = "";
  ["Min","Sen","Sel","Rab","Kam","Jum","Sab"].forEach(h=>{
    const el = document.createElement("div");
    el.textContent = h;
    dowHead.appendChild(el);
  });

  monthSelect.innerHTML = "";
  monthNames.forEach((m,i)=>{
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = m;
    monthSelect.appendChild(opt);
  });

  yearSelect.innerHTML = "";
  const thisYear = new Date().getFullYear();
  for(let y=thisYear-50; y<=thisYear+50; y++){
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
}

// ==========================
// Render Kalender
// ==========================
function render(){
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();

  monthSelect.value = m;
  yearSelect.value  = y;

  daysGrid.innerHTML = "";

  const first = new Date(y,m,1);
  const startDow = first.getDay();
  const total = daysInMonth(y,m);

  for(let i=0;i<startDow;i++){
    const blank = document.createElement("div");
    blank.className = "mutedCell";
    daysGrid.appendChild(blank);
  }

  const today = new Date();
  const todayKey = keyYMD(today);

  for(let d=1; d<=total; d++){
    const date = new Date(y,m,d);
    const k = keyYMD(date);

    const weton = getWeton(date);
    const holidayName = nationalHolidays2026[k];

    const isSunday = date.getDay() === 0;
    const isHoliday = !!holidayName || isSunday;

    const cell = document.createElement("div");
    cell.className = "day";
    if(isHoliday) cell.classList.add("holiday");
    if(k === todayKey) cell.classList.add("today");

    cell.innerHTML = `
      <div class="numRow">
        <div class="num">${d}</div>
        <div class="tag">${weton.split(" ")[1]}</div>
      </div>
      <div class="mini">${weton}</div>
      ${holidayName ? `<div class="mini">🎌 ${holidayName}</div>` : ""}
    `;

    cell.onclick = ()=> showDetail(date);
    daysGrid.appendChild(cell);
  }
}

// ==========================
// Detail
// ==========================
function showDetail(date){
  const k = keyYMD(date);
  const holidayName = nationalHolidays2026[k];

  const hijri = getHijri(date);
  const weton = getWeton(date);
  const chinaDate = getChineseDateCustom(date);
  const shioElem = getShioElementByDate(date);

  detail.innerHTML = `
    <div><span class="k">Tanggal:</span> <span class="v">${dino[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}</span></div>
    <div class="hr"></div>

    <div>🧿 <span class="k">Weton Jawa:</span> <span class="v">${weton}</span></div>
    <div>🌙 <span class="k">Hijriah:</span> <span class="v">${hijri}</span></div>
    <div>🧧 <span class="k">Tanggal Cina:</span> <span class="v">${chinaDate.label}</span></div>
    <div>🐲 <span class="k">Shio Tahun:</span> <span class="v">${shioElem.shio}</span></div>
    <div>🔥 <span class="k">Elemen:</span> <span class="v">${shioElem.elemen}</span></div>

    <div class="hr"></div>
    <div>🎌 <span class="k">Libur:</span> <span class="v">${holidayName ? holidayName : (date.getDay()===0 ? "Minggu" : "Tidak ada")}</span></div>
  `;
}

// ==========================
// Controls
// ==========================
document.getElementById("prevBtn").onclick = ()=>{
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1);
  render();
};
document.getElementById("nextBtn").onclick = ()=>{
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1);
  render();
};
document.getElementById("todayBtn").onclick = ()=>{
  const now = new Date();
  viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
  render();
  showDetail(now);
};

monthSelect.onchange = ()=>{
  viewDate = new Date(parseInt(yearSelect.value), parseInt(monthSelect.value), 1);
  render();
};
yearSelect.onchange = ()=>{
  viewDate = new Date(parseInt(yearSelect.value), parseInt(monthSelect.value), 1);
  render();
};

goBtn.onclick = ()=>{
  if(!searchDate.value) return;
  const [yy,mm,dd] = searchDate.value.split("-").map(Number);
  const target = new Date(yy, mm-1, dd);
  viewDate = new Date(target.getFullYear(), target.getMonth(), 1);
  render();
  showDetail(target);
};

// ==========================
// Init
// ==========================
initSelectors();
render();

// auto buka detail hari ini pas app dibuka

showDetail(new Date());
