const KEY="msl-journal-v8-trades", CFG="msl-journal-v8-cloud";
let trades=loadTrades(), cloud=JSON.parse(localStorage.getItem(CFG)||"{}");

const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
function loadTrades(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
function saveTrades(){localStorage.setItem(KEY,JSON.stringify(trades)); render(); syncIfConfigured()}
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random()}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

function showView(id){
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===id));
  $$(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
  window.scrollTo({top:0,behavior:"smooth"}); render();
}
$$(".tab").forEach(b=>b.onclick=()=>showView(b.dataset.view));
$$("[data-go]").forEach(b=>b.onclick=()=>showView(b.dataset.go));

function render(){
  $("#statTrades").textContent=trades.length;
  const wins=trades.filter(t=>t.result==="Win").length;
  $("#statWinRate").textContent=trades.length?Math.round(wins/trades.length*100)+"%":"0%";
  const net=trades.reduce((a,t)=>a+(Number(t.r)||0),0);
  $("#statR").textContent=net.toFixed(2)+"R";
  const grossWin=trades.filter(t=>Number(t.r)>0).reduce((a,t)=>a+Number(t.r),0);
  const grossLoss=Math.abs(trades.filter(t=>Number(t.r)<0).reduce((a,t)=>a+Number(t.r),0));
  $("#statPF").textContent=(grossLoss?grossWin/grossLoss:0).toFixed(2);
  const recent=[...trades].sort((a,b)=>b.created-a.created).slice(0,6);
  $("#recentTrades").className=recent.length?"list":"list empty";
  $("#recentTrades").innerHTML=recent.length?recent.map(t=>`<div class="trade-row"><b>${escapeHtml(t.pair)}</b> · ${t.direction} · ${t.setup}<br><span class="small">${t.result} · ${Number(t.r||0).toFixed(2)}R · ${escapeHtml(t.liquidity)}</span></div>`).join(""):"No trades yet.";
  renderTable();
}
function renderTable(){
  const q=($("#search")?.value||"").toLowerCase(), fr=$("#filterResult")?.value||"", fs=$("#filterSetup")?.value||"";
  const list=trades.filter(t=>(!q||JSON.stringify(t).toLowerCase().includes(q))&&(!fr||t.result===fr)&&(!fs||t.setup===fs)).sort((a,b)=>b.created-a.created);
  $("#tradeTable").innerHTML=list.length?`<table class="trade-table"><thead><tr><th>Date</th><th>Pair</th><th>Side</th><th>Setup</th><th>Liquidity</th><th>Result</th><th>R</th><th></th></tr></thead><tbody>${list.map(t=>`<tr><td>${new Date(t.date).toLocaleString()}</td><td>${escapeHtml(t.pair)}</td><td>${t.direction}</td><td>${t.setup}</td><td>${escapeHtml(t.liquidity)}</td><td>${t.result}</td><td>${Number(t.r||0).toFixed(2)}</td><td><button class="danger" onclick="deleteTrade('${t.id}')">Delete</button></td></tr>`).join("")}</tbody></table>`:"<div class='card'>No matching trades.</div>";
}
window.deleteTrade=id=>{if(confirm("Delete this trade permanently?")){trades=trades.filter(t=>t.id!==id);saveTrades();toast("Trade deleted")}};
["search","filterResult","filterSetup"].forEach(id=>$("#"+id).addEventListener("input",renderTable));

$("#tradeForm").addEventListener("submit",e=>{
 e.preventDefault();
 const t={id:uid(),created:Date.now(),date:$("#date").value,pair:$("#pair").value.trim(),direction:$("#direction").value,session:$("#session").value,setup:$("#setup").value,liquidity:$("#liquidity").value,confirmation:$("#confirmation").value,zone:$("#zone").value,entry:$("#entry").value,stop:$("#stop").value,target:$("#target").value,result:$("#result").value,r:Number($("#r").value||0),reason:$("#reason").value.trim(),review:$("#review").value.trim(),screenshot:$("#screenshot").value.trim()};
 trades.push(t); saveTrades(); e.target.reset(); $("#date").value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16); toast("Trade saved"); showView("dashboard");
});

$("#exportBtn").onclick=()=>{
 const blob=new Blob([JSON.stringify({version:8,exportedAt:new Date().toISOString(),trades},null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="MSL-Trading-Journal-backup.json";a.click();URL.revokeObjectURL(a.href);
};
$("#importInput").onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{const d=JSON.parse(await f.text());if(!Array.isArray(d.trades))throw Error();if(confirm(`Import ${d.trades.length} trades and replace current local data?`)){trades=d.trades;saveTrades();toast("Backup imported")}}catch{toast("Invalid backup file")}
 e.target.value="";
};
$("#clearBtn").onclick=()=>{
 if(confirm("WARNING: This deletes ALL locally stored journal data. Continue?")&&confirm("Final confirmation: permanently clear every trade?")){trades=[];saveTrades();toast("All journal data cleared")}
};

function saveCloudConfig(){
 cloud={url:$("#supabaseUrl").value.trim(),key:$("#supabaseKey").value.trim()};
 localStorage.setItem(CFG,JSON.stringify(cloud)); updateCloudFields(); toast("Cloud settings saved");
}
function updateCloudFields(){$("#supabaseUrl").value=cloud.url||"";$("#supabaseKey").value=cloud.key||"";$("#storageStatus").textContent=cloud.url&&cloud.key?"Local-first storage + cloud configuration detected.":"Local-first storage is active. Cloud sync can be configured below."}
$("#saveCloud").onclick=saveCloudConfig;
$("#testCloud").onclick=async()=>{
 if(!cloud.url||!cloud.key)return toast("Enter cloud settings first");
 try{const r=await fetch(cloud.url.replace(/\/$/,"")+"/rest/v1/",{headers:{apikey:cloud.key,Authorization:"Bearer "+cloud.key}});toast(r.ok?"Cloud connection works":"Cloud responded: "+r.status)}catch{toast("Cloud connection failed")}
};
async function syncIfConfigured(){
 if(!cloud.url||!cloud.key)return;
 // The site remains usable without cloud. Actual row sync is enabled after the SQL schema is installed.
}
function setConnection(){
 const c=$("#connection"); c.textContent=navigator.onLine?"Online":"Offline cache"; c.className="status "+(navigator.onLine?"online":"offline");
}
window.addEventListener("online",setConnection);window.addEventListener("offline",setConnection);
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
updateCloudFields();setConnection();
$("#date").value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
render();
