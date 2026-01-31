// ===============================
// PWA Register (SW)
// ===============================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}

// ===============================
// Data kalender
// ===============================
const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const dino = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const pasaran = ["Legi","Pahing","Pon","Wage","Kliwon"];

// 🔥 Anchor permanen pasaran (JANGAN DIUBAH)
// 2026-01-30 = Jumat Pahing
const pasaranAnchorDate = new Date(2026, 0, 30); // Jan=0
pasaranAnchorDate.setHours(0,0,0,0);
const pasaranAnchorIndex = 1; // Pahing

// Shio + elemen (tetap pakai logika tahun Imlek)
const shio = ["Tikus","Kerbau","Macan","Kelinci","Naga","Ular","Kuda","Kambing","Monyet","Ayam","Anjing","Babi"];
const elements = ["Kayu Yang","Kayu Yin","Api Yang","Api Yin","Tanah Yang","Tanah Yin","Logam Yang","Logam Yin","Air Yang","Air Yin"];

// ===============================
// Libur Nasional 2026 (DATA LO)
// ===============================
const holidaysByYear = {
  2026: {
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

// ===============================
// Helpers
// ===============================
const monthSelect = document.getElementById("monthSelect");
const yearSelect  = document.getElementById("yearSelect");
const daysGrid    = document.getElementById("daysGrid");
const detail      = document.getElementById("detail");

const datePicker  = document.getElementById("datePicker");
const goDateBtn   = document.getElementById("goDateBtn");

const installBtn  = document.getElementById("installBtn");

let viewDate = new Date();
let selectedDate = new Date();

function pad2(n){ return String(n).padStart(2,"0"); }
function isoKey(date){ return `${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`; }
function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }

function isSameDay(a,b){
  const x = new Date(a); x.setHours(0,0,0,0);
  const y = new Date(b); y.setHours(0,0,0,0);
  return x.getTime() === y.getTime();
}

function getHoliday(date){
  const y = date.getFullYear();
  const key = isoKey(date);
  return (holidaysByYear[y] && holidaysByYear[y][key]) ? holidaysByYear[y][key] : null;
}

// ===============================
// Pasaran Jawa (fix permanen)
// ===============================
function getPasaran(date){
  const d = new Date(date);
  d.setHours(0,0,0,0);

  const diffDays = Math.round((d - pasaranAnchorDate) / (24*60*60*1000));
  const idx = (pasaranAnchorIndex + (diffDays % 5) + 5) % 5;

  return pasaran[idx];
}

function getWeton(date){
  return `${dino[date.getDay()]} ${getPasaran(date)}`;
}

// ===============================
// Hijriah (pakai Intl bawaan)
// Fix "SM" jadi "H"
// ===============================
function getHijri(date){
  try{
    let txt = new Intl.DateTimeFormat("id-ID-u-ca-islamic",{
      day:"numeric",month:"long",year:"numeric"
    }).format(date);

    // beberapa device suka munculin "SM"
    txt = txt.replace(/\bSM\b/g, "H");
    return txt;
  }catch(e){
    return "Hijriah tidak tersedia";
  }
}

// ===============================
// Tahun Baru Imlek (CNY date)
// ===============================
function getCNYDate(year){
  // anchor akurat untuk beberapa tahun (bisa ditambah kalau mau)
  const known = {
    2024: "2024-02-10",
    2025: "2025-01-29",
    2026: "2026-02-17",
    2027: "2027-02-06",
    2028: "2028-01-26",
    2029: "2029-02-13",
    2030: "2030-02-03"
  };
  if (known[year]) return new Date(known[year] + "T00:00:00");

  // fallback (kalau tahun di luar list)
  return new Date(year, 1, 4); // 4 Feb
}

function getChineseYearInfo(date){
  const d = new Date(date);
  d.setHours(0,0,0,0);

  const y = d.getFullYear();
  const cny = getCNYDate(y);
  cny.setHours(0,0,0,0);

  const zodiacYear = (d < cny) ? (y - 1) : y;

  // 2020 = Tikus
  const shioIndex = (zodiacYear - 2020) % 12;
  const shioName = shio[(shioIndex + 12) % 12];

  // 2020 = Logam Yang (index 6)
  const elemIndex = (6 + (zodiacYear - 2020)) % 10;
  const elemName = elements[(elemIndex + 10) % 10];

  return {shio: shioName, elemen: elemName};
}

// ===============================
// Penanggalan Cina sederhana (bulan)
// Minimal requirement: saat Imlek = 1 Cia Gwee
// ===============================
function getChineseDateText(date){
  const y = date.getFullYear();
  const cny = getCNYDate(y);
  cny.setHours(0,0,0,0);

  const d = new Date(date);
  d.setHours(0,0,0,0);

  // kalau pas hari Imlek
  if (d.getTime() === cny.getTime()){
    return "1 Cia Gwee";
  }

  // kalau bukan, kita tampilkan info ringkas "Tanggal Cina: (estimasi)"
  // (tanpa algoritma lunar kompleks biar gak ngaco parah)
  return "—";
}

// ===============================
// UI init
// ===============================
function initSelectors(){
  monthNames.forEach((m,i)=>{
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = m;
    monthSelect.appendChild(opt);
  });

  const thisYear = new Date().getFullYear();
  for(let y=thisYear-50; y<=thisYear+50; y++){
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
}

// ===============================
// Render kalender
// ===============================
function render(){
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();

  monthSelect.value = m;
  yearSelect.value = y;

  daysGrid.innerHTML = "";

  const first = new Date(y,m,1);
  const startDow = first.getDay();
  const total = daysInMonth(y,m);

  // blank sebelum tanggal 1
  for(let i=0;i<startDow;i++){
    const blank = document.createElement("div");
    blank.className = "day muted";
    daysGrid.appendChild(blank);
  }

  const today = new Date(); today.setHours(0,0,0,0);

  for(let d=1; d<=total; d++){
    const date = new Date(y,m,d);
    date.setHours(0,0,0,0);

    const cell = document.createElement("div");
    cell.className = "day";

    const weton = getWeton(date);
    const holiday = getHoliday(date);

    // merah untuk minggu / libur
    const isSunday = date.getDay() === 0;
    if (isSunday || holiday) cell.classList.add("red");

    // highlight hari ini
    if (isSameDay(date, today)) cell.classList.add("today");

    cell.innerHTML = `
      <div class="num">${d}</div>
      <div class="mini">${weton}</div>
      ${holiday ? `<div class="mini">🎌 ${holiday}</div>` : ``}
    `;

    cell.onclick = ()=>{
      selectedDate = date;
      showDetail(date);
    };

    daysGrid.appendChild(cell);
  }
}

// ===============================
// Detail panel
// ===============================
function showDetail(date){
  const chinaYear = getChineseYearInfo(date);
  const holiday = getHoliday(date);
  const weton = getWeton(date);

  const cinaTanggal = getChineseDateText(date);

  const isSunday = date.getDay() === 0;

  detail.innerHTML = `
    <b>${dino[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}</b><br><br>

    <span class="badge">🌙 Hijriah: <b>${getHijri(date)}</b></span><br>
    <span class="badge">🧿 Jawa: <b>${weton}</b></span><br>
    <span class="badge">🧧 Shio: <b>${chinaYear.shio}</b></span>
    <span class="badge">🌿 Elemen: <b>${chinaYear.elemen}</b></span><br>
    <span class="badge">🀄 Tgl Cina: <b>${cinaTanggal}</b></span><br>

    ${(holiday || isSunday) ? `<span class="badge red">🎌 Libur: <b>${holiday ? holiday : "Hari Minggu"}</b></span>` : `<span class="badge">🎌 Libur: <b>Tidak ada</b></span>`}
  `;
}

// ===============================
// Event tombol
// ===============================
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
  now.setHours(0,0,0,0);

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

// Cari tanggal
goDateBtn.onclick = ()=>{
  if (!datePicker.value) return;

  const picked = new Date(datePicker.value + "T00:00:00");
  picked.setHours(0,0,0,0);

  viewDate = new Date(picked.getFullYear(), picked.getMonth(), 1);
  render();
  showDetail(picked);
};

// ===============================
// Install PWA button (biar serasa aplikasi)
// ===============================
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e)=>{
  e.preventDefault();
  deferredPrompt = e;

  installBtn.style.display = "block";

  installBtn.onclick = async ()=>{
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = "none";
  };
});

window.addEventListener("appinstalled", ()=>{
  installBtn.style.display = "none";
});

// ===============================
// Start
// ===============================
initSelectors();
render();

// 🔥 Hari ini auto kebuka detail pas app dibuka
const now = new Date();
now.setHours(0,0,0,0);
showDetail(now);