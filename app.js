console.log("APP.JS VERSION: 2026-final-1");

// ===============================
// PWA Register
// ===============================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}

// ===============================
// Data Dasar
// ===============================
const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const dino = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const pasaran = ["Legi","Pahing","Pon","Wage","Kliwon"];

// ===============================
// 🔥 FIX PASARAN PERMANEN
// Patokan user: 2026-01-30 = Jumat Pahing
// ===============================
const pasaranAnchorDate = new Date("2026-01-30T00:00:00");
const pasaranAnchorIndex = 1; // Pahing

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
// Hijriah (JANGAN DIUBAH-UBAH)
// Pakai sistem browser langsung
// ===============================
function getHijri(date){
  try{
    let s = new Intl.DateTimeFormat("id-ID-u-ca-islamic",{
      day:"numeric",month:"long",year:"numeric"
    }).format(date);

    // Biar belakangnya H, bukan "SM" atau aneh2
    // beberapa device kadang keluarnya "... 1447 H" sudah oke
    // kalau keluarnya "... 1447 AH" juga oke, kita rapihin dikit
    s = s.replace(/\bAH\b/g, "H");
    s = s.replace(/\bSM\b/g, "H"); // kalau ada bug device
    return s;
  }catch(e){
    return "Hijriah tidak tersedia";
  }
}

// ===============================
// 🔥 Hari Libur Nasional 2026 (CUMA ini)
// Format: "MM-DD": "Nama Libur"
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

function pad2(n){ return String(n).padStart(2,"0"); }
function isoKeyMMDD(date){
  return `${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`;
}
function getHoliday(date){
  const y = date.getFullYear();
  const key = isoKeyMMDD(date);
  if (holidaysByYear[y] && holidaysByYear[y][key]) return holidaysByYear[y][key];
  return null;
}

// ===============================
// 🔥 Penanggalan Cina FIX (Sesuai patokan lo)
// Patokan:
// - 2026-01-31 = 14 Cap Ji Gwee
// - 2026-02-17 = 1 Cia Gwee (Imlek)
// - 2026 bukan kabisat
// ===============================

// Nama bulan Cina (Hokkien Indonesia)
const cinaMonthNames = [
  "Cia Gwee",      // 1
  "Ji Gwee",       // 2
  "Sa Gwee",       // 3
  "Si Gwee",       // 4
  "Go Gwee",       // 5
  "Lak Gwee",      // 6
  "Cit Gwee",      // 7
  "Pe Gwee",       // 8
  "Kauw Gwee",     // 9
  "Cap Gwee",      // 10
  "Cap It Gwee",   // 11
  "Cap Ji Gwee"    // 12
];

// Tahun 2026: kita pakai siklus bulan yang lo kasih (non kabisat)
// Ini versi aman: kita pakai anchor date untuk memastikan 31 Jan = 14 Cap Ji Gwee
// dan 17 Feb = 1 Cia Gwee.
// Artinya: dari 17 Feb, kita jalan maju hitung hari dan bulan pakai panjang bulan.
// Untuk sebelum 17 Feb, kita jalan mundur dari 31 Jan.

const cinaMonthLengths2026 = {
  // 1..12 (tanpa kabisat)
  1: 30,  // Cia Gwee
  2: 29,  // Ji Gwee
  3: 30,  // Sa Gwee
  4: 30,  // Si Gwee
  5: 29,  // Go Gwee
  6: 30,  // Lak Gwee
  7: 29,  // Cit Gwee
  8: 29,  // Pe Gwee (ambil 29 dulu)
  9: 29,  // Kauw Gwee (ambil 29 dulu)
  10: 29, // Cap Gwee
  11: 29, // Cap It Gwee
  12: 30  // Cap Ji Gwee
};

// Anchor 1: Imlek
const cinaAnchorImlek = new Date("2026-02-17T00:00:00"); // 1 Cia Gwee
const cinaAnchorImlekMonth = 1;
const cinaAnchorImlekDay = 1;

// Anchor 2: user "hari ini"
const cinaAnchorToday = new Date("2026-01-31T00:00:00"); // 14 Cap Ji Gwee
const cinaAnchorTodayMonth = 12;
const cinaAnchorTodayDay = 14;

function addDays(date, n){
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  d.setHours(0,0,0,0);
  return d;
}

function diffDays(a,b){
  // b - a
  const A = new Date(a); A.setHours(0,0,0,0);
  const B = new Date(b); B.setHours(0,0,0,0);
  return Math.round((B - A) / (24*60*60*1000));
}

function normalizeCinaMonth(m){
  while(m < 1) m += 12;
  while(m > 12) m -= 12;
  return m;
}

