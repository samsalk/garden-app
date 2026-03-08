import { useState, useEffect, useRef, useCallback } from "react";

// ─── PLANT LIBRARY ─────────────────────────────────────────────────────────
const PLANTS = [
  { id:"tomato",     name:"Tomato",           type:"vegetable", emoji:"🍅", color:"#c94a3a", dth:75,  spacing:"1/sqft",   notes:"Needs staking", defaultSpan:[1,1] },
  { id:"pepper",     name:"Pepper",           type:"vegetable", emoji:"🫑", color:"#d97030", dth:70,  spacing:"1/sqft",   defaultSpan:[1,1] },
  { id:"zucchini",   name:"Zucchini",         type:"vegetable", emoji:"🥒", color:"#4a8c3c", dth:55,  spacing:"1/4sqft",  notes:"Needs room to sprawl", defaultSpan:[2,2] },
  { id:"cucumber",   name:"Cucumber",         type:"vegetable", emoji:"🥒", color:"#3a7a58", dth:60,  spacing:"2/sqft",   defaultSpan:[1,1] },
  { id:"lettuce",    name:"Lettuce",          type:"vegetable", emoji:"🥬", color:"#6aaa40", dth:45,  spacing:"4/sqft",   defaultSpan:[1,1] },
  { id:"spinach",    name:"Spinach",          type:"vegetable", emoji:"🌿", color:"#3a7a3a", dth:40,  spacing:"9/sqft",   defaultSpan:[1,1] },
  { id:"kale",       name:"Kale",             type:"vegetable", emoji:"🥦", color:"#2a6030", dth:55,  spacing:"1/sqft",   defaultSpan:[1,1] },
  { id:"carrot",     name:"Carrot",           type:"vegetable", emoji:"🥕", color:"#e08a30", dth:70,  spacing:"16/sqft",  defaultSpan:[1,1] },
  { id:"radish",     name:"Radish",           type:"vegetable", emoji:"🌰", color:"#c84060", dth:25,  spacing:"16/sqft",  defaultSpan:[1,1] },
  { id:"bean",       name:"Green Bean",       type:"vegetable", emoji:"🫘", color:"#5a9a40", dth:55,  spacing:"9/sqft",   defaultSpan:[1,1] },
  { id:"pea",        name:"Pea",              type:"vegetable", emoji:"🫛", color:"#7aaa50", dth:65,  spacing:"8/sqft",   defaultSpan:[1,1] },
  { id:"broccoli",   name:"Broccoli",         type:"vegetable", emoji:"🥦", color:"#3a5830", dth:80,  spacing:"1/sqft",   defaultSpan:[1,1] },
  { id:"onion",      name:"Onion",            type:"vegetable", emoji:"🧅", color:"#c49030", dth:100, spacing:"4/sqft",   defaultSpan:[1,1] },
  { id:"garlic",     name:"Garlic",           type:"vegetable", emoji:"🧄", color:"#c4b060", dth:240, spacing:"4/sqft",   defaultSpan:[1,1] },
  { id:"eggplant",   name:"Eggplant",         type:"vegetable", emoji:"🍆", color:"#7040a0", dth:80,  spacing:"1/sqft",   defaultSpan:[1,1] },
  { id:"corn",       name:"Corn",             type:"vegetable", emoji:"🌽", color:"#d8b030", dth:80,  spacing:"1/sqft",   notes:"Plant in blocks", defaultSpan:[1,1] },
  { id:"bsquash",    name:"Butternut Squash", type:"vegetable", emoji:"🎃", color:"#d08030", dth:110, spacing:"1/4sqft",  notes:"Vines need space", defaultSpan:[2,2] },
  { id:"beet",       name:"Beet",             type:"vegetable", emoji:"🟣", color:"#a03060", dth:55,  spacing:"9/sqft",   defaultSpan:[1,1] },
  { id:"chard",      name:"Swiss Chard",      type:"vegetable", emoji:"🌿", color:"#c04040", dth:50,  spacing:"4/sqft",   defaultSpan:[1,1] },
  { id:"basil",      name:"Basil",            type:"herb",      emoji:"🌿", color:"#4a8c30", dth:30,  spacing:"4/sqft",   defaultSpan:[1,1] },
  { id:"parsley",    name:"Parsley",          type:"herb",      emoji:"🌿", color:"#3a7c30", dth:75,  spacing:"4/sqft",   defaultSpan:[1,1] },
  { id:"cilantro",   name:"Cilantro",         type:"herb",      emoji:"🌿", color:"#5a8c40", dth:50,  spacing:"4/sqft",   notes:"Bolts in heat", defaultSpan:[1,1] },
  { id:"mint",       name:"Mint",             type:"herb",      emoji:"🌿", color:"#3aaa70", dth:60,  spacing:"1/sqft",   notes:"Keep in containers", defaultSpan:[1,1] },
  { id:"rosemary",   name:"Rosemary",         type:"herb",      emoji:"🌿", color:"#5a7040", dth:180, spacing:"1/sqft",   defaultSpan:[1,1] },
  { id:"thyme",      name:"Thyme",            type:"herb",      emoji:"🌿", color:"#6a7a50", dth:90,  spacing:"4/sqft",   defaultSpan:[1,1] },
  { id:"dill",       name:"Dill",             type:"herb",      emoji:"🌿", color:"#8aaa50", dth:70,  spacing:"2/sqft",   defaultSpan:[1,1] },
  { id:"chive",      name:"Chives",           type:"herb",      emoji:"🌿", color:"#6a9a40", dth:60,  spacing:"4/sqft",   defaultSpan:[1,1] },
  { id:"sunflower",  name:"Sunflower",        type:"flower",    emoji:"🌻", color:"#d8b430", dth:80,  spacing:"1/sqft",   defaultSpan:[1,1] },
  { id:"marigold",   name:"Marigold",         type:"flower",    emoji:"🌼", color:"#e08030", dth:50,  spacing:"4/sqft",   notes:"Pest deterrent", defaultSpan:[1,1] },
  { id:"nasturtium", name:"Nasturtium",       type:"flower",    emoji:"🌸", color:"#d05030", dth:55,  spacing:"4/sqft",   notes:"Edible flowers", defaultSpan:[1,1] },
  { id:"zinnia",     name:"Zinnia",           type:"flower",    emoji:"💐", color:"#d04080", dth:60,  spacing:"4/sqft",   defaultSpan:[1,1] },
  { id:"lavender",   name:"Lavender",         type:"flower",    emoji:"💜", color:"#8050b0", dth:90,  spacing:"1/sqft",   defaultSpan:[1,1] },
  { id:"cosmos",     name:"Cosmos",           type:"flower",    emoji:"🌸", color:"#d060a0", dth:60,  spacing:"4/sqft",   defaultSpan:[1,1] },
  { id:"dahlia",     name:"Dahlia",           type:"flower",    emoji:"🌺", color:"#c04050", dth:90,  spacing:"1/sqft",   defaultSpan:[1,1] },
  { id:"borage",     name:"Borage",           type:"flower",    emoji:"🌸", color:"#5060d0", dth:55,  spacing:"1/sqft",   notes:"Attracts pollinators", defaultSpan:[1,1] },
];

const SPAN_PRESETS = [
  { label:"1×1", w:1, h:1 },
  { label:"1×2", w:1, h:2 },
  { label:"2×1", w:2, h:1 },
  { label:"2×2", w:2, h:2 },
  { label:"1×3", w:1, h:3 },
  { label:"3×1", w:3, h:1 },
  { label:"2×4", w:2, h:4 },
  { label:"4×4", w:4, h:4 },
];

const ZONE_TYPES = [
  { id:"raised",    label:"Raised Bed",    icon:"⬜", plantable:true  },
  { id:"inground",  label:"In-Ground",     icon:"🌾", plantable:true  },
  { id:"container", label:"Container/Pot", icon:"🪴", plantable:true  },
  { id:"planter",   label:"Planter Box",   icon:"📦", plantable:true  },
  { id:"path",      label:"Path/Walkway",  icon:"🪨", plantable:false },
];

const ZONE_COLORS = {
  raised:    { bg:"#c4622d22", border:"#c4622d", text:"#8a3a10" },
  inground:  { bg:"#4a8c3022", border:"#4a8c30", text:"#2a5a18" },
  container: { bg:"#3a7a7822", border:"#3a7a78", text:"#1a4a50" },
  planter:   { bg:"#8a6a3022", border:"#8a6a30", text:"#5a3a10" },
  path:      { bg:"#b0a09022", border:"#9a8878", text:"#6a5848" },
};

