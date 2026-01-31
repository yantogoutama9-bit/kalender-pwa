// ================== Konfigurasi ==================
const monthNames=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const dino=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const pasaran=["Legi","Pahing","Pon","Wage","Kliwon"];

// 🔥 Base pasaran permanen: 31 Jan 2026 = Jumat Pahing
const baseDate=new Date(2026,0,31); // 0=Januari
const basePasaranIndex=1; // 0=Legi, 1=Pahing

const shio=["Tikus","Kerbau","Macan","Kelinci","Naga","Ular","Kuda","Kambing","Monyet","Ayam","Anjing","Babi"];
const elements=["Kayu Yang","Kayu Yin","Api Yang","Api Yin","Tanah Yang","Tanah Yin","Logam Yang","Logam Yin","Air Yang","Air Yin"];

// ================== Hari Libur Nasional 2026 ==================
const holidays={
  "01-01":"Tahun Baru Masehi",
  "02-17":"Tahun Baru Imlek",
  "03-01":"Hari Raya Nyepi",
  "03-29":"Wafat Isa Almasih",
  "05-01":"Hari Buruh Internasional",
  "05-02":"Kenaikan Yesus Kristus",
  "05-16":"Idul Fitri",
  "05-17":"Idul Fitri",
  "06-01":"Hari Lahir Pancasila",
  "07-19":"Idul Adha",
  "08-17":"Hari Kemerdekaan RI",
  "10-24":"Maulid Nabi Muhammad",
  "12-25":"Hari Raya Natal"
};

// ================== Referensi Penanggalan Cina 2026 ==================
// 31 Jan 2026 = 14 Cap Ji Gwee
const chineseMonths=["Cia Gwee","Ji Gwee","Sa Gwee","Si Gwee","Go Gwee","Lak Gwee","Cit Gwee","Pe Gwee","Kauw Gwee","Cap Gwee","Cap It Gwee","Cap Ji Gwee","Lun Gwee"];
const chineseMonthDays=[30,29,30,30,29,30,29,30,30,29,29,30,30]; // Lun Gwee 30
const chineseBaseDate=new Date(2026,0,31); // 31 Jan 2026 = 14 Cap Ji Gwee
const chineseBaseDay=14; 
const chineseBaseMonth=11; // index Cap Ji Gwee =11

// ================== Elements HTML ==================
const monthSelect=document.getElementById("monthSelect");
const yearSelect=document.getElementById("yearSelect");
const daysGrid=document.getElementById("daysGrid");
const detail=document.getElementById("detail");
const searchInput=document.getElementById("searchDate");
const searchBtn=document.getElementById("searchBtn");

// ================== Helper ==================
function pad2(n){return String(n).padStart(2,"0");}
function isoKey(date){return `${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`;}
function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}

// ================== Pasaran Jawa ==================
function getPasaran(date){
  const d=new Date(date); d.setHours(0,0,0,0);
  const diffDays=Math.round((d-baseDate)/(24*60*60*1000));
  const idx=(basePasaranIndex+diffDays%5+5)%5;
  return pasaran[idx];
}
function getWeton(date){return `${dino[date.getDay()]} ${getPasaran(date)}`;}

// ================== Hijriah ==================
function getHijri(date){
  try{
    return new Intl.DateTimeFormat("id-ID-u-ca-islamic",{day:"numeric",month:"long",year:"numeric"}).format(date);
  }catch(e){return "Hijriah tidak tersedia";}
}

// ================== Penanggalan Cina ==================
function getChinese(date){
  const diff=Math.round((date-chineseBaseDate)/(24*60*60*1000));
  let dayOffset=chineseBaseDay-1+diff; 
  let monthIndex=chineseBaseMonth;
  let day=0;
  while(dayOffset>=chineseMonthDays[monthIndex]){
    dayOffset-=chineseMonthDays[monthIndex];
    monthIndex=(monthIndex+1)%chineseMonths.length;
  }
  day=dayOffset+1;
  return {month:chineseMonths[monthIndex],day};
}

// ================== Shio ==================
function getShio(date){
  const imlek=new Date(2026,1,17); // 17 Feb 2026 = Tahun Kuda Api
  if(date<imlek){
    return {shio:"Ular",elemen:"Kayu"};
  }else{
    return {shio:"Kuda",elemen:"Api"};
  }
}

// ================== Inisialisasi Selector ==================
function initSelectors(){
  monthNames.forEach((m,i)=>{let o=document.createElement("option");o.value=i;o.textContent=m;monthSelect.appendChild(o);});
  for(let y=2026;y<=2026;y++){let o=document.createElement("option");o.value=y;o.textContent=y;yearSelect.appendChild(o);}
}

// ================== Render ==================
let viewDate=new Date(2026,0,31);
let selectedDate=new Date(viewDate);

function render(){
  const y=viewDate.getFullYear();
  const m=viewDate.getMonth();
  monthSelect.value=m;
  yearSelect.value=y;
  daysGrid.innerHTML="";

  const first=new Date(y,m,1);
  const startDow=first.getDay();
  const total=daysInMonth(y,m);

  for(let i=0;i<startDow;i++){
    let b=document.createElement("div");
    b.className="day muted"; daysGrid.appendChild(b);
  }

  for(let d=1;d<=total;d++){
    let date=new Date(y,m,d);
    let cell=document.createElement("div");
    cell.className="day";
    const key=isoKey(date);
    if(holidays[key]||date.getDay()===0){cell.classList.add("libur");}

    const weton=getWeton(date);
    const holiday=holidays[key];
    const chinese=getChinese(date);
    const shioInfo=getShio(date);

    cell.innerHTML=`
      <div class="num">${d}</div>
      <div class="mini">${weton}</div>
      <div class="mini">${chinese.day} ${chinese.month}</div>
      ${holiday?`<div class="mini">🎌 ${holiday}</div>`:""}
    `;
    cell.onclick=()=>{selectedDate=date;showDetail(date);};
    daysGrid.appendChild(cell);
  }
}

function showDetail(date){
  const weton=getWeton(date);
  const hijri=getHijri(date);
  const key=isoKey(date);
  const holiday=holidays[key];
  const chinese=getChinese(date);
  const shioInfo=getShio(date);

  detail.innerHTML=`
  <b>${dino[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}</b><br><br>
  🌙 Hijriah: <b>${hijri}</b><br>
  🧿 Jawa: <b>${weton}</b><br>
  🧧 Shio: <b>${shioInfo.shio}</b> | 🌿 Elemen: <b>${shioInfo.elemen}</b><br>
  🏮 Cina: <b>${chinese.day} ${chinese.month}</b><br>
  🎌 Libur: <b>${holiday?holiday:"Tidak ada"}</b>
  `;
}

// ================== Button Events ==================
document.getElementById("prevBtn").onclick=()=>{viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1);render();};
document.getElementById("nextBtn").onclick=()=>{viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1);render();};
document.getElementById("todayBtn").onclick=()=>{
  const now=new Date(2026,0,31);
  viewDate=new Date(now.getFullYear(),now.getMonth(),1);
  render(); showDetail(now);
};
searchBtn.onclick=()=>{
  const s=searchInput.value;
  if(!s)return;
  const d=new Date(s);
  viewDate=new Date(d.getFullYear(),d.getMonth(),1);
  render(); showDetail(d);
};

// ================== Init ==================
initSelectors();
render();
showDetail(viewDate);
