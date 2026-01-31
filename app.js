// ======================
// PWA Register SW
// ======================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}

// ======================
// DOM
// ======================
const monthSelect = document.getElementById("monthSelect");
const yearSelect  = document.getElementById("yearSelect");
const daysGrid    = document.getElementById("daysGrid");
const detail      = document.getElementById("detail");
const statusText  = document.getElementById("statusText");

const prevBtn     = document.getElementById("prevBtn");
const nextBtn     = document.getElementById("nextBtn");
const todayBtn    = document.getElementById("todayBtn");

const installBtn  = document.getElementById("installBtn");
const datePicker  = document.getElementById("datePicker");
const goDateBtn   = document.getElementById("goDateBtn");

// ======================
// DATA
// ======================
const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const dino = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const pasaran = ["Legi","Pahing","Pon","Wage","Kliwon"];

// 🔥 ANCHOR PERMANEN (FIX):
// 2026-01-30 = Jumat Pahing
const PASARAN_ANCHOR_DATE = new Date(2026, 0, 30); // local time
PASARAN_ANCHOR_DATE.setHours(0,0,0,0);
const PASARAN_ANCHOR_INDEX = 1; // Pahing

// Shio & Elemen
const shio = ["Tikus","Kerbau","Macan","Kelinci","Naga","Ular","Kuda","Kambing","Monyet","Ayam","Anjing","Babi"];
const elements = ["Kayu Yang","Kayu Yin","Api Yang","Api Yin","Tanah Yang","Tanah Yin","Logam Yang","Logam Yin","Air Yang","Air Yin"];

// Libur Nasional 2026 (sesuai data yang lo kasih)
const holidaysByYear = {
  "2026": {
    "01-01": "Tahun Baru Masehi",
    "01-16": "Isra Mikraj Nabi Muhammad SAW",
    "02-16": "Cuti Bersama Tahun Baru Imlek",
    "02-17": "Tahun Baru Imlek 2577 Kongzili",
    "03-18": "Cuti Bersama Hari Raya Nyepi",
    "03-19": "Hari Raya Nyepi (Tahun Baru Saka 1948)",
    "03-20": "Idul Fitri 1447 H",
    "03-21": "Idul Fitri 1447 H",
    "03-23": "Cuti Bersama Idul Fitri",
    "03-24": "Cuti Bersama Idul Fitri",
    "04-03": "Wafat Isa Almasih",
    "05-01": "Hari Buruh Internasional",
    "05-14": "Kenaikan Isa Almasih",
    "05-15": "Cuti Bersama Kenaikan Isa Almasih",
    "05-27": "Idul Adha 1447 H",
    "05-28": "Cuti Bersama Idul Adha",
    "05-31": "Hari Raya Waisak 2570 BE",
    "06-01": "Hari Lahir Pancasila",
    "06-16": "Tahun Baru Islam (1 Muharram 1448 H)",
    "08-17": "Hari Kemerdekaan RI",
    "08-25": "Maulid Nabi Muhammad SAW",
    "12-24": "Cuti Bersama Natal",
    "12-25": "Hari Raya Natal"
  }
};

// ======================
// STATE
// ======================
let viewDate = new Date(); // month view
let selectedDate = new Date();
selectedDate.setHours(0,0,0,0);

// ======================
// UTILS
// ======================
function pad2(n){ return String(n).padStart(2,"0"); }
function isoKey(date){ return `${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`; }
function daysInMonth(y,m){ return new Date(y, m+1, 0).getDate(); }

