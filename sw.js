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
// ANCHOR PASARAN (Permanen)
// 2026-01-30 = Jumat Pahing
// ==========================
const PASARAN_ANCHOR_DATE = new Date(2026, 0, 30); // local
const PASARAN_ANCHOR_INDEX = pasaran.indexOf("Pahing");

function diffDaysLocal(a, b){
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((da - db) / 86400000);
}

function getPasaran(date){
  const delta = diffDaysLocal(date, PASARAN_ANCHOR_DATE);
  const idx = (PASARAN_ANCHOR_INDEX + delta) % 5;
  return pasaran[(idx + 5) % 5];
}

function getWeton(date){
  return `${dino[date.getDay()]} ${getPasaran(date)}`;
}

// ==========================
// Hijriah (stabil) + format "H"
// ==========================
function getHijri(date){
  try{
    const fmt = new Intl.DateTimeFormat("id-ID-u-ca-islamic", {
      day:"numeric",
      month:"long",
      year:"numeric"
    }).format(date);

    return fmt.replace(/\s*SM$/i,"").trim() + " H";
  }catch(e){
    return "Hijriah tidak tersedia";
  }
}

// ==========================
// Kalender Cina CUSTOM (FIX)
// Target user:
// - Hari ini harus bisa jadi 14 Cap Ji Gwee
// - kemarin 13 Cap Ji Gwee
// - besok 15 Cap Ji Gwee
//
// Kita pakai ANCHOR:
// 2026-01-30 = 14 Cap Ji Gwee (sesuai user)
// 2026 tidak kabisat -> tidak ada Lun Gwee
// ==========================
const CINA_ANCHOR_DATE = new Date(2026, 0, 30); // 30 Jan 2026
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
  { name: "Pe Gwee", days: 29 },    // 2026 non-kabisat
  { name: "Kauw Gwee", days: 29 },  // 2026 non-kabisat
  { name: "Cap Gwee", days: 29 },
  { name: "Cap It Gwee", days: 29 },
  { name: "Cap Ji Gwee", days: 30 }
];

function getMonthIndexByName(name){
  return cinaMonths.findIndex(m => m.name === name);
}

// normalize date to chinese day/month using anchor
function getChineseDateCustom(date){
  const delta = diffDaysLocal(date, CINA_ANCHOR_DATE); // + berarti maju hari
  let day = CINA_ANCHOR_DAY + delta;
  let monthIndex = getMonthIndexByName(CINA_ANCHOR_MONTH);

  if(monthIndex < 0) return { label: "Tanggal Cina tidak tersedia", day:null, monthName:null };

  // maju
  while(day > cinaMonths[monthIndex].days){
    day -= cinaMonths[monthIndex].days;
    monthIndex++;
    if(monthIndex >= cinaMonths.length){
      return { label: "Tahun Cina berikutnya", day:null, monthName:null };
    }
  }

  // mundur
  while(day <= 0){
    monthIndex--;
    if(monthIndex < 0){
      return { label: "Tahun Cina sebelumnya", day:null, monthName:null };
    }
    day += cinaMonths[monthIndex].days;
  }

  return { label: `${day} ${cinaMonths[monthIndex].name}`, day, monthName: cinaMonths[monthIndex].name };
}

// ==========================
// SHIO + ELEMEN FIX BY IMLEK 2026
// Sebelum 17 Feb 2026: Ular Kayu
// Mulai 17 Feb 2026: Kuda Api
// ==========================
const IMLEK_2026 = new Date(2026, 1, 17); // 17 Feb 2026

function getShioElementByDate(date){
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const cut = new Date(IMLEK_2026.getFullYear(), IMLEK_2026.getMonth(), IMLEK_2026.getDate());

  if(d < cut){
    return { shio: "Ular", elemen: "Kayu" };
  }
  return { shio: "Kuda", elemen: "Api" };
}