const STATUSES = [
  { id:"planned",   label:"Planned",   color:"#9a9270" },
  { id:"planted",   label:"Planted",   color:"#4a6a3a" },
  { id:"growing",   label:"Growing",   color:"#2a8a2a" },
  { id:"harvested", label:"Harvested", color:"#8a6820" },
  { id:"failed",    label:"Failed",    color:"#8a3a3a" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const genId    = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const getPlant = (all, id) => all.find(p => p.id === id);
const addDays  = (s, n) => { const d=new Date(s+"T00:00:00"); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
const fmtDate  = s => { if(!s)return""; const d=new Date(s+"T00:00:00"); return `${MONTHS[d.getMonth()]} ${d.getDate()}`; };
const fmtDateFull = s => { if(!s)return""; const d=new Date(s+"T00:00:00"); return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };

function rectsOverlap(a, b) {
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}
function getRect(a, b) {
  if (!a || !b) return null;
  return { x:Math.min(a.c,b.c), y:Math.min(a.r,b.r), w:Math.abs(a.c-b.c)+1, h:Math.abs(a.r-b.r)+1 };
}

// ── Cell helpers ────────────────────────────────────────────────────────────
// Build the set of cells to write when planting a span
function buildSpanCells(startRow, startCol, spanW, spanH, plantData) {
  const primary = `${startRow},${startCol}`;
  const result  = {};
  result[primary] = { ...plantData, spanW, spanH };
  for (let dr=0; dr<spanH; dr++) {
    for (let dc=0; dc<spanW; dc++) {
      if (dr===0 && dc===0) continue;
      result[`${startRow+dr},${startCol+dc}`] = { occupiedBy: primary };
    }
  }
  return result;
}

// Check if a span placement is valid (in-bounds & no overlap with existing plants)
function spanFits(cells, zoneW, zoneH, startRow, startCol, spanW, spanH, ignoreKey=null) {
  if (startCol+spanW > zoneW || startRow+spanH > zoneH) return false;
  for (let dr=0; dr<spanH; dr++) {
    for (let dc=0; dc<spanW; dc++) {
      const k = `${startRow+dr},${startCol+dc}`;
      if (k === ignoreKey) continue;
      const c = cells[k];
      if (c && (c.plantId || c.occupiedBy)) return false;
    }
  }
  return true;
}

// Remove a span given the primary key
function clearSpanCells(cells, primaryKey) {
  const primary = cells[primaryKey];
  if (!primary) return cells;
  const spanW = primary.spanW || 1, spanH = primary.spanH || 1;
  const [r, c] = primaryKey.split(",").map(Number);
  const next = { ...cells };
  for (let dr=0; dr<spanH; dr++) for (let dc=0; dc<spanW; dc++) delete next[`${r+dr},${c+dc}`];
  return next;
}

// Resolve a clicked key to its primary key (if it's an occupied cell)
function resolvePrimary(cells, key) {
  const cell = cells[key];
  if (!cell) return key;
  if (cell.occupiedBy) return cell.occupiedBy;
  return key;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --G:#1c3524;--T:#c4622d;--Tl:#d4824d;
  --C:#f7f0e6;--Cd:#ede5d8;
  --ink:#2a2018;--mut:#6a5a48;--bdr:#d4c8b8;
}
html,body,#root{height:100%;font-family:'DM Sans',sans-serif;background:var(--C);color:var(--ink);}
.app{display:flex;height:100vh;overflow:hidden;}
.sidebar{width:240px;background:var(--G);color:#fff;display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto;}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}

/* SIDEBAR */
.sb-head{padding:1.1rem 1rem .9rem;border-bottom:1px solid rgba(255,255,255,.1);}
.sb-logo{font-family:'Lora',serif;font-size:1.05rem;font-weight:700;display:flex;align-items:center;gap:.45rem;}
.sb-sub{font-size:.63rem;color:rgba(255,255,255,.38);text-transform:uppercase;letter-spacing:.1em;margin-top:2px;}
.sb-sec{padding:.65rem 1rem .2rem;font-size:.62rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.32);}
.sb-row{padding:.5rem 1rem;cursor:pointer;display:flex;align-items:center;gap:.55rem;border-left:3px solid transparent;transition:all .15s;}
.sb-row:hover{background:rgba(255,255,255,.07);}
.sb-row.active{background:rgba(255,255,255,.11);border-left-color:var(--T);}
.sb-name{font-size:.83rem;font-weight:500;color:rgba(255,255,255,.88);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sb-meta{font-size:.65rem;color:rgba(255,255,255,.35);}
.sb-del{opacity:0;font-size:.72rem;color:rgba(255,255,255,.35);background:none;border:none;cursor:pointer;padding:2px 5px;border-radius:3px;}
.sb-row:hover .sb-del{opacity:1;}
.sb-del:hover{background:rgba(255,0,0,.18);color:#faa;}
.sb-add{margin:.85rem 1rem .6rem;padding:.5rem 1rem;background:var(--T);color:#fff;border:none;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:.83rem;font-weight:500;cursor:pointer;}
.sb-add:hover{background:var(--Tl);}
.sb-foot{margin-top:auto;padding:.65rem 1rem;border-top:1px solid rgba(255,255,255,.08);display:flex;gap:.4rem;}
.sb-ftn{flex:1;padding:.38rem;background:rgba(255,255,255,.07);color:rgba(255,255,255,.6);border:none;border-radius:5px;font-size:.7rem;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;}
.sb-ftn:hover{background:rgba(255,255,255,.14);color:#fff;}

/* HEADER */
.hdr{height:52px;background:#fff;border-bottom:1px solid var(--bdr);padding:0 1.1rem;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:.75rem;}
.hdr-title{font-family:'Lora',serif;font-size:.95rem;font-weight:600;display:none;}
.hamburger{display:none;background:none;border:none;font-size:1.3rem;cursor:pointer;color:var(--ink);padding:.25rem .35rem;border-radius:5px;line-height:1;}
.hamburger:hover{background:var(--Cd);}
.nav-tabs{display:flex;gap:2px;background:var(--Cd);border-radius:7px;padding:3px;}
.nav-tab{padding:.3rem .8rem;border-radius:5px;font-size:.8rem;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--mut);font-family:'DM Sans',sans-serif;transition:all .15s;white-space:nowrap;}
.nav-tab.on{background:#fff;color:var(--ink);box-shadow:0 1px 4px rgba(0,0,0,.1);}
.view-toggle{display:flex;gap:2px;background:var(--Cd);border-radius:6px;padding:2px;}
.vt-btn{padding:.28rem .6rem;border-radius:4px;font-size:.75rem;cursor:pointer;border:none;background:transparent;color:var(--mut);font-family:'DM Sans',sans-serif;}
.vt-btn.on{background:#fff;color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.1);}
.content{flex:1;overflow:auto;padding:1.25rem;}

/* BREADCRUMB */
.breadcrumb{display:flex;align-items:center;gap:.4rem;font-size:.78rem;color:var(--mut);margin-bottom:1rem;flex-wrap:wrap;}
.bc-link{cursor:pointer;color:var(--T);font-weight:500;}
.bc-link:hover{text-decoration:underline;}

/* GARDEN OVERVIEW */
.garden-toolbar{display:flex;align-items:center;gap:.75rem;margin-bottom:1rem;flex-wrap:wrap;}
.garden-title{font-family:'Lora',serif;font-size:1.25rem;font-weight:700;}
.garden-sub{font-size:.78rem;color:var(--mut);margin-top:.1rem;}
.draw-hint{background:rgba(196,98,45,.1);border:1px solid rgba(196,98,45,.3);border-radius:6px;padding:.45rem .75rem;font-size:.75rem;color:var(--T);margin-bottom:.75rem;}
.garden-grid-wrap{overflow:auto;-webkit-overflow-scrolling:touch;user-select:none;}
.gcell{flex-shrink:0;border-radius:4px;border:2px solid;position:relative;display:flex;align-items:center;justify-content:center;touch-action:none;}
.gcell.empty{border-color:var(--bdr);background:rgba(0,0,0,.025);}
.gcell.draw-mode{cursor:crosshair;}
.gcell.draw-mode:hover{background:rgba(196,98,45,.07);border-color:rgba(196,98,45,.3);}
.gcell.in-sel{background:rgba(196,98,45,.2)!important;border-color:var(--T)!important;}
.gcell.planted{cursor:pointer;}
.gcell.planted:hover{filter:brightness(1.05);}
.gcell-label{position:absolute;top:2px;left:3px;font-size:.55rem;font-weight:700;line-height:1.2;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100% - 6px);}
.zone-legend{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.1rem;}
.zone-chip{display:flex;align-items:center;gap:.45rem;padding:.38rem .7rem;border-radius:7px;border:1.5px solid;cursor:pointer;transition:box-shadow .15s;}
.zone-chip:hover{box-shadow:0 2px 8px rgba(0,0,0,.1);}
.zone-chip-name{font-size:.82rem;font-weight:600;}
.zone-chip-meta{font-size:.65rem;color:var(--mut);}
.zone-chip-del{margin-left:.15rem;background:none;border:none;font-size:.72rem;cursor:pointer;color:var(--mut);padding:1px 4px;border-radius:3px;}
.zone-chip-del:hover{background:rgba(255,0,0,.1);color:#c00;}

/* PALETTE BAR */
.palette-bar{background:#fff;border:1px solid var(--bdr);border-radius:10px;padding:.55rem .75rem;margin-bottom:.85rem;display:flex;align-items:center;gap:.6rem;}
.pal-label{font-size:.68rem;font-weight:600;color:var(--mut);text-transform:uppercase;letter-spacing:.07em;white-space:nowrap;}
.pal-scroll{display:flex;gap:4px;overflow-x:auto;flex:1;-webkit-overflow-scrolling:touch;padding-bottom:1px;}
.pal-scroll::-webkit-scrollbar{height:3px;}
.pal-scroll::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:2px;}
.pal-chip{display:flex;align-items:center;gap:4px;padding:.22rem .5rem;border-radius:20px;cursor:pointer;border:2px solid transparent;white-space:nowrap;font-size:.73rem;font-weight:500;background:var(--C);color:var(--mut);flex-shrink:0;transition:all .15s;}
.pal-chip:hover{border-color:rgba(0,0,0,.15);}
.pal-chip.ap{border-color:var(--T);background:rgba(196,98,45,.09);color:var(--ink);}
.pal-chip.none{border-style:dashed;border-color:var(--bdr);}
.pal-chip.none.ap{border-color:var(--T);background:rgba(196,98,45,.09);}

/* PLANTING GRID — CSS Grid based for native spanning */
.bed-hdr{margin-bottom:.9rem;display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;flex-wrap:wrap;}
.bed-title{font-family:'Lora',serif;font-size:1.2rem;font-weight:700;display:flex;align-items:center;gap:.5rem;}
.bed-meta{display:flex;align-items:center;gap:.45rem;margin-top:.3rem;flex-wrap:wrap;}
.type-badge{display:inline-flex;align-items:center;gap:.25rem;padding:.18rem .55rem;border-radius:20px;font-size:.68rem;font-weight:600;background:var(--Cd);color:var(--mut);border:1px solid var(--bdr);}
.stat-chips{display:flex;gap:.4rem;flex-wrap:wrap;}
.sch{display:flex;align-items:center;gap:.3rem;padding:.22rem .6rem;border-radius:20px;font-size:.72rem;font-weight:600;border:1px solid var(--bdr);background:#fff;color:var(--mut);}
.plant-grid-outer{overflow:auto;-webkit-overflow-scrolling:touch;user-select:none;}
.pcell{border-radius:5px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;border:2px solid var(--bdr);background:rgba(0,0,0,.03);transition:transform .1s,box-shadow .1s;}
.pcell:hover{transform:scale(1.04);z-index:2;box-shadow:0 3px 12px rgba(0,0,0,.15);}
.pcell.empty{font-size:.72rem;color:var(--bdr);}
.pcell.empty:hover{border-color:var(--T);background:rgba(196,98,45,.07);color:var(--T);}
.pcell.paint-ready.empty:hover{background:rgba(196,98,45,.12);}
.pcell-emoji{font-size:1.4rem;line-height:1;}
.pcell-span-label{font-size:.55rem;font-weight:600;color:rgba(255,255,255,.75);margin-top:2px;line-height:1;}
.pcell-dot{position:absolute;bottom:4px;right:4px;width:7px;height:7px;border-radius:50%;border:1.5px solid rgba(255,255,255,.7);}
.plant-legend{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem;}
.pl-item{display:flex;align-items:center;gap:.3rem;font-size:.7rem;color:var(--mut);}
.pl-dot{width:9px;height:9px;border-radius:2px;flex-shrink:0;}

/* LIST VIEW */
.list-table{width:100%;border-collapse:collapse;font-size:.82rem;}
.list-table th{text-align:left;padding:.5rem .75rem;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--mut);border-bottom:2px solid var(--bdr);white-space:nowrap;}
.list-table td{padding:.6rem .75rem;border-bottom:1px solid var(--Cd);vertical-align:middle;}
.list-table tr:last-child td{border-bottom:none;}
.list-table tr:hover td{background:rgba(0,0,0,.02);}
.lpc{display:flex;align-items:center;gap:.5rem;}
.sp{display:inline-flex;padding:.18rem .55rem;border-radius:20px;font-size:.7rem;font-weight:600;color:#fff;}
.l-btn{padding:.25rem .6rem;background:var(--Cd);border:1px solid var(--bdr);border-radius:5px;font-size:.72rem;cursor:pointer;font-family:'DM Sans',sans-serif;color:var(--mut);}
.l-btn:hover{background:var(--bdr);}
.gl-sec{margin-bottom:1.5rem;}
.gl-sec-head{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--mut);padding:.4rem .75rem;background:var(--Cd);border-radius:6px;margin-bottom:.35rem;}
.mo-grp{margin-bottom:1.25rem;}
.mo-head{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--mut);margin-bottom:.45rem;padding-bottom:.3rem;border-bottom:1px solid var(--bdr);}
.h-card{background:#fff;border-radius:7px;padding:.75rem .9rem;display:flex;align-items:center;gap:.75rem;border:1px solid var(--bdr);margin-bottom:.4rem;}
.h-card:hover{box-shadow:0 2px 10px rgba(0,0,0,.08);}

/* MINI PICKER */
.mini-picker{position:fixed;z-index:600;background:#fff;border:1px solid var(--bdr);border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,.2);padding:.75rem;width:280px;}
.mp-title{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--mut);margin-bottom:.5rem;}
.mp-filters{display:flex;gap:3px;flex-wrap:wrap;margin-bottom:.5rem;}
.mp-filt{padding:.2rem .5rem;border-radius:20px;font-size:.68rem;font-weight:600;cursor:pointer;border:1.5px solid var(--bdr);background:#fff;color:var(--mut);font-family:'DM Sans',sans-serif;}
.mp-filt.on{border-color:var(--T);background:var(--T);color:#fff;}
.mp-search{width:100%;padding:.35rem .6rem;border:1.5px solid var(--bdr);border-radius:5px;font-family:'DM Sans',sans-serif;font-size:.8rem;margin-bottom:.5rem;}
.mp-search:focus{outline:none;border-color:var(--T);}
.mp-plant-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:4px;max-height:150px;overflow-y:auto;}
.mp-plant{padding:.3rem .2rem;border-radius:5px;cursor:pointer;text-align:center;border:2px solid transparent;background:var(--C);}
.mp-plant:hover{border-color:var(--Tl);}
.mp-plant.sel{border-color:var(--T);background:rgba(196,98,45,.09);}
.mp-divider{height:1px;background:var(--bdr);margin:.6rem 0;}
.mp-span-label{font-size:.68rem;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.07em;margin-bottom:.4rem;}
.mp-span-grid{display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.5rem;}
.mp-span-btn{padding:.25rem .55rem;border-radius:5px;font-size:.72rem;font-weight:600;cursor:pointer;border:1.5px solid var(--bdr);background:#fff;color:var(--mut);font-family:'DM Sans',sans-serif;transition:all .12s;}
.mp-span-btn:hover{border-color:var(--Tl);}
.mp-span-btn.sel{border-color:var(--T);background:rgba(196,98,45,.09);color:var(--T);}
.mp-span-custom{display:flex;align-items:center;gap:.35rem;font-size:.72rem;color:var(--mut);}
.mp-span-inp{width:36px;padding:.22rem .35rem;border:1.5px solid var(--bdr);border-radius:4px;font-family:'DM Sans',sans-serif;font-size:.78rem;text-align:center;}
.mp-span-inp:focus{outline:none;border-color:var(--T);}
.mp-warning{font-size:.7rem;color:#b00;margin-top:.35rem;}
.mp-acts{display:flex;gap:.4rem;margin-top:.65rem;}

/* MODALS */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:500;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px);}
.modal{background:#fff;border-radius:16px 16px 0 0;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;padding:1.35rem 1.35rem 2rem;}
.modal-drag{width:36px;height:4px;background:var(--bdr);border-radius:2px;margin:0 auto .7rem;}
.modal-title{font-family:'Lora',serif;font-size:1.1rem;font-weight:700;margin-bottom:1.1rem;}
.field{margin-bottom:.9rem;}
.lbl{display:block;font-size:.68rem;font-weight:600;color:var(--mut);text-transform:uppercase;letter-spacing:.07em;margin-bottom:.3rem;}
.inp{width:100%;padding:.48rem .7rem;border:1.5px solid var(--bdr);border-radius:6px;font-family:'DM Sans',sans-serif;font-size:.875rem;background:#fff;color:var(--ink);}
.inp:focus{outline:none;border-color:var(--T);}
.sel-i{width:100%;padding:.48rem .7rem;border:1.5px solid var(--bdr);border-radius:6px;font-family:'DM Sans',sans-serif;font-size:.875rem;background:#fff;color:var(--ink);cursor:pointer;}
.sel-i:focus{outline:none;border-color:var(--T);}
.ta{width:100%;padding:.48rem .7rem;border:1.5px solid var(--bdr);border-radius:6px;font-family:'DM Sans',sans-serif;font-size:.875rem;background:#fff;color:var(--ink);resize:vertical;min-height:65px;}
.ta:focus{outline:none;border-color:var(--T);}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;}
.row4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:.7rem;}
.st-row{display:flex;flex-wrap:wrap;gap:.35rem;}
.st-btn{padding:.3rem .65rem;border-radius:20px;font-size:.75rem;font-weight:600;cursor:pointer;border:2px solid transparent;font-family:'DM Sans',sans-serif;}
.pib{background:var(--C);border-radius:7px;padding:.55rem .75rem;font-size:.76rem;color:var(--mut);border:1px solid var(--bdr);margin-bottom:.85rem;line-height:1.65;}
.m-acts{display:flex;gap:.5rem;margin-top:1.25rem;flex-wrap:wrap;}
.btn-p{padding:.5rem 1rem;background:var(--T);color:#fff;border:none;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:600;cursor:pointer;}
.btn-p:hover{background:var(--Tl);}
.btn-p:disabled{opacity:.45;cursor:default;}
.btn-s{padding:.5rem 1rem;background:var(--Cd);color:var(--ink);border:1.5px solid var(--bdr);border-radius:6px;font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:500;cursor:pointer;}
.btn-d{padding:.5rem 1rem;background:#fff4f4;color:#b00;border:1.5px solid #fcc;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:500;cursor:pointer;}
.prev-box{background:var(--C);border-radius:6px;padding:.55rem .75rem;font-size:.78rem;color:var(--mut);border:1px solid var(--bdr);margin-bottom:.75rem;}
.hint-box{background:rgba(196,98,45,.08);border:1px solid rgba(196,98,45,.25);border-radius:6px;padding:.45rem .75rem;font-size:.75rem;color:var(--T);margin-bottom:.75rem;}
.empty-state{text-align:center;padding:3.5rem 1.5rem;}
.es-icon{font-size:3.5rem;margin-bottom:.9rem;}
.es-title{font-family:'Lora',serif;font-size:1.35rem;font-weight:700;margin-bottom:.45rem;}
.es-text{color:var(--mut);margin-bottom:1.4rem;max-width:280px;margin-left:auto;margin-right:auto;line-height:1.65;font-size:.88rem;}

@media(max-width:767px){
  .sidebar{display:none;}
  .hdr-title{display:block;}
  .hamburger{display:block;}
  .content{padding:.9rem;}
  .row2,.row4{grid-template-columns:1fr 1fr;}
  .list-table th:nth-child(4),.list-table td:nth-child(4),
  .list-table th:nth-child(5),.list-table td:nth-child(5){display:none;}
}
@media(min-width:640px){
  .overlay{align-items:center;}
  .modal{border-radius:12px;}
}
.mob-sb-wrap{position:fixed;inset:0;z-index:999;display:flex;}
.mob-sb-bg{flex:1;background:rgba(0,0,0,.5);}
.mob-sb-panel{width:240px;background:var(--G);display:flex;flex-direction:column;overflow-y:auto;animation:sbIn .2s ease;}
@keyframes sbIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
`;

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ gardens, activeId, onSelect, onAdd, onDelete, onExport, onImport }) {
  const fi = useRef();
  return (
    <div className="sidebar">
      <div className="sb-head">
        <div className="sb-logo">🌱 Garden Planner</div>
        <div className="sb-sub">Square Foot Method</div>
      </div>
      <div className="sb-sec">My Gardens</div>
      <div style={{ flex:1 }}>
        {gardens.length===0 && <div style={{ padding:"1rem", fontSize:".78rem", color:"rgba(255,255,255,.3)", lineHeight:1.65 }}>No gardens yet.</div>}
        {gardens.map(g => (
          <div key={g.id} className={`sb-row ${g.id===activeId?"active":""}`} onClick={()=>onSelect(g.id)}>
            <span style={{ fontSize:".9rem" }}>🌿</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="sb-name">{g.name}</div>
              <div className="sb-meta">{g.w}×{g.h} ft · {g.zones.length} zone{g.zones.length!==1?"s":""}</div>
            </div>
            <button className="sb-del" onClick={e=>{ e.stopPropagation(); if(confirm(`Delete "${g.name}"?`)) onDelete(g.id); }}>✕</button>
          </div>
        ))}
      </div>
      <button className="sb-add" onClick={onAdd}>+ New Garden</button>
      <div className="sb-foot">
        <button className="sb-ftn" onClick={onExport}>⬇ Export</button>
        <button className="sb-ftn" onClick={()=>fi.current.click()}>⬆ Import</button>
        <input ref={fi} type="file" accept=".json" style={{ display:"none" }} onChange={onImport} />
      </div>
    </div>
  );
}

// ─── GARDEN OVERVIEW ──────────────────────────────────────────────────────────
function GardenOverview({ garden, onSelectZone, onAddZone, onDeleteZone }) {
  const GC=48, GAP=2;
  const [drawMode,    setDrawMode]    = useState(false);
  const [dragStart,   setDragStart]   = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  const [pendingRect, setPendingRect] = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const dragging = useRef(false);
  const selRect  = getRect(dragStart, dragCurrent);

  function cellInRect(r, c, rect) { return rect && c>=rect.x && c<rect.x+rect.w && r>=rect.y && r<rect.y+rect.h; }
  function getZoneAt(r, c) { return garden.zones.find(z=>c>=z.x&&c<z.x+z.w&&r>=z.y&&r<z.y+z.h); }

  useEffect(() => {
    const up = () => { dragging.current = false; };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  const totalPlanted = garden.zones.reduce((s,z)=>s+Object.values(z.cells||{}).filter(c=>c.plantId).length, 0);

  return (
    <div>
      <div className="garden-toolbar">
        <div style={{ flex:1 }}>
          <div className="garden-title">{garden.name}</div>
          <div className="garden-sub">{garden.w}×{garden.h} ft · {garden.zones.length} zone{garden.zones.length!==1?"s":""} · {totalPlanted} planted</div>
        </div>
        <button className="btn-s" style={drawMode?{borderColor:"var(--T)",color:"var(--T)",background:"rgba(196,98,45,.08)"}:{}} onClick={()=>{setDrawMode(d=>!d);setDragStart(null);setDragCurrent(null);}}>
          {drawMode?"✕ Cancel":"✏️ Draw Zone"}
        </button>
        <button className="btn-s" onClick={()=>setShowForm(true)}>＋ Add Zone</button>
      </div>
      {drawMode && <div className="draw-hint">Drag on the grid to draw a zone · release to name it</div>}

      <div className="garden-grid-wrap">
        <div style={{ display:"flex", marginBottom:2 }}>
          <div style={{ width:24 }} />
          {Array.from({length:garden.w},(_,c)=>(
            <div key={c} style={{ width:GC, marginRight:c<garden.w-1?GAP:0, fontSize:".6rem", color:"var(--mut)", textAlign:"center", fontWeight:600 }}>{c+1}</div>
          ))}
        </div>
        {Array.from({length:garden.h},(_,r)=>(
          <div key={r} style={{ display:"flex", marginBottom:r<garden.h-1?GAP:0 }}>
            <div style={{ width:24, fontSize:".6rem", color:"var(--mut)", fontWeight:600, textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center" }}>{r+1}</div>
            {Array.from({length:garden.w},(_,c)=>{
              const zone=getZoneAt(r,c), zc=zone?ZONE_COLORS[zone.type]||ZONE_COLORS.raised:null;
              const inSel=drawMode&&selRect&&cellInRect(r,c,selRect);
              const isCorner=zone&&zone.x===c&&zone.y===r;
              const localKey=zone?`${r-zone.y},${c-zone.x}`:null;
              const cell=zone&&localKey?(zone.cells||{})[localKey]:null;
              const occupiedBy = cell?.occupiedBy;
              const primaryCell = occupiedBy && zone ? (zone.cells||{})[occupiedBy] : null;
              const plant = primaryCell?.plantId ? getPlant(PLANTS, primaryCell.plantId) : (cell?.plantId ? getPlant(PLANTS, cell.plantId) : null);
              return (
                <div key={c} className={`gcell ${zone?"planted":"empty"} ${drawMode&&!zone?"draw-mode":""} ${inSel?"in-sel":""}`}
                  style={{ width:GC, height:GC, marginRight:c<garden.w-1?GAP:0, borderColor:inSel?"var(--T)":zone?zc.border:"var(--bdr)", background:inSel?"rgba(196,98,45,.2)":zone?zc.bg:undefined }}
                  onMouseDown={e=>{ if(!drawMode||zone)return; e.preventDefault(); dragging.current=true; setDragStart({r,c}); setDragCurrent({r,c}); }}
                  onMouseEnter={()=>{ if(!drawMode||!dragging.current)return; setDragCurrent({r,c}); }}
                  onMouseUp={()=>{ if(!drawMode||!dragging.current)return; dragging.current=false; const rect=getRect(dragStart,{r,c}); if(rect){const overlap=garden.zones.some(z=>rectsOverlap(rect,z)); overlap?alert("Overlaps existing zone."):setPendingRect(rect);} setDragStart(null);setDragCurrent(null); }}
                  onClick={()=>{ if(drawMode)return; if(zone&&ZONE_TYPES.find(t=>t.id===zone.type)?.plantable)onSelectZone(zone.id); }}
                  data-gr={`${r},${c}`} title={zone?zone.name:drawMode?"Drag to draw":""}
                >
                  {isCorner&&!plant&&<div className="gcell-label" style={{color:zc.text}}>{ZONE_TYPES.find(t=>t.id===zone.type)?.icon} {zone.name}</div>}
                  {plant&&!occupiedBy&&<span style={{fontSize:"1rem"}}>{plant.emoji}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {garden.zones.length>0&&(
        <div>
          <div style={{fontSize:".68rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:"var(--mut)",margin:"1.25rem 0 .5rem"}}>Zones — click to open</div>
          <div className="zone-legend">
            {garden.zones.map(zone=>{
              const zc=ZONE_COLORS[zone.type]||ZONE_COLORS.raised, bt=ZONE_TYPES.find(t=>t.id===zone.type);
              const planted=Object.values(zone.cells||{}).filter(c=>c.plantId).length;
              return (
                <div key={zone.id} className="zone-chip" style={{borderColor:zc.border,background:zc.bg,cursor:bt?.plantable?"pointer":"default"}} onClick={()=>bt?.plantable&&onSelectZone(zone.id)}>
                  <span>{bt?.icon}</span>
                  <div>
                    <div className="zone-chip-name" style={{color:zc.text}}>{zone.name}</div>
                    <div className="zone-chip-meta">{zone.w}×{zone.h} ft{bt?.plantable?` · ${planted} planted`:""}</div>
                  </div>
                  <button className="zone-chip-del" onClick={e=>{e.stopPropagation();if(confirm(`Remove "${zone.name}"?`))onDeleteZone(zone.id);}}>✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {garden.zones.length===0&&!drawMode&&(
        <div style={{textAlign:"center",padding:"2rem 1rem",color:"var(--mut)",fontSize:".88rem"}}>
          <div style={{fontSize:"2rem",marginBottom:".5rem"}}>🗺️</div>
          <div style={{fontWeight:600,color:"var(--ink)",marginBottom:".35rem"}}>Garden is empty</div>
          <div>Use <strong>Draw Zone</strong> to drag a raised bed, container, or path onto the grid.</div>
        </div>
      )}
      {pendingRect&&<AddZoneModal rect={pendingRect} gardenW={garden.w} gardenH={garden.h} onAdd={z=>{onAddZone(z);setPendingRect(null);setDrawMode(false);}} onClose={()=>setPendingRect(null)}/>}
      {showForm&&<AddZoneModal rect={null} gardenW={garden.w} gardenH={garden.h} existingZones={garden.zones} onAdd={z=>{onAddZone(z);setShowForm(false);}} onClose={()=>setShowForm(false)}/>}
    </div>
  );
}

// ─── ADD ZONE / GARDEN MODALS ─────────────────────────────────────────────────
function AddZoneModal({ rect, gardenW, gardenH, existingZones=[], onAdd, onClose }) {
  const [name,setName]=useState(""); const [type,setType]=useState("raised");
  const [x,setX]=useState(rect?rect.x:0); const [y,setY]=useState(rect?rect.y:0);
  const [w,setW]=useState(rect?rect.w:2); const [h,setH]=useState(rect?rect.h:4);
  const p={x:parseInt(x)||0,y:parseInt(y)||0,w:parseInt(w)||1,h:parseInt(h)||1};
  const outOfBounds=p.x+p.w>gardenW||p.y+p.h>gardenH||p.x<0||p.y<0;
  const overlaps=existingZones.some(z=>rectsOverlap(p,z));
  const err=outOfBounds||overlaps;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-drag"/><div className="modal-title">{rect?`New Zone · ${rect.w}×${rect.h} ft`:"Add Zone"}</div>
        <div className="field"><label className="lbl">Name</label><input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Main Raised Bed, Herb Pot…" autoFocus/></div>
        <div className="field"><label className="lbl">Type</label>
          <select className="sel-i" value={type} onChange={e=>setType(e.target.value)}>{ZONE_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}</select>
        </div>
        <div style={{fontWeight:600,fontSize:".72rem",color:"var(--mut)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:".4rem"}}>Position & Size</div>
        <div className="row4" style={{marginBottom:".85rem"}}>
          <div><label className="lbl">Col</label><input type="number" className="inp" min={1} max={gardenW} value={parseInt(x)+1} onChange={e=>setX(parseInt(e.target.value)-1||0)}/></div>
          <div><label className="lbl">Row</label><input type="number" className="inp" min={1} max={gardenH} value={parseInt(y)+1} onChange={e=>setY(parseInt(e.target.value)-1||0)}/></div>
          <div><label className="lbl">Width</label><input type="number" className="inp" min={1} max={gardenW} value={w} onChange={e=>setW(e.target.value)}/></div>
          <div><label className="lbl">Length</label><input type="number" className="inp" min={1} max={gardenH} value={h} onChange={e=>setH(e.target.value)}/></div>
        </div>
        {!err&&<div className="prev-box">{p.w}×{p.h} ft · {p.w*p.h} sq ft · col {p.x+1}–{p.x+p.w}, row {p.y+1}–{p.y+p.h}</div>}
        {outOfBounds&&<div className="hint-box">⚠️ Zone extends outside garden.</div>}
        {overlaps&&!outOfBounds&&<div className="hint-box">⚠️ Overlaps existing zone.</div>}
        <div className="m-acts">
          <button className="btn-p" disabled={!name.trim()||err} onClick={()=>onAdd({id:genId(),name:name.trim(),type,...p,cells:{}})}>Create Zone</button>
          <button className="btn-s" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
function AddGardenModal({ onAdd, onClose }) {
  const [name,setName]=useState(""); const [w,setW]=useState(10); const [h,setH]=useState(6);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-drag"/><div className="modal-title">New Garden</div>
        <div className="hint-box">Your overall outdoor space. You'll divide it into raised beds, containers, and paths next.</div>
        <div className="field"><label className="lbl">Name</label><input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Backyard, Front Yard, Balcony…" autoFocus/></div>
        <div className="row2">
          <div className="field"><label className="lbl">Width (ft)</label><input type="number" className="inp" min={1} max={50} value={w} onChange={e=>setW(e.target.value)}/></div>
          <div className="field"><label className="lbl">Depth (ft)</label><input type="number" className="inp" min={1} max={50} value={h} onChange={e=>setH(e.target.value)}/></div>
        </div>
        <div className="prev-box">{(parseInt(w)||0)*(parseInt(h)||0)} sq ft total</div>
        <div className="m-acts">
          <button className="btn-p" disabled={!name.trim()} onClick={()=>onAdd({id:genId(),name:name.trim(),w:parseInt(w)||10,h:parseInt(h)||6,zones:[]})}>Create Garden</button>
          <button className="btn-s" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── PALETTE BAR ──────────────────────────────────────────────────────────────
function PaletteBar({ allPlants, activePlant, onSelect }) {
  return (
    <div className="palette-bar">
      <span className="pal-label">Paint:</span>
      <div className="pal-scroll">
        <div className={`pal-chip none ${!activePlant?"ap":""}`} onClick={()=>onSelect(null)}>✏️ Edit</div>
        {allPlants.slice(0,28).map(p=>(
          <div key={p.id} className={`pal-chip ${activePlant?.id===p.id?"ap":""}`}
            style={activePlant?.id===p.id?{background:p.color+"22",borderColor:p.color}:{}}
            onClick={()=>onSelect(activePlant?.id===p.id?null:p)}>
            {p.emoji} {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MINI PICKER (with span selection) ────────────────────────────────────────
function MiniPicker({ pos, allPlants, zone, startKey, onConfirm, onClose }) {
  const [type,    setType]    = useState("all");
  const [search,  setSearch]  = useState("");
  const [selId,   setSelId]   = useState("");
  const [spanW,   setSpanW]   = useState(1);
  const [spanH,   setSpanH]   = useState(1);
  const [useCustom, setUseCustom] = useState(false);
  const ref = useRef();

  const [startRow, startCol] = startKey.split(",").map(Number);

  // When a plant is selected, auto-suggest its default span
  function handleSelectPlant(pid) {
    setSelId(pid);
    const p = allPlants.find(x=>x.id===pid);
    if (p?.defaultSpan) { setSpanW(p.defaultSpan[0]); setSpanH(p.defaultSpan[1]); }
  }

  const fits = zone ? spanFits(zone.cells||{}, zone.w, zone.h, startRow, startCol, spanW, spanH) : false;
  const outOfBounds = zone ? (startCol+spanW > zone.w || startRow+spanH > zone.h) : false;
  const noFit = !fits;

  const filtered = allPlants.filter(p=>{
    if (type!=="all"&&p.type!==type) return false;
    if (search&&!p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  useEffect(()=>{
    function onDown(e){if(ref.current&&!ref.current.contains(e.target))onClose();}
    document.addEventListener("mousedown",onDown);
    document.addEventListener("touchstart",onDown);
    return()=>{document.removeEventListener("mousedown",onDown);document.removeEventListener("touchstart",onDown);};
  },[onClose]);

  const style={top:pos.y,left:pos.x};
  if(typeof window!=="undefined"){
    if(pos.x+290>window.innerWidth) style.left=window.innerWidth-294;
    if(pos.y+480>window.innerHeight) style.top=Math.max(4,pos.y-480);
    if(style.left<4)style.left=4; if(style.top<4)style.top=4;
  }

  return (
    <div className="mini-picker" ref={ref} style={style}>
      <div className="mp-title">Assign Plant</div>
      <div className="mp-filters">
        {["all","vegetable","herb","flower"].map(t=>(
          <button key={t} className={`mp-filt ${type===t?"on":""}`} onClick={()=>setType(t)}>
            {t==="all"?"All":t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      <input className="mp-search" placeholder="Search plants…" value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
      <div className="mp-plant-grid">
        {filtered.map(p=>(
          <div key={p.id} className={`mp-plant ${selId===p.id?"sel":""}`} onClick={()=>handleSelectPlant(p.id)}>
            <div style={{fontSize:"1.2rem"}}>{p.emoji}</div>
            <div style={{fontSize:".58rem",fontWeight:500,color:"var(--mut)",marginTop:1,lineHeight:1.2}}>{p.name}</div>
          </div>
        ))}
      </div>

      <div className="mp-divider"/>
      <div className="mp-span-label">Plant Size (sq ft)</div>
      <div className="mp-span-grid">
        {SPAN_PRESETS.map(p=>{
          const active=!useCustom&&spanW===p.w&&spanH===p.h;
          const wouldFit=zone?spanFits(zone.cells||{},zone.w,zone.h,startRow,startCol,p.w,p.h):false;
          return (
            <button key={p.label} className={`mp-span-btn ${active?"sel":""}`}
              style={!wouldFit?{opacity:.35,cursor:"not-allowed"}:{}}
              title={!wouldFit?"Doesn't fit here":""}
              onClick={()=>{if(!wouldFit)return;setSpanW(p.w);setSpanH(p.h);setUseCustom(false);}}>
              {p.label}
            </button>
          );
        })}
        <button className={`mp-span-btn ${useCustom?"sel":""}`} onClick={()=>setUseCustom(true)}>Custom…</button>
      </div>
      {useCustom&&(
        <div className="mp-span-custom">
          <span>W:</span>
          <input className="mp-span-inp" type="number" min={1} max={zone?.w||10} value={spanW} onChange={e=>setSpanW(parseInt(e.target.value)||1)}/>
          <span>× H:</span>
          <input className="mp-span-inp" type="number" min={1} max={zone?.h||10} value={spanH} onChange={e=>setSpanH(parseInt(e.target.value)||1)}/>
          <span style={{fontSize:".7rem",color:"var(--mut)"}}>ft</span>
        </div>
      )}
      {selId&&noFit&&<div className="mp-warning">⚠️ {outOfBounds?"Extends outside zone":"Overlaps another plant"}. Choose a different size or cell.</div>}

      <div className="mp-acts">
        <button className="btn-p" style={{flex:1,padding:".38rem .6rem",fontSize:".78rem"}} disabled={!selId||noFit}
          onClick={()=>selId&&!noFit&&onConfirm(selId,spanW,spanH)}>
          Plant {spanW>1||spanH>1?`(${spanW}×${spanH})`:""}
        </button>
        <button className="btn-s" style={{padding:".38rem .6rem",fontSize:".78rem"}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function DetailModal({ cell, cellKey, zoneName, zone, allPlants, onCustomPlant, onSave, onClear, onClose }) {
  const [r,c]       = cellKey.split(",").map(Number);
  const [plantId,   setPlantId]   = useState(cell.plantId     || "");
  const [status,    setStatus]    = useState(cell.status      || "planted");
  const [plantedDt, setPlantedDt] = useState(cell.plantedDate || "");
  const [harvestDt, setHarvestDt] = useState(cell.harvestDate || "");
  const [notes,     setNotes]     = useState(cell.notes       || "");
  const [spanW,     setSpanW]     = useState(cell.spanW       || 1);
  const [spanH,     setSpanH]     = useState(cell.spanH       || 1);
  const [customMode,setCustomMode]= useState(false);
  const [cName,     setCName]     = useState("");
  const [cEmoji,    setCEmoji]    = useState("🌱");

  const plant = allPlants.find(p=>p.id===plantId);
  const resizeFits = zone ? spanFits(zone.cells||{}, zone.w, zone.h, r, c, spanW, spanH, cellKey) : false;
  const spanChanged = spanW!==(cell.spanW||1) || spanH!==(cell.spanH||1);

  function syncHarvest(pid, pd) {
    const p=allPlants.find(x=>x.id===pid);
    if(p?.dth&&pd)setHarvestDt(addDays(pd,p.dth));
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-drag"/>
        <div className="modal-title">
          {zoneName} · Row {r+1}, Col {c+1}
          {plant&&<span style={{fontWeight:400,fontStyle:"italic",marginLeft:".5rem",color:"var(--mut)",fontSize:".9rem"}}>{plant.emoji} {plant.name}</span>}
        </div>

        <div className="field">
          <label className="lbl">Plant</label>
          <select className="sel-i" value={plantId} onChange={e=>{setPlantId(e.target.value);syncHarvest(e.target.value,plantedDt);}}>
            <option value="">— select —</option>
            {["vegetable","herb","flower","custom"].map(type=>{
              const grp=allPlants.filter(p=>p.type===type); if(!grp.length)return null;
              return <optgroup key={type} label={type.charAt(0).toUpperCase()+type.slice(1)+"s"}>{grp.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}</optgroup>;
            })}
          </select>
        </div>

        {plant?.dth&&(
          <div className="pib">
            <strong>{plant.name}</strong> · {plant.type} · ~{plant.dth} days to harvest · {plant.spacing}
            {plant.notes&&<div style={{marginTop:2,fontStyle:"italic"}}>💡 {plant.notes}</div>}
          </div>
        )}

        {/* Span editor */}
        <div className="field">
          <label className="lbl">Plant Size (sq ft) — current {cell.spanW||1}×{cell.spanH||1}</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:".35rem",marginBottom:".4rem"}}>
            {SPAN_PRESETS.map(p=>{
              const active=spanW===p.w&&spanH===p.h;
              const wouldFit=zone?spanFits(zone.cells||{},zone.w,zone.h,r,c,p.w,p.h,cellKey):false;
              return (
                <button key={p.label} className={`mp-span-btn ${active?"sel":""}`}
                  style={!wouldFit?{opacity:.35,cursor:"not-allowed"}:{}}
                  onClick={()=>{if(!wouldFit)return;setSpanW(p.w);setSpanH(p.h);}}>
                  {p.label}
                </button>
              );
            })}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:".5rem",fontSize:".78rem",color:"var(--mut)"}}>
            <span>Custom:</span>
            <input type="number" className="mp-span-inp" min={1} max={zone?.w||10} value={spanW} onChange={e=>setSpanW(parseInt(e.target.value)||1)}/>
            <span>×</span>
            <input type="number" className="mp-span-inp" min={1} max={zone?.h||10} value={spanH} onChange={e=>setSpanH(parseInt(e.target.value)||1)}/>
            <span>ft</span>
          </div>
          {spanChanged&&!resizeFits&&<div style={{fontSize:".72rem",color:"#b00",marginTop:".35rem"}}>⚠️ New size doesn't fit — overlaps another plant or extends outside zone.</div>}
        </div>

        {!customMode&&<button className="btn-s" style={{marginBottom:".85rem",fontSize:".75rem",padding:".3rem .7rem"}} onClick={()=>setCustomMode(true)}>+ Add custom plant</button>}
        {customMode&&(
          <div style={{background:"var(--C)",border:"1px solid var(--bdr)",borderRadius:8,padding:".75rem",marginBottom:".85rem"}}>
            <div style={{fontWeight:600,fontSize:".75rem",color:"var(--mut)",marginBottom:".5rem"}}>Custom Plant</div>
            <div className="row2" style={{marginBottom:".5rem"}}>
              <div><label className="lbl">Name</label><input className="inp" value={cName} onChange={e=>setCName(e.target.value)} placeholder="e.g. Heirloom Rose"/></div>
              <div><label className="lbl">Emoji</label><input className="inp" value={cEmoji} onChange={e=>setCEmoji(e.target.value)} maxLength={2}/></div>
            </div>
            <div style={{display:"flex",gap:".4rem"}}>
              <button className="btn-p" style={{fontSize:".78rem",padding:".35rem .75rem"}} onClick={()=>{
                if(!cName.trim())return;
                const p={id:"custom-"+genId(),name:cName.trim(),type:"custom",emoji:cEmoji,color:"#5a7a50"};
                onCustomPlant(p);setPlantId(p.id);setCustomMode(false);
              }}>Add</button>
              <button className="btn-s" style={{fontSize:".78rem",padding:".35rem .75rem"}} onClick={()=>setCustomMode(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="field">
          <label className="lbl">Status</label>
          <div className="st-row">{STATUSES.map(s=>(
            <button key={s.id} className="st-btn" onClick={()=>setStatus(s.id)}
              style={{background:status===s.id?s.color:"transparent",borderColor:status===s.id?s.color:"var(--bdr)",color:status===s.id?"#fff":"var(--mut)"}}>
              {s.label}
            </button>
          ))}</div>
        </div>

        <div className="row2">
          <div className="field" style={{marginBottom:0}}>
            <label className="lbl">Date Planted</label>
            <input type="date" className="inp" value={plantedDt} onChange={e=>{setPlantedDt(e.target.value);syncHarvest(plantId,e.target.value);}}/>
          </div>
          <div className="field" style={{marginBottom:0}}>
            <label className="lbl">Exp. Harvest</label>
            <input type="date" className="inp" value={harvestDt} onChange={e=>setHarvestDt(e.target.value)}/>
          </div>
        </div>
        <div className="field" style={{marginTop:".9rem"}}>
          <label className="lbl">Notes</label>
          <textarea className="ta" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Variety, amendments, observations…"/>
        </div>
        <div className="m-acts">
          <button className="btn-p" disabled={!plantId||(spanChanged&&!resizeFits)} onClick={()=>onSave({plantId,status,plantedDate:plantedDt,harvestDate:harvestDt,notes,spanW,spanH})}>Save</button>
          <button className="btn-s" onClick={onClose}>Cancel</button>
          {cell.plantId&&<button className="btn-d" onClick={onClear}>Clear Cell</button>}
        </div>
      </div>
    </div>
  );
}

// ─── ZONE PLANTING GRID (CSS Grid based) ─────────────────────────────────────
function ZonePlantGrid({ zone, allPlants, activePlant, onCellClick, onCellPaint }) {
  const PC=54, GAP=3;
  const LABEL_COL = 24, LABEL_ROW = 20;
  // CSS grid: col 1 = row-labels, cols 2..w+1 = plant cells
  //           row 1 = col-labels, rows 2..h+1 = plant cells
  const gridStyle = {
    display:"grid",
    gridTemplateColumns:`${LABEL_COL}px repeat(${zone.w}, ${PC}px)`,
    gridTemplateRows:`${LABEL_ROW}px repeat(${zone.h}, ${PC}px)`,
    gap:`${GAP}px`,
    overflow:"auto",
    WebkitOverflowScrolling:"touch",
    userSelect:"none",
  };

  const dragging = useRef(false);
  const painted  = useRef(new Set());

  useEffect(()=>{
    const up=()=>{ dragging.current=false; };
    window.addEventListener("mouseup",up);
    return()=>window.removeEventListener("mouseup",up);
  },[]);

  const cells = zone.cells || {};

  // Build render items: corner, col labels, then for each row: row label + cells
  const items = [];

  // Corner
  items.push(<div key="corner" style={{gridColumn:1,gridRow:1}}/>);

  // Col labels
  for (let c=0; c<zone.w; c++) {
    items.push(
      <div key={`cl-${c}`} style={{gridColumn:c+2,gridRow:1,fontSize:".6rem",color:"var(--mut)",textAlign:"center",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center"}}>{c+1}</div>
    );
  }

  // Row labels
  for (let r=0; r<zone.h; r++) {
    items.push(
      <div key={`rl-${r}`} style={{gridColumn:1,gridRow:r+2,fontSize:".6rem",color:"var(--mut)",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center"}}>{r+1}</div>
    );
  }

  // Cells
  for (let r=0; r<zone.h; r++) {
    for (let c=0; c<zone.w; c++) {
      const key  = `${r},${c}`;
      const cell = cells[key];

      // Skip occupied cells — the primary's spanning element covers this slot
      if (cell?.occupiedBy) continue;

      const plant  = cell?.plantId ? getPlant(allPlants, cell.plantId) : null;
      const spanW  = cell?.spanW || 1;
      const spanH  = cell?.spanH || 1;
      const sdot   = cell?.status ? STATUSES.find(s=>s.id===cell.status) : null;
      const isSpan = spanW > 1 || spanH > 1;

      items.push(
        <div key={key} data-pk={key}
          className={`pcell ${plant?"":"empty"} ${activePlant?"paint-ready":""}`}
          style={{
            gridColumn:`${c+2} / span ${spanW}`,
            gridRow:`${r+2} / span ${spanH}`,
            background:plant ? plant.color+"2a" : undefined,
            borderColor:plant ? plant.color : undefined,
            fontSize:plant?"1.4rem":".72rem",
            color:plant?undefined:"var(--bdr)",
          }}
          onMouseDown={()=>{ dragging.current=true; painted.current=new Set(); if(activePlant){onCellPaint(key);painted.current.add(key);} }}
          onMouseEnter={()=>{ if(!dragging.current||!activePlant)return; if(!painted.current.has(key)){onCellPaint(key);painted.current.add(key);} }}
          onClick={()=>{ if(!activePlant)onCellClick(key); }}
          title={plant?`${plant.emoji} ${plant.name}${isSpan?` (${spanW}×${spanH} sqft)`:""}`:activePlant?"Click/drag to paint":"Click to assign"}
        >
          {plant ? (
            <>
              <span className="pcell-emoji">{plant.emoji}</span>
              {isSpan && <span className="pcell-span-label">{spanW}×{spanH} sqft</span>}
              {sdot && <div className="pcell-dot" style={{background:sdot.color}}/>}
            </>
          ) : "+"}
        </div>
      );
    }
  }

  const uniq = [...new Set(Object.values(cells).filter(c=>c.plantId).map(c=>c.plantId))];

  return (
    <div>
      <div style={gridStyle}>{items}</div>
      {uniq.length>0&&(
        <div className="plant-legend">
          {uniq.map(pid=>{ const p=getPlant(allPlants,pid); return p?<div key={pid} className="pl-item"><div className="pl-dot" style={{background:p.color}}/>{p.emoji} {p.name}</div>:null; })}
        </div>
      )}
    </div>
  );
}

// ─── ZONE LIST VIEW ───────────────────────────────────────────────────────────
function ZoneListView({ zone, allPlants, onEditCell }) {
  const rows=[];
  // Only show primary cells (not occupied)
  for(let r=0;r<zone.h;r++) for(let c=0;c<zone.w;c++){
    const key=`${r},${c}`, cell=(zone.cells||{})[key];
    if(cell?.plantId) rows.push({key,r,c,cell,plant:getPlant(allPlants,cell.plantId)});
  }
  if(!rows.length)return <div style={{textAlign:"center",padding:"2rem",color:"var(--mut)",fontSize:".88rem"}}>No plants here yet.</div>;
  return (
    <div style={{overflowX:"auto"}}>
      <table className="list-table">
        <thead><tr><th>Plant</th><th>Location</th><th>Size</th><th>Status</th><th>Planted</th><th>Harvest</th><th/></tr></thead>
        <tbody>
          {rows.map(({key,r,c,cell,plant})=>{
            const s=STATUSES.find(x=>x.id===cell.status);
            const sw=cell.spanW||1, sh=cell.spanH||1;
            return <tr key={key}>
              <td><div className="lpc"><span style={{fontSize:"1.1rem"}}>{plant?.emoji}</span><span style={{fontWeight:500}}>{plant?.name||cell.plantId}</span></div></td>
              <td><span style={{fontSize:".72rem",color:"var(--mut)"}}>Row {r+1}, Col {c+1}</span></td>
              <td><span style={{fontSize:".72rem",color:sw>1||sh>1?"var(--T)":"var(--mut)",fontWeight:sw>1||sh>1?600:400}}>{sw}×{sh} sqft</span></td>
              <td>{s&&<span className="sp" style={{background:s.color}}>{s.label}</span>}</td>
              <td style={{fontSize:".78rem",color:"var(--mut)"}}>{fmtDateFull(cell.plantedDate)||"—"}</td>
              <td style={{fontSize:".78rem",color:"var(--mut)"}}>{fmtDateFull(cell.harvestDate)||"—"}</td>
              <td><button className="l-btn" onClick={()=>onEditCell(key)}>Edit</button></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── GLOBAL LIST ──────────────────────────────────────────────────────────────
function GlobalList({ gardens, allPlants, onEditCell }) {
  const sections=[];
  gardens.forEach(g=>g.zones.forEach(zone=>{
    if(!ZONE_TYPES.find(t=>t.id===zone.type)?.plantable)return;
    const rows=[];
    for(let r=0;r<zone.h;r++) for(let c=0;c<zone.w;c++){
      const key=`${r},${c}`,cell=(zone.cells||{})[key];
      if(cell?.plantId)rows.push({key,r,c,cell,plant:getPlant(allPlants,cell.plantId)});
    }
    if(rows.length)sections.push({g,zone,rows});
  }));
  if(!sections.length)return <div style={{textAlign:"center",padding:"3rem 1rem",color:"var(--mut)"}}>No plants anywhere yet.</div>;
  return (
    <div>
      {sections.map(({g,zone,rows})=>{
        const zc=ZONE_COLORS[zone.type]||ZONE_COLORS.raised, bt=ZONE_TYPES.find(t=>t.id===zone.type);
        return (
          <div key={zone.id} className="gl-sec">
            <div className="gl-sec-head" style={{borderLeft:`3px solid ${zc.border}`,paddingLeft:".65rem"}}>
              {bt?.icon} {zone.name} <span style={{fontWeight:400,opacity:.7}}>· {g.name} · {rows.length} plant{rows.length!==1?"s":""}</span>
            </div>
            <div style={{overflowX:"auto"}}>
              <table className="list-table">
                <thead><tr><th>Plant</th><th>Loc</th><th>Size</th><th>Status</th><th>Planted</th><th>Harvest</th><th/></tr></thead>
                <tbody>
                  {rows.map(({key,r,c,cell,plant})=>{
                    const s=STATUSES.find(x=>x.id===cell.status);
                    const sw=cell.spanW||1,sh=cell.spanH||1;
                    return <tr key={key}>
                      <td><div className="lpc"><span style={{fontSize:"1.1rem"}}>{plant?.emoji}</span><span style={{fontWeight:500}}>{plant?.name}</span></div></td>
                      <td><span style={{fontSize:".72rem",color:"var(--mut)"}}>R{r+1}C{c+1}</span></td>
                      <td><span style={{fontSize:".72rem",color:sw>1||sh>1?"var(--T)":"var(--mut)",fontWeight:sw>1||sh>1?600:400}}>{sw}×{sh}</span></td>
                      <td>{s&&<span className="sp" style={{background:s.color}}>{s.label}</span>}</td>
                      <td style={{fontSize:".78rem",color:"var(--mut)"}}>{fmtDateFull(cell.plantedDate)||"—"}</td>
                      <td style={{fontSize:".78rem",color:"var(--mut)"}}>{fmtDateFull(cell.harvestDate)||"—"}</td>
                      <td><button className="l-btn" onClick={()=>onEditCell(g.id,zone.id,key)}>Edit</button></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
function CalendarView({ gardens, allPlants }) {
  const today=new Date();today.setHours(0,0,0,0);
  const items=[];
  gardens.forEach(g=>g.zones.forEach(zone=>{
    if(!ZONE_TYPES.find(t=>t.id===zone.type)?.plantable)return;
    Object.entries(zone.cells||{}).forEach(([key,cell])=>{
      if(!cell.plantId)return;
      const plant=getPlant(allPlants,cell.plantId);if(!plant)return;
      const hd=cell.harvestDate||(cell.plantedDate&&plant.dth?addDays(cell.plantedDate,plant.dth):null);
      const[r,c]=key.split(",").map(Number);
      items.push({plant,cell,zone,garden:g,harvestDate:hd,r,c});
    });
  }));
  if(!items.length)return(
    <div>
      <div style={{marginBottom:"1rem"}}><div style={{fontFamily:"'Lora',serif",fontSize:"1.25rem",fontWeight:700}}>Planting Calendar</div><div style={{fontSize:".8rem",color:"var(--mut)",marginTop:".15rem"}}>Expected harvests across all beds</div></div>
      <div style={{textAlign:"center",padding:"3rem",color:"var(--mut)"}}>
        <div style={{fontSize:"2rem",marginBottom:".5rem"}}>📅</div>
        <div style={{fontWeight:600,color:"var(--ink)",marginBottom:".35rem"}}>No harvest dates yet</div>
        <div style={{fontSize:".85rem"}}>Add plants with planting dates to see forecasts here.</div>
      </div>
    </div>
  );
  const withDates=items.filter(i=>i.harvestDate).sort((a,b)=>a.harvestDate.localeCompare(b.harvestDate));
  const groups={};
  withDates.forEach(item=>{const d=new Date(item.harvestDate+"T00:00:00"),k=`${d.getFullYear()}-${String(d.getMonth()).padStart(2,"0")}`;if(!groups[k])groups[k]={label:`${MONTHS[d.getMonth()]} ${d.getFullYear()}`,items:[]};groups[k].items.push(item);});
  function rel(ds){const d=new Date(ds+"T00:00:00"),diff=Math.round((d-today)/86400000);if(diff<0)return{label:`${Math.abs(diff)}d overdue`,over:true};if(diff===0)return{label:"Today!",over:false};if(diff<=7)return{label:`In ${diff}d`,over:false};if(diff<=30)return{label:`In ~${Math.round(diff/7)}wk`,over:false};return{label:`In ~${Math.round(diff/30)}mo`,over:false};}
  return(
    <div>
      <div style={{marginBottom:"1.1rem"}}><div style={{fontFamily:"'Lora',serif",fontSize:"1.25rem",fontWeight:700}}>Planting Calendar</div><div style={{fontSize:".8rem",color:"var(--mut)",marginTop:".15rem"}}>{withDates.length} plants with harvest dates</div></div>
      {Object.entries(groups).map(([gk,g])=>(
        <div key={gk} className="mo-grp">
          <div className="mo-head">{g.label}</div>
          {g.items.map((item,i)=>{const r=rel(item.harvestDate),sd=STATUSES.find(s=>s.id===item.cell.status),zc=ZONE_COLORS[item.zone.type]||ZONE_COLORS.raised;const sw=item.cell.spanW||1,sh=item.cell.spanH||1;return(
            <div key={i} className="h-card">
              <div style={{fontSize:"1.7rem",flexShrink:0}}>{item.plant.emoji}</div>
              <div>
                <div style={{fontWeight:600,fontSize:".9rem"}}>{item.plant.name}{(sw>1||sh>1)&&<span style={{fontSize:".72rem",color:"var(--T)",fontWeight:600,marginLeft:".4rem"}}>{sw}×{sh}sqft</span>}</div>
                <div style={{fontSize:".72rem",color:"var(--mut)",marginTop:1}}>
                  <span style={{color:zc.text}}>{item.zone.name}</span> · {item.garden.name}
                  {sd&&<span style={{marginLeft:".35rem",color:sd.color}}>· {sd.label}</span>}
                  {item.cell.plantedDate&&<span style={{marginLeft:".35rem"}}>· planted {fmtDate(item.cell.plantedDate)}</span>}
                </div>
              </div>
              <div style={{marginLeft:"auto",textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:".85rem",fontWeight:600,color:r.over?"#b00":"var(--T)"}}>{fmtDate(item.harvestDate)}</div>
                <div style={{fontSize:".68rem",color:r.over?"#b00":"var(--mut)",marginTop:1}}>{r.label}</div>
              </div>
            </div>
          );})}
        </div>
      ))}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function GardenPlanner() {
  const [data,setData]=useState(()=>{
    try{const s=localStorage.getItem("gp-v4");return s?JSON.parse(s):{gardens:[],customPlants:[]};}
    catch{return{gardens:[],customPlants:[]};}
  });
  const [activeGardenId,setActiveGardenId]=useState(()=>{try{return JSON.parse(localStorage.getItem("gp-v4")||"{}").gardens?.[0]?.id||null;}catch{return null;}});
  const [activeZoneId,  setActiveZoneId]  = useState(null);
  const [tab,           setTab]           = useState("garden");
  const [bedView,       setBedView]       = useState("grid");
  const [showAddGarden, setShowAddGarden] = useState(false);
  const [detailCell,    setDetailCell]    = useState(null);
  const [miniPicker,    setMiniPicker]    = useState(null);
  const [activePlant,   setActivePlant]   = useState(null);
  const [showMobSB,     setShowMobSB]     = useState(false);
  const importRef = useRef();

  useEffect(()=>{ localStorage.setItem("gp-v4",JSON.stringify(data)); },[data]);

  const allPlants   = [...PLANTS,...(data.customPlants||[])];
  const activeGarden = data.gardens.find(g=>g.id===activeGardenId);
  const activeZone   = activeGarden?.zones.find(z=>z.id===activeZoneId);

  const addGarden=g=>{setData(d=>({...d,gardens:[...d.gardens,g]}));setActiveGardenId(g.id);setActiveZoneId(null);setShowAddGarden(false);setShowMobSB(false);setTab("garden");};
  const deleteGarden=id=>{setData(d=>({...d,gardens:d.gardens.filter(g=>g.id!==id)}));if(activeGardenId===id){setActiveGardenId(data.gardens.find(g=>g.id!==id)?.id||null);setActiveZoneId(null);}};
  const addZone=(gId,zone)=>setData(d=>({...d,gardens:d.gardens.map(g=>g.id!==gId?g:{...g,zones:[...g.zones,zone]})}));
  const deleteZone=(gId,zId)=>{setData(d=>({...d,gardens:d.gardens.map(g=>g.id!==gId?g:{...g,zones:g.zones.filter(z=>z.id!==zId)})}));if(activeZoneId===zId)setActiveZoneId(null);};

  const setCellsForZone=(gId,zId,newCells)=>setData(d=>({...d,gardens:d.gardens.map(g=>g.id!==gId?g:{
    ...g,zones:g.zones.map(z=>z.id!==zId?z:{...z,cells:newCells})
  })}));

  const updateCell=(gId,zId,key,cellData,sw=1,sh=1)=>{
    const g=data.gardens.find(x=>x.id===gId), z=g?.zones.find(x=>x.id===zId);
    if(!z)return;
    // Clear old span first
    let cells=clearSpanCells(z.cells||{},key);
    // Write new span
    const spanCells=buildSpanCells(...key.split(",").map(Number),sw,sh,cellData);
    setCellsForZone(gId,zId,{...cells,...spanCells});
  };

  const clearCellByKey=(gId,zId,key)=>{
    const g=data.gardens.find(x=>x.id===gId),z=g?.zones.find(x=>x.id===zId);
    if(!z)return;
    setCellsForZone(gId,zId,clearSpanCells(z.cells||{},key));
  };

  const addCustomPlant=p=>setData(d=>({...d,customPlants:[...(d.customPlants||[]),p]}));

  // Paint: single cell, always 1×1
  const paintCell=useCallback((gId,zId,key)=>{
    if(!activePlant)return;
    setData(d=>({...d,gardens:d.gardens.map(g=>g.id!==gId?g:{
      ...g,zones:g.zones.map(z=>{
        if(z.id!==zId)return z;
        const cells=z.cells||{};
        // Don't paint over occupied/planted cells
        const existing=cells[key];
        if(existing?.plantId||existing?.occupiedBy)return z;
        return{...z,cells:{...cells,[key]:{plantId:activePlant.id,status:"planned",spanW:1,spanH:1}}};
      })
    })}));
  },[activePlant]);

  function handleCellClick(gId,zId,key){
    if(activePlant)return;
    const g=data.gardens.find(x=>x.id===gId);
    const z=g?.zones.find(x=>x.id===zId);
    const cells=z?.cells||{};
    const rawCell=cells[key];
    // Resolve to primary if occupied
    const primaryKey=resolvePrimary(cells,key);
    const primaryCell=cells[primaryKey];
    if(primaryCell?.plantId){
      setDetailCell({gardenId:gId,zoneId:zId,key:primaryKey});
    } else {
      const el=document.querySelector(`[data-pk="${key}"]`);
      const pos=el?{x:el.getBoundingClientRect().right+6,y:el.getBoundingClientRect().top}:{x:window.innerWidth/2-140,y:window.innerHeight/2-240};
      setMiniPicker({gardenId:gId,zoneId:zId,key,pos});
    }
  }

  const exportData=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="garden-plan.json";a.click();URL.revokeObjectURL(url);};
  const importData=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{try{const d=JSON.parse(ev.target.result);setData(d);setActiveGardenId(d.gardens[0]?.id||null);setActiveZoneId(null);}catch{alert("Invalid file.");}};reader.readAsText(file);e.target.value="";};

  const zMeta=t=>ZONE_TYPES.find(x=>x.id===t);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <Sidebar gardens={data.gardens} activeId={activeGardenId}
          onSelect={id=>{setActiveGardenId(id);setActiveZoneId(null);setTab("garden");}}
          onAdd={()=>setShowAddGarden(true)} onDelete={deleteGarden}
          onExport={exportData} onImport={importData}/>

        <div className="main">
          <div className="hdr">
            <div style={{display:"flex",alignItems:"center",gap:".4rem"}}>
              <button className="hamburger" onClick={()=>setShowMobSB(true)}>☰</button>
              <span className="hdr-title">🌱 Garden</span>
            </div>
            <div className="nav-tabs">
              <button className={`nav-tab ${tab==="garden"?"on":""}`}    onClick={()=>setTab("garden")}>Garden</button>
              <button className={`nav-tab ${tab==="allplants"?"on":""}`} onClick={()=>setTab("allplants")}>All Plants</button>
              <button className={`nav-tab ${tab==="calendar"?"on":""}`}  onClick={()=>setTab("calendar")}>Calendar</button>
            </div>
            <div>
              {tab==="garden"&&activeZone&&(
                <div className="view-toggle">
                  <button className={`vt-btn ${bedView==="grid"?"on":""}`} onClick={()=>setBedView("grid")}>⊞ Grid</button>
                  <button className={`vt-btn ${bedView==="list"?"on":""}`} onClick={()=>setBedView("list")}>☰ List</button>
                </div>
              )}
            </div>
          </div>

          <div className="content">
            {tab==="garden"&&(
              !activeGarden
                ?<div className="empty-state">
                  <div className="es-icon">🌿</div><div className="es-title">No gardens yet</div>
                  <div className="es-text">Create your overall garden space first, then divide it into raised beds, containers, and paths.</div>
                  <button className="btn-p" onClick={()=>setShowAddGarden(true)}>Create Your First Garden</button>
                </div>
                :activeZone
                  ?<>
                    <div className="breadcrumb">
                      <span className="bc-link" onClick={()=>setActiveZoneId(null)}>{activeGarden.name}</span>
                      <span style={{color:"var(--bdr)"}}>›</span>
                      <span>{zMeta(activeZone.type)?.icon} {activeZone.name}</span>
                    </div>
                    <div className="bed-hdr">
                      <div>
                        <div className="bed-title">{zMeta(activeZone.type)?.icon} {activeZone.name}</div>
                        <div className="bed-meta">
                          <span className="type-badge">{zMeta(activeZone.type)?.label}</span>
                          <span style={{fontSize:".75rem",color:"var(--mut)"}}>{activeZone.w}×{activeZone.h} ft</span>
                        </div>
                      </div>
                      {(()=>{
                        const cells=activeZone.cells||{};
                        const planted=Object.values(cells).filter(c=>c.plantId).length;
                        const total=activeZone.w*activeZone.h;
                        const varieties=new Set(Object.values(cells).filter(c=>c.plantId).map(c=>c.plantId)).size;
                        return(
                          <div className="stat-chips">
                            <div className="sch"><span style={{color:"var(--T)",fontWeight:700}}>{planted}</span> planted</div>
                            <div className="sch"><span style={{color:"#4a7a3a",fontWeight:700}}>{total-planted}</span> open</div>
                            <div className="sch"><span style={{fontWeight:700}}>{varieties}</span> varieties</div>
                          </div>
                        );
                      })()}
                    </div>
                    {bedView==="grid"&&(
                      <>
                        <PaletteBar allPlants={allPlants} activePlant={activePlant} onSelect={setActivePlant}/>
                        {activePlant&&(
                          <div style={{fontSize:".73rem",color:"var(--mut)",marginBottom:".75rem",display:"flex",alignItems:"center",gap:".4rem",flexWrap:"wrap"}}>
                            <span style={{background:"rgba(196,98,45,.12)",padding:".18rem .6rem",borderRadius:20,fontWeight:600,color:"var(--T)"}}>🎨 {activePlant.emoji} {activePlant.name}</span>
                            <span>Click or drag to paint (1×1) · switch to Edit mode to set size</span>
                          </div>
                        )}
                        <ZonePlantGrid zone={activeZone} allPlants={allPlants} activePlant={activePlant}
                          onCellClick={key=>handleCellClick(activeGardenId,activeZoneId,key)}
                          onCellPaint={key=>paintCell(activeGardenId,activeZoneId,key)}/>
                      </>
                    )}
                    {bedView==="list"&&<ZoneListView zone={activeZone} allPlants={allPlants} onEditCell={key=>setDetailCell({gardenId:activeGardenId,zoneId:activeZoneId,key})}/>}
                  </>
                  :<GardenOverview garden={activeGarden}
                    onSelectZone={id=>{setActiveZoneId(id);setBedView("grid");}}
                    onAddZone={z=>addZone(activeGardenId,z)}
                    onDeleteZone={id=>deleteZone(activeGardenId,id)}/>
            )}
            {tab==="allplants"&&(
              <div>
                <div style={{marginBottom:"1rem"}}>
                  <div style={{fontFamily:"'Lora',serif",fontSize:"1.25rem",fontWeight:700}}>All Plants</div>
                  <div style={{fontSize:".8rem",color:"var(--mut)",marginTop:".15rem"}}>Across {data.gardens.length} garden{data.gardens.length!==1?"s":""}</div>
                </div>
                <GlobalList gardens={data.gardens} allPlants={allPlants} onEditCell={(gId,zId,key)=>setDetailCell({gardenId:gId,zoneId:zId,key})}/>
              </div>
            )}
            {tab==="calendar"&&<CalendarView gardens={data.gardens} allPlants={allPlants}/>}
          </div>
        </div>

        {showAddGarden&&<AddGardenModal onAdd={addGarden} onClose={()=>setShowAddGarden(false)}/>}

        {miniPicker&&(()=>{
          const g=data.gardens.find(x=>x.id===miniPicker.gardenId);
          const z=g?.zones.find(x=>x.id===miniPicker.zoneId);
          return z?(
            <MiniPicker pos={miniPicker.pos} allPlants={allPlants} zone={z} startKey={miniPicker.key}
              onConfirm={(plantId,sw,sh)=>{
                const[r,c]=miniPicker.key.split(",").map(Number);
                updateCell(miniPicker.gardenId,miniPicker.zoneId,miniPicker.key,{plantId,status:"planned"},sw,sh);
                setMiniPicker(null);
              }}
              onClose={()=>setMiniPicker(null)}/>
          ):null;
        })()}

        {detailCell&&(()=>{
          const g=data.gardens.find(x=>x.id===detailCell.gardenId);
          const z=g?.zones.find(x=>x.id===detailCell.zoneId);
          const cell=(z?.cells||{})[detailCell.key]||{};
          return z?(
            <DetailModal cell={cell} cellKey={detailCell.key} zoneName={z.name} zone={z}
              allPlants={allPlants} onCustomPlant={addCustomPlant}
              onSave={cd=>{ updateCell(detailCell.gardenId,detailCell.zoneId,detailCell.key,cd,cd.spanW||1,cd.spanH||1); setDetailCell(null); }}
              onClear={()=>{ clearCellByKey(detailCell.gardenId,detailCell.zoneId,detailCell.key); setDetailCell(null); }}
              onClose={()=>setDetailCell(null)}/>
          ):null;
        })()}

        <input ref={importRef} type="file" accept=".json" style={{display:"none"}} onChange={importData}/>
      </div>

      {/* Mobile sidebar — outside .app to escape overflow:hidden */}
      {showMobSB&&(
        <div className="mob-sb-wrap">
          <div className="mob-sb-bg" onClick={()=>setShowMobSB(false)}/>
          <div className="mob-sb-panel">
            <Sidebar gardens={data.gardens} activeId={activeGardenId}
              onSelect={id=>{setActiveGardenId(id);setActiveZoneId(null);setTab("garden");setShowMobSB(false);}}
              onAdd={()=>{setShowAddGarden(true);setShowMobSB(false);}}
              onDelete={deleteGarden} onExport={exportData} onImport={importData}/>
          </div>
        </div>
      )}
    </>
  );
}