function getCinaDate2026(date){
  const d = new Date(date);
  d.setHours(0,0,0,0);

  // Kalau tahun selain 2026, kita tetap tampilkan "—" biar gak ngaco
  if (d.getFullYear() !== 2026){
    return null;
  }

  // Kita pastikan konsisten dengan dua anchor:
  // - untuk tanggal >= 2026-02-17, hitung maju dari Imlek
  // - untuk tanggal <= 2026-02-16, hitung mundur dari 2026-01-31 anchor
  if (d >= cinaAnchorImlek){
    let month = cinaAnchorImlekMonth;
    let day = cinaAnchorImlekDay;

    let steps = diffDays(cinaAnchorImlek, d); // maju
    while(steps > 0){
      day++;
      const maxDay = cinaMonthLengths2026[month];
      if (day > maxDay){
        day = 1;
        month = normalizeCinaMonth(month + 1);
      }
      steps--;
    }

    return { day, month, monthName: cinaMonthNames[month-1] };
  } else {
    // mundur dari 31 Jan 2026 = 14 Cap Ji Gwee
    let month = cinaAnchorTodayMonth;
    let day = cinaAnchorTodayDay;

    let steps = diffDays(d, cinaAnchorToday); // maju dari d ke anchor => berarti kita mundur steps
    while(steps > 0){
      day--;
      if (day < 1){
        month = normalizeCinaMonth(month - 1);
        day = cinaMonthLengths2026[month];
      }
      steps--;
    }

    return { day, month, monthName: cinaMonthNames[month-1] };
  }
}

// ===============================
// 🔥 Shio + Elemen FIX sesuai patokan user
// - sebelum 17 Feb 2026: Ular Kayu
// - mulai 17 Feb 2026 s/d akhir 2026: Kuda Api
// ===============================
const shioSwitchDate = new Date("2026-02-17T00:00:00");

function getShioElemen(date){
  const d = new Date(date);
  d.setHours(0,0,0,0);

  if (d >= shioSwitchDate){
    return { shio: "Kuda", elemen: "Api" };
  }
  return { shio: "Ular", elemen: "Kayu" };
}

// ===============================
// UI Logic
// ===============================
const monthSelect = document.getElementById("monthSelect");
const yearSelect  = document.getElementById("yearSelect");
const daysGrid    = document.getElementById("daysGrid");
const detail      = document.getElementById("detail");

const datePicker  = document.getElementById("datePicker");
const goDateBtn   = document.getElementById("goDateBtn");

let viewDate = new Date();
let selectedCell = null;

function daysInMonth(y,m){
  return new Date(y,m+1,0).getDate();
}

function initSelectors(){
  monthNames.forEach((m,i)=>{
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = m;
    monthSelect.appendChild(opt);
  });

  // biar gampang: fokus 2026 aja, tapi tetap bisa geser
  for(let y=2025;y<=2027;y++){
    const opt=document.createElement("option");
    opt.value=y; opt.textContent=y;
    yearSelect.appendChild(opt);
  }
}

function clearSelected(){
  if (selectedCell) selectedCell.classList.remove("selected");
  selectedCell = null;
}

function showDetail(date){
  const holiday = getHoliday(date);
  const weton = getWeton(date);
  const hijri = getHijri(date);
  const cina = getCinaDate2026(date);
  const sh = getShioElemen(date);

  const cinaText = cina ? `${cina.day} ${cina.monthName}` : "—";

  detail.innerHTML = `
    <b>${dino[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}</b><br><br>
    🌙 Hijriah: <b>${hijri}</b><br>
    🧿 Jawa (Weton): <b>${weton}</b><br>
    🧧 Cina: <b>${cinaText}</b><br>
    🐲 Shio: <b>${sh.shio}</b> | 🔥 Elemen: <b>${sh.elemen}</b><br>
    🎌 Libur: <b>${holiday ? holiday : "Tidak ada"}</b>
  `;
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

  // blank awal
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

    const holiday = getHoliday(date);
    const isSunday = (date.getDay() === 0);

    if (isSunday) cell.classList.add("isSunday");
    if (holiday) cell.classList.add("isHoliday");

    const weton = getWeton(date);

    cell.innerHTML = `
      <div class="num">
        <span>${d}</span>
        ${holiday ? `<span class="badge">Libur</span>` : (isSunday ? `<span class="badge">Minggu</span>` : "")}
      </div>
      <div class="mini">${weton}</div>
      ${holiday ? `<div class="mini">🎌 ${holiday}</div>` : ""}
    `;

    cell.addEventListener("click", ()=>{
      clearSelected();
      selectedCell = cell;
      cell.classList.add("selected");
      showDetail(date);
    });

    daysGrid.appendChild(cell);
  }
}

// ===============================
// Event Controls
// ===============================
document.getElementById("prevBtn").onclick=()=>{
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1);
  render();
};

document.getElementById("nextBtn").onclick=()=>{
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1);
  render();
};

document.getElementById("todayBtn").onclick=()=>{
  const now = new Date();
  now.setHours(0,0,0,0);
  viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
  render();
  showDetail(now);
};

monthSelect.onchange=()=>{
  viewDate = new Date(parseInt(yearSelect.value), parseInt(monthSelect.value), 1);
  render();
};

yearSelect.onchange=()=>{
  viewDate = new Date(parseInt(yearSelect.value), parseInt(monthSelect.value), 1);
  render();
};

goDateBtn.onclick=()=>{
  if (!datePicker.value) return;
  const chosen = new Date(datePicker.value + "T00:00:00");
  viewDate = new Date(chosen.getFullYear(), chosen.getMonth(), 1);
  render();
  showDetail(chosen);
};

// ===============================
// Init
// ===============================
initSelectors();
render();

// Auto buka detail "Hari Ini" saat app dibuka
const now = new Date();
now.setHours(0,0,0,0);
showDetail(now);

// default datePicker = hari ini
datePicker.value = `${now.getFullYear()}-${pad2(now.getMonth()+1)}-${pad2(now.getDate())}`;
