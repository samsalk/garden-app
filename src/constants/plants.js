// careDefaults: per-plant overrides for DEFAULT_FREQ.
// null = skip this care type for this plant.
// Omitted keys fall back to DEFAULT_FREQ.
//
// plantingMethod: "direct" = direct seed only, "transplant" = buy/start transplants,
//                 "either" = both methods work well.
export const PLANTS = [
  // ── Vegetables ────────────────────────────────────────────────────────────
  { id:"tomato",     name:"Tomato",           type:"vegetable", emoji:"🍅", color:"#c94a3a", dth:75,  spacing:"1/sqft",   notes:"Needs staking",           defaultSpan:[1,1], careDefaults:{ fertilizing:10, harvest_check:2 },                       plantingMethod:"transplant" },
  { id:"pepper",     name:"Pepper",           type:"vegetable", emoji:"🫑", color:"#d97030", dth:70,  spacing:"1/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"transplant" },
  { id:"zucchini",   name:"Zucchini",         type:"vegetable", emoji:"🥒", color:"#4a8c3c", dth:55,  spacing:"1/4sqft",  notes:"Needs room to sprawl",    defaultSpan:[2,2], careDefaults:{ harvest_check:2 },                                       plantingMethod:"either"     },
  { id:"cucumber",   name:"Cucumber",         type:"vegetable", emoji:"🥒", color:"#3a7a58", dth:60,  spacing:"2/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"either"     },
  { id:"lettuce",    name:"Lettuce",          type:"vegetable", emoji:"🥬", color:"#6aaa40", dth:45,  spacing:"4/sqft",                                    defaultSpan:[1,1], careDefaults:{ harvest_check:2, pruning:null },                          plantingMethod:"either"     },
  { id:"spinach",    name:"Spinach",          type:"vegetable", emoji:"🌿", color:"#3a7a3a", dth:40,  spacing:"9/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"direct"     },
  { id:"kale",       name:"Kale",             type:"vegetable", emoji:"🥦", color:"#2a6030", dth:55,  spacing:"1/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"either"     },
  { id:"carrot",     name:"Carrot",           type:"vegetable", emoji:"🥕", color:"#e08a30", dth:70,  spacing:"16/sqft",                                   defaultSpan:[1,1], careDefaults:{ pruning:null },                                          plantingMethod:"direct"     },
  { id:"radish",     name:"Radish",           type:"vegetable", emoji:"🌰", color:"#c84060", dth:25,  spacing:"16/sqft",                                   defaultSpan:[1,1], careDefaults:{ pruning:null },                                          plantingMethod:"direct"     },
  { id:"bean",       name:"Green Bean",       type:"vegetable", emoji:"🫘", color:"#5a9a40", dth:55,  spacing:"9/sqft",                                    defaultSpan:[1,1], careDefaults:{ pruning:null },                                          plantingMethod:"direct"     },
  { id:"pea",        name:"Pea",              type:"vegetable", emoji:"🫛", color:"#7aaa50", dth:65,  spacing:"8/sqft",                                    defaultSpan:[1,1], careDefaults:{ pruning:null },                                          plantingMethod:"direct"     },
  { id:"broccoli",   name:"Broccoli",         type:"vegetable", emoji:"🥦", color:"#3a5830", dth:80,  spacing:"1/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"transplant" },
  { id:"onion",      name:"Onion",            type:"vegetable", emoji:"🧅", color:"#c49030", dth:100, spacing:"4/sqft",                                    defaultSpan:[1,1], careDefaults:{ pruning:null },                                          plantingMethod:"either"     },
  { id:"garlic",     name:"Garlic",           type:"vegetable", emoji:"🧄", color:"#c4b060", dth:240, spacing:"4/sqft",                                    defaultSpan:[1,1], careDefaults:{ fertilizing:21, pruning:null, harvest_check:14 },         plantingMethod:"direct"     },
  { id:"eggplant",   name:"Eggplant",         type:"vegetable", emoji:"🍆", color:"#7040a0", dth:80,  spacing:"1/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"transplant" },
  { id:"corn",       name:"Corn",             type:"vegetable", emoji:"🌽", color:"#d8b030", dth:80,  spacing:"1/sqft",   notes:"Plant in blocks",          defaultSpan:[1,1], careDefaults:{ fertilizing:10, pest_check:5 },                          plantingMethod:"direct"     },
  { id:"bsquash",    name:"Butternut Squash", type:"vegetable", emoji:"🎃", color:"#d08030", dth:110, spacing:"1/4sqft",  notes:"Vines need space",         defaultSpan:[2,2], careDefaults:{ harvest_check:5 },                                       plantingMethod:"either"     },
  { id:"beet",       name:"Beet",             type:"vegetable", emoji:"🟣", color:"#a03060", dth:55,  spacing:"9/sqft",                                    defaultSpan:[1,1], careDefaults:{ pruning:null },                                          plantingMethod:"direct"     },
  { id:"chard",      name:"Swiss Chard",      type:"vegetable", emoji:"🌿", color:"#c04040", dth:50,  spacing:"4/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"either"     },
  // Additional vegetables
  { id:"cauliflower",name:"Cauliflower",      type:"vegetable", emoji:"🥦", color:"#e8e8d0", dth:80,  spacing:"1/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"transplant" },
  { id:"bsprouts",   name:"Brussels Sprouts", type:"vegetable", emoji:"🥦", color:"#3a6028", dth:90,  spacing:"1/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"transplant" },
  { id:"bokchoy",    name:"Bok Choy",         type:"vegetable", emoji:"🥬", color:"#4a9040", dth:45,  spacing:"4/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"either"     },
  { id:"arugula",    name:"Arugula",          type:"vegetable", emoji:"🌿", color:"#5a9a38", dth:40,  spacing:"4/sqft",   notes:"Bolts in heat",            defaultSpan:[1,1], careDefaults:{ harvest_check:2 },                                       plantingMethod:"direct"     },
  { id:"leek",       name:"Leek",             type:"vegetable", emoji:"🧅", color:"#7aaa50", dth:120, spacing:"9/sqft",                                    defaultSpan:[1,1], careDefaults:{ pruning:null },                                          plantingMethod:"transplant" },
  { id:"okra",       name:"Okra",             type:"vegetable", emoji:"🌿", color:"#6a9030", dth:60,  spacing:"1/sqft",                                    defaultSpan:[1,1], careDefaults:{ harvest_check:2 },                                       plantingMethod:"either"     },
  { id:"sweetpotato",name:"Sweet Potato",     type:"vegetable", emoji:"🍠", color:"#c06030", dth:110, spacing:"1/4sqft",  notes:"Vines spread widely",      defaultSpan:[2,2], careDefaults:{ pruning:null },                                          plantingMethod:"transplant" },
  { id:"pumpkin",    name:"Pumpkin",          type:"vegetable", emoji:"🎃", color:"#e07030", dth:100, spacing:"1/4sqft",  notes:"Needs lots of space",      defaultSpan:[2,2],                                                                        plantingMethod:"either"     },
  { id:"turnip",     name:"Turnip",           type:"vegetable", emoji:"🟣", color:"#9060a0", dth:50,  spacing:"9/sqft",                                    defaultSpan:[1,1], careDefaults:{ pruning:null },                                          plantingMethod:"direct"     },

  // ── Herbs ─────────────────────────────────────────────────────────────────
  { id:"basil",      name:"Basil",            type:"herb",      emoji:"🌿", color:"#4a8c30", dth:30,  spacing:"4/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"either"     },
  { id:"parsley",    name:"Parsley",          type:"herb",      emoji:"🌿", color:"#3a7c30", dth:75,  spacing:"4/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"either"     },
  { id:"cilantro",   name:"Cilantro",         type:"herb",      emoji:"🌿", color:"#5a8c40", dth:50,  spacing:"4/sqft",   notes:"Bolts in heat",            defaultSpan:[1,1],                                                                        plantingMethod:"direct"     },
  { id:"mint",       name:"Mint",             type:"herb",      emoji:"🌿", color:"#3aaa70", dth:60,  spacing:"1/sqft",   notes:"Keep in containers",       defaultSpan:[1,1], careDefaults:{ pruning:7 }, conflictsWithAll:true,                      plantingMethod:"transplant" },
  { id:"rosemary",   name:"Rosemary",         type:"herb",      emoji:"🌿", color:"#5a7040", dth:180, spacing:"1/sqft",                                    defaultSpan:[1,1], careDefaults:{ watering:4, fertilizing:30 },                            plantingMethod:"transplant" },
  { id:"thyme",      name:"Thyme",            type:"herb",      emoji:"🌿", color:"#6a7a50", dth:90,  spacing:"4/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"either"     },
  { id:"dill",       name:"Dill",             type:"herb",      emoji:"🌿", color:"#8aaa50", dth:70,  spacing:"2/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"direct"     },
  { id:"chive",      name:"Chives",           type:"herb",      emoji:"🌿", color:"#6a9a40", dth:60,  spacing:"4/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"either"     },
  // Additional herbs
  { id:"oregano",    name:"Oregano",          type:"herb",      emoji:"🌿", color:"#7a8040", dth:90,  spacing:"4/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"either"     },
  { id:"sage",       name:"Sage",             type:"herb",      emoji:"🌿", color:"#8a9a68", dth:75,  spacing:"1/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"either"     },
  { id:"tarragon",   name:"Tarragon",         type:"herb",      emoji:"🌿", color:"#6a8850", dth:60,  spacing:"2/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"transplant" },
  { id:"lemonbalm",  name:"Lemon Balm",       type:"herb",      emoji:"🌿", color:"#a0c840", dth:60,  spacing:"1/sqft",   notes:"Can spread aggressively",  defaultSpan:[1,1],                                                                        plantingMethod:"transplant" },

  // ── Flowers ───────────────────────────────────────────────────────────────
  { id:"sunflower",  name:"Sunflower",        type:"flower",    emoji:"🌻", color:"#d8b430", dth:80,  spacing:"1/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"direct"     },
  { id:"marigold",   name:"Marigold",         type:"flower",    emoji:"🌼", color:"#e08030", dth:50,  spacing:"4/sqft",   notes:"Pest deterrent",           defaultSpan:[1,1], careDefaults:{ pruning:7 },                                             plantingMethod:"either"     },
  { id:"nasturtium", name:"Nasturtium",       type:"flower",    emoji:"🌸", color:"#d05030", dth:55,  spacing:"4/sqft",   notes:"Edible flowers",           defaultSpan:[1,1],                                                                        plantingMethod:"direct"     },
  { id:"zinnia",     name:"Zinnia",           type:"flower",    emoji:"💐", color:"#d04080", dth:60,  spacing:"4/sqft",                                    defaultSpan:[1,1], careDefaults:{ pruning:7 },                                             plantingMethod:"either"     },
  { id:"lavender",   name:"Lavender",         type:"flower",    emoji:"💜", color:"#8050b0", dth:90,  spacing:"1/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"transplant" },
  { id:"cosmos",     name:"Cosmos",           type:"flower",    emoji:"🌸", color:"#d060a0", dth:60,  spacing:"4/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"direct"     },
  { id:"dahlia",     name:"Dahlia",           type:"flower",    emoji:"🌺", color:"#c04050", dth:90,  spacing:"1/sqft",                                    defaultSpan:[1,1],                                                                        plantingMethod:"transplant" },
  { id:"borage",     name:"Borage",           type:"flower",    emoji:"🌸", color:"#5060d0", dth:55,  spacing:"1/sqft",   notes:"Attracts pollinators",     defaultSpan:[1,1],                                                                        plantingMethod:"direct"     },
  // Additional flowers
  { id:"echinacea",  name:"Echinacea",        type:"flower",    emoji:"🌸", color:"#c060a0", dth:365, spacing:"1/sqft",   notes:"Perennial — slow first yr",defaultSpan:[1,1], careDefaults:{ fertilizing:30, harvest_check:null },                    plantingMethod:"either"     },
  { id:"blackeyed",  name:"Black-Eyed Susan", type:"flower",    emoji:"🌼", color:"#d8a020", dth:90,  spacing:"2/sqft",                                    defaultSpan:[1,1], careDefaults:{ harvest_check:null },                                    plantingMethod:"either"     },

  // ── Fruits ────────────────────────────────────────────────────────────────
  { id:"strawberry", name:"Strawberry",       type:"fruit",     emoji:"🍓", color:"#e03040", dth:90,  spacing:"4/sqft",                                    defaultSpan:[1,1], careDefaults:{ harvest_check:2 },                                       plantingMethod:"transplant" },
  { id:"watermelon", name:"Watermelon",       type:"fruit",     emoji:"🍉", color:"#3a9040", dth:80,  spacing:"1/4sqft",  notes:"Needs lots of space",      defaultSpan:[2,2], careDefaults:{ harvest_check:3 },                                       plantingMethod:"either"     },
  { id:"cantaloupe", name:"Cantaloupe",       type:"fruit",     emoji:"🍈", color:"#d0b060", dth:85,  spacing:"1/4sqft",  notes:"Needs lots of space",      defaultSpan:[2,2], careDefaults:{ harvest_check:3 },                                       plantingMethod:"either"     },
  { id:"raspberry",  name:"Raspberry",        type:"fruit",     emoji:"🫐", color:"#c03060", dth:365, spacing:"2/sqft",   notes:"Perennial — prune canes",  defaultSpan:[1,1], careDefaults:{ pruning:14, harvest_check:2 },                           plantingMethod:"transplant" },
  { id:"blueberry",  name:"Blueberry",        type:"fruit",     emoji:"🫐", color:"#4040c0", dth:365, spacing:"1/sqft",   notes:"Perennial — needs acidic soil", defaultSpan:[1,1], careDefaults:{ harvest_check:2 },                               plantingMethod:"transplant" },
];

// Bidirectional conflict pairs — order doesn't matter.
// Mint is handled separately via conflictsWithAll: true on the plant object.
export const COMPANION_CONFLICTS = [
  // Tomato conflicts
  ["tomato",     "broccoli"],      // brassicas suppress tomato growth
  ["tomato",     "cauliflower"],
  ["tomato",     "bsprouts"],
  ["tomato",     "fennel"],        // fennel is allelopathic to most plants
  ["tomato",     "potato"],        // share blight; keep separated

  // Fennel is allelopathic to most vegetables
  ["fennel",     "pepper"],
  ["fennel",     "basil"],
  ["fennel",     "cucumber"],
  ["fennel",     "eggplant"],

  // Alliums suppress legumes
  ["onion",      "bean"],
  ["onion",      "pea"],
  ["garlic",     "bean"],
  ["garlic",     "pea"],

  // Potato conflicts
  ["potato",     "cucumber"],      // stunts both crops
  ["potato",     "pumpkin"],
  ["potato",     "bsquash"],

  // Dill vs carrot (mature dill inhibits carrot germination)
  ["dill",       "carrot"],
];