// ==========================
// Libur Nasional 2026 (EDITABLE)
// ==========================
const nationalHolidays2026 = {
  "2026-01-01": "Tahun Baru Masehi",
  "2026-01-16": "Isra Mikraj",
  "2026-01-29": "Tahun Baru Imlek (Hari Libur)",

  "2026-02-17": "Tahun Baru Imlek (1 Cia Gwee)",
  "2026-02-18": "Cuti Bersama Imlek",

  "2026-03-19": "Hari Raya Nyepi",
  "2026-03-20": "Cuti Bersama Nyepi",

  "2026-04-03": "Wafat Isa Almasih",
  "2026-04-05": "Paskah",

  "2026-05-01": "Hari Buruh",
  "2026-05-14": "Kenaikan Isa Almasih",
  "2026-05-28": "Hari Raya Waisak",
  "2026-05-29": "Cuti Bersama Waisak",

  "2026-06-01": "Hari Lahir Pancasila",
  "2026-06-17": "Idul Adha",
  "2026-06-18": "Cuti Bersama Idul Adha",

  "2026-07-07": "Tahun Baru Islam (1 Muharram)",

  "2026-08-17": "Hari Kemerdekaan RI",

  "2026-09-24": "Maulid Nabi Muhammad SAW",

  "2026-12-25": "Hari Raya Natal"
};

// ==========================
// Helper
// ==========================
function pad2(n){ return String(n).padStart(2,"0"); }
function keyYMD(date){
  return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`;
}
function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }

// ==========================
// UI
// ==========================
const monthSelect = document.getElementById("monthSelect");
const yearSelect  = document.getElementById("yearSelect");
const daysGrid    = document.getElementById("daysGrid");
const detail      = document.getElementById("detail");
const dowHead     = document.getElementById("dowHead");
const searchDate  = document.getElementById("searchDate");
const goBtn       = document.getElementById("goBtn");

let viewDate = new Date();
let selectedDate = new Date();

function initSelectors(){
  dowHead.innerHTML = "";
  for(const name of dino){
    const el = document.createElement("div");
    el.textContent = name.slice(0,3).toUpperCase();
    dowHead.appendChild(el);
  }

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
    blank.className = "day mutedCell";
    daysGrid.appendChild(blank);
  }

  const today = new Date();
  const todayKey = keyYMD(today);

  for(let d=1; d<=total; d++){
    const date = new Date(y,m,d);
    const weton = getWeton(date);
    const k = keyYMD(date);
    const holidayName = nationalHolidays2026[k];
    const isSunday = date.getDay() === 0;
    const isHoliday = !!holidayName || isSunday;

    const cell = document.createElement("div");
    cell.className = "day";

    if(isHoliday) cell.classList.add("holiday");
    if(k === todayKey) cell.classList.add("today");

    const badge = holidayName
      ? `<span class="badge badgeHoliday">LIBUR</span>`
      : (isSunday ? `<span class="badge badgeHoliday">MINGGU</span>` : "");

    cell.innerHTML = `
      ${badge}
      <div class="num">${d}</div>
      <div class="mini">${weton}</div>
      ${holidayName ? `<div class="mini">🎌 ${holidayName}</div>` : ""}
    `;

    cell.onclick = ()=>{
      selectedDate = date;
      showDetail(date);
    };

    daysGrid.appendChild(cell);
  }
}

function showDetail(date){
  const k = keyYMD(date);
  const holidayName = nationalHolidays2026[k];
  const hijri = getHijri(date);
  const weton = getWeton(date);

  const chinaDate = getChineseDateCustom(date);
  const shioElem = getShioElementByDate(date);

  detail.innerHTML = `
    <b>${dino[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}</b>
    <div class="hr"></div>

    🧿 Jawa (Weton): <b>${weton}</b><br>
    🌙 Hijriah: <b>${hijri}</b><br>
    🧧 Tanggal Cina: <b>${chinaDate.label}</b><br>
    🐲 Shio Tahun: <b>${shioElem.shio}</b> | 🔥 Elemen: <b>${shioElem.elemen}</b><br>

    <div class="hr"></div>
    🎌 Libur: <b>${holidayName ? holidayName : (date.getDay()===0 ? "Minggu" : "Tidak ada")}</b>
    <div class="hr"></div>
    <div class="hint">Tip: edit libur cukup di object <b>nationalHolidays2026</b> 👍</div>
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
showDetail(new Date());