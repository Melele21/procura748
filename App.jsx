import { useState, useEffect, useRef } from "react";

async function load(key, fallback) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : fallback; }
  catch { return fallback; }
}
async function save(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

const B = {
  carbon:"#2D2D2D", carbon2:"#3A3A3A", gold:"#C9A84C", goldL:"#E2BE72", goldD:"#A8863A",
  goldBg:"rgba(201,168,76,0.10)", goldBd:"rgba(201,168,76,0.28)",
  white:"#FFFFFF", offwhite:"#F7F5F1", gray1:"#E8E4DC", gray2:"#C8C2B4", gray3:"#8A8378", gray4:"#5A5550",
  dark:"#1A1814", dark2:"#222018", dark3:"#2C2A24",
  green:"#5AAD7A", greenBg:"rgba(90,173,122,0.10)", greenBd:"rgba(90,173,122,0.28)",
  blue:"#5B9BD5", blueBg:"rgba(91,155,213,0.10)",
  orange:"#D4745A", orangeBg:"rgba(212,116,90,0.10)", orangeBd:"rgba(212,116,90,0.28)",
  purple:"#9B7DC8", teal:"#4AADA0",
};
const STAGES = [
  { id:"REQ", label:"Requisición",     color:"#7C72DC", icon:"📋" },
  { id:"RFQ", label:"Cotización",      color:"#5B9BD5", icon:"💬" },
  { id:"CMP", label:"Comparación",     color:"#C9A84C", icon:"⚖️" },
  { id:"PO",  label:"Orden de Compra", color:"#D4745A", icon:"📄" },
  { id:"DEL", label:"Delivery",        color:"#4AADA0", icon:"🚚" },
  { id:"RCV", label:"Recepción",       color:"#9B7DC8", icon:"✅" },
  { id:"PAY", label:"Pago",            color:"#5AAD7A", icon:"💳" },
];

const NAV = [
  { id:"dashboard", label:"Dashboard",       icon:"◈" },
  { id:"REQ",       label:"Requisición",     icon:"📋" },
  { id:"RFQ",       label:"Cotización",      icon:"💬" },
  { id:"CMP",       label:"Comparación",     icon:"⚖️" },
  { id:"PO",        label:"Orden de Compra", icon:"📄" },
  { id:"DEL",       label:"Delivery",        icon:"🚚" },
  { id:"RCV",       label:"Recepción",       icon:"✅" },
  { id:"PAY",       label:"Pago",            icon:"💳" },
  { id:"tracker",   label:"Tracker Global",  icon:"🔍" },
];

const PRIORITY = {
  urgente:    { label:"Urgente",     color:"#D4745A", bg:"rgba(212,116,90,0.12)", dot:"🔴" },
  normal:     { label:"Normal",      color:"#C9A84C", bg:"rgba(201,168,76,0.10)", dot:"🟡" },
  planificado:{ label:"Planificado", color:"#5AAD7A", bg:"rgba(90,173,122,0.12)", dot:"🟢" },
};

const UNITS = ["Unidad","Kg","L","m","m²","m³","Caja","Pallet","Global","Servicio","Hora","Tonelada","Pie","Galón","Barril"];
const PAYMENT_OPTIONS = ["crédito 60 días","crédito 45 días","crédito 30 días","crédito 15 días","contado","anticipado"];
const PAYMENT_SCORE = { "crédito 60 días":100,"crédito 45 días":85,"crédito 30 días":70,"crédito 15 días":55,"contado":20,"anticipado":0 };
const CHECKLIST_ITEMS = [
  { id:"qty",     label:"Cantidad recibida coincide con la OC" },
  { id:"desc",    label:"Descripción / especificación correcta" },
  { id:"quality", label:"Estado físico conforme (sin daños)" },
  { id:"docs",    label:"Guía de despacho del proveedor presente" },
  { id:"pack",    label:"Empaque y etiquetado en buen estado" },
];
const PAY_METHODS = ["Transferencia bancaria","Cheque","Efectivo","Débito directo","Otro"];
const COST_CODES = [
  { code:"01 45 00", desc:"Quality Control" },
  { code:"01 54 00", desc:"Construction Aids" },
  { code:"01 74 00", desc:"Cleaning and Waste Management" },
  { code:"01 76 00", desc:"Protecting Installed Construction" },
  { code:"02 40 00", desc:"Demolition and Structure Moving" },
  { code:"03 00 00", desc:"Concrete" },
  { code:"03 30 00", desc:"Cast-in-Place Concrete" },
  { code:"03 37 00", desc:"Specialty Placed Concrete" },
  { code:"04 00 00", desc:"Masonry" },
  { code:"05 00 00", desc:"Metals" },
  { code:"05 12 00", desc:"Structural Steel Framing" },
  { code:"05 40 00", desc:"Cold-Formed Metal Framing" },
  { code:"06 00 00", desc:"Wood, Plastics, and Composites" },
  { code:"06 40 00", desc:"Architectural Woodwork" },
  { code:"06 46 00", desc:"Wood Trim" },
  { code:"07 00 00", desc:"Thermal and Moisture Protection" },
  { code:"08 00 00", desc:"Openings" },
  { code:"08 10 00", desc:"Doors and Frames" },
  { code:"08 13 00", desc:"Metal Doors" },
  { code:"08 55 00", desc:"Pressure-Resistant Windows" },
  { code:"08 55 01", desc:"Windows Handling" },
  { code:"08 83 00", desc:"Mirrors" },
  { code:"09 00 00", desc:"Finishes" },
  { code:"09 20 00", desc:"Plaster and Gypsum Board" },
  { code:"09 21 00", desc:"Plaster and Gypsum Board Assemblies" },
  { code:"09 22 00", desc:"Supports for Plaster and Gypsum Board" },
  { code:"09 23 00", desc:"Gypsum Plastering" },
  { code:"09 60 00", desc:"Flooring" },
  { code:"10 28 00", desc:"Toilet, Bath, and Laundry Accessories" },
  { code:"10 55 00", desc:"Postal Specialties" },
  { code:"11 30 00", desc:"Residential Equipment" },
  { code:"12 36 00", desc:"Countertops" },
  { code:"21 13 00", desc:"Fire-Suppression Sprinkler Systems" },
  { code:"22 10 00", desc:"Plumbing Piping" },
  { code:"23 00 00", desc:"HVAC" },
  { code:"26 00 00", desc:"Electrical" },
  { code:"28 23 00", desc:"Video Management System" },
  { code:"31 00 00", desc:"Earthwork" },
  { code:"31 22 00", desc:"Grading" },
  { code:"31 23 00", desc:"Excavation and Fill" },
  { code:"31 31 00", desc:"Soil Treatment" },
  { code:"31 68 00", desc:"Foundation Anchors" },
  { code:"31 70 00", desc:"Tunneling and Mining" },
  { code:"31 71 00", desc:"Tunnel Excavation" },
  { code:"31 72 00", desc:"Tunnel Support Systems" },
  { code:"31 74 00", desc:"Tunnel Construction" },
  { code:"31 75 00", desc:"Shaft Construction" },
  { code:"31 77 00", desc:"Submersible Tube Tunnels" },
  { code:"33 00 00", desc:"Utilities" },
  { code:"33 10 00", desc:"Water Utilities" },
  { code:"33 40 00", desc:"Stormwater Utilities" },
  { code:"33 80 00", desc:"Communications Utilities" },
  { code:"34 00 00", desc:"Transportation" },
];
const WBS_OPTIONS = COST_CODES.map(c => `${c.code} — ${c.desc}`);

const COST_CENTERS = [
  "CC-OBR — Obra / Construcción",
  "CC-ADM — Administración",
  "CC-LOG — Logística y Transporte",
  "CC-MAN — Mantenimiento",
  "CC-SEG — Seguridad y HSEC",
  "CC-ING — Ingeniería y Diseño",
];

const DEMO_PROJECTS = [
  { id:"PRJ-001", name:"Residencial Las Palmas — Torre A", budget:250000, code:"LP-2026-A" },
  { id:"PRJ-002", name:"Centro Comercial Orion — Fase 2",  budget:180000, code:"OR-2026-2" },
  { id:"PRJ-003", name:"Edificio Corporativo Bello Monte",  budget:320000, code:"BM-2026-1" },
  { id:"PRJ-004", name:"Urbanización El Rosal — Vialidad",  budget:95000,  code:"ER-2026-V" },
];
const DEMO_SUPPLIERS = [
  { id:"S001", name:"White Cap",                     contact:"Daniel Regalado",  email:"Daniel.Regalado@whitecap.com",         phone:"786-914-0066", category:"Encofrado y Formaleta",  rating:4.0, active:true },
  { id:"S002", name:"United Rental",                 contact:"Ike Washington",   email:"iwashingto@ur.com",                    phone:"786-860-7568", category:"Equipos",                  rating:4.0, active:true },
  { id:"S003", name:"Herc Rental",                   contact:"Luis Jeannot",     email:"luis.jeannot@hercrentals.com",         phone:"786-570-9147", category:"Equipos",                  rating:4.0, active:true },
  { id:"S004", name:"Sunbelt",                       contact:"John Davis",       email:"",                                     phone:"305-796-3469", category:"Equipos",                  rating:4.0, active:true },
  { id:"S005", name:"Mighty Trucking",               contact:"",                 email:"",                                     phone:"786-251-0032", category:"Transporte",               rating:4.0, active:true },
  { id:"S006", name:"PMS (CMU Install)",             contact:"Luis Sevilla",     email:"lsevilla311@gmail.com",                phone:"305-725-4280", category:"Obras Civiles",            rating:4.0, active:true },
  { id:"S007", name:"Cemex",                         contact:"Valentina González",email:"valentina.gonzalezv@cemex.com",       phone:"832-472-2704", category:"Materiales",               rating:4.5, active:true },
  { id:"S008", name:"Polimix",                       contact:"Alberto Santana",  email:"alberto@polimix.us",                   phone:"786-458-7893", category:"Concreto",                 rating:4.5, active:true },
  { id:"S009", name:"Hilti",                         contact:"Richard Toquice",  email:"",                                     phone:"954-350-2065", category:"Equipos",                  rating:4.5, active:true },
  { id:"S010", name:"Stucco & Painting Solution",    contact:"Edgar Villanueva", email:"",                                     phone:"786-251-2422", category:"Pintura",                  rating:4.0, active:true },
  { id:"S011", name:"Potros Trucking",               contact:"Jose Lopez",       email:"",                                     phone:"786-412-0296", category:"Transporte",               rating:4.0, active:true },
  { id:"S012", name:"Alsina Forms",                  contact:"Marcos Mirabal",   email:"marcos.mirabal@alsina.com",            phone:"305-924-4710", category:"Encofrado y Formaleta",    rating:4.5, active:true },
  { id:"S013", name:"City Electric Supply",          contact:"Lazaro",           email:"",                                     phone:"786-969-5315", category:"Eléctrico",                rating:4.0, active:true },
  { id:"S014", name:"Kavana Tile/Bathroom/Kitchen",  contact:"Orlando Rodriguez",email:"orodriguez@kavanafloorandbath.com",    phone:"786-281-2760", category:"Pisos y Revestimientos",   rating:4.0, active:true },
  { id:"S015", name:"Lobo Services LLC",             contact:"Carlos Lobo",      email:"LoboServicesLLC@outlook.com",          phone:"786-468-1259", category:"Paisajismo",               rating:4.0, active:true },
  { id:"S016", name:"Floor and Decor",               contact:"Scarlet Garcia",   email:"Scarlet.GarciaUlerio@flooranddecor.com",phone:"786-858-2331",category:"Pisos y Revestimientos",   rating:4.5, active:true },
  { id:"S017", name:"Brospro",                       contact:"Leonel Mejia",     email:"brosprobuild@hotmail.com",             phone:"305-491-2638", category:"Acabados",                 rating:4.0, active:true },
  { id:"S018", name:"The Home Depot",                contact:"Daniel Carniglia",  email:"MANUEL_D_CARNIGLIA@homedepot.com",     phone:"786-886-7819", category:"Materiales",               rating:4.5, active:true },
  { id:"S019", name:"George Crane",                  contact:"",                 email:"",                                     phone:"305-513-0188", category:"Equipos",                  rating:4.0, active:true },
  { id:"S020", name:"Nu-Vue",                        contact:"Enzo Murias",      email:"enzo.nuvue@gmail.com",                 phone:"754-465-1549", category:"Acero Estructural",         rating:4.0, active:true },
  { id:"S021", name:"ESP Windows",                   contact:"Danny",            email:"",                                     phone:"786-344-4342", category:"Vidrio y Aluminios",        rating:4.0, active:true },
  { id:"S022", name:"V&V Windows",                   contact:"Jorge",            email:"",                                     phone:"786-760-0914", category:"Vidrio y Aluminios",        rating:4.0, active:true },
  { id:"S023", name:"Nachon Cabilla",                contact:"Jose Sixto",       email:"sixtonachon@gmail.com",                phone:"786-280-5855", category:"Acero Estructural",         rating:4.0, active:true },
  { id:"S024", name:"U.S.A High Security Corp",      contact:"",                 email:"",                                     phone:"305-733-0792", category:"Seguridad Electrónica",     rating:4.0, active:true },
  { id:"S025", name:"G.Proulx Building Products LLC",contact:"Ryan H",           email:"ryanh@gpbpllc.com",                    phone:"954-922-1429", category:"Acero Estructural",         rating:4.0, active:true },
  { id:"S026", name:"KJ Materials LLC",              contact:"Victor Herrera",   email:"sales7401@kjmaterials.net",            phone:"305-522-8943", category:"Drywall / Tabiquería",      rating:4.0, active:true },
  { id:"S027", name:"Medley Steel and Supply",       contact:"Julio Jimenez",    email:"jjimenez@medleysteel.com",             phone:"305-525-2919", category:"Acero Estructural",         rating:4.0, active:true },
];

function genPO(n) { return `PO-${new Date().getFullYear()}-${String(n).padStart(4,"0")}`; }
function genId(pre,n) { return `${pre}-${new Date().getFullYear()}-${String(n).padStart(4,"0")}`; }
function daysUntil(d) { return Math.ceil((new Date(d)-new Date())/(1000*60*60*24)); }
function fmt(n) { return parseFloat(n||0).toLocaleString("es-VE",{minimumFractionDigits:2,maximumFractionDigits:2}); }

function scoreSuppliers(responses, suppliers) {
  const ans = responses.filter(r=>r.status==="respondida"&&r.price>0);
  if (!ans.length) return [];
  const minP=Math.min(...ans.map(r=>r.price)), maxP=Math.max(...ans.map(r=>r.price));
  const minD=Math.min(...ans.map(r=>r.deliveryDays)), maxD=Math.max(...ans.map(r=>r.deliveryDays));
  return ans.map(r=>{
    const sup=suppliers.find(s=>s.id===r.supplierId);
    const ps=maxP===minP?100:Math.round((1-(r.price-minP)/(maxP-minP))*100);
    const ds=maxD===minD?100:Math.round((1-(r.deliveryDays-minD)/(maxD-minD))*100);
    const ws=PAYMENT_SCORE[(r.paymentTerms??"contado").toLowerCase()]??20;
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
.sb{width:232px;background:#1A1814;display:flex;flex-direction:column;flex-shrink:0;position:relative;}
.sb::after{content:'';position:absolute;top:0;right:0;width:1px;height:100%;background:linear-gradient(to bottom,transparent,rgba(201,168,76,0.6),transparent);}
.sb-head{padding:20px 18px 18px;border-bottom:1px solid #2C2A24;}
.sb-logo{display:flex;align-items:center;gap:10px;}
.sb-logo-mark{width:38px;height:38px;background:linear-gradient(135deg,#C9A84C,#A8863A);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Montserrat';font-weight:900;font-size:13px;color:#1A1814;letter-spacing:-1px;flex-shrink:0;box-shadow:0 2px 8px rgba(201,168,76,.35);}
.sb-logo-text{display:flex;flex-direction:column;}
.sb-logo-name{font-family:'Montserrat';font-size:13px;font-weight:800;color:#FFFFFF;letter-spacing:.3px;line-height:1;}
.sb-logo-tag{font-size:9px;color:#C9A84C;letter-spacing:1.5px;margin-top:3px;font-weight:500;}
.sb-section{padding:16px 12px 4px;font-family:'Montserrat';font-size:9px;color:#5A5550;letter-spacing:2px;font-weight:700;text-transform:uppercase;}
.nav-btn{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:6px;cursor:pointer;transition:all .15s;margin:1px 8px;border:none;background:transparent;width:calc(100% - 16px);text-align:left;position:relative;}
.nav-btn:hover{background:#2C2A24;}
.nav-btn.act{background:#2C2A24;}
.nav-btn.act::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:60%;background:#C9A84C;border-radius:0 2px 2px 0;}
.nav-icon{font-size:13px;width:18px;text-align:center;flex-shrink:0;}
.nav-label{font-family:'Open Sans';font-size:12px;font-weight:500;color:#8A8378;}
.nav-btn.act .nav-label{color:#FFFFFF;font-weight:600;}
.nav-badge{margin-left:auto;background:#C9A84C;color:#1A1814;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px;font-family:'Montserrat';}
.sb-footer{padding:14px 18px;border-top:1px solid #2C2A24;margin-top:auto;}
.main{flex:1;overflow-y:auto;background:#F7F5F1;}
.ph{padding:22px 28px 18px;background:#FFFFFF;border-bottom:1px solid #E8E4DC;display:flex;align-items:center;justify-content:space-between;}
.ph-title{font-family:'Montserrat';font-size:18px;font-weight:800;color:#2D2D2D;letter-spacing:-.3px;}
.ph-sub{font-size:12px;color:#8A8378;margin-top:2px;font-weight:400;}
.pb{padding:22px 28px;}
.card{background:#FFFFFF;border-radius:10px;border:1px solid #E8E4DC;box-shadow:0 1px 4px rgba(0,0,0,.04);}
.stat{background:#FFFFFF;border-radius:10px;border:1px solid #E8E4DC;padding:18px;position:relative;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.04);}
.stat::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--sc);}
.stat-val{font-family:'Montserrat';font-size:24px;font-weight:800;color:var(--sc);margin:8px 0 2px;}
.stat-lbl{font-size:11px;color:#8A8378;font-weight:500;}
.btn{border:none;border-radius:6px;cursor:pointer;font-family:'Open Sans';font-weight:600;transition:all .15s;font-size:13px;}
.btn-gold{background:#C9A84C;color:#1A1814;padding:10px 20px;font-family:'Montserrat';font-weight:700;font-size:12px;letter-spacing:.5px;box-shadow:0 2px 8px rgba(201,168,76,.3);}
.btn-gold:hover{background:#E2BE72;transform:translateY(-1px);}
.btn-dark{background:#2D2D2D;color:#FFFFFF;padding:10px 20px;font-family:'Montserrat';font-weight:700;font-size:12px;letter-spacing:.5px;}
.btn-dark:hover{background:#3A3A3A;transform:translateY(-1px);}
.btn-ghost{background:transparent;color:#8A8378;border:1.5px solid #E8E4DC;padding:9px 18px;font-size:12px;}
.btn-ghost:hover{border-color:#2D2D2D;color:#2D2D2D;}
.btn-success{background:rgba(90,173,122,.12);color:#5AAD7A;border:1px solid rgba(90,173,122,.3);padding:10px 20px;font-size:12px;font-family:'Montserrat';font-weight:700;}
.btn-danger{background:rgba(212,116,90,.12);color:#D4745A;border:1px solid rgba(212,116,90,.3);padding:9px 18px;font-size:12px;}
.btn-outline-gold{background:transparent;color:#A8863A;border:1.5px solid rgba(201,168,76,0.28);padding:9px 18px;font-size:12px;}
.btn-sm{padding:6px 14px!important;font-size:11px!important;border-radius:5px!important;}
.lbl{font-family:'Montserrat';font-size:10px;font-weight:700;color:#8A8378;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:5px;display:block;}
.inp{width:100%;background:#F7F5F1;border:1.5px solid #E8E4DC;border-radius:7px;padding:10px 13px;font-family:'Open Sans';font-size:13px;color:#2D2D2D;outline:none;transition:border-color .15s;}
.inp:focus{border-color:#C9A84C;box-shadow:0 0 0 3px rgba(201,168,76,0.10);}
.sel{width:100%;background:#F7F5F1;border:1.5px solid #E8E4DC;border-radius:7px;padding:10px 13px;font-family:'Open Sans';font-size:13px;color:#2D2D2D;outline:none;appearance:none;cursor:pointer;}
.sel:focus{border-color:#C9A84C;}
.ta{width:100%;background:#F7F5F1;border:1.5px solid #E8E4DC;border-radius:7px;padding:10px 13px;font-family:'Open Sans';font-size:13px;color:#2D2D2D;outline:none;resize:vertical;min-height:70px;}
.ta:focus{border-color:#C9A84C;}
.trow{display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid #E8E4DC;cursor:pointer;transition:background .12s;}
.trow:hover{background:#F7F5F1;}
.trow:last-child{border-bottom:none;}
.bpo{font-family:'Montserrat';font-size:11px;font-weight:700;background:#2D2D2D;color:#FFFFFF;padding:3px 10px;border-radius:5px;display:inline-block;letter-spacing:.3px;}
.bgold{font-family:'Montserrat';font-size:11px;font-weight:700;background:rgba(201,168,76,0.10);color:#A8863A;border:1px solid rgba(201,168,76,0.28);padding:3px 10px;border-radius:5px;display:inline-block;}
.bfield{font-family:'Montserrat';font-size:10px;font-weight:700;background:rgba(212,116,90,0.10);color:#D4745A;border:1px solid rgba(212,116,90,0.28);padding:2px 8px;border-radius:5px;display:inline-block;}
.bestim{font-family:'Montserrat';font-size:10px;font-weight:700;background:rgba(91,155,213,0.10);color:#5B9BD5;border:1px solid rgba(91,155,213,0.28);padding:2px 8px;border-radius:5px;display:inline-block;}
.chip{font-family:'Montserrat';font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;display:inline-flex;align-items:center;gap:4px;letter-spacing:.3px;}
.ov{position:fixed;inset:0;background:rgba(26,24,20,.65);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
.mod{background:#FFFFFF;border-radius:14px;width:100%;max-width:800px;max-height:92vh;overflow-y:auto;padding:28px;border:1px solid #E8E4DC;box-shadow:0 20px 60px rgba(0,0,0,.2);}
.mod-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;padding-bottom:16px;border-bottom:1px solid #E8E4DC;}
.pd{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;font-family:'Montserrat';flex-shrink:0;}
.toast{position:fixed;bottom:24px;right:24px;z-index:400;background:#2D2D2D;color:#FFFFFF;padding:13px 20px;border-radius:10px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,.25);font-family:'Open Sans';font-size:13px;border-left:4px solid #C9A84C;}
.gold-line{height:2px;background:linear-gradient(to right,#C9A84C,#E2BE72,#C9A84C);border-radius:1px;margin-bottom:18px;}
.type-card{border:2px solid #E8E4DC;border-radius:12px;padding:20px;cursor:pointer;transition:all .2s;background:#FFFFFF;flex:1;position:relative;}
.type-card:hover{border-color:#C9A84C;background:rgba(201,168,76,0.10);}
.type-card.selected{border-color:#C9A84C;background:rgba(201,168,76,0.10);box-shadow:0 0 0 1px #C9A84C;}
.section-label{font-family:'Montserrat';font-size:10px;font-weight:700;color:#8A8378;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.section-label::after{content:'';flex:1;height:1px;background:#E8E4DC;}
.budget-bar{height:8px;border-radius:4px;background:#E8E4DC;overflow:hidden;}
.budget-fill{height:100%;border-radius:4px;transition:width .5s;}
.info-box{padding:12px 16px;border-radius:8px;font-size:12px;}
.info-gold{background:rgba(201,168,76,0.10);border:1px solid rgba(201,168,76,0.28);color:#A8863A;}
.info-orange{background:rgba(212,116,90,0.10);border:1px solid rgba(212,116,90,0.28);color:#A8543A;}
.info-blue{background:rgba(91,155,213,0.10);border:1px solid rgba(91,155,213,0.28);color:#3A6FA8;}
.info-green{background:rgba(90,173,122,0.10);border:1px solid rgba(90,173,122,0.28);color:#3D8A5C;}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.fi{animation:fadeIn .22s ease forwards;}
.su{animation:slideUp .28s cubic-bezier(.34,1.4,.64,1) forwards;}
`;
function ProgressBar({ stage, small }) {
  const idx = STAGES.findIndex(s=>s.id===stage);
  const sz = small ? 16 : 20;
  return (
    <div style={{ display:"flex", alignItems:"center" }}>
      {STAGES.map((s,i)=>(
        <div key={s.id} style={{ display:"flex", alignItems:"center", flex:i<STAGES.length-1?1:"none" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            <div className="pd" style={{ width:sz, height:sz, background:i<=idx?s.color:"#E8E4DC", color:i<=idx?"#fff":"#8A8378", boxShadow:i===idx?`0 0 0 3px ${s.color}28`:"none", fontSize:small?7:8 }}>
              {i<idx?"✓":i+1}
            </div>
            {!small&&<div style={{ fontSize:7, color:i<=idx?s.color:"#C8C2B4", fontWeight:700, whiteSpace:"nowrap", marginTop:2, fontFamily:"Montserrat" }}>{s.label}</div>}
          </div>
          {i<STAGES.length-1&&<div style={{ flex:1, height:2, background:i<idx?STAGES[i+1].color:"#E8E4DC", margin:"0 1px", marginBottom:small?0:14 }}/>}
        </div>
      ))}
    </div>
  );
}

function Stars({ r }) {
  return <span style={{ color:"#C9A84C", fontSize:12 }}>{[1,2,3,4,5].map(i=><span key={i}>{i<=Math.round(r)?"★":"☆"}</span>)}</span>;
}

function Empty({ icon, msg, sub }) {
  return (
    <div style={{ padding:"52px 20px", textAlign:"center" }}>
      <div style={{ fontSize:36, marginBottom:12, opacity:.6 }}>{icon}</div>
      <div style={{ fontFamily:"Montserrat", fontSize:14, color:"#2D2D2D", fontWeight:700, marginBottom:5 }}>{msg}</div>
      <div style={{ fontSize:12, color:"#8A8378" }}>{sub}</div>
    </div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ padding:"14px 18px", borderBottom:"1px solid #E8E4DC", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ fontFamily:"Montserrat", fontSize:12, fontWeight:700, color:"#2D2D2D", letterSpacing:.5, textTransform:"uppercase" }}>{title}</div>
      {action}
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
        load("proc:requisitions",[]),load("proc:rfqs",[]),load("proc:comparisons",[]),
        load("proc:orders",[]),load("proc:deliveries",[]),load("proc:receipts",[]),
        load("proc:payments",[]),load("proc:suppliers",DEMO_SUPPLIERS),
        load("proc:projects",DEMO_PROJECTS),
        load("proc:counter",0),load("proc:rfqCounter",0),
      ]);
      setReqs(r);setRfqs(rq);setCmps(cm);setOrders(or);setDels(dl);setRcvs(rc);setPays(py);setSups(sp);setProjs(pr);setCtrPO(cpo);setCtrRFQ(crfq);
      setLoading(false);
    })();
  },[]);

  const showToast=(msg,icon="✅")=>{ setToast({msg,icon}); setTimeout(()=>setToast(null),3500); };
  const pendingPO=orders.filter(o=>o.approvalStatus==="pendiente").length;
  const pendingCMP=cmps.filter(c=>c.status==="pendiente").length;
  const alertDEL=dels.filter(d=>d.status!=="completado"&&daysUntil(d.expectedDate)<=3).length;

  const saveReqs=async r=>{setReqs(r);await save("proc:requisitions",r);};
  const saveRfqs=async r=>{setRfqs(r);await save("proc:rfqs",r);};
  const saveCmps=async r=>{setCmps(r);await save("proc:comparisons",r);};
  const saveOrders=async r=>{setOrders(r);await save("proc:orders",r);};
  const saveDels=async r=>{setDels(r);await save("proc:deliveries",r);};
  const saveRcvs=async r=>{setRcvs(r);await save("proc:receipts",r);};
  const savePays=async r=>{setPays(r);await save("proc:payments",r);};
  const saveSups=async r=>{setSups(r);await save("proc:suppliers",r);};
  const saveProjs=async r=>{setProjs(r);await save("proc:projects",r);};

  const ctx={reqs,rfqs,cmps,orders,dels,rcvs,pays,sups,projs,saveReqs,saveRfqs,saveCmps,saveOrders,saveDels,saveRcvs,savePays,saveSups,saveProjs,showToast,setPage,ctrPO,setCtrPO,ctrRFQ,setCtrRFQ};

  if (loading) return (
    <div style={{ height:"100vh", background:"#1A1814", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14 }}>
      <div style={{ fontFamily:"Montserrat", fontWeight:900, fontSize:48, color:"#FFFFFF", lineHeight:1, letterSpacing:-2 }}>
        <span style={{ color:"#FFFFFF" }}>7</span><span style={{ color:"#C9A84C" }}>4</span><span style={{ color:"#FFFFFF" }}>8</span>
      </div>
      <div style={{ fontFamily:"Montserrat", fontSize:10, color:"#C9A84C", letterSpacing:4, fontWeight:600 }}>CARGANDO SISTEMA DE PROCURA</div>
    </div>
  );

  return (
    <div className="app">
      <style>{STYLE}</style>
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
          <div style={{ fontFamily:"Montserrat", fontSize:10, color:"#5A5550" }}>748 Development C.A.</div>
          <div style={{ fontSize:9, color:"#3A3A3A", marginTop:2 }}>Sistema de Procura v2.0 · {new Date().getFullYear()}</div>
        </div>
      </div>
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
function Dashboard({ ctx }) {
  const { reqs,rfqs,cmps,orders,dels,rcvs,pays,setPage } = ctx;
  const total=reqs.length;
  const active=reqs.filter(r=>r.stage!=="PAY").length;
  const complete=pays.filter(p=>p.status==="pagado").length;
  const totalPaid=pays.filter(p=>p.status==="pagado").reduce((a,p)=>a+parseFloat(p.invoiceAmount||0),0);
  const pipeline=STAGES.map(s=>({...s,count:reqs.filter(r=>r.stage===s.id).length}));
  const alerts=[
    ...orders.filter(o=>o.approvalStatus==="pendiente").map(o=>({msg:`OC ${o.id} pendiente de aprobación gerencial`,color:"#D4745A",icon:"⏳",page:"PO"})),
    ...dels.filter(d=>d.status!=="completado"&&daysUntil(d.expectedDate)<=3).map(d=>({msg:`Delivery ${d.id} — vence en ${daysUntil(d.expectedDate)}d`,color:"#D4745A",icon:"🔴",page:"DEL"})),
    ...cmps.filter(c=>c.status==="pendiente").map(c=>({msg:`Comparativo ${c.id} pendiente de aprobación`,color:"#A8863A",icon:"⚖️",page:"CMP"})),
  ];
  return (
    <div className="fi">
      <div className="ph">
        <div>
          <div className="ph-title">Dashboard</div>
          <div className="ph-sub">Bienvenido al Sistema de Procura · {new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        </div>
        <div style={{ fontFamily:"Montserrat", fontSize:11, fontWeight:700, color:"#8A8378", letterSpacing:.5 }}>
          748 Development — <span style={{ color:"#C9A84C" }}>People who build</span>
        </div>
      </div>
      <div className="pb">
        <div className="gold-line" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
          {[
            { l:"Total POs",    v:total,                           c:"#2D2D2D", icon:"📋" },
            { l:"En proceso",   v:active,                          c:"#5B9BD5", icon:"🔄" },
            { l:"Completadas",  v:complete,                        c:"#5AAD7A", icon:"✅" },
            { l:"Total pagado", v:`$${totalPaid.toLocaleString()}`,c:"#A8863A", icon:"💰" },
          ].map(s=>(
            <div key={s.l} className="stat" style={{"--sc":s.c}}>
              <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
              <div className="stat-val">{s.v}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>
        {alerts.length>0&&(
          <div className="card" style={{ padding:"16px 18px", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ width:3, height:16, background:"#C9A84C", borderRadius:2 }} />
              <div style={{ fontFamily:"Montserrat", fontSize:12, fontWeight:700, color:"#2D2D2D", letterSpacing:.5, textTransform:"uppercase" }}>Requiere atención</div>
            </div>
            {alerts.map((a,i)=>(
              <div key={i} onClick={()=>setPage(a.page)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:`rgba(212,116,90,0.06)`, border:`1px solid rgba(212,116,90,0.2)`, borderRadius:7, marginBottom:6, cursor:"pointer" }}>
                <span style={{fontSize:14}}>{a.icon}</span>
                <span style={{ fontSize:12, color:a.color, flex:1, fontWeight:500 }}>{a.msg}</span>
                <span style={{ fontSize:11, color:"#8A8378", fontFamily:"Montserrat", fontWeight:600 }}>Ver →</span>
              </div>
            ))}
          </div>
        )}
        <div className="card" style={{ padding:"18px", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <div style={{ width:3, height:16, background:"#C9A84C", borderRadius:2 }} />
            <div style={{ fontFamily:"Montserrat", fontSize:12, fontWeight:700, color:"#2D2D2D", letterSpacing:.5, textTransform:"uppercase" }}>Pipeline de procura</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:10 }}>
            {pipeline.map(s=>(
              <div key={s.id} onClick={()=>setPage(s.id)} style={{ textAlign:"center", padding:"14px 8px", borderRadius:8, background:`${s.color}0D`, border:`1px solid ${s.color}30`, cursor:"pointer" }}>
                <div style={{fontSize:18,marginBottom:6}}>{s.icon}</div>
                <div style={{ fontFamily:"Montserrat", fontSize:22, fontWeight:900, color:s.color }}>{s.count}</div>
                <div style={{ fontSize:9, color:"#8A8378", marginTop:3, fontWeight:700, fontFamily:"Montserrat", letterSpacing:.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ overflow:"hidden" }}>
          <SectionHeader title="Actividad reciente" />
          {reqs.length===0
            ? <Empty icon="📋" msg="Sin actividad" sub="Crea tu primera requisición para comenzar" />
            : reqs.slice(0,7).map(r=>{
              const s=STAGES.find(s=>s.id===r.stage); const p=PRIORITY[r.priority];
              return(
                <div key={r.id} className="trow" onClick={()=>setPage("tracker")}>
                  <span className="bpo">{r.id}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,color:"#2D2D2D",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.description}</div>
                    <div style={{fontSize:11,color:"#8A8378"}}>{new Date(r.createdAt).toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"})}</div>
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
function REQPage({ ctx }) {
  const {reqs,saveReqs,projs,saveProjs,sups,saveSups,ctrPO,setCtrPO,showToast}=ctx;
  const [showNew,setShowNew]=useState(false);
  const [selected,setSelected]=useState(null);
  const [filterType,setFilterType]=useState("all");
  const [search,setSearch]=useState("");

  const handleCreate=async(form)=>{
    const n=ctrPO+1;
    const req={...form,id:genPO(n),createdAt:new Date().toISOString(),stage:"REQ",
      history:[{stage:"REQ",date:new Date().toISOString(),note:`Requisición ${form.reqType==="field"?"de campo":"por estimación"} creada`}]};
    await saveReqs([req,...reqs]); setCtrPO(n); await save("proc:counter",n);
    setShowNew(false); showToast(`${req.id} generada — ${form.reqType==="field"?"Campo 🏗️":"Estimación 📊"}`);
  };

  const filtered=reqs.filter(r=>{
    const ms=r.description?.toLowerCase().includes(search.toLowerCase())||r.id?.toLowerCase().includes(search.toLowerCase());
    const mt=filterType==="all"||r.reqType===filterType;
    return ms&&mt;
  });

  const fieldCount=reqs.filter(r=>r.reqType==="field").length;
  const estimCount=reqs.filter(r=>r.reqType==="estimation").length;

  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">📋 Requisición de Compra</div><div className="ph-sub">Gestión de solicitudes de campo y estimaciones de proyecto</div></div>
        <button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Nueva Requisición</button>
      </div>
      <div className="pb">
        <div className="gold-line" />
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[
            {l:"Total PR",v:reqs.length,c:"#2D2D2D",icon:"📋"},
            {l:"De Campo",v:fieldCount,c:"#D4745A",icon:"🏗️"},
            {l:"Por Estimación",v:estimCount,c:"#5B9BD5",icon:"📊"},
            {l:"Urgentes",v:reqs.filter(r=>r.priority==="urgente").length,c:"#D44",icon:"🔴"},
          ].map(s=>(
            <div key={s.l} className="stat" style={{"--sc":s.c}}>
              <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
              <div className="stat-val">{s.v}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          <input className="inp" style={{flex:1}} placeholder="Buscar por PO o descripción…" value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="sel" style={{width:180}} value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="all">Todos los tipos</option>
            <option value="field">🏗️ De Campo</option>
            <option value="estimation">📊 Por Estimación</option>
          </select>
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SectionHeader title={`Requisiciones · ${filtered.length} registros`} />
          {filtered.length===0?<Empty icon="📋" msg="Sin requisiciones" sub="Crea la primera para iniciar el proceso de compra" />:
          filtered.map(r=>{
            const s=STAGES.find(s=>s.id===r.stage); const p=PRIORITY[r.priority];
            const proj=projs?.find(pr=>pr.id===r.projectId);
            return(<div key={r.id} className="trow" onClick={()=>setSelected(r)}>
              <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
                <span className="bpo">{r.id}</span>
                <span className={r.reqType==="field"?"bfield":"bestim"}>{r.reqType==="field"?"🏗️ Campo":"📊 Estimación"}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.description}</div>
                <div style={{fontSize:11,color:"#8A8378",marginTop:2}}>
                  {r.quantity} {r.unit}
                  {proj&&<span style={{marginLeft:8,color:"#5B9BD5"}}>· {proj.code}</span>}
                  {r.costCode&&<span style={{marginLeft:6,color:"#8A8378"}}>· {r.costCode.split("—")[0].trim()}</span>}
                  {r.site&&<span style={{marginLeft:6,color:"#D4745A"}}>· 📍{r.site}</span>}
                </div>
              </div>
              {r.estimatedBudget&&(
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:12,fontFamily:"Montserrat",fontWeight:700,color:"#A8863A"}}>${fmt(r.estimatedBudget)}</div>
                  <div style={{fontSize:10,color:"#8A8378"}}>estimado</div>
                </div>
              )}
              <ProgressBar stage={r.stage} small />
              <span className="chip" style={{background:`${s.color}15`,color:s.color,flexShrink:0}}>● {s.label}</span>
              <span className="chip" style={{background:p.bg,color:p.color,flexShrink:0}}>{p.dot}</span>
              <span style={{color:"#C8C2B4",fontSize:14}}>›</span>
            </div>);
          })}
        </div>
      </div>
      {showNew&&<NewREQModal projs={projs||[]} onClose={()=>setShowNew(false)} onSubmit={handleCreate} />}
      {selected&&<REQDetail req={selected} projs={projs||[]} onClose={()=>setSelected(null)} />}
    </div>
  );
}
function NewREQModal({ projs, onClose, onSubmit }) {
  const [type,setType]=useState(null);
  const [f,setF]=useState({
    description:"",quantity:"",unit:"Unidad",requiredDate:"",supplier:"",priority:"normal",
    site:"",fieldRequestedBy:"",fieldSupervisor:"",projectId:"",wbs:"",costCenter:"",
    estimatedBudget:"",estimatedQty:"",justification:"",targetDate:"",
  });
  const set=(k,v)=>setF(p=>({...p,[k]:v}));

  const valid=type&&f.description&&f.quantity&&f.requiredDate&&
    (type==="field"?(f.fieldRequestedBy&&f.projectId):(f.projectId&&f.estimatedBudget));

  if(!type) return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:640}}>
        <div className="mod-head">
          <div>
            <div style={{fontFamily:"Montserrat",fontSize:17,fontWeight:800,color:"#2D2D2D"}}>Nueva Requisición de Compra</div>
            <div style={{fontSize:12,color:"#8A8378",marginTop:2}}>Selecciona el tipo de requisición para continuar</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{display:"flex",gap:16,marginBottom:24}}>
          <div className={`type-card ${type==="field"?"selected":""}`} onClick={()=>setType("field")}>
            <div style={{fontSize:36,marginBottom:12}}>🏗️</div>
            <div style={{fontFamily:"Montserrat",fontSize:15,fontWeight:800,color:"#2D2D2D",marginBottom:6}}>Requisición de Campo</div>
            <div style={{fontSize:12,color:"#8A8378",lineHeight:1.6,marginBottom:14}}>Surge en obra o campo. Necesidad inmediata o no planificada. Requiere aprobación rápida.</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {["📍 Ubicación en obra / site","👷 Solicitante y supervisor","🏢 Proyecto y cost code","⚡ Flujo de aprobación acelerado"].map(t=>(
                <div key={t} style={{fontSize:11,color:"#5A5550",display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:"#D4745A",fontWeight:700}}>✓</span>{t}
                </div>
              ))}
            </div>
          </div>
          <div className={`type-card ${type==="estimation"?"selected":""}`} onClick={()=>setType("estimation")}>
            <div style={{fontSize:36,marginBottom:12}}>📊</div>
            <div style={{fontFamily:"Montserrat",fontSize:15,fontWeight:800,color:"#2D2D2D",marginBottom:6}}>Requisición por Estimación</div>
            <div style={{fontSize:12,color:"#8A8378",lineHeight:1.6,marginBottom:14}}>Planificada y presupuestada. Vinculada a un proyecto con partida aprobada.</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {["📁 Vinculada a proyecto activo","💰 Partida presupuestaria / WBS","📐 Cantidad estimada vs real","📋 Justificación técnica requerida"].map(t=>(
                <div key={t} style={{fontSize:11,color:"#5A5550",display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:"#5B9BD5",fontWeight:700}}>✓</span>{t}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );

  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head">
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontFamily:"Montserrat",fontSize:17,fontWeight:800,color:"#2D2D2D"}}>
                {type==="field"?"🏗️ Requisición de Campo":"📊 Requisición por Estimación"}
              </div>
              <button onClick={()=>setType(null)} className="btn btn-ghost btn-sm">Cambiar tipo</button>
            </div>
            <div style={{fontSize:11,color:"#8A8378",marginTop:2}}>Se generará el número PO automáticamente al guardar</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{display:"grid",gap:14}}>
          <div>
            <div className="section-label">{type==="field"?"Datos del ítem requerido":"Ítem a adquirir"}</div>
            <div style={{display:"grid",gap:12}}>
              <div><label className="lbl">Descripción del ítem / servicio *</label>
                <input className="inp" value={f.description} onChange={e=>set("description",e.target.value)} placeholder="Describe con detalle qué se necesita…" />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div><label className="lbl">Cantidad *</label><input className="inp" type="number" value={f.quantity} onChange={e=>set("quantity",e.target.value)} /></div>
                <div><label className="lbl">Unidad</label>
                  <select className="sel" value={f.unit} onChange={e=>set("unit",e.target.value)}>
                    {UNITS.map(u=><option key={u}>{u}</option>)}
                  </select>
                </div>
                <div><label className="lbl">Fecha requerida *</label><input className="inp" type="date" value={f.requiredDate} onChange={e=>set("requiredDate",e.target.value)} /></div>
              </div>
            </div>
          </div>

          {type==="field"&&(<>
            <div>
              <div className="section-label">Ubicación y responsables</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label className="lbl">Ubicación / Site en obra <span style={{color:"#C8C2B4",fontWeight:400}}>(opcional)</span></label>
                  <input className="inp" value={f.site} onChange={e=>set("site",e.target.value)} placeholder="Ej: Torre A — Piso 8, Sector Norte" />
                </div>
                <div><label className="lbl">Solicitante *</label>
                  <input className="inp" value={f.fieldRequestedBy} onChange={e=>set("fieldRequestedBy",e.target.value)} placeholder="Nombre de quien solicita" />
                </div>
                <div><label className="lbl">Supervisor de campo</label>
                  <input className="inp" value={f.fieldSupervisor} onChange={e=>set("fieldSupervisor",e.target.value)} placeholder="Nombre del supervisor" />
                </div>
                <div><label className="lbl">Proveedor sugerido</label>
                  <input className="inp" value={f.supplier} onChange={e=>set("supplier",e.target.value)} placeholder="Opcional" />
                </div>
              </div>
            </div>
            <div>
              <div className="section-label">Imputación de costos</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label className="lbl">Proyecto *</label>
                  <select className="sel" value={f.projectId} onChange={e=>set("projectId",e.target.value)}>
                    <option value="">— Seleccionar proyecto —</option>
                    {projs.map(p=><option key={p.id} value={p.id}>{p.code} — {p.name?.slice(0,35)}</option>)}
                  </select>
                </div>
                <div><label className="lbl">Partida / Cost Code</label>
                  <select className="sel" value={f.wbs} onChange={e=>set("wbs",e.target.value)}>
                    <option value="">— Seleccionar partida —</option>
                    {COST_CODES.map(c=><option key={c.code} value={`${c.code} — ${c.desc}`}>{c.code} — {c.desc}</option>)}
                  </select>
                </div>
                <div><label className="lbl">Centro de costo</label>
                  <select className="sel" value={f.costCenter} onChange={e=>set("costCenter",e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    {COST_CENTERS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="info-box info-orange">⚡ Las requisiciones de campo tienen flujo de aprobación acelerado.</div>
          </>)}

          {type==="estimation"&&(<>
            <div>
              <div className="section-label">Proyecto e imputación</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label className="lbl">Proyecto *</label>
                  <select className="sel" value={f.projectId} onChange={e=>set("projectId",e.target.value)}>
                    <option value="">— Seleccionar proyecto —</option>
                    {projs.map(p=><option key={p.id} value={p.id}>{p.code} — {p.name?.slice(0,30)}</option>)}
                  </select>
                </div>
                <div><label className="lbl">Partida / Cost Code *</label>
                  <select className="sel" value={f.wbs} onChange={e=>set("wbs",e.target.value)}>
                    <option value="">— Seleccionar partida —</option>
                    {COST_CODES.map(c=><option key={c.code} value={`${c.code} — ${c.desc}`}>{c.code} — {c.desc}</option>)}
                  </select>
                </div>
                <div><label className="lbl">Centro de costo</label>
                  <select className="sel" value={f.costCenter} onChange={e=>set("costCenter",e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    {COST_CENTERS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="lbl">Proveedor sugerido</label>
                  <input className="inp" value={f.supplier} onChange={e=>set("supplier",e.target.value)} placeholder="Opcional" />
                </div>
              </div>
            </div>
            <div>
              <div className="section-label">Estimación de costos</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label className="lbl">Presupuesto estimado *</label>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#8A8378",fontWeight:600}}>$</span>
                    <input className="inp" style={{paddingLeft:28}} type="number" value={f.estimatedBudget} onChange={e=>set("estimatedBudget",e.target.value)} placeholder="0.00" />
                  </div>
                </div>
                <div><label className="lbl">Cantidad estimada</label>
                  <input className="inp" type="number" value={f.estimatedQty} onChange={e=>set("estimatedQty",e.target.value)} />
                </div>
                <div><label className="lbl">Fecha objetivo</label>
                  <input className="inp" type="date" value={f.targetDate} onChange={e=>set("targetDate",e.target.value)} />
                </div>
              </div>
            </div>
            <div><label className="lbl">Justificación técnica</label>
              <textarea className="ta" value={f.justification} onChange={e=>set("justification",e.target.value)}
                placeholder="Describe por qué se necesita esta adquisición…" />
            </div>
            <div className="info-box info-blue">📊 Las requisiciones por estimación requieren aprobación de la partida presupuestaria.</div>
          </>)}

          <div>
            <div className="section-label">Prioridad</div>
            <div style={{display:"flex",gap:10}}>
              {Object.entries(PRIORITY).map(([k,p])=>(
                <button key={k} onClick={()=>set("priority",k)} style={{flex:1,padding:"11px",border:`1.5px solid ${f.priority===k?p.color:"#E8E4DC"}`,borderRadius:8,cursor:"pointer",background:f.priority===k?p.bg:"#F7F5F1",color:f.priority===k?p.color:"#8A8378",fontFamily:"Montserrat",fontSize:11,fontWeight:700,transition:"all .15s"}}>
                  {p.dot} {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:22,paddingTop:16,borderTop:"1px solid #E8E4DC"}}>
          <button onClick={()=>setType(null)} style={{fontSize:12,color:"#8A8378",background:"none",border:"none",cursor:"pointer"}}>← Cambiar tipo</button>
          <div style={{display:"flex",gap:10}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:0.45}}
              onClick={()=>onSubmit({...f,reqType:type,costCode:f.wbs})}>
              Generar PO →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function REQDetail({ req, projs, onClose }) {
  const proj=projs?.find(p=>p.id===req.projectId);
  const isField=req.reqType==="field";
  const p=PRIORITY[req.priority]||PRIORITY.normal;
  const fields=isField?[
    ["Tipo","🏗️ Requisición de Campo"],
    ["Ubicación / Site",req.site||"—"],
    ["Solicitante",req.fieldRequestedBy||"—"],
    ["Supervisor",req.fieldSupervisor||"—"],
    ["Proyecto",proj?`${proj.code} — ${proj.name}`:"—"],
    ["Cost Code",req.costCode||req.wbs||"—"],
    ["Centro de costo",req.costCenter||"—"],
    ["Proveedor sugerido",req.supplier||"—"],
    ["Prioridad",p.label],
    ["Fecha requerida",new Date(req.requiredDate).toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"})],
  ]:[
    ["Tipo","📊 Requisición por Estimación"],
    ["Proyecto",proj?`${proj.code} — ${proj.name}`:"—"],
    ["Cost Code",req.costCode||req.wbs||"—"],
    ["Centro de costo",req.costCenter||"—"],
    ["Presupuesto estimado",req.estimatedBudget?`$${fmt(req.estimatedBudget)}`:"—"],
    ["Cantidad estimada",req.estimatedQty||"—"],
    ["Fecha objetivo",req.targetDate?new Date(req.targetDate).toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"}):"—"],
    ["Prioridad",p.label],
    ["Fecha requerida",new Date(req.requiredDate).toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"})],
  ];
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:700}}>
        <div className="mod-head">
          <div>
            <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
              <span className="bpo">{req.id}</span>
              <span className={isField?"bfield":"bestim"}>{isField?"🏗️ Campo":"📊 Estimación"}</span>
              <span className="chip" style={{background:p.bg,color:p.color}}>{p.dot} {p.label}</span>
            </div>
            <div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:800,color:"#2D2D2D"}}>{req.description}</div>
            <div style={{fontSize:12,color:"#8A8378",marginTop:2}}>{req.quantity} {req.unit}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card" style={{padding:"14px 16px",marginBottom:14}}><ProgressBar stage={req.stage} /></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {fields.map(([k,v])=>(
            <div key={k} style={{background:"#F7F5F1",borderRadius:8,padding:"10px 14px",border:"1px solid #E8E4DC"}}>
              <div style={{fontSize:9,color:"#8A8378",fontFamily:"Montserrat",fontWeight:700,letterSpacing:.5,marginBottom:3}}>{k.toUpperCase()}</div>
              <div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
        {req.justification&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:"#8A8378",fontFamily:"Montserrat",fontWeight:700,letterSpacing:.5,marginBottom:6}}>JUSTIFICACIÓN TÉCNICA</div>
            <div style={{background:"#F7F5F1",borderRadius:8,padding:"12px 14px",border:"1px solid #E8E4DC",fontSize:12,color:"#2D2D2D",lineHeight:1.6}}>{req.justification}</div>
          </div>
        )}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"#8A8378",fontFamily:"Montserrat",fontWeight:700,letterSpacing:.5,marginBottom:8}}>HISTORIAL</div>
          {(req.history||[]).map((h,i)=>{
            const s=STAGES.find(s=>s.id===h.stage);
            return(<div key={i} style={{display:"flex",gap:10,marginBottom:6,alignItems:"flex-start"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:s?.color||"#8A8378",marginTop:4,flexShrink:0}}/>
              <div><div style={{fontSize:12,color:"#2D2D2D"}}>{h.note}</div><div style={{fontSize:10,color:"#8A8378"}}>{new Date(h.date).toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div></div>
            </div>);
          })}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end"}}><button className="btn btn-ghost" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  );
}
function RFQPage({ ctx }) {
  const {reqs,rfqs,saveRfqs,saveReqs,sups,saveSups,ctrRFQ,setCtrRFQ,showToast}=ctx;
  const [showNew,setShowNew]=useState(false);
  const [selected,setSelected]=useState(null);
  const [tab,setTab]=useState("rfqs");
  const eligible=reqs.filter(r=>["REQ","RFQ"].includes(r.stage));

  const handleCreate=async(data)=>{
    const n=ctrRFQ+1;
    const rfq={...data,id:genId("RFQ",n),createdAt:new Date().toISOString(),status:"enviada",
      responses:data.supplierIds.map(sid=>({supplierId:sid,status:"pendiente",price:null,deliveryDays:null,paymentTerms:"contado",notes:"",respondedAt:null}))};
    const updRfqs=[rfq,...rfqs];
    const updReqs=reqs.map(r=>r.id===data.poId&&r.stage==="REQ"?{...r,stage:"RFQ",history:[...r.history,{stage:"RFQ",date:new Date().toISOString(),note:`RFQ ${rfq.id} enviada a ${data.supplierIds.length} proveedores`}]}:r);
    await saveRfqs(updRfqs); await saveReqs(updReqs);
    setCtrRFQ(n); await save("proc:rfqCounter",n);
    setShowNew(false); showToast(`${rfq.id} creada`);
  };

  const handleRecord=async(rfqId,supId,data)=>{
    const upd=rfqs.map(r=>r.id===rfqId?{...r,status:"con_respuestas",responses:r.responses.map(res=>res.supplierId===supId?{...res,...data,status:"respondida",respondedAt:new Date().toISOString()}:res)}:r);
    await saveRfqs(upd);
    if(selected?.id===rfqId)setSelected(upd.find(r=>r.id===rfqId));
    showToast("Respuesta registrada");
  };

  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">💬 Cotización (RFQ)</div><div className="ph-sub">Solicitudes de precio y gestión de proveedores</div></div>
        <div style={{display:"flex",gap:10}}>
          <div style={{display:"flex",gap:2,background:"#F7F5F1",padding:3,borderRadius:7,border:"1px solid #E8E4DC"}}>
            {[["rfqs","Cotizaciones"],["sups","Proveedores"]].map(([id,l])=><button key={id} onClick={()=>setTab(id)} style={{padding:"6px 14px",border:"none",borderRadius:5,background:tab===id?"#FFFFFF":"transparent",color:tab===id?"#2D2D2D":"#8A8378",fontFamily:"Montserrat",fontSize:11,fontWeight:700,cursor:"pointer",boxShadow:tab===id?"0 1px 3px rgba(0,0,0,.08)":"none"}}>{l}</button>)}
          </div>
          {tab==="rfqs"&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Nueva RFQ</button>}
        </div>
      </div>
      <div className="pb">
        <div className="gold-line" />
        {tab==="rfqs"&&(
          <div className="card" style={{overflow:"hidden"}}>
            <SectionHeader title={`Solicitudes de Cotización · ${rfqs.length} RFQs`} />
            {rfqs.length===0?<Empty icon="💬" msg="Sin cotizaciones" sub={eligible.length>0?"Crea la primera RFQ":"Crea una requisición primero"} />:
            rfqs.map(rfq=>{
              const r=reqs.find(r=>r.id===rfq.poId);
              const resp=rfq.responses.filter(r=>r.status==="respondida").length;
              const tot=rfq.responses.length;
              return(<div key={rfq.id} className="trow" onClick={()=>setSelected(rfq)}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <span className="bgold">{rfq.id}</span>
                  <span className="bpo" style={{fontSize:10,padding:"2px 8px"}}>{rfq.poId}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r?.description||"—"}</div>
                  <div style={{fontSize:11,color:"#8A8378"}}>Vence: {new Date(rfq.dueDate).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})} · {tot} proveedores</div>
                </div>
                <div style={{width:110}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#8A8378",marginBottom:3,fontFamily:"Montserrat",fontWeight:600}}><span>Respuestas</span><span style={{color:resp===tot?"#5AAD7A":"#A8863A"}}>{resp}/{tot}</span></div>
                  <div style={{height:4,background:"#E8E4DC",borderRadius:2,overflow:"hidden"}}><div style={{width:`${tot?resp/tot*100:0}%`,height:"100%",background:resp===tot?"#5AAD7A":"#C9A84C",borderRadius:2}}/></div>
                </div>
                <span style={{color:"#C8C2B4",fontSize:14}}>›</span>
              </div>);
            })}
          </div>
        )}
        {tab==="sups"&&(
          <div className="card" style={{overflow:"hidden"}}>
            <SectionHeader title={`Base de Proveedores · ${sups.length} registrados`} />
            {sups.map(s=>(
              <div key={s.id} className="trow" style={{cursor:"default"}}>
                <div style={{width:36,height:36,borderRadius:8,background:"rgba(201,168,76,0.10)",border:"1px solid rgba(201,168,76,0.28)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🏢</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,color:"#2D2D2D",fontWeight:600}}>{s.name}</div>
                  <div style={{fontSize:11,color:"#8A8378"}}>{s.contact} · {s.email}</div>
                </div>
                <span className="chip" style={{background:"rgba(201,168,76,0.10)",color:"#A8863A",border:"1px solid rgba(201,168,76,0.28)"}}>{s.category}</span>
                <Stars r={s.rating} />
              </div>
            ))}
          </div>
        )}
      </div>
      {showNew&&<RFQForm eligible={eligible} sups={sups} onClose={()=>setShowNew(false)} onSubmit={handleCreate} />}
      {selected&&<RFQDetail rfq={selected} sups={sups} reqs={reqs} onClose={()=>setSelected(null)} onRecord={handleRecord} />}
    </div>
  );
}
function RFQForm({ eligible, sups, onClose, onSubmit }) {
  const [f,setF]=useState({poId:eligible[0]?.id||"",description:"",quantity:"",unit:"",dueDate:"",notes:"",supplierIds:[]});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const toggle=id=>set("supplierIds",f.supplierIds.includes(id)?f.supplierIds.filter(s=>s!==id):[...f.supplierIds,id]);
  const selPO=eligible.find(r=>r.id===f.poId);
  useEffect(()=>{ if(selPO){set("description",selPO.description);set("quantity",selPO.quantity);set("unit",selPO.unit);} },[f.poId]);
  const valid=f.poId&&f.description&&f.dueDate&&f.supplierIds.length>=2;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div style={{fontFamily:"Montserrat",fontSize:17,fontWeight:800,color:"#2D2D2D"}}>Nueva Solicitud de Cotización (RFQ)</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        {eligible.length===0?<Empty icon="💬" msg="Sin POs disponibles" sub="Crea una requisición primero" />:(
          <div style={{display:"grid",gap:14}}>
            <div><label className="lbl">PO asociada</label><select className="sel" value={f.poId} onChange={e=>set("poId",e.target.value)}>{eligible.map(r=><option key={r.id} value={r.id}>{r.id} · {r.description?.slice(0,40)}</option>)}</select></div>
            <div><label className="lbl">Descripción</label><input className="inp" value={f.description} onChange={e=>set("description",e.target.value)} /></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <div><label className="lbl">Cantidad</label><input className="inp" value={f.quantity} onChange={e=>set("quantity",e.target.value)} /></div>
              <div><label className="lbl">Unidad</label><input className="inp" value={f.unit} onChange={e=>set("unit",e.target.value)} /></div>
              <div><label className="lbl">Fecha límite *</label><input className="inp" type="date" value={f.dueDate} onChange={e=>set("dueDate",e.target.value)} /></div>
            </div>
            <div><label className="lbl">Notas / especificaciones</label><textarea className="ta" value={f.notes} onChange={e=>set("notes",e.target.value)} /></div>
            <div>
              <label className="lbl">Proveedores a consultar (mín. 2) — {f.supplierIds.length} seleccionados</label>
              <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:300,overflowY:"auto"}}>
                {sups.filter(s=>s.active).map(s=>(
                  <div key={s.id} onClick={()=>toggle(s.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:8,border:`1.5px solid ${f.supplierIds.includes(s.id)?"#C9A84C":"#E8E4DC"}`,background:f.supplierIds.includes(s.id)?"rgba(201,168,76,0.10)":"#F7F5F1",cursor:"pointer",transition:"all .15s"}}>
                    <div style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${f.supplierIds.includes(s.id)?"#C9A84C":"#C8C2B4"}`,background:f.supplierIds.includes(s.id)?"#C9A84C":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {f.supplierIds.includes(s.id)&&<span style={{color:"#1A1814",fontSize:11,fontWeight:700}}>✓</span>}
                    </div>
                    <div style={{flex:1}}><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{s.name}</div><div style={{fontSize:11,color:"#8A8378"}}>{s.contact} · {s.email}</div></div>
                    <Stars r={s.rating} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:14,borderTop:"1px solid #E8E4DC"}}>
              <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
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
  const [rf,setRf]=useState({price:"",deliveryDays:"",paymentTerms:"contado",notes:""});
  const req=reqs.find(r=>r.id===rfq.poId);
  const answered=rfq.responses.filter(r=>r.status==="respondida");
  const bestPrice=answered.length?Math.min(...answered.map(r=>r.price)):null;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:780}}>
        <div className="mod-head">
          <div>
            <div style={{display:"flex",gap:8,marginBottom:6}}><span className="bgold">{rfq.id}</span><span className="bpo">{rfq.poId}</span></div>
            <div style={{fontFamily:"Montserrat",fontSize:15,fontWeight:800,color:"#2D2D2D"}}>{req?.description||"—"}</div>
            <div style={{fontSize:11,color:"#8A8378",marginTop:2}}>Vence: {new Date(rfq.dueDate).toLocaleDateString("es-ES",{day:"2-digit",month:"long"})}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {answered.length>=2&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <div style={{background:"rgba(201,168,76,0.10)",border:"1px solid rgba(201,168,76,0.28)",borderRadius:8,padding:"12px 16px"}}>
              <div style={{fontSize:10,color:"#A8863A",fontWeight:700,fontFamily:"Montserrat",letterSpacing:1,marginBottom:3}}>MEJOR PRECIO</div>
              <div style={{fontFamily:"Montserrat",fontSize:20,fontWeight:900,color:"#A8863A"}}>${bestPrice?.toLocaleString()}</div>
            </div>
            <div style={{background:"rgba(90,173,122,.08)",border:"1px solid rgba(90,173,122,.25)",borderRadius:8,padding:"12px 16px"}}>
              <div style={{fontSize:10,color:"#5AAD7A",fontWeight:700,fontFamily:"Montserrat",letterSpacing:1,marginBottom:3}}>RESPUESTAS</div>
              <div style={{fontFamily:"Montserrat",fontSize:20,fontWeight:900,color:"#5AAD7A"}}>{answered.length}/{rfq.responses.length}</div>
            </div>
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {rfq.responses.map(res=>{
            const sup=sups.find(s=>s.id===res.supplierId);
            const isRec=recId===res.supplierId;
            const isBest=answered.length>1&&res.price===bestPrice;
            return(<div key={res.supplierId} style={{background:"#F7F5F1",border:"1px solid #E8E4DC",borderRadius:10,padding:"12px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:isRec?12:0}}>
                <div style={{flex:1}}><div style={{fontSize:13,color:"#2D2D2D",fontWeight:600}}>{sup?.name}</div><div style={{fontSize:11,color:"#8A8378"}}>{sup?.email}</div></div>
                {res.status==="respondida"?(
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:800,color:isBest?"#A8863A":"#2D2D2D"}}>${res.price?.toLocaleString()} {isBest?"⭐":""}</div>
                      <div style={{fontSize:10,color:"#8A8378"}}>{res.deliveryDays}d · {res.paymentTerms}</div>
                    </div>
                    <span className="chip" style={{background:"rgba(90,173,122,.12)",color:"#5AAD7A"}}>✓ Respondida</span>
                  </div>
                ):(
                  <div style={{display:"flex",gap:8}}>
                    <span className="chip" style={{background:"rgba(201,168,76,.10)",color:"#A8863A"}}>⏳ Pendiente</span>
                    <button className="btn btn-dark btn-sm" onClick={()=>{setRecId(res.supplierId);setRf({price:"",deliveryDays:"",paymentTerms:"contado",notes:""});}}>Registrar respuesta</button>
                  </div>
                )}
              </div>
              {isRec&&(
                <div style={{borderTop:"1px solid #E8E4DC",paddingTop:10}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 2fr",gap:8,marginBottom:8}}>
                    <div><label className="lbl">Precio unit.</label><input className="inp" type="number" value={rf.price} onChange={e=>setRf(p=>({...p,price:e.target.value}))} /></div>
                    <div><label className="lbl">Días entrega</label><input className="inp" type="number" value={rf.deliveryDays} onChange={e=>setRf(p=>({...p,deliveryDays:e.target.value}))} /></div>
                    <div><label className="lbl">Cond. pago</label><select className="sel" value={rf.paymentTerms} onChange={e=>setRf(p=>({...p,paymentTerms:e.target.value}))}>{PAYMENT_OPTIONS.map(o=><option key={o}>{o}</option>)}</select></div>
                    <div><label className="lbl">Notas</label><input className="inp" value={rf.notes} onChange={e=>setRf(p=>({...p,notes:e.target.value}))} /></div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn btn-gold btn-sm" disabled={!rf.price||!rf.deliveryDays} onClick={()=>{onRecord(rfq.id,res.supplierId,{price:parseFloat(rf.price),deliveryDays:parseInt(rf.deliveryDays),paymentTerms:rf.paymentTerms,notes:rf.notes});setRecId(null);}}>Guardar</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setRecId(null)}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>);
          })}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end"}}><button className="btn btn-ghost" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  );
}
function CMPPage({ ctx }) {
  const {reqs,rfqs,cmps,saveCmps,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyRFQs=rfqs.filter(r=>r.responses.filter(res=>res.status==="respondida").length>=2&&!cmps.find(c=>c.rfqId===r.id));

  const handleCreate=async(rfqId,payMap)=>{
    const rfq=rfqs.find(r=>r.id===rfqId);
    const enriched=rfq.responses.filter(r=>r.status==="respondida").map(r=>({...r,paymentTerms:payMap[r.supplierId]||"contado"}));
    const scored=scoreSuppliers(enriched,sups);
    const cmp={id:genId("CMP",cmps.length+1),rfqId,poId:rfq.poId,createdAt:new Date().toISOString(),scored,winnerId:scored[0]?.supplierId,status:"pendiente"};
    const updCmps=[cmp,...cmps];
    const updReqs=reqs.map(r=>r.id===rfq.poId?{...r,stage:"CMP",history:[...r.history,{stage:"CMP",date:new Date().toISOString(),note:`CMP ${cmp.id} generado. Ganador: ${scored[0]?.sup?.name}`}]}:r);
    await saveCmps(updCmps); await saveReqs(updReqs);
    setShowNew(false); showToast(`${cmp.id} generado — Ganador: ${scored[0]?.sup?.name}`);
  };

  const handleApprove=async(cmpId,winnerId)=>{
    const updated=cmps.map(c=>c.id===cmpId?{...c,status:"aprobado",winnerId,approvedAt:new Date().toISOString()}:c);
    const cmp=updated.find(c=>c.id===cmpId); const ws=sups.find(s=>s.id===winnerId);
    const updReqs=reqs.map(r=>r.id===cmp?.poId?{...r,stage:"PO",history:[...r.history,{stage:"PO",date:new Date().toISOString(),note:`Proveedor aprobado: ${ws?.name}`}]}:r);
    await saveCmps(updated); await saveReqs(updReqs);
    if(selected?.id===cmpId)setSelected(updated.find(c=>c.id===cmpId));
    showToast(`Aprobado → ${ws?.name} → lista para emitir OC`);
  };

  const bc=s=>s>=80?"#5AAD7A":s>=60?"#A8863A":"#D4745A";

  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">⚖️ Comparación de Proveedores</div><div className="ph-sub">Scoring automático — Precio 60% · Entrega 25% · Pago 15%</div></div>
        {readyRFQs.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Nuevo cuadro</button>}
      </div>
      <div className="pb">
        <div className="gold-line" />
        <div className="card" style={{overflow:"hidden"}}>
          <SectionHeader title={`Cuadros Comparativos · ${cmps.length} generados`} action={readyRFQs.length>0&&<span style={{fontSize:11,color:"#A8863A",fontFamily:"Montserrat",fontWeight:700}}>{readyRFQs.length} RFQ lista para comparar</span>} />
          {cmps.length===0?<Empty icon="⚖️" msg="Sin cuadros comparativos" sub={readyRFQs.length>0?"Genera el primer cuadro":"Registra respuestas de proveedores en RFQ"} />:
          cmps.map(c=>{
            const req=reqs.find(r=>r.id===c.poId); const winner=sups.find(s=>s.id===c.winnerId); const top=c.scored?.[0];
            return(<div key={c.id} className="trow" onClick={()=>setSelected(c)}>
              <div style={{display:"flex",flexDirection:"column",gap:4}}><span className="bgold">{c.id}</span><span className="bpo" style={{fontSize:10,padding:"2px 8px"}}>{c.poId}</span></div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description||"—"}</div>
                <div style={{fontSize:11,color:"#8A8378"}}>Proveedor recomendado: <strong style={{color:"#5AAD7A"}}>{winner?.name||"—"}</strong></div>
              </div>
              {top&&<div style={{textAlign:"center",padding:"6px 12px",background:`${bc(top.total)}10`,borderRadius:6,border:`1px solid ${bc(top.total)}25`}}><div style={{fontFamily:"Montserrat",fontSize:18,fontWeight:900,color:bc(top.total)}}>{top.total}</div><div style={{fontSize:9,color:"#8A8378",fontWeight:600}}>SCORE</div></div>}
              <span className="chip" style={{background:c.status==="aprobado"?"rgba(90,173,122,.12)":"rgba(201,168,76,.10)",color:c.status==="aprobado"?"#5AAD7A":"#A8863A"}}>{c.status==="aprobado"?"✓ Aprobado":"⏳ Pendiente"}</span>
              <span style={{color:"#C8C2B4",fontSize:14}}>›</span>
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
  const [rfqId,setRfqId]=useState(readyRFQs[0]?.id||"");
  const [payMap,setPayMap]=useState({});
  const rfq=readyRFQs.find(r=>r.id===rfqId);
  const answers=rfq?.responses.filter(r=>r.status==="respondida")||[];
  const enriched=answers.map(r=>({...r,paymentTerms:payMap[r.supplierId]||"contado"}));
  const preview=scoreSuppliers(enriched,sups);
  const bc=s=>s>=80?"#5AAD7A":s>=60?"#A8863A":"#D4745A";
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div style={{fontFamily:"Montserrat",fontSize:17,fontWeight:800,color:"#2D2D2D"}}>Nuevo Cuadro Comparativo</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">RFQ a comparar</label><select className="sel" value={rfqId} onChange={e=>setRfqId(e.target.value)}>{readyRFQs.map(r=>{const req=reqs.find(req=>req.id===r.poId);return<option key={r.id} value={r.id}>{r.id} · {req?.description?.slice(0,42)||r.id}</option>;})}</select></div>
          <div><label className="lbl">Condiciones de pago por proveedor</label>
            {answers.map(r=>{const sup=sups.find(s=>s.id===r.supplierId);return(
              <div key={r.supplierId} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,alignItems:"center",padding:"10px 14px",background:"#F7F5F1",border:"1px solid #E8E4DC",borderRadius:8,marginBottom:6}}>
                <div><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{sup?.name}</div><div style={{fontSize:11,color:"#8A8378"}}>${r.price?.toLocaleString()} · {r.deliveryDays}d</div></div>
                <select className="sel" value={payMap[r.supplierId]||"contado"} onChange={e=>setPayMap(m=>({...m,[r.supplierId]:e.target.value}))}>{PAYMENT_OPTIONS.map(o=><option key={o}>{o}</option>)}</select>
              </div>);
            })}
          </div>
          {preview.length>=2&&(
            <div><label className="lbl">Vista previa del scoring</label>
              {preview.map((r,i)=>(
                <div key={r.supplierId} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:i===0?"rgba(90,173,122,.06)":"#F7F5F1",border:`1px solid ${i===0?"rgba(90,173,122,.25)":"#E8E4DC"}`,borderRadius:10,marginBottom:6}}>
                  <div style={{textAlign:"center",width:44,flexShrink:0}}>
                    <div style={{fontFamily:"Montserrat",fontSize:20,fontWeight:900,color:bc(r.total)}}>{r.total}</div>
                    <div style={{fontSize:10}}>{i===0?"🥇":i===1?"🥈":"🥉"}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,color:"#2D2D2D",fontWeight:700,marginBottom:6}}>{r.sup?.name}</div>
                    <div style={{display:"flex",gap:8}}>
                      {[["P",r.ps,"#5AAD7A","60%"],["E",r.ds,"#5B9BD5","25%"],["$",r.ws,"#C9A84C","15%"]].map(([l,s,c,w])=>(
                        <div key={l} style={{flex:1}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#8A8378",marginBottom:2,fontFamily:"Montserrat",fontWeight:600}}><span>{l}({w})</span><span style={{color:c}}>{s}</span></div>
                          <div style={{height:3,background:"#E8E4DC",borderRadius:2}}><div style={{width:`${s}%`,height:"100%",background:c,borderRadius:2}}/></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:14,borderTop:"1px solid #E8E4DC"}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
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
  const bc=s=>s>=80?"#5AAD7A":s>=60?"#A8863A":"#D4745A";
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:860}}>
        <div className="mod-head">
          <div><div style={{display:"flex",gap:8,marginBottom:6}}><span className="bgold">{cmp.id}</span><span className="bpo">{cmp.poId}</span></div><div style={{fontFamily:"Montserrat",fontSize:15,fontWeight:800,color:"#2D2D2D"}}>{req?.description||"—"}</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{background:"rgba(201,168,76,0.10)",border:"1px solid rgba(201,168,76,0.28)",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#A8863A",fontFamily:"Montserrat",fontWeight:600}}>
          ⚖️ Ponderación: Precio 60% · Entrega 25% · Condiciones de pago 15%
        </div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${cmp.scored?.length||1},1fr)`,gap:12,marginBottom:18}}>
          {(cmp.scored||[]).map((r,i)=>{
            const isWin=override===r.supplierId;
            return(<div key={r.supplierId} onClick={()=>cmp.status==="pendiente"&&setOverride(r.supplierId)} style={{padding:"16px",borderRadius:10,background:isWin?"rgba(90,173,122,.06)":"#F7F5F1",border:`2px solid ${isWin?"#5AAD7A":"#E8E4DC"}`,cursor:cmp.status==="pendiente"?"pointer":"default",transition:"all .2s"}}>
              <div style={{textAlign:"center",marginBottom:12}}>
                <div style={{fontSize:16,marginBottom:4}}>{i===0?"🥇":i===1?"🥈":"🥉"}</div>
                <div style={{fontFamily:"Montserrat",fontSize:26,fontWeight:900,color:bc(r.total)}}>{r.total}</div>
                <div style={{fontSize:9,color:"#8A8378",fontFamily:"Montserrat",fontWeight:700,letterSpacing:.5}}>SCORE TOTAL</div>
              </div>
              <div style={{textAlign:"center",marginBottom:12}}>
                <div style={{fontSize:12,color:"#2D2D2D",fontWeight:700,fontFamily:"Montserrat"}}>{r.sup?.name}</div>
                <div style={{fontSize:10,color:"#8A8378"}}>{r.sup?.contact}</div>
              </div>
              <div style={{background:"#FFFFFF",borderRadius:8,padding:"10px",marginBottom:12,textAlign:"center",border:"1px solid #E8E4DC"}}>
                <div style={{fontFamily:"Montserrat",fontSize:18,fontWeight:900,color:"#2D2D2D"}}>${r.price?.toLocaleString()}</div>
                <div style={{fontSize:10,color:"#8A8378"}}>{r.deliveryDays} días · {r.paymentTerms}</div>
              </div>
              {[["Precio",r.ps,"#5AAD7A","60%"],["Entrega",r.ds,"#5B9BD5","25%"],["Pago",r.ws,"#C9A84C","15%"]].map(([l,s,c,w])=>(
                <div key={l} style={{marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#8A8378",marginBottom:2,fontFamily:"Montserrat",fontWeight:700}}><span>{l} ({w})</span><span style={{color:c}}>{s}/100</span></div>
                  <div style={{height:5,background:"#E8E4DC",borderRadius:3}}><div style={{width:`${s}%`,height:"100%",background:c,borderRadius:3}}/></div>
                </div>
              ))}
              {cmp.status==="pendiente"&&<div style={{textAlign:"center",marginTop:10,fontSize:10,color:isWin?"#5AAD7A":"#8A8378",fontFamily:"Montserrat",fontWeight:700}}>{isWin?"✓ SELECCIONADO":"Clic para seleccionar"}</div>}
            </div>);
          })}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          {cmp.status==="pendiente"?<button className="btn btn-gold" onClick={()=>onApprove(cmp.id,override)}>✓ Aprobar y emitir Orden de Compra →</button>:<span style={{padding:"10px 18px",background:"rgba(90,173,122,.12)",border:"1px solid rgba(90,173,122,.3)",borderRadius:6,fontSize:12,color:"#5AAD7A",fontFamily:"Montserrat",fontWeight:700}}>✅ Aprobado</span>}
        </div>
      </div>
    </div>
  );
}
function POPage({ ctx }) {
  const {reqs,cmps,orders,saveOrders,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyCMPs=cmps.filter(c=>c.status==="aprobado"&&!orders.find(o=>o.cmpId===c.id));
  const handleCreate=async(data)=>{
    const o={...data,id:data.poNumber,createdAt:new Date().toISOString(),approvalStatus:"pendiente",sentToSupplier:false};
    await saveOrders([o,...orders]);
    setShowNew(false); showToast(`${o.id} creada — pendiente de aprobación gerencial`);
  };
  const handleApprove=async(oId,name)=>{
    const updated=orders.map(o=>o.id===oId?{...o,approvalStatus:"aprobado",approvedBy:name,approvedAt:new Date().toISOString()}:o);
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
    showToast("Marcada como enviada al proveedor");
  };
  const stMap={pendiente:{l:"Pend. Aprobación",c:"#A8863A"},aprobado:{l:"Aprobada",c:"#5AAD7A"},rechazado:{l:"Rechazada",c:"#D4745A"}};
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">📄 Orden de Compra</div><div className="ph-sub">Emisión de OC y flujo de aprobación gerencial</div></div>
        {readyCMPs.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Emitir OC</button>}
      </div>
      <div className="pb">
        <div className="gold-line" />
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[["Pend. Aprobación",orders.filter(o=>o.approvalStatus==="pendiente").length,"#A8863A"],["Aprobadas",orders.filter(o=>o.approvalStatus==="aprobado").length,"#5AAD7A"],["Enviadas",orders.filter(o=>o.sentToSupplier).length,"#5B9BD5"]].map(([l,v,c])=>(
            <div key={l} className="stat" style={{"--sc":c}}><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
          ))}
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SectionHeader title="Órdenes de Compra" action={readyCMPs.length>0&&<span style={{fontSize:11,color:"#D4745A",fontFamily:"Montserrat",fontWeight:700}}>{readyCMPs.length} lista{readyCMPs.length>1?"s":""} para emitir</span>} />
          {orders.length===0?<Empty icon="📄" msg="Sin órdenes" sub={readyCMPs.length>0?"Emite la primera OC":"Aprueba un comparativo primero"} />:
          orders.map(o=>{
            const req=reqs.find(r=>r.id===o.poId); const sup=sups.find(s=>s.id===o.supplierId); const st=stMap[o.approvalStatus];
            return(<div key={o.id} className="trow" onClick={()=>setSelected(o)}>
              <span className="bpo">{o.id}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description||"—"}</div>
                <div style={{fontSize:11,color:"#8A8378"}}>{sup?.name} · ${parseFloat(o.totalAmount||0).toLocaleString()} · {o.paymentTerms}</div>
              </div>
              {o.sentToSupplier&&<span className="chip" style={{background:"rgba(91,155,213,.12)",color:"#5B9BD5"}}>📬 Enviada</span>}
              <span className="chip" style={{background:`${st.c}15`,color:st.c}}>● {st.l}</span>
              <span style={{color:"#C8C2B4",fontSize:14}}>›</span>
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
  const [cmpId,setCmpId]=useState(readyCMPs[0]?.id||"");
  const [f,setF]=useState({deliveryAddress:"",paymentTerms:"",contactName:"",contactEmail:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const cmp=cmps.find(c=>c.id===cmpId); const req=reqs.find(r=>r.id===cmp?.poId); const sup=sups.find(s=>s.id===cmp?.winnerId);
  const win=cmp?.scored?.find(s=>s.supplierId===cmp.winnerId);
  const total=win&&req?parseFloat(req.quantity)*parseFloat(win.price):0;
  const valid=cmpId&&f.deliveryAddress&&f.paymentTerms&&f.contactName;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div><div style={{fontFamily:"Montserrat",fontSize:17,fontWeight:800,color:"#2D2D2D"}}>Emitir Orden de Compra</div><div style={{fontSize:11,color:"#8A8378",marginTop:2}}>Datos cargados automáticamente desde el comparativo</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">Comparativo aprobado</label><select className="sel" value={cmpId} onChange={e=>setCmpId(e.target.value)}>{readyCMPs.map(c=>{const r=reqs.find(r=>r.id===c.poId);return<option key={c.id} value={c.id}>{c.id} · {r?.description?.slice(0,42)||c.id}</option>;})}</select></div>
          {cmp&&<div style={{background:"rgba(201,168,76,0.10)",border:"1px solid rgba(201,168,76,0.28)",borderRadius:8,padding:"12px 16px"}}>
            <div style={{fontSize:10,color:"#A8863A",fontFamily:"Montserrat",fontWeight:700,letterSpacing:1,marginBottom:10}}>DATOS CARGADOS AUTOMÁTICAMENTE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[["Número PO",req?.id],["Proveedor",sup?.name],["Total OC",`$${total.toLocaleString()}`]].map(([k,v])=><div key={k}><div style={{fontSize:9,color:"#A8863A",fontFamily:"Montserrat",fontWeight:700,marginBottom:2}}>{k}</div><div style={{fontSize:13,color:"#2D2D2D",fontWeight:700}}>{v}</div></div>)}
            </div>
          </div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{gridColumn:"1/-1"}}><label className="lbl">Dirección de entrega *</label><input className="inp" value={f.deliveryAddress} onChange={e=>set("deliveryAddress",e.target.value)} placeholder="Calle, Ciudad, Estado, País" /></div>
            <div><label className="lbl">Condiciones de pago *</label><input className="inp" value={f.paymentTerms} onChange={e=>set("paymentTerms",e.target.value)} placeholder="Crédito 30 días, Contado…" /></div>
            <div><label className="lbl">Contacto del proveedor *</label><input className="inp" value={f.contactName} onChange={e=>set("contactName",e.target.value)} /></div>
            <div><label className="lbl">Email del contacto</label><input className="inp" type="email" value={f.contactEmail} onChange={e=>set("contactEmail",e.target.value)} /></div>
            <div><label className="lbl">Notas adicionales</label><input className="inp" value={f.notes} onChange={e=>set("notes",e.target.value)} /></div>
          </div>
          <div style={{padding:"10px 14px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.28)",borderRadius:8,fontSize:12,color:"#A8863A",fontFamily:"Montserrat",fontWeight:600}}>
            ⚠️ Al crear la OC quedará Pendiente de Aprobación hasta que un gerente la apruebe.
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:14,borderTop:"1px solid #E8E4DC"}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
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
          <div><span className="bpo">{order.id}</span><div style={{fontFamily:"Montserrat",fontSize:15,fontWeight:800,color:"#2D2D2D",marginTop:6}}>{req?.description||"—"}</div><div style={{fontSize:11,color:"#8A8378",marginTop:2}}>{sup?.name} · ${parseFloat(order.totalAmount||0).toLocaleString()}</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card" style={{padding:"14px 16px",marginBottom:14}}><ProgressBar stage={req?.stage||"PO"} /></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[["Proveedor",sup?.name],["Contacto",order.contactName],["Cond. pago",order.paymentTerms],["Días entrega",`${order.deliveryDays} días hábiles`],["Dirección entrega",order.deliveryAddress],["Total OC",`$${parseFloat(order.totalAmount||0).toLocaleString()}`]].map(([k,v])=>(
            <div key={k} style={{background:"#F7F5F1",borderRadius:8,padding:"10px 14px",border:"1px solid #E8E4DC"}}>
              <div style={{fontSize:9,color:"#8A8378",fontFamily:"Montserrat",fontWeight:700,letterSpacing:.5,marginBottom:3}}>{k.toUpperCase()}</div>
              <div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
        {order.approvalStatus==="pendiente"&&(
          <div style={{background:"#F7F5F1",border:"1px solid #E8E4DC",borderRadius:10,padding:"14px 16px",marginBottom:14}}>
            <div style={{fontSize:11,color:"#8A8378",marginBottom:10,fontFamily:"Montserrat",fontWeight:600}}>APROBACIÓN GERENCIAL REQUERIDA</div>
            <div style={{display:"flex",gap:8}}>
              <input className="inp" placeholder="Nombre del gerente que aprueba" value={approver} onChange={e=>setApprover(e.target.value)} style={{flex:1}} />
              <button className="btn btn-success" disabled={!approver} style={{opacity:approver?1:0.45}} onClick={()=>onApprove(order.id,approver)}>✓ Aprobar OC</button>
            </div>
          </div>
        )}
        {order.approvalStatus==="aprobado"&&!order.sentToSupplier&&(
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
            <button className="btn btn-gold" onClick={()=>onSent(order.id)}>📬 Marcar como enviada al proveedor →</button>
          </div>
        )}
        {order.approvalStatus==="aprobado"&&(
          <div style={{padding:"10px 14px",background:"rgba(90,173,122,.08)",border:"1px solid rgba(90,173,122,.25)",borderRadius:8,fontSize:12,color:"#5AAD7A",fontFamily:"Montserrat",fontWeight:600}}>
            ✅ Aprobada por {order.approvedBy}{order.sentToSupplier?" · 📬 Enviada al proveedor":""}
          </div>
        )}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}><button className="btn btn-ghost" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  );
}
function DELPage({ ctx }) {
  const {reqs,orders,dels,saveDels,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyOrders=orders.filter(o=>o.approvalStatus==="aprobado"&&!dels.find(d=>d.orderId===o.id));
  const handleCreate=async(data)=>{
    const d={...data,id:genId("DEL",dels.length+1),createdAt:new Date().toISOString(),status:"en_camino",
      partials:data.partials.map((p,i)=>({...p,id:`P${i+1}`,received:false,receivedAt:null,receivedQty:0})),
      events:[{date:new Date().toISOString(),note:"Plan de delivery registrado",icon:"📋"}]};
    await saveDels([d,...dels]);
    setShowNew(false); showToast(`${d.id} registrado`);
  };
  const handlePartial=async(delId,partialId,qty,note)=>{
    const updated=dels.map(d=>{
      if(d.id!==delId)return d;
      const partials=d.partials.map(p=>p.id===partialId?{...p,received:true,receivedAt:new Date().toISOString(),receivedQty:qty}:p);
      const allDone=partials.every(p=>p.received); const anyDone=partials.some(p=>p.received);
      return{...d,partials,status:allDone?"completado":anyDone?"parcial":"en_camino",events:[...d.events,{date:new Date().toISOString(),note:note||`Parcial ${partialId} recibida`,icon:"📦"}]};
    });
    const del=updated.find(d=>d.id===delId);
    if(del?.status==="completado"){
      const updReqs=reqs.map(r=>r.id===del.poId?{...r,stage:"RCV",history:[...r.history,{stage:"RCV",date:new Date().toISOString(),note:`Delivery ${delId} completado. Listo para verificación.`}]}:r);
      await saveReqs(updReqs);
    }
    await saveDels(updated);
    if(selected?.id===delId)setSelected(updated.find(d=>d.id===delId));
    showToast(del?.status==="completado"?"Delivery completo → Recepción":"Parcial registrada");
  };
  const handleDelay=async(delId,reason)=>{
    const updated=dels.map(d=>d.id===delId?{...d,status:"retrasado",events:[...d.events,{date:new Date().toISOString(),note:`Retraso: ${reason}`,icon:"⚠️"}]}:d);
    await saveDels(updated);
    if(selected?.id===delId)setSelected(updated.find(d=>d.id===delId));
    showToast("Retraso registrado","⚠️");
  };
  const stC={en_camino:"#4AADA0",parcial:"#A8863A",completado:"#5AAD7A",retrasado:"#D4745A"};
  const stL={en_camino:"En camino",parcial:"Parcial",completado:"Completado",retrasado:"Retrasado"};
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">🚚 Delivery</div><div className="ph-sub">Planificación, seguimiento de entregas y alertas</div></div>
        {readyOrders.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Registrar Delivery</button>}
      </div>
      <div className="pb">
        <div className="gold-line" />
        {dels.filter(d=>d.status!=="completado"&&(d.status==="retrasado"||daysUntil(d.expectedDate)<=3)).map(d=>{
          const days=daysUntil(d.expectedDate); const req=reqs.find(r=>r.id===d.poId);
          return(<div key={d.id} onClick={()=>setSelected(d)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:"rgba(212,116,90,.06)",border:"1px solid rgba(212,116,90,.2)",borderRadius:8,marginBottom:8,cursor:"pointer",fontSize:12}}>
            <span>🔴</span>
            <span style={{color:"#D4745A",fontWeight:600,flex:1,fontFamily:"Montserrat"}}>{req?.description?.slice(0,50)} — {d.status==="retrasado"?"Retraso reportado":days<0?`${Math.abs(days)}d de atraso`:days===0?"Entrega hoy":`${days}d para entrega`}</span>
            <span style={{fontSize:11,color:"#8A8378"}}>Ver detalles →</span>
          </div>);
        })}
        <div className="card" style={{overflow:"hidden"}}>
          <SectionHeader title="Seguimiento de Entregas" action={readyOrders.length>0&&<span style={{fontSize:11,color:"#4AADA0",fontFamily:"Montserrat",fontWeight:700}}>{readyOrders.length} OC lista{readyOrders.length>1?"s":""} para planificar</span>} />
          {dels.length===0?<Empty icon="🚚" msg="Sin deliveries" sub={readyOrders.length>0?"Registra el primer plan de entrega":"Aprueba y envía una OC primero"} />:
          dels.map(d=>{
            const req=reqs.find(r=>r.id===d.poId); const sup=sups.find(s=>s.id===d.supplierId);
            const rec=d.partials.reduce((a,p)=>a+(p.received?p.qty:0),0); const tot=d.partials.reduce((a,p)=>a+p.qty,0);
            const days=daysUntil(d.expectedDate);
            return(<div key={d.id} className="trow" onClick={()=>setSelected(d)}>
              <div style={{width:44,height:44,borderRadius:8,background:`${stC[d.status]}10`,border:`1px solid ${stC[d.status]}30`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Montserrat",fontSize:12,fontWeight:800,color:stC[d.status],flexShrink:0}}>
                {tot>0?`${Math.round(rec/tot*100)}%`:"0%"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description||"—"}</div>
                <div style={{fontSize:11,color:"#8A8378"}}>{sup?.name} · {rec}/{tot} {req?.unit}</div>
              </div>
              <div style={{textAlign:"right",fontSize:11,fontFamily:"Montserrat",fontWeight:700,color:days<0?"#D4745A":days<=3?"#D4745A":days<=7?"#A8863A":"#5AAD7A"}}>{days<0?`${Math.abs(days)}d atraso`:days===0?"Hoy":`${days}d`}</div>
              <span className="chip" style={{background:`${stC[d.status]}12`,color:stC[d.status]}}>● {stL[d.status]}</span>
              <span style={{color:"#C8C2B4",fontSize:14}}>›</span>
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
  const [orderId,setOrderId]=useState(orders[0]?.id||"");
  const [f,setF]=useState({expectedDate:"",logisticsType:"entrega",trackingNumber:"",notes:""});
  const [partials,setPartials]=useState([{qty:"",expectedDate:"",note:""}]);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const order=orders.find(o=>o.id===orderId); const req=reqs.find(r=>r.id===order?.poId);
  const valid=orderId&&f.expectedDate&&partials.every(p=>p.qty&&p.expectedDate);
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div style={{fontFamily:"Montserrat",fontSize:17,fontWeight:800,color:"#2D2D2D"}}>Registrar Plan de Delivery</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">Orden de Compra</label><select className="sel" value={orderId} onChange={e=>setOrderId(e.target.value)}>{orders.map(o=>{const r=reqs.find(r=>r.id===o.poId);return<option key={o.id} value={o.id}>{o.id} · {r?.description?.slice(0,40)||o.id}</option>;})}</select></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><label className="lbl">Fecha esperada *</label><input className="inp" type="date" value={f.expectedDate} onChange={e=>set("expectedDate",e.target.value)} /></div>
            <div><label className="lbl">Logística</label><select className="sel" value={f.logisticsType} onChange={e=>set("logisticsType",e.target.value)}><option value="entrega">🚚 Proveedor entrega</option><option value="recogida">🏭 Nosotros recogemos</option></select></div>
            <div><label className="lbl">N° Guía / tracking</label><input className="inp" value={f.trackingNumber} onChange={e=>set("trackingNumber",e.target.value)} placeholder="Opcional" /></div>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><label className="lbl" style={{margin:0}}>Entregas parciales *</label><button onClick={()=>setPartials(p=>[...p,{qty:"",expectedDate:"",note:""}])} style={{fontSize:11,color:"#C9A84C",fontWeight:700,background:"none",border:"none",cursor:"pointer",fontFamily:"Montserrat"}}>+ Agregar</button></div>
            {partials.map((p,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr auto",gap:8,marginBottom:6,alignItems:"end"}}>
                <div>{i===0&&<label className="lbl">Cantidad *</label>}<input className="inp" type="number" placeholder="0" value={p.qty} onChange={e=>setPartials(ps=>ps.map((x,j)=>j===i?{...x,qty:e.target.value}:x))} /></div>
                <div>{i===0&&<label className="lbl">Fecha *</label>}<input className="inp" type="date" value={p.expectedDate} onChange={e=>setPartials(ps=>ps.map((x,j)=>j===i?{...x,expectedDate:e.target.value}:x))} /></div>
                <div>{i===0&&<label className="lbl">Nota</label>}<input className="inp" placeholder={`Entrega ${i+1}`} value={p.note} onChange={e=>setPartials(ps=>ps.map((x,j)=>j===i?{...x,note:e.target.value}:x))} /></div>
                <button onClick={()=>setPartials(ps=>ps.filter((_,j)=>j!==i))} disabled={partials.length===1} style={{background:"none",border:"none",cursor:"pointer",color:"#D4745A",fontSize:14,opacity:partials.length===1?0.3:1,paddingBottom:i===0?8:0}}>✕</button>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:14,borderTop:"1px solid #E8E4DC"}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
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
  const stC={en_camino:"#4AADA0",parcial:"#A8863A",completado:"#5AAD7A",retrasado:"#D4745A"};
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:700}}>
        <div className="mod-head">
          <div>
            <div style={{display:"flex",gap:8,marginBottom:6}}><span className="bgold">{del.id}</span><span className="bpo">{del.orderId}</span><span className="chip" style={{background:`${stC[del.status]}12`,color:stC[del.status]}}>● {del.status}</span></div>
            <div style={{fontFamily:"Montserrat",fontSize:15,fontWeight:800,color:"#2D2D2D"}}>{req?.description||"—"}</div>
            <div style={{fontSize:11,color:"#8A8378",marginTop:2}}>{sup?.name} · {rec}/{tot} {req?.unit} recibidas</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{height:8,background:"#E8E4DC",borderRadius:4,overflow:"hidden",marginBottom:16}}>
          <div style={{width:`${tot?rec/tot*100:0}%`,height:"100%",background:stC[del.status],borderRadius:4,transition:"width .5s"}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
          {del.partials.map(p=>(
            <div key={p.id}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:p.received?"rgba(90,173,122,.06)":"#F7F5F1",border:`1px solid ${p.received?"rgba(90,173,122,.25)":"#E8E4DC"}`,borderRadius:8}}>
                <div style={{width:24,height:24,borderRadius:6,background:p.received?"#5AAD7A":"#E8E4DC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:p.received?"#FFFFFF":"#8A8378",fontWeight:700,fontFamily:"Montserrat",flexShrink:0}}>{p.received?"✓":p.id}</div>
                <div style={{flex:1}}><div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{p.qty} {req?.unit} · {p.note||new Date(p.expectedDate).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})}</div></div>
                {!p.received&&del.status!=="completado"&&<button className="btn btn-dark btn-sm" onClick={()=>{setRecId(p.id);setRq({qty:String(p.qty),note:""});}}>Confirmar recepción</button>}
                {p.received&&<span style={{fontSize:10,color:"#5AAD7A",fontFamily:"Montserrat",fontWeight:700}}>Recibida {new Date(p.receivedAt).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})}</span>}
              </div>
              {recId===p.id&&(
                <div style={{margin:"4px 0 4px 34px",padding:"10px 14px",background:"rgba(74,173,160,.06)",border:"1px solid rgba(74,173,160,.2)",borderRadius:8}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 2fr auto auto",gap:8,alignItems:"end"}}>
                    <div><label className="lbl">Qty real</label><input className="inp" type="number" value={rq.qty} onChange={e=>setRq(r=>({...r,qty:e.target.value}))} /></div>
                    <div><label className="lbl">Nota</label><input className="inp" value={rq.note} onChange={e=>setRq(r=>({...r,note:e.target.value}))} placeholder="Todo conforme…" /></div>
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
            <div key={i} style={{display:"flex",gap:8,alignItems:"center",fontSize:11,color:"#8A8378",marginBottom:4}}>
              <span style={{fontSize:12}}>{ev.icon}</span><span style={{color:"#5A5550",flex:1}}>{ev.note}</span><span>{new Date(ev.date).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})}</span>
            </div>
          ))}
        </div>
        {del.status!=="completado"&&(!showDelay?<button className="btn btn-ghost btn-sm" onClick={()=>setShowDelay(true)}>⚠️ Reportar retraso del proveedor</button>:(
          <div style={{display:"flex",gap:8}}>
            <input className="inp" placeholder="Motivo del retraso…" value={delayR} onChange={e=>setDelayR(e.target.value)} style={{flex:1}} />
            <button className="btn btn-danger btn-sm" disabled={!delayR} onClick={()=>{onDelay(del.id,delayR);setShowDelay(false);}}>Confirmar</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowDelay(false)}>✕</button>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}><button className="btn btn-ghost" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  );
}
function RCVPage({ ctx }) {
  const {reqs,orders,dels,rcvs,saveRcvs,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyDels=dels.filter(d=>(d.status==="completado"||d.status==="parcial")&&!rcvs.find(r=>r.deliveryId===d.id));
  const handleCreate=async(data)=>{
    const gr={...data,id:genId("GR",rcvs.length+1),createdAt:new Date().toISOString()};
    const updRcvs=[gr,...rcvs];
    const updReqs=reqs.map(r=>r.id===gr.poId?{...r,stage:"PAY",history:[...r.history,{stage:"PAY",date:new Date().toISOString(),note:`GR ${gr.id} emitida. ${gr.result==="conforme"?"Conforme ✅":"No conforme ⚠️"}. Lista para pago.`}]}:r);
    await saveRcvs(updRcvs); await saveReqs(updReqs);
    setShowNew(false); showToast(`${gr.id} emitida`,gr.result==="conforme"?"✅":"⚠️");
  };
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">✅ Verificación de Recepción (GR)</div><div className="ph-sub">Checklist de inspección y nota de recepción</div></div>
        {readyDels.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Nueva GR</button>}
      </div>
      <div className="pb">
        <div className="gold-line" />
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[["Total GRs",rcvs.length,"#9B7DC8"],["Conformes",rcvs.filter(r=>r.result==="conforme").length,"#5AAD7A"],["No Conformes",rcvs.filter(r=>r.result==="no_conforme").length,"#D4745A"]].map(([l,v,c])=>(
            <div key={l} className="stat" style={{"--sc":c}}><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
          ))}
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SectionHeader title="Notas de Recepción" action={readyDels.length>0&&<span style={{fontSize:11,color:"#9B7DC8",fontFamily:"Montserrat",fontWeight:700}}>{readyDels.length} entrega{readyDels.length>1?"s":""} lista{readyDels.length>1?"s":""} para verificar</span>} />
          {rcvs.length===0?<Empty icon="✅" msg="Sin notas de recepción" sub={readyDels.length>0?"Verifica las entregas pendientes":"Completa un delivery primero"} />:
          rcvs.map(gr=>{
            const req=reqs.find(r=>r.id===gr.poId); const sup=sups.find(s=>s.id===gr.supplierId); const isOk=gr.result==="conforme";
            return(<div key={gr.id} className="trow" onClick={()=>setSelected(gr)}>
              <div style={{width:36,height:36,borderRadius:8,background:isOk?"rgba(90,173,122,.1)":"rgba(212,116,90,.1)",border:`1px solid ${isOk?"rgba(90,173,122,.3)":"rgba(212,116,90,.3)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{isOk?"✅":"⚠️"}</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}><span className="bgold">{gr.id}</span><span className="bpo" style={{fontSize:10,padding:"2px 8px"}}>{gr.poId}</span></div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description||"—"}</div><div style={{fontSize:11,color:"#8A8378"}}>{sup?.name} · {gr.receivedBy}</div></div>
              <span className="chip" style={{background:isOk?"rgba(90,173,122,.12)":"rgba(212,116,90,.12)",color:isOk?"#5AAD7A":"#D4745A"}}>{isOk?"✓ Conforme":"⚠ No Conforme"}</span>
              <span style={{color:"#C8C2B4",fontSize:14}}>›</span>
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
  const [delId,setDelId]=useState(deliveries[0]?.id||"");
  const [checks,setChecks]=useState({});
  const [f,setF]=useState({receivedBy:"",receivedQty:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const del=deliveries.find(d=>d.id===delId); const req=reqs.find(r=>r.id===del?.poId);
  const toggle=(id,val)=>setChecks(c=>({...c,[id]:c[id]===val?null:val}));
  const allChecked=CHECKLIST_ITEMS.every(i=>checks[i.id]!==undefined&&checks[i.id]!==null);
  const anyFailed=CHECKLIST_ITEMS.some(i=>checks[i.id]===false);
  const result=anyFailed?"no_conforme":"conforme";
  const valid=allChecked&&f.receivedBy&&f.receivedQty;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div><div style={{fontFamily:"Montserrat",fontSize:17,fontWeight:800,color:"#2D2D2D"}}>Nueva Nota de Recepción (GR)</div><div style={{fontSize:11,color:"#8A8378",marginTop:2}}>Verificación contra Orden de Compra</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">Delivery a verificar</label><select className="sel" value={delId} onChange={e=>setDelId(e.target.value)}>{deliveries.map(d=>{const r=reqs.find(r=>r.id===d.poId);return<option key={d.id} value={d.id}>{d.id} · {r?.description?.slice(0,42)||d.id}</option>;})}</select></div>
          <div>
            <label className="lbl">Checklist de verificación</label>
            {CHECKLIST_ITEMS.map(item=>{
              const val=checks[item.id];
              return(<div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:8,border:`1.5px solid ${val===true?"rgba(90,173,122,.35)":val===false?"rgba(212,116,90,.35)":"#E8E4DC"}`,background:val===true?"rgba(90,173,122,.05)":val===false?"rgba(212,116,90,.05)":"#F7F5F1",marginBottom:5}}>
                <span style={{flex:1,fontSize:12,color:"#2D2D2D",fontWeight:500}}>{item.label}</span>
                <button onClick={()=>toggle(item.id,true)} style={{width:30,height:30,borderRadius:6,border:`1.5px solid ${val===true?"#5AAD7A":"#E8E4DC"}`,background:val===true?"#5AAD7A":"#FFFFFF",color:val===true?"#FFFFFF":"#8A8378",cursor:"pointer",fontSize:14,fontWeight:700,transition:"all .15s"}}>✓</button>
                <button onClick={()=>toggle(item.id,false)} style={{width:30,height:30,borderRadius:6,border:`1.5px solid ${val===false?"#D4745A":"#E8E4DC"}`,background:val===false?"#D4745A":"#FFFFFF",color:val===false?"#FFFFFF":"#8A8378",cursor:"pointer",fontSize:14,fontWeight:700,transition:"all .15s"}}>✕</button>
              </div>);
            })}
            {allChecked&&<div style={{padding:"10px 14px",borderRadius:8,background:result==="conforme"?"rgba(90,173,122,.08)":"rgba(212,116,90,.08)",border:`1px solid ${result==="conforme"?"rgba(90,173,122,.25)":"rgba(212,116,90,.25)"}`,fontSize:12,color:result==="conforme"?"#5AAD7A":"#D4745A",fontFamily:"Montserrat",fontWeight:700,marginTop:6}}>
              {result==="conforme"?"✅ CONFORME — La GR procederá al módulo de Pago":"⚠️ NO CONFORME — Las discrepancias quedarán registradas"}
            </div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label className="lbl">Recibido por *</label><input className="inp" value={f.receivedBy} onChange={e=>set("receivedBy",e.target.value)} placeholder="Nombre del receptor" /></div>
            <div><label className="lbl">Cantidad real recibida *</label><input className="inp" type="number" value={f.receivedQty} onChange={e=>set("receivedQty",e.target.value)} placeholder={req?.quantity} /></div>
          </div>
          <div><label className="lbl">Observaciones generales</label><textarea className="ta" value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Condiciones de entrega, empaque, temperatura, etc." /></div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:14,borderTop:"1px solid #E8E4DC"}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:0.45}} onClick={()=>onSubmit({deliveryId:delId,orderId:del?.orderId,poId:del?.poId,supplierId:del?.supplierId,checklist:checks,result,...f})}>Emitir Nota de Recepción →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GRDetail({ gr, reqs, sups, onClose }) {
  const req=reqs.find(r=>r.id===gr.poId); const sup=sups.find(s=>s.id===gr.supplierId); const isOk=gr.result==="conforme";
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:640}}>
        <div className="mod-head">
          <div><div style={{display:"flex",gap:8,marginBottom:6}}><span className="bgold">{gr.id}</span><span className="bpo">{gr.poId}</span><span className="chip" style={{background:isOk?"rgba(90,173,122,.12)":"rgba(212,116,90,.12)",color:isOk?"#5AAD7A":"#D4745A"}}>{isOk?"✓ Conforme":"⚠ No Conforme"}</span></div>
            <div style={{fontFamily:"Montserrat",fontSize:15,fontWeight:800,color:"#2D2D2D"}}>{req?.description||"—"}</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {CHECKLIST_ITEMS.map(item=>{const val=gr.checklist?.[item.id];return(<div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:val===true?"rgba(90,173,122,.05)":"rgba(212,116,90,.05)",border:`1px solid ${val===true?"rgba(90,173,122,.2)":"rgba(212,116,90,.2)"}`,borderRadius:8,marginBottom:5}}><span style={{fontSize:14}}>{val===true?"✅":"❌"}</span><span style={{fontSize:12,color:"#2D2D2D",fontWeight:500}}>{item.label}</span></div>);})}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14}}>
          {[["Recibido por",gr.receivedBy],["Cantidad recibida",`${gr.receivedQty} ${req?.unit}`],["Proveedor",sup?.name],["Observaciones",gr.notes||"—"]].map(([k,v])=>(
            <div key={k} style={{background:"#F7F5F1",borderRadius:8,padding:"10px 14px",border:"1px solid #E8E4DC"}}>
              <div style={{fontSize:9,color:"#8A8378",fontFamily:"Montserrat",fontWeight:700,letterSpacing:.5,marginBottom:3}}>{k.toUpperCase()}</div>
              <div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}><button className="btn btn-ghost" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  );
}
function PAYPage({ ctx }) {
  const {reqs,orders,rcvs,pays,savePays,saveReqs,sups,showToast}=ctx;
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const readyRcvs=rcvs.filter(r=>!pays.find(p=>p.grId===r.id));
  const handleCreate=async(data)=>{
    const p={...data,id:genId("PAY",pays.length+1),createdAt:new Date().toISOString(),status:"listo"};
    await savePays([p,...pays]);
    setShowNew(false); showToast(`${p.id} preparado — enviado a Cuentas por Pagar`);
  };
  const handlePaid=async(payId)=>{
    const updated=pays.map(p=>p.id===payId?{...p,status:"pagado",paidAt:new Date().toISOString()}:p);
    await savePays(updated);
    if(selected?.id===payId)setSelected(updated.find(p=>p.id===payId));
    showToast("¡Proceso completado! 🎉","🎉");
  };
  const totalPagado=pays.filter(p=>p.status==="pagado").reduce((a,p)=>a+parseFloat(p.invoiceAmount||0),0);
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">💳 Preparación de Pago</div><div className="ph-sub">3-Way Match automático · Paquete para Cuentas por Pagar</div></div>
        {readyRcvs.length>0&&<button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Preparar Pago</button>}
      </div>
      <div className="pb">
        <div className="gold-line" />
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[["Listos para pagar",pays.filter(p=>p.status==="listo").length,"#5B9BD5"],["Pagados",pays.filter(p=>p.status==="pagado").length,"#5AAD7A"],["Total pagado",`$${totalPagado.toLocaleString()}`,"#A8863A"]].map(([l,v,c])=>(
            <div key={l} className="stat" style={{"--sc":c}}><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
          ))}
        </div>
        <div className="card" style={{overflow:"hidden"}}>
          <SectionHeader title="Paquetes de Pago" action={readyRcvs.length>0&&<span style={{fontSize:11,color:"#5AAD7A",fontFamily:"Montserrat",fontWeight:700}}>{readyRcvs.length} GR lista{readyRcvs.length>1?"s":""} para procesar</span>} />
          {pays.length===0?<Empty icon="💳" msg="Sin paquetes de pago" sub={readyRcvs.length>0?"Prepara el primer pago":"Emite una Nota de Recepción primero"} />:
          pays.map(p=>{
            const req=reqs.find(r=>r.id===p.poId); const sup=sups.find(s=>s.id===p.supplierId); const isPaid=p.status==="pagado";
            return(<div key={p.id} className="trow" onClick={()=>setSelected(p)}>
              <div style={{display:"flex",flexDirection:"column",gap:3}}><span style={{fontFamily:"Montserrat",fontSize:11,fontWeight:700,color:"#5AAD7A"}}>{p.id}</span><span className="bpo" style={{fontSize:10,padding:"2px 8px"}}>{p.poId}</span></div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,color:"#2D2D2D",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{req?.description||"—"}</div><div style={{fontSize:11,color:"#8A8378"}}>{sup?.name} · Fac: {p.invoiceNumber} · ${parseFloat(p.invoiceAmount||0).toLocaleString()}</div></div>
              <span className="chip" style={{background:p.matchResult?"rgba(90,173,122,.12)":"rgba(201,168,76,.1)",color:p.matchResult?"#5AAD7A":"#A8863A"}}>{p.matchResult?"✅ Match OK":"⚠️ Dif."}</span>
              <span className="chip" style={{background:isPaid?"rgba(90,173,122,.12)":"rgba(91,155,213,.12)",color:isPaid?"#5AAD7A":"#5B9BD5"}}>{isPaid?"✓ Pagado":"📤 Listo"}</span>
              <span style={{color:"#C8C2B4",fontSize:14}}>›</span>
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
  const [grId,setGrId]=useState(rcvs[0]?.id||"");
  const [f,setF]=useState({invoiceNumber:"",invoiceAmount:"",invoiceDate:"",paymentMethod:PAY_METHODS[0],dueDate:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const gr=rcvs.find(r=>r.id===grId); const order=orders.find(o=>o.id===gr?.orderId); const req=reqs.find(r=>r.id===gr?.poId); const sup=sups.find(s=>s.id===gr?.supplierId);
  const poAmt=parseFloat(order?.totalAmount||0); const inv=parseFloat(f.invoiceAmount||0);
  const grQty=parseFloat(gr?.receivedQty||0); const poQty=parseFloat(req?.quantity||0);
  const qtyOk=poQty>0?Math.abs(grQty-poQty)/poQty<=0.05:false;
  const priceOk=poAmt>0&&inv>0?Math.abs(inv-poAmt)/poAmt<=0.02:false;
  const grOk=gr?.result==="conforme";
  const matchOk=qtyOk&&priceOk&&grOk;
  const valid=grId&&f.invoiceNumber&&f.invoiceAmount&&f.invoiceDate;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su">
        <div className="mod-head"><div><div style={{fontFamily:"Montserrat",fontSize:17,fontWeight:800,color:"#2D2D2D"}}>Preparar Paquete de Pago</div><div style={{fontSize:11,color:"#8A8378",marginTop:2}}>3-Way Match: OC + GR + Factura</div></div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label className="lbl">Nota de Recepción (GR)</label><select className="sel" value={grId} onChange={e=>setGrId(e.target.value)}>{rcvs.map(r=>{const req=reqs.find(req=>req.id===r.poId);return<option key={r.id} value={r.id}>{r.id} · {req?.description?.slice(0,42)||r.id}</option>;})}</select></div>
          {gr&&<div style={{background:"rgba(201,168,76,0.10)",border:"1px solid rgba(201,168,76,0.28)",borderRadius:8,padding:"12px 16px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[["Proveedor",sup?.name],["Monto OC",`$${poAmt.toLocaleString()}`],["GR",gr.result==="conforme"?"✅ Conforme":"⚠️ No conforme"]].map(([k,v])=><div key={k}><div style={{fontSize:9,color:"#A8863A",fontFamily:"Montserrat",fontWeight:700,marginBottom:2}}>{k.toUpperCase()}</div><div style={{fontSize:12,color:"#2D2D2D",fontWeight:700}}>{v}</div></div>)}
            </div>
          </div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label className="lbl">N° Factura del proveedor *</label><input className="inp" value={f.invoiceNumber} onChange={e=>set("invoiceNumber",e.target.value)} placeholder="FAC-2026-XXXX" /></div>
            <div><label className="lbl">Monto de la factura *</label><input className="inp" type="number" value={f.invoiceAmount} onChange={e=>set("invoiceAmount",e.target.value)} /></div>
            <div><label className="lbl">Fecha de factura *</label><input className="inp" type="date" value={f.invoiceDate} onChange={e=>set("invoiceDate",e.target.value)} /></div>
            <div><label className="lbl">Fecha límite de pago</label><input className="inp" type="date" value={f.dueDate} onChange={e=>set("dueDate",e.target.value)} /></div>
            <div><label className="lbl">Método de pago</label><select className="sel" value={f.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)}>{PAY_METHODS.map(m=><option key={m}>{m}</option>)}</select></div>
            <div><label className="lbl">Notas para CxP</label><input className="inp" value={f.notes} onChange={e=>set("notes",e.target.value)} /></div>
          </div>
          {f.invoiceAmount&&(
            <div style={{padding:"14px 16px",background:matchOk?"rgba(90,173,122,.06)":"rgba(201,168,76,.06)",border:`1px solid ${matchOk?"rgba(90,173,122,.25)":"rgba(201,168,76,.28)"}`,borderRadius:10}}>
              <div style={{fontFamily:"Montserrat",fontSize:13,fontWeight:800,color:matchOk?"#5AAD7A":"#A8863A",marginBottom:8}}>{matchOk?"✅ 3-Way Match aprobado":"⚠️ Match con diferencias — se documenta para CxP"}</div>
              <div style={{display:"flex",gap:10}}>
                {[["Cantidades",qtyOk,"±5% tolerancia"],["Montos",priceOk,"±2% tolerancia"],["GR Conforme",grOk,""]].map(([l,ok,sub])=>(
                  <div key={l} style={{flex:1,padding:"8px 10px",background:ok?"rgba(90,173,122,.08)":"rgba(212,116,90,.08)",border:`1px solid ${ok?"rgba(90,173,122,.2)":"rgba(212,116,90,.2)"}`,borderRadius:7,textAlign:"center"}}>
                    <div style={{fontSize:14,marginBottom:3}}>{ok?"✅":"❌"}</div>
                    <div style={{fontSize:10,color:ok?"#5AAD7A":"#D4745A",fontFamily:"Montserrat",fontWeight:700}}>{l}</div>
                    {sub&&<div style={{fontSize:9,color:"#8A8378",marginTop:1}}>{sub}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:14,borderTop:"1px solid #E8E4DC"}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-gold" disabled={!valid} style={{opacity:valid?1:0.45}} onClick={()=>onSubmit({grId,orderId:gr?.orderId,poId:gr?.poId,supplierId:gr?.supplierId,matchResult:matchOk,matchDetails:{qtyOk,priceOk,grOk},...f})}>Enviar a Cuentas por Pagar →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PAYDetail({ pay, reqs, sups, orders, rcvs, onClose, onPaid }) {
  const req=reqs.find(r=>r.id===pay.poId); const sup=sups.find(s=>s.id===pay.supplierId); const isPaid=pay.status==="pagado";
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod su" style={{maxWidth:640}}>
        <div className="mod-head">
          <div><div style={{display:"flex",gap:8,marginBottom:6}}><span style={{fontFamily:"Montserrat",fontSize:11,fontWeight:700,color:"#5AAD7A"}}>{pay.id}</span><span className="bpo">{pay.poId}</span><span className="chip" style={{background:pay.matchResult?"rgba(90,173,122,.12)":"rgba(201,168,76,.1)",color:pay.matchResult?"#5AAD7A":"#A8863A"}}>{pay.matchResult?"✅ Match OK":"⚠️ Dif."}</span></div>
            <div style={{fontFamily:"Montserrat",fontSize:15,fontWeight:800,color:"#2D2D2D"}}>{req?.description||"—"}</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card" style={{padding:"14px 16px",marginBottom:14}}><ProgressBar stage="PAY" /></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[["Proveedor",sup?.name],["N° Factura",pay.invoiceNumber],["Monto a pagar",`$${parseFloat(pay.invoiceAmount||0).toLocaleString()}`],["Método de pago",pay.paymentMethod],["Vencimiento",pay.dueDate||"—"],["Notas CxP",pay.notes||"—"]].map(([k,v])=>(
            <div key={k} style={{background:"#F7F5F1",borderRadius:8,padding:"10px 14px",border:"1px solid #E8E4DC"}}>
              <div style={{fontSize:9,color:"#8A8378",fontFamily:"Montserrat",fontWeight:700,letterSpacing:.5,marginBottom:3}}>{k.toUpperCase()}</div>
              <div style={{fontSize:12,color:"#2D2D2D",fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
        {!isPaid?(
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <button className="btn btn-gold" onClick={()=>onPaid(pay.id)}>💳 Marcar como pagado — Proceso completo →</button>
          </div>
        ):(
          <div style={{textAlign:"center",padding:"24px",background:"rgba(90,173,122,.06)",border:"1px solid rgba(90,173,122,.2)",borderRadius:12}}>
            <div style={{fontSize:32,marginBottom:8}}>🎉</div>
            <div style={{fontFamily:"Montserrat",fontSize:16,fontWeight:800,color:"#5AAD7A"}}>¡Proceso completo!</div>
            <div style={{fontSize:12,color:"#8A8378",marginTop:4}}>Pagado el {new Date(pay.paidAt).toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"})}</div>
            <div style={{marginTop:10,fontSize:11,color:"#A8863A",fontFamily:"Montserrat",fontWeight:700}}>748 Development — People who build</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Tracker({ ctx }) {
  const {reqs,sups}=ctx;
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [filterType,setFilterType]=useState("all");
  const filtered=reqs.filter(r=>{
    const ms=r.description?.toLowerCase().includes(search.toLowerCase())||r.id?.toLowerCase().includes(search.toLowerCase());
    const mf=filter==="all"||r.stage===filter;
    const mt=filterType==="all"||r.reqType===filterType;
    return ms&&mf&&mt;
  });
  return(
    <div className="fi">
      <div className="ph">
        <div><div className="ph-title">🔍 Tracker Global de POs</div><div className="ph-sub">Sigue cualquier solicitud de principio a fin</div></div>
        <div style={{display:"flex",gap:10}}>
          <input className="inp" style={{width:220}} placeholder="Buscar PO o descripción…" value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="sel" style={{width:150}} value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="all">Todos los tipos</option>
            <option value="field">🏗️ Campo</option>
            <option value="estimation">📊 Estimación</option>
          </select>
          <select className="sel" style={{width:160}} value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">Todas las etapas</option>
            {STAGES.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
          </select>
        </div>
      </div>
      <div className="pb">
        <div className="gold-line" />
        {filtered.length===0?<Empty icon="🔍" msg="Sin resultados" sub="Prueba con otro filtro o término de búsqueda" />:
        filtered.map(r=>{
          const s=STAGES.find(s=>s.id===r.stage); const p=PRIORITY[r.priority]||PRIORITY.normal;
          return(
            <div key={r.id} className="card" style={{marginBottom:12,padding:"16px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <span className="bpo">{r.id}</span>
                <span className={r.reqType==="field"?"bfield":"bestim"}>{r.reqType==="field"?"🏗️ Campo":"📊 Estimación"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:"#2D2D2D",fontWeight:700,fontFamily:"Montserrat"}}>{r.description}</div>
                  <div style={{fontSize:11,color:"#8A8378",marginTop:1}}>{r.quantity} {r.unit} · {new Date(r.createdAt).toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"})}</div>
                </div>
                <span className="chip" style={{background:p.bg,color:p.color}}>{p.dot} {p.label}</span>
                <span className="chip" style={{background:`${s.color}12`,color:s.color}}>● {s.label}</span>
              </div>
              <ProgressBar stage={r.stage} />
              {r.history?.length>0&&(
                <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid #E8E4DC"}}>
                  <div style={{display:"flex",gap:16,overflowX:"auto",paddingBottom:2}}>
                    {r.history.map((h,i)=>{
                      const hs=STAGES.find(s=>s.id===h.stage);
                      return(<div key={i} style={{flexShrink:0,fontSize:11,display:"flex",alignItems:"center",gap:5,color:"#8A8378"}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:hs?.color||"#8A8378",flexShrink:0}}/>
                        <span style={{color:"#5A5550"}}>{h.note.slice(0,40)}</span>
                        <span style={{color:"#C8C2B4"}}>·</span>
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
