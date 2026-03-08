export const ZONE_TYPES = [
  { id:"raised",    label:"Raised Bed",    icon:"⬜", plantable:true  },
  { id:"inground",  label:"In-Ground",     icon:"🌾", plantable:true  },
  { id:"container", label:"Container/Pot", icon:"🪴", plantable:true  },
  { id:"planter",   label:"Planter Box",   icon:"📦", plantable:true  },
  { id:"path",      label:"Path/Walkway",  icon:"🪨", plantable:false },
];

export const ZONE_COLORS = {
  raised:    { bg:"#c4622d22", border:"#c4622d", text:"#8a3a10" },
  inground:  { bg:"#4a8c3022", border:"#4a8c30", text:"#2a5a18" },
  container: { bg:"#3a7a7822", border:"#3a7a78", text:"#1a4a50" },
  planter:   { bg:"#8a6a3022", border:"#8a6a30", text:"#5a3a10" },
  path:      { bg:"#b0a09022", border:"#9a8878", text:"#6a5848" },
};