function isSameDay(a,b){
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

function toDateInputValue(date){
  const y = date.getFullYear();
  const m = pad2(date.getMonth()+1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

// ======================
// PASARAN (PERMANEN)
// ======================
function getPasaran(date){
  const d = new Date(date);
  d.setHours(0,0,0,0);

  const diffDays = Math.round((d - PASARAN_ANCHOR_DATE) / (24*60*60*1000));
  const idx = (PASARAN_ANCHOR_INDEX + (diffDays % 5) + 5) % 5;

  return pasaran[idx];
}
function getWeton(date){
  return `${dino[date.getDay()]} ${getPasaran(date)}`;
}

// ======================
// HIJRI (FORMAT H, bukan SM)
// ======================
function getHijri(date){
  try{
    const fmt = new Intl.DateTimeFormat("id-ID-u-ca-islamic",{
      day:"numeric", month:"long", year:"numeric"
    }).format(date);

    // beberapa device suka nulis "1447 SM" -> kita ubah jadi "1447 H"
    return fmt.replace(/\bSM\b/g, "H");
  }catch(e){
    return "Hijriah tidak tersedia";
  }
}

// ======================
// CHINESE YEAR (Shio + Elemen) based on Imlek
// ======================
function getCNYDate(year){
  // tabel Imlek untuk akurasi
  const known = {
    2024: "2024-02-10",
    2025: "2025-01-29",
    2026: "2026-02-17",
    2027: "2027-02-06",
    2028: "2028-01-26",
    2029: "2029-02-13",
    2030: "2030-02-03"
  };
  if (known[year]){
    return new Date(known[year] + "T00:00:00");
  }
  // fallback aman
  return new Date(year, 1, 4);
}

function getChineseYearInfo(date){
  const d = new Date(date);
  d.setHours(0,0,0,0);

  const y = d.getFullYear();
  let cny = getCNYDate(y);
  cny.setHours(0,0,0,0);

  const zodiacYear = (d < cny) ? (y - 1) : y;

  // 2020 = Tikus
  const shioIndex = (zodiacYear - 2020) % 12;
  const shioName = shio[(shioIndex + 12) % 12];

  // 2020 = Logam Yang (index 6)
  const elemIndex = (6 + (zodiacYear - 2020)) % 10;
  const elemName = elements[(elemIndex + 10) % 10];

  return { shio: shioName, elemen: elemName, tahun: zodiacYear };
}

// ======================
// CHINESE DATE (harian, simple & stabil)
// Imlek = 1 Cia Gwee
// ======================
function getChineseDateText(date){
  const d = new Date(date);
  d.setHours(0,0,0,0);

  let y = d.getFullYear();
  let cny = getCNYDate(y);
  cny.setHours(0,0,0,0);

  if (d < cny){
    y = y - 1;
    cny = getCNYDate(y);
    cny.setHours(0,0,0,0);
  }

  const diffDays = Math.floor((d - cny) / (24*60*60*1000)); // hari sejak Imlek
  const lunarDay = (diffDays % 30) + 1;                     // 1..30
  const lunarMonth = Math.floor(diffDays / 30) + 1;         // 1.. (estimasi)

  const monthNamesCina = [
    "Cia Gwee","Gee Gwee","Sam Gwee","Si Gwee","Go Gwee","Lak Gwee",
    "Cit Gwee","Pat Gwee","Kao Gwee","Cap Gwee","Cap It Gwee","Cap Ji Gwee"
  ];

  const monthName = monthNamesCina[(lunarMonth - 1) % 12];
  return `${lunarDay} ${monthName}`;
}

// ======================
// HOLIDAY
// ======================
function getHoliday(date){
  const key = isoKey(date);
  const year = String(date.getFullYear());
  return (holidaysByYear[year] && holidaysByYear[year][key]) ? holidaysByYear[year][key] : null;
}

// ======================
// UI
// ======================
function initSelectors(){
  monthNames.forEach((m,i)=>{
    const opt=document.createElement("option");
    opt.value=i; opt.textContent=m;
    monthSelect.appendChild(opt);
  });

  const thisYear = new Date().getFullYear();
  for(let y=thisYear-50;y<=thisYear+50;y++){
    const opt=document.createElement("option");
    opt.value=y; opt.textContent=y;
    yearSelect.appendChild(opt);
  }
}

function render(){
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  monthSelect.value = m;
  yearSelect.value = y;

  daysGrid.innerHTML = "";

  const first = new Date(y,m,1);
  const startDow = first.getDay();
  const total = daysInMonth(y,m);

  const today = new Date();
  today.setHours(0,0,0,0);

  // blank sebelum tanggal 1
  for(let i=0;i<startDow;i++){
    const blank=document.createElement("div");
    blank.className="day muted";
    daysGrid.appendChild(blank);
  }

  for(let d=1; d<=total; d++){
    const date = new Date(y,m,d);
    date.setHours(0,0,0,0);

    const cell = document.createElement("div");
    cell.className = "day";

    const weton = getWeton(date);
    const holiday = getHoliday(date);

    // Minggu merah
    if (date.getDay() === 0){
      cell.classList.add("sundayCell");
    }

    // Libur merah
    if (holiday){
      cell.classList.add("holidayCell");
    }

    // selected highlight
    if (isSameDay(date, selectedDate)){
      cell.classList.add("selectedCell");
    }

    const isToday = isSameDay(date, today);

    cell.innerHTML = `
      <div class="num">
        <span>${d}</span>
        ${isToday ? `<span class="badgeToday">Hari ini</span>` : ""}
      </div>
      <div class="mini">${weton}</div>
      ${holiday ? `<div class="mini">🎌 ${holiday}</div>` : ""}
    `;

    cell.onclick = ()=>{
      selectedDate = new Date(date);
      showDetail(date);
      render(); // refresh highlight selected
    };

    daysGrid.appendChild(cell);
  }

  statusText.textContent = `${monthNames[m]} ${y}`;
}

function showDetail(date){
  const chinaYear = getChineseYearInfo(date);
  const holiday = getHoliday(date);

  detail.innerHTML = `
    <b>${dino[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}</b><br><br>
    🌙 Hijriah: <b>${getHijri(date)}</b><br>
    🧿 Jawa (Weton): <b>${getWeton(date)}</b><br>
    🧧 Tanggal Cina: <b>${getChineseDateText(date)}</b><br>
    🐲 Shio: <b>${chinaYear.shio}</b> | 🌿 Elemen: <b>${chinaYear.elemen}</b><br>
    🎌 Libur: <b>${holiday ? holiday : "Tidak ada"}</b>
  `;
}

// ======================
// EVENTS
// ======================
prevBtn.onclick = ()=>{
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1);
  render();
};

nextBtn.onclick = ()=>{
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1);
  render();
};

todayBtn.onclick = ()=>{
  const now = new Date();
  now.setHours(0,0,0,0);
  viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
  selectedDate = new Date(now);
  render();
  showDetail(now);
  datePicker.value = toDateInputValue(now);
};

monthSelect.onchange = ()=>{
  viewDate = new Date(parseInt(yearSelect.value), parseInt(monthSelect.value), 1);
  render();
};

yearSelect.onchange = ()=>{
  viewDate = new Date(parseInt(yearSelect.value), parseInt(monthSelect.value), 1);
  render();
};

goDateBtn.onclick = ()=>{
  if (!datePicker.value) return;

  const [yy, mm, dd] = datePicker.value.split("-").map(x=>parseInt(x,10));
  const target = new Date(yy, mm-1, dd);
  target.setHours(0,0,0,0);

  viewDate = new Date(target.getFullYear(), target.getMonth(), 1);
  selectedDate = new Date(target);

  render();
  showDetail(target);
};

// Auto buka detail Hari Ini saat app dibuka
(function boot(){
  initSelectors();

  const now = new Date();
  now.setHours(0,0,0,0);
  viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
  selectedDate = new Date(now);

  render();
  showDetail(now);
  datePicker.value = toDateInputValue(now);
})();

// ======================
// INSTALL PROMPT
// ======================
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "inline-block";

  installBtn.onclick = async ()=>{
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = "none";
  };
});