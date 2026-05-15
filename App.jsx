import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';
const _sb = createClient(
  'https://uzemcypozcuygmjgpwol.supabase.co',
  'sb_publishable_Tyqp0uFO_fjlcxtaOfAKRw_bNuPl1LX'
);

// Generic Supabase KV store using a simple key-value table approach
// We use localStorage as fast cache + Supabase as persistent store
async function load(key, fallback) {
  try {
    // Try localStorage first (fast)
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
    // Then try Supabase
    const { data } = await _sb.from('kv_store').select('value').eq('key', key).single();
    if (data) {
      localStorage.setItem(key, data.value);
      return JSON.parse(data.value);
    }
    return fallback;
  } catch { return fallback; }
}
async function save(key, val) {
  try {
    const str = JSON.stringify(val);
    localStorage.setItem(key, str);
    await _sb.from('kv_store').upsert({ key, value: str, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  } catch (e) { console.error('Save error:', e); }
}

// ─────────────────────────────────────────────────────────────────────────────
// BRAND TOKENS — 748 Development
// ─────────────────────────────────────────────────────────────────────────────
const B = {
  carbon:   "#2D2D2D",
  carbon2:  "#3A3A3A",
  carbon3:  "#4A4A4A",
  gold:     "#C9A84C",
  goldL:    "#E2BE72",
  goldD:    "#A8863A",
  goldBg:   "rgba(201,168,76,0.10)",
  goldBd:   "rgba(201,168,76,0.28)",
  white:    "#FFFFFF",
  offwhite: "#F7F5F1",
  gray1:    "#E8E4DC",
  gray2:    "#C8C2B4",
  gray3:    "#8A8378",
  gray4:    "#5A5550",
  dark:     "#1A1814",
  dark2:    "#222018",
  dark3:    "#2C2A24",
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const STAGES = [
  { id:"REQ", label:"Requisition",     color:"#7C72DC", icon:"📋" },
  { id:"RFQ", label:"Quotation",      color:"#5B9BD5", icon:"💬" },
  { id:"CMP", label:"Comparison",     color:B.gold,    icon:"⚖️" },
  { id:"PO",  label:"Purchase Order", color:"#D4745A", icon:"📄" },
  { id:"DEL", label:"Delivery",        color:"#4AADA0", icon:"🚚" },
  { id:"RCV", label:"Receipt",       color:"#9B7DC8", icon:"✅" },
  { id:"PAY", label:"Pago",            color:"#5AAD7A", icon:"💳" },
];

const NAV = [
  { id:"dashboard", label:"Dashboard",       icon:"◈" },
  { id:"REQ",       label:"Requisition",     icon:"📋" },
  { id:"RFQ",       label:"Quotation",      icon:"💬" },
  { id:"CMP",       label:"Comparison",     icon:"⚖️" },
  { id:"PO",        label:"Purchase Order", icon:"📄" },
  { id:"DEL",       label:"Delivery",        icon:"🚚" },
  { id:"RCV",       label:"Receipt",       icon:"✅" },
  { id:"PAY",       label:"Pago",            icon:"💳" },
  { id:"tracker",   label:"Global Tracker",  icon:"🔍" },
];

const PRIORITY = {
  urgent:    { label:"Urgent",     color:"#D4745A", bg:"rgba(212,116,90,0.12)", dot:"🔴" },
  normal:     { label:"Normal",      color:B.gold,    bg:B.goldBg,               dot:"🟡" },
  planned:{ label:"Planned", color:"#5AAD7A", bg:"rgba(90,173,122,0.12)", dot:"🟢" },
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
const DISC_TYPES = ["Incorrect quantity","Wrong item","Physical damage","Missing documentation","Non-conforming quality","Otro"];
const PAY_METHODS = ["Wire Transfer","Check","Cash","Direct Debit","Otro"];

const DEMO_SUPPLIERS = [
  { id:"S001", name:"White Cap",                     contact:"Daniel Regalado",   email:"Daniel.Regalado@whitecap.com",          phone:"786-914-0066", category:"Formwork & Shoring",   rating:4.0, active:true },
  { id:"S002", name:"United Rental",                 contact:"Ike Washington",    email:"iwashingto@ur.com",                     phone:"786-860-7568", category:"Equipment Rental",      rating:4.0, active:true },
  { id:"S003", name:"Herc Rental",                   contact:"Luis Jeannot",      email:"luis.jeannot@hercrentals.com",          phone:"786-570-9147", category:"Equipment Rental",      rating:4.0, active:true },
  { id:"S004", name:"Sunbelt",                       contact:"John Davis",        email:"",                                      phone:"305-796-3469", category:"Equipment Rental",      rating:4.0, active:true },
  { id:"S005", name:"Mighty Trucking",               contact:"",                  email:"",                                      phone:"786-251-0032", category:"Transportation",        rating:4.0, active:true },
  { id:"S006", name:"PMS CMU Install",               contact:"Luis Sevilla",      email:"lsevilla311@gmail.com",                 phone:"305-725-4280", category:"Masonry",               rating:4.0, active:true },
  { id:"S007", name:"Cemex",                         contact:"Valentina Gonzalez",email:"valentina.gonzalezv@cemex.com",         phone:"832-472-2704", category:"Concrete",              rating:4.5, active:true },
  { id:"S008", name:"Polimix",                       contact:"Alberto Santana",   email:"alberto@polimix.us",                    phone:"786-458-7893", category:"Concrete",              rating:4.5, active:true },
  { id:"S009", name:"Hilti",                         contact:"Richard Toquice",   email:"",                                      phone:"954-350-2065", category:"Equipment & Tools",     rating:4.5, active:true },
  { id:"S010", name:"Stucco & Painting Solution",    contact:"Edgar Villanueva",  email:"",                                      phone:"786-251-2422", category:"Finishes",              rating:4.0, active:true },
  { id:"S011", name:"Potros Trucking",               contact:"Jose Lopez",        email:"",                                      phone:"786-412-0296", category:"Transportation",        rating:4.0, active:true },
  { id:"S012", name:"Alsina Forms",                  contact:"Marcos Mirabal",    email:"marcos.mirabal@alsina.com",             phone:"305-924-4710", category:"Formwork & Shoring",    rating:4.5, active:true },
  { id:"S013", name:"City Electric Supply",          contact:"Lazaro",            email:"",                                      phone:"786-969-5315", category:"Electrical",            rating:4.0, active:true },
  { id:"S014", name:"Kavana Tile/Bath/Kitchen",      contact:"Orlando Rodriguez", email:"orodriguez@kavanafloorandbath.com",      phone:"786-281-2760", category:"Flooring & Tile",       rating:4.0, active:true },
  { id:"S015", name:"Lobo Services LLC",             contact:"Carlos Lobo",       email:"LoboServicesLLC@outlook.com",           phone:"786-468-1259", category:"Landscaping",           rating:4.0, active:true },
  { id:"S016", name:"Floor and Decor",               contact:"Scarlet Garcia",    email:"Scarlet.GarciaUlerio@flooranddecor.com",phone:"786-858-2331", category:"Flooring & Tile",       rating:4.5, active:true },
  { id:"S017", name:"Brospro",                       contact:"Leonel Mejia",      email:"brosprobuild@hotmail.com",              phone:"305-491-2638", category:"Finishes",              rating:4.0, active:true },
  { id:"S018", name:"The Home Depot",                contact:"Daniel Carniglia",  email:"MANUEL_D_CARNIGLIA@homedepot.com",      phone:"786-886-7819", category:"General Materials",     rating:4.5, active:true },
  { id:"S019", name:"George Crane",                  contact:"",                  email:"",                                      phone:"305-513-0188", category:"Equipment Rental",      rating:4.0, active:true },
  { id:"S020", name:"Nu-Vue",                        contact:"Enzo Murias",       email:"enzo.nuvue@gmail.com",                  phone:"754-465-1549", category:"Structural Steel",      rating:4.0, active:true },
  { id:"S021", name:"ESP Windows",                   contact:"Danny",             email:"",                                      phone:"786-344-4342", category:"Windows & Glazing",     rating:4.0, active:true },
  { id:"S022", name:"V&V Windows",                   contact:"Jorge",             email:"",                                      phone:"786-760-0914", category:"Windows & Glazing",     rating:4.0, active:true },
  { id:"S023", name:"Nachon Cabilla",                contact:"Jose Sixto",        email:"sixtonachon@gmail.com",                 phone:"786-280-5855", category:"Structural Steel",      rating:4.0, active:true },
  { id:"S024", name:"USA High Security Corp",        contact:"",                  email:"",                                      phone:"305-733-0792", category:"Security Systems",      rating:4.0, active:true },
  { id:"S025", name:"G Proulx Building Products",   contact:"Ryan H",            email:"ryanh@gpbpllc.com",                     phone:"954-922-1429", category:"Structural Steel",      rating:4.0, active:true },
  { id:"S026", name:"KJ Materials LLC",              contact:"Victor Herrera",    email:"sales7401@kjmaterials.net",             phone:"305-522-8943", category:"Drywall",               rating:4.0, active:true },
  { id:"S027", name:"Medley Steel and Supply",       contact:"Julio Jimenez",     email:"jjimenez@medleysteel.com",              phone:"305-525-2919", category:"Structural Steel",      rating:4.0, active:true },
];

const DEMO_PROJECTS = [
  { id:"P001", code:"3320", name:"3320 NW 5th Ave - SHELL",         budget:0, status:"Active" },
  { id:"P002", code:"5-27", name:"5-27 SW South River Drive",       budget:0, status:"Active" },
  { id:"P003", code:"1158", name:"1158 NW 6TH STREET",              budget:0, status:"Active" },
  { id:"P004", code:"3513", name:"3513 NW 5th Ave CM",              budget:0, status:"Active" },
  { id:"P005", code:"3505", name:"3505 NW 5th Ave CM",              budget:0, status:"Active" },
  { id:"P006", code:"636",  name:"636 SW 14 AV",                    budget:0, status:"Active" },
  { id:"P007", code:"826",  name:"826 SW 12 Court",                 budget:0, status:"Active" },
  { id:"P008", code:"530",  name:"530 SW 11th Ave",                 budget:0, status:"Active" },
  { id:"P009", code:"321",  name:"321 NW 4TH AVE",                  budget:0, status:"Active" },
];

function genPO(n)     { return `PO-${new Date().getFullYear()}-${String(n).padStart(4,"0")}`; }
function genId(pre,n) { return `${pre}-${new Date().getFullYear()}-${String(n).padStart(4,"0")}`; }
function daysUntil(d) { return Math.ceil((new Date(d)-new Date())/(1000*60*60*24)); }

function scoreSuppliers(responses, suppliers) {
  const ans = responses.filter(r=>r.status==="respondida"&&r.price>0);
  if (!ans.length) return [];
  const minP=Math.min(...ans.map(r=>r.price)), maxP=Math.max(...ans.map(r=>r.price));
  const minD=Math.min(...ans.map(r=>r.deliveryDays)), maxD=Math.max(...ans.map(r=>r.deliveryDays));
  return ans.map(r=>{
    const sup=suppliers.find(s=>s.id===r.supplierId);
    const ps=maxP===minP?100:Math.round((1-(r.price-minP)/(maxP-minP))*100);
    const ds=maxD===minD?100:Math.round((1-(r.deliveryDays-minD)/(maxD-minD))*100);
    const ws=PAYMENT_SCORE[(r.paymentTerms??"COD").toLowerCase()]??20;
    return {...r,sup,ps,ds,ws,total:Math.round(ps*0.6+ds*0.25+ws*0.15)};
  }).sort((a,b)=>b.total-a.total);
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:${B.dark2};}
::-webkit-scrollbar-thumb{background:${B.gold};border-radius:4px;opacity:.5;}

.app{display:flex;height:100vh;background:${B.offwhite};overflow:hidden;font-family:'Open Sans',sans-serif;}

/* ── Sidebar ── */
.sb{width:232px;background:${B.dark};display:flex;flex-direction:column;flex-shrink:0;position:relative;}
.sb::after{content:'';position:absolute;top:0;right:0;width:1px;height:100%;background:linear-gradient(to bottom,transparent,${B.gold}60,transparent);}

.sb-head{padding:20px 18px 18px;border-bottom:1px solid ${B.dark3};}
.sb-logo{display:flex;align-items:center;gap:10px;}
.sb-logo-mark{width:38px;height:38px;background:linear-gradient(135deg,${B.gold},${B.goldD});border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Montserrat';font-weight:900;font-size:13px;color:${B.dark};letter-spacing:-1px;flex-shrink:0;box-shadow:0 2px 8px rgba(201,168,76,.35);}
.sb-logo-text{display:flex;flex-direction:column;}
.sb-logo-name{font-family:'Montserrat';font-size:13px;font-weight:800;color:${B.white};letter-spacing:.3px;line-height:1;}
.sb-logo-tag{font-size:9px;color:${B.gold};letter-spacing:1.5px;margin-top:3px;font-weight:500;}

.sb-section{padding:16px 12px 4px;font-family:'Montserrat';font-size:9px;color:${B.gray3};letter-spacing:2px;font-weight:700;text-transform:uppercase;}
.nav-btn{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:6px;cursor:pointer;transition:all .15s;margin:1px 8px;border:none;background:transparent;width:calc(100% - 16px);text-align:left;position:relative;}
.nav-btn:hover{background:${B.dark3};}
.nav-btn.act{background:${B.dark3};}
.nav-btn.act::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:60%;background:${B.gold};border-radius:0 2px 2px 0;}
.nav-icon{font-size:13px;width:18px;text-align:center;flex-shrink:0;}
.nav-label{font-family:'Open Sans';font-size:12px;font-weight:500;color:${B.gray2};}
.nav-btn.act .nav-label{color:${B.white};font-weight:600;}
.nav-badge{margin-left:auto;background:${B.gold};color:${B.dark};font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px;font-family:'Montserrat';}

.sb-footer{padding:14px 18px;border-top:1px solid ${B.dark3};margin-top:auto;}
.sb-company{font-family:'Montserrat';font-size:10px;color:${B.gray3};letter-spacing:.5px;}
.sb-ver{font-size:9px;color:${B.gray4};margin-top:2px;}

/* ── Main ── */
.main{flex:1;overflow-y:auto;background:${B.offwhite};}

/* Page header */
.ph{padding:22px 28px 18px;background:${B.white};border-bottom:1px solid ${B.gray1};display:flex;align-items:center;justify-content:space-between;}
.ph-left{}
.ph-title{font-family:'Montserrat';font-size:18px;font-weight:800;color:${B.carbon};letter-spacing:-.3px;}
.ph-sub{font-size:12px;color:${B.gray3};margin-top:2px;font-weight:400;}
.pb{padding:22px 28px;}

/* Cards */
.card{background:${B.white};border-radius:10px;border:1px solid ${B.gray1};box-shadow:0 1px 4px rgba(0,0,0,.04);}
.card-gold{background:${B.white};border-radius:10px;border:1px solid ${B.goldBd};box-shadow:0 1px 8px rgba(201,168,76,.08);}
.ct{font-family:'Montserrat';font-size:12px;font-weight:700;color:${B.carbon};letter-spacing:.3px;text-transform:uppercase;}

/* Stat cards */
.stat{background:${B.white};border-radius:10px;border:1px solid ${B.gray1};padding:18px;position:relative;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.04);}
.stat::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--sc);}
.stat-val{font-family:'Montserrat';font-size:24px;font-weight:800;color:var(--sc);margin:8px 0 2px;}
.stat-lbl{font-size:11px;color:${B.gray3};font-weight:500;}
.stat-icon{font-size:22px;opacity:.8;}

/* Buttons */
.btn{border:none;border-radius:6px;cursor:pointer;font-family:'Open Sans';font-weight:600;transition:all .15s;font-size:13px;letter-spacing:.2px;}
.btn-gold{background:${B.gold};color:${B.dark};padding:10px 20px;font-family:'Montserrat';font-weight:700;font-size:12px;letter-spacing:.5px;box-shadow:0 2px 8px rgba(201,168,76,.3);}
.btn-gold:hover{background:${B.goldL};transform:translateY(-1px);box-shadow:0 4px 14px rgba(201,168,76,.4);}
.btn-gold:active{transform:translateY(0);}
.btn-dark{background:${B.carbon};color:${B.white};padding:10px 20px;font-family:'Montserrat';font-weight:700;font-size:12px;letter-spacing:.5px;}
.btn-dark:hover{background:${B.carbon2};transform:translateY(-1px);}
.btn-ghost{background:transparent;color:${B.gray3};border:1.5px solid ${B.gray1};padding:9px 18px;font-size:12px;}
.btn-ghost:hover{border-color:${B.carbon};color:${B.carbon};}
.btn-success{background:rgba(90,173,122,.12);color:#5AAD7A;border:1px solid rgba(90,173,122,.3);padding:10px 20px;font-size:12px;font-family:'Montserrat';font-weight:700;}
.btn-success:hover{background:rgba(90,173,122,.2);}
.btn-danger{background:rgba(212,116,90,.12);color:#D4745A;border:1px solid rgba(212,116,90,.3);padding:9px 18px;font-size:12px;}
.btn-danger:hover{background:rgba(212,116,90,.2);}
.btn-sm{padding:6px 14px!important;font-size:11px!important;border-radius:5px!important;}

/* Forms */
.lbl{font-family:'Montserrat';font-size:10px;font-weight:700;color:${B.gray3};letter-spacing:1.2px;text-transform:uppercase;margin-bottom:5px;display:block;}
.inp{width:100%;background:${B.offwhite};border:1.5px solid ${B.gray1};border-radius:7px;padding:10px 13px;font-family:'Open Sans';font-size:13px;color:${B.carbon};outline:none;transition:border-color .15s;}
.inp:focus{border-color:${B.gold};box-shadow:0 0 0 3px ${B.goldBg};}
.inp::placeholder{color:${B.gray2};}
.sel{width:100%;background:${B.offwhite};border:1.5px solid ${B.gray1};border-radius:7px;padding:10px 13px;font-family:'Open Sans';font-size:13px;color:${B.carbon};outline:none;appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%238A8378' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 13px center;}
.sel:focus{border-color:${B.gold};}
.ta{width:100%;background:${B.offwhite};border:1.5px solid ${B.gray1};border-radius:7px;padding:10px 13px;font-family:'Open Sans';font-size:13px;color:${B.carbon};outline:none;resize:vertical;min-height:70px;}
.ta:focus{border-color:${B.gold};}

/* Table rows */
.trow{display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid ${B.gray1};cursor:pointer;transition:background .12s;}
.trow:hover{background:${B.offwhite};}
.trow:last-child{border-bottom:none;}

/* Badges */
.bpo{font-family:'Montserrat';font-size:11px;font-weight:700;background:${B.carbon};color:${B.white};padding:3px 10px;border-radius:5px;display:inline-block;letter-spacing:.3px;}
.bgold{font-family:'Montserrat';font-size:11px;font-weight:700;background:${B.goldBg};color:${B.goldD};border:1px solid ${B.goldBd};padding:3px 10px;border-radius:5px;display:inline-block;}
.chip{font-family:'Montserrat';font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;display:inline-flex;align-items:center;gap:4px;letter-spacing:.3px;}

/* Divider */
.div-gold{height:1px;background:linear-gradient(to right,transparent,${B.goldBd},transparent);margin:4px 0;}

/* Modal */
.ov{position:fixed;inset:0;background:rgba(26,24,20,.65);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
.mod{background:${B.white};border-radius:14px;width:100%;max-width:800px;max-height:92vh;overflow-y:auto;padding:28px;border:1px solid ${B.gray1};box-shadow:0 20px 60px rgba(0,0,0,.2);}
.mod-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;padding-bottom:16px;border-bottom:1px solid ${B.gray1};}
.mod-title-text{font-family:'Montserrat';font-size:16px;font-weight:800;color:${B.carbon};}

/* Progress */
.pd{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;font-family:'Montserrat';flex-shrink:0;}

/* Toast */
.toast{position:fixed;bottom:24px;right:24px;z-index:400;background:${B.carbon};color:${B.white};padding:13px 20px;border-radius:10px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,.25);font-family:'Open Sans';font-size:13px;border-left:4px solid ${B.gold};}

/* Gold accent line */
.gold-line{height:2px;background:linear-gradient(to right,${B.gold},${B.goldL},${B.gold});border-radius:1px;margin-bottom:18px;}

@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.fi{animation:fadeIn .22s ease forwards;}
.su{animation:slideUp .28s cubic-bezier(.34,1.4,.64,1) forwards;}
`;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function ProgressBar({ stage, small }) {
  const idx = STAGES.findIndex(s=>s.id===stage);
  const sz = small ? 16 : 20;
  return (
    <div style={{ display:"flex", alignItems:"center" }}>
      {STAGES.map((s,i)=>(
        <div key={s.id} style={{ display:"flex", alignItems:"center", flex:i<STAGES.length-1?1:"none" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            <div className="pd" style={{ width:sz, height:sz, background:i<=idx?s.color:B.gray1, color:i<=idx?"#fff":B.gray3, boxShadow:i===idx?`0 0 0 3px ${s.color}28`:"none", fontSize:small?7:8 }}>
              {i<idx?"✓":i+1}
            </div>
            {!small&&<div style={{ fontSize:7, color:i<=idx?s.color:B.gray2, fontWeight:700, whiteSpace:"nowrap", marginTop:2, fontFamily:"'Montserrat'" }}>{s.label}</div>}
          </div>
          {i<STAGES.length-1&&<div style={{ flex:1, height:2, background:i<idx?STAGES[i+1].color:B.gray1, margin:"0 1px", marginBottom:small?0:14 }}/>}
        </div>
      ))}
    </div>
  );
}

function Stars({ r }) {
  return <span style={{ color:B.gold, fontSize:12 }}>{[1,2,3,4,5].map(i=><span key={i}>{i<=Math.round(r)?"★":"☆"}</span>)}</span>;
}

function Empty({ icon, msg, sub }) {
  return (
    <div style={{ padding:"52px 20px", textAlign:"center" }}>
      <div style={{ fontSize:36, marginBottom:12, opacity:.6 }}>{icon}</div>
      <div style={{ fontFamily:"'Montserrat'", fontSize:14, color:B.carbon, fontWeight:700, marginBottom:5 }}>{msg}</div>
      <div style={{ fontSize:12, color:B.gray3 }}>{sub}</div>
    </div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ padding:"14px 18px", borderBottom:`1px solid ${B.gray1}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ fontFamily:"'Montserrat'", fontSize:12, fontWeight:700, color:B.carbon, letterSpacing:.5, textTransform:"uppercase" }}>{title}</div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
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
  const [ctrPO,setCtrPO]=useState(0);
  const [ctrRFQ,setCtrRFQ]=useState(0);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      const [r,rq,cm,or,dl,rc,py,sp,cpo,crfq]=await Promise.all([
        load("proc:requisitions",[]),load("proc:rfqs",[]),load("proc:comparisons",[]),
        load("proc:orders",[]),load("proc:deliveries",[]),load("proc:receipts",[]),
        load("proc:payments",[]),load("proc:suppliers",DEMO_SUPPLIERS),
        load("proc:counter",0),load("proc:rfqCounter",0),
      ]);
      setReqs(r);setRfqs(rq);setCmps(cm);setOrders(or);setDels(dl);setRcvs(rc);setPays(py);setSups(sp);setCtrPO(cpo);setCtrRFQ(crfq);
      setLoading(false);
    })();
  },[]);

  const showToast=(msg,icon="✅")=>{ setToast({msg,icon}); setTimeout(()=>setToast(null),3500); };
  const pendingPO=orders.filter(o=>o.approvalStatus==="pending").length;
  const pendingCMP=cmps.filter(c=>c.status==="pending").length;
  const alertDEL=dels.filter(d=>d.status!=="completed"&&daysUntil(d.expectedDate)<=3).length;

  const saveReqs=async r=>{setReqs(r);await save("proc:requisitions",r);};
  const saveRfqs=async r=>{setRfqs(r);await save("proc:rfqs",r);};
  const saveCmps=async r=>{setCmps(r);await save("proc:comparisons",r);};
  const saveOrders=async r=>{setOrders(r);await save("proc:orders",r);};
  const saveDels=async r=>{setDels(r);await save("proc:deliveries",r);};
  const saveRcvs=async r=>{setRcvs(r);await save("proc:receipts",r);};
  const savePays=async r=>{setPays(r);await save("proc:payments",r);};
  const saveSups=async r=>{setSups(r);await save("proc:suppliers",r);};

  const ctx={reqs,rfqs,cmps,orders,dels,rcvs,pays,sups,saveReqs,saveRfqs,saveCmps,saveOrders,saveDels,saveRcvs,savePays,saveSups,showToast,setPage,ctrPO,setCtrPO,ctrRFQ,setCtrRFQ};

  if (loading) return (
    <div style={{ height:"100vh", background:B.dark, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14 }}>
      <div style={{ fontFamily:"'Montserrat'", fontWeight:900, fontSize:48, color:B.white, lineHeight:1, letterSpacing:-2 }}>
        <span style={{ color:B.white }}>7</span><span style={{ color:B.gold }}>4</span><span style={{ color:B.white }}>8</span>
      </div>
      <div style={{ fontFamily:"'Montserrat'", fontSize:10, color:B.gold, letterSpacing:4, fontWeight:600 }}>CARGANDO SISTEMA DE PROCURA</div>
    </div>
  );

  return (
    <div className="app">
      <style>{STYLE}</style>

      {/* ── Sidebar ── */}
      <div className="sb">
        <div className="sb-head">
          <div className="sb-logo">
            <div className="sb-logo-mark">748</div>
            <div className="sb-logo-text">
              <div className="sb-logo-name">DEVELOPMENT</div>
              <div className="sb-logo-tag">PROCURA · COMPRAS</div>
            </div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", paddingBottom:8 }}>
          <div className="sb-section">General</div>
          {NAV.slice(0,1).map(n=>(
            <button key={n.id} className={`nav-btn ${page===n.id?"act":""}`} onClick={()=>setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
          <div className="sb-section">Módulos</div>
          {NAV.slice(1,8).map(n=>(
            <button key={n.id} className={`nav-btn ${page===n.id?"act":""}`} onClick={()=>setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
              {n.id==="PO"&&pendingPO>0&&<span className="nav-badge">{pendingPO}</span>}
              {n.id==="CMP"&&pendingCMP>0&&<span className="nav-badge">{pendingCMP}</span>}
              {n.id==="DEL"&&alertDEL>0&&<span className="nav-badge">{alertDEL}</span>}
            </button>
          ))}
          <div className="sb-section">Seguimiento</div>
          {NAV.slice(8).map(n=>(
            <button key={n.id} className={`nav-btn ${page===n.id?"act":""}`} onClick={()=>setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </div>

        <div className="sb-footer">
          <div className="sb-company">748 Development C.A.</div>
          <div className="sb-ver">Sistema de Procura v1.0 · {new Date().getFullYear()}</div>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="main">
        {page==="dashboard"&&<Dashboard ctx={ctx} />}
        {page==="REQ"&&<REQPage ctx={ctx} />}
        {page==="RFQ"&&<RFQPage ctx={ctx} />}
        {page==="CMP"&&<CMPPage ctx={ctx} />}
        {page==="PO"&&<POPage ctx={ctx} />}
        {page==="DEL"&&<DELPage ctx={ctx} />}
        {page==="RCV"&&<RCVPage ctx={ctx} />}
        {page==="PAY"&&<PAYPage ctx={ctx} />}
        {page==="tracker"&&<Tracker ctx={ctx} />}
      </div>

      {toast&&(
        <div className="toast fi">
          <span style={{fontSize:16}}>{toast.icon}</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({ ctx }) {
  const { reqs,rfqs,cmps,orders,dels,rcvs,pays,setPage } = ctx;
  const total=reqs.length;
  const active=reqs.filter(r=>r.stage!=="PAY").length;
  const complete=pays.filter(p=>p.status==="paid").length;
  const totalPaid=pays.filter(p=>p.status==="paid").reduce((a,p)=>a+parseFloat(p.invoiceAmount||0),0);
  const pipeline=STAGES.map(s=>({...s,count:reqs.filter(r=>r.stage===s.id).length}));
  const alerts=[
    ...orders.filter(o=>o.approvalStatus==="pending").map(o=>({msg:`OC ${o.id} pending de aprobación gerencial`,color:"#D4745A",icon:"⏳",page:"PO"})),
    ...dels.filter(d=>d.status!=="completed"&&daysUntil(d.expectedDate)<=3).map(d=>({msg:`Delivery ${d.id} — vence en ${daysUntil(d.expectedDate)}d`,color:"#D4745A",icon:"🔴",page:"DEL"})),
    ...cmps.filter(c=>c.status==="pending").map(c=>({msg:`Comparativo ${c.id} pending de aprobación`,color:B.goldD,icon:"⚖️",page:"CMP"})),
  ];

  return (
    <div className="fi">
      <div className="ph">
        <div>
          <div className="ph-title">Dashboard</div>
          <div className="ph-sub">Welcome to Procurement System · {new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        </div>
        <div style={{ fontFamily:"'Montserrat'", fontSize:11, fontWeight:700, color:B.gray3, letterSpacing:.5 }}>
          748 Development — <span style={{ color:B.gold }}>People who build</span>
        </div>
      </div>
      <div className="pb">
        <div className="gold-line" />

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
          {[
            { l:"Total PRs",    v:total,                          c:B.carbon,  icon:"📋" },
            { l:"In Progress",   v:active,                         c:"#5B9BD5", icon:"🔄" },
            { l:"Completed",  v:complete,                       c:"#5AAD7A", icon:"✅" },
            { l:"Total Paid", v:`$${totalPaid.toLocaleString()}`,c:B.goldD,  icon:"💰" },
          ].map(s=>(
            <div key={s.l} className="stat" style={{"--sc":s.c}}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-val">{s.v}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {alerts.length>0&&(
          <div className="card" style={{ padding:"16px 18px", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ width:3, height:16, background:B.gold, borderRadius:2 }} />
              <div className="ct">Requires Attention</div>
            </div>
            {alerts.map((a,i)=>(
              <div key={i} onClick={()=>setPage(a.page)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:`rgba(${a.color==="#D4745A"?"212,116,90":"168,134,58"},.06)`, border:`1px solid rgba(${a.color==="#D4745A"?"212,116,90":"168,134,58"},.2)`, borderRadius:7, marginBottom:6, cursor:"pointer", transition:"opacity .15s" }}>
                <span style={{fontSize:14}}>{a.icon}</span>
                <span style={{ fontSize:12, color:a.color, flex:1, fontWeight:500 }}>{a.msg}</span>
                <span style={{ fontSize:11, color:B.gray3, fontFamily:"'Montserrat'", fontWeight:600 }}>View →</span>
              </div>
            ))}
          </div>
        )}

        {/* Pipeline */}
        <div className="card" style={{ padding:"18px", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <div style={{ width:3, height:16, background:B.gold, borderRadius:2 }} />
            <div className="ct">Procurement Pipeline</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:10 }}>
            {pipeline.map(s=>(
              <div key={s.id} onClick={()=>setPage(s.id)} style={{ textAlign:"center", padding:"14px 8px", borderRadius:8, background:`${s.color}0D`, border:`1px solid ${s.color}30`, cursor:"pointer", transition:"all .15s" }}>
                <div style={{fontSize:18,marginBottom:6}}>{s.icon}</div>
                <div style={{ fontFamily:"'Montserrat'", fontSize:22, fontWeight:900, color:s.color }}>{s.count}</div>
                <div style={{ fontSize:9, color:B.gray3, marginTop:3, fontWeight:700, fontFamily:"'Montserrat'", letterSpacing:.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div className="card" style={{ overflow:"hidden" }}>
          <SectionHeader title="Recent Activity" />
          {reqs.length===0
            ? <Empty icon="📋" msg="No activity" sub="Create your first requisición to get started" />
            : reqs.slice(0,7).map(r=>{
              const s=STAGES.find(s=>s.id===r.stage); const p=PRIORITY[r.priority];
              return(
                <div key={r.id} className="trow" onClick={()=>setPage("tracker")}>
                  <span className="bpo">{r.id}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,color:B.carbon,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.description}</div>
                    <div style={{fontSize:11,color:B.gray3}}>{new Date(r.createdAt).toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"})}</div>
                  </div>
                  <ProgressBar stage={r.stage} small />
                  <span className="chip" style={{background:`${s.color}15`,color:s.color}}>● {s.label}</span>
                  <span className="chip" style={{background:p.bg,color:p.color}}>{p.dot}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REQ
// ─────────────────────────────────────────────────────────────────────────────
function REQPage({ ctx }) {
  const {reqs,saveReqs,ctrPO,setCtrPO,showToast}=ctx;
  const [showForm,setShowForm]=useState(false);
  const [selected,setSelected]=useState(null);

  const handleCreate=async(form)=>{
    const n=ctrPO+1; const req={...form,id:genPO(n),createdAt:new Date().toISOString(),stage:"REQ",history:[{stage:"REQ",date:new Date().toISOString(),note:"Requisición creada"}]};
    await saveReqs([req,...reqs]); setCtrPO(n); await save("proc:counter",n);
    setShowForm(false); showToast(`${req.id} creada exitosamente`);
  };

  return (
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">📋 Requisición de Compra</div><div className="ph-sub">Registro y gestión de solicitudes de compra</div></div>
        <button className="btn btn-gold" onClick={()=>setShowForm(true)}>+ New Requisition</button>
      </div>
      <div className="pb">
        <div className="gold-line" />
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[["Total PR",reqs.length,B.carbon],["En Requisición",reqs.filter(r=>r.stage==="REQ").length,"#7C72DC"],["Urgentes",reqs.filter(r=>r.priority==="urgent").length,"#D4745A"]].map(([l,v,c])=>(
            <div key={l} className="stat" style={{"--sc":c}}>
              <div className="stat-val">{v}</div><div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SectionHeader title={`Requisiciones · ${reqs.length} registros`} />
          {reqs.length===0?<Empty icon="📋" msg="No requisitions" sub="Crea la primera para iniciar el proceso de compra" />:
          reqs.map(r=>{
            const s=STAGES.find(s=>s.id===r.stage); const p=PRIORITY[r.priority];
            return(<div key={r.id} className="trow" onClick={()=>setSelected(r)}>
              <span className="bpo">{r.id}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:B.carbon,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.description}</div>
                <div style={{fontSize:11,color:B.gray3}}>{r.quantity} {r.unit} · {new Date(r.createdAt).toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"})}</div>
              </div>
              <ProgressBar stage={r.stage} small />
              <span className="chip" style={{background:p.bg,color:p.color}}>{p.dot} {p.label}</span>
              <span style={{color:B.gray2,fontSize:14}}>›</span>
            </div>);
          })}
        </div>
      </div>
      {showForm&&<REQForm onClose={()=>setShowForm(false)} onSubmit={handleCreate} projects={projs} suppliers={sups} />}
      {selected&&<REQDetail req={selected} onClose={()=>setSelected(null)} />}
    </div>
  );
}

function REQForm({ onClose, onSubmit, projects, suppliers }) {
  const [reqType, setReqType] = useState(null);
  const [f, setF] = useState({
    priority:"normal", requiredDate:"", projectId:"", site:"",
    fieldRequestedBy:"", fieldSupervisor:"", estimatedBudget:"",
    justification:"", suggestedSupplier:"", targetDate:"",
    deliveryLocation:"Warehouse",
    items:[{ id:1, description:"", qty:"", unit:"EA", costCode:"", notes:"" }],
  });
  const setFld = (k,v) => setF(p=>({...p,[k]:v}));
  const setItem = (idx,k,v) => setF(p=>({...p, items:p.items.map((it,i)=>i===idx?{...it,[k]:v}:it)}));
  const addItem = () => setF(p=>({...p, items:[...p.items, {id:Date.now(),description:"",qty:"",unit:"EA",costCode:"",notes:""}]}));
  const removeItem = idx => setF(p=>({...p, items:p.items.filter((_,i)=>i!==idx)}));

  const DELIVERY_LOCS = ["Warehouse","Jobsite","Office","Other"];
  const COST_CODES_SHORT = [
    "01 45 00 — Quality Control","01 54 00 — Construction Aids","01 74 00 — Cleaning",
    "02 40 00 — Demolition","03 00 00 — Concrete","03 30 00 — Cast-in-Place Concrete",
    "04 00 00 — Masonry","05 00 00 — Metals","05 12 00 — Structural Steel",
    "06 00 00 — Wood & Plastics","07 00 00 — Thermal Protection","08 00 00 — Openings",
    "08 10 00 — Doors & Frames","08 55 00 — Windows","09 00 00 — Finishes",
    "09 20 00 — Gypsum Board","09 60 00 — Flooring","21 13 00 — Fire Suppression",
    "22 10 00 — Plumbing","23 00 00 — HVAC","26 00 00 — Electrical",
    "31 00 00 — Earthwork","31 23 00 — Excavation","33 00 00 — Utilities","34 00 00 — Transportation",
  ];

  const valid = reqType && f.items.length > 0 && f.items.every(i=>i.description) && f.requiredDate;

  if (!reqType) return (
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:580}}>
        <div className="mod-head">
          <div>
            <div style={{fontFamily:"Montserrat",fontSize:17,fontWeight:800,color:"#2D2D2D"}}>New Purchase Requisition</div>
            <div style={{fontSize:12,color:"#8A8378",marginTop:2}}>Select request type</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{display:"flex",gap:14,marginBottom:20}}>
          {[
            {k:"field", icon:"🏗️", title:"Field Request", desc:"Urgent or unplanned need from jobsite. Fast approval flow."},
            {k:"estimation", icon:"📊", title:"Estimation", desc:"Planned purchase linked to project budget and schedule."},
          ].map(({k,icon,title,desc})=>(
            <div key={k} onClick={()=>setReqType(k)} style={{flex:1,border:"2px solid #E8E4DC",borderRadius:10,padding:18,cursor:"pointer",transition:"all .18s",background:"#fff"}}>
              <div style={{fontSize:32,marginBottom:10}}>{icon}</div>
              <div style={{fontFamily:"Montserrat",fontSize:14,fontWeight:800,color:"#2D2D2D",marginBottom:6}}>{title}</div>
              <div style={{fontSize:12,color:"#8A8378",lineHeight:1.6}}>{desc}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end"}}><button className="btn btn-ghost" onClick={onClose}>Cancel</button></div>
      </div>
    </div>
  );

  return (
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head">
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontFamily:"Montserrat",fontSize:17,fontWeight:800,color:"#2D2D2D"}}>
                {reqType==="field"?"🏗️ Field Request":"📊 Estimation"}
              </div>
              <button onClick={()=>setReqType(null)} className="btn btn-ghost btn-sm" style={{fontSize:11}}>Change</button>
            </div>
            <div style={{fontSize:11,color:"#8A8378",marginTop:2}}>PO number will be generated automatically</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{display:"grid",gap:14}}>
          {/* Header info */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div>
              <label className="lbl">Project</label>
              <select className="sel" value={f.projectId} onChange={e=>setFld("projectId",e.target.value)}>
                <option value="">— Select project —</option>
                {(projects||[]).map(p=><option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">Delivery Location</label>
              <select className="sel" value={f.deliveryLocation} onChange={e=>setFld("deliveryLocation",e.target.value)}>
                {DELIVERY_LOCS.map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">Date Needed *</label>
              <input className="inp" type="date" value={f.requiredDate} onChange={e=>setFld("requiredDate",e.target.value)}/>
            </div>
          </div>

          {reqType==="field"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label className="lbl">Requested By</label><input className="inp" value={f.fieldRequestedBy} onChange={e=>setFld("fieldRequestedBy",e.target.value)} placeholder="Name of requester"/></div>
              <div><label className="lbl">Supervisor</label><input className="inp" value={f.fieldSupervisor} onChange={e=>setFld("fieldSupervisor",e.target.value)} placeholder="Supervisor name"/></div>
              <div><label className="lbl">Site Location</label><input className="inp" value={f.site} onChange={e=>setFld("site",e.target.value)} placeholder="e.g. Tower A - Floor 8"/></div>
              <div><label className="lbl">Suggested Vendor</label>
                <select className="sel" value={f.suggestedSupplier} onChange={e=>setFld("suggestedSupplier",e.target.value)}>
                  <option value="">— None / Unknown —</option>
                  {(suppliers||[]).filter(s=>s.active).map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {reqType==="estimation"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label className="lbl">Estimated Budget ($)</label><input className="inp" type="number" value={f.estimatedBudget} onChange={e=>setFld("estimatedBudget",e.target.value)} placeholder="0.00"/></div>
              <div><label className="lbl">Target Date</label><input className="inp" type="date" value={f.targetDate} onChange={e=>setFld("targetDate",e.target.value)}/></div>
              <div style={{gridColumn:"1/-1"}}><label className="lbl">Justification</label><textarea className="ta" value={f.justification} onChange={e=>setFld("justification",e.target.value)} placeholder="Why is this purchase needed?"/></div>
            </div>
          )}

          {/* LINE ITEMS */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <label className="lbl" style={{margin:0}}>Line Items ({f.items.length}) *</label>
              <button onClick={addItem} style={{fontSize:12,color:"#A8863A",fontWeight:700,background:"none",border:"none",cursor:"pointer",fontFamily:"Montserrat"}}>+ Add Item</button>
            </div>
            {f.items.map((item,idx)=>(
              <div key={item.id} style={{background:"#F7F5F1",border:"1px solid #E8E4DC",borderRadius:9,padding:"12px",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:20,height:20,borderRadius:5,background:"rgba(201,168,76,0.10)",border:"1px solid rgba(201,168,76,0.28)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#A8863A",fontFamily:"Montserrat",flexShrink:0}}>{idx+1}</div>
                  <div style={{flex:1,fontSize:11,color:"#8A8378",fontFamily:"Montserrat",fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Item {idx+1}</div>
                  {f.items.length>1&&<button onClick={()=>removeItem(idx)} style={{fontSize:11,color:"#D4745A",background:"none",border:"none",cursor:"pointer",fontWeight:700}}>Remove</button>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"3fr 1fr 1fr",gap:8,marginBottom:8}}>
                  <div><label className="lbl">Description *</label><input className="inp" value={item.description} onChange={e=>setItem(idx,"description",e.target.value)} placeholder="What is needed?"/></div>
                  <div><label className="lbl">Qty <span style={{color:"#C8C2B4",fontWeight:400}}>(opt)</span></label><input className="inp" type="number" value={item.qty} onChange={e=>setItem(idx,"qty",e.target.value)} placeholder="—"/></div>
                  <div><label className="lbl">Unit</label>
                    <select className="sel" value={item.unit} onChange={e=>setItem(idx,"unit",e.target.value)}>
                      {UNITS.map(u=><option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"2fr 2fr",gap:8}}>
                  <div><label className="lbl">Cost Code</label>
                    <select className="sel" value={item.costCode} onChange={e=>setItem(idx,"costCode",e.target.value)}>
                      <option value="">— Select cost code —</option>
                      {COST_CODES_SHORT.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label className="lbl">Notes / Specs</label><input className="inp" value={item.notes} onChange={e=>setItem(idx,"notes",e.target.value)} placeholder="Brand, spec, notes..."/></div>
                </div>
              </div>
            ))}
          </div>

          {/* Priority */}
          <div>
            <label className="lbl">Priority</label>
            <div style={{display:"flex",gap:10}}>
              {Object.entries(PRIORITY).map(([k,p])=>(
                <button key={k} onClick={()=>setFld("priority",k)} style={{flex:1,padding:"10px",border:`1.5px solid ${f.priority===k?p.color:"#E8E4DC"}`,borderRadius:8,cursor:"pointer",background:f.priority===k?p.bg:"#F7F5F1",color:f.priority===k?p.color:"#8A8378",fontFamily:"Montserrat",fontSize:11,fontWeight:700,transition:"all .15s"}}>
                  {p.dot} {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:20,paddingTop:14,borderTop:"1px solid #E8E4DC"}}>
          <button onClick={()=>setReqType(null)} style={{fontSize:12,color:"#8A8378",background:"none",border:"none",cursor:"pointer"}}>← Change type</button>
          <div style={{display:"flex",gap:10}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:0.45}}
              onClick={()=>onSubmit({
                ...f, reqType,
                description: f.items.map((it,i)=>`${i+1}. ${it.description}`).join(" | "),
                quantity: f.items[0]?.qty||1,
                unit: f.items[0]?.unit||"EA",
                costCode: f.items[0]?.costCode||"",
              })}>
              Generate PO →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RFQForm({ eligible, sups, onClose, onSubmit }) {
  const [f,setF]=useState({poId:eligible[0]?.id??"",description:"",quantity:"",unit:"",dueDate:"",notes:"",supplierIds:[]});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const toggle=id=>set("supplierIds",f.supplierIds.includes(id)?f.supplierIds.filter(s=>s!==id):[...f.supplierIds,id]);
  const selPO=eligible.find(r=>r.id===f.poId);
  useEffect(()=>{ if(selPO){set("description",selPO.description);set("quantity",selPO.quantity);set("unit",selPO.unit);} },[f.poId]);
  const valid=f.poId&&f.description&&f.dueDate&&f.supplierIds.length>=2;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div className="mod-title-text">Nueva Solicitud de Cotización (RFQ)</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        {eligible.length===0?<Empty icon="💬" msg="Sin POs disponibles" sub="Crea una requisición first" />:(
          <div style={{display:"grid",gap:14}}>
            <div><label className="lbl">PO asociada</label><select className="sel" value={f.poId} onChange={e=>set("poId",e.target.value)}>{eligible.map(r=><option key={r.id} value={r.id}>{r.id} · {r.description.slice(0,40)}</option>)}</select></div>
            <div><label className="lbl">Description</label><input className="inp" value={f.description} onChange={e=>set("description",e.target.value)} /></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <div><label className="lbl">Quantity</label><input className="inp" value={f.quantity} onChange={e=>set("quantity",e.target.value)} /></div>
              <div><label className="lbl">Unit</label><input className="inp" value={f.unit} onChange={e=>set("unit",e.target.value)} /></div>
              <div><label className="lbl">Due Date *</label><input className="inp" type="date" value={f.dueDate} onChange={e=>set("dueDate",e.target.value)} /></div>
            </div>
            <div><label className="lbl">Notes / especificaciones técnicas</label><textarea className="ta" value={f.notes} onChange={e=>set("notes",e.target.value)} /></div>
            <div>
              <label className="lbl">Vendors a consultar (mín. 2) — {f.supplierIds.length} seleccionados</label>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {sups.filter(s=>s.active).map(s=>(
                  <div key={s.id} onClick={()=>toggle(s.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:8,border:`1.5px solid ${f.supplierIds.includes(s.id)?B.gold:B.gray1}`,background:f.supplierIds.includes(s.id)?B.goldBg:B.offwhite,cursor:"pointer",transition:"all .15s"}}>
                    <div style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${f.supplierIds.includes(s.id)?B.gold:B.gray2}`,background:f.supplierIds.includes(s.id)?B.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                      {f.supplierIds.includes(s.id)&&<span style={{color:B.dark,fontSize:11,fontWeight:700}}>✓</span>}
                    </div>
                    <div style={{flex:1}}><div style={{fontSize:12,color:B.carbon,fontWeight:600}}>{s.name}</div><div style={{fontSize:11,color:B.gray3}}>{s.contact} · {s.email}</div></div>
                    <Stars r={s.rating} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:14,borderTop:`1px solid ${B.gray1}`}}>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:0.45}} onClick={()=>onSubmit(f)}>Crear y enviar RFQ →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RFQDetail({ rfq, sups, reqs, onClose, onRecord }) {
  const [recId,setRecId]=useState(null);
  const [rf,setRf]=useState({price:"",deliveryDays:"",paymentTerms:"COD",notes:""});
  const req=reqs.find(r=>r.id===rfq.poId);
  const answered=rfq.responses.filter(r=>r.status==="respondida");
  const bestPrice=answered.length?Math.min(...answered.map(r=>r.price)):null;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:780}}>
        <div className="mod-head">
          <div>
            <div style={{display:"flex",gap:8,marginBottom:6}}><span className="bgold">{rfq.id}</span><span className="bpo">{rfq.poId}</span></div>
            <div style={{fontFamily:"'Montserrat'",fontSize:15,fontWeight:800,color:B.carbon}}>{req?.description??"—"}</div>
            <div style={{fontSize:11,color:B.gray3,marginTop:2}}>Vence: {new Date(rfq.dueDate).toLocaleDateString("es-ES",{day:"2-digit",month:"long"})}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {answered.length>=2&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <div style={{background:B.goldBg,border:`1px solid ${B.goldBd}`,borderRadius:8,padding:"12px 16px"}}>
              <div style={{fontSize:10,color:B.goldD,fontWeight:700,fontFamily:"'Montserrat'",letterSpacing:1,marginBottom:3}}>MEJOR PRECIO</div>
              <div style={{fontFamily:"'Montserrat'",fontSize:20,fontWeight:900,color:B.goldD}}>${bestPrice?.toLocaleString()}</div>
            </div>
            <div style={{background:"rgba(90,173,122,.08)",border:"1px solid rgba(90,173,122,.25)",borderRadius:8,padding:"12px 16px"}}>
              <div style={{fontSize:10,color:"#5AAD7A",fontWeight:700,fontFamily:"'Montserrat'",letterSpacing:1,marginBottom:3}}>RESPUESTAS</div>
              <div style={{fontFamily:"'Montserrat'",fontSize:20,fontWeight:900,color:"#5AAD7A"}}>{answered.length}/{rfq.responses.length}</div>
            </div>
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {rfq.responses.map(res=>{
            const sup=sups.find(s=>s.id===res.supplierId);
            const isRec=recId===res.supplierId;
            const isBest=answered.length>1&&res.price===bestPrice;
            return(<div key={res.supplierId} style={{background:B.offwhite,border:`1px solid ${B.gray1}`,borderRadius:10,padding:"12px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:isRec?12:0}}>
                <div style={{flex:1}}><div style={{fontSize:13,color:B.carbon,fontWeight:600}}>{sup?.name}</div><div style={{fontSize:11,color:B.gray3}}>{sup?.email}</div></div>
                {res.status==="respondida"?(
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'Montserrat'",fontSize:16,fontWeight:800,color:isBest?B.goldD:B.carbon}}>${res.price?.toLocaleString()} {isBest?"⭐":""}</div>
                      <div style={{fontSize:10,color:B.gray3}}>{res.deliveryDays}d · {res.paymentTerms}</div>
                    </div>
                    <span className="chip" style={{background:"rgba(90,173,122,.12)",color:"#5AAD7A"}}>✓ Respondida</span>
                  </div>
                ):(
                  <div style={{display:"flex",gap:8}}>
                    <span className="chip" style={{background:B.goldBg,color:B.goldD}}>⏳ Pending</span>
                    <button className="btn btn-dark btn-sm" onClick={()=>{setRecId(res.supplierId);setRf({price:"",deliveryDays:"",paymentTerms:"COD",notes:""});}}>Registrar respuesta</button>
                  </div>
                )}
              </div>
              {isRec&&(
                <div style={{borderTop:`1px solid ${B.gray1}`,paddingTop:10}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 2fr",gap:8,marginBottom:8}}>
                    <div><label className="lbl">Precio unit.</label><input className="inp" type="number" value={rf.price} onChange={e=>setRf(p=>({...p,price:e.target.value}))} /></div>
                    <div><label className="lbl">Días entrega</label><input className="inp" type="number" value={rf.deliveryDays} onChange={e=>setRf(p=>({...p,deliveryDays:e.target.value}))} /></div>
                    <div><label className="lbl">Cond. pago</label><select className="sel" value={rf.paymentTerms} onChange={e=>setRf(p=>({...p,paymentTerms:e.target.value}))}>{PAYMENT_OPTIONS.map(o=><option key={o}>{o}</option>)}</select></div>
                    <div><label className="lbl">Notes</label><input className="inp" value={rf.notes} onChange={e=>setRf(p=>({...p,notes:e.target.value}))} /></div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn btn-gold btn-sm" disabled={!rf.price||!rf.deliveryDays} onClick={()=>{onRecord(rfq.id,res.supplierId,{price:parseFloat(rf.price),deliveryDays:parseInt(rf.deliveryDays),paymentTerms:rf.paymentTerms,notes:rf.notes});setRecId(null);}}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setRecId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>);
          })}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end"}}><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

function AddSupForm({ onClose, onSubmit }) {
  const [f,setF]=useState({name:"",contact:"",email:"",phone:"",category:"General Materials"});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const valid=f.name&&f.contact&&f.email;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:500}}>
        <div className="mod-head"><div className="mod-title-text">Agregar Vendor</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:12}}>
          <div><label className="lbl">Empresa *</label><input className="inp" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Razón social" /></div>
          <div><label className="lbl">Persona de contacto *</label><input className="inp" value={f.contact} onChange={e=>set("contact",e.target.value)} /></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label className="lbl">Email *</label><input className="inp" type="email" value={f.email} onChange={e=>set("email",e.target.value)} /></div>
            <div><label className="lbl">Phone</label><input className="inp" value={f.phone} onChange={e=>set("phone",e.target.value)} /></div>
          </div>
          <div><label className="lbl">Category</label><select className="sel" value={f.category} onChange={e=>set("category",e.target.value)}>{["Materiales","Equipos","Servicios","Repuestos","Consumibles","Transporte","Otro"].map(c=><option key={c}>{c}</option>)}</select></div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20,paddingTop:14,borderTop:`1px solid ${B.gray1}`}}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:0.45}} onClick={()=>onSubmit(f)}>Add vendor →</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CMP
// ─────────────────────────────────────────────────────────────────────────────
function CMPPage({ ctx }) {
  const {reqs,rfqs,cmps,saveCmps,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyRFQs=rfqs.filter(r=>r.responses.filter(res=>res.status==="respondida").length>=2&&!cmps.find(c=>c.rfqId===r.id));

  const handleCreate=async(rfqId,payMap)=>{
    const rfq=rfqs.find(r=>r.id===rfqId);
    const enriched=rfq.responses.filter(r=>r.status==="respondida").map(r=>({...r,paymentTerms:payMap[r.supplierId]??"COD"}));
    const scored=scoreSuppliers(enriched,sups);
    const cmp={id:genId("CMP",cmps.length+1),rfqId,poId:rfq.poId,createdAt:new Date().toISOString(),scored,winnerId:scored[0]?.supplierId,status:"pending"};
    const updCmps=[cmp,...cmps];
    const updReqs=reqs.map(r=>r.id===rfq.poId?{...r,stage:"CMP",history:[...r.history,{stage:"CMP",date:new Date().toISOString(),note:`CMP ${cmp.id} generado. Ganador: ${scored[0]?.sup?.name}`}]}:r);
    await saveCmps(updCmps); await saveReqs(updReqs);
    setShowNew(false); showToast(`${cmp.id} generado — Ganador: ${scored[0]?.sup?.name}`);
  };

  const handleApprove=async(cmpId,winnerId)=>{
    const updated=cmps.map(c=>c.id===cmpId?{...c,status:"approved",winnerId,approvedAt:new Date().toISOString()}:c);
    const cmp=updated.find(c=>c.id===cmpId); const ws=sups.find(s=>s.id===winnerId);
    const updReqs=reqs.map(r=>r.id===cmp?.poId?{...r,stage:"PO",history:[...r.history,{stage:"PO",date:new Date().toISOString(),note:`Vendor approved: ${ws?.name}`}]}:r);
    await saveCmps(updated); await saveReqs(updReqs);
    if(selected?.id===cmpId)setSelected(updated.find(c=>c.id===cmpId));
    showToast(`Approved → ${ws?.name} → lista para emitir OC`);
  };

  const bc=s=>s>=80?"#5AAD7A":s>=60?B.goldD:"#D4745A";

  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">⚖️ Comparación de Vendors</div><div className="ph-sub">Scoring automático — Precio 60% · Entrega 25% · Pago 15%</div></div>
        {readyRFQs.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Nuevo cuadro</button>}
      </div>
      <div className="pb">
        <div className="gold-line" />
        <div className="card" style={{overflow:"hidden"}}>
          <SectionHeader title={`Cuadros Comparativos · ${cmps.length} generados`} action={readyRFQs.length>0&&<span style={{fontSize:11,color:B.goldD,fontFamily:"'Montserrat'",fontWeight:700}}>{readyRFQs.length} RFQ lista para comparar</span>} />
          {cmps.length===0?<Empty icon="⚖️" msg="Sin cuadros comparativos" sub={readyRFQs.length>0?"Genera el primer cuadro":"Registra respuestas de proveedores en RFQ"} />:
          cmps.map(c=>{
            const req=reqs.find(r=>r.id===c.poId); const winner=sups.find(s=>s.id===c.winnerId); const top=c.scored?.[0];
            return(<div key={c.id} className="trow" onClick={()=>setSelected(c)}>
              <div style={{display:"flex",flexDirection:"column",gap:4}}><span className="bgold">{c.id}</span><span className="bpo" style={{fontSize:10,padding:"2px 8px"}}>{c.poId}</span></div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:B.carbon,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description??"—"}</div>
                <div style={{fontSize:11,color:B.gray3}}>Vendor recomendado: <strong style={{color:"#5AAD7A"}}>{winner?.name??"—"}</strong></div>
              </div>
              {top&&<div style={{textAlign:"center",padding:"6px 12px",background:`${bc(top.total)}10`,borderRadius:6,border:`1px solid ${bc(top.total)}25`}}><div style={{fontFamily:"'Montserrat'",fontSize:18,fontWeight:900,color:bc(top.total)}}>{top.total}</div><div style={{fontSize:9,color:B.gray3,fontWeight:600}}>SCORE</div></div>}
              <span className="chip" style={{background:c.status==="approved"?"rgba(90,173,122,.12)":B.goldBg,color:c.status==="approved"?"#5AAD7A":B.goldD}}>{c.status==="approved"?"✓ Approved":"⏳ Pending"}</span>
              <span style={{color:B.gray2,fontSize:14}}>›</span>
            </div>);
          })}
        </div>
      </div>
      {showNew&&<CMPForm readyRFQs={readyRFQs} reqs={reqs} sups={sups} onClose={()=>setShowNew(false)} onSubmit={handleCreate} />}
      {selected&&<CMPDetail cmp={selected} sups={sups} reqs={reqs} onClose={()=>setSelected(null)} onApprove={handleApprove} />}
    </div>
  );
}

function CMPForm({ readyRFQs, reqs, sups, onClose, onSubmit }) {
  const [rfqId,setRfqId]=useState(readyRFQs[0]?.id??"");
  const [payMap,setPayMap]=useState({});
  const rfq=readyRFQs.find(r=>r.id===rfqId);
  const answers=rfq?.responses.filter(r=>r.status==="respondida")??[];
  const enriched=answers.map(r=>({...r,paymentTerms:payMap[r.supplierId]??"COD"}));
  const preview=scoreSuppliers(enriched,sups);
  const bc=s=>s>=80?"#5AAD7A":s>=60?B.goldD:"#D4745A";
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div className="mod-title-text">Nuevo Cuadro Comparativo</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">RFQ a comparar</label><select className="sel" value={rfqId} onChange={e=>setRfqId(e.target.value)}>{readyRFQs.map(r=>{const req=reqs.find(req=>req.id===r.poId);return<option key={r.id} value={r.id}>{r.id} · {req?.description?.slice(0,42)??r.id}</option>;})}</select></div>
          <div><label className="lbl">Condiciones de pago por proveedor</label>
            {answers.map(r=>{const sup=sups.find(s=>s.id===r.supplierId);return(
              <div key={r.supplierId} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,alignItems:"center",padding:"10px 14px",background:B.offwhite,border:`1px solid ${B.gray1}`,borderRadius:8,marginBottom:6}}>
                <div><div style={{fontSize:12,color:B.carbon,fontWeight:600}}>{sup?.name}</div><div style={{fontSize:11,color:B.gray3}}>${r.price?.toLocaleString()} · {r.deliveryDays}d</div></div>
                <select className="sel" value={payMap[r.supplierId]??"COD"} onChange={e=>setPayMap(m=>({...m,[r.supplierId]:e.target.value}))}>{PAYMENT_OPTIONS.map(o=><option key={o}>{o}</option>)}</select>
              </div>);
            })}
          </div>
          {preview.length>=2&&(
            <div><label className="lbl">Vista previa del scoring</label>
              {preview.map((r,i)=>(
                <div key={r.supplierId} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:i===0?"rgba(90,173,122,.06)":B.offwhite,border:`1px solid ${i===0?"rgba(90,173,122,.25)":B.gray1}`,borderRadius:10,marginBottom:6}}>
                  <div style={{textAlign:"center",width:44,flexShrink:0}}>
                    <div style={{fontFamily:"'Montserrat'",fontSize:20,fontWeight:900,color:bc(r.total)}}>{r.total}</div>
                    <div style={{fontSize:10}}>{i===0?"🥇":i===1?"🥈":"🥉"}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,color:B.carbon,fontWeight:700,marginBottom:6}}>{r.sup?.name}</div>
                    <div style={{display:"flex",gap:8}}>
                      {[["P",r.ps,"#5AAD7A","60%"],[" E",r.ds,"#5B9BD5","25%"],["$",r.ws,B.gold,"15%"]].map(([l,s,c,w])=>(
                        <div key={l} style={{flex:1}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:B.gray3,marginBottom:2,fontFamily:"'Montserrat'",fontWeight:600}}><span>{l}({w})</span><span style={{color:c}}>{s}</span></div>
                          <div style={{height:3,background:B.gray1,borderRadius:2}}><div style={{width:`${s}%`,height:"100%",background:c,borderRadius:2}}/></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:14,borderTop:`1px solid ${B.gray1}`}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={preview.length<2} style={{opacity:preview.length<2?0.45:1}} onClick={()=>onSubmit(rfqId,payMap)}>Generar cuadro comparativo →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CMPDetail({ cmp, sups, reqs, onClose, onApprove }) {
  const [override,setOverride]=useState(cmp.winnerId);
  const req=reqs.find(r=>r.id===cmp.poId);
  const bc=s=>s>=80?"#5AAD7A":s>=60?B.goldD:"#D4745A";
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:860}}>
        <div className="mod-head">
          <div><div style={{display:"flex",gap:8,marginBottom:6}}><span className="bgold">{cmp.id}</span><span className="bpo">{cmp.poId}</span></div><div style={{fontFamily:"'Montserrat'",fontSize:15,fontWeight:800,color:B.carbon}}>{req?.description??"—"}</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{background:B.goldBg,border:`1px solid ${B.goldBd}`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,color:B.goldD,fontFamily:"'Montserrat'",fontWeight:600}}>
          ⚖️ Ponderación: Precio 60% · Entrega 25% · Condiciones de pago 15%
        </div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${cmp.scored?.length??1},1fr)`,gap:12,marginBottom:18}}>
          {(cmp.scored??[]).map((r,i)=>{
            const isWin=override===r.supplierId;
            return(<div key={r.supplierId} onClick={()=>cmp.status==="pending"&&setOverride(r.supplierId)} style={{padding:"16px",borderRadius:10,background:isWin?"rgba(90,173,122,.06)":B.offwhite,border:`2px solid ${isWin?"#5AAD7A":B.gray1}`,cursor:cmp.status==="pending"?"pointer":"default",transition:"all .2s",boxShadow:isWin?"0 4px 16px rgba(90,173,122,.15)":"none"}}>
              <div style={{textAlign:"center",marginBottom:12}}>
                <div style={{fontSize:16,marginBottom:4}}>{i===0?"🥇":i===1?"🥈":"🥉"}</div>
                <div style={{fontFamily:"'Montserrat'",fontSize:26,fontWeight:900,color:bc(r.total)}}>{r.total}</div>
                <div style={{fontSize:9,color:B.gray3,fontFamily:"'Montserrat'",fontWeight:700,letterSpacing:.5}}>SCORE TOTAL</div>
              </div>
              <div style={{textAlign:"center",marginBottom:12}}>
                <div style={{fontSize:12,color:B.carbon,fontWeight:700,fontFamily:"'Montserrat'"}}>{r.sup?.name}</div>
                <div style={{fontSize:10,color:B.gray3}}>{r.sup?.contact}</div>
              </div>
              <div style={{background:B.white,borderRadius:8,padding:"10px",marginBottom:12,textAlign:"center",border:`1px solid ${B.gray1}`}}>
                <div style={{fontFamily:"'Montserrat'",fontSize:18,fontWeight:900,color:B.carbon}}>${r.price?.toLocaleString()}</div>
                <div style={{fontSize:10,color:B.gray3}}>{r.deliveryDays} días · {r.paymentTerms}</div>
              </div>
              {[["Precio",r.ps,"#5AAD7A","60%"],["Entrega",r.ds,"#5B9BD5","25%"],["Pago",r.ws,B.gold,"15%"]].map(([l,s,c,w])=>(
                <div key={l} style={{marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:B.gray3,marginBottom:2,fontFamily:"'Montserrat'",fontWeight:700}}><span>{l} ({w})</span><span style={{color:c}}>{s}/100</span></div>
                  <div style={{height:5,background:B.gray1,borderRadius:3}}><div style={{width:`${s}%`,height:"100%",background:c,borderRadius:3}}/></div>
                </div>
              ))}
              {cmp.status==="pending"&&<div style={{textAlign:"center",marginTop:10,fontSize:10,color:isWin?"#5AAD7A":B.gray3,fontFamily:"'Montserrat'",fontWeight:700}}>{isWin?"✓ SELECCIONADO":"Clic para seleccionar"}</div>}
            </div>);
          })}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {cmp.status==="pending"?<button className="btn btn-gold" onClick={()=>onApprove(cmp.id,override)}>✓ Aprobar y emitir Orden de Compra →</button>:<span style={{padding:"10px 18px",background:"rgba(90,173,122,.12)",border:"1px solid rgba(90,173,122,.3)",borderRadius:6,fontSize:12,color:"#5AAD7A",fontFamily:"'Montserrat'",fontWeight:700}}>✅ Approved</span>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PO
// ─────────────────────────────────────────────────────────────────────────────
function POPage({ ctx }) {
  const {reqs,cmps,orders,saveOrders,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyCMPs=cmps.filter(c=>c.status==="approved"&&!orders.find(o=>o.cmpId===c.id));
  const handleCreate=async(data)=>{
    const o={...data,id:data.poNumber,createdAt:new Date().toISOString(),approvalStatus:"pending",sentToSupplier:false};
    await saveOrders([o,...orders]);
    setShowNew(false); showToast(`${o.id} creada — pending de aprobación gerencial`);
  };
  const handleApprove=async(oId,name)=>{
    const updated=orders.map(o=>o.id===oId?{...o,approvalStatus:"approved",approvedBy:name,approvedAt:new Date().toISOString()}:o);
    const ord=updated.find(o=>o.id===oId);
    const updReqs=reqs.map(r=>r.id===ord?.poId?{...r,stage:"DEL",history:[...r.history,{stage:"DEL",date:new Date().toISOString(),note:`OC aprobada por ${name}. En espera de delivery.`}]}:r);
    await saveOrders(updated); await saveReqs(updReqs);
    if(selected?.id===oId)setSelected(updated.find(o=>o.id===oId));
    showToast(`OC aprobada por ${name} → Delivery`);
  };
  const handleSent=async(oId)=>{
    const updated=orders.map(o=>o.id===oId?{...o,sentToSupplier:true,sentAt:new Date().toISOString()}:o);
    await saveOrders(updated);
    if(selected?.id===oId)setSelected(updated.find(o=>o.id===oId));
    showToast("Marcada como sent al proveedor");
  };
  const stMap={pending:{l:"Pend. Aprobación",c:B.goldD},approved:{l:"Aprobada",c:"#5AAD7A"},rejected:{l:"Rejected",c:"#D4745A"}};
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">📄 Orden de Compra</div><div className="ph-sub">Emisión de OC y flujo de aprobación gerencial</div></div>
        {readyCMPs.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Emitir OC</button>}
      </div>
      <div className="pb">
        <div className="gold-line" />
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[["Pend. Aprobación",orders.filter(o=>o.approvalStatus==="pending").length,B.goldD],["Aprobadas",orders.filter(o=>o.approvalStatus==="approved").length,"#5AAD7A"],["Sents",orders.filter(o=>o.sentToSupplier).length,"#5B9BD5"]].map(([l,v,c])=>(
            <div key={l} className="stat" style={{"--sc":c}}><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
          ))}
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SectionHeader title="Órdenes de Compra" action={readyCMPs.length>0&&<span style={{fontSize:11,color:"#D4745A",fontFamily:"'Montserrat'",fontWeight:700}}>{readyCMPs.length} lista{readyCMPs.length>1?"s":""} para emitir</span>} />
          {orders.length===0?<Empty icon="📄" msg="No orders" sub={readyCMPs.length>0?"Emite la primera OC":"Aprueba un comparativo first"} />:
          orders.map(o=>{
            const req=reqs.find(r=>r.id===o.poId); const sup=sups.find(s=>s.id===o.supplierId); const st=stMap[o.approvalStatus];
            return(<div key={o.id} className="trow" onClick={()=>setSelected(o)}>
              <span className="bpo">{o.id}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:B.carbon,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description??"—"}</div>
                <div style={{fontSize:11,color:B.gray3}}>{sup?.name} · ${parseFloat(o.totalAmount||0).toLocaleString()} · {o.paymentTerms}</div>
              </div>
              {o.sentToSupplier&&<span className="chip" style={{background:"rgba(91,155,213,.12)",color:"#5B9BD5"}}>📬 Sent</span>}
              <span className="chip" style={{background:`${st.c}15`,color:st.c}}>● {st.l}</span>
              <span style={{color:B.gray2,fontSize:14}}>›</span>
            </div>);
          })}
        </div>
      </div>
      {showNew&&<POForm readyCMPs={readyCMPs} cmps={cmps} reqs={reqs} sups={sups} onClose={()=>setShowNew(false)} onSubmit={handleCreate} />}
      {selected&&<PODetail order={selected} reqs={reqs} sups={sups} onClose={()=>setSelected(null)} onApprove={handleApprove} onSent={handleSent} />}
    </div>
  );
}

function POForm({ readyCMPs, cmps, reqs, sups, onClose, onSubmit }) {
  const [cmpId,setCmpId]=useState(readyCMPs[0]?.id??"");
  const [f,setF]=useState({deliveryAddress:"",paymentTerms:"",contactName:"",contactEmail:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const cmp=cmps.find(c=>c.id===cmpId); const req=reqs.find(r=>r.id===cmp?.poId); const sup=sups.find(s=>s.id===cmp?.winnerId);
  const win=cmp?.scored?.find(s=>s.supplierId===cmp.winnerId);
  const total=win&&req?parseFloat(req.quantity)*parseFloat(win.price):0;
  const valid=cmpId&&f.deliveryAddress&&f.paymentTerms&&f.contactName;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div><div className="mod-title-text">Emitir Orden de Compra</div><div style={{fontSize:11,color:B.gray3,marginTop:2}}>Los datos del ítem y proveedor se cargan automáticamente desde el comparativo</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">Comparativo approved</label><select className="sel" value={cmpId} onChange={e=>setCmpId(e.target.value)}>{readyCMPs.map(c=>{const r=reqs.find(r=>r.id===c.poId);return<option key={c.id} value={c.id}>{c.id} · {r?.description?.slice(0,42)??c.id}</option>;})}</select></div>
          {cmp&&<div style={{background:B.goldBg,border:`1px solid ${B.goldBd}`,borderRadius:8,padding:"12px 16px"}}>
            <div style={{fontSize:10,color:B.goldD,fontFamily:"'Montserrat'",fontWeight:700,letterSpacing:1,marginBottom:10}}>DATOS CARGADOS AUTOMÁTICAMENTE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[["Número PO",req?.id],["Vendor",sup?.name],["Total OC",`$${total.toLocaleString()}`]].map(([k,v])=><div key={k}><div style={{fontSize:9,color:B.goldD,fontFamily:"'Montserrat'",fontWeight:700,marginBottom:2}}>{k}</div><div style={{fontSize:13,color:B.carbon,fontWeight:700}}>{v}</div></div>)}
            </div>
          </div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{gridColumn:"1/-1"}}><label className="lbl">Dirección de entrega *</label><input className="inp" value={f.deliveryAddress} onChange={e=>set("deliveryAddress",e.target.value)} placeholder="Calle, Ciudad, Estado, País" /></div>
            <div><label className="lbl">Condiciones de pago *</label><input className="inp" value={f.paymentTerms} onChange={e=>set("paymentTerms",e.target.value)} placeholder="Crédito 30 días, Contado…" /></div>
            <div><label className="lbl">Contacto del proveedor *</label><input className="inp" value={f.contactName} onChange={e=>set("contactName",e.target.value)} /></div>
            <div><label className="lbl">Email del contacto</label><input className="inp" type="email" value={f.contactEmail} onChange={e=>set("contactEmail",e.target.value)} /></div>
            <div><label className="lbl">Notes adicionales</label><input className="inp" value={f.notes} onChange={e=>set("notes",e.target.value)} /></div>
          </div>
          <div style={{padding:"10px 14px",background:"rgba(201,168,76,.08)",border:`1px solid ${B.goldBd}`,borderRadius:8,fontSize:12,color:B.goldD,fontFamily:"'Montserrat'",fontWeight:600}}>
            ⚠️ Al crear la OC quedará en estado Pending de Aprobación hasta que un gerente la apruebe.
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:14,borderTop:`1px solid ${B.gray1}`}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:0.45}} onClick={()=>onSubmit({poNumber:req?.id,poId:req?.id,cmpId,supplierId:cmp?.winnerId,description:req?.description,quantity:req?.quantity,unit:req?.unit,unitPrice:win?.price,totalAmount:total.toFixed(2),deliveryDays:win?.deliveryDays,...f})}>Crear OC y enviar a aprobación →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PODetail({ order, reqs, sups, onClose, onApprove, onSent }) {
  const [approver,setApprover]=useState("");
  const req=reqs.find(r=>r.id===order.poId); const sup=sups.find(s=>s.id===order.supplierId);
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:660}}>
        <div className="mod-head">
          <div><span className="bpo">{order.id}</span><div style={{fontFamily:"'Montserrat'",fontSize:15,fontWeight:800,color:B.carbon,marginTop:6}}>{req?.description??"—"}</div><div style={{fontSize:11,color:B.gray3,marginTop:2}}>{sup?.name} · ${parseFloat(order.totalAmount||0).toLocaleString()}</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card" style={{padding:"14px 16px",marginBottom:14}}><ProgressBar stage={req?.stage??"PO"} /></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[["Vendor",sup?.name],["Contacto",order.contactName],["Cond. pago",order.paymentTerms],["Días entrega",`${order.deliveryDays} días hábiles`],["Dirección entrega",order.deliveryAddress],["Total OC",`$${parseFloat(order.totalAmount||0).toLocaleString()}`]].map(([k,v])=>(
            <div key={k} style={{background:B.offwhite,borderRadius:8,padding:"10px 14px",border:`1px solid ${B.gray1}`}}>
              <div style={{fontSize:9,color:B.gray3,fontFamily:"'Montserrat'",fontWeight:700,letterSpacing:.5,marginBottom:3}}>{k.toUpperCase()}</div>
              <div style={{fontSize:12,color:B.carbon,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
        {order.approvalStatus==="pending"&&(
          <div style={{background:B.offwhite,border:`1px solid ${B.gray1}`,borderRadius:10,padding:"14px 16px",marginBottom:14}}>
            <div style={{fontSize:11,color:B.gray3,marginBottom:10,fontFamily:"'Montserrat'",fontWeight:600}}>APROBACIÓN GERENCIAL REQUERIDA</div>
            <div style={{display:"flex",gap:8}}>
              <input className="inp" placeholder="Nombre del gerente que aprueba" value={approver} onChange={e=>setApprover(e.target.value)} style={{flex:1}} />
              <button className="btn btn-success" disabled={!approver} style={{opacity:approver?1:0.45}} onClick={()=>onApprove(order.id,approver)}>✓ Aprobar OC</button>
            </div>
          </div>
        )}
        {order.approvalStatus==="approved"&&!order.sentToSupplier&&(
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
            <button className="btn btn-gold" onClick={()=>onSent(order.id)}>📬 Marcar como sent al proveedor →</button>
          </div>
        )}
        {order.approvalStatus==="approved"&&(
          <div style={{padding:"10px 14px",background:"rgba(90,173,122,.08)",border:"1px solid rgba(90,173,122,.25)",borderRadius:8,fontSize:12,color:"#5AAD7A",fontFamily:"'Montserrat'",fontWeight:600}}>
            ✅ Aprobada por {order.approvedBy}{order.sentToSupplier?" · 📬 Sent al proveedor":""}
          </div>
        )}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEL
// ─────────────────────────────────────────────────────────────────────────────
function DELPage({ ctx }) {
  const {reqs,orders,dels,saveDels,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyOrders=orders.filter(o=>o.approvalStatus==="approved"&&!dels.find(d=>d.orderId===o.id));
  const handleCreate=async(data)=>{
    const d={...data,id:genId("DEL",dels.length+1),createdAt:new Date().toISOString(),status:"in_transit",partials:data.partials.map((p,i)=>({...p,id:`P${i+1}`,received:false,receivedAt:null,receivedQty:0})),events:[{date:new Date().toISOString(),note:"Plan de delivery registrado",icon:"📋"}]};
    await saveDels([d,...dels]);
    setShowNew(false); showToast(`${d.id} registrado`);
  };
  const handlePartial=async(delId,partialId,qty,note)=>{
    const updated=dels.map(d=>{
      if(d.id!==delId)return d;
      const partials=d.partials.map(p=>p.id===partialId?{...p,received:true,receivedAt:new Date().toISOString(),receivedQty:qty}:p);
      const allDone=partials.every(p=>p.received); const anyDone=partials.some(p=>p.received);
      return{...d,partials,status:allDone?"completed":anyDone?"partial":"in_transit",events:[...d.events,{date:new Date().toISOString(),note:note||`Parcial ${partialId} recibida`,icon:"📦"}]};
    });
    const del=updated.find(d=>d.id===delId);
    if(del?.status==="completed"){
      const updReqs=reqs.map(r=>r.id===del.poId?{...r,stage:"RCV",history:[...r.history,{stage:"RCV",date:new Date().toISOString(),note:`Delivery ${delId} completed. Listo para verificación.`}]}:r);
      await saveReqs(updReqs);
    }
    await saveDels(updated);
    if(selected?.id===delId)setSelected(updated.find(d=>d.id===delId));
    showToast(del?.status==="completed"?"Delivery completo → Recepción":"Parcial registrada");
  };
  const handleDelay=async(delId,reason)=>{
    const updated=dels.map(d=>d.id===delId?{...d,status:"delayed",events:[...d.events,{date:new Date().toISOString(),note:`Retraso: ${reason}`,icon:"⚠️"}]}:d);
    await saveDels(updated);
    if(selected?.id===delId)setSelected(updated.find(d=>d.id===delId));
    showToast("Retraso registrado","⚠️");
  };
  const stC={in_transit:"#4AADA0",partial:B.goldD,completed:"#5AAD7A",delayed:"#D4745A"};
  const stL={in_transit:"En camino",partial:"Parcial",completed:"Completado",delayed:"Retrasado"};
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">🚚 Delivery</div><div className="ph-sub">Planificación, seguimiento de entregas y alertas</div></div>
        {readyOrders.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Registrar Delivery</button>}
      </div>
      <div className="pb">
        <div className="gold-line" />
        {dels.filter(d=>d.status!=="completed"&&(d.status==="delayed"||daysUntil(d.expectedDate)<=3)).map(d=>{
          const days=daysUntil(d.expectedDate); const req=reqs.find(r=>r.id===d.poId);
          return(<div key={d.id} onClick={()=>setSelected(d)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:"rgba(212,116,90,.06)",border:"1px solid rgba(212,116,90,.2)",borderRadius:8,marginBottom:8,cursor:"pointer",fontSize:12}}>
            <span>🔴</span>
            <span style={{color:"#D4745A",fontWeight:600,flex:1,fontFamily:"'Montserrat'"}}>{req?.description?.slice(0,50)} — {d.status==="delayed"?"Retraso reportado":days<0?`${Math.abs(days)}d de atraso`:days===0?"Entrega hoy":`${days}d para entrega`}</span>
            <span style={{fontSize:11,color:B.gray3}}>Ver detalles →</span>
          </div>);
        })}
        <div className="card" style={{overflow:"hidden"}}>
          <SectionHeader title="Seguimiento de Entregas" action={readyOrders.length>0&&<span style={{fontSize:11,color:"#4AADA0",fontFamily:"'Montserrat'",fontWeight:700}}>{readyOrders.length} OC lista{readyOrders.length>1?"s":""} para planificar</span>} />
          {dels.length===0?<Empty icon="🚚" msg="No deliveries" sub={readyOrders.length>0?"Registra el primer plan de entrega":"Aprueba y envía una OC first"} />:
          dels.map(d=>{
            const req=reqs.find(r=>r.id===d.poId); const sup=sups.find(s=>s.id===d.supplierId);
            const rec=d.partials.reduce((a,p)=>a+(p.received?p.qty:0),0); const tot=d.partials.reduce((a,p)=>a+p.qty,0);
            const days=daysUntil(d.expectedDate);
            return(<div key={d.id} className="trow" onClick={()=>setSelected(d)}>
              <div style={{width:44,height:44,borderRadius:8,background:`${stC[d.status]}10`,border:`1px solid ${stC[d.status]}30`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Montserrat'",fontSize:12,fontWeight:800,color:stC[d.status],flexShrink:0}}>
                {tot>0?`${Math.round(rec/tot*100)}%`:"0%"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:B.carbon,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description??"—"}</div>
                <div style={{fontSize:11,color:B.gray3}}>{sup?.name} · {rec}/{tot} {req?.unit}</div>
              </div>
              <div style={{textAlign:"right",fontSize:11,fontFamily:"'Montserrat'",fontWeight:700,color:days<0?"#D4745A":days<=3?"#D4745A":days<=7?B.goldD:"#5AAD7A"}}>{days<0?`${Math.abs(days)}d atraso`:days===0?"Hoy":`${days}d`}</div>
              <span className="chip" style={{background:`${stC[d.status]}12`,color:stC[d.status]}}>● {stL[d.status]}</span>
              <span style={{color:B.gray2,fontSize:14}}>›</span>
            </div>);
          })}
        </div>
      </div>
      {showNew&&<DELForm orders={readyOrders} reqs={reqs} sups={sups} onClose={()=>setShowNew(false)} onSubmit={handleCreate} />}
      {selected&&<DELDetail del={selected} reqs={reqs} sups={sups} onClose={()=>setSelected(null)} onPartial={handlePartial} onDelay={handleDelay} />}
    </div>
  );
}

function DELForm({ orders, reqs, sups, onClose, onSubmit }) {
  const [orderId,setOrderId]=useState(orders[0]?.id??"");
  const [f,setF]=useState({expectedDate:"",logisticsType:"entrega",trackingNumber:"",notes:""});
  const [partials,setPartials]=useState([{qty:"",expectedDate:"",note:""}]);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const order=orders.find(o=>o.id===orderId); const req=reqs.find(r=>r.id===order?.poId);
  const valid=orderId&&f.expectedDate&&partials.every(p=>p.qty&&p.expectedDate);
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div className="mod-title-text">Registrar Plan de Delivery</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">Orden de Compra</label><select className="sel" value={orderId} onChange={e=>setOrderId(e.target.value)}>{orders.map(o=>{const r=reqs.find(r=>r.id===o.poId);return<option key={o.id} value={o.id}>{o.id} · {r?.description?.slice(0,40)??o.id}</option>;})}</select></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><label className="lbl">Fecha esperada *</label><input className="inp" type="date" value={f.expectedDate} onChange={e=>set("expectedDate",e.target.value)} /></div>
            <div><label className="lbl">Logística</label><select className="sel" value={f.logisticsType} onChange={e=>set("logisticsType",e.target.value)}><option value="entrega">🚚 Vendor entrega</option><option value="recogida">🏭 Nosotros recogemos</option></select></div>
            <div><label className="lbl">N° Guía / tracking</label><input className="inp" value={f.trackingNumber} onChange={e=>set("trackingNumber",e.target.value)} placeholder="Opcional" /></div>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><label className="lbl" style={{margin:0}}>Entregas partiales *</label><button onClick={()=>setPartials(p=>[...p,{qty:"",expectedDate:"",note:""}])} style={{fontSize:11,color:B.gold,fontWeight:700,background:"none",border:"none",cursor:"pointer",fontFamily:"'Montserrat'"}}>+ Agregar</button></div>
            {partials.map((p,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr auto",gap:8,marginBottom:6,alignItems:"end"}}>
                <div>{i===0&&<label className="lbl">Quantity *</label>}<input className="inp" type="number" placeholder="0" value={p.qty} onChange={e=>setPartials(ps=>ps.map((x,j)=>j===i?{...x,qty:e.target.value}:x))} /></div>
                <div>{i===0&&<label className="lbl">Fecha *</label>}<input className="inp" type="date" value={p.expectedDate} onChange={e=>setPartials(ps=>ps.map((x,j)=>j===i?{...x,expectedDate:e.target.value}:x))} /></div>
                <div>{i===0&&<label className="lbl">Nota</label>}<input className="inp" placeholder={`Entrega ${i+1}`} value={p.note} onChange={e=>setPartials(ps=>ps.map((x,j)=>j===i?{...x,note:e.target.value}:x))} /></div>
                <button onClick={()=>setPartials(ps=>ps.filter((_,j)=>j!==i))} disabled={partials.length===1} style={{background:"none",border:"none",cursor:"pointer",color:"#D4745A",fontSize:14,opacity:partials.length===1?0.3:1,paddingBottom:i===0?8:0}}>✕</button>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:14,borderTop:`1px solid ${B.gray1}`}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:0.45}} onClick={()=>onSubmit({orderId,poId:order?.poId,supplierId:order?.supplierId,...f,partials})}>Registrar plan →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DELDetail({ del, reqs, sups, onClose, onPartial, onDelay }) {
  const [recId,setRecId]=useState(null);
  const [rq,setRq]=useState({qty:"",note:""});
  const [delayR,setDelayR]=useState(""); const [showDelay,setShowDelay]=useState(false);
  const req=reqs.find(r=>r.id===del.poId); const sup=sups.find(s=>s.id===del.supplierId);
  const rec=del.partials.reduce((a,p)=>a+(p.received?p.qty:0),0); const tot=del.partials.reduce((a,p)=>a+p.qty,0);
  const stC={in_transit:"#4AADA0",partial:B.goldD,completed:"#5AAD7A",delayed:"#D4745A"};
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:700}}>
        <div className="mod-head">
          <div>
            <div style={{display:"flex",gap:8,marginBottom:6}}><span className="bgold">{del.id}</span><span className="bpo">{del.orderId}</span><span className="chip" style={{background:`${stC[del.status]}12`,color:stC[del.status]}}>● {del.status}</span></div>
            <div style={{fontFamily:"'Montserrat'",fontSize:15,fontWeight:800,color:B.carbon}}>{req?.description??"—"}</div>
            <div style={{fontSize:11,color:B.gray3,marginTop:2}}>{sup?.name} · {rec}/{tot} {req?.unit} recibidas</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{height:8,background:B.gray1,borderRadius:4,overflow:"hidden",marginBottom:16}}>
          <div style={{width:`${tot?rec/tot*100:0}%`,height:"100%",background:stC[del.status],borderRadius:4,transition:"width .5s"}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
          {del.partials.map(p=>(
            <div key={p.id}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:p.received?"rgba(90,173,122,.06)":B.offwhite,border:`1px solid ${p.received?"rgba(90,173,122,.25)":B.gray1}`,borderRadius:8}}>
                <div style={{width:24,height:24,borderRadius:6,background:p.received?"#5AAD7A":B.gray1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:p.received?B.white:B.gray3,fontWeight:700,fontFamily:"'Montserrat'",flexShrink:0}}>{p.received?"✓":p.id}</div>
                <div style={{flex:1}}><div style={{fontSize:12,color:B.carbon,fontWeight:600}}>{p.qty} {req?.unit} · {p.note||new Date(p.expectedDate).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})}</div></div>
                {!p.received&&del.status!=="completed"&&<button className="btn btn-dark btn-sm" onClick={()=>{setRecId(p.id);setRq({qty:String(p.qty),note:""});}}>Confirmar recepción</button>}
                {p.received&&<span style={{fontSize:10,color:"#5AAD7A",fontFamily:"'Montserrat'",fontWeight:700}}>Recibida {new Date(p.receivedAt).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})}</span>}
              </div>
              {recId===p.id&&(
                <div style={{margin:"4px 0 4px 34px",padding:"10px 14px",background:"rgba(74,173,160,.06)",border:"1px solid rgba(74,173,160,.2)",borderRadius:8}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 2fr auto auto",gap:8,alignItems:"end"}}>
                    <div><label className="lbl">Qty real</label><input className="inp" type="number" value={rq.qty} onChange={e=>setRq(r=>({...r,qty:e.target.value}))} /></div>
                    <div><label className="lbl">Nota</label><input className="inp" value={rq.note} onChange={e=>setRq(r=>({...r,note:e.target.value}))} placeholder="Todo compliant…" /></div>
                    <button className="btn btn-gold btn-sm" style={{alignSelf:"flex-end"}} onClick={()=>{onPartial(del.id,p.id,parseInt(rq.qty),rq.note);setRecId(null);}}>✓</button>
                    <button className="btn btn-ghost btn-sm" style={{alignSelf:"flex-end"}} onClick={()=>setRecId(null)}>✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{marginBottom:14}}>
          {[...del.events].reverse().map((ev,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"center",fontSize:11,color:B.gray3,marginBottom:4}}>
              <span style={{fontSize:12}}>{ev.icon}</span><span style={{color:B.gray4,flex:1}}>{ev.note}</span><span>{new Date(ev.date).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})}</span>
            </div>
          ))}
        </div>
        {del.status!=="completed"&&(!showDelay?<button className="btn btn-ghost btn-sm" onClick={()=>setShowDelay(true)}>⚠️ Reportar retraso del proveedor</button>:(
          <div style={{display:"flex",gap:8}}>
            <input className="inp" placeholder="Motivo del retraso…" value={delayR} onChange={e=>setDelayR(e.target.value)} style={{flex:1}} />
            <button className="btn btn-danger btn-sm" disabled={!delayR} onClick={()=>{onDelay(del.id,delayR);setShowDelay(false);}}>Confirmar</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowDelay(false)}>✕</button>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RCV
// ─────────────────────────────────────────────────────────────────────────────
function RCVPage({ ctx }) {
  const {reqs,orders,dels,rcvs,saveRcvs,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyDels=dels.filter(d=>(d.status==="completed"||d.status==="partial")&&!rcvs.find(r=>r.deliveryId===d.id));
  const handleCreate=async(data)=>{
    const gr={...data,id:genId("GR",rcvs.length+1),createdAt:new Date().toISOString()};
    const updRcvs=[gr,...rcvs];
    const updReqs=reqs.map(r=>r.id===gr.poId?{...r,stage:"PAY",history:[...r.history,{stage:"PAY",date:new Date().toISOString(),note:`GR ${gr.id} emitida. ${gr.result==="compliant"?"Compliant ✅":"No compliant ⚠️"}. Lista para pago.`}]}:r);
    await saveRcvs(updRcvs); await saveReqs(updReqs);
    setShowNew(false); showToast(`${gr.id} emitida`,gr.result==="compliant"?"✅":"⚠️");
  };
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">✅ Verificación de Recepción (GR)</div><div className="ph-sub">Checklist de inspección y nota de recepción</div></div>
        {readyDels.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ New GR</button>}
      </div>
      <div className="pb">
        <div className="gold-line" />
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[["Total GRs",rcvs.length,"#9B7DC8"],["Compliants",rcvs.filter(r=>r.result==="compliant").length,"#5AAD7A"],["No Compliants",rcvs.filter(r=>r.result==="no_compliant").length,"#D4745A"]].map(([l,v,c])=>(
            <div key={l} className="stat" style={{"--sc":c}}><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
          ))}
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SectionHeader title="Notes de Recepción" action={readyDels.length>0&&<span style={{fontSize:11,color:"#9B7DC8",fontFamily:"'Montserrat'",fontWeight:700}}>{readyDels.length} entrega{readyDels.length>1?"s":""} lista{readyDels.length>1?"s":""} para verificar</span>} />
          {rcvs.length===0?<Empty icon="✅" msg="Sin notas de recepción" sub={readyDels.length>0?"Verifica las entregas pendings":"Completa un delivery first"} />:
          rcvs.map(gr=>{
            const req=reqs.find(r=>r.id===gr.poId); const sup=sups.find(s=>s.id===gr.supplierId); const isOk=gr.result==="compliant";
            return(<div key={gr.id} className="trow" onClick={()=>setSelected(gr)}>
              <div style={{width:36,height:36,borderRadius:8,background:isOk?"rgba(90,173,122,.1)":"rgba(212,116,90,.1)",border:`1px solid ${isOk?"rgba(90,173,122,.3)":"rgba(212,116,90,.3)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{isOk?"✅":"⚠️"}</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}><span className="bgold">{gr.id}</span><span className="bpo" style={{fontSize:10,padding:"2px 8px"}}>{gr.poId}</span></div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,color:B.carbon,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description??"—"}</div><div style={{fontSize:11,color:B.gray3}}>{sup?.name} · {gr.receivedBy}</div></div>
              <span className="chip" style={{background:isOk?"rgba(90,173,122,.12)":"rgba(212,116,90,.12)",color:isOk?"#5AAD7A":"#D4745A"}}>{isOk?"✓ Compliant":"⚠ No Compliant"}</span>
              <span style={{color:B.gray2,fontSize:14}}>›</span>
            </div>);
          })}
        </div>
      </div>
      {showNew&&<GRForm deliveries={readyDels} reqs={reqs} orders={orders} sups={sups} onClose={()=>setShowNew(false)} onSubmit={handleCreate} />}
      {selected&&<GRDetail gr={selected} reqs={reqs} sups={sups} onClose={()=>setSelected(null)} />}
    </div>
  );
}

function GRForm({ deliveries, reqs, orders, sups, onClose, onSubmit }) {
  const [delId,setDelId]=useState(deliveries[0]?.id??"");
  const [checks,setChecks]=useState({});
  const [f,setF]=useState({receivedBy:"",receivedQty:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const del=deliveries.find(d=>d.id===delId); const req=reqs.find(r=>r.id===del?.poId);
  const toggle=(id,val)=>setChecks(c=>({...c,[id]:c[id]===val?null:val}));
  const allChecked=CHECKLIST_ITEMS.every(i=>checks[i.id]!==undefined&&checks[i.id]!==null);
  const anyFailed=CHECKLIST_ITEMS.some(i=>checks[i.id]===false);
  const result=anyFailed?"no_compliant":"compliant";
  const valid=allChecked&&f.receivedBy&&f.receivedQty;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div><div className="mod-title-text">Nueva Nota de Recepción (GR)</div><div style={{fontSize:11,color:B.gray3,marginTop:2}}>Verificación contra Orden de Compra</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">Delivery a verificar</label><select className="sel" value={delId} onChange={e=>setDelId(e.target.value)}>{deliveries.map(d=>{const r=reqs.find(r=>r.id===d.poId);return<option key={d.id} value={d.id}>{d.id} · {r?.description?.slice(0,42)??d.id}</option>;})}</select></div>
          <div>
            <label className="lbl">Checklist de verificación</label>
            {CHECKLIST_ITEMS.map(item=>{
              const val=checks[item.id];
              return(<div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:8,border:`1.5px solid ${val===true?"rgba(90,173,122,.35)":val===false?"rgba(212,116,90,.35)":B.gray1}`,background:val===true?"rgba(90,173,122,.05)":val===false?"rgba(212,116,90,.05)":B.offwhite,marginBottom:5}}>
                <span style={{flex:1,fontSize:12,color:B.carbon,fontWeight:500}}>{item.label}</span>
                <button onClick={()=>toggle(item.id,true)} style={{width:30,height:30,borderRadius:6,border:`1.5px solid ${val===true?"#5AAD7A":B.gray1}`,background:val===true?"#5AAD7A":B.white,color:val===true?B.white:B.gray3,cursor:"pointer",fontSize:14,fontWeight:700,transition:"all .15s"}}>✓</button>
                <button onClick={()=>toggle(item.id,false)} style={{width:30,height:30,borderRadius:6,border:`1.5px solid ${val===false?"#D4745A":B.gray1}`,background:val===false?"#D4745A":B.white,color:val===false?B.white:B.gray3,cursor:"pointer",fontSize:14,fontWeight:700,transition:"all .15s"}}>✕</button>
              </div>);
            })}
            {allChecked&&<div style={{padding:"10px 14px",borderRadius:8,background:result==="compliant"?"rgba(90,173,122,.08)":"rgba(212,116,90,.08)",border:`1px solid ${result==="compliant"?"rgba(90,173,122,.25)":"rgba(212,116,90,.25)"}`,fontSize:12,color:result==="compliant"?"#5AAD7A":"#D4745A",fontFamily:"'Montserrat'",fontWeight:700,marginTop:6}}>
              {result==="compliant"?"✅ CONFORME — La GR procederá al módulo de Pago":"⚠️ NO CONFORME — Las discrepancias quedarán registradas"}
            </div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label className="lbl">Recibido por *</label><input className="inp" value={f.receivedBy} onChange={e=>set("receivedBy",e.target.value)} placeholder="Nombre del receptor" /></div>
            <div><label className="lbl">Quantity real recibida *</label><input className="inp" type="number" value={f.receivedQty} onChange={e=>set("receivedQty",e.target.value)} placeholder={req?.quantity} /></div>
          </div>
          <div><label className="lbl">Observaciones generales</label><textarea className="ta" value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Condiciones de entrega, empaque, temperatura, etc." /></div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:14,borderTop:`1px solid ${B.gray1}`}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:0.45}} onClick={()=>onSubmit({deliveryId:delId,orderId:del?.orderId,poId:del?.poId,supplierId:del?.supplierId,checklist:checks,result,...f})}>Emitir Nota de Recepción →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GRDetail({ gr, reqs, sups, onClose }) {
  const req=reqs.find(r=>r.id===gr.poId); const sup=sups.find(s=>s.id===gr.supplierId); const isOk=gr.result==="compliant";
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:640}}>
        <div className="mod-head">
          <div><div style={{display:"flex",gap:8,marginBottom:6}}><span className="bgold">{gr.id}</span><span className="bpo">{gr.poId}</span><span className="chip" style={{background:isOk?"rgba(90,173,122,.12)":"rgba(212,116,90,.12)",color:isOk?"#5AAD7A":"#D4745A"}}>{isOk?"✓ Compliant":"⚠ No Compliant"}</span></div>
            <div style={{fontFamily:"'Montserrat'",fontSize:15,fontWeight:800,color:B.carbon}}>{req?.description??"—"}</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {CHECKLIST_ITEMS.map(item=>{const val=gr.checklist?.[item.id];return(<div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:val===true?"rgba(90,173,122,.05)":"rgba(212,116,90,.05)",border:`1px solid ${val===true?"rgba(90,173,122,.2)":"rgba(212,116,90,.2)"}`,borderRadius:8,marginBottom:5}}><span style={{fontSize:14}}>{val===true?"✅":"❌"}</span><span style={{fontSize:12,color:B.carbon,fontWeight:500}}>{item.label}</span></div>);})}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14}}>
          {[["Recibido por",gr.receivedBy],["Quantity recibida",`${gr.receivedQty} ${req?.unit}`],["Vendor",sup?.name],["Observaciones",gr.notes||"—"]].map(([k,v])=>(
            <div key={k} style={{background:B.offwhite,borderRadius:8,padding:"10px 14px",border:`1px solid ${B.gray1}`}}>
              <div style={{fontSize:9,color:B.gray3,fontFamily:"'Montserrat'",fontWeight:700,letterSpacing:.5,marginBottom:3}}>{k.toUpperCase()}</div>
              <div style={{fontSize:12,color:B.carbon,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAY
// ─────────────────────────────────────────────────────────────────────────────
function PAYPage({ ctx }) {
  const {reqs,orders,rcvs,pays,savePays,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyRcvs=rcvs.filter(r=>!pays.find(p=>p.grId===r.id));
  const handleCreate=async(data)=>{
    const p={...data,id:genId("PAY",pays.length+1),createdAt:new Date().toISOString(),status:"ready"};
    await savePays([p,...pays]);
    setShowNew(false); showToast(`${p.id} preparado — enviado a Cuentas por Pagar`);
  };
  const handlePaid=async(payId)=>{
    const updated=pays.map(p=>p.id===payId?{...p,status:"paid",paidAt:new Date().toISOString()}:p);
    await savePays(updated);
    if(selected?.id===payId)setSelected(updated.find(p=>p.id===payId));
    showToast("¡Proceso completed! 🎉","🎉");
  };
  const totalPagado=pays.filter(p=>p.status==="paid").reduce((a,p)=>a+parseFloat(p.invoiceAmount||0),0);
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">💳 Preparación de Pago</div><div className="ph-sub">3-Way Match automático · Paquete para Cuentas por Pagar</div></div>
        {readyRcvs.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Preparar Pago</button>}
      </div>
      <div className="pb">
        <div className="gold-line" />
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[["Listos para pagar",pays.filter(p=>p.status==="ready").length,"#5B9BD5"],["Pagados",pays.filter(p=>p.status==="paid").length,"#5AAD7A"],["Total Paid",`$${totalPagado.toLocaleString()}`,B.goldD]].map(([l,v,c])=>(
            <div key={l} className="stat" style={{"--sc":c}}><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
          ))}
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SectionHeader title="Paquetes de Pago" action={readyRcvs.length>0&&<span style={{fontSize:11,color:"#5AAD7A",fontFamily:"'Montserrat'",fontWeight:700}}>{readyRcvs.length} GR lista{readyRcvs.length>1?"s":""} para procesar</span>} />
          {pays.length===0?<Empty icon="💳" msg="Sin paquetes de pago" sub={readyRcvs.length>0?"Prepara el primer pago":"Emite una Nota de Recepción first"} />:
          pays.map(p=>{
            const req=reqs.find(r=>r.id===p.poId); const sup=sups.find(s=>s.id===p.supplierId); const isPaid=p.status==="paid";
            return(<div key={p.id} className="trow" onClick={()=>setSelected(p)}>
              <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontFamily:"'Montserrat'",fontSize:11,fontWeight:700,color:"#5AAD7A"}}>{p.id}</span><span className="bpo" style={{fontSize:10,padding:"2px 8px"}}>{p.poId}</span></div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,color:B.carbon,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description??"—"}</div><div style={{fontSize:11,color:B.gray3}}>{sup?.name} · Fac: {p.invoiceNumber} · ${parseFloat(p.invoiceAmount).toLocaleString()}</div></div>
              <span className="chip" style={{background:p.matchResult?"rgba(90,173,122,.12)":"rgba(201,168,76,.1)",color:p.matchResult?"#5AAD7A":B.goldD}}>{p.matchResult?"✅ Match OK":"⚠️ Dif."}</span>
              <span className="chip" style={{background:isPaid?"rgba(90,173,122,.12)":"rgba(91,155,213,.12)",color:isPaid?"#5AAD7A":"#5B9BD5"}}>{isPaid?"✓ Pagado":"📤 Listo"}</span>
              <span style={{color:B.gray2,fontSize:14}}>›</span>
            </div>);
          })}
        </div>
      </div>
      {showNew&&<PAYForm rcvs={readyRcvs} orders={orders} reqs={reqs} sups={sups} onClose={()=>setShowNew(false)} onSubmit={handleCreate} />}
      {selected&&<PAYDetail pay={selected} reqs={reqs} sups={sups} orders={orders} rcvs={rcvs} onClose={()=>setSelected(null)} onPaid={handlePaid} />}
    </div>
  );
}

function PAYForm({ rcvs, orders, reqs, sups, onClose, onSubmit }) {
  const [grId,setGrId]=useState(rcvs[0]?.id??"");
  const [f,setF]=useState({invoiceNumber:"",invoiceAmount:"",invoiceDate:"",paymentMethod:PAY_METHODS[0],dueDate:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const gr=rcvs.find(r=>r.id===grId); const order=orders.find(o=>o.id===gr?.orderId); const req=reqs.find(r=>r.id===gr?.poId); const sup=sups.find(s=>s.id===gr?.supplierId);
  const poAmt=parseFloat(order?.totalAmount??0); const inv=parseFloat(f.invoiceAmount??0);
  const grQty=parseFloat(gr?.receivedQty??0); const poQty=parseFloat(req?.quantity??0);
  const qtyOk=poQty>0?Math.abs(grQty-poQty)/poQty<=0.05:false;
  const priceOk=poAmt>0&&inv>0?Math.abs(inv-poAmt)/poAmt<=0.02:false;
  const grOk=gr?.result==="compliant";
  const matchOk=qtyOk&&priceOk&&grOk;
  const valid=grId&&f.invoiceNumber&&f.invoiceAmount&&f.invoiceDate;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div><div className="mod-title-text">Preparar Paquete de Pago</div><div style={{fontSize:11,color:B.gray3,marginTop:2}}>3-Way Match: OC + GR + Factura</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">Nota de Recepción (GR)</label><select className="sel" value={grId} onChange={e=>setGrId(e.target.value)}>{rcvs.map(r=>{const req=reqs.find(req=>req.id===r.poId);return<option key={r.id} value={r.id}>{r.id} · {req?.description?.slice(0,42)??r.id}</option>;})}</select></div>
          {gr&&<div style={{background:B.goldBg,border:`1px solid ${B.goldBd}`,borderRadius:8,padding:"12px 16px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[["Vendor",sup?.name],["Monto OC",`$${poAmt.toLocaleString()}`],["GR",gr.result==="compliant"?"✅ Compliant":"⚠️ No compliant"]].map(([k,v])=><div key={k}><div style={{fontSize:9,color:B.goldD,fontFamily:"'Montserrat'",fontWeight:700,marginBottom:2}}>{k.toUpperCase()}</div><div style={{fontSize:12,color:B.carbon,fontWeight:700}}>{v}</div></div>)}
            </div>
          </div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label className="lbl">N° Factura del proveedor *</label><input className="inp" value={f.invoiceNumber} onChange={e=>set("invoiceNumber",e.target.value)} placeholder="FAC-2026-XXXX" /></div>
            <div><label className="lbl">Monto de la factura *</label><input className="inp" type="number" value={f.invoiceAmount} onChange={e=>set("invoiceAmount",e.target.value)} /></div>
            <div><label className="lbl">Fecha de factura *</label><input className="inp" type="date" value={f.invoiceDate} onChange={e=>set("invoiceDate",e.target.value)} /></div>
            <div><label className="lbl">Due Date de pago</label><input className="inp" type="date" value={f.dueDate} onChange={e=>set("dueDate",e.target.value)} /></div>
            <div><label className="lbl">Método de pago</label><select className="sel" value={f.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)}>{PAY_METHODS.map(m=><option key={m}>{m}</option>)}</select></div>
            <div><label className="lbl">Notes para CxP</label><input className="inp" value={f.notes} onChange={e=>set("notes",e.target.value)} /></div>
          </div>
          {f.invoiceAmount&&(
            <div style={{padding:"14px 16px",background:matchOk?"rgba(90,173,122,.06)":"rgba(201,168,76,.06)",border:`1px solid ${matchOk?"rgba(90,173,122,.25)":B.goldBd}`,borderRadius:10}}>
              <div style={{fontFamily:"'Montserrat'",fontSize:13,fontWeight:800,color:matchOk?"#5AAD7A":B.goldD,marginBottom:8}}>{matchOk?"✅ 3-Way Match approved":"⚠️ Match con diferencias — se documenta para CxP"}</div>
              <div style={{display:"flex",gap:10}}>
                {[["Quantityes",qtyOk,"±5% tolerancia"],["Montos",priceOk,"±2% tolerancia"],["GR Compliant",grOk,""]].map(([l,ok,sub])=>(
                  <div key={l} style={{flex:1,padding:"8px 10px",background:ok?"rgba(90,173,122,.08)":"rgba(212,116,90,.08)",border:`1px solid ${ok?"rgba(90,173,122,.2)":"rgba(212,116,90,.2)"}`,borderRadius:7,textAlign:"center"}}>
                    <div style={{fontSize:14,marginBottom:3}}>{ok?"✅":"❌"}</div>
                    <div style={{fontSize:10,color:ok?"#5AAD7A":"#D4745A",fontFamily:"'Montserrat'",fontWeight:700}}>{l}</div>
                    {sub&&<div style={{fontSize:9,color:B.gray3,marginTop:1}}>{sub}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:14,borderTop:`1px solid ${B.gray1}`}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:0.45}} onClick={()=>onSubmit({grId,orderId:gr?.orderId,poId:gr?.poId,supplierId:gr?.supplierId,matchResult:matchOk,matchDetails:{qtyOk,priceOk,grOk},...f})}>Enviar a Cuentas por Pagar →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PAYDetail({ pay, reqs, sups, orders, rcvs, onClose, onPaid }) {
  const req=reqs.find(r=>r.id===pay.poId); const sup=sups.find(s=>s.id===pay.supplierId); const isPaid=pay.status==="paid";
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:640}}>
        <div className="mod-head">
          <div><div style={{display:"flex",gap:8,marginBottom:6}}><span style={{fontFamily:"'Montserrat'",fontSize:11,fontWeight:700,color:"#5AAD7A"}}>{pay.id}</span><span className="bpo">{pay.poId}</span><span className="chip" style={{background:pay.matchResult?"rgba(90,173,122,.12)":"rgba(201,168,76,.1)",color:pay.matchResult?"#5AAD7A":B.goldD}}>{pay.matchResult?"✅ Match OK":"⚠️ Dif."}</span></div>
            <div style={{fontFamily:"'Montserrat'",fontSize:15,fontWeight:800,color:B.carbon}}>{req?.description??"—"}</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card" style={{padding:"14px 16px",marginBottom:14}}><ProgressBar stage="PAY" /></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[["Vendor",sup?.name],["N° Factura",pay.invoiceNumber],["Monto a pagar",`$${parseFloat(pay.invoiceAmount).toLocaleString()}`],["Método de pago",pay.paymentMethod],["Vencimiento",pay.dueDate||"—"],["Notes CxP",pay.notes||"—"]].map(([k,v])=>(
            <div key={k} style={{background:B.offwhite,borderRadius:8,padding:"10px 14px",border:`1px solid ${B.gray1}`}}>
              <div style={{fontSize:9,color:B.gray3,fontFamily:"'Montserrat'",fontWeight:700,letterSpacing:.5,marginBottom:3}}>{k.toUpperCase()}</div>
              <div style={{fontSize:12,color:B.carbon,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
        {!isPaid?(
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <button className="btn btn-gold" onClick={()=>onPaid(pay.id)}>💳 Marcar como paid — Proceso completo →</button>
          </div>
        ):(
          <div style={{textAlign:"center",padding:"24px",background:"rgba(90,173,122,.06)",border:"1px solid rgba(90,173,122,.2)",borderRadius:12}}>
            <div style={{fontSize:32,marginBottom:8}}>🎉</div>
            <div style={{fontFamily:"'Montserrat'",fontSize:16,fontWeight:800,color:"#5AAD7A"}}>¡Proceso completo!</div>
            <div style={{fontSize:12,color:B.gray3,marginTop:4}}>Pagado el {new Date(pay.paidAt).toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"})}</div>
            <div style={{marginTop:10,fontSize:11,color:B.goldD,fontFamily:"'Montserrat'",fontWeight:700}}>748 Development — People who build</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACKER
// ─────────────────────────────────────────────────────────────────────────────
function Tracker({ ctx }) {
  const {reqs,sups}=ctx;
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const filtered=reqs.filter(r=>{
    const ms=r.description.toLowerCase().includes(search.toLowerCase())||r.id.toLowerCase().includes(search.toLowerCase());
    const mf=filter==="all"||r.stage===filter;
    return ms&&mf;
  });
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">🔍 Tracker Global de POs</div><div className="ph-sub">Sigue cualquier solicitud de principio a fin</div></div>
        <div style={{display:"flex",gap:10}}>
          <input className="inp" style={{width:220}} placeholder="Buscar PO o descripción…" value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="sel" style={{width:170}} value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">Todas las etapas</option>
            {STAGES.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
          </select>
        </div>
      </div>
      <div className="pb">
        <div className="gold-line" />
        {filtered.length===0?<Empty icon="🔍" msg="Sin resultados" sub="Prueba con otro filtro o término de búsqueda" />:
        filtered.map(r=>{
          const s=STAGES.find(s=>s.id===r.stage); const p=PRIORITY[r.priority];
          return(
            <div key={r.id} className="card" style={{marginBottom:12,padding:"16px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <span className="bpo">{r.id}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:B.carbon,fontWeight:700,fontFamily:"'Montserrat'"}}>{r.description}</div>
                  <div style={{fontSize:11,color:B.gray3,marginTop:1}}>{r.quantity} {r.unit} · {r.supplier||"Sin proveedor sugerido"} · {new Date(r.createdAt).toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"})}</div>
                </div>
                <span className="chip" style={{background:p.bg,color:p.color}}>{p.dot} {p.label}</span>
                <span className="chip" style={{background:`${s.color}12`,color:s.color}}>● {s.label}</span>
              </div>
              <ProgressBar stage={r.stage} />
              {r.history?.length>0&&(
                <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${B.gray1}`}}>
                  <div style={{display:"flex",gap:16,overflowX:"auto",paddingBottom:2}}>
                    {r.history.map((h,i)=>{
                      const hs=STAGES.find(s=>s.id===h.stage);
                      return(<div key={i} style={{flexShrink:0,fontSize:11,display:"flex",alignItems:"center",gap:5,color:B.gray3}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:hs?.color??B.gray3,flexShrink:0}}/>
                        <span style={{color:B.gray4}}>{h.note.slice(0,40)}</span>
                        <span style={{color:B.gray2}}>·</span>
                        <span>{new Date(h.date).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})}</span>
                      </div>);
                    })}
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
