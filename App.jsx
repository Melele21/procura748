import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const _sb = createClient(
  'https://uzemcypozcuygmjgpwol.supabase.co',
  'sb_publishable_Tyqp0uFO_fjlcxtaOfAKRw_bNuPl1LX'
);

async function load(key, fallback) {
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
    const { data } = await _sb.from('kv_store').select('value').eq('key', key).single();
    if (data) { localStorage.setItem(key, data.value); return JSON.parse(data.value); }
    return fallback;
  } catch { return fallback; }
}
async function save(key, val) {
  try {
    const str = JSON.stringify(val);
    localStorage.setItem(key, str);
    await _sb.from('kv_store').upsert({ key, value: str, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  } catch(e) { console.error('Save error:', e); }
}

async function uploadFile(file, folder) {
  try {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await _sb.storage.from('attachments').upload(path, file, { contentType: file.type });
    if (error) throw error;
    const { data: url } = _sb.storage.from('attachments').getPublicUrl(path);
    return { name: file.name, url: url.publicUrl, path, size: file.size, uploadedAt: new Date().toISOString() };
  } catch(e) { console.error('Upload error:', e); return null; }
}

async function deleteFile(path) {
  try { await _sb.storage.from('attachments').remove([path]); } catch(e) { console.error('Delete error:', e); }
}

const B = {
  carbon:"#2D2D2D", carbon2:"#3A3A3A", carbon3:"#4A4A4A",
  gold:"#C9A84C", goldL:"#E2BE72", goldD:"#A8863A",
  goldBg:"rgba(201,168,76,0.10)", goldBd:"rgba(201,168,76,0.28)",
  white:"#FFFFFF", offwhite:"#F7F5F1", gray1:"#E8E4DC", gray2:"#C8C2B4", gray3:"#8A8378", gray4:"#5A5550",
  dark:"#1A1814", dark2:"#222018", dark3:"#2C2A24",
  green:"#5AAD7A", greenBg:"rgba(90,173,122,0.10)", greenBd:"rgba(90,173,122,0.28)",
  blue:"#5B9BD5", orange:"#D4745A", orangeBg:"rgba(212,116,90,0.10)", orangeBd:"rgba(212,116,90,0.28)",
  purple:"#9B7DC8", teal:"#4AADA0",
};

const STAGES = [
  { id:"REQ", label:"Requisition",    color:"#7C72DC", icon:"📋" },
  { id:"RFQ", label:"Quotation",      color:"#5B9BD5", icon:"💬" },
  { id:"CMP", label:"Comparison",     color:B.gold,    icon:"⚖️" },
  { id:"PO",  label:"Purchase Order", color:"#D4745A", icon:"📄" },
  { id:"DEL", label:"Delivery",       color:"#4AADA0", icon:"🚚" },
  { id:"RCV", label:"Receipt",        color:"#9B7DC8", icon:"✅" },
  { id:"PAY", label:"Payment",        color:"#5AAD7A", icon:"💳" },
];

const NAV = [
  { id:"dashboard", label:"Dashboard",      icon:"◈" },
  { id:"REQ",       label:"Requisitions",   icon:"📋" },
  { id:"RFQ",       label:"Quotations",     icon:"💬" },
  { id:"CMP",       label:"Comparison",     icon:"⚖️" },
  { id:"PO",        label:"Purchase Orders",icon:"📄" },
  { id:"DEL",       label:"Delivery",       icon:"🚚" },
  { id:"RCV",       label:"Receipt",        icon:"✅" },
  { id:"PAY",       label:"Payment",        icon:"💳" },
  { id:"tracker",   label:"Tracker",        icon:"🔍" },
  { id:"vendors",   label:"Vendors",        icon:"🏢" },
];

const PRIORITY = {
  urgent:  { label:"Urgent",  color:"#D4745A", bg:"rgba(212,116,90,0.12)", dot:"🔴" },
  normal:  { label:"Normal",  color:B.gold,    bg:B.goldBg,                dot:"🟡" },
  planned: { label:"Planned", color:"#5AAD7A", bg:"rgba(90,173,122,0.12)", dot:"🟢" },
};

const UNITS = ["EA","LS","HR","SF","LF","CY","CF","SY","TON","LB","GAL","BBL","FT","IN","PC","SET","BOX","PLT","ROLL","BAG"];
const PAYMENT_OPTIONS = ["Net 60","Net 45","Net 30","Net 15","COD","Prepaid"];
const PAYMENT_SCORE   = { "Net 60":100,"Net 45":85,"Net 30":70,"Net 15":55,"COD":20,"Prepaid":0 };
const CHECKLIST_ITEMS = [
  { id:"qty",     label:"Quantity received matches PO" },
  { id:"desc",    label:"Item description / spec correct" },
  { id:"quality", label:"Physical condition acceptable (no damage)" },
  { id:"docs",    label:"Vendor delivery receipt present" },
  { id:"pack",    label:"Packaging and labeling in good condition" },
];
const PAY_METHODS = ["Wire Transfer","Check","Cash","Direct Debit","Other"];
const DELIVERY_LOCS = ["Warehouse","Jobsite","Office","Other"];
const COST_CODES = [
  "01 45 00 — Quality Control","01 54 00 — Construction Aids","01 74 00 — Cleaning",
  "02 40 00 — Demolition","03 00 00 — Concrete","03 30 00 — Cast-in-Place Concrete",
  "04 00 00 — Masonry","05 00 00 — Metals","05 12 00 — Structural Steel Framing",
  "06 00 00 — Wood & Plastics","07 00 00 — Thermal Protection","08 00 00 — Openings",
  "08 10 00 — Doors & Frames","08 55 00 — Windows","09 00 00 — Finishes",
  "09 20 00 — Gypsum Board","09 60 00 — Flooring","21 13 00 — Fire Suppression",
  "22 10 00 — Plumbing","23 00 00 — HVAC","26 00 00 — Electrical",
  "31 00 00 — Earthwork","31 23 00 — Excavation","33 00 00 — Utilities","34 00 00 — Transportation",
];
const VENDOR_CATS = ["General Materials","Equipment Rental","Concrete","Structural Steel","Electrical","Plumbing","HVAC","Finishes","Flooring","Windows & Glazing","Formwork","Drywall","Transportation","Landscaping","Security Systems","Other"];
const DEMO_PROJECTS = [
  { id:"P001", code:"3320", name:"3320 NW 5th Ave - SHELL" },
  { id:"P002", code:"5-27", name:"5-27 SW South River Drive" },
  { id:"P003", code:"1158", name:"1158 NW 6TH STREET" },
  { id:"P004", code:"3513", name:"3513 NW 5th Ave CM" },
  { id:"P005", code:"3505", name:"3505 NW 5th Ave CM" },
  { id:"P006", code:"636",  name:"636 SW 14 AV" },
  { id:"P007", code:"826",  name:"826 SW 12 Court" },
  { id:"P008", code:"530",  name:"530 SW 11th Ave" },
  { id:"P009", code:"321",  name:"321 NW 4TH AVE" },
];

const DEMO_SUPPLIERS = [
  { id:"S001", name:"White Cap",                    contact:"Daniel Regalado",    email:"Daniel.Regalado@whitecap.com",           phone:"786-914-0066", category:"Formwork",          rating:4.0, active:true },
  { id:"S002", name:"United Rental",                contact:"Ike Washington",     email:"iwashingto@ur.com",                      phone:"786-860-7568", category:"Equipment Rental",   rating:4.0, active:true },
  { id:"S003", name:"Herc Rental",                  contact:"Luis Jeannot",       email:"luis.jeannot@hercrentals.com",           phone:"786-570-9147", category:"Equipment Rental",   rating:4.0, active:true },
  { id:"S004", name:"Sunbelt",                      contact:"John Davis",         email:"",                                       phone:"305-796-3469", category:"Equipment Rental",   rating:4.0, active:true },
  { id:"S005", name:"Mighty Trucking",              contact:"",                   email:"",                                       phone:"786-251-0032", category:"Transportation",     rating:4.0, active:true },
  { id:"S006", name:"PMS CMU Install",              contact:"Luis Sevilla",       email:"lsevilla311@gmail.com",                  phone:"305-725-4280", category:"General Materials",  rating:4.0, active:true },
  { id:"S007", name:"Cemex",                        contact:"Valentina Gonzalez", email:"valentina.gonzalezv@cemex.com",          phone:"832-472-2704", category:"Concrete",           rating:4.5, active:true },
  { id:"S008", name:"Polimix",                      contact:"Alberto Santana",    email:"alberto@polimix.us",                     phone:"786-458-7893", category:"Concrete",           rating:4.5, active:true },
  { id:"S009", name:"Hilti",                        contact:"Richard Toquice",    email:"",                                       phone:"954-350-2065", category:"Equipment Rental",   rating:4.5, active:true },
  { id:"S010", name:"Stucco & Painting Solution",   contact:"Edgar Villanueva",   email:"",                                       phone:"786-251-2422", category:"Finishes",           rating:4.0, active:true },
  { id:"S011", name:"Potros Trucking",              contact:"Jose Lopez",         email:"",                                       phone:"786-412-0296", category:"Transportation",     rating:4.0, active:true },
  { id:"S012", name:"Alsina Forms",                 contact:"Marcos Mirabal",     email:"marcos.mirabal@alsina.com",              phone:"305-924-4710", category:"Formwork",           rating:4.5, active:true },
  { id:"S013", name:"City Electric Supply",         contact:"Lazaro",             email:"",                                       phone:"786-969-5315", category:"Electrical",         rating:4.0, active:true },
  { id:"S014", name:"Kavana Tile/Bath/Kitchen",     contact:"Orlando Rodriguez",  email:"orodriguez@kavanafloorandbath.com",       phone:"786-281-2760", category:"Flooring",           rating:4.0, active:true },
  { id:"S015", name:"Lobo Services LLC",            contact:"Carlos Lobo",        email:"LoboServicesLLC@outlook.com",            phone:"786-468-1259", category:"Landscaping",        rating:4.0, active:true },
  { id:"S016", name:"Floor and Decor",              contact:"Scarlet Garcia",     email:"Scarlet.GarciaUlerio@flooranddecor.com", phone:"786-858-2331", category:"Flooring",           rating:4.5, active:true },
  { id:"S017", name:"Brospro",                      contact:"Leonel Mejia",       email:"brosprobuild@hotmail.com",               phone:"305-491-2638", category:"Finishes",           rating:4.0, active:true },
  { id:"S018", name:"The Home Depot",               contact:"Daniel Carniglia",   email:"MANUEL_D_CARNIGLIA@homedepot.com",       phone:"786-886-7819", category:"General Materials",  rating:4.5, active:true },
  { id:"S019", name:"George Crane",                 contact:"",                   email:"",                                       phone:"305-513-0188", category:"Equipment Rental",   rating:4.0, active:true },
  { id:"S020", name:"Nu-Vue",                       contact:"Enzo Murias",        email:"enzo.nuvue@gmail.com",                   phone:"754-465-1549", category:"Structural Steel",   rating:4.0, active:true },
  { id:"S021", name:"ESP Windows",                  contact:"Danny",              email:"",                                       phone:"786-344-4342", category:"Windows & Glazing",  rating:4.0, active:true },
  { id:"S022", name:"V&V Windows",                  contact:"Jorge",              email:"",                                       phone:"786-760-0914", category:"Windows & Glazing",  rating:4.0, active:true },
  { id:"S023", name:"Nachon Cabilla",               contact:"Jose Sixto",         email:"sixtonachon@gmail.com",                  phone:"786-280-5855", category:"Structural Steel",   rating:4.0, active:true },
  { id:"S024", name:"USA High Security Corp",       contact:"",                   email:"",                                       phone:"305-733-0792", category:"Security Systems",   rating:4.0, active:true },
  { id:"S025", name:"G Proulx Building Products",  contact:"Ryan H",             email:"ryanh@gpbpllc.com",                      phone:"954-922-1429", category:"Structural Steel",   rating:4.0, active:true },
  { id:"S026", name:"KJ Materials LLC",             contact:"Victor Herrera",     email:"sales7401@kjmaterials.net",              phone:"305-522-8943", category:"Drywall",            rating:4.0, active:true },
  { id:"S027", name:"Medley Steel and Supply",      contact:"Julio Jimenez",      email:"jjimenez@medleysteel.com",               phone:"305-525-2919", category:"Structural Steel",   rating:4.0, active:true },
];

function genPO(n)     { return `PO-${new Date().getFullYear()}-${String(n).padStart(4,"0")}`; }
function genId(pre,n) { return `${pre}-${new Date().getFullYear()}-${String(n).padStart(4,"0")}`; }
function daysUntil(d) { return Math.ceil((new Date(d)-new Date())/(1000*60*60*24)); }
function fmt(n) { return parseFloat(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function fileSize(bytes) { if(bytes<1024)return`${bytes}B`; if(bytes<1048576)return`${(bytes/1024).toFixed(1)}KB`; return`${(bytes/1048576).toFixed(1)}MB`; }

function scoreSuppliers(responses, suppliers) {
  const ans = responses.filter(r=>r.status==="quoted"&&r.price>0);
  if (!ans.length) return [];
  const minP=Math.min(...ans.map(r=>r.price)), maxP=Math.max(...ans.map(r=>r.price));
  const minD=Math.min(...ans.map(r=>r.deliveryDays)), maxD=Math.max(...ans.map(r=>r.deliveryDays));
  return ans.map(r=>{
    const sup=suppliers.find(s=>s.id===r.supplierId);
    const ps=maxP===minP?100:Math.round((1-(r.price-minP)/(maxP-minP))*100);
    const ds=maxD===minD?100:Math.round((1-(r.deliveryDays-minD)/(maxD-minD))*100);
    const ws=PAYMENT_SCORE[r.paymentTerms??"COD"]??20;
    return {...r,sup,ps,ds,ws,total:Math.round(ps*0.6+ds*0.25+ws*0.15)};
  }).sort((a,b)=>b.total-a.total);
}
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:#222018;}
::-webkit-scrollbar-thumb{background:#C9A84C;border-radius:4px;}
.app{display:flex;height:100vh;background:#F7F5F1;overflow:hidden;font-family:'Open Sans',sans-serif;}
.sb{width:220px;background:#1A1814;display:flex;flex-direction:column;flex-shrink:0;}
.sb-head{padding:18px 16px;border-bottom:1px solid #2C2A24;}
.sb-mark{width:36px;height:36px;background:linear-gradient(135deg,#C9A84C,#A8863A);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Montserrat';font-weight:900;font-size:12px;color:#1A1814;box-shadow:0 2px 8px rgba(201,168,76,.3);}
.sb-name{font-family:'Montserrat';font-size:12px;font-weight:800;color:#fff;letter-spacing:.3px;}
.sb-tag{font-size:9px;color:#C9A84C;letter-spacing:1.5px;font-weight:500;}
.sb-sec{padding:12px 10px 3px;font-family:'Montserrat';font-size:9px;color:#5A5550;letter-spacing:2px;font-weight:700;text-transform:uppercase;}
.nb{display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:6px;cursor:pointer;border:none;background:transparent;width:calc(100% - 8px);margin:1px 4px;text-align:left;transition:background .12s;position:relative;}
.nb:hover{background:#2C2A24;}
.nb.act{background:#2C2A24;}
.nb.act::before{content:'';position:absolute;left:0;top:20%;height:60%;width:2px;background:#C9A84C;border-radius:0 2px 2px 0;}
.nb-icon{font-size:13px;width:16px;text-align:center;flex-shrink:0;}
.nb-label{font-size:12px;color:#8A8378;font-weight:500;}
.nb.act .nb-label{color:#fff;font-weight:600;}
.nb-badge{margin-left:auto;background:#C9A84C;color:#1A1814;font-size:9px;font-weight:700;padding:1px 5px;border-radius:8px;font-family:'Montserrat';}
.sb-foot{padding:12px 16px;border-top:1px solid #2C2A24;margin-top:auto;}
.main{flex:1;overflow-y:auto;}
.ph{padding:20px 26px 16px;background:#fff;border-bottom:1px solid #E8E4DC;display:flex;align-items:center;justify-content:space-between;}
.ph-title{font-family:'Montserrat';font-size:17px;font-weight:800;color:#2D2D2D;}
.ph-sub{font-size:12px;color:#8A8378;margin-top:2px;}
.pb{padding:20px 26px;}
.gl{height:2px;background:linear-gradient(to right,#C9A84C,#E2BE72,transparent);margin-bottom:16px;}
.card{background:#fff;border-radius:10px;border:1px solid #E8E4DC;box-shadow:0 1px 3px rgba(0,0,0,.04);}
.stat{background:#fff;border-radius:10px;border:1px solid #E8E4DC;padding:16px;position:relative;overflow:hidden;}
.stat::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--sc);}
.stat-val{font-family:'Montserrat';font-size:22px;font-weight:800;color:var(--sc);margin:6px 0 2px;}
.stat-lbl{font-size:11px;color:#8A8378;}
.btn{border:none;border-radius:6px;cursor:pointer;font-weight:600;transition:all .15s;font-size:13px;}
.btn-gold{background:#C9A84C;color:#1A1814;padding:9px 18px;font-family:'Montserrat';font-weight:700;font-size:12px;letter-spacing:.5px;box-shadow:0 2px 6px rgba(201,168,76,.25);}
.btn-gold:hover{background:#E2BE72;transform:translateY(-1px);}
.btn-dark{background:#2D2D2D;color:#fff;padding:9px 18px;font-family:'Montserrat';font-weight:700;font-size:12px;}
.btn-dark:hover{background:#3A3A3A;}
.btn-ghost{background:transparent;color:#8A8378;border:1.5px solid #E8E4DC;padding:8px 16px;font-size:12px;}
.btn-ghost:hover{border-color:#2D2D2D;color:#2D2D2D;}
.btn-success{background:rgba(90,173,122,.10);color:#5AAD7A;border:1px solid rgba(90,173,122,.28);padding:9px 18px;font-size:12px;font-family:'Montserrat';font-weight:700;}
.btn-danger{background:rgba(212,116,90,.10);color:#D4745A;border:1px solid rgba(212,116,90,.28);padding:7px 14px;font-size:12px;}
.btn-sm{padding:5px 12px!important;font-size:11px!important;border-radius:5px!important;}
.lbl{font-family:'Montserrat';font-size:10px;font-weight:700;color:#8A8378;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;display:block;}
.inp{width:100%;background:#F7F5F1;border:1.5px solid #E8E4DC;border-radius:7px;padding:9px 12px;font-family:'Open Sans';font-size:13px;color:#2D2D2D;outline:none;transition:border-color .15s;}
.inp:focus{border-color:#C9A84C;box-shadow:0 0 0 3px rgba(201,168,76,.08);}
.inp::placeholder{color:#C8C2B4;}
.sel{width:100%;background:#F7F5F1;border:1.5px solid #E8E4DC;border-radius:7px;padding:9px 12px;font-family:'Open Sans';font-size:13px;color:#2D2D2D;outline:none;appearance:none;cursor:pointer;}
.sel:focus{border-color:#C9A84C;}
.ta{width:100%;background:#F7F5F1;border:1.5px solid #E8E4DC;border-radius:7px;padding:9px 12px;font-family:'Open Sans';font-size:13px;color:#2D2D2D;outline:none;resize:vertical;min-height:65px;}
.ta:focus{border-color:#C9A84C;}
.trow{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #E8E4DC;cursor:pointer;transition:background .1s;}
.trow:hover{background:#F7F5F1;}
.trow:last-child{border-bottom:none;}
.bpo{font-family:'Montserrat';font-size:10px;font-weight:700;background:#2D2D2D;color:#fff;padding:2px 8px;border-radius:4px;display:inline-block;}
.bgold{font-family:'Montserrat';font-size:10px;font-weight:700;background:rgba(201,168,76,.10);color:#A8863A;border:1px solid rgba(201,168,76,.28);padding:2px 8px;border-radius:4px;display:inline-block;}
.chip{font-family:'Montserrat';font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px;display:inline-flex;align-items:center;gap:3px;}
.ov{position:fixed;inset:0;background:rgba(26,24,20,.6);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;}
.mod{background:#fff;border-radius:12px;width:100%;max-width:820px;max-height:92vh;overflow-y:auto;padding:24px;border:1px solid #E8E4DC;box-shadow:0 20px 60px rgba(0,0,0,.18);}
.mod-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #E8E4DC;}
.pd{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;font-family:'Montserrat';flex-shrink:0;}
.toast{position:fixed;bottom:20px;right:20px;z-index:400;background:#2D2D2D;color:#fff;padding:11px 18px;border-radius:10px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,.2);font-size:13px;border-left:3px solid #C9A84C;}
.sec-lbl{font-family:'Montserrat';font-size:10px;font-weight:700;color:#8A8378;letter-spacing:1px;text-transform:uppercase;margin-bottom:7px;display:flex;align-items:center;gap:8px;}
.sec-lbl::after{content:'';flex:1;height:1px;background:#E8E4DC;}
.line-item{background:#F7F5F1;border:1px solid #E8E4DC;border-radius:8px;padding:12px;margin-bottom:8px;}
.drop-zone{border:2px dashed #E8E4DC;border-radius:8px;padding:20px;text-align:center;cursor:pointer;transition:all .2s;}
.drop-zone:hover,.drop-zone.drag-over{border-color:#C9A84C;background:rgba(201,168,76,.05);}
.attach-item{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#F7F5F1;border:1px solid #E8E4DC;border-radius:7px;margin-bottom:5px;}
@keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
@keyframes su{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.fi{animation:fi .2s ease forwards;}
.su{animation:su .25s cubic-bezier(.34,1.4,.64,1) forwards;}
.spin{animation:spin 1s linear infinite;}
`;
function ProgressBar({ stage, small }) {
  const idx = STAGES.findIndex(s=>s.id===stage);
  const sz = small ? 16 : 18;
  return (
    <div style={{display:"flex",alignItems:"center"}}>
      {STAGES.map((s,i)=>(
        <div key={s.id} style={{display:"flex",alignItems:"center",flex:i<STAGES.length-1?1:"none"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <div className="pd" style={{width:sz,height:sz,background:i<=idx?s.color:"#E8E4DC",color:i<=idx?"#fff":"#8A8378",boxShadow:i===idx?`0 0 0 3px ${s.color}28`:"none",fontSize:small?7:8}}>
              {i<idx?"✓":i+1}
            </div>
            {!small&&<div style={{fontSize:7,color:i<=idx?s.color:"#C8C2B4",fontWeight:700,whiteSpace:"nowrap",marginTop:2,fontFamily:"Montserrat"}}>{s.label}</div>}
          </div>
          {i<STAGES.length-1&&<div style={{flex:1,height:2,background:i<idx?STAGES[i+1].color:"#E8E4DC",margin:"0 1px",marginBottom:small?0:12}}/>}
        </div>
      ))}
    </div>
  );
}

function Stars({ r }) {
  return <span style={{color:"#C9A84C",fontSize:12}}>{[1,2,3,4,5].map(i=><span key={i}>{i<=Math.round(r)?"★":"☆"}</span>)}</span>;
}

function Empty({ icon, msg, sub }) {
  return (
    <div style={{padding:"48px 20px",textAlign:"center"}}>
      <div style={{fontSize:32,marginBottom:10,opacity:.6}}>{icon}</div>
      <div style={{fontFamily:"Montserrat",fontSize:13,color:"#2D2D2D",fontWeight:700,marginBottom:4}}>{msg}</div>
      <div style={{fontSize:12,color:"#8A8378"}}>{sub}</div>
    </div>
  );
}

function SH({ title, action }) {
  return (
    <div style={{padding:"11px 16px",borderBottom:"1px solid #E8E4DC",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{fontFamily:"Montserrat",fontSize:11,fontWeight:700,color:"#2D2D2D",letterSpacing:.5,textTransform:"uppercase"}}>{title}</div>
      {action}
    </div>
  );
}

function Attachments({ attachments=[], onAdd, onDelete, folder, readOnly=false }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      if (file.size > 10*1024*1024) { alert(`${file.name} exceeds 10MB limit`); continue; }
      const result = await uploadFile(file, folder);
      if (result) onAdd(result);
    }
    setUploading(false);
  };

  return (
    <div>
      <div className="sec-lbl">Attachments ({attachments.length})</div>
      {attachments.map((a,i)=>(
        <div key={i} className="attach-item">
          <span style={{fontSize:18}}>📄</span>
          <div style={{flex:1,minWidth:0}}>
            <a href={a.url} target="_blank" rel="noreferrer" style={{fontSize:12,color:"#2D2D2D",fontWeight:600,textDecoration:"none",display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.name}</a>
            <div style={{fontSize:10,color:"#8A8378"}}>{fileSize(a.size)} · {new Date(a.uploadedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
          </div>
          <a href={a.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{textDecoration:"none",fontSize:11}}>Open</a>
          {!readOnly&&<button onClick={async()=>{await deleteFile(a.path);onDelete(i);}} className="btn btn-danger btn-sm">✕</button>}
        </div>
      ))}
      {!readOnly&&(
        <div
          className={`drop-zone ${dragOver?"drag-over":""}`}
          onDragOver={e=>{e.preventDefault();setDragOver(true);}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files);}}
          onClick={()=>document.getElementById(`file-input-${folder}`).click()}
        >
          <input id={`file-input-${folder}`} type="file" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.docx" multiple style={{display:"none"}} onChange={e=>handleFiles(e.target.files)}/>
          {uploading
            ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><div className="spin" style={{width:16,height:16,border:"2px solid #C9A84C",borderTopColor:"transparent",borderRadius:"50%"}}/><span style={{fontSize:12,color:"#8A8378"}}>Uploading...</span></div>
            : <div><div style={{fontSize:20,marginBottom:4}}>📎</div><div style={{fontSize:12,color:"#8A8378"}}>Drop files here or <span style={{color:"#A8863A",fontWeight:700}}>click to browse</span></div><div style={{fontSize:10,color:"#C8C2B4",marginTop:2}}>PDF, images, Excel, Word · Max 10MB each</div></div>
          }
        </div>
      )}
    </div>
  );
}
export default function ProcuraApp() {
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [reqs,setReqs]=useState([]);
  const [rfqs,setRfqs]=useState([]);
  const [cmps,setCmps]=useState([]);
  const [orders,setOrders]=useState([]);
  const [dels,setDels]=useState([]);
  const [rcvs,setRcvs]=useState([]);
  const [pays,setPays]=useState([]);
  const [sups,setSups]=useState([]);
  const [projs,setProjs]=useState([]);
  const [ctrPO,setCtrPO]=useState(0);
  const [ctrRFQ,setCtrRFQ]=useState(0);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      const [r,rq,cm,or,dl,rc,py,sp,pr,cpo,crfq]=await Promise.all([
        load("proc:reqs",[]),load("proc:rfqs",[]),load("proc:cmps",[]),
        load("proc:orders",[]),load("proc:dels",[]),load("proc:rcvs",[]),
        load("proc:pays",[]),load("proc:sups",DEMO_SUPPLIERS),
        load("proc:projs",DEMO_PROJECTS),
        load("proc:ctrPO",0),load("proc:ctrRFQ",0),
      ]);
      setReqs(r);setRfqs(rq);setCmps(cm);setOrders(or);setDels(dl);setRcvs(rc);setPays(py);setSups(sp);setProjs(pr);setCtrPO(cpo);setCtrRFQ(crfq);
      setLoading(false);
    })();
  },[]);

  const showToast=(msg,icon="✅")=>{ setToast({msg,icon}); setTimeout(()=>setToast(null),3500); };
  const saveReqs=async v=>{setReqs(v);await save("proc:reqs",v);};
  const saveRfqs=async v=>{setRfqs(v);await save("proc:rfqs",v);};
  const saveCmps=async v=>{setCmps(v);await save("proc:cmps",v);};
  const saveOrders=async v=>{setOrders(v);await save("proc:orders",v);};
  const saveDels=async v=>{setDels(v);await save("proc:dels",v);};
  const saveRcvs=async v=>{setRcvs(v);await save("proc:rcvs",v);};
  const savePays=async v=>{setPays(v);await save("proc:pays",v);};
  const saveSups=async v=>{setSups(v);await save("proc:sups",v);};
  const saveProjs=async v=>{setProjs(v);await save("proc:projs",v);};

  const pendingPO=orders.filter(o=>o.approvalStatus==="pending").length;
  const pendingCMP=cmps.filter(c=>c.status==="pending").length;
  const alertDEL=dels.filter(d=>d.status!=="completed"&&daysUntil(d.expectedDate)<=3).length;

  const ctx={reqs,rfqs,cmps,orders,dels,rcvs,pays,sups,projs,
    saveReqs,saveRfqs,saveCmps,saveOrders,saveDels,saveRcvs,savePays,saveSups,saveProjs,
    showToast,setPage,ctrPO,setCtrPO,ctrRFQ,setCtrRFQ};

  if(loading) return(
    <div style={{height:"100vh",background:"#1A1814",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
      <div style={{fontFamily:"Montserrat",fontWeight:900,fontSize:48,color:"#fff",letterSpacing:-2}}>
        <span>7</span><span style={{color:"#C9A84C"}}>4</span><span>8</span>
      </div>
      <div style={{fontFamily:"Montserrat",fontSize:10,color:"#C9A84C",letterSpacing:4}}>LOADING PROCUREMENT SYSTEM...</div>
    </div>
  );

  return(
    <div className="app">
      <style>{STYLE}</style>
      <div className="sb">
        <div className="sb-head">
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
            <div className="sb-mark">748</div>
            <div><div className="sb-name">DEVELOPMENT</div><div className="sb-tag">PROCUREMENT</div></div>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
          <div className="sb-sec">General</div>
          {NAV.slice(0,1).map(n=>(
            <button key={n.id} className={`nb ${page===n.id?"act":""}`} onClick={()=>setPage(n.id)}>
              <span className="nb-icon">{n.icon}</span><span className="nb-label">{n.label}</span>
            </button>
          ))}
          <div className="sb-sec">Modules</div>
          {NAV.slice(1,8).map(n=>(
            <button key={n.id} className={`nb ${page===n.id?"act":""}`} onClick={()=>setPage(n.id)}>
              <span className="nb-icon">{n.icon}</span><span className="nb-label">{n.label}</span>
              {n.id==="PO"&&pendingPO>0&&<span className="nb-badge">{pendingPO}</span>}
              {n.id==="CMP"&&pendingCMP>0&&<span className="nb-badge">{pendingCMP}</span>}
              {n.id==="DEL"&&alertDEL>0&&<span className="nb-badge">{alertDEL}</span>}
            </button>
          ))}
          <div className="sb-sec">Tools</div>
          {NAV.slice(8).map(n=>(
            <button key={n.id} className={`nb ${page===n.id?"act":""}`} onClick={()=>setPage(n.id)}>
              <span className="nb-icon">{n.icon}</span><span className="nb-label">{n.label}</span>
            </button>
          ))}
        </div>
        <div className="sb-foot">
          <div style={{fontFamily:"Montserrat",fontSize:9,color:"#5A5550"}}>748 Development C.A.</div>
          <div style={{fontSize:9,color:"#3A3A3A",marginTop:1}}>Procurement v2.1 · {new Date().getFullYear()}</div>
        </div>
      </div>
      <div className="main">
        {page==="dashboard"&&<Dashboard ctx={ctx}/>}
        {page==="REQ"&&<REQPage ctx={ctx}/>}
        {page==="RFQ"&&<RFQPage ctx={ctx}/>}
        {page==="CMP"&&<CMPPage ctx={ctx}/>}
        {page==="PO"&&<POPage ctx={ctx}/>}
        {page==="DEL"&&<DELPage ctx={ctx}/>}
        {page==="RCV"&&<RCVPage ctx={ctx}/>}
        {page==="PAY"&&<PAYPage ctx={ctx}/>}
        {page==="tracker"&&<Tracker ctx={ctx}/>}
        {page==="vendors"&&<VendorsPage ctx={ctx}/>}
      </div>
      {toast&&<div className="toast fi"><span style={{fontSize:16}}>{toast.icon}</span><span>{toast.msg}</span></div>}
    </div>
  );
}
function Dashboard({ctx}){
  const {reqs,orders,cmps,dels,pays,setPage}=ctx;
  const totalPaid=pays.filter(p=>p.status==="paid").reduce((a,p)=>a+parseFloat(p.invoiceAmount||0),0);
  const pipeline=STAGES.map(s=>({...s,count:reqs.filter(r=>r.stage===s.id).length}));
  const alerts=[
    ...orders.filter(o=>o.approvalStatus==="pending").map(o=>({msg:`PO ${o.id} pending manager approval`,c:"#D4745A",icon:"⏳",page:"PO"})),
    ...dels.filter(d=>d.status!=="completed"&&daysUntil(d.expectedDate)<=3).map(d=>({msg:`Delivery ${d.id} due in ${daysUntil(d.expectedDate)}d`,c:"#D4745A",icon:"🔴",page:"DEL"})),
    ...cmps.filter(c=>c.status==="pending").map(c=>({msg:`Comparison ${c.id} pending approval`,c:"#A8863A",icon:"⚖️",page:"CMP"})),
  ];
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">Dashboard</div><div className="ph-sub">748 Development · Procurement System · {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div></div>
        <div style={{fontFamily:"Montserrat",fontSize:11,fontWeight:700,color:"#A8863A"}}>People who build</div>
      </div>
      <div className="pb">
        <div className="gl"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
          {[{l:"Total PRs",v:reqs.length,c:"#2D2D2D",icon:"📋"},{l:"In Progress",v:reqs.filter(r=>r.stage!=="PAY").length,c:"#5B9BD5",icon:"🔄"},{l:"Completed",v:pays.filter(p=>p.status==="paid").length,c:"#5AAD7A",icon:"✅"},{l:"Total Paid",v:`$${fmt(totalPaid)}`,c:"#A8863A",icon:"💰"}].map(s=>(
            <div key={s.l} className="stat" style={{"--sc":s.c}}>
              <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
              <div className="stat-val">{s.v}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>
        {alerts.length>0&&(
          <div className="card" style={{padding:"14px 16px",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:3,height:14,background:"#C9A84C",borderRadius:2}}/>
              <div style={{fontFamily:"Montserrat",fontSize:11,fontWeight:700,color:"#2D2D2D",letterSpacing:.5,textTransform:"uppercase"}}>Requires Attention</div>
            </div>
            {alerts.map((a,i)=>(
              <div key={i} onClick={()=>setPage(a.page)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(212,116,90,.06)",border:"1px solid rgba(212,116,90,.2)",borderRadius:7,marginBottom:5,cursor:"pointer"}}>
                <span style={{fontSize:13}}>{a.icon}</span>
                <span style={{fontSize:12,color:a.c,flex:1,fontWeight:500}}>{a.msg}</span>
                <span style={{fontSize:11,color:"#8A8378",fontFamily:"Montserrat",fontWeight:600}}>View →</span>
              </div>
            ))}
          </div>
        )}
        <div className="card" style={{padding:"16px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{width:3,height:14,background:"#C9A84C",borderRadius:2}}/>
            <div style={{fontFamily:"Montserrat",fontSize:11,fontWeight:700,color:"#2D2D2D",letterSpacing:.5,textTransform:"uppercase"}}>Procurement Pipeline</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8}}>
            {pipeline.map(s=>(
              <div key={s.id} onClick={()=>setPage(s.id)} style={{textAlign:"center",padding:"12px 6px",borderRadius:8,background:`${s.color}0D`,border:`1px solid ${s.color}28`,cursor:"pointer"}}>
                <div style={{fontSize:16,marginBottom:4}}>{s.icon}</div>
                <div style={{fontFamily:"Montserrat",fontSize:20,fontWeight:900,color:s.color}}>{s.count}</div>
                <div style={{fontSize:8,color:"#8A8378",marginTop:2,fontWeight:700,fontFamily:"Montserrat",letterSpacing:.5}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SH title={`Recent Activity · ${reqs.length} PRs`}/>
          {reqs.length===0?<Empty icon="📋" msg="No requisitions yet" sub="Create your first purchase requisition to get started"/>:
          reqs.slice(0,6).map(r=>{
            const s=STAGES.find(s=>s.id===r.stage); const p=PRIORITY[r.priority]||PRIORITY.normal;
            return(
              <div key={r.id} className="trow" onClick={()=>setPage("tracker")}>
                <span className="bpo">{r.id}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.description||r.items?.[0]?.description||"—"}</div>
                  <div style={{fontSize:11,color:"#8A8378"}}>{r.items?.length||1} item(s) · {new Date(r.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                </div>
                <ProgressBar stage={r.stage} small/>
                <span className="chip" style={{background:`${s?.color}15`,color:s?.color}}>● {s?.label}</span>
                <span className="chip" style={{background:p.bg,color:p.color}}>{p.dot}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
function REQPage({ctx}){
  const {reqs,saveReqs,projs,sups,ctrPO,setCtrPO,showToast}=ctx;
  const [showNew,setShowNew]=useState(false);
  const [selected,setSelected]=useState(null);
  const [filterType,setFilterType]=useState("all");
  const [search,setSearch]=useState("");

  const handleCreate=async(form)=>{
    const n=ctrPO+1;
    const req={...form,id:genPO(n),createdAt:new Date().toISOString(),stage:"REQ",
      history:[{stage:"REQ",date:new Date().toISOString(),note:`${form.reqType==="field"?"Field":"Estimation"} requisition created — ${form.items?.length||1} item(s)`}]};
    await saveReqs([req,...reqs]);
    setCtrPO(n); await save("proc:ctrPO",n);
    setShowNew(false); showToast(`${req.id} created — ${form.items?.length||1} item(s)`);
  };

  const filtered=reqs.filter(r=>{
    const ms=r.description?.toLowerCase().includes(search.toLowerCase())||r.id?.toLowerCase().includes(search.toLowerCase())||r.items?.some(i=>i.description?.toLowerCase().includes(search.toLowerCase()));
    const mt=filterType==="all"||r.reqType===filterType;
    return ms&&mt;
  });

  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">📋 Requisitions</div><div className="ph-sub">Multi-line purchase requests — Field & Estimation</div></div>
        <button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ New Requisition</button>
      </div>
      <div className="pb">
        <div className="gl"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
          {[{l:"Total PRs",v:reqs.length,c:"#2D2D2D"},{l:"Field",v:reqs.filter(r=>r.reqType==="field").length,c:"#D4745A"},{l:"Estimation",v:reqs.filter(r=>r.reqType==="estimation").length,c:"#5B9BD5"},{l:"Urgent",v:reqs.filter(r=>r.priority==="urgent").length,c:"#C94A4A"}].map(s=>(
            <div key={s.l} className="stat" style={{"--sc":s.c}}><div className="stat-val">{s.v}</div><div className="stat-lbl">{s.l}</div></div>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <input className="inp" style={{flex:1}} placeholder="Search by PR#, description or item..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <select className="sel" style={{width:160}} value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="field">🏗️ Field Request</option>
            <option value="estimation">📊 Estimation</option>
          </select>
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SH title={`Requisitions · ${filtered.length} records`}/>
          {filtered.length===0?<Empty icon="📋" msg="No requisitions" sub="Create your first purchase requisition"/>:
          filtered.map(r=>{
            const s=STAGES.find(s=>s.id===r.stage); const p=PRIORITY[r.priority]||PRIORITY.normal;
            const proj=projs?.find(pr=>pr.id===r.projectId);
            const isField=r.reqType==="field";
            return(
              <div key={r.id} className="trow" onClick={()=>setSelected(r)}>
                <div style={{display:"flex",flexDirection:"column",gap:3,flexShrink:0}}>
                  <span className="bpo">{r.id}</span>
                  <span style={{fontSize:9,fontWeight:700,background:isField?"rgba(212,116,90,.10)":"rgba(91,155,213,.10)",color:isField?"#D4745A":"#5B9BD5",border:`1px solid ${isField?"rgba(212,116,90,.28)":"rgba(91,155,213,.28)"}`,padding:"1px 6px",borderRadius:4,fontFamily:"Montserrat"}}>{isField?"🏗️ Field":"📊 Estimation"}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.description||r.items?.[0]?.description||"—"}</div>
                  <div style={{fontSize:11,color:"#8A8378",marginTop:1}}>
                    {r.items?.length||1} item(s)
                    {proj&&<span style={{marginLeft:6,color:"#5B9BD5"}}>· {proj.code}</span>}
                    {r.fieldRequestedBy&&<span style={{marginLeft:6}}>· {r.fieldRequestedBy}</span>}
                  </div>
                </div>
                {r.estimatedBudget&&<div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:11,fontFamily:"Montserrat",fontWeight:700,color:"#A8863A"}}>${fmt(r.estimatedBudget)}</div><div style={{fontSize:10,color:"#8A8378"}}>budget</div></div>}
                <ProgressBar stage={r.stage} small/>
                <span className="chip" style={{background:`${s?.color}15`,color:s?.color,flexShrink:0}}>● {s?.label}</span>
                <span className="chip" style={{background:p.bg,color:p.color,flexShrink:0}}>{p.dot}</span>
                <span style={{color:"#C8C2B4",fontSize:13}}>›</span>
              </div>
            );
          })}
        </div>
      </div>
      {showNew&&<REQForm onClose={()=>setShowNew(false)} onSubmit={handleCreate} projs={projs} sups={sups}/>}
      {selected&&<REQDetail req={selected} projs={projs} onClose={()=>setSelected(null)}/>}
    </div>
  );
}

function REQForm({onClose,onSubmit,projs,sups}){
  const [reqType,setReqType]=useState(null);
  const [f,setF]=useState({priority:"normal",projectId:"",deliveryLocation:"Warehouse",neededBy:"",fieldRequestedBy:"",fieldSupervisor:"",site:"",estimatedBudget:"",justification:"",targetDate:"",items:[{id:1,description:"",qty:"",unit:"EA",costCode:"",notes:""}]});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const setItem=(idx,k,v)=>setF(p=>({...p,items:p.items.map((it,i)=>i===idx?{...it,[k]:v}:it)}));
  const addItem=()=>setF(p=>({...p,items:[...p.items,{id:Date.now(),description:"",qty:"",unit:"EA",costCode:"",notes:""}]}));
  const removeItem=idx=>setF(p=>({...p,items:p.items.filter((_,i)=>i!==idx)}));
  const valid=reqType&&f.items.length>0&&f.items.every(i=>i.description)&&f.neededBy&&(reqType==="field"?f.fieldRequestedBy:f.projectId);

  if(!reqType) return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:560}}>
        <div className="mod-head"><div><div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:800,color:"#2D2D2D"}}>New Purchase Requisition</div><div style={{fontSize:12,color:"#8A8378",marginTop:2}}>Select request type</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"flex",gap:14,marginBottom:20}}>
          {[{k:"field",icon:"🏗️",title:"Field Request",desc:"Urgent or unplanned need from jobsite."},{k:"estimation",icon:"📊",title:"Estimation",desc:"Planned purchase linked to project budget."}].map(({k,icon,title,desc})=>(
            <div key={k} onClick={()=>setReqType(k)} style={{flex:1,border:"2px solid #E8E4DC",borderRadius:10,padding:18,cursor:"pointer",transition:"all .18s",background:"#fff"}}>
              <div style={{fontSize:30,marginBottom:10}}>{icon}</div>
              <div style={{fontFamily:"Montserrat",fontSize:13,fontWeight:800,color:"#2D2D2D",marginBottom:5}}>{title}</div>
              <div style={{fontSize:12,color:"#8A8378",lineHeight:1.6}}>{desc}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end"}}><button className="btn btn-ghost" onClick={onClose}>Cancel</button></div>
      </div>
    </div>
  );

  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head">
          <div><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:800,color:"#2D2D2D"}}>{reqType==="field"?"🏗️ Field Request":"📊 Estimation"}</div><button onClick={()=>setReqType(null)} className="btn btn-ghost btn-sm">Change</button></div><div style={{fontSize:11,color:"#8A8378",marginTop:2}}>PR number will be generated automatically</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{display:"grid",gap:14}}>
          <div>
            <div className="sec-lbl">General Info</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
              <div><label className="lbl">Project</label><select className="sel" value={f.projectId} onChange={e=>set("projectId",e.target.value)}><option value="">— Select project —</option>{(projs||[]).map(p=><option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}</select></div>
              <div><label className="lbl">Delivery Location</label><select className="sel" value={f.deliveryLocation} onChange={e=>set("deliveryLocation",e.target.value)}>{DELIVERY_LOCS.map(l=><option key={l}>{l}</option>)}</select></div>
              <div><label className="lbl">Date Needed *</label><input className="inp" type="date" value={f.neededBy} onChange={e=>set("neededBy",e.target.value)}/></div>
            </div>
            {reqType==="field"&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><label className="lbl">Requested By *</label><input className="inp" value={f.fieldRequestedBy} onChange={e=>set("fieldRequestedBy",e.target.value)} placeholder="Name of requester"/></div>
              <div><label className="lbl">Supervisor</label><input className="inp" value={f.fieldSupervisor} onChange={e=>set("fieldSupervisor",e.target.value)} placeholder="Supervisor name"/></div>
              <div><label className="lbl">Site / Location</label><input className="inp" value={f.site} onChange={e=>set("site",e.target.value)} placeholder="e.g. Tower A - Floor 8"/></div>
            </div>)}
            {reqType==="estimation"&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><label className="lbl">Estimated Budget ($)</label><input className="inp" type="number" value={f.estimatedBudget} onChange={e=>set("estimatedBudget",e.target.value)} placeholder="0.00"/></div>
              <div><label className="lbl">Target Date</label><input className="inp" type="date" value={f.targetDate} onChange={e=>set("targetDate",e.target.value)}/></div>
              <div style={{gridColumn:"1/-1"}}><label className="lbl">Justification</label><textarea className="ta" value={f.justification} onChange={e=>set("justification",e.target.value)} placeholder="Why is this purchase needed?"/></div>
            </div>)}
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div className="sec-lbl" style={{margin:0}}>Line Items ({f.items.length}) *</div>
              <button onClick={addItem} style={{fontSize:12,color:"#A8863A",fontWeight:700,background:"none",border:"none",cursor:"pointer",fontFamily:"Montserrat"}}>+ Add Item</button>
            </div>
            {f.items.map((item,idx)=>(
              <div key={item.id} className="line-item">
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:18,height:18,borderRadius:4,background:"rgba(201,168,76,.10)",border:"1px solid rgba(201,168,76,.28)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#A8863A",fontFamily:"Montserrat",flexShrink:0}}>{idx+1}</div>
                  <div style={{flex:1,fontSize:10,color:"#8A8378",fontFamily:"Montserrat",fontWeight:700,letterSpacing:.5}}>ITEM {idx+1}</div>
                  {f.items.length>1&&<button onClick={()=>removeItem(idx)} style={{fontSize:11,color:"#D4745A",background:"none",border:"none",cursor:"pointer",fontWeight:700}}>Remove</button>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"3fr 1fr 1fr",gap:8,marginBottom:8}}>
                  <div><label className="lbl">Description *</label><input className="inp" value={item.description} onChange={e=>setItem(idx,"description",e.target.value)} placeholder="What is needed?"/></div>
                  <div><label className="lbl">Qty (opt)</label><input className="inp" type="number" value={item.qty} onChange={e=>setItem(idx,"qty",e.target.value)} placeholder="—"/></div>
                  <div><label className="lbl">Unit</label><select className="sel" value={item.unit} onChange={e=>setItem(idx,"unit",e.target.value)}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"2fr 2fr",gap:8}}>
                  <div><label className="lbl">Cost Code</label><select className="sel" value={item.costCode} onChange={e=>setItem(idx,"costCode",e.target.value)}><option value="">— Select —</option>{COST_CODES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="lbl">Notes / Specs</label><input className="inp" value={item.notes} onChange={e=>setItem(idx,"notes",e.target.value)} placeholder="Brand, spec, notes..."/></div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="sec-lbl">Priority</div>
            <div style={{display:"flex",gap:10}}>
              {Object.entries(PRIORITY).map(([k,p])=>(
                <button key={k} onClick={()=>set("priority",k)} style={{flex:1,padding:"10px",border:`1.5px solid ${f.priority===k?p.color:"#E8E4DC"}`,borderRadius:8,cursor:"pointer",background:f.priority===k?p.bg:"#F7F5F1",color:f.priority===k?p.color:"#8A8378",fontFamily:"Montserrat",fontSize:11,fontWeight:700,transition:"all .15s"}}>{p.dot} {p.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:20,paddingTop:14,borderTop:"1px solid #E8E4DC"}}>
          <button onClick={()=>setReqType(null)} style={{fontSize:12,color:"#8A8378",background:"none",border:"none",cursor:"pointer"}}>← Change type</button>
          <div style={{display:"flex",gap:10}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:.45}} onClick={()=>onSubmit({...f,reqType,description:f.items.map((it,i)=>`${i+1}. ${it.description}`).join(" | "),quantity:f.items[0]?.qty||1,unit:f.items[0]?.unit||"EA"})}>Generate PR →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function REQDetail({req,projs,onClose}){
  const proj=projs?.find(p=>p.id===req.projectId);
  const p=PRIORITY[req.priority]||PRIORITY.normal;
  const isField=req.reqType==="field";
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:700}}>
        <div className="mod-head">
          <div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><span className="bpo">{req.id}</span><span style={{fontSize:9,fontWeight:700,background:isField?"rgba(212,116,90,.10)":"rgba(91,155,213,.10)",color:isField?"#D4745A":"#5B9BD5",border:`1px solid ${isField?"rgba(212,116,90,.28)":"rgba(91,155,213,.28)"}`,padding:"2px 8px",borderRadius:4,fontFamily:"Montserrat"}}>{isField?"🏗️ Field":"📊 Estimation"}</span><span className="chip" style={{background:p.bg,color:p.color}}>{p.dot} {p.label}</span></div><div style={{fontFamily:"Montserrat",fontSize:15,fontWeight:800,color:"#2D2D2D"}}>{req.description||req.items?.[0]?.description}</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card" style={{padding:"12px 14px",marginBottom:12}}><ProgressBar stage={req.stage}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {[["Project",proj?`${proj.code} — ${proj.name}`:"—"],["Delivery Location",req.deliveryLocation||"—"],["Date Needed",req.neededBy?new Date(req.neededBy).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—"],isField?["Requested By",req.fieldRequestedBy||"—"]:["Est. Budget",req.estimatedBudget?`$${fmt(req.estimatedBudget)}`:"—"],isField?["Supervisor",req.fieldSupervisor||"—"]:["Target Date",req.targetDate||"—"],isField?["Site",req.site||"—"]:["Justification",req.justification||"—"]].map(([k,v])=>(
            <div key={k} style={{background:"#F7F5F1",borderRadius:7,padding:"8px 12px",border:"1px solid #E8E4DC"}}><div style={{fontSize:9,color:"#8A8378",fontFamily:"Montserrat",fontWeight:700,letterSpacing:.5,marginBottom:2}}>{k.toUpperCase()}</div><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{v}</div></div>
          ))}
        </div>
        <div style={{marginBottom:12}}>
          <div className="sec-lbl">Line Items ({req.items?.length||1})</div>
          {(req.items||[{description:req.description,qty:req.quantity,unit:req.unit,costCode:req.costCode}]).map((item,i)=>(
            <div key={i} style={{background:"#F7F5F1",border:"1px solid #E8E4DC",borderRadius:8,padding:"10px 12px",marginBottom:5}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><div style={{width:16,height:16,borderRadius:4,background:"rgba(201,168,76,.10)",border:"1px solid rgba(201,168,76,.28)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#A8863A",fontFamily:"Montserrat"}}>{i+1}</div><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{item.description}</div>{item.qty&&<span style={{fontSize:11,color:"#8A8378",marginLeft:"auto"}}>{item.qty} {item.unit}</span>}</div>
              <div style={{display:"flex",gap:10,fontSize:11,color:"#8A8378",marginLeft:24}}>{item.costCode&&<span>📂 {item.costCode}</span>}{item.notes&&<span>📝 {item.notes}</span>}</div>
            </div>
          ))}
        </div>
        <div><div className="sec-lbl">History</div>{(req.history||[]).map((h,i)=>{const s=STAGES.find(s=>s.id===h.stage);return(<div key={i} style={{display:"flex",gap:8,marginBottom:5,alignItems:"flex-start"}}><div style={{width:7,height:7,borderRadius:"50%",background:s?.color||"#8A8378",marginTop:4,flexShrink:0}}/><div><div style={{fontSize:12,color:"#2D2D2D"}}>{h.note}</div><div style={{fontSize:10,color:"#8A8378"}}>{new Date(h.date).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div></div></div>);})}</div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}
function RFQPage({ctx}){
  const {reqs,rfqs,saveRfqs,saveReqs,sups,ctrRFQ,setCtrRFQ,showToast}=ctx;
  const [showNew,setShowNew]=useState(false);
  const [selected,setSelected]=useState(null);
  const eligible=reqs.filter(r=>["REQ","RFQ"].includes(r.stage));

  const handleCreate=async(data)=>{
    const n=ctrRFQ+1;
    const rfq={...data,id:genId("RFQ",n),createdAt:new Date().toISOString(),status:"sent",attachments:[],
      responses:data.supplierIds.map(sid=>({supplierId:sid,status:"pending",price:null,deliveryDays:null,paymentTerms:"Net 30",notes:"",attachments:[],respondedAt:null}))};
    const updReqs=reqs.map(r=>r.id===data.poId&&r.stage==="REQ"?{...r,stage:"RFQ",history:[...(r.history||[]),{stage:"RFQ",date:new Date().toISOString(),note:`RFQ ${rfq.id} sent to ${data.supplierIds.length} vendor(s)`}]}:r);
    await saveRfqs([rfq,...rfqs]); await saveReqs(updReqs);
    setCtrRFQ(n); await save("proc:ctrRFQ",n);
    setShowNew(false); showToast(`${rfq.id} created`);
  };

  const handleRecord=async(rfqId,supId,data)=>{
    const upd=rfqs.map(r=>r.id===rfqId?{...r,status:"with_quotes",responses:r.responses.map(res=>res.supplierId===supId?{...res,...data,status:"quoted",respondedAt:new Date().toISOString()}:res)}:r);
    await saveRfqs(upd);
    if(selected?.id===rfqId)setSelected(upd.find(r=>r.id===rfqId));
    showToast("Quote recorded");
  };

  const handleUpdateAttachments=async(rfqId,supId,attachments)=>{
    const upd=rfqs.map(r=>r.id===rfqId?{...r,responses:r.responses.map(res=>res.supplierId===supId?{...res,attachments}:res)}:r);
    await saveRfqs(upd);
    if(selected?.id===rfqId)setSelected(upd.find(r=>r.id===rfqId));
  };

  const handleRFQAttachments=async(rfqId,attachments)=>{
    const upd=rfqs.map(r=>r.id===rfqId?{...r,attachments}:r);
    await saveRfqs(upd);
    if(selected?.id===rfqId)setSelected(upd.find(r=>r.id===rfqId));
  };

  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">💬 Quotations (RFQ)</div><div className="ph-sub">Request for quotation — attach vendor quotes as PDF</div></div>
        <button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ New RFQ</button>
      </div>
      <div className="pb">
        <div className="gl"/>
        <div className="card" style={{overflow:"hidden"}}>
          <SH title={`Quotation Requests · ${rfqs.length}`}/>
          {rfqs.length===0?<Empty icon="💬" msg="No RFQs yet" sub={eligible.length>0?"Create your first RFQ":"Create a requisition first"}/>:
          rfqs.map(rfq=>{
            const r=reqs.find(r=>r.id===rfq.poId);
            const resp=rfq.responses.filter(r=>r.status==="quoted").length;
            const tot=rfq.responses.length;
            const totalAttachments=rfq.responses.reduce((a,r)=>a+(r.attachments?.length||0),0)+(rfq.attachments?.length||0);
            return(
              <div key={rfq.id} className="trow" onClick={()=>setSelected(rfq)}>
                <div style={{display:"flex",flexDirection:"column",gap:3}}><span className="bgold">{rfq.id}</span><span className="bpo" style={{fontSize:9,padding:"1px 6px"}}>{rfq.poId}</span></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r?.description||r?.items?.[0]?.description||"—"}</div>
                  <div style={{fontSize:11,color:"#8A8378"}}>Due: {new Date(rfq.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})} · {tot} vendor(s){totalAttachments>0?` · 📎 ${totalAttachments} file(s)`:""}</div>
                </div>
                <div style={{width:100}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#8A8378",marginBottom:2,fontFamily:"Montserrat",fontWeight:600}}><span>Quotes</span><span style={{color:resp===tot?"#5AAD7A":"#A8863A"}}>{resp}/{tot}</span></div>
                  <div style={{height:4,background:"#E8E4DC",borderRadius:2,overflow:"hidden"}}><div style={{width:`${tot?resp/tot*100:0}%`,height:"100%",background:resp===tot?"#5AAD7A":"#C9A84C",borderRadius:2}}/></div>
                </div>
                <span style={{color:"#C8C2B4",fontSize:13}}>›</span>
              </div>
            );
          })}
        </div>
      </div>
      {showNew&&<RFQForm eligible={eligible} sups={sups} onClose={()=>setShowNew(false)} onSubmit={handleCreate}/>}
      {selected&&<RFQDetail rfq={selected} sups={sups} reqs={reqs} onClose={()=>setSelected(null)} onRecord={handleRecord} onUpdateAttachments={handleUpdateAttachments} onRFQAttachments={handleRFQAttachments}/>}
    </div>
  );
}

function RFQForm({eligible,sups,onClose,onSubmit}){
  const [f,setF]=useState({poId:eligible[0]?.id||"",dueDate:"",notes:"",supplierIds:[]});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const toggle=id=>set("supplierIds",f.supplierIds.includes(id)?f.supplierIds.filter(s=>s!==id):[...f.supplierIds,id]);
  const valid=f.poId&&f.dueDate&&f.supplierIds.length>=2;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:800,color:"#2D2D2D"}}>New Request for Quotation</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        {eligible.length===0?<Empty icon="💬" msg="No eligible PRs" sub="Create a requisition first"/>:(
          <div style={{display:"grid",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label className="lbl">Requisition (PR) *</label><select className="sel" value={f.poId} onChange={e=>set("poId",e.target.value)}>{eligible.map(r=><option key={r.id} value={r.id}>{r.id} · {(r.description||r.items?.[0]?.description||"").slice(0,40)}</option>)}</select></div>
              <div><label className="lbl">Response Due Date *</label><input className="inp" type="date" value={f.dueDate} onChange={e=>set("dueDate",e.target.value)}/></div>
            </div>
            <div><label className="lbl">Notes / Specifications</label><textarea className="ta" value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Technical specs, brand requirements, etc."/></div>
            <div>
              <label className="lbl">Select Vendors (min. 2) — {f.supplierIds.length} selected</label>
              <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:280,overflowY:"auto"}}>
                {sups.filter(s=>s.active).map(s=>(
                  <div key={s.id} onClick={()=>toggle(s.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:7,border:`1.5px solid ${f.supplierIds.includes(s.id)?"#C9A84C":"#E8E4DC"}`,background:f.supplierIds.includes(s.id)?"rgba(201,168,76,.08)":"#F7F5F1",cursor:"pointer",transition:"all .15s"}}>
                    <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${f.supplierIds.includes(s.id)?"#C9A84C":"#C8C2B4"}`,background:f.supplierIds.includes(s.id)?"#C9A84C":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{f.supplierIds.includes(s.id)&&<span style={{color:"#1A1814",fontSize:10,fontWeight:700}}>✓</span>}</div>
                    <div style={{flex:1}}><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{s.name}</div><div style={{fontSize:11,color:"#8A8378"}}>{s.contact} · {s.phone}</div></div>
                    <span style={{fontSize:10,color:"#8A8378",fontFamily:"Montserrat"}}>{s.category}</span>
                    <Stars r={s.rating}/>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:12,borderTop:"1px solid #E8E4DC"}}>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:.45}} onClick={()=>onSubmit(f)}>Send RFQ →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RFQDetail({rfq,sups,reqs,onClose,onRecord,onUpdateAttachments,onRFQAttachments}){
  const [recId,setRecId]=useState(null);
  const [rf,setRf]=useState({price:"",deliveryDays:"",paymentTerms:"Net 30",notes:""});
  const req=reqs.find(r=>r.id===rfq.poId);
  const answered=rfq.responses.filter(r=>r.status==="quoted");
  const bestPrice=answered.length?Math.min(...answered.map(r=>r.price)):null;

  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:820}}>
        <div className="mod-head">
          <div><div style={{display:"flex",gap:8,marginBottom:6}}><span className="bgold">{rfq.id}</span><span className="bpo">{rfq.poId}</span></div><div style={{fontFamily:"Montserrat",fontSize:14,fontWeight:800,color:"#2D2D2D"}}>{req?.description||req?.items?.[0]?.description||"—"}</div><div style={{fontSize:11,color:"#8A8378",marginTop:1}}>Due: {new Date(rfq.dueDate).toLocaleDateString("en-US",{month:"long",day:"numeric"})}</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {answered.length>=2&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div style={{background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",borderRadius:8,padding:"10px 14px"}}><div style={{fontSize:10,color:"#A8863A",fontWeight:700,fontFamily:"Montserrat",marginBottom:2}}>BEST PRICE</div><div style={{fontFamily:"Montserrat",fontSize:20,fontWeight:900,color:"#A8863A"}}>${bestPrice?.toLocaleString()}</div></div>
            <div style={{background:"rgba(90,173,122,.08)",border:"1px solid rgba(90,173,122,.25)",borderRadius:8,padding:"10px 14px"}}><div style={{fontSize:10,color:"#5AAD7A",fontWeight:700,fontFamily:"Montserrat",marginBottom:2}}>QUOTES RECEIVED</div><div style={{fontFamily:"Montserrat",fontSize:20,fontWeight:900,color:"#5AAD7A"}}>{answered.length}/{rfq.responses.length}</div></div>
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
          {rfq.responses.map(res=>{
            const sup=sups.find(s=>s.id===res.supplierId);
            const isRec=recId===res.supplierId;
            const isBest=answered.length>1&&res.price===bestPrice;
            return(
              <div key={res.supplierId} style={{background:"#F7F5F1",border:"1px solid #E8E4DC",borderRadius:9,padding:"11px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{flex:1}}><div style={{fontSize:13,color:"#2D2D2D",fontWeight:600}}>{sup?.name}</div><div style={{fontSize:11,color:"#8A8378"}}>{sup?.email||sup?.phone}</div></div>
                  {res.status==="quoted"?(
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <div style={{textAlign:"right"}}><div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:800,color:isBest?"#A8863A":"#2D2D2D"}}>${res.price?.toLocaleString()} {isBest?"⭐":""}</div><div style={{fontSize:10,color:"#8A8378"}}>{res.deliveryDays}d · {res.paymentTerms}</div></div>
                      <span className="chip" style={{background:"rgba(90,173,122,.12)",color:"#5AAD7A",border:"1px solid rgba(90,173,122,.28)"}}>✓ Quoted</span>
                    </div>
                  ):(
                    <div style={{display:"flex",gap:8}}>
                      <span className="chip" style={{background:"rgba(201,168,76,.10)",color:"#A8863A",border:"1px solid rgba(201,168,76,.28)"}}>⏳ Pending</span>
                      <button className="btn btn-dark btn-sm" onClick={()=>{setRecId(res.supplierId);setRf({price:"",deliveryDays:"",paymentTerms:"Net 30",notes:""});}}>Record Quote</button>
                    </div>
                  )}
                </div>
                {isRec&&(
                  <div style={{borderTop:"1px solid #E8E4DC",paddingTop:10,marginBottom:10}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 2fr",gap:8,marginBottom:8}}>
                      <div><label className="lbl">Unit Price</label><input className="inp" type="number" value={rf.price} onChange={e=>setRf(p=>({...p,price:e.target.value}))}/></div>
                      <div><label className="lbl">Lead Days</label><input className="inp" type="number" value={rf.deliveryDays} onChange={e=>setRf(p=>({...p,deliveryDays:e.target.value}))}/></div>
                      <div><label className="lbl">Payment Terms</label><select className="sel" value={rf.paymentTerms} onChange={e=>setRf(p=>({...p,paymentTerms:e.target.value}))}>{PAYMENT_OPTIONS.map(o=><option key={o}>{o}</option>)}</select></div>
                      <div><label className="lbl">Notes</label><input className="inp" value={rf.notes} onChange={e=>setRf(p=>({...p,notes:e.target.value}))}/></div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn btn-gold btn-sm" disabled={!rf.price||!rf.deliveryDays} onClick={()=>{onRecord(rfq.id,res.supplierId,{price:parseFloat(rf.price),deliveryDays:parseInt(rf.deliveryDays),paymentTerms:rf.paymentTerms,notes:rf.notes});setRecId(null);}}>Save Quote</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>setRecId(null)}>Cancel</button>
                    </div>
                  </div>
                )}
                <Attachments
                  attachments={res.attachments||[]}
                  folder={`rfq-${rfq.id}-${res.supplierId}`}
                  onAdd={a=>onUpdateAttachments(rfq.id,res.supplierId,[...(res.attachments||[]),a])}
                  onDelete={i=>onUpdateAttachments(rfq.id,res.supplierId,(res.attachments||[]).filter((_,j)=>j!==i))}
                />
              </div>
            );
          })}
        </div>

        <div style={{background:"#F7F5F1",border:"1px solid #E8E4DC",borderRadius:9,padding:"14px"}}>
          <Attachments
            attachments={rfq.attachments||[]}
            folder={`rfq-${rfq.id}-general`}
            onAdd={a=>onRFQAttachments(rfq.id,[...(rfq.attachments||[]),a])}
            onDelete={i=>onRFQAttachments(rfq.id,(rfq.attachments||[]).filter((_,j)=>j!==i))}
          />
        </div>

        <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}
function CMPPage({ctx}){
  const {reqs,rfqs,cmps,saveCmps,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyRFQs=rfqs.filter(r=>r.responses.filter(res=>res.status==="quoted").length>=2&&!cmps.find(c=>c.rfqId===r.id));

  const handleCreate=async(rfqId,payMap)=>{
    const rfq=rfqs.find(r=>r.id===rfqId);
    const enriched=rfq.responses.filter(r=>r.status==="quoted").map(r=>({...r,paymentTerms:payMap[r.supplierId]||"Net 30"}));
    const scored=scoreSuppliers(enriched,sups);
    const cmp={id:genId("CMP",cmps.length+1),rfqId,poId:rfq.poId,createdAt:new Date().toISOString(),scored,winnerId:scored[0]?.supplierId,status:"pending"};
    const updReqs=reqs.map(r=>r.id===rfq.poId?{...r,stage:"CMP",history:[...(r.history||[]),{stage:"CMP",date:new Date().toISOString(),note:`CMP ${cmp.id} generated. Recommended: ${scored[0]?.sup?.name}`}]}:r);
    await saveCmps([cmp,...cmps]); await saveReqs(updReqs);
    setShowNew(false); showToast(`${cmp.id} generated`);
  };

  const handleApprove=async(cmpId,winnerId)=>{
    const updated=cmps.map(c=>c.id===cmpId?{...c,status:"approved",winnerId,approvedAt:new Date().toISOString()}:c);
    const cmp=updated.find(c=>c.id===cmpId); const ws=sups.find(s=>s.id===winnerId);
    const updReqs=reqs.map(r=>r.id===cmp?.poId?{...r,stage:"PO",history:[...(r.history||[]),{stage:"PO",date:new Date().toISOString(),note:`Vendor approved: ${ws?.name}`}]}:r);
    await saveCmps(updated); await saveReqs(updReqs);
    if(selected?.id===cmpId)setSelected(updated.find(c=>c.id===cmpId));
    showToast(`Approved → ${ws?.name}`);
  };

  const bc=s=>s>=80?"#5AAD7A":s>=60?"#A8863A":"#D4745A";

  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">⚖️ Vendor Comparison</div><div className="ph-sub">Automatic scoring: Price 60% · Delivery 25% · Payment Terms 15%</div></div>
        {readyRFQs.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ New Comparison</button>}
      </div>
      <div className="pb">
        <div className="gl"/>
        <div className="card" style={{overflow:"hidden"}}>
          <SH title={`Comparisons · ${cmps.length}`} action={readyRFQs.length>0&&<span style={{fontSize:11,color:"#A8863A",fontFamily:"Montserrat",fontWeight:700}}>{readyRFQs.length} RFQ ready</span>}/>
          {cmps.length===0?<Empty icon="⚖️" msg="No comparisons yet" sub="Record at least 2 vendor quotes in RFQ first"/>:
          cmps.map(c=>{
            const req=reqs.find(r=>r.id===c.poId); const winner=sups.find(s=>s.id===c.winnerId); const top=c.scored?.[0];
            return(
              <div key={c.id} className="trow" onClick={()=>setSelected(c)}>
                <div style={{display:"flex",flexDirection:"column",gap:3}}><span className="bgold">{c.id}</span><span className="bpo" style={{fontSize:9,padding:"1px 6px"}}>{c.poId}</span></div>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description||req?.items?.[0]?.description||"—"}</div><div style={{fontSize:11,color:"#8A8378"}}>Recommended: <strong style={{color:"#5AAD7A"}}>{winner?.name||"—"}</strong></div></div>
                {top&&<div style={{textAlign:"center",padding:"5px 10px",background:`${bc(top.total)}10`,borderRadius:6,border:`1px solid ${bc(top.total)}25`}}><div style={{fontFamily:"Montserrat",fontSize:18,fontWeight:900,color:bc(top.total)}}>{top.total}</div><div style={{fontSize:8,color:"#8A8378",fontWeight:600}}>SCORE</div></div>}
                <span className="chip" style={{background:c.status==="approved"?"rgba(90,173,122,.12)":"rgba(201,168,76,.10)",color:c.status==="approved"?"#5AAD7A":"#A8863A",border:`1px solid ${c.status==="approved"?"rgba(90,173,122,.28)":"rgba(201,168,76,.28)"}`}}>{c.status==="approved"?"✓ Approved":"⏳ Pending"}</span>
                <span style={{color:"#C8C2B4",fontSize:13}}>›</span>
              </div>
            );
          })}
        </div>
      </div>
      {showNew&&<CMPForm readyRFQs={readyRFQs} reqs={reqs} sups={sups} onClose={()=>setShowNew(false)} onSubmit={handleCreate}/>}
      {selected&&<CMPDetail cmp={selected} sups={sups} reqs={reqs} onClose={()=>setSelected(null)} onApprove={handleApprove}/>}
    </div>
  );
}

function CMPForm({readyRFQs,reqs,sups,onClose,onSubmit}){
  const [rfqId,setRfqId]=useState(readyRFQs[0]?.id||"");
  const [payMap,setPayMap]=useState({});
  const rfq=readyRFQs.find(r=>r.id===rfqId);
  const answers=rfq?.responses.filter(r=>r.status==="quoted")||[];
  const enriched=answers.map(r=>({...r,paymentTerms:payMap[r.supplierId]||"Net 30"}));
  const preview=scoreSuppliers(enriched,sups);
  const bc=s=>s>=80?"#5AAD7A":s>=60?"#A8863A":"#D4745A";
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:800,color:"#2D2D2D"}}>New Vendor Comparison</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">Select RFQ</label><select className="sel" value={rfqId} onChange={e=>setRfqId(e.target.value)}>{readyRFQs.map(r=>{const req=reqs.find(req=>req.id===r.poId);return<option key={r.id} value={r.id}>{r.id} · {(req?.description||req?.items?.[0]?.description||r.id).slice(0,42)}</option>;})}</select></div>
          <div><label className="lbl">Payment terms per vendor</label>
            {answers.map(r=>{const sup=sups.find(s=>s.id===r.supplierId);return(
              <div key={r.supplierId} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,alignItems:"center",padding:"9px 12px",background:"#F7F5F1",border:"1px solid #E8E4DC",borderRadius:7,marginBottom:5}}>
                <div><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{sup?.name}</div><div style={{fontSize:11,color:"#8A8378"}}>${r.price?.toLocaleString()} · {r.deliveryDays}d</div></div>
                <select className="sel" value={payMap[r.supplierId]||"Net 30"} onChange={e=>setPayMap(m=>({...m,[r.supplierId]:e.target.value}))}>{PAYMENT_OPTIONS.map(o=><option key={o}>{o}</option>)}</select>
              </div>);
            })}
          </div>
          {preview.length>=2&&(
            <div><label className="lbl">Score Preview</label>
              {preview.map((r,i)=>(
                <div key={r.supplierId} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 13px",background:i===0?"rgba(90,173,122,.05)":"#F7F5F1",border:`1px solid ${i===0?"rgba(90,173,122,.2)":"#E8E4DC"}`,borderRadius:9,marginBottom:5}}>
                  <div style={{textAlign:"center",width:44,flexShrink:0}}><div style={{fontFamily:"Montserrat",fontSize:20,fontWeight:900,color:bc(r.total)}}>{r.total}</div><div style={{fontSize:10}}>{i===0?"🥇":i===1?"🥈":"🥉"}</div></div>
                  <div style={{flex:1}}><div style={{fontSize:12,color:"#2D2D2D",fontWeight:700,marginBottom:5}}>{r.sup?.name}</div>
                    <div style={{display:"flex",gap:6}}>
                      {[["P",r.ps,"#5AAD7A","60%"],["D",r.ds,"#5B9BD5","25%"],["$",r.ws,"#C9A84C","15%"]].map(([l,s,c,w])=>(
                        <div key={l} style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#8A8378",marginBottom:1,fontFamily:"Montserrat",fontWeight:600}}><span>{l}({w})</span><span style={{color:c}}>{s}</span></div><div style={{height:3,background:"#E8E4DC",borderRadius:2}}><div style={{width:`${s}%`,height:"100%",background:c,borderRadius:2}}/></div></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:12,borderTop:"1px solid #E8E4DC"}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={preview.length<2} style={{opacity:preview.length<2?.45:1}} onClick={()=>onSubmit(rfqId,payMap)}>Generate Comparison →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CMPDetail({cmp,sups,reqs,onClose,onApprove}){
  const [override,setOverride]=useState(cmp.winnerId);
  const req=reqs.find(r=>r.id===cmp.poId);
  const bc=s=>s>=80?"#5AAD7A":s>=60?"#A8863A":"#D4745A";
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:900}}>
        <div className="mod-head"><div><div style={{display:"flex",gap:8,marginBottom:6}}><span className="bgold">{cmp.id}</span><span className="bpo">{cmp.poId}</span></div><div style={{fontFamily:"Montserrat",fontSize:15,fontWeight:800,color:"#2D2D2D"}}>{req?.description||req?.items?.[0]?.description||"—"}</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",borderRadius:7,padding:"8px 12px",marginBottom:14,fontSize:12,color:"#A8863A",fontFamily:"Montserrat",fontWeight:600}}>⚖️ Weighting: Price 60% · Delivery 25% · Payment Terms 15%</div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${cmp.scored?.length||1},1fr)`,gap:12,marginBottom:16}}>
          {(cmp.scored||[]).map((r,i)=>{
            const v=sups.find(v=>v.id===r.supplierId); const isWin=override===r.supplierId;
            return(
              <div key={r.supplierId} onClick={()=>cmp.status==="pending"&&setOverride(r.supplierId)} style={{padding:"14px",borderRadius:10,background:isWin?"rgba(90,173,122,.06)":"#F7F5F1",border:`2px solid ${isWin?"#5AAD7A":"#E8E4DC"}`,cursor:cmp.status==="pending"?"pointer":"default",transition:"all .18s"}}>
                <div style={{textAlign:"center",marginBottom:10}}><div style={{fontSize:14,marginBottom:3}}>{i===0?"🥇":i===1?"🥈":"🥉"}</div><div style={{fontFamily:"Montserrat",fontSize:24,fontWeight:900,color:bc(r.total)}}>{r.total}</div><div style={{fontSize:8,color:"#8A8378",fontFamily:"Montserrat",fontWeight:700,letterSpacing:.5}}>TOTAL SCORE</div></div>
                <div style={{textAlign:"center",marginBottom:10}}><div style={{fontSize:12,color:"#2D2D2D",fontWeight:700,fontFamily:"Montserrat"}}>{v?.name}</div></div>
                <div style={{background:"#fff",borderRadius:7,padding:"8px",marginBottom:10,textAlign:"center",border:"1px solid #E8E4DC"}}><div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:900,color:"#2D2D2D"}}>${r.price?.toLocaleString()}</div><div style={{fontSize:10,color:"#8A8378"}}>{r.deliveryDays}d · {r.paymentTerms}</div></div>
                {[["Price",r.ps,"#5AAD7A","60%"],["Delivery",r.ds,"#5B9BD5","25%"],["Payment",r.ws,"#C9A84C","15%"]].map(([l,s,c,w])=>(
                  <div key={l} style={{marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#8A8378",marginBottom:2,fontFamily:"Montserrat",fontWeight:700}}><span>{l} ({w})</span><span style={{color:c}}>{s}/100</span></div><div style={{height:4,background:"#E8E4DC",borderRadius:2}}><div style={{width:`${s}%`,height:"100%",background:c,borderRadius:2}}/></div></div>
                ))}
                {cmp.status==="pending"&&<div style={{textAlign:"center",marginTop:8,fontSize:10,color:isWin?"#5AAD7A":"#8A8378",fontFamily:"Montserrat",fontWeight:700}}>{isWin?"✓ SELECTED":"Click to select"}</div>}
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {cmp.status==="pending"?<button className="btn btn-gold" onClick={()=>onApprove(cmp.id,override)}>✓ Approve & Issue Purchase Order →</button>:<span style={{padding:"8px 16px",background:"rgba(90,173,122,.10)",border:"1px solid rgba(90,173,122,.28)",borderRadius:6,fontSize:12,color:"#5AAD7A",fontFamily:"Montserrat",fontWeight:700}}>✅ Approved</span>}
        </div>
      </div>
    </div>
  );
}
function POPage({ctx}){
  const {reqs,cmps,orders,saveOrders,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyCMPs=cmps.filter(c=>c.status==="approved"&&!orders.find(o=>o.cmpId===c.id));

  const handleCreate=async(data)=>{
    const o={...data,id:data.poNumber,createdAt:new Date().toISOString(),approvalStatus:"pending",sentToSupplier:false};
    await saveOrders([o,...orders]);
    setShowNew(false); showToast(`${o.id} created — pending approval`);
  };

  const handleApprove=async(oId,name)=>{
    const updated=orders.map(o=>o.id===oId?{...o,approvalStatus:"approved",approvedBy:name,approvedAt:new Date().toISOString()}:o);
    const ord=updated.find(o=>o.id===oId);
    const updReqs=reqs.map(r=>r.id===ord?.poId?{...r,stage:"DEL",history:[...(r.history||[]),{stage:"DEL",date:new Date().toISOString(),note:`PO approved by ${name}. Awaiting delivery.`}]}:r);
    await saveOrders(updated); await saveReqs(updReqs);
    if(selected?.id===oId)setSelected(updated.find(o=>o.id===oId));
    showToast(`PO approved by ${name}`);
  };

  const handleSent=async(oId)=>{
    const updated=orders.map(o=>o.id===oId?{...o,sentToSupplier:true,sentAt:new Date().toISOString()}:o);
    await saveOrders(updated);
    if(selected?.id===oId)setSelected(updated.find(o=>o.id===oId));
    showToast("Marked as sent to vendor");
  };

  const stMap={pending:{l:"Pending Approval",c:"#A8863A"},approved:{l:"Approved",c:"#5AAD7A"},rejected:{l:"Rejected",c:"#D4745A"}};

  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">📄 Purchase Orders</div><div className="ph-sub">PO issuance and manager approval workflow</div></div>
        {readyCMPs.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Issue PO</button>}
      </div>
      <div className="pb">
        <div className="gl"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
          {[["Pending Approval",orders.filter(o=>o.approvalStatus==="pending").length,"#A8863A"],["Approved",orders.filter(o=>o.approvalStatus==="approved").length,"#5AAD7A"],["Sent to Vendor",orders.filter(o=>o.sentToSupplier).length,"#5B9BD5"]].map(([l,v,c])=>(
            <div key={l} className="stat" style={{"--sc":c}}><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
          ))}
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SH title="Purchase Orders" action={readyCMPs.length>0&&<span style={{fontSize:11,color:"#D4745A",fontFamily:"Montserrat",fontWeight:700}}>{readyCMPs.length} ready to issue</span>}/>
          {orders.length===0?<Empty icon="📄" msg="No purchase orders" sub={readyCMPs.length>0?"Issue your first PO":"Approve a comparison first"}/>:
          orders.map(o=>{
            const req=reqs.find(r=>r.id===o.poId); const sup=sups.find(s=>s.id===o.supplierId); const st=stMap[o.approvalStatus]||stMap.pending;
            return(
              <div key={o.id} className="trow" onClick={()=>setSelected(o)}>
                <span className="bpo">{o.id}</span>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description||req?.items?.[0]?.description||"—"}</div><div style={{fontSize:11,color:"#8A8378"}}>{sup?.name} · ${parseFloat(o.totalAmount||0).toLocaleString()} · {o.paymentTerms}</div></div>
                {o.sentToSupplier&&<span className="chip" style={{background:"rgba(91,155,213,.12)",color:"#5B9BD5",border:"1px solid rgba(91,155,213,.28)"}}>📬 Sent</span>}
                <span className="chip" style={{background:`${st.c}15`,color:st.c,border:`1px solid ${st.c}30`}}>● {st.l}</span>
                <span style={{color:"#C8C2B4",fontSize:13}}>›</span>
              </div>
            );
          })}
        </div>
      </div>
      {showNew&&<POForm readyCMPs={readyCMPs} cmps={cmps} reqs={reqs} sups={sups} onClose={()=>setShowNew(false)} onSubmit={handleCreate}/>}
      {selected&&<PODetail order={selected} reqs={reqs} sups={sups} onClose={()=>setSelected(null)} onApprove={handleApprove} onSent={handleSent}/>}
    </div>
  );
}

function POForm({readyCMPs,cmps,reqs,sups,onClose,onSubmit}){
  const [cmpId,setCmpId]=useState(readyCMPs[0]?.id||"");
  const [f,setF]=useState({deliveryAddress:"",paymentTerms:"",contactName:"",contactEmail:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const cmp=cmps.find(c=>c.id===cmpId); const req=reqs.find(r=>r.id===cmp?.poId); const sup=sups.find(s=>s.id===cmp?.winnerId);
  const win=cmp?.scored?.find(s=>s.supplierId===cmp.winnerId);
  const total=win&&req?parseFloat(req.quantity||1)*parseFloat(win.price||0):0;
  const valid=cmpId&&f.deliveryAddress&&f.paymentTerms&&f.contactName;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:660}}>
        <div className="mod-head"><div><div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:800,color:"#2D2D2D"}}>Issue Purchase Order</div><div style={{fontSize:11,color:"#8A8378",marginTop:2}}>Data loaded from approved comparison</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">Approved Comparison</label><select className="sel" value={cmpId} onChange={e=>setCmpId(e.target.value)}>{readyCMPs.map(c=>{const r=reqs.find(r=>r.id===c.poId);return<option key={c.id} value={c.id}>{c.id} · {(r?.description||r?.items?.[0]?.description||c.id).slice(0,42)}</option>;})}</select></div>
          {cmp&&<div style={{background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",borderRadius:8,padding:"11px 14px"}}>
            <div style={{fontSize:10,color:"#A8863A",fontFamily:"Montserrat",fontWeight:700,letterSpacing:1,marginBottom:8}}>AUTO-LOADED FROM COMPARISON</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>{[["PO Number",req?.id],["Vendor",sup?.name],["Total",`$${total.toLocaleString()}`]].map(([k,v])=><div key={k}><div style={{fontSize:9,color:"#A8863A",fontFamily:"Montserrat",fontWeight:700,marginBottom:2}}>{k.toUpperCase()}</div><div style={{fontSize:13,color:"#2D2D2D",fontWeight:700}}>{v}</div></div>)}</div>
          </div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{gridColumn:"1/-1"}}><label className="lbl">Delivery Address *</label><input className="inp" value={f.deliveryAddress} onChange={e=>set("deliveryAddress",e.target.value)} placeholder="Street, City, State, ZIP"/></div>
            <div><label className="lbl">Payment Terms *</label><input className="inp" value={f.paymentTerms} onChange={e=>set("paymentTerms",e.target.value)} placeholder="Net 30, COD..."/></div>
            <div><label className="lbl">Vendor Contact *</label><input className="inp" value={f.contactName} onChange={e=>set("contactName",e.target.value)}/></div>
            <div><label className="lbl">Contact Email</label><input className="inp" type="email" value={f.contactEmail} onChange={e=>set("contactEmail",e.target.value)}/></div>
            <div><label className="lbl">Notes</label><input className="inp" value={f.notes} onChange={e=>set("notes",e.target.value)}/></div>
          </div>
          <div style={{padding:"9px 12px",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.25)",borderRadius:7,fontSize:12,color:"#A8863A",fontFamily:"Montserrat",fontWeight:600}}>⚠️ PO will be Pending Approval until a manager approves it.</div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:12,borderTop:"1px solid #E8E4DC"}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:.45}} onClick={()=>onSubmit({poNumber:req?.id,poId:req?.id,cmpId,supplierId:cmp?.winnerId,description:req?.description,quantity:req?.quantity,unit:req?.unit,unitPrice:win?.price,totalAmount:total.toFixed(2),deliveryDays:win?.deliveryDays,...f})}>Create PO →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PODetail({order,reqs,sups,onClose,onApprove,onSent}){
  const [approver,setApprover]=useState("");
  const req=reqs.find(r=>r.id===order.poId); const sup=sups.find(s=>s.id===order.supplierId);
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:660}}>
        <div className="mod-head"><div><span className="bpo">{order.id}</span><div style={{fontFamily:"Montserrat",fontSize:15,fontWeight:800,color:"#2D2D2D",marginTop:6}}>{req?.description||req?.items?.[0]?.description||"—"}</div><div style={{fontSize:11,color:"#8A8378",marginTop:1}}>{sup?.name} · ${parseFloat(order.totalAmount||0).toLocaleString()}</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="card" style={{padding:"12px 14px",marginBottom:12}}><ProgressBar stage={req?.stage||"PO"}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {[["Vendor",sup?.name],["Contact",order.contactName],["Payment Terms",order.paymentTerms],["Lead Days",`${order.deliveryDays||"—"} business days`],["Delivery Address",order.deliveryAddress],["Total PO",`$${parseFloat(order.totalAmount||0).toLocaleString()}`]].map(([k,v])=>(
            <div key={k} style={{background:"#F7F5F1",borderRadius:7,padding:"8px 12px",border:"1px solid #E8E4DC"}}><div style={{fontSize:9,color:"#8A8378",fontFamily:"Montserrat",fontWeight:700,letterSpacing:.5,marginBottom:2}}>{k.toUpperCase()}</div><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{v||"—"}</div></div>
          ))}
        </div>
        {order.approvalStatus==="pending"&&(
          <div style={{background:"#F7F5F1",border:"1px solid #E8E4DC",borderRadius:9,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:11,color:"#8A8378",marginBottom:8,fontFamily:"Montserrat",fontWeight:600}}>MANAGER APPROVAL REQUIRED</div>
            <div style={{display:"flex",gap:8}}><input className="inp" placeholder="Approver name" value={approver} onChange={e=>setApprover(e.target.value)} style={{flex:1}}/><button className="btn btn-success" disabled={!approver} style={{opacity:approver?1:.45}} onClick={()=>onApprove(order.id,approver)}>✓ Approve PO</button></div>
          </div>
        )}
        {order.approvalStatus==="approved"&&!order.sentToSupplier&&<div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><button className="btn btn-gold" onClick={()=>onSent(order.id)}>📬 Mark as Sent to Vendor →</button></div>}
        {order.approvalStatus==="approved"&&<div style={{padding:"9px 12px",background:"rgba(90,173,122,.08)",border:"1px solid rgba(90,173,122,.25)",borderRadius:7,fontSize:12,color:"#5AAD7A",fontFamily:"Montserrat",fontWeight:600}}>✅ Approved by {order.approvedBy}{order.sentToSupplier?" · 📬 Sent to vendor":""}</div>}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}
function DELPage({ctx}){
  const {reqs,orders,dels,saveDels,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyOrders=orders.filter(o=>o.approvalStatus==="approved"&&!dels.find(d=>d.orderId===o.id));

  const handleCreate=async(data)=>{
    const d={...data,id:genId("DEL",dels.length+1),createdAt:new Date().toISOString(),status:"in_transit",
      partials:data.partials.map((p,i)=>({...p,id:`P${i+1}`,received:false,receivedAt:null,receivedQty:0})),
      events:[{date:new Date().toISOString(),note:"Delivery plan registered",icon:"📋"}]};
    await saveDels([d,...dels]);
    setShowNew(false); showToast(`${d.id} registered`);
  };

  const handlePartial=async(delId,partialId,qty,note)=>{
    const updated=dels.map(d=>{
      if(d.id!==delId)return d;
      const partials=d.partials.map(p=>p.id===partialId?{...p,received:true,receivedAt:new Date().toISOString(),receivedQty:qty}:p);
      const allDone=partials.every(p=>p.received); const anyDone=partials.some(p=>p.received);
      return{...d,partials,status:allDone?"completed":anyDone?"partial":"in_transit",events:[...d.events,{date:new Date().toISOString(),note:note||`Partial ${partialId} received`,icon:"📦"}]};
    });
    const del=updated.find(d=>d.id===delId);
    if(del?.status==="completed"){
      const updReqs=reqs.map(r=>r.id===del.poId?{...r,stage:"RCV",history:[...(r.history||[]),{stage:"RCV",date:new Date().toISOString(),note:`Delivery ${delId} completed. Ready for receipt.`}]}:r);
      await saveReqs(updReqs);
    }
    await saveDels(updated);
    if(selected?.id===delId)setSelected(updated.find(d=>d.id===delId));
    showToast(del?.status==="completed"?"Delivery complete → Receipt":"Partial received");
  };

  const stC={in_transit:"#4AADA0",partial:"#A8863A",completed:"#5AAD7A",delayed:"#D4745A"};
  const stL={in_transit:"In Transit",partial:"Partial",completed:"Completed",delayed:"Delayed"};

  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">🚚 Delivery</div><div className="ph-sub">Delivery planning, tracking and alerts</div></div>
        {readyOrders.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Register Delivery</button>}
      </div>
      <div className="pb">
        <div className="gl"/>
        {dels.filter(d=>d.status!=="completed"&&(d.status==="delayed"||daysUntil(d.expectedDate)<=3)).map(d=>{
          const days=daysUntil(d.expectedDate); const req=reqs.find(r=>r.id===d.poId);
          return(<div key={d.id} onClick={()=>setSelected(d)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(212,116,90,.06)",border:"1px solid rgba(212,116,90,.2)",borderRadius:8,marginBottom:8,cursor:"pointer",fontSize:12}}>
            <span>🔴</span><span style={{color:"#D4745A",fontWeight:600,flex:1,fontFamily:"Montserrat"}}>{(req?.description||req?.items?.[0]?.description||"").slice(0,50)} — {d.status==="delayed"?"Delay reported":days<0?`${Math.abs(days)}d overdue`:days===0?"Due today":`${days}d until delivery`}</span>
            <span style={{fontSize:11,color:"#8A8378"}}>View →</span>
          </div>);
        })}
        <div className="card" style={{overflow:"hidden"}}>
          <SH title="Delivery Tracking" action={readyOrders.length>0&&<span style={{fontSize:11,color:"#4AADA0",fontFamily:"Montserrat",fontWeight:700}}>{readyOrders.length} PO ready to plan</span>}/>
          {dels.length===0?<Empty icon="🚚" msg="No deliveries" sub={readyOrders.length>0?"Register your first delivery plan":"Approve and send a PO first"}/>:
          dels.map(d=>{
            const req=reqs.find(r=>r.id===d.poId); const sup=sups.find(s=>s.id===d.supplierId);
            const rec=d.partials.reduce((a,p)=>a+(p.received?parseFloat(p.qty||0):0),0);
            const tot=d.partials.reduce((a,p)=>a+parseFloat(p.qty||0),0);
            const days=daysUntil(d.expectedDate);
            return(
              <div key={d.id} className="trow" onClick={()=>setSelected(d)}>
                <div style={{width:42,height:42,borderRadius:8,background:`${stC[d.status]||"#4AADA0"}10`,border:`1px solid ${stC[d.status]||"#4AADA0"}30`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Montserrat",fontSize:11,fontWeight:800,color:stC[d.status]||"#4AADA0",flexShrink:0}}>{tot>0?`${Math.round(rec/tot*100)}%`:"0%"}</div>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description||req?.items?.[0]?.description||"—"}</div><div style={{fontSize:11,color:"#8A8378"}}>{sup?.name}</div></div>
                <div style={{textAlign:"right",fontSize:11,fontFamily:"Montserrat",fontWeight:700,color:days<0?"#D4745A":days<=3?"#D4745A":days<=7?"#A8863A":"#5AAD7A"}}>{days<0?`${Math.abs(days)}d late`:days===0?"Today":`${days}d`}</div>
                <span className="chip" style={{background:`${stC[d.status]||"#4AADA0"}12`,color:stC[d.status]||"#4AADA0"}}>● {stL[d.status]||d.status}</span>
                <span style={{color:"#C8C2B4",fontSize:13}}>›</span>
              </div>
            );
          })}
        </div>
      </div>
      {showNew&&<DELForm orders={readyOrders} reqs={reqs} sups={sups} onClose={()=>setShowNew(false)} onSubmit={handleCreate}/>}
      {selected&&<DELDetail del={selected} reqs={reqs} sups={sups} onClose={()=>setSelected(null)} onPartial={handlePartial}/>}
    </div>
  );
}

function DELForm({orders,reqs,sups,onClose,onSubmit}){
  const [orderId,setOrderId]=useState(orders[0]?.id||"");
  const [f,setF]=useState({expectedDate:"",logisticsType:"delivery",trackingNumber:"",notes:""});
  const [partials,setPartials]=useState([{qty:"",expectedDate:"",note:""}]);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const order=orders.find(o=>o.id===orderId);
  const valid=orderId&&f.expectedDate&&partials.every(p=>p.qty&&p.expectedDate);
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:800,color:"#2D2D2D"}}>Register Delivery Plan</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">Purchase Order</label><select className="sel" value={orderId} onChange={e=>setOrderId(e.target.value)}>{orders.map(o=>{const r=reqs.find(r=>r.id===o.poId);return<option key={o.id} value={o.id}>{o.id} · {(r?.description||r?.items?.[0]?.description||o.id).slice(0,40)}</option>;})}</select></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><label className="lbl">Expected Date *</label><input className="inp" type="date" value={f.expectedDate} onChange={e=>set("expectedDate",e.target.value)}/></div>
            <div><label className="lbl">Logistics</label><select className="sel" value={f.logisticsType} onChange={e=>set("logisticsType",e.target.value)}><option value="delivery">🚚 Vendor delivers</option><option value="pickup">🏭 We pick up</option></select></div>
            <div><label className="lbl">Tracking # (opt)</label><input className="inp" value={f.trackingNumber} onChange={e=>set("trackingNumber",e.target.value)} placeholder="Optional"/></div>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><label className="lbl" style={{margin:0}}>Partial Deliveries *</label><button onClick={()=>setPartials(p=>[...p,{qty:"",expectedDate:"",note:""}])} style={{fontSize:11,color:"#C9A84C",fontWeight:700,background:"none",border:"none",cursor:"pointer",fontFamily:"Montserrat"}}>+ Add</button></div>
            {partials.map((p,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr auto",gap:8,marginBottom:6,alignItems:"end"}}>
                <div>{i===0&&<label className="lbl">Qty *</label>}<input className="inp" type="number" placeholder="0" value={p.qty} onChange={e=>setPartials(ps=>ps.map((x,j)=>j===i?{...x,qty:e.target.value}:x))}/></div>
                <div>{i===0&&<label className="lbl">Date *</label>}<input className="inp" type="date" value={p.expectedDate} onChange={e=>setPartials(ps=>ps.map((x,j)=>j===i?{...x,expectedDate:e.target.value}:x))}/></div>
                <div>{i===0&&<label className="lbl">Note</label>}<input className="inp" placeholder={`Delivery ${i+1}`} value={p.note} onChange={e=>setPartials(ps=>ps.map((x,j)=>j===i?{...x,note:e.target.value}:x))}/></div>
                <button onClick={()=>setPartials(ps=>ps.filter((_,j)=>j!==i))} disabled={partials.length===1} style={{background:"none",border:"none",cursor:"pointer",color:"#D4745A",fontSize:14,opacity:partials.length===1?.3:1,paddingBottom:i===0?8:0}}>✕</button>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:12,borderTop:"1px solid #E8E4DC"}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:.45}} onClick={()=>onSubmit({orderId,poId:order?.poId,supplierId:order?.supplierId,...f,partials})}>Register Plan →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DELDetail({del,reqs,sups,onClose,onPartial}){
  const [recId,setRecId]=useState(null);
  const [rq,setRq]=useState({qty:"",note:""});
  const req=reqs.find(r=>r.id===del.poId); const sup=sups.find(s=>s.id===del.supplierId);
  const rec=del.partials.reduce((a,p)=>a+(p.received?parseFloat(p.qty||0):0),0);
  const tot=del.partials.reduce((a,p)=>a+parseFloat(p.qty||0),0);
  const stC={in_transit:"#4AADA0",partial:"#A8863A",completed:"#5AAD7A",delayed:"#D4745A"};
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:700}}>
        <div className="mod-head">
          <div><div style={{display:"flex",gap:8,marginBottom:6}}><span className="bgold">{del.id}</span><span className="bpo">{del.orderId}</span><span className="chip" style={{background:`${stC[del.status]||"#4AADA0"}12`,color:stC[del.status]||"#4AADA0"}}>● {del.status}</span></div><div style={{fontFamily:"Montserrat",fontSize:14,fontWeight:800,color:"#2D2D2D"}}>{req?.description||req?.items?.[0]?.description||"—"}</div><div style={{fontSize:11,color:"#8A8378",marginTop:1}}>{sup?.name} · {rec}/{tot} units received</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{height:7,background:"#E8E4DC",borderRadius:4,overflow:"hidden",marginBottom:14}}><div style={{width:`${tot?rec/tot*100:0}%`,height:"100%",background:stC[del.status]||"#4AADA0",borderRadius:4,transition:"width .4s"}}/></div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
          {del.partials.map(p=>(
            <div key={p.id}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:p.received?"rgba(90,173,122,.06)":"#F7F5F1",border:`1px solid ${p.received?"rgba(90,173,122,.25)":"#E8E4DC"}`,borderRadius:8}}>
                <div style={{width:22,height:22,borderRadius:6,background:p.received?"#5AAD7A":"#E8E4DC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:p.received?"#fff":"#8A8378",fontWeight:700,fontFamily:"Montserrat",flexShrink:0}}>{p.received?"✓":p.id}</div>
                <div style={{flex:1}}><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{p.qty} units · {p.note||new Date(p.expectedDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div></div>
                {!p.received&&del.status!=="completed"&&<button className="btn btn-dark btn-sm" onClick={()=>{setRecId(p.id);setRq({qty:String(p.qty),note:""});}}>Confirm</button>}
                {p.received&&<span style={{fontSize:10,color:"#5AAD7A",fontFamily:"Montserrat",fontWeight:700}}>Received {new Date(p.receivedAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>}
              </div>
              {recId===p.id&&(
                <div style={{margin:"4px 0 4px 32px",padding:"10px 12px",background:"rgba(74,173,160,.06)",border:"1px solid rgba(74,173,160,.2)",borderRadius:8}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 2fr auto auto",gap:8,alignItems:"end"}}>
                    <div><label className="lbl">Actual Qty</label><input className="inp" type="number" value={rq.qty} onChange={e=>setRq(r=>({...r,qty:e.target.value}))}/></div>
                    <div><label className="lbl">Note</label><input className="inp" value={rq.note} onChange={e=>setRq(r=>({...r,note:e.target.value}))} placeholder="All good..."/></div>
                    <button className="btn btn-gold btn-sm" style={{alignSelf:"flex-end"}} onClick={()=>{onPartial(del.id,p.id,parseInt(rq.qty),rq.note);setRecId(null);}}>✓</button>
                    <button className="btn btn-ghost btn-sm" style={{alignSelf:"flex-end"}} onClick={()=>setRecId(null)}>✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{marginBottom:12}}>{[...del.events].reverse().map((ev,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"center",fontSize:11,color:"#8A8378",marginBottom:3}}><span style={{fontSize:12}}>{ev.icon}</span><span style={{color:"#5A5550",flex:1}}>{ev.note}</span><span>{new Date(ev.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span></div>))}</div>
        <div style={{display:"flex",justifyContent:"flex-end"}}><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}
function RCVPage({ctx}){
  const {reqs,orders,dels,rcvs,saveRcvs,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyDels=dels.filter(d=>(d.status==="completed"||d.status==="partial")&&!rcvs.find(r=>r.deliveryId===d.id));

  const handleCreate=async(data)=>{
    const gr={...data,id:genId("GR",rcvs.length+1),createdAt:new Date().toISOString()};
    const updRcvs=[gr,...rcvs];
    const updReqs=reqs.map(r=>r.id===gr.poId?{...r,stage:"PAY",history:[...(r.history||[]),{stage:"PAY",date:new Date().toISOString(),note:`GR ${gr.id} issued. ${gr.result==="compliant"?"Compliant ✅":"Non-compliant ⚠️"}. Ready for payment.`}]}:r);
    await saveRcvs(updRcvs); await saveReqs(updReqs);
    setShowNew(false); showToast(`${gr.id} issued`,gr.result==="compliant"?"✅":"⚠️");
  };

  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">✅ Goods Receipt (GR)</div><div className="ph-sub">Inspection checklist and receipt note</div></div>
        {readyDels.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ New GR</button>}
      </div>
      <div className="pb">
        <div className="gl"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
          {[["Total GRs",rcvs.length,"#9B7DC8"],["Compliant",rcvs.filter(r=>r.result==="compliant").length,"#5AAD7A"],["Non-Compliant",rcvs.filter(r=>r.result==="non_compliant").length,"#D4745A"]].map(([l,v,c])=>(
            <div key={l} className="stat" style={{"--sc":c}}><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
          ))}
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SH title="Receipt Notes" action={readyDels.length>0&&<span style={{fontSize:11,color:"#9B7DC8",fontFamily:"Montserrat",fontWeight:700}}>{readyDels.length} delivery ready</span>}/>
          {rcvs.length===0?<Empty icon="✅" msg="No receipt notes" sub={readyDels.length>0?"Verify pending deliveries":"Complete a delivery first"}/>:
          rcvs.map(gr=>{
            const req=reqs.find(r=>r.id===gr.poId); const sup=sups.find(s=>s.id===gr.supplierId); const isOk=gr.result==="compliant";
            return(
              <div key={gr.id} className="trow" onClick={()=>setSelected(gr)}>
                <div style={{width:34,height:34,borderRadius:7,background:isOk?"rgba(90,173,122,.10)":"rgba(212,116,90,.10)",border:`1px solid ${isOk?"rgba(90,173,122,.28)":"rgba(212,116,90,.28)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{isOk?"✅":"⚠️"}</div>
                <div style={{display:"flex",flexDirection:"column",gap:2}}><span className="bgold">{gr.id}</span><span className="bpo" style={{fontSize:9,padding:"1px 6px"}}>{gr.poId}</span></div>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description||req?.items?.[0]?.description||"—"}</div><div style={{fontSize:11,color:"#8A8378"}}>{sup?.name} · {gr.receivedBy}</div></div>
                <span className="chip" style={{background:isOk?"rgba(90,173,122,.12)":"rgba(212,116,90,.12)",color:isOk?"#5AAD7A":"#D4745A",border:`1px solid ${isOk?"rgba(90,173,122,.28)":"rgba(212,116,90,.28)"}`}}>{isOk?"✓ Compliant":"⚠ Non-Compliant"}</span>
                <span style={{color:"#C8C2B4",fontSize:13}}>›</span>
              </div>
            );
          })}
        </div>
      </div>
      {showNew&&<GRForm deliveries={readyDels} reqs={reqs} orders={orders} sups={sups} onClose={()=>setShowNew(false)} onSubmit={handleCreate}/>}
      {selected&&<GRDetail gr={selected} reqs={reqs} sups={sups} onClose={()=>setSelected(null)}/>}
    </div>
  );
}

function GRForm({deliveries,reqs,orders,sups,onClose,onSubmit}){
  const [delId,setDelId]=useState(deliveries[0]?.id||"");
  const [checks,setChecks]=useState({});
  const [f,setF]=useState({receivedBy:"",receivedQty:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const del=deliveries.find(d=>d.id===delId); const req=reqs.find(r=>r.id===del?.poId);
  const toggle=(id,val)=>setChecks(c=>({...c,[id]:c[id]===val?null:val}));
  const allChecked=CHECKLIST_ITEMS.every(i=>checks[i.id]!==undefined&&checks[i.id]!==null);
  const anyFailed=CHECKLIST_ITEMS.some(i=>checks[i.id]===false);
  const result=anyFailed?"non_compliant":"compliant";
  const valid=allChecked&&f.receivedBy&&f.receivedQty;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div><div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:800,color:"#2D2D2D"}}>New Goods Receipt (GR)</div><div style={{fontSize:11,color:"#8A8378",marginTop:2}}>Verification against Purchase Order</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">Delivery to verify</label><select className="sel" value={delId} onChange={e=>setDelId(e.target.value)}>{deliveries.map(d=>{const r=reqs.find(r=>r.id===d.poId);return<option key={d.id} value={d.id}>{d.id} · {(r?.description||r?.items?.[0]?.description||d.id).slice(0,42)}</option>;})}</select></div>
          <div>
            <label className="lbl">Verification Checklist</label>
            {CHECKLIST_ITEMS.map(item=>{const val=checks[item.id];return(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 13px",borderRadius:8,border:`1.5px solid ${val===true?"rgba(90,173,122,.35)":val===false?"rgba(212,116,90,.35)":"#E8E4DC"}`,background:val===true?"rgba(90,173,122,.05)":val===false?"rgba(212,116,90,.05)":"#F7F5F1",marginBottom:5}}>
                <span style={{flex:1,fontSize:12,color:"#2D2D2D",fontWeight:500}}>{item.label}</span>
                <button onClick={()=>toggle(item.id,true)} style={{width:28,height:28,borderRadius:6,border:`1.5px solid ${val===true?"#5AAD7A":"#E8E4DC"}`,background:val===true?"#5AAD7A":"#fff",color:val===true?"#fff":"#8A8378",cursor:"pointer",fontSize:13,fontWeight:700,transition:"all .15s"}}>✓</button>
                <button onClick={()=>toggle(item.id,false)} style={{width:28,height:28,borderRadius:6,border:`1.5px solid ${val===false?"#D4745A":"#E8E4DC"}`,background:val===false?"#D4745A":"#fff",color:val===false?"#fff":"#8A8378",cursor:"pointer",fontSize:13,fontWeight:700,transition:"all .15s"}}>✕</button>
              </div>);})}
            {allChecked&&<div style={{padding:"9px 13px",borderRadius:8,background:result==="compliant"?"rgba(90,173,122,.08)":"rgba(212,116,90,.08)",border:`1px solid ${result==="compliant"?"rgba(90,173,122,.25)":"rgba(212,116,90,.25)"}`,fontSize:12,color:result==="compliant"?"#5AAD7A":"#D4745A",fontFamily:"Montserrat",fontWeight:700,marginTop:6}}>{result==="compliant"?"✅ COMPLIANT — GR will proceed to Payment":"⚠️ NON-COMPLIANT — Discrepancies will be recorded"}</div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label className="lbl">Received By *</label><input className="inp" value={f.receivedBy} onChange={e=>set("receivedBy",e.target.value)} placeholder="Receiver name"/></div>
            <div><label className="lbl">Actual Qty Received *</label><input className="inp" type="number" value={f.receivedQty} onChange={e=>set("receivedQty",e.target.value)}/></div>
          </div>
          <div><label className="lbl">General Observations</label><textarea className="ta" value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Delivery conditions, packaging, etc."/></div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:12,borderTop:"1px solid #E8E4DC"}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:.45}} onClick={()=>onSubmit({deliveryId:delId,orderId:del?.orderId,poId:del?.poId,supplierId:del?.supplierId,checklist:checks,result,...f})}>Issue Receipt Note →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GRDetail({gr,reqs,sups,onClose}){
  const req=reqs.find(r=>r.id===gr.poId); const sup=sups.find(s=>s.id===gr.supplierId); const isOk=gr.result==="compliant";
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:640}}>
        <div className="mod-head"><div><div style={{display:"flex",gap:8,marginBottom:6}}><span className="bgold">{gr.id}</span><span className="bpo">{gr.poId}</span><span className="chip" style={{background:isOk?"rgba(90,173,122,.12)":"rgba(212,116,90,.12)",color:isOk?"#5AAD7A":"#D4745A",border:`1px solid ${isOk?"rgba(90,173,122,.28)":"rgba(212,116,90,.28)"}`}}>{isOk?"✓ Compliant":"⚠ Non-Compliant"}</span></div><div style={{fontFamily:"Montserrat",fontSize:14,fontWeight:800,color:"#2D2D2D"}}>{req?.description||req?.items?.[0]?.description||"—"}</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        {CHECKLIST_ITEMS.map(item=>{const val=gr.checklist?.[item.id];return(<div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:val===true?"rgba(90,173,122,.05)":"rgba(212,116,90,.05)",border:`1px solid ${val===true?"rgba(90,173,122,.2)":"rgba(212,116,90,.2)"}`,borderRadius:7,marginBottom:4}}><span style={{fontSize:14}}>{val===true?"✅":"❌"}</span><span style={{fontSize:12,color:"#2D2D2D",fontWeight:500}}>{item.label}</span></div>);})}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
          {[["Received By",gr.receivedBy],["Qty Received",`${gr.receivedQty} units`],["Vendor",sup?.name],["Observations",gr.notes||"—"]].map(([k,v])=>(
            <div key={k} style={{background:"#F7F5F1",borderRadius:7,padding:"8px 12px",border:"1px solid #E8E4DC"}}><div style={{fontSize:9,color:"#8A8378",fontFamily:"Montserrat",fontWeight:700,letterSpacing:.5,marginBottom:2}}>{k.toUpperCase()}</div><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{v}</div></div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}
function PAYPage({ctx}){
  const {reqs,orders,rcvs,pays,savePays,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyRcvs=rcvs.filter(r=>!pays.find(p=>p.grId===r.id));
  const handleCreate=async(data)=>{
    const p={...data,id:genId("PAY",pays.length+1),createdAt:new Date().toISOString(),status:"ready"};
    await savePays([p,...pays]);
    setShowNew(false); showToast(`${p.id} ready for payment`);
  };
  const handlePaid=async(payId)=>{
    const updated=pays.map(p=>p.id===payId?{...p,status:"paid",paidAt:new Date().toISOString()}:p);
    await savePays(updated);
    if(selected?.id===payId)setSelected(updated.find(p=>p.id===payId));
    showToast("Process complete! 🎉","🎉");
  };
  const totalPaid=pays.filter(p=>p.status==="paid").reduce((a,p)=>a+parseFloat(p.invoiceAmount||0),0);
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">💳 Payment Preparation</div><div className="ph-sub">3-Way Match · Package for Accounts Payable</div></div>
        {readyRcvs.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Prepare Payment</button>}
      </div>
      <div className="pb">
        <div className="gl"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
          {[["Ready to Pay",pays.filter(p=>p.status==="ready").length,"#5B9BD5"],["Paid",pays.filter(p=>p.status==="paid").length,"#5AAD7A"],["Total Paid",`$${fmt(totalPaid)}`,"#A8863A"]].map(([l,v,c])=>(
            <div key={l} className="stat" style={{"--sc":c}}><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
          ))}
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SH title="Payment Packages" action={readyRcvs.length>0&&<span style={{fontSize:11,color:"#5AAD7A",fontFamily:"Montserrat",fontWeight:700}}>{readyRcvs.length} GR ready</span>}/>
          {pays.length===0?<Empty icon="💳" msg="No payment packages" sub={readyRcvs.length>0?"Prepare your first payment":"Issue a receipt note first"}/>:
          pays.map(p=>{
            const req=reqs.find(r=>r.id===p.poId); const sup=sups.find(s=>s.id===p.supplierId); const isPaid=p.status==="paid";
            return(
              <div key={p.id} className="trow" onClick={()=>setSelected(p)}>
                <div style={{display:"flex",flexDirection:"column",gap:2}}><span style={{fontFamily:"Montserrat",fontSize:10,fontWeight:700,color:"#5AAD7A"}}>{p.id}</span><span className="bpo" style={{fontSize:9,padding:"1px 6px"}}>{p.poId}</span></div>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description||req?.items?.[0]?.description||"—"}</div><div style={{fontSize:11,color:"#8A8378"}}>{sup?.name} · Inv: {p.invoiceNumber} · ${parseFloat(p.invoiceAmount||0).toLocaleString()}</div></div>
                <span className="chip" style={{background:p.matchResult?"rgba(90,173,122,.12)":"rgba(201,168,76,.10)",color:p.matchResult?"#5AAD7A":"#A8863A",border:`1px solid ${p.matchResult?"rgba(90,173,122,.28)":"rgba(201,168,76,.28)"}`}}>{p.matchResult?"✅ Match OK":"⚠️ Diff."}</span>
                <span className="chip" style={{background:isPaid?"rgba(90,173,122,.12)":"rgba(91,155,213,.12)",color:isPaid?"#5AAD7A":"#5B9BD5",border:`1px solid ${isPaid?"rgba(90,173,122,.28)":"rgba(91,155,213,.28)"}`}}>{isPaid?"✓ Paid":"📤 Ready"}</span>
                <span style={{color:"#C8C2B4",fontSize:13}}>›</span>
              </div>
            );
          })}
        </div>
      </div>
      {showNew&&<PAYForm rcvs={readyRcvs} orders={orders} reqs={reqs} sups={sups} onClose={()=>setShowNew(false)} onSubmit={handleCreate}/>}
      {selected&&<PAYDetail pay={selected} reqs={reqs} sups={sups} orders={orders} rcvs={rcvs} onClose={()=>setSelected(null)} onPaid={handlePaid}/>}
    </div>
  );
}

function PAYForm({rcvs,orders,reqs,sups,onClose,onSubmit}){
  const [grId,setGrId]=useState(rcvs[0]?.id||"");
  const [f,setF]=useState({invoiceNumber:"",invoiceAmount:"",invoiceDate:"",paymentMethod:PAY_METHODS[0],dueDate:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const gr=rcvs.find(r=>r.id===grId); const order=orders.find(o=>o.id===gr?.orderId); const req=reqs.find(r=>r.id===gr?.poId); const sup=sups.find(s=>s.id===gr?.supplierId);
  const poAmt=parseFloat(order?.totalAmount||0); const inv=parseFloat(f.invoiceAmount||0);
  const grQty=parseFloat(gr?.receivedQty||0); const poQty=parseFloat(req?.quantity||0);
  const qtyOk=poQty>0?Math.abs(grQty-poQty)/poQty<=0.05:true;
  const priceOk=poAmt>0&&inv>0?Math.abs(inv-poAmt)/poAmt<=0.02:false;
  const grOk=gr?.result==="compliant";
  const matchOk=qtyOk&&priceOk&&grOk;
  const valid=grId&&f.invoiceNumber&&f.invoiceAmount&&f.invoiceDate;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div><div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:800,color:"#2D2D2D"}}>Prepare Payment Package</div><div style={{fontSize:11,color:"#8A8378",marginTop:2}}>3-Way Match: PO + GR + Invoice</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">Receipt Note (GR)</label><select className="sel" value={grId} onChange={e=>setGrId(e.target.value)}>{rcvs.map(r=>{const req=reqs.find(req=>req.id===r.poId);return<option key={r.id} value={r.id}>{r.id} · {(req?.description||req?.items?.[0]?.description||r.id).slice(0,42)}</option>;})}</select></div>
          {gr&&<div style={{background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",borderRadius:8,padding:"11px 14px"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>{[["Vendor",sup?.name],["PO Amount",`$${poAmt.toLocaleString()}`],["GR",gr.result==="compliant"?"✅ Compliant":"⚠️ Non-compliant"]].map(([k,v])=><div key={k}><div style={{fontSize:9,color:"#A8863A",fontFamily:"Montserrat",fontWeight:700,marginBottom:2}}>{k.toUpperCase()}</div><div style={{fontSize:12,color:"#2D2D2D",fontWeight:700}}>{v}</div></div>)}</div></div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label className="lbl">Invoice Number *</label><input className="inp" value={f.invoiceNumber} onChange={e=>set("invoiceNumber",e.target.value)} placeholder="INV-2026-XXXX"/></div>
            <div><label className="lbl">Invoice Amount *</label><input className="inp" type="number" value={f.invoiceAmount} onChange={e=>set("invoiceAmount",e.target.value)}/></div>
            <div><label className="lbl">Invoice Date *</label><input className="inp" type="date" value={f.invoiceDate} onChange={e=>set("invoiceDate",e.target.value)}/></div>
            <div><label className="lbl">Payment Due Date</label><input className="inp" type="date" value={f.dueDate} onChange={e=>set("dueDate",e.target.value)}/></div>
            <div><label className="lbl">Payment Method</label><select className="sel" value={f.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)}>{PAY_METHODS.map(m=><option key={m}>{m}</option>)}</select></div>
            <div><label className="lbl">Notes for AP</label><input className="inp" value={f.notes} onChange={e=>set("notes",e.target.value)}/></div>
          </div>
          {f.invoiceAmount&&(<div style={{padding:"12px 14px",background:matchOk?"rgba(90,173,122,.06)":"rgba(201,168,76,.06)",border:`1px solid ${matchOk?"rgba(90,173,122,.25)":"rgba(201,168,76,.28)"}`,borderRadius:9}}>
            <div style={{fontFamily:"Montserrat",fontSize:13,fontWeight:800,color:matchOk?"#5AAD7A":"#A8863A",marginBottom:8}}>{matchOk?"✅ 3-Way Match approved":"⚠️ Match has differences"}</div>
            <div style={{display:"flex",gap:8}}>
              {[["Quantities",qtyOk,"±5%"],["Amounts",priceOk,"±2%"],["GR OK",grOk,""]].map(([l,ok,sub])=>(
                <div key={l} style={{flex:1,padding:"7px 9px",background:ok?"rgba(90,173,122,.08)":"rgba(212,116,90,.08)",border:`1px solid ${ok?"rgba(90,173,122,.2)":"rgba(212,116,90,.2)"}`,borderRadius:7,textAlign:"center"}}>
                  <div style={{fontSize:14,marginBottom:2}}>{ok?"✅":"❌"}</div>
                  <div style={{fontSize:10,color:ok?"#5AAD7A":"#D4745A",fontFamily:"Montserrat",fontWeight:700}}>{l}</div>
                  {sub&&<div style={{fontSize:9,color:"#8A8378",marginTop:1}}>{sub}</div>}
                </div>
              ))}
            </div>
          </div>)}
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:12,borderTop:"1px solid #E8E4DC"}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:.45}} onClick={()=>onSubmit({grId,orderId:gr?.orderId,poId:gr?.poId,supplierId:gr?.supplierId,matchResult:matchOk,matchDetails:{qtyOk,priceOk,grOk},...f})}>Send to Accounts Payable →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PAYDetail({pay,reqs,sups,orders,rcvs,onClose,onPaid}){
  const req=reqs.find(r=>r.id===pay.poId); const sup=sups.find(s=>s.id===pay.supplierId); const isPaid=pay.status==="paid";
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:640}}>
        <div className="mod-head"><div><div style={{display:"flex",gap:8,marginBottom:6}}><span style={{fontFamily:"Montserrat",fontSize:10,fontWeight:700,color:"#5AAD7A"}}>{pay.id}</span><span className="bpo">{pay.poId}</span><span className="chip" style={{background:pay.matchResult?"rgba(90,173,122,.12)":"rgba(201,168,76,.10)",color:pay.matchResult?"#5AAD7A":"#A8863A"}}>{pay.matchResult?"✅ Match OK":"⚠️ Diff."}</span></div><div style={{fontFamily:"Montserrat",fontSize:14,fontWeight:800,color:"#2D2D2D"}}>{req?.description||req?.items?.[0]?.description||"—"}</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="card" style={{padding:"12px 14px",marginBottom:12}}><ProgressBar stage="PAY"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {[["Vendor",sup?.name],["Invoice #",pay.invoiceNumber],["Amount",`$${parseFloat(pay.invoiceAmount||0).toLocaleString()}`],["Payment Method",pay.paymentMethod],["Due Date",pay.dueDate||"—"],["Notes",pay.notes||"—"]].map(([k,v])=>(
            <div key={k} style={{background:"#F7F5F1",borderRadius:7,padding:"8px 12px",border:"1px solid #E8E4DC"}}><div style={{fontSize:9,color:"#8A8378",fontFamily:"Montserrat",fontWeight:700,letterSpacing:.5,marginBottom:2}}>{k.toUpperCase()}</div><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{v}</div></div>
          ))}
        </div>
        {!isPaid?<div style={{display:"flex",justifyContent:"flex-end"}}><button className="btn btn-gold" onClick={()=>onPaid(pay.id)}>💳 Mark as Paid — Process Complete →</button></div>:
        <div style={{textAlign:"center",padding:"22px",background:"rgba(90,173,122,.06)",border:"1px solid rgba(90,173,122,.2)",borderRadius:12}}>
          <div style={{fontSize:30,marginBottom:8}}>🎉</div>
          <div style={{fontFamily:"Montserrat",fontSize:15,fontWeight:800,color:"#5AAD7A"}}>Process Complete!</div>
          <div style={{fontSize:12,color:"#8A8378",marginTop:4}}>Paid on {new Date(pay.paidAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
          <div style={{marginTop:8,fontSize:11,color:"#A8863A",fontFamily:"Montserrat",fontWeight:700}}>748 Development — People who build</div>
        </div>}
      </div>
    </div>
  );
}
function Tracker({ctx}){
  const {reqs,sups}=ctx;
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const filtered=reqs.filter(r=>{
    const ms=r.description?.toLowerCase().includes(search.toLowerCase())||r.id?.toLowerCase().includes(search.toLowerCase())||r.items?.some(i=>i.description?.toLowerCase().includes(search.toLowerCase()));
    const mf=filter==="all"||r.stage===filter;
    return ms&&mf;
  });
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">🔍 Global Tracker</div><div className="ph-sub">Track any PR from start to finish</div></div>
        <div style={{display:"flex",gap:8}}>
          <input className="inp" style={{width:220}} placeholder="Search PR# or description..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <select className="sel" style={{width:160}} value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">All Stages</option>
            {STAGES.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
          </select>
        </div>
      </div>
      <div className="pb">
        <div className="gl"/>
        {filtered.length===0?<Empty icon="🔍" msg="No results" sub="Try a different filter or search term"/>:
        filtered.map(r=>{
          const s=STAGES.find(s=>s.id===r.stage); const p=PRIORITY[r.priority]||PRIORITY.normal;
          const isField=r.reqType==="field";
          return(
            <div key={r.id} className="card" style={{marginBottom:10,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span className="bpo">{r.id}</span>
                <span style={{fontSize:9,fontWeight:700,background:isField?"rgba(212,116,90,.10)":"rgba(91,155,213,.10)",color:isField?"#D4745A":"#5B9BD5",border:`1px solid ${isField?"rgba(212,116,90,.28)":"rgba(91,155,213,.28)"}`,padding:"1px 6px",borderRadius:4,fontFamily:"Montserrat"}}>{isField?"🏗️ Field":"📊 Estimation"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:"#2D2D2D",fontWeight:700}}>{r.description||r.items?.[0]?.description}</div>
                  <div style={{fontSize:11,color:"#8A8378",marginTop:1}}>{r.items?.length||1} item(s) · {new Date(r.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
                </div>
                <span className="chip" style={{background:p.bg,color:p.color}}>{p.dot} {p.label}</span>
                <span className="chip" style={{background:`${s?.color}12`,color:s?.color}}>● {s?.label}</span>
              </div>
              <ProgressBar stage={r.stage}/>
              {r.history?.length>0&&(
                <div style={{marginTop:10,paddingTop:8,borderTop:"1px solid #E8E4DC"}}>
                  <div style={{display:"flex",gap:14,overflowX:"auto",paddingBottom:2}}>
                    {r.history.map((h,i)=>{const hs=STAGES.find(s=>s.id===h.stage);return(<div key={i} style={{flexShrink:0,fontSize:11,display:"flex",alignItems:"center",gap:5,color:"#8A8378"}}><div style={{width:6,height:6,borderRadius:"50%",background:hs?.color||"#8A8378",flexShrink:0}}/><span style={{color:"#5A5550"}}>{h.note?.slice(0,40)}</span><span style={{color:"#C8C2B4"}}>·</span><span>{new Date(h.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span></div>);})}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VendorsPage({ctx}){
  const {sups,saveSups,showToast}=ctx;
  const [showNew,setShowNew]=useState(false);
  const [search,setSearch]=useState("");
  const [filterCat,setFilterCat]=useState("all");
  const handleAdd=async(vendor)=>{
    const newV={...vendor,id:`V${Date.now()}`,rating:4.0,active:true};
    await saveSups([...sups,newV]);
    setShowNew(false); showToast(`${vendor.name} added`);
  };
  const handleToggle=async(id)=>{
    const updated=sups.map(s=>s.id===id?{...s,active:!s.active}:s);
    await saveSups(updated); showToast("Vendor updated");
  };
  const filtered=sups.filter(s=>{
    const ms=s.name?.toLowerCase().includes(search.toLowerCase())||s.contact?.toLowerCase().includes(search.toLowerCase());
    const mc=filterCat==="all"||s.category===filterCat;
    return ms&&mc;
  });
  const cats=["all",...new Set(sups.map(s=>s.category).filter(Boolean))];
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">🏢 Vendor Database</div><div className="ph-sub">{sups.filter(s=>s.active).length} active · {sups.length} total</div></div>
        <button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Add Vendor</button>
      </div>
      <div className="pb">
        <div className="gl"/>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <input className="inp" style={{flex:1}} placeholder="Search vendor or contact..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <select className="sel" style={{width:180}} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
            {cats.map(c=><option key={c} value={c}>{c==="all"?"All Categories":c}</option>)}
          </select>
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SH title={`Vendors · ${filtered.length} results`}/>
          {filtered.map(s=>(
            <div key={s.id} className="trow" style={{cursor:"default"}}>
              <div style={{width:36,height:36,borderRadius:8,background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🏢</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:"#2D2D2D",fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                  {s.name}
                  {!s.active&&<span style={{fontSize:9,background:"rgba(212,116,90,.10)",color:"#D4745A",border:"1px solid rgba(212,116,90,.28)",padding:"1px 5px",borderRadius:4,fontFamily:"Montserrat",fontWeight:700}}>INACTIVE</span>}
                </div>
                <div style={{fontSize:11,color:"#8A8378"}}>{s.contact}{s.email?` · ${s.email}`:""}{s.phone?` · ${s.phone}`:""}</div>
              </div>
              <span className="chip" style={{background:"rgba(201,168,76,.08)",color:"#A8863A",border:"1px solid rgba(201,168,76,.25)"}}>{s.category}</span>
              <Stars r={s.rating}/>
              <button onClick={()=>handleToggle(s.id)} className={`btn btn-sm ${s.active?"btn-danger":"btn-success"}`}>{s.active?"Deactivate":"Activate"}</button>
            </div>
          ))}
        </div>
      </div>
      {showNew&&<AddVendorForm onClose={()=>setShowNew(false)} onSubmit={handleAdd}/>}
    </div>
  );
}

function AddVendorForm({onClose,onSubmit}){
  const [f,setF]=useState({name:"",contact:"",email:"",phone:"",category:"General Materials"});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const valid=f.name&&f.contact;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:500}}>
        <div className="mod-head"><div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:800,color:"#2D2D2D"}}>Add New Vendor</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:12}}>
          <div><label className="lbl">Company Name *</label><input className="inp" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Vendor company name"/></div>
          <div><label className="lbl">Contact Person *</label><input className="inp" value={f.contact} onChange={e=>set("contact",e.target.value)} placeholder="Contact name"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label className="lbl">Email</label><input className="inp" type="email" value={f.email} onChange={e=>set("email",e.target.value)} placeholder="email@company.com"/></div>
            <div><label className="lbl">Phone</label><input className="inp" value={f.phone} onChange={e=>set("phone",e.target.value)} placeholder="305-XXX-XXXX"/></div>
          </div>
          <div><label className="lbl">Category</label>
            <select className="sel" value={f.category} onChange={e=>set("category",e.target.value)}>
              {VENDOR_CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:12,borderTop:"1px solid #E8E4DC"}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:.45}} onClick={()=>onSubmit(f)}>Add Vendor →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
