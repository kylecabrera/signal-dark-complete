// Signal Dark v2 — Game Configuration
// All tuneable values live here. Edit and restart server to apply.
// Admin panel can override per-session values stored in DB.

const CONFIG = {

  // ─────────────────────────────────────────────
  // Turn structure
  // ─────────────────────────────────────────────
  ACTIONS_PER_TURN: 2,
  TURN_TIMEOUT_SECONDS: 300,
  MAX_PLAYERS: 4,
  STARTING_CREDITS: 5,

  // ─────────────────────────────────────────────
  // Win/lose thresholds (legacy — now uses planet control instead)
  // ─────────────────────────────────────────────
  REBELLION_WIN_THRESHOLD: 100,
  EMPIRE_LOSE_THRESHOLD: 100,

  // ─────────────────────────────────────────────
  // Loyalty system (per-planet control mechanic)
  // ─────────────────────────────────────────────
  LOYALTY_DELTAS: {
    recruit: -3,
    incite: -10,
    sabotage: -8,
    earn_money: -1,    // Light-side gathering has minimal impact
    steal_money: -2,   // Theft attracts more attention
  },

  // ─────────────────────────────────────────────
  // Money earning actions
  // ─────────────────────────────────────────────
  EARN_MONEY: {
    earn_money: {
      name: 'Earn Money',
      alignment: 3,         // Light side action
      description: 'Generate income through honest work and trade',
      percentOfEconomy: 0.5,  // Get 50% of planet\'s economic output (random 0-50%)
    },
    steal_money: {
      name: 'Steal Money',
      alignment: -4,        // Dark side action
      description: 'Steal credits through criminal activity',
      percentOfEconomy: 0.8, // Get 80% of planet\'s economic output (random 0-80%)
    },
  },
  LOYALTY_RESET: {
    rebel: 20,
    faction: 20,
    empire: 80,
  },

  // ─────────────────────────────────────────────
  // Planet economic output (production points per round)
  // Editable per planet in admin panel
  // ─────────────────────────────────────────────
  PLANET_ECON: {
    p01: { output: 4, capacity: 7, label: 'Aargau' },
    p02: { output: 2, capacity: 4, label: 'Abregado-rae' },
    p03: { output: 1, capacity: 3, label: 'Agamar' },
    p04: { output: 2, capacity: 4, label: 'Aleron' },
    p05: { output: 1, capacity: 3, label: 'Almania' },
    p06: { output: 5, capacity: 8, label: 'Alsakan' },
    p07: { output: 1, capacity: 3, label: 'Alzoc III' },
    p08: { output: 1, capacity: 3, label: 'Ando' },
    p09: { output: 1, capacity: 3, label: 'Ansion' },
    p10: { output: 1, capacity: 3, label: 'Aridus' },
    p11: { output: 0, capacity: 2, label: 'Arkania' },
    p12: { output: 3, capacity: 6, label: 'Arkanis' },
    p13: { output: 3, capacity: 6, label: 'Axum' },
    p14: { output: 4, capacity: 7, label: 'Bakura' },
    p15: { output: 3, capacity: 5, label: 'Balmorra' },
    p16: { output: 1, capacity: 3, label: 'Barnaba' },
    p17: { output: 3, capacity: 5, label: 'Bastion' },
    p18: { output: 2, capacity: 4, label: 'Batonn' },
    p19: { output: 3, capacity: 6, label: 'Bespin' },
    p20: { output: 2, capacity: 4, label: 'Bestine IV' },
    p21: { output: 2, capacity: 4, label: 'Bilbringi' },
    p22: { output: 4, capacity: 7, label: 'Bimmisaari' },
    p23: { output: 3, capacity: 5, label: 'Bonadan' },
    p24: { output: 2, capacity: 4, label: 'Borosk' },
    p25: { output: 2, capacity: 4, label: 'Botajef' },
    p26: { output: 2, capacity: 4, label: 'Bothawui' },
    p27: { output: 1, capacity: 3, label: 'Boz Pity' },
    p28: { output: 0, capacity: 2, label: 'Brigia' },
    p29: { output: 3, capacity: 5, label: 'Byblos' },
    p30: { output: 3, capacity: 5, label: 'Byss' },
    p31: { output: 2, capacity: 4, label: 'Carida' },
    p32: { output: 4, capacity: 7, label: 'Cato Neimoidia' },
    p33: { output: 3, capacity: 5, label: 'Centares' },
    p34: { output: 2, capacity: 4, label: 'Centrality' },
    p35: { output: 1, capacity: 3, label: 'Cerea' },
    p36: { output: 2, capacity: 4, label: 'Chandrila' },
    p37: { output: 5, capacity: 8, label: 'Christophsis' },
    p38: { output: 3, capacity: 5, label: 'Ciutric Hegemony' },
    p39: { output: 1, capacity: 3, label: 'Clak\'dor VII' },
    p40: { output: 2, capacity: 4, label: 'Commenor' },
    p41: { output: 2, capacity: 4, label: 'Cona' },
    p42: { output: 2, capacity: 4, label: 'Contruum' },
    p43: { output: 3, capacity: 6, label: 'Corellia' },
    p44: { output: 3, capacity: 5, label: 'Corulag' },
    p45: { output: 5, capacity: 8, label: 'Coruscant' },
    p46: { output: 1, capacity: 3, label: 'Cronese Mandate' },
    p47: { output: 3, capacity: 5, label: 'Csilla' },
    p48: { output: 3, capacity: 5, label: 'Dac' },
    p49: { output: 1, capacity: 3, label: 'Dantooine' },
    p50: { output: 4, capacity: 7, label: 'Deko Neimoidia' },
    p51: { output: 5, capacity: 8, label: 'Denon' },
    p52: { output: 2, capacity: 4, label: 'Desargorr' },
    p53: { output: 2, capacity: 4, label: 'Dolomar' },
    p54: { output: 2, capacity: 4, label: 'Dorin' },
    p55: { output: 3, capacity: 5, label: 'Drall' },
    p56: { output: 2, capacity: 4, label: 'Dubrillion' },
    p57: { output: 3, capacity: 5, label: 'Duro' },
    p58: { output: 3, capacity: 5, label: 'Elom' },
    p59: { output: 5, capacity: 8, label: 'Empress Teta' },
    p60: { output: 2, capacity: 4, label: 'Entralla' },
    p61: { output: 3, capacity: 5, label: 'Eriadu' },
    p62: { output: 2, capacity: 4, label: 'Esseles' },
    p63: { output: 2, capacity: 4, label: 'Ession' },
    p64: { output: 2, capacity: 4, label: 'Etti IV' },
    p65: { output: 2, capacity: 4, label: 'Falleen' },
    p66: { output: 3, capacity: 5, label: 'Fedalle' },
    p67: { output: 2, capacity: 4, label: 'Felucia' },
    p68: { output: 2, capacity: 4, label: 'Foerost' },
    p69: { output: 3, capacity: 5, label: 'Fondor' },
    p70: { output: 3, capacity: 6, label: 'Fresia' },
    p71: { output: 1, capacity: 3, label: 'Galantos' },
    p72: { output: 1, capacity: 3, label: 'Gand' },
    p73: { output: 3, capacity: 5, label: 'Ganthel' },
    p74: { output: 2, capacity: 4, label: 'Garel' },
    p75: { output: 2, capacity: 4, label: 'Garnib' },
    p76: { output: 3, capacity: 5, label: 'Garos IV' },
    p77: { output: 0, capacity: 2, label: 'Geonosis' },
    p78: { output: 5, capacity: 8, label: 'Gerrenthum ' },
    p79: { output: 2, capacity: 4, label: 'Giju' },
    p80: { output: 2, capacity: 4, label: 'Glee Anselm' },
    p81: { output: 5, capacity: 8, label: 'Grizmallt' },
    p82: { output: 1, capacity: 3, label: 'Gyndine' },
    p83: { output: 3, capacity: 5, label: 'Hapes Consortium' },
    p84: { output: 1, capacity: 3, label: 'Haruun Kal' },
    p85: { output: 2, capacity: 4, label: 'Ibaar' },
    p86: { output: 2, capacity: 4, label: 'Iphigin' },
    p87: { output: 2, capacity: 4, label: 'Iridonia' },
    p88: { output: 3, capacity: 5, label: 'Ithor' },
    p89: { output: 0, capacity: 2, label: 'Jakku' },
    p90: { output: 2, capacity: 4, label: 'Javin' },
    p91: { output: 2, capacity: 4, label: 'Kalarba' },
    p92: { output: 3, capacity: 6, label: 'Kamino' },
    p93: { output: 3, capacity: 6, label: 'Kashyyyk' },
    p94: { output: 3, capacity: 5, label: 'Kattada' },
    p95: { output: 2, capacity: 4, label: 'Khomm' },
    p96: { output: 3, capacity: 5, label: 'Kijimi' },
    p97: { output: 4, capacity: 7, label: 'Kuat' },
    p98: { output: 3, capacity: 5, label: 'Lantillies' },
    p99: { output: 5, capacity: 8, label: 'Lianna' },
    p100: { output: 4, capacity: 7, label: 'Loronar' },
    p101: { output: 2, capacity: 4, label: 'Lothal' },
    p102: { output: 0, capacity: 2, label: 'Lwhekk' },
    p103: { output: 2, capacity: 4, label: 'Malastare' },
    p104: { output: 0, capacity: 2, label: 'Manaan' },
    p105: { output: 2, capacity: 4, label: 'Mandalore' },
    p106: { output: 0, capacity: 2, label: 'Maridun' },
    p107: { output: 5, capacity: 8, label: 'Metellos' },
    p108: { output: 3, capacity: 6, label: 'Minntooine' },
    p109: { output: 1, capacity: 3, label: 'Moraga' },
    p110: { output: 3, capacity: 5, label: 'Mrlsst' },
    p111: { output: 4, capacity: 7, label: 'Muunilinst' },
    p112: { output: 4, capacity: 7, label: 'Mygeeto' },
    p113: { output: 1, capacity: 3, label: 'N\'Zoth' },
    p114: { output: 4, capacity: 7, label: 'Naboo' },
    p115: { output: 1, capacity: 3, label: 'Nal Hutta' },
    p116: { output: 5, capacity: 8, label: 'Nar Shaddaa' },
    p117: { output: 3, capacity: 5, label: 'Narg' },
    p118: { output: 3, capacity: 5, label: 'Neimoidia' },
    p119: { output: 3, capacity: 5, label: 'Nubia' },
    p120: { output: 2, capacity: 4, label: 'Obroa-skai' },
    p121: { output: 2, capacity: 4, label: 'Onderon' },
    p122: { output: 3, capacity: 5, label: 'Ord Mantell' },
    p123: { output: 2, capacity: 4, label: 'Ord Trasi' },
    p124: { output: 2, capacity: 4, label: 'Orinda' },
    p125: { output: 3, capacity: 5, label: 'Prakith' },
    p126: { output: 2, capacity: 4, label: 'Raithal' },
    p127: { output: 3, capacity: 5, label: 'Ralltiir' },
    p128: { output: 5, capacity: 8, label: 'Rendili' },
    p129: { output: 3, capacity: 6, label: 'Rhinnal ' },
    p130: { output: 2, capacity: 4, label: 'Rishi' },
    p131: { output: 2, capacity: 4, label: 'Roche' },
    p132: { output: 3, capacity: 5, label: 'Rodia' },
    p133: { output: 3, capacity: 5, label: 'Rothana' },
    p134: { output: 1, capacity: 3, label: 'Ryloth' },
    p135: { output: 3, capacity: 5, label: 'Saleucami' },
    p136: { output: 2, capacity: 4, label: 'Salliche' },
    p137: { output: 4, capacity: 7, label: 'Sarapin' },
    p138: { output: 2, capacity: 4, label: 'Sedri' },
    p139: { output: 2, capacity: 4, label: 'Selonia' },
    p140: { output: 1, capacity: 3, label: 'Sernpidal' },
    p141: { output: 3, capacity: 5, label: 'Shawken' },
    p142: { output: 1, capacity: 3, label: 'Shili' },
    p143: { output: 5, capacity: 8, label: 'Skako' },
    p144: { output: 2, capacity: 4, label: 'Skor II' },
    p145: { output: 3, capacity: 6, label: 'Skye' },
    p146: { output: 2, capacity: 4, label: 'Sluis Van' },
    p147: { output: 3, capacity: 5, label: 'Socorro' },
    p148: { output: 2, capacity: 4, label: 'Sullust' },
    p149: { output: 3, capacity: 5, label: 'Taanab' },
    p150: { output: 2, capacity: 4, label: 'Takodana' },
    p151: { output: 3, capacity: 5, label: 'Tallaan' },
    p152: { output: 2, capacity: 4, label: 'Taris' },
    p153: { output: 2, capacity: 4, label: 'Tatooine' },
    p154: { output: 2, capacity: 4, label: 'Telos IV' },
    p155: { output: 3, capacity: 6, label: 'Tepasi' },
    p156: { output: 0, capacity: 2, label: 'Terminus' },
    p157: { output: 2, capacity: 4, label: 'Teyr' },
    p158: { output: 4, capacity: 7, label: 'Thyferra' },
    p159: { output: 2, capacity: 4, label: 'Tibrin' },
    p160: { output: 2, capacity: 4, label: 'Tion Hegemony' },
    p161: { output: 3, capacity: 6, label: 'Tirahnn' },
    p162: { output: 3, capacity: 5, label: 'Toydaria' },
    p163: { output: 1, capacity: 3, label: 'Trandosha' },
    p164: { output: 1, capacity: 3, label: 'Umbara' },
    p165: { output: 3, capacity: 6, label: 'Vandelhelm' },
    p166: { output: 2, capacity: 4, label: 'Woostri' },
    p167: { output: 2, capacity: 4, label: 'Yaga Minor' },
    p168: { output: 3, capacity: 5, label: 'Zeltros' },
    p169: { output: 2, capacity: 4, label: 'Zygerria' },
  },

  // ─────────────────────────────────────────────
  // Unit types
  // cost        = production points to build
  // buildTime   = rounds until complete
  // strength    = combat dice / attack value  (derived from median GT output)
  // hp          = hits before destroyed       (derived from median purchase cost, log-scaled)
  // jumpDistance    = hyperlane hops per move (derived from median hyperdrive class)
  // transportCapacity = friendly units carried (derived from median passenger capacity)
  // designation = display label shown in UI
  // ─────────────────────────────────────────────
  UNIT_TYPES: {

    // ── Orbital capital ships ─────────────────────────────────────────────
    // Fleet costs doubled for strategic balance
    worldship: {
      label: 'Worldship', designation: 'Worldship',
      cost: 40, buildTime: 4, strength: 20, hp: 10,
      canOrbit: true, canSurface: false, hidden: false,
      jumpDistance: 1, transportCapacity: 20,
      description: 'Massive mobile habitat. Nearly unstoppable. Extreme cost.',
    },
    star_dreadnought: {
      label: 'Star Dreadnought', designation: 'Star Dreadnought',
      cost: 28, buildTime: 3, strength: 13, hp: 7,
      canOrbit: true, canSurface: false, hidden: false,
      jumpDistance: 2, transportCapacity: 20,
      description: 'Capital supership. Dominant in fleet engagements.',
    },
    battlecruiser: {
      label: 'Battlecruiser', designation: 'Battlecruiser',
      cost: 24, buildTime: 3, strength: 11, hp: 6,
      canOrbit: true, canSurface: false, hidden: false,
      jumpDistance: 2, transportCapacity: 10,
      description: 'Heavy capital ship. Strong firepower and troop capacity.',
    },
    star_destroyer: {
      label: 'Star Destroyer', designation: 'Star Destroyer',
      cost: 22, buildTime: 2, strength: 10, hp: 5,
      canOrbit: true, canSurface: false, hidden: false,
      jumpDistance: 2, transportCapacity: 10,
      description: 'Backbone of Empire fleet operations.',
    },
    heavy_cruiser: {
      label: 'Heavy Cruiser', designation: 'Heavy Cruiser',
      cost: 22, buildTime: 2, strength: 9, hp: 5,
      canOrbit: true, canSurface: false, hidden: false,
      jumpDistance: 2, transportCapacity: 5,
      description: 'Heavy warship. Effective against capital ships.',
    },
    cruiser: {
      label: 'Cruiser', designation: 'Cruiser',
      cost: 20, buildTime: 2, strength: 8, hp: 5,
      canOrbit: true, canSurface: false, hidden: false,
      jumpDistance: 2, transportCapacity: 5,
      description: 'Standard warship. Versatile fleet combatant.',
    },
    space_station: {
      label: 'Space Station', designation: 'Space Station',
      cost: 22, buildTime: 3, strength: 9, hp: 6,
      canOrbit: true, canSurface: false, hidden: false,
      jumpDistance: 0, transportCapacity: 10,
      description: 'Immobile fortified platform. Cannot jump. Strong defence.',
    },
    frigate: {
      label: 'Frigate', designation: 'Frigate',
      cost: 18, buildTime: 2, strength: 7, hp: 5,
      canOrbit: true, canSurface: false, hidden: false,
      jumpDistance: 2, transportCapacity: 2,
      description: 'Fast warship. Effective patrol and escort role.',
    },
    corvette: {
      label: 'Corvette', designation: 'Corvette',
      cost: 16, buildTime: 2, strength: 6, hp: 4,
      canOrbit: true, canSurface: false, hidden: false,
      jumpDistance: 2, transportCapacity: 2,
      description: 'Nimble escort. Efficient anti-fighter platform.',
    },

    // ── Logistics / transport (orbit) ─────────────────────────────────────
    freighter: {
      label: 'Freighter', designation: 'Freighter',
      cost: 8, buildTime: 2, strength: 5, hp: 4,
      canOrbit: true, canSurface: false, hidden: true,
      jumpDistance: 2, transportCapacity: 2,
      description: 'Civilian cargo hauler. Hidden from governors.',
    },
    large_transport: {
      label: 'Large Transport', designation: 'Large Transport',
      cost: 4, buildTime: 1, strength: 3, hp: 2,
      canOrbit: true, canSurface: false, hidden: false,
      jumpDistance: 2, transportCapacity: 2,
      description: 'Heavy logistics vessel.',
    },
    small_transport: {
      label: 'Small Transport', designation: 'Small Transport',
      cost: 6, buildTime: 1, strength: 1, hp: 3,
      canOrbit: true, canSurface: false, hidden: true,
      jumpDistance: 2, transportCapacity: 2,
      description: 'Light transport. Hidden. Moves rebel forces covertly.',
    },
    landing_ship: {
      label: 'Landing Ship', designation: 'Landing Ship',
      cost: 4, buildTime: 1, strength: 4, hp: 2,
      canOrbit: true, canSurface: true, hidden: false,
      jumpDistance: 2, transportCapacity: 2,
      description: 'Assault lander. Can deploy from orbit to surface.',
    },

    // ── Starfighters (orbit, small) ──────────────────────────────────────
    large_starfighter: {
      label: 'Heavy Fighter', designation: 'Heavy Fighter',
      cost: 6, buildTime: 1, strength: 4, hp: 3,
      canOrbit: true, canSurface: false, hidden: true,
      jumpDistance: 2, transportCapacity: 1,
      description: 'Heavy starfighter. Hidden until combat.',
    },
    starfighter: {
      label: 'Starfighter', designation: 'Starfighter',
      cost: 5, buildTime: 1, strength: 4, hp: 2,
      canOrbit: true, canSurface: false, hidden: true,
      jumpDistance: 2, transportCapacity: 1,
      description: 'Standard starfighter. Hidden. Fast and expendable.',
    },
    aerocraft: {
      label: 'Aerocraft', designation: 'Aerocraft',
      cost: 2, buildTime: 1, strength: 2, hp: 1,
      canOrbit: false, canSurface: true, hidden: true,
      jumpDistance: 0, transportCapacity: 1,
      description: 'Atmospheric fighter. Surface only. Cannot jump.',
    },


    // ── Individual named ships (from 19 ABY Unit List) ────────────────────

    // Worldship
    death_star_ii: { label: 'Death Star II', designation: 'Battlestation', cost: 40, buildTime: 4, strength: 20, hp: 10, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 20, description: 'Death Star II (Worldship).',  imperialOnly: true, requiredPlanetTypes: ['Core Worlds','Deep Core'],},
    worldcraft_ii: { label: 'Worldcraft II', designation: 'Habitation Sphere', cost: 40, buildTime: 4, strength: 17, hp: 10, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 20, description: 'Worldcraft II (Worldship).',  requiredPlanetTypes: ['Core Worlds','Deep Core'],},
    worldcraft: { label: 'Worldcraft', designation: 'Habitation Sphere', cost: 40, buildTime: 4, strength: 20, hp: 10, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 20, description: 'Worldcraft (Worldship).',  requiredPlanetTypes: ['Core Worlds','Deep Core'], requiredPlanetIds: ['p45'],},

    // Star Dreadnought
    assertor: { label: 'Assertor', designation: 'Star Dreadnought', cost: 30, buildTime: 3, strength: 12, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 20, description: 'Assertor (Star Dreadnought).',  imperialOnly: true, requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    bellator: { label: 'Bellator', designation: 'Star Dreadnought', cost: 28, buildTime: 3, strength: 14, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 20, description: 'Bellator (Star Dreadnought).',  imperialOnly: true, requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    executor: { label: 'Executor', designation: 'Star Dreadnought', cost: 32, buildTime: 4, strength: 14, hp: 8, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 20, description: 'Executor (Star Dreadnought).',  imperialOnly: true, requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    mandator_i: { label: 'Mandator I', designation: 'Star Dreadnought', cost: 28, buildTime: 3, strength: 13, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 20, description: 'Mandator I (Star Dreadnought).',  imperialOnly: true, requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    mandator_ii: { label: 'Mandator II', designation: 'Star Dreadnought', cost: 28, buildTime: 3, strength: 13, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 20, description: 'Mandator II (Star Dreadnought).',  imperialOnly: true, requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    mandator_iii: { label: 'Mandator III', designation: 'Star Dreadnought', cost: 28, buildTime: 3, strength: 13, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 20, description: 'Mandator III (Star Dreadnought).',  imperialOnly: true, requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    mandator_iv: { label: 'Mandator IV', designation: 'Siege Dreadnought', cost: 14, buildTime: 3, strength: 14, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 20, description: 'Mandator IV (Star Dreadnought).',  imperialOnly: true, requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    praetor_mk_ii: { label: 'Praetor Mk. II', designation: 'Battlecruiser', cost: 24, buildTime: 3, strength: 12, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 20, description: 'Praetor Mk. II (Star Dreadnought).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    starhawk: { label: 'Starhawk', designation: 'Battleship', cost: 30, buildTime: 3, strength: 10, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 10, description: 'Starhawk (Star Dreadnought).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'], requiredPlanetIds: ['p148'],},
    torpedo_sphere: { label: 'Torpedo Sphere', designation: 'Star Dreadnought', cost: 24, buildTime: 3, strength: 12, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 10, description: 'Torpedo Sphere (Star Dreadnought).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'], requiredPlanetIds: ['p100'],},
    viscount: { label: 'Viscount', designation: 'Star Defender', cost: 16, buildTime: 4, strength: 13, hp: 8, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 20, description: 'Viscount (Star Dreadnought).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    warspite_class: { label: 'Warspite-class', designation: 'Battleship', cost: 28, buildTime: 3, strength: 13, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Warspite-class (Star Dreadnought).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},

    // Battlecruiser
    spirit_of_endor: { label: 'Spirit of Endor', designation: 'Expeditionary Carrier', cost: 24, buildTime: 3, strength: 9, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Spirit of Endor (Battlecruiser).',  imperialOnly: true, requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    allegiance: { label: 'Allegiance', designation: 'Battlecruiser', cost: 24, buildTime: 3, strength: 10, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Allegiance (Battlecruiser).',  imperialOnly: true, requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    bulwark_mk_iii: { label: 'Bulwark Mk. III', designation: 'Battlecruiser', cost: 22, buildTime: 3, strength: 11, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 20, description: 'Bulwark Mk. III (Battlecruiser).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    evakmar_kdy: { label: 'Evakmar-KDY', designation: 'Transport', cost: 14, buildTime: 3, strength: 8, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 20, description: 'Evakmar-KDY (Battlecruiser).',  imperialOnly: true, requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    lucrehulk: { label: 'Lucrehulk', designation: 'Battleship', cost: 28, buildTime: 3, strength: 12, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 20, description: 'Lucrehulk (Battlecruiser).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    mc80_home_one: { label: 'MC80 "Home One"', designation: 'Star Cruiser', cost: 28, buildTime: 3, strength: 11, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'MC80 "Home One" (Battlecruiser).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'], requiredPlanetIds: ['p48'],},
    mc85_raddus: { label: 'MC85 Raddus', designation: 'Command Cruiser', cost: 26, buildTime: 3, strength: 11, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'MC85 Raddus (Battlecruiser).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'], requiredPlanetIds: ['p48'],},
    procurator_ii_class_battlecruiser: { label: 'Procurator II-class Battlecruiser', designation: 'Battlecruiser', cost: 24, buildTime: 3, strength: 11, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Procurator II-class Battlecruiser (Battlecruiser).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'],},
    sovereign: { label: 'Sovereign', designation: 'Battlecruiser', cost: 24, buildTime: 3, strength: 11, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Sovereign (Battlecruiser).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'], requiredPlanetIds: ['p100'],},
    sovereign_refit: { label: 'Sovereign Refit', designation: 'Battlecruiser', cost: 24, buildTime: 3, strength: 12, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Sovereign Refit (Battlecruiser).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'], requiredPlanetIds: ['p100'],},
    viscount_class_star_defender: { label: 'Viscount-Class Star Defender', designation: 'Battlecruiser', cost: 28, buildTime: 3, strength: 14, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 20, description: 'Viscount-Class Star Defender (Battlecruiser).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim'], requiredPlanetIds: ['p48'],},

    // Star Destroyer
    citadel: { label: 'Citadel', designation: 'Fleet Carrier', cost: 11, buildTime: 3, strength: 9, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Citadel (Star Destroyer).', },
    crimson_victory: { label: 'Crimson Victory', designation: 'Star Destroyer', cost: 20, buildTime: 2, strength: 10, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Crimson Victory (Star Destroyer).', },
    dauntless: { label: 'Dauntless', designation: 'Heavy Cruiser', cost: 22, buildTime: 3, strength: 11, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Dauntless (Star Destroyer).', },
    endurance: { label: 'Endurance', designation: 'Fleet Carrier', cost: 11, buildTime: 2, strength: 7, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Endurance (Star Destroyer).', },
    imperial_i: { label: 'Imperial I', designation: 'Star Destroyer', cost: 22, buildTime: 3, strength: 10, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Imperial I (Star Destroyer).', },
    imperial_i_refit: { label: 'Imperial I Refit', designation: 'Star Destroyer', cost: 22, buildTime: 2, strength: 11, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Imperial I Refit (Star Destroyer).',  imperialOnly: true,},
    imperial_ii: { label: 'Imperial II', designation: 'Star Destroyer', cost: 24, buildTime: 3, strength: 11, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Imperial II (Star Destroyer).', },
    imperial_ii_refit: { label: 'Imperial II Refit', designation: 'Star Destroyer', cost: 22, buildTime: 3, strength: 11, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Imperial II Refit (Star Destroyer).',  imperialOnly: true,},
    interdictor: { label: 'Interdictor', designation: 'Star Destroyer', cost: 22, buildTime: 3, strength: 8, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Interdictor (Star Destroyer).',  imperialOnly: true,},
    keldabe: { label: 'Keldabe', designation: 'Battleship', cost: 20, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Keldabe (Star Destroyer).', },
    mc75: { label: 'MC75', designation: 'Star Cruiser', cost: 22, buildTime: 3, strength: 8, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'MC75 (Star Destroyer).',  requiredPlanetIds: ['p48'],},
    mc75a: { label: 'MC75a', designation: 'Star Carrier', cost: 11, buildTime: 2, strength: 7, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'MC75a (Star Destroyer).',  requiredPlanetIds: ['p48'],},
    mc80_liberty: { label: 'MC80 "Liberty"', designation: 'Star Cruiser', cost: 22, buildTime: 3, strength: 10, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'MC80 "Liberty" (Star Destroyer).',  requiredPlanetIds: ['p48'],},
    mc80a: { label: 'MC80a', designation: 'Star Cruiser', cost: 22, buildTime: 3, strength: 10, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'MC80a (Star Destroyer).',  requiredPlanetIds: ['p48'],},
    mc80b: { label: 'MC80b', designation: 'Star Cruiser', cost: 22, buildTime: 3, strength: 9, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'MC80b (Star Destroyer).',  requiredPlanetIds: ['p48'],},
    mc90: { label: 'MC90', designation: 'Star Cruiser', cost: 24, buildTime: 3, strength: 10, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'MC90 (Star Destroyer).',  requiredPlanetIds: ['p48'],},
    mc90_2: { label: 'MC90', designation: 'Heavy Star Cruiser', cost: 12, buildTime: 3, strength: 12, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'MC90 (Star Destroyer).', },
    nebula: { label: 'Nebula', designation: 'Star Defender', cost: 12, buildTime: 3, strength: 10, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Nebula (Star Destroyer).',  requiredPlanetIds: ['p70'],},
    nebula_2: { label: 'Nebula', designation: 'Star Defender', cost: 11, buildTime: 2, strength: 11, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Nebula (Star Destroyer).', },
    providence: { label: 'Providence', designation: 'Destroyer', cost: 11, buildTime: 2, strength: 10, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 20, description: 'Providence (Star Destroyer).', },
    providence_ii: { label: 'Providence II', designation: 'Destroyer', cost: 11, buildTime: 2, strength: 10, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Providence II (Star Destroyer).', },
    recusant: { label: 'Recusant', designation: 'Light Destroyer', cost: 11, buildTime: 3, strength: 9, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Recusant (Star Destroyer).', },
    republic: { label: 'Republic', designation: 'Star Destroyer', cost: 22, buildTime: 2, strength: 10, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Republic (Star Destroyer).', },
    secutor: { label: 'Secutor', designation: 'Star Destroyer', cost: 20, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 20, description: 'Secutor (Star Destroyer).', },
    tector: { label: 'Tector', designation: 'Star Destroyer', cost: 22, buildTime: 2, strength: 11, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Tector (Star Destroyer).', },
    tector_ii: { label: 'Tector II', designation: 'Star Destroyer', cost: 22, buildTime: 3, strength: 11, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Tector II (Star Destroyer).',  requiredPlanetIds: ['p59'],},
    venator: { label: 'Venator', designation: 'Star Destroyer', cost: 22, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Venator (Star Destroyer).', },
    victory_i: { label: 'Victory I', designation: 'Star Destroyer', cost: 22, buildTime: 2, strength: 11, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Victory I (Star Destroyer).',  requiredPlanetIds: ['p128'],},
    victory_ii: { label: 'Victory II', designation: 'Star Destroyer', cost: 20, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Victory II (Star Destroyer).',  requiredPlanetIds: ['p128'],},
    victory_iii: { label: 'Victory III', designation: 'Star Destroyer', cost: 22, buildTime: 2, strength: 12, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Victory III (Star Destroyer).',  imperialOnly: true,},
    victory_iii_2: { label: 'Victory III', designation: 'Star Destroyer', cost: 20, buildTime: 2, strength: 10, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Victory III (Star Destroyer).', },

    // Space Station
    boonta: { label: 'Boonta', designation: 'Asteroid Base', cost: 11, buildTime: 3, strength: 7, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 0, transportCapacity: 10, description: 'Boonta (Space Station).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim','Expansion Region'], requiredPlanetIds: ['p115'],},
    golan_i: { label: 'Golan I', designation: 'Space Defense Platform', cost: 9, buildTime: 2, strength: 9, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 0, transportCapacity: 10, description: 'Golan I (Space Station).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim','Expansion Region'],},
    golan_ii: { label: 'Golan II', designation: 'Space Defense Platform', cost: 13, buildTime: 3, strength: 9, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 0, transportCapacity: 20, description: 'Golan II (Space Station).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim','Expansion Region'],},
    golan_iii: { label: 'Golan III', designation: 'Space Defense Platform', cost: 12, buildTime: 3, strength: 10, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 0, transportCapacity: 20, description: 'Golan III (Space Station).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim','Expansion Region'],},
    golan_iii_refit: { label: 'Golan III Refit', designation: 'Space Defense Platform', cost: 10, buildTime: 2, strength: 10, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 0, transportCapacity: 20, description: 'Golan III Refit (Space Station).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim','Expansion Region'],},
    gravity_well: { label: 'Gravity Well', designation: 'Station', cost: 11, buildTime: 3, strength: 9, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 0, transportCapacity: 5, description: 'Gravity Well (Space Station).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim','Expansion Region'], requiredPlanetIds: ['p32','p59'],},
    loronar_mk_1: { label: 'Loronar Mk. 1', designation: 'Orbital Defense Platform', cost: 10, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 0, transportCapacity: 5, description: 'Loronar Mk. 1 (Space Station).',  requiredPlanetTypes: ['Core Worlds','Deep Core','Colonies','Inner Rim','Expansion Region'], requiredPlanetIds: ['p100'],},

    // Heavy Cruiser
    acclamator: { label: 'Acclamator', designation: 'Battle Carrier', cost: 10, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Acclamator (Heavy Cruiser).',  imperialOnly: true,},
    acclamator_shield_upgrade: { label: 'Acclamator (Shield Upgrade)', designation: 'Battle Carrier', cost: 10, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Acclamator (Shield Upgrade) (Heavy Cruiser).',  imperialOnly: true,},
    acclamator_i: { label: 'Acclamator I', designation: 'Assault Ship', cost: 12, buildTime: 3, strength: 7, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 20, description: 'Acclamator I (Heavy Cruiser).',  imperialOnly: true,},
    acclamator_ii: { label: 'Acclamator II', designation: 'Assault Ship', cost: 12, buildTime: 3, strength: 8, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Acclamator II (Heavy Cruiser).',  imperialOnly: true,},
    acclamator_iii: { label: 'Acclamator III', designation: 'Assault Ship', cost: 11, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 20, description: 'Acclamator III (Heavy Cruiser).',  imperialOnly: true,},
    assault_frigate_mk_i: { label: 'Assault Frigate Mk I', designation: 'Cruiser', cost: 18, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Assault Frigate Mk I (Heavy Cruiser).', },
    assault_frigate_mk_ii: { label: 'Assault Frigate Mk II', designation: 'Cruiser', cost: 18, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Assault Frigate Mk II (Heavy Cruiser).', },
    aurora: { label: 'Aurora', designation: 'Freighter', cost: 11, buildTime: 3, strength: 7, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 20, description: 'Aurora (Heavy Cruiser).',  requiredPlanetIds: ['p98'],},
    bellerophon: { label: 'Bellerophon', designation: 'Heavy Cruiser', cost: 22, buildTime: 2, strength: 10, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Bellerophon (Heavy Cruiser).',  requiredPlanetIds: ['p100'],},
    defender: { label: 'Defender', designation: 'Assault Carrier', cost: 10, buildTime: 2, strength: 5, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'Defender (Heavy Cruiser).', },
    dreadnought: { label: 'Dreadnought', designation: 'Heavy Cruiser', cost: 16, buildTime: 2, strength: 8, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 10, description: 'Dreadnought (Heavy Cruiser).', },
    dreadnought_refit: { label: 'Dreadnought Refit', designation: 'Heavy Cruiser', cost: 18, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Dreadnought Refit (Heavy Cruiser).', },
    enforcer: { label: 'Enforcer', designation: 'Picket Cruiser', cost: 10, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Enforcer (Heavy Cruiser).', },
    halcyon: { label: 'Halcyon', designation: 'Cruiser', cost: 22, buildTime: 3, strength: 9, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Halcyon (Heavy Cruiser).',  imperialOnly: true,},
    immobilizer_418: { label: 'Immobilizer 418', designation: 'Cruiser', cost: 20, buildTime: 2, strength: 6, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Immobilizer 418 (Heavy Cruiser).', },
    imperial: { label: 'Imperial', designation: 'Cargo Ship', cost: 11, buildTime: 3, strength: 7, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 20, description: 'Imperial (Heavy Cruiser).',  imperialOnly: true,},
    ionizer: { label: 'Ionizer', designation: 'Assault Ship', cost: 11, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Ionizer (Heavy Cruiser).',  requiredPlanetIds: ['p59'],},
    ionizer_ii: { label: 'Ionizer II', designation: 'Assault Ship', cost: 11, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Ionizer II (Heavy Cruiser).',  requiredPlanetIds: ['p59'],},
    kontos: { label: 'Kontos', designation: 'Star Cruiser', cost: 22, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'Kontos (Heavy Cruiser).', },
    majestic: { label: 'Majestic', designation: 'Heavy Cruiser', cost: 22, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'Majestic (Heavy Cruiser).', },
    mc81_sphaerolana: { label: 'MC81 Sphaerolana', designation: 'Haeavy Cruiser', cost: 10, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'MC81 Sphaerolana (Heavy Cruiser).',  requiredPlanetIds: ['p48'],},
    munificent: { label: 'Munificent', designation: 'Star Frigate', cost: 13, buildTime: 3, strength: 9, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'Munificent (Heavy Cruiser).', },
    neutron_star: { label: 'Neutron Star', designation: 'Bulk Cruiser', cost: 9, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Neutron Star (Heavy Cruiser).', },
    vindicator: { label: 'Vindicator', designation: 'Heavy Cruiser', cost: 20, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Vindicator (Heavy Cruiser).', },
    vindicator_ii_class_heavy_cruiser: { label: 'Vindicator II-class Heavy Cruiser', designation: 'Heavy Cruiser', cost: 20, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Vindicator II-class Heavy Cruiser (Heavy Cruiser).', },

    // Cruiser
    belarus: { label: 'Belarus', designation: 'Medium Cruiser', cost: 9, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Belarus (Cruiser).', },
    boldness: { label: 'Boldness', designation: 'Trade Cruiser', cost: 9, buildTime: 2, strength: 7, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Boldness (Cruiser).', },
    broadside: { label: 'Broadside', designation: 'KDB-1 Cruiser', cost: 9, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Broadside (Cruiser).', },
    seahorse_class_supply_ship: { label: 'Seahorse-Class Supply Ship', designation: 'Fleet Tender', cost: 10, buildTime: 2, strength: 7, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'Seahorse-Class Supply Ship (Cruiser).', },
    contentor: { label: 'Contentor', designation: 'Fleet Tender', cost: 10, buildTime: 2, strength: 7, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Contentor (Cruiser).',  imperialOnly: true,},
    fulgor_class_light_cruiser: { label: 'Fulgor-class Light Cruiser', designation: 'Light Cruiser', cost: 10, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'Fulgor-class Light Cruiser (Cruiser).', },
    gladiator: { label: 'Gladiator', designation: 'Star Destroyer', cost: 20, buildTime: 2, strength: 7, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Gladiator (Cruiser).', },
    imperial_ii_2: { label: 'Imperial II', designation: 'Frigate', cost: 20, buildTime: 2, strength: 6, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 10, description: 'Imperial II (Cruiser).', },
    imperial_iii: { label: 'Imperial III', designation: 'Frigate', cost: 20, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 10, description: 'Imperial III (Cruiser).',  imperialOnly: true,},
    liberator: { label: 'Liberator', designation: 'Cruiser', cost: 20, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Liberator (Cruiser).', },
    mc30c: { label: 'MC30C', designation: 'Frigate', cost: 18, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'MC30C (Cruiser).',  requiredPlanetIds: ['p48'],},
    mc40a: { label: 'MC40A', designation: 'Light Cruiser', cost: 9, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'MC40A (Cruiser).',  requiredPlanetIds: ['p48'],},
    mc40b: { label: 'MC40B', designation: 'Light Cruiser', cost: 10, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'MC40B (Cruiser).',  requiredPlanetIds: ['p48'],},
    medstar_class_cruiser: { label: 'MedStar-class Cruiser', designation: 'Cruiser', cost: 20, buildTime: 2, strength: 6, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'MedStar-class Cruiser (Cruiser).', },
    pursuit: { label: 'Pursuit', designation: 'Light Cruiser', cost: 9, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Pursuit (Cruiser).', },
    stalwart: { label: 'Stalwart', designation: 'Light Frigate', cost: 10, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Stalwart (Cruiser).', },
    strike: { label: 'Strike', designation: 'Medium Cruiser', cost: 9, buildTime: 2, strength: 8, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Strike (Cruiser).', },
    warrior: { label: 'Warrior', designation: 'Medium Cruiser', cost: 10, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Warrior (Cruiser).', },
    thunderer: { label: 'Thunderer', designation: 'Cruiser', cost: 20, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'Thunderer (Cruiser).', },
    ton_falk: { label: 'Ton-Falk', designation: 'Escort Carrier', cost: 8, buildTime: 2, strength: 4, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'Ton-Falk (Cruiser).', },

    // Frigate
    u_418_escort: { label: '418 Escort', designation: 'Cruiser', cost: 20, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: '418 Escort (Frigate).',  imperialOnly: true,},
    u_418_escort_varient: { label: '418 Escort Varient', designation: 'Cruiser', cost: 20, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: '418 Escort Varient (Frigate).',  imperialOnly: true,},
    arquitens: { label: 'Arquitens', designation: 'Command Cruiser', cost: 16, buildTime: 2, strength: 7, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Arquitens (Frigate).', },
    black_swan: { label: 'Black Swan', designation: 'Frigate', cost: 18, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Black Swan (Frigate).', },
    carrack: { label: 'Carrack', designation: 'Light Cruiser', cost: 9, buildTime: 2, strength: 7, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'Carrack (Frigate).', },
    cc_2200: { label: 'CC-2200', designation: 'Frigate', cost: 18, buildTime: 2, strength: 7, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'CC-2200 (Frigate).', },
    cc_7700: { label: 'CC-7700', designation: 'Interdictor Frigate', cost: 10, buildTime: 2, strength: 7, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'CC-7700 (Frigate).', },
    cc_9600: { label: 'CC-9600', designation: 'Frigate', cost: 18, buildTime: 2, strength: 7, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'CC-9600 (Frigate).', },
    corona: { label: 'Corona', designation: 'Frigate', cost: 20, buildTime: 2, strength: 7, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Corona (Frigate).', },
    ef76_nebulon_b2: { label: 'EF76 Nebulon B2', designation: 'Frigate', cost: 18, buildTime: 2, strength: 7, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'EF76 Nebulon B2 (Frigate).', },
    ef76_nebulon_b: { label: 'EF76 Nebulon-B', designation: 'Escort Frigate', cost: 9, buildTime: 2, strength: 7, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'EF76 Nebulon-B (Frigate).', },
    gladius: { label: 'Gladius', designation: 'Corvette', cost: 18, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Gladius (Frigate).',  imperialOnly: true,},
    lancer: { label: 'Lancer', designation: 'Frigate', cost: 16, buildTime: 2, strength: 6, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Lancer (Frigate).', },
    marauder: { label: 'Marauder', designation: 'Corvette', cost: 20, buildTime: 2, strength: 6, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Marauder (Frigate).', },
    mc76_shoreline: { label: 'MC76 Shoreline', designation: 'Frigate', cost: 20, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'MC76 Shoreline (Frigate).',  requiredPlanetIds: ['p48'],},
    medstar_class_frigate: { label: 'MedStar-class Frigate', designation: 'Frigate', cost: 18, buildTime: 2, strength: 4, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'MedStar-class Frigate (Frigate).', },
    pelta: { label: 'Pelta', designation: 'Frigate', cost: 14, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Pelta (Frigate).', },
    quasar_fire: { label: 'Quasar Fire', designation: 'Bulk Cruiser', cost: 8, buildTime: 2, strength: 4, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Quasar Fire (Frigate).', },
    sacheen: { label: 'Sacheen', designation: 'Light Escort', cost: 11, buildTime: 2, strength: 7, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 1, description: 'Sacheen (Frigate).', },

    // Freighter
    star_galleon: { label: 'Star Galleon', designation: 'Frigate', cost: 16, buildTime: 2, strength: 6, hp: 4, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 5, description: 'Star Galleon (Freighter).', },

    // Frigate
    test: { label: 'Test', designation: 'Carrier', cost: 9, buildTime: 2, strength: 6, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'Test (Frigate).', },
    velox_class_star_frigate: { label: 'Velox-class Star Frigate', designation: 'Frigate', cost: 20, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Velox-class Star Frigate (Frigate).', },
    vigil: { label: 'Vigil', designation: 'Corvette', cost: 18, buildTime: 2, strength: 6, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Vigil (Frigate).', },
    vigilant_loadout_1: { label: 'Vigilant (Loadout 1)', designation: 'Battle Frigate', cost: 10, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Vigilant (Loadout 1) (Frigate).',  imperialOnly: true,},
    vigilant_loadout_2: { label: 'Vigilant (Loadout 2)', designation: 'Battle Frigate', cost: 10, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Vigilant (Loadout 2) (Frigate).',  imperialOnly: true,},
    vigilant_loadout_3: { label: 'Vigilant (Loadout 3)', designation: 'Battle Frigate', cost: 10, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Vigilant (Loadout 3) (Frigate).',  imperialOnly: true,},

    // Corvette
    agave: { label: 'Agave', designation: 'Picket Ship', cost: 8, buildTime: 2, strength: 4, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 1, description: 'Agave (Corvette).', },
    aiwha: { label: 'Aiwha', designation: 'Star Corvette', cost: 8, buildTime: 2, strength: 5, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 1, description: 'Aiwha (Corvette).', },
    bayonet: { label: 'Bayonet', designation: 'Light Cruiser', cost: 9, buildTime: 2, strength: 7, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Bayonet (Corvette).', },
    consular: { label: 'Consular', designation: 'Cruiser', cost: 14, buildTime: 2, strength: 5, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Consular (Corvette).', },
    cr90: { label: 'CR90', designation: 'Corvette', cost: 16, buildTime: 2, strength: 5, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'CR90 (Corvette).', },
    cr92a_assassin: { label: 'CR92a Assassin', designation: 'Corvette', cost: 16, buildTime: 2, strength: 6, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'CR92a Assassin (Corvette).', },
    crusader: { label: 'Crusader', designation: 'Corvette', cost: 16, buildTime: 2, strength: 4, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Crusader (Corvette).', },
    dp20: { label: 'DP20', designation: 'Frigate', cost: 16, buildTime: 2, strength: 7, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'DP20 (Corvette).', },
    fd79_tessek: { label: 'FD79 Tessek', designation: 'Corvette', cost: 16, buildTime: 2, strength: 6, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'FD79 Tessek (Corvette).', },
    free_virgillia: { label: 'Free Virgillia', designation: 'Bunkerbuster', cost: 9, buildTime: 2, strength: 5, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Free Virgillia (Corvette).', },
    imperial_2: { label: 'Imperial', designation: 'Light Corvette', cost: 8, buildTime: 2, strength: 6, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Imperial (Corvette).', },
    pankpa: { label: 'Pankpa', designation: 'Corvette', cost: 16, buildTime: 2, strength: 7, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 1, description: 'Pankpa (Corvette).', },
    raider: { label: 'Raider', designation: 'Corvette', cost: 16, buildTime: 2, strength: 6, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Raider (Corvette).', },
    tartan: { label: 'Tartan', designation: 'Patrol Cruiser', cost: 8, buildTime: 2, strength: 5, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Tartan (Corvette).', },
    warrior_2: { label: 'Warrior', designation: 'Gunship', cost: 9, buildTime: 2, strength: 7, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Warrior (Corvette).', },

    // Freighter
    c_9979: { label: 'C-9979', designation: 'Landing Craft', cost: 6, buildTime: 1, strength: 3, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'C-9979 (Freighter).', },
    epoch: { label: 'Epoch', designation: 'Freighter', cost: 10, buildTime: 2, strength: 1, hp: 5, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'Epoch (Freighter).', },
    far_reach_v: { label: 'Far Reach V', designation: 'Survey Vessel', cost: 7, buildTime: 2, strength: 5, hp: 4, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Far Reach V (Freighter).', },
    g_75: { label: 'G-75', designation: 'Medium Transport', cost: 8, buildTime: 2, strength: 5, hp: 4, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 2, description: 'G-75 (Freighter).', },
    guardian: { label: 'Guardian', designation: 'Light Cruiser', cost: 7, buildTime: 2, strength: 5, hp: 4, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'Guardian (Freighter).', },
    hajen: { label: 'Hajen', designation: 'Fleet Tender', cost: 11, buildTime: 2, strength: 5, hp: 5, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'Hajen (Freighter).', },
    lady: { label: 'Lady', designation: 'Luxury Liner', cost: 6, buildTime: 1, strength: 2, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 5, description: 'Lady (Freighter).', },
    lucrehulk_2: { label: 'Lucrehulk', designation: 'LH-4600 Cargo Freighter', cost: 12, buildTime: 3, strength: 8, hp: 6, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 5, description: 'Lucrehulk (Freighter).', },
    mod_18: { label: 'MOD-18', designation: 'Freighter', cost: 9, buildTime: 2, strength: 2, hp: 5, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 2, description: 'MOD-18 (Freighter).', },
    yt_1300: { label: 'YT-1300', designation: 'Light Freighter', cost: 8, buildTime: 2, strength: 4, hp: 4, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 2, description: 'YT-1300 (Freighter).', },

    // Large Transport
    aegis: { label: 'Aegis', designation: 'Combat Shuttle', cost: 4, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Aegis (Large Transport).', },
    bantha: { label: 'Bantha', designation: 'Assault Shuttle', cost: 5, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Bantha (Large Transport).', },
    beta: { label: 'Beta', designation: 'ETR-3 Escort Transport', cost: 6, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Beta (Large Transport).', },
    beta_c: { label: 'Beta/c', designation: 'Assault Shuttle', cost: 4, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 2, description: 'Beta/c (Large Transport).', },
    beta_h: { label: 'Beta/h', designation: 'Assault Shuttle', cost: 4, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 2, description: 'Beta/h (Large Transport).', },
    beta_l: { label: 'Beta/l', designation: 'Assault Shuttle', cost: 4, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 2, description: 'Beta/l (Large Transport).', },
    beta_m: { label: 'Beta/m', designation: 'Assault Shuttle', cost: 4, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 2, description: 'Beta/m (Large Transport).', },
    beta_s: { label: 'Beta/s', designation: 'Assault Shuttle', cost: 4, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 2, description: 'Beta/s (Large Transport).', },
    beta_t: { label: 'Beta/t', designation: 'Assault Shuttle', cost: 4, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 2, description: 'Beta/t (Large Transport).', },
    beta_v: { label: 'Beta/v', designation: 'Assault Shuttle', cost: 4, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 2, description: 'Beta/v (Large Transport).', },
    br_23: { label: 'BR-23', designation: 'Courrier', cost: 5, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'BR-23 (Large Transport).', },
    cr_25: { label: 'CR-25', designation: 'Troop Carrier', cost: 4, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'CR-25 (Large Transport).', },
    curich: { label: 'Curich', designation: 'Shuttle', cost: 5, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Curich (Large Transport).', },
    cx_5011: { label: 'CX-5011', designation: 'Large Transport', cost: 5, buildTime: 1, strength: 1, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'CX-5011 (Large Transport).', },
    delta: { label: 'Delta', designation: 'JV7 Escort Shuttle', cost: 5, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 1, description: 'Delta (Large Transport).', },
    gamma: { label: 'Gamma', designation: 'ATR-6 Assault Transport', cost: 5, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Gamma (Large Transport).', },
    gamma_2: { label: 'Gamma', designation: 'Assault Shuttle', cost: 5, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Gamma (Large Transport).', },
    gamma_3: { label: 'Gamma', designation: 'Light Personnel Carrier', cost: 4, buildTime: 1, strength: 2, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Gamma (Large Transport).', },
    gozanti: { label: 'Gozanti', designation: 'Armed Transport', cost: 5, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 2, description: 'Gozanti (Large Transport).', },
    grek: { label: 'Grek', designation: 'Troop Shuttle', cost: 4, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Grek (Large Transport).', },
    if_120: { label: 'IF-120', designation: 'Landing Craft', cost: 4, buildTime: 1, strength: 2, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'IF-120 (Large Transport).', },
    igv_55: { label: 'IGV-55', designation: 'Surveillance Vessel', cost: 6, buildTime: 1, strength: 3, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'IGV-55 (Large Transport).', },
    imperial_3: { label: 'Imperial', designation: 'Armored Transport', cost: 5, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Imperial (Large Transport).', },
    imperial_gozanti: { label: 'Imperial Gozanti', designation: 'Carrier', cost: 5, buildTime: 1, strength: 2, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 2, description: 'Imperial Gozanti (Large Transport).', },
    imperial_gozanti_2: { label: 'Imperial Gozanti', designation: 'Carrier Refit', cost: 6, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 2, description: 'Imperial Gozanti (Large Transport).', },
    kappa: { label: 'Kappa', designation: 'Shuttle', cost: 4, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Kappa (Large Transport).', },
    katarn: { label: 'Katarn', designation: 'Boarding Shuttle', cost: 4, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Katarn (Large Transport).', },
    l_404_stirling: { label: 'L-404 Stirling', designation: 'Large Transport', cost: 5, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'L-404 Stirling (Large Transport).', },
    m2_hercules: { label: 'M2 Hercules', designation: 'Strategic Starlifter', cost: 7, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'M2 Hercules (Large Transport).', },
    mu_1: { label: 'Mu-1', designation: 'Long Range Shuttle', cost: 4, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Mu-1 (Large Transport).', },
    mu_2: { label: 'Mu-2', designation: 'Long Range Shuttle', cost: 4, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Mu-2 (Large Transport).', },
    mu_3: { label: 'Mu-3', designation: 'Long Range Shuttle', cost: 4, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Mu-3 (Large Transport).', },
    nu: { label: 'Nu', designation: 'Attack Shuttle', cost: 5, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Nu (Large Transport).', },
    sentinel: { label: 'Sentinel', designation: 'Landing Craft', cost: 6, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Sentinel (Large Transport).', },
    t_6: { label: 'T-6', designation: 'Shuttle', cost: 4, buildTime: 1, strength: 2, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'T-6 (Large Transport).', },
    theta: { label: 'Theta', designation: 'AT-AT Barge', cost: 3, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Theta (Large Transport).', },
    theta_2: { label: 'Theta', designation: 'T-2c Shuttle', cost: 5, buildTime: 1, strength: 2, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'Theta (Large Transport).', },
    tie_la: { label: 'TIE/la', designation: 'TIE Lander', cost: 4, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'TIE/la (Large Transport).', },
    tz_86: { label: 'TZ-86', designation: 'Transport', cost: 3, buildTime: 1, strength: 2, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'TZ-86 (Large Transport).', },
    y_4: { label: 'Y-4', designation: 'Transport', cost: 5, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Y-4 (Large Transport).', },
    y_85_titan: { label: 'Y-85 Titan', designation: 'Dropship', cost: 4, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Y-85 Titan (Large Transport).', },
    ye_4: { label: 'Ye-4', designation: 'Gunship', cost: 4, buildTime: 1, strength: 2, hp: 2, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 1, description: 'Ye-4 (Large Transport).', },
    zeta: { label: 'Zeta', designation: 'Long Range Shuttle', cost: 5, buildTime: 1, strength: 1, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 1, description: 'Zeta (Large Transport).', },

    // Landing Ship
    u_918_zulu_class_dropship: { label: '918 Zulu-class Dropship', designation: 'Landing Ship', cost: 9, buildTime: 2, strength: 4, hp: 5, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 5, description: '918 Zulu-class Dropship (Landing Ship).', },
    at_rdp: { label: 'AT-RDP', designation: 'Drop Pod', cost: 3, buildTime: 1, strength: 4, hp: 1, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'AT-RDP (Landing Ship).', },
    at_st: { label: 'AT-ST', designation: 'Drop Pod', cost: 2, buildTime: 1, strength: 4, hp: 1, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'AT-ST (Landing Ship).', },
    d77_tc_pelican: { label: 'D77-TC Pelican', designation: 'Landing Craft', cost: 7, buildTime: 1, strength: 3, hp: 3, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 0, transportCapacity: 2, description: 'D77-TC Pelican (Landing Ship).', },
    f7_dropship_landing_brick: { label: 'F7 Dropship "Landing Brick"', designation: 'Landing Ship', cost: 5, buildTime: 1, strength: 1, hp: 3, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'F7 Dropship "Landing Brick" (Landing Ship).', },
    imperial_dropship_shuttle: { label: 'Imperial Dropship Shuttle', designation: 'Landing Ship', cost: 3, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Imperial Dropship Shuttle (Landing Ship).', },
    imperial_loader_shuttle: { label: 'Imperial Loader Shuttle', designation: 'Landing Ship', cost: 6, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Imperial Loader Shuttle (Landing Ship).', },
    imperial_troop_drop_pod: { label: 'Imperial Troop Drop Pod', designation: 'Drop Pod', cost: 2, buildTime: 1, strength: 4, hp: 1, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Imperial Troop Drop Pod (Landing Ship).', },
    imperial_troop_drop_pod_cargo: { label: 'Imperial Troop Drop Pod - Cargo', designation: 'Drop Pod', cost: 2, buildTime: 1, strength: 4, hp: 1, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Imperial Troop Drop Pod - Cargo (Landing Ship).', },
    imperial_troop_drop_pod_decoy: { label: 'Imperial Troop Drop Pod - Decoy', designation: 'Drop Pod', cost: 2, buildTime: 1, strength: 4, hp: 1, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Imperial Troop Drop Pod - Decoy (Landing Ship).', },
    l_401: { label: 'L-401', designation: 'Assault Dropship', cost: 6, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'L-401 (Landing Ship).',  requiredPlanetIds: ['p100'],},
    laat_c: { label: 'LAAT/c', designation: 'Landing Ship', cost: 4, buildTime: 1, strength: 2, hp: 2, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'LAAT/c (Landing Ship).', },
    laat_i: { label: 'LAAT/i', designation: 'Landing Ship', cost: 3, buildTime: 1, strength: 6, hp: 2, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'LAAT/i (Landing Ship).', },
    laat_s: { label: 'LAAT/s', designation: 'Landing Ship', cost: 5, buildTime: 1, strength: 6, hp: 2, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 3, transportCapacity: 2, description: 'LAAT/s (Landing Ship).', },
    laav_c: { label: 'LAAV/c', designation: 'Landing Ship', cost: 7, buildTime: 1, strength: 7, hp: 3, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'LAAV/c (Landing Ship).', },
    laav_i: { label: 'LAAV/i', designation: 'Landing Ship', cost: 7, buildTime: 1, strength: 7, hp: 3, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'LAAV/i (Landing Ship).', },
    maat_c: { label: 'MAAT/c', designation: 'Landing Ship', cost: 2, buildTime: 1, strength: 1, hp: 1, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'MAAT/c (Landing Ship).', },
    maat_i: { label: 'MAAT/i', designation: 'Landing Ship', cost: 4, buildTime: 1, strength: 6, hp: 2, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'MAAT/i (Landing Ship).', },
    mt_191_dropship: { label: 'MT/191 Dropship', designation: 'Landing Ship', cost: 5, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'MT/191 Dropship (Landing Ship).', },
    predator_1_pod: { label: 'Predator 1 Pod', designation: 'Drop Pod', cost: 3, buildTime: 1, strength: 4, hp: 1, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Predator 1 Pod (Landing Ship).', },
    republic_troop_transport: { label: 'Republic Troop Transport', designation: 'Landing Ship', cost: 2, buildTime: 1, strength: 3, hp: 1, canOrbit: true, canSurface: true, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Republic Troop Transport (Landing Ship).', },

    // Small Transport
    b_7: { label: 'B-7', designation: 'Light Freighter', cost: 6, buildTime: 1, strength: 1, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 1, description: 'B-7 (Small Transport).', },
    delta_2: { label: 'Delta', designation: 'Shuttle', cost: 3, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Delta (Small Transport).', },
    delta_dx_9: { label: 'Delta DX-9', designation: 'Stormtrooper Transport', cost: 7, buildTime: 2, strength: 4, hp: 4, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 2, description: 'Delta DX-9 (Small Transport).', },
    eta: { label: 'Eta', designation: 'Shuttle', cost: 6, buildTime: 1, strength: 1, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Eta (Small Transport).', },
    h_10: { label: 'H-10', designation: 'Small Transport', cost: 3, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'H-10 (Small Transport).', },
    h_22a_d_wing: { label: 'H-22A D-Wing', designation: 'Heavy Attack Boat', cost: 7, buildTime: 2, strength: 1, hp: 4, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 2, description: 'H-22A D-Wing (Small Transport).', },
    lambda: { label: 'Lambda', designation: 'T-4a Shuttle', cost: 6, buildTime: 1, strength: 1, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 2, description: 'Lambda (Small Transport).', },
    rz_52_dekard: { label: 'RZ-52 Dekard', designation: 'Transport', cost: 5, buildTime: 1, strength: 2, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 2, description: 'RZ-52 Dekard (Small Transport).', },
    svelte: { label: 'Svelte', designation: 'Imperial Shuttle', cost: 7, buildTime: 2, strength: 1, hp: 4, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 2, description: 'Svelte (Small Transport).', },
    tie_br: { label: 'TIE/br', designation: 'TIE Boarder', cost: 3, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 2, description: 'TIE/br (Small Transport).', },
    tie_sh: { label: 'TIE/sh', designation: 'TIE Shuttle', cost: 3, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'TIE/sh (Small Transport).', },
    tz_15: { label: 'TZ-15', designation: 'Shuttle', cost: 6, buildTime: 1, strength: 1, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 5, description: 'TZ-15 (Small Transport).', },

    // Large Starfighter
    aeg_77_vigo: { label: 'AEG-77 Vigo', designation: 'Large Starfighter', cost: 5, buildTime: 1, strength: 3, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 1, description: 'AEG-77 Vigo (Large Starfighter).', },
    aegis_a3g_vanguard_harbinger: { label: 'Aegis A3G Vanguard Harbinger', designation: 'Fighter-Bomber', cost: 7, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Aegis A3G Vanguard Harbinger (Large Starfighter).', },
    aegis_a3g_vanguard_hoplite: { label: 'Aegis A3G Vanguard Hoplite', designation: 'Assault Fighter', cost: 7, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Aegis A3G Vanguard Hoplite (Large Starfighter).', },
    aegis_a3g_vanguard_warden: { label: 'Aegis A3G Vanguard Warden', designation: 'Heavy Fighter', cost: 7, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Aegis A3G Vanguard Warden (Large Starfighter).', },
    ferret_class_reconnaissance_vessel: { label: 'Ferret-class Reconnaissance Vessel', designation: 'Large Starfighter', cost: 5, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'Ferret-class Reconnaissance Vessel (Large Starfighter).', },
    firespray_31: { label: 'Firespray-31', designation: 'Large Starfighter', cost: 6, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 1, description: 'Firespray-31 (Large Starfighter).', },
    gat_12_skipray_blastboat: { label: 'GAT-12 Skipray Blastboat', designation: 'Large Starfighter', cost: 5, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'GAT-12 Skipray Blastboat (Large Starfighter).', },
    l_402_scimitar: { label: 'L-402 Scimitar', designation: 'Fast Attack Fighter', cost: 7, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'L-402 Scimitar (Large Starfighter).', },
    m22_t_krayt_gunship: { label: 'M22-T Krayt gunship', designation: 'Large Starfighter', cost: 6, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'M22-T Krayt gunship (Large Starfighter).', },
    pbr_ac1_y_wing: { label: 'PBR-AC1 Y-Wing', designation: 'Large Starfighter', cost: 6, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'PBR-AC1 Y-Wing (Large Starfighter).', },
    preybird_class_starfighter: { label: 'Preybird-class Starfighter', designation: 'Large Starfighter', cost: 5, buildTime: 1, strength: 5, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 1, description: 'Preybird-class Starfighter (Large Starfighter).', },
    prowler_class_reconnaissance_vessel: { label: 'Prowler-class Reconnaissance Vessel', designation: 'Large Starfighter', cost: 5, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'Prowler-class Reconnaissance Vessel (Large Starfighter).', },
    pursuer: { label: 'Pursuer', designation: 'Enforcement Ship', cost: 6, buildTime: 1, strength: 1, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'Pursuer (Large Starfighter).', },
    skyblind: { label: 'SkyBlind', designation: 'Large Starfighter', cost: 5, buildTime: 1, strength: 2, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 1, description: 'SkyBlind (Large Starfighter).', },
    tie_sr_scoutship: { label: 'TIE/sr Scoutship', designation: 'Large Starfighter', cost: 4, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 1, description: 'TIE/sr Scoutship (Large Starfighter).', },
    ut_60d_u_wing_fighter: { label: 'UT-60D U-Wing Fighter', designation: 'Large Starfighter', cost: 5, buildTime: 1, strength: 2, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'UT-60D U-Wing Fighter (Large Starfighter).', },
    x4_gunship: { label: 'X4 Gunship', designation: 'Large Starfighter', cost: 5, buildTime: 1, strength: 3, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 1, description: 'X4 Gunship (Large Starfighter).', },

    // Starfighter
    a_9_vigilance_starfighter: { label: 'A-9 Vigilance Starfighter', designation: 'Starfighter', cost: 3, buildTime: 1, strength: 2, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'A-9 Vigilance Starfighter (Starfighter).', },
    alpha_xg_1_star_wing: { label: 'Alpha Xg-1 Star Wing', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'Alpha Xg-1 Star Wing (Starfighter).', },
    alpha_3_nimbus_v_wing: { label: 'Alpha-3 Nimbus V-Wing', designation: 'Starfighter', cost: 3, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Alpha-3 Nimbus V-Wing (Starfighter).', },
    arc_170: { label: 'ARC-170', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'ARC-170 (Starfighter).', },
    arrow: { label: 'Arrow', designation: 'Strike Fighter', cost: 6, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Arrow (Starfighter).', },
    btl_a4_y_wing: { label: 'BTL-A4 Y-Wing', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'BTL-A4 Y-Wing (Starfighter).', },
    btl_a4_y_wing_longprobe: { label: 'BTL-A4 Y-Wing (LongProbe)', designation: 'Starfighter', cost: 7, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'BTL-A4 Y-Wing (LongProbe) (Starfighter).', },
    btl_b_y_wing: { label: 'BTL-B Y-Wing', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'BTL-B Y-Wing (Starfighter).', },
    btl_s3_y_wing: { label: 'BTL-S3 Y-Wing', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'BTL-S3 Y-Wing (Starfighter).', },
    bts_a2_h_wing: { label: 'BTS-A2 H-Wing', designation: 'Starfighter', cost: 4, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'BTS-A2 H-Wing (Starfighter).', },
    cutlass_9: { label: 'Cutlass-9', designation: 'Patrol Fighter', cost: 5, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Cutlass-9 (Starfighter).', },
    cx_133_chaos_fighter: { label: 'CX-133 Chaos Fighter', designation: 'Starfighter', cost: 3, buildTime: 1, strength: 3, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'CX-133 Chaos Fighter (Starfighter).', },
    defender_class_starfighter: { label: 'Defender-class Starfighter', designation: 'Starfighter', cost: 4, buildTime: 1, strength: 2, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Defender-class Starfighter (Starfighter).', },
    delta_9_vulcan: { label: 'Delta-9 Vulcan', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 3, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'Delta-9 Vulcan (Starfighter).', },
    droid_tri_fighter: { label: 'Droid Tri-Fighter', designation: 'Starfighter', cost: 4, buildTime: 1, strength: 5, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Droid Tri-Fighter (Starfighter).', },
    dunelizard_fighter: { label: 'Dunelizard Fighter', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 2, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Dunelizard Fighter (Starfighter).', },
    e_7b: { label: 'E-7B', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'E-7B (Starfighter).',  requiredPlanetIds: ['p70'],},
    e_wing_escort_fighter: { label: 'E-Wing Escort Fighter', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 3, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'E-Wing Escort Fighter (Starfighter).', },
    e_wing_starfighter: { label: 'E-wing starfighter', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'E-wing starfighter (Starfighter).', },
    eta_4_valiant: { label: 'Eta-4 Valiant', designation: 'Interceptor', cost: 4, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Eta-4 Valiant (Starfighter).', },
    fang: { label: 'Fang', designation: 'Starfighter', cost: 4, buildTime: 1, strength: 2, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Fang (Starfighter).', },
    g_59_cannibalizer: { label: 'G-59 Cannibalizer', designation: 'Starfighter', cost: 4, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'G-59 Cannibalizer (Starfighter).', },
    g_59_cannibalizer_h: { label: 'G-59 Cannibalizer H', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'G-59 Cannibalizer H (Starfighter).',  requiredPlanetIds: ['p148'],},
    gauntlet: { label: 'Gauntlet', designation: 'Starfighter', cost: 3, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Gauntlet (Starfighter).', },
    h_60_tempest_bomber: { label: 'H-60 Tempest Bomber', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'H-60 Tempest Bomber (Starfighter).', },
    hlaf_500: { label: 'HLAF-500', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'HLAF-500 (Starfighter).', },
    i_7_howlrunner: { label: 'I-7 Howlrunner', designation: 'Starfighter', cost: 4, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'I-7 Howlrunner (Starfighter).', },
    ird_starfighter: { label: 'IRD Starfighter', designation: 'Starfighter', cost: 3, buildTime: 1, strength: 1, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'IRD Starfighter (Starfighter).', },
    ird_a_starfighter: { label: 'IRD/A Starfighter', designation: 'Starfighter', cost: 3, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'IRD/A Starfighter (Starfighter).', },
    ixiyen_fast_attack_craft: { label: 'Ixiyen Fast Attack Craft', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'Ixiyen Fast Attack Craft (Starfighter).', },
    // Imperial TIE Fighters (imperialOnly variants)
    tie_ln_fighter: { label: 'TIE/ln Fighter', designation: 'TIE Fighter', cost: 2, buildTime: 1, strength: 2, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 0, description: 'TIE/ln Standard Fighter. Fast and expendable.', imperialOnly: true, },
    tie_x1_advanced: { label: 'TIE/x1 Advanced', designation: 'Advanced Fighter', cost: 4, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 0, description: 'TIE/x1 Advanced Fighter. Superior performance.', imperialOnly: true, },
    tie_interceptor: { label: 'TIE Interceptor', designation: 'Interceptor', cost: 3, buildTime: 1, strength: 3, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 0, description: 'TIE Interceptor. Built for speed and precision.', imperialOnly: true, },
    tie_bomber: { label: 'TIE/sa Bomber', designation: 'Bomber', cost: 4, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 2, description: 'TIE/sa Bomber. Close air support specialist.', imperialOnly: true, },

    k_wing_starfighter: { label: 'K-wing starfighter', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 6, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'K-wing starfighter (Starfighter).', },
    kihraxz_light_fighter: { label: 'Kihraxz Light Fighter', designation: 'Starfighter', cost: 4, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Kihraxz Light Fighter (Starfighter).', },
    l_301_shrike: { label: 'L-301 Shrike', designation: 'Space Superiority Fighter', cost: 6, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'L-301 Shrike (Starfighter).',  requiredPlanetIds: ['p100'],},
    l_302_peregrine: { label: 'L-302 Peregrine', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 2, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'L-302 Peregrine (Starfighter).',  requiredPlanetIds: ['p100'],},
    l_303_mosquito: { label: 'L-303 Mosquito', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 6, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'L-303 Mosquito (Starfighter).',  requiredPlanetIds: ['p100'],},
    m_1sf_nova: { label: 'M-1SF Nova', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'M-1SF Nova (Starfighter).', },
    m_2sf_eclipse: { label: 'M-2SF Eclipse', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'M-2SF Eclipse (Starfighter).', },
    m12_l_kimogila_heavy_fighter: { label: 'M12-L Kimogila Heavy Fighter', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'M12-L Kimogila Heavy Fighter (Starfighter).', },
    m3_a_scyk_interceptor: { label: 'M3-A Scyk Interceptor', designation: 'Starfighter', cost: 4, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'M3-A Scyk Interceptor (Starfighter).', },
    missile_boat: { label: 'Missile Boat', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 1, description: 'Missile Boat (Starfighter).', },
    needle_drone: { label: 'Needle Drone', designation: 'Starfighter', cost: 2, buildTime: 1, strength: 1, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Needle Drone (Starfighter).', },
    ntb_630: { label: 'NTB-630', designation: 'Naval Bomber', cost: 5, buildTime: 1, strength: 7, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'NTB-630 (Starfighter).', },
    predator_1: { label: 'Predator 1', designation: 'Droid Starfighter', cost: 3, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Predator 1 (Starfighter).', },
    proton_mine_class_a_015: { label: 'Proton Mine Class A 015', designation: 'Droid Starfighter', cost: 2, buildTime: 1, strength: 2, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Proton Mine Class A 015 (Starfighter).', },
    r60_t_wing: { label: 'R60 T-Wing', designation: 'Interceptor', cost: 5, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'R60 T-Wing (Starfighter).', },
    rulya: { label: 'Rulya', designation: 'Starfighter', cost: 3, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Rulya (Starfighter).', },
    rz_1_a_wing: { label: 'RZ-1 A-Wing', designation: 'Interceptor', cost: 5, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'RZ-1 A-Wing (Starfighter).', },
    sf_01_b_wing: { label: 'SF-01 B-Wing', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'SF-01 B-Wing (Starfighter).', },
    sf_02_b_wing_2: { label: 'SF-02 B-Wing 2', designation: 'Starfighter', cost: 7, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'SF-02 B-Wing 2 (Starfighter).', },
    starviper: { label: 'StarViper', designation: 'Attack Platform', cost: 5, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'StarViper (Starfighter).', },
    t_65_x_wing: { label: 'T-65 X-Wing', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'T-65 X-Wing (Starfighter).', },
    t_65ac4_x_wing: { label: 'T-65AC4 X-wing', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'T-65AC4 X-wing (Starfighter).', },
    t_65br_x_wing: { label: 'T-65BR X-Wing', designation: 'Reconnaissance Starfighter', cost: 6, buildTime: 1, strength: 2, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'T-65BR X-Wing (Starfighter).', },
    t_65xj_x_wing: { label: 'T-65XJ X-Wing', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'T-65XJ X-Wing (Starfighter).', },
    tie_heavy_bomber: { label: 'TIE Heavy Bomber', designation: 'Starfighter', cost: 4, buildTime: 1, strength: 5, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE Heavy Bomber (Starfighter).', },
    tie_vanguard: { label: 'TIE Vanguard', designation: 'Scout', cost: 3, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE Vanguard (Starfighter).', },
    tie_ad_avenger: { label: 'TIE/ad "Avenger"', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'TIE/ad "Avenger" (Starfighter).', },
    tie_d_defender: { label: 'TIE/D "Defender"', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'TIE/D "Defender" (Starfighter).', },
    tie_d_defender_elite: { label: 'TIE/D "Defender" Elite', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'TIE/D "Defender" Elite (Starfighter).', },
    tie_dm_demolisher: { label: 'TIE/DM "Demolisher"', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/DM "Demolisher" (Starfighter).', },
    tie_fc: { label: 'TIE/fc', designation: 'Fire Control', cost: 3, buildTime: 1, strength: 1, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/fc (Starfighter).', },
    tie_gt: { label: 'TIE/gt', designation: 'Bomber', cost: 3, buildTime: 1, strength: 3, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/gt (Starfighter).', },
    tie_hu_hunter: { label: 'TIE/HU "Hunter"', designation: 'Multi-Role Starfighter', cost: 5, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'TIE/HU "Hunter" (Starfighter).', },
    tie_in: { label: 'TIE/IN', designation: 'Interceptor', cost: 3, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/IN (Starfighter).', },
    tie_in_elite: { label: 'TIE/IN Elite', designation: 'Interceptor', cost: 5, buildTime: 1, strength: 5, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 1, description: 'TIE/IN Elite (Starfighter).', },
    tie_in_refit: { label: 'TIE/IN Refit', designation: 'Interceptor', cost: 4, buildTime: 1, strength: 3, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/IN Refit (Starfighter).', },
    tie_in2: { label: 'TIE/IN2', designation: 'Interceptor', cost: 3, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/IN2 (Starfighter).', },
    tie_in3: { label: 'TIE/IN3', designation: 'Interceptor', cost: 4, buildTime: 1, strength: 5, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/IN3 (Starfighter).', },
    tie_it: { label: 'TIE/IT', designation: 'Interdictor', cost: 4, buildTime: 1, strength: 5, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/IT (Starfighter).', },
    tie_ln: { label: 'TIE/LN', designation: 'Starfighter', cost: 3, buildTime: 1, strength: 1, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/LN (Starfighter).', },
    tie_ln_refit: { label: 'TIE/LN Refit', designation: 'Starfighter', cost: 3, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/LN Refit (Starfighter).', },
    tie_rc: { label: 'TIE/rc', designation: 'Scout', cost: 3, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/rc (Starfighter).', },
    tie_sa: { label: 'TIE/sa', designation: 'Bomber', cost: 3, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/sa (Starfighter).', },
    tie_sa_refit: { label: 'TIE/sa Refit', designation: 'Bomber', cost: 4, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/sa Refit (Starfighter).', },
    tl_s8_k_wing: { label: 'TL-S8 K-wing', designation: 'Assault Starfighter', cost: 8, buildTime: 2, strength: 8, hp: 4, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TL-S8 K-wing (Starfighter).', },
    toscan_8_q: { label: 'Toscan 8-Q', designation: 'Starfighter', cost: 4, buildTime: 1, strength: 1, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Toscan 8-Q (Starfighter).', },
    tye_wing: { label: 'TYE-Wing', designation: 'Ugly', cost: 2, buildTime: 1, strength: 1, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TYE-Wing (Starfighter).', },
    vrm_2_v_wing: { label: 'VRM-2 V-Wing', designation: 'Light Starfighter', cost: 5, buildTime: 1, strength: 5, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'VRM-2 V-Wing (Starfighter).',  requiredPlanetIds: ['p48'],},
    vulture: { label: 'Vulture', designation: 'Droid Starfighter', cost: 2, buildTime: 1, strength: 3, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Vulture (Starfighter).', },
    y_tie: { label: 'Y-TIE', designation: 'Ugly', cost: 3, buildTime: 1, strength: 2, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Y-TIE (Starfighter).', },
    z_95: { label: 'Z-95', designation: 'Headhunter', cost: 4, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Z-95 (Starfighter).', },
    z_95_with_hyperdrive: { label: 'Z-95 (with hyperdrive)', designation: 'Headhunter', cost: 4, buildTime: 1, strength: 4, hp: 2, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Z-95 (with hyperdrive) (Starfighter).', },

    // Aerocraft
    ahs_1_heavy_assualt_airspeeder: { label: 'AHS-1 Heavy Assualt Airspeeder', designation: 'Aerocraft', cost: 3, buildTime: 1, strength: 4, hp: 2, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'AHS-1 Heavy Assualt Airspeeder (Aerocraft).', },
    air_patrol_ii: { label: 'Air Patrol II', designation: 'Aerocraft', cost: 2, buildTime: 1, strength: 1, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Air Patrol II (Aerocraft).', },
    cav_11_condor_airspeeder: { label: 'CAV-11 "Condor" Airspeeder', designation: 'Aerocraft', cost: 2, buildTime: 1, strength: 2, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'CAV-11 "Condor" Airspeeder (Aerocraft).', },
    combat_assault_transport: { label: 'Combat Assault Transport', designation: 'Aerocraft', cost: 5, buildTime: 1, strength: 2, hp: 3, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 2, description: 'Combat Assault Transport (Aerocraft).', },
    deathhawk_combat_airspeeder: { label: 'Deathhawk Combat Airspeeder', designation: 'Aerocraft', cost: 2, buildTime: 1, strength: 2, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Deathhawk Combat Airspeeder (Aerocraft).', },
    haet_221: { label: 'HAET 221', designation: 'Aerocraft', cost: 5, buildTime: 1, strength: 3, hp: 2, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 2, description: 'HAET 221 (Aerocraft).', },
    imperial_escort_fighter: { label: 'Imperial Escort Fighter', designation: 'Aerocraft', cost: 2, buildTime: 1, strength: 1, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Imperial Escort Fighter (Aerocraft).', },
    int_4_interceptor: { label: 'INT-4 Interceptor', designation: 'Aerocraft', cost: 2, buildTime: 1, strength: 1, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'INT-4 Interceptor (Aerocraft).', },
    l_101_lynx: { label: 'L-101 Lynx', designation: 'Combat Airspeeder', cost: 4, buildTime: 1, strength: 4, hp: 2, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'L-101 Lynx (Aerocraft).',  requiredPlanetIds: ['p100'],},
    nn_01_imperial_enforcement_airspeeder: { label: 'NN-01 Imperial Enforcement Airspeeder', designation: 'Aerocraft', cost: 4, buildTime: 1, strength: 1, hp: 2, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'NN-01 Imperial Enforcement Airspeeder (Aerocraft).', },
    ptb_625_planetary_bomber: { label: 'PTB-625 Planetary Bomber', designation: 'Aerocraft', cost: 5, buildTime: 1, strength: 6, hp: 2, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'PTB-625 Planetary Bomber (Aerocraft).', },
    rapid_deployment_airspeeder: { label: 'Rapid Deployment Airspeeder', designation: 'Aerocraft', cost: 2, buildTime: 1, strength: 2, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Rapid Deployment Airspeeder (Aerocraft).', },
    rush_troop_transport_speeder: { label: 'Rush Troop Transport Speeder', designation: 'Aerocraft', cost: 3, buildTime: 1, strength: 2, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 2, description: 'Rush Troop Transport Speeder (Aerocraft).', },
    scs_19_sentinel: { label: 'SCS-19 Sentinel', designation: 'Aerocraft', cost: 3, buildTime: 1, strength: 1, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'SCS-19 Sentinel (Aerocraft).', },
    sniper_airspeeder: { label: 'Sniper Airspeeder', designation: 'Aerocraft', cost: 2, buildTime: 1, strength: 3, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Sniper Airspeeder (Aerocraft).', },
    storm_iv_twinpod_cloud_car: { label: 'Storm IV TwinPod Cloud Car', designation: 'Aerocraft', cost: 2, buildTime: 1, strength: 1, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Storm IV TwinPod Cloud Car (Aerocraft).', },
    t_16_skyhopper: { label: 'T-16 Skyhopper', designation: 'Aerocraft', cost: 2, buildTime: 1, strength: 1, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'T-16 Skyhopper (Aerocraft).', },
    t_47_airspeeder: { label: 'T-47 Airspeeder', designation: 'Aerocraft', cost: 2, buildTime: 1, strength: 3, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'T-47 Airspeeder (Aerocraft).', },
    tachyon_fast_attack_airspeeder: { label: 'Tachyon Fast Attack Airspeeder', designation: 'Aerocraft', cost: 2, buildTime: 1, strength: 2, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Tachyon Fast Attack Airspeeder (Aerocraft).', },
    tie_lc_lancet_aerial_bomber: { label: 'TIE/lc Lancet Aerial Bomber', designation: 'Aerocraft', cost: 2, buildTime: 1, strength: 2, hp: 1, canOrbit: false, canSurface: true, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'TIE/lc Lancet Aerial Bomber (Aerocraft).', },

    // Frigate
    black_swan_mod: { label: 'Black Swan (mod.)', designation: 'Frigate', cost: 18, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Black Swan (mod.) (Frigate).', },

    // Starfighter
    f8_gladiator: { label: 'F8 Gladiator', designation: 'Bomber', cost: 7, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'F8 Gladiator (Starfighter).', },
    f7a_hornet: { label: 'F7A Hornet', designation: 'Starfighter', cost: 7, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'F7A Hornet (Starfighter).', },

    // Star Destroyer
    repulse: { label: 'Repulse', designation: 'Star Destroyer', cost: 22, buildTime: 2, strength: 11, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Repulse (Star Destroyer).', },

    // Small Transport
    b_8: { label: 'B-8', designation: 'Light Freighter', cost: 6, buildTime: 1, strength: 1, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'B-8 (Small Transport).',  requiredPlanetIds: ['p100'],},

    // Frigate
    wasp: { label: 'Wasp', designation: 'Frigate', cost: 20, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Wasp (Frigate).',  requiredPlanetIds: ['p98'],},

    // Starfighter
    tau: { label: 'Tau', designation: 'Starfighter', cost: 7, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'Tau (Starfighter).',  requiredPlanetIds: ['p116'],},

    // Frigate
    viper: { label: 'Viper', designation: 'Escort Carrier', cost: 9, buildTime: 2, strength: 5, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Viper (Frigate).', },

    // Cruiser
    dreadful: { label: 'Dreadful', designation: 'Cruiser', cost: 20, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Dreadful (Cruiser).',  requiredPlanetIds: ['p98'],},

    // Starfighter
    reaver_mk_i: { label: 'Reaver mk. I', designation: 'Starfighter', cost: 6, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 3, transportCapacity: 1, description: 'Reaver mk. I (Starfighter).',  requiredPlanetIds: ['p98'],},
    reaver_mk_ii: { label: 'Reaver mk. II', designation: 'Starfighter', cost: 5, buildTime: 1, strength: 4, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 0, transportCapacity: 1, description: 'Reaver mk. II (Starfighter).',  requiredPlanetIds: ['p98'],},

    // Star Destroyer
    imperial_iii_2: { label: 'Imperial III', designation: 'Star Destroyer', cost: 24, buildTime: 3, strength: 12, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Imperial III (Star Destroyer).', },

    // Large Starfighter
    xg_9: { label: 'XG.9', designation: 'Assault Missile Gunboat', cost: 6, buildTime: 1, strength: 6, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'XG.9 (Large Starfighter).',  imperialOnly: true,},

    // Frigate
    vigilant_ii: { label: 'Vigilant II', designation: 'Battle Frigate', cost: 10, buildTime: 2, strength: 8, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Vigilant II (Frigate).',  imperialOnly: true,},

    // Freighter
    interceptor_iv: { label: 'Interceptor IV', designation: 'Frigate', cost: 14, buildTime: 2, strength: 5, hp: 4, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 1, description: 'Interceptor IV (Freighter).', },
    robber_baron_star_galleon_custom_unit: { label: 'Robber Baron (Star Galleon Custom Unit)', designation: 'Frigate', cost: 16, buildTime: 2, strength: 6, hp: 4, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 5, description: 'Robber Baron (Star Galleon Custom Unit) (Freighter).', },

    // Large Transport
    ipv_1: { label: 'IPV-1', designation: 'System Patrol Craft', cost: 7, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 0, transportCapacity: 1, description: 'IPV-1 (Large Transport).', },

    // Star Destroyer
    vanquisher: { label: 'Vanquisher', designation: 'Star Destroyer', cost: 22, buildTime: 3, strength: 11, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Vanquisher (Star Destroyer).', },

    // Heavy Cruiser
    tempest: { label: 'Tempest', designation: 'Heavy Cruiser', cost: 22, buildTime: 2, strength: 10, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Tempest (Heavy Cruiser).',  imperialOnly: true,},

    // Star Destroyer
    valiant: { label: 'Valiant', designation: 'Star Destroyer', cost: 22, buildTime: 3, strength: 10, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 5, description: 'Valiant (Star Destroyer).',  imperialOnly: true,},

    // Large Starfighter
    aegis_a3g_vanguard_harbinger_2: { label: 'Aegis A3G Vanguard Harbinger', designation: 'Fighter-Bomber', cost: 7, buildTime: 1, strength: 5, hp: 3, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 2, transportCapacity: 1, description: 'Aegis A3G Vanguard Harbinger (Large Starfighter).', },

    // Cruiser
    halbred: { label: 'Halbred', designation: 'Destroyer', cost: 9, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Halbred (Cruiser).',  imperialOnly: true,},

    // Corvette
    wolf: { label: 'Wolf', designation: 'Corvette', cost: 16, buildTime: 2, strength: 7, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Wolf (Corvette).', },
    wolf_c: { label: 'Wolf (C)', designation: 'Corvette', cost: 16, buildTime: 2, strength: 7, hp: 4, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 1, transportCapacity: 2, description: 'Wolf (C) (Corvette).', },

    // Starfighter
    class_9_stealth: { label: 'Class 9 Stealth', designation: 'Torpedo', cost: 2, buildTime: 1, strength: 4, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 1, description: 'Class 9 Stealth (Starfighter).',  imperialOnly: true,},

    // Heavy Cruiser
    abbadon: { label: 'Abbadon', designation: 'Assault Ship', cost: 14, buildTime: 3, strength: 13, hp: 7, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 5, description: 'Abbadon (Heavy Cruiser).',  requiredPlanetIds: ['p128'],},

    // Star Destroyer
    abbadon_2: { label: 'Abbadon', designation: 'Assault Ship', cost: 12, buildTime: 3, strength: 13, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Abbadon (Star Destroyer).', },

    // Frigate
    vigilant_i: { label: 'Vigilant I', designation: 'Reconnaissance Frigate', cost: 9, buildTime: 2, strength: 6, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 2, description: 'Vigilant I (Frigate).',  imperialOnly: true,},

    // Starfighter
    rhe_recon: { label: 'RHE Recon', designation: 'Sensor Drone', cost: 2, buildTime: 1, strength: 4, hp: 1, canOrbit: true, canSurface: false, hidden: true, jumpDistance: 1, transportCapacity: 1, description: 'RHE Recon (Starfighter).',  imperialOnly: true,},

    // Star Destroyer
    victory_i_2: { label: 'Victory I', designation: 'Star Destroyer', cost: 22, buildTime: 2, strength: 11, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Victory I (Star Destroyer).', },
    victory_ii_2: { label: 'Victory II', designation: 'Star Destroyer', cost: 20, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Victory II (Star Destroyer).', },
    victory_iii_3: { label: 'Victory III', designation: 'Star Destroyer', cost: 22, buildTime: 2, strength: 12, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Victory III (Star Destroyer).', },
    victory_iii_4: { label: 'Victory III', designation: 'Star Destroyer', cost: 20, buildTime: 2, strength: 10, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Victory III (Star Destroyer).', },

    // Heavy Cruiser
    victory_i_3: { label: 'Victory I', designation: 'Star Destroyer', cost: 24, buildTime: 3, strength: 11, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Victory I (Heavy Cruiser).', },
    victory_ii_3: { label: 'Victory II', designation: 'Star Destroyer', cost: 22, buildTime: 2, strength: 9, hp: 5, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 3, transportCapacity: 10, description: 'Victory II (Heavy Cruiser).', },
    victory_iii_5: { label: 'Victory III', designation: 'Star Destroyer', cost: 24, buildTime: 3, strength: 12, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Victory III (Heavy Cruiser).', },
    victory_iii_6: { label: 'Victory III', designation: 'Star Destroyer', cost: 22, buildTime: 3, strength: 10, hp: 6, canOrbit: true, canSurface: false, hidden: false, jumpDistance: 2, transportCapacity: 10, description: 'Victory III (Heavy Cruiser).', },

        // ── Ground units (unchanged) ─────────────────────────────────────────
    garrison: {
      label: 'Garrison', designation: 'Garrison',
      cost: 3, buildTime: 1, strength: 3, hp: 3,
      canOrbit: false, canSurface: true, hidden: false,
      jumpDistance: 0, transportCapacity: 0,
      description: 'Standing defence force. Surface only.',
    },
    militia: {
      label: 'Militia', designation: 'Militia',
      cost: 2, buildTime: 1, strength: 2, hp: 2,
      canOrbit: false, canSurface: true, hidden: true,
      jumpDistance: 0, transportCapacity: 0,
      description: 'Rebel ground forces. Hidden until combat.',
    },
    operative: {
      label: 'Operative', designation: 'Operative',
      cost: 3, buildTime: 1, strength: 1, hp: 1,
      canOrbit: false, canSurface: true, hidden: true,
      jumpDistance: 0, transportCapacity: 0,
      description: 'Special forces. Hidden. Enables covert actions.',
    },
    governor_avatar: {
      label: 'Governor', designation: 'Governor',
      cost: 0, buildTime: 0, strength: 5, hp: 5,
      canOrbit: false, canSurface: true, hidden: true,
      jumpDistance: 1, transportCapacity: 0,
      imperialOnly: true,
      description: 'Governor avatar unit. Represents a governor on the map.',
    },
    emperor: {
      label: 'Emperor', designation: 'The Emperor',
      cost: 0, buildTime: 0, strength: 8, hp: 8,
      canOrbit: false, canSurface: true, hidden: true,
      jumpDistance: 0, transportCapacity: 0,
      imperialOnly: true,
      description: 'The hidden Emperor. Immobile.',
    },
    jedi_avatar: {
      label: 'Jedi', designation: 'Jedi',
      cost: 0, buildTime: 0, strength: 3, hp: 3,
      canOrbit: true, canSurface: true, hidden: true,
      jumpDistance: 2, transportCapacity: 0,
      rebelOnly: true,
      description: 'The player\'s Jedi avatar. Death eliminates the player.',
    },
  },

  // ─────────────────────────────────────────────
  // Combat
  // ─────────────────────────────────────────────
  COMBAT: {
    HIT_CHANCE: 0.4,
    DEFENDER_BONUS: 0.1,
    ORBITAL_FIRST: true,
    PLANET_DEFENCE_BONUS: {
      'Deep Core':             0.20,
      'Core Worlds':           0.15,
      'Colonies':              0.08,
      'Inner Rim':             0.05,
      'Expansion Region':      0,
      'Mid Rim':               0,
      'Outer Rim Territories': -0.05,
      'Tingel Arm':            -0.05,
      'Unknown Regions':       -0.08,
      'Wild Space':            -0.10,
    },
  },

  // ─────────────────────────────────────────────
  // Faction system
  // ─────────────────────────────────────────────
  FACTIONS: {
    FOUND_COST: 5,
    MIN_CONTRIBUTION: 1,
    RANKS: {
      sympathiser: 0,
      operative: 10,
      cell_leader: 25,
      commander: 50,
    },
    IDEOLOGIES: {
      liberation_front: {
        label: 'Liberation Front',
        bonus_types: ['Core Worlds', 'Deep Core', 'Colonies'],
        bonus_multiplier: 1.5,
        description: 'Targets Empire core infrastructure. High risk, high reward.',
        allowed_ship_classes: ['starfighter', 'corvette', 'frigate', 'small_transport'],
        unlockable_ship_classes: ['cruiser', 'heavy_cruiser', 'star_destroyer'],
      },
      workers_alliance: {
        label: "Worker's Alliance",
        bonus_types: ['Expansion Region', 'Mid Rim'],
        bonus_multiplier: 1.4,
        description: 'Organises the working class. Strong on industrial worlds.',
        allowed_ship_classes: ['militia', 'operative', 'large_transport', 'small_transport'],
        unlockable_ship_classes: ['freighter', 'corvette', 'frigate'],
      },
      fringe_collective: {
        label: 'Fringe Collective',
        bonus_types: ['Outer Rim Territories', 'Tingel Arm', 'Unknown Regions', 'Wild Space'],
        bonus_multiplier: 1.5,
        covert_bonus: 0.15,
        description: 'Operates in ungoverned space. Harder to detect.',
        allowed_ship_classes: ['starfighter', 'large_starfighter', 'freighter', 'small_transport'],
        unlockable_ship_classes: ['corvette', 'frigate'],
      },
      shadow_network: {
        label: 'Shadow Network',
        bonus_types: [],
        covert_bonus: 0.25,
        overt_locked: true,
        description: 'Purely clandestine. Invisible but slow.',
        allowed_ship_classes: ['operative', 'militia', 'starfighter'],
        unlockable_ship_classes: ['small_transport', 'large_starfighter'],
      },
      loyalist_splinter: {
        label: 'Loyalist Splinter',
        bonus_types: ['Core Worlds', 'Deep Core'],
        high_loyalty_penalty_removed: true,
        description: 'Poses as loyal citizens. Operates where others cannot.',
        allowed_ship_classes: ['militia', 'operative', 'starfighter'],
        unlockable_ship_classes: ['corvette', 'cruiser'],
      },
      spacer_guild: {
        label: 'Spacer Guild',
        bonus_types: ['Outer Rim Territories', 'Mid Rim'],
        bonus_multiplier: 1.3,
        description: 'Merchant network. Masters of trade routes and logistics.',
        allowed_ship_classes: ['freighter', 'large_transport', 'small_transport', 'landing_ship'],
        unlockable_ship_classes: ['corvette', 'frigate'],
      },
      planetary_militia: {
        label: 'Planetary Militia',
        bonus_types: ['Colonies', 'Expansion Region'],
        bonus_multiplier: 1.2,
        description: 'Local defense forces. Rooted to their worlds.',
        allowed_ship_classes: ['militia', 'operative', 'aerocraft'],
        unlockable_ship_classes: ['starfighter', 'small_transport'],
      },
      mercenary_band: {
        label: 'Mercenary Band',
        bonus_types: ['Outer Rim Territories', 'Wild Space'],
        bonus_multiplier: 1.25,
        description: 'Hired guns. Professional and pragmatic.',
        allowed_ship_classes: ['starfighter', 'large_starfighter', 'corvette'],
        unlockable_ship_classes: ['frigate', 'cruiser'],
      },
      tech_syndicate: {
        label: 'Tech Syndicate',
        bonus_types: ['Core Worlds', 'Colonies'],
        bonus_multiplier: 1.3,
        description: 'Innovation network. Control of advanced systems.',
        allowed_ship_classes: ['large_starfighter', 'small_transport', 'corvette'],
        unlockable_ship_classes: ['frigate', 'cruiser', 'star_destroyer'],
      },
      indigenous_resistance: {
        label: 'Indigenous Resistance',
        bonus_types: ['Mid Rim', 'Outer Rim Territories'],
        bonus_multiplier: 1.2,
        description: 'Native fighters. Connected to their homeland.',
        allowed_ship_classes: ['militia', 'operative', 'aerocraft', 'starfighter'],
        unlockable_ship_classes: ['small_transport', 'large_starfighter'],
      },
    },
    UNLOCK_CHANCE_PER_CONTRIBUTION: 0.08,
    DENUNCIATION_THRESHOLD: 3,

    // ─────────────────────────────────────────────
    // Unit research system
    // ─────────────────────────────────────────────
    UNIT_RESEARCH_BASE_MULTIPLIER: 2.0,     // Research costs 2x the unit cost
    UNIT_RESEARCH_PLANET_MODIFIERS: {
      'Core Worlds':             1.0,       // Standard difficulty
      'Deep Core':               1.1,       // Slightly harder
      'Colonies':                1.0,
      'Inner Rim':               1.05,
      'Mid Rim':                 0.95,      // Slightly easier
      'Outer Rim Territories':   0.9,       // Easier in remote regions
      'Expansion Region':        0.85,      // Easiest
      'Wild Space':              0.8,
      'Unknown Regions':         1.15,      // Much harder
      'Tingel Arm':              0.95,
    },
    // Species difficulty multipliers based on faction home world population type
    UNIT_RESEARCH_SPECIES_MODIFIERS: {
      'default':                 1.0,       // Most species: standard
      'Human population':        1.0,
      'Various population':      0.95,      // Diverse populations research faster
      'Droid population':        0.9,       // Droids excel at research
      'Alien population':        1.05,      // Some alien species research slower
    },

  // ─────────────────────────────────────────────
  // Unit base class mapping (named ships → faction class)
  // ─────────────────────────────────────────────
  UNIT_BASE_CLASSES: {
    't_65_x_wing':              'starfighter',
    't_65ac4_x_wing':           'starfighter',
    't_65br_x_wing':            'starfighter',
    't_65xj_x_wing':            'starfighter',
    'rz_1_a_wing':              'starfighter',
    'btl_a4_y_wing':            'starfighter',
    'btl_a4_y_wing_longprobe':  'starfighter',
    'btl_b_y_wing':             'starfighter',
    'btl_s3_y_wing':            'starfighter',
    'bts_a2_h_wing':            'starfighter',
    'sf_01_b_wing':             'starfighter',
    'sf_02_b_wing_2':           'starfighter',
    'arc_170':                  'starfighter',
    'arrow':                    'starfighter',
    'e_wing_escort_fighter':    'starfighter',
    'e_wing_starfighter':       'starfighter',
    'k_wing_starfighter':       'starfighter',
    't_47_airspeeder':          'aerocraft',
    'ut_60d_u_wing_fighter':    'large_starfighter',
    'x4_gunship':               'large_starfighter',
    // Imperial TIE fighters
    'tie_ln_fighter':           'starfighter',
    'tie_x1_advanced':          'starfighter',
    'tie_interceptor':          'starfighter',
    'tie_bomber':               'starfighter',
  },
    WRONG_DENUNCIATION_PENALTY: 8,
    CORRECT_DENUNCIATION_REWARD: 15,
    TRAITOR_APPARENT_BONUS: 1.3,
    TRAITOR_EXPOSURE_EMPIRE: 8,
  },

  // ─────────────────────────────────────────────
  // Rebel action values
  // ─────────────────────────────────────────────
  ACTIONS: {
    recruit:   { rebellion_delta: 4,  empire_delta: 0, base_leak_chance: 0.15 },
    intel:     { rebellion_delta: 2,  empire_delta: 0, base_leak_chance: 0.05 },
    sabotage:  { rebellion_delta: 8,  empire_delta: 6, always_leaks: true },
    incite:    { rebellion_delta: 8,  empire_delta: 4, always_leaks: true },
    hide:      { rebellion_delta: 0,  empire_delta: 0, base_leak_chance: 0 },
    contribute:{ rebellion_delta: 0,  empire_delta: 0, base_leak_chance: 0.05 },
    found:     { rebellion_delta: 0,  empire_delta: 0, base_leak_chance: 0.1  },
    investigate:{ rebellion_delta: 0, empire_delta: 0, base_leak_chance: 0.05 },
    denounce:  { rebellion_delta: 0,  empire_delta: 0, always_overt: true },
    unit_move: { rebellion_delta: 0,  empire_delta: 0, base_leak_chance: 0.1  },
    fleet_move: { rebellion_delta: 0, empire_delta: 0, base_leak_chance: 0.1  },
    unit_produce: { rebellion_delta: 0, empire_delta: 0, base_leak_chance: 0 },
    unit_attack: { rebellion_delta: 5, empire_delta: 4, always_leaks: true },
    rebel_attack: { rebellion_delta: 0, empire_delta: 0, base_leak_chance: 0 },
  },

  // ─────────────────────────────────────────────
  // Force / RPG system
  // force_alignment: -100 (full dark) → 0 (grey) → +100 (full light)
  // force_strength:  1–20, base combat power of Force abilities
  // ─────────────────────────────────────────────
  FORCE: {
    BASE_STRENGTH: 5,
    // Per-action alignment shift (positive = lightside pull)
    ALIGNMENT_SHIFTS: {
      recruit:     2,   // building popular support — lightside
      intel:       1,   // knowledge, patience
      hide:        1,   // caution over aggression
      earn_money:  3,   // honest work — lightside
      steal_money: -4,  // crime and theft — darkside
      sabotage:   -5,   // destruction — darkside pull
      incite:     -4,   // fear and anger
      denounce:   -2,   // manipulation
      contribute:  0,
      found:       1,
      investigate: 1,
      unit_move:   0,
      fleet_move:  0,
      unit_produce: 0,
      unit_attack: -3,
    },
    // Bonus stats by starting planet region
    STARTING_BONUSES: {
      'Deep Core':             { force_strength: 4, alignment: -15, credits: 3,  desc: 'Ancient nexus of dark side energy. Raw power, dangerous instincts.' },
      'Core Worlds':           { force_strength: 2, alignment: 10,  credits: 5,  desc: 'Jedi tradition runs deep. Strong networks, disciplined mind.' },
      'Colonies':              { force_strength: 2, alignment: 5,   credits: 4,  desc: 'Stable upbringing. Balanced in the Force.' },
      'Inner Rim':             { force_strength: 2, alignment: 2,   credits: 3,  desc: 'Well-connected routes. Pragmatic outlook.' },
      'Expansion Region':      { force_strength: 3, alignment: -5,  credits: 2,  desc: 'Industrial conflict sharpens instincts and edge.' },
      'Mid Rim':               { force_strength: 2, alignment: 3,   credits: 2,  desc: 'Connection to living things. Patient, resilient.' },
      'Outer Rim Territories': { force_strength: 3, alignment: -5,  credits: 1,  desc: 'Survival above all. The Force answers those who endure.' },
      'Tingel Arm':            { force_strength: 3, alignment: -3,  credits: 1,  desc: 'Frontier paths. Resourceful, unpredictable.' },
      'Unknown Regions':       { force_strength: 5, alignment: 0,   credits: 0,  desc: 'Ancient mysteries amplify raw Force potential. Treacherous ground.' },
      'Wild Space':            { force_strength: 4, alignment: -10, credits: 0,  desc: 'Untamed. The dark side runs close to the surface here.' },
    },
    // Regions players can start in (rebel-appropriate)
    VALID_START_REGIONS: [
      'Outer Rim Territories', 'Mid Rim', 'Colonies', 'Inner Rim', 'Expansion Region', 'Tingel Arm',
    ],
    // Combat bonuses
    LIGHTSIDE_DEFENCE_BONUS: 0.12,   // when alignment > THRESHOLD
    DARKSIDE_ATTACK_BONUS:   0.12,   // when alignment < -THRESHOLD
    ALIGNMENT_THRESHOLD:     30,
    FORCE_COMBAT_DICE:        2,     // force_strength adds up to N extra combat dice
    // Force RPG tier progression (1-10 tiers)
    TIERS: {
      1: { name: 'Untrained', pointsRequired: 0,    reachFarAway: false, apprenticeChance: 0.02 },
      2: { name: 'Initiate', pointsRequired: 10,   reachFarAway: false, apprenticeChance: 0.04 },
      3: { name: 'Padawan', pointsRequired: 25,    reachFarAway: false, apprenticeChance: 0.06 },
      4: { name: 'Acolyte', pointsRequired: 45,    reachFarAway: false, apprenticeChance: 0.08 },
      5: { name: 'Knight', pointsRequired: 70,     reachFarAway: true,  apprenticeChance: 0.10 },
      6: { name: 'Master', pointsRequired: 100,    reachFarAway: true,  apprenticeChance: 0.12 },
      7: { name: 'Lord', pointsRequired: 135,      reachFarAway: true,  apprenticeChance: 0.14 },
      8: { name: 'Archon', pointsRequired: 175,    reachFarAway: true,  apprenticeChance: 0.16 },
      9: { name: 'Sage', pointsRequired: 220,      reachFarAway: true,  apprenticeChance: 0.18 },
      10: { name: 'Ancient', pointsRequired: 270,   reachFarAway: true,  apprenticeChance: 0.20 },
    },
    // Force powers and their mechanics
    FORCE_POWERS: {
      find_apprentice: {
        name: 'Find Apprentice',
        description: 'Sense a potential Force user nearby and recruit them',
        costPoints: 5,
        duration: 2,  // rounds active
        baseChance: 0.15,  // base 15% chance
        range: 'adjacent',  // search adjacent planets (same as intel)
      },
    },
  },

  // ─────────────────────────────────────────────
  // Governor action budgets per turn
  // ─────────────────────────────────────────────
  GOVERNOR_ACTION_SLOTS: 6,

  // ─────────────────────────────────────────────
  // Initial architect unit placement
  // ─────────────────────────────────────────────
  INITIAL_ARCHITECT_UNITS: [
    // ── CRASSUS-9 (Military Commander) — Orbital firepower ──
    { planet_id: 'p01', unit_type: 'star_destroyer', layer: 'orbit', strength: 10, hp: 5, owner: 'empire:crassus' },
    { planet_id: 'p01', unit_type: 'star_destroyer', layer: 'orbit', strength: 10, hp: 5, owner: 'empire:crassus' },
    { planet_id: 'p02', unit_type: 'star_destroyer', layer: 'orbit', strength: 10, hp: 5, owner: 'empire:crassus' },
    { planet_id: 'p02', unit_type: 'star_destroyer', layer: 'orbit', strength: 10, hp: 5, owner: 'empire:crassus' },
    { planet_id: 'p06', unit_type: 'heavy_cruiser', layer: 'orbit', strength: 9, hp: 5, owner: 'empire:crassus' },
    { planet_id: 'p06', unit_type: 'heavy_cruiser', layer: 'orbit', strength: 9, hp: 5, owner: 'empire:crassus' },
    { planet_id: 'p12', unit_type: 'cruiser', layer: 'orbit', strength: 8, hp: 5, owner: 'empire:crassus' },
    { planet_id: 'p12', unit_type: 'cruiser', layer: 'orbit', strength: 8, hp: 5, owner: 'empire:crassus' },
    // TIE Fighter squadrons for Crassus
    { planet_id: 'p01', unit_type: 'tie_ln_fighter', layer: 'orbit', strength: 2, hp: 1, owner: 'empire:crassus' },
    { planet_id: 'p01', unit_type: 'tie_ln_fighter', layer: 'orbit', strength: 2, hp: 1, owner: 'empire:crassus' },
    { planet_id: 'p02', unit_type: 'tie_ln_fighter', layer: 'orbit', strength: 2, hp: 1, owner: 'empire:crassus' },
    { planet_id: 'p02', unit_type: 'tie_ln_fighter', layer: 'orbit', strength: 2, hp: 1, owner: 'empire:crassus' },
    { planet_id: 'p06', unit_type: 'tie_ln_fighter', layer: 'orbit', strength: 2, hp: 1, owner: 'empire:crassus' },
    { planet_id: 'p06', unit_type: 'tie_ln_fighter', layer: 'orbit', strength: 2, hp: 1, owner: 'empire:crassus' },
    { planet_id: 'p12', unit_type: 'tie_ln_fighter', layer: 'orbit', strength: 2, hp: 1, owner: 'empire:crassus' },
    { planet_id: 'p12', unit_type: 'tie_ln_fighter', layer: 'orbit', strength: 2, hp: 1, owner: 'empire:crassus' },
    { planet_id: 'p01', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:crassus' },
    { planet_id: 'p02', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:crassus' },
    { planet_id: 'p06', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:crassus' },
    { planet_id: 'p12', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:crassus' },
    // Ground garrisons for Crassus
    { planet_id: 'p01', unit_type: 'garrison', layer: 'surface', strength: 3, hp: 3, owner: 'empire:crassus' },
    { planet_id: 'p01', unit_type: 'garrison', layer: 'surface', strength: 3, hp: 3, owner: 'empire:crassus' },
    { planet_id: 'p02', unit_type: 'garrison', layer: 'surface', strength: 3, hp: 3, owner: 'empire:crassus' },
    { planet_id: 'p02', unit_type: 'garrison', layer: 'surface', strength: 3, hp: 3, owner: 'empire:crassus' },
    { planet_id: 'p06', unit_type: 'garrison', layer: 'surface', strength: 3, hp: 3, owner: 'empire:crassus' },
    { planet_id: 'p06', unit_type: 'garrison', layer: 'surface', strength: 3, hp: 3, owner: 'empire:crassus' },
    { planet_id: 'p12', unit_type: 'garrison', layer: 'surface', strength: 3, hp: 3, owner: 'empire:crassus' },

    // ── SIRIS-VAEL (Intelligence Director) — Scout and intercept fleet ──
    { planet_id: 'p04', unit_type: 'cruiser', layer: 'orbit', strength: 8, hp: 5, owner: 'empire:siris' },
    { planet_id: 'p04', unit_type: 'cruiser', layer: 'orbit', strength: 8, hp: 5, owner: 'empire:siris' },
    { planet_id: 'p11', unit_type: 'frigate', layer: 'orbit', strength: 7, hp: 5, owner: 'empire:siris' },
    { planet_id: 'p11', unit_type: 'frigate', layer: 'orbit', strength: 7, hp: 5, owner: 'empire:siris' },
    { planet_id: 'p14', unit_type: 'frigate', layer: 'orbit', strength: 7, hp: 5, owner: 'empire:siris' },
    { planet_id: 'p14', unit_type: 'frigate', layer: 'orbit', strength: 7, hp: 5, owner: 'empire:siris' },
    { planet_id: 'p18', unit_type: 'corvette', layer: 'orbit', strength: 6, hp: 4, owner: 'empire:siris' },
    { planet_id: 'p18', unit_type: 'corvette', layer: 'orbit', strength: 6, hp: 4, owner: 'empire:siris' },
    // TIE Fighter squadrons for Siris (Interceptor-focused)
    { planet_id: 'p04', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:siris' },
    { planet_id: 'p04', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:siris' },
    { planet_id: 'p11', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:siris' },
    { planet_id: 'p11', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:siris' },
    { planet_id: 'p14', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:siris' },
    { planet_id: 'p14', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:siris' },
    { planet_id: 'p18', unit_type: 'tie_x1_advanced', layer: 'orbit', strength: 4, hp: 2, owner: 'empire:siris' },
    { planet_id: 'p18', unit_type: 'tie_x1_advanced', layer: 'orbit', strength: 4, hp: 2, owner: 'empire:siris' },
    { planet_id: 'p04', unit_type: 'tie_x1_advanced', layer: 'orbit', strength: 4, hp: 2, owner: 'empire:siris' },
    { planet_id: 'p11', unit_type: 'tie_x1_advanced', layer: 'orbit', strength: 4, hp: 2, owner: 'empire:siris' },
    // Ground presence for Siris
    { planet_id: 'p04', unit_type: 'garrison', layer: 'surface', strength: 2, hp: 3, owner: 'empire:siris' },
    { planet_id: 'p04', unit_type: 'garrison', layer: 'surface', strength: 2, hp: 3, owner: 'empire:siris' },
    { planet_id: 'p11', unit_type: 'garrison', layer: 'surface', strength: 2, hp: 3, owner: 'empire:siris' },
    { planet_id: 'p11', unit_type: 'garrison', layer: 'surface', strength: 2, hp: 3, owner: 'empire:siris' },

    // ── MAREN OSK (Political Operator) — Defensive fleet ──
    { planet_id: 'p12', unit_type: 'heavy_cruiser', layer: 'orbit', strength: 9, hp: 5, owner: 'empire:maren' },
    { planet_id: 'p12', unit_type: 'heavy_cruiser', layer: 'orbit', strength: 9, hp: 5, owner: 'empire:maren' },
    { planet_id: 'p17', unit_type: 'cruiser', layer: 'orbit', strength: 8, hp: 5, owner: 'empire:maren' },
    { planet_id: 'p17', unit_type: 'cruiser', layer: 'orbit', strength: 8, hp: 5, owner: 'empire:maren' },
    { planet_id: 'p22', unit_type: 'frigate', layer: 'orbit', strength: 7, hp: 5, owner: 'empire:maren' },
    { planet_id: 'p22', unit_type: 'frigate', layer: 'orbit', strength: 7, hp: 5, owner: 'empire:maren' },
    { planet_id: 'p25', unit_type: 'frigate', layer: 'orbit', strength: 7, hp: 5, owner: 'empire:maren' },
    { planet_id: 'p25', unit_type: 'frigate', layer: 'orbit', strength: 7, hp: 5, owner: 'empire:maren' },
    // TIE Fighter squadrons for Maren (Bomber-focused for ground support)
    { planet_id: 'p12', unit_type: 'tie_bomber', layer: 'orbit', strength: 3, hp: 2, owner: 'empire:maren' },
    { planet_id: 'p12', unit_type: 'tie_bomber', layer: 'orbit', strength: 3, hp: 2, owner: 'empire:maren' },
    { planet_id: 'p17', unit_type: 'tie_bomber', layer: 'orbit', strength: 3, hp: 2, owner: 'empire:maren' },
    { planet_id: 'p17', unit_type: 'tie_bomber', layer: 'orbit', strength: 3, hp: 2, owner: 'empire:maren' },
    { planet_id: 'p22', unit_type: 'tie_bomber', layer: 'orbit', strength: 3, hp: 2, owner: 'empire:maren' },
    { planet_id: 'p22', unit_type: 'tie_bomber', layer: 'orbit', strength: 3, hp: 2, owner: 'empire:maren' },
    { planet_id: 'p25', unit_type: 'tie_ln_fighter', layer: 'orbit', strength: 2, hp: 1, owner: 'empire:maren' },
    { planet_id: 'p25', unit_type: 'tie_ln_fighter', layer: 'orbit', strength: 2, hp: 1, owner: 'empire:maren' },
    { planet_id: 'p12', unit_type: 'tie_ln_fighter', layer: 'orbit', strength: 2, hp: 1, owner: 'empire:maren' },
    { planet_id: 'p17', unit_type: 'tie_ln_fighter', layer: 'orbit', strength: 2, hp: 1, owner: 'empire:maren' },
    // Ground garrisons for Maren
    { planet_id: 'p12', unit_type: 'garrison', layer: 'surface', strength: 3, hp: 3, owner: 'empire:maren' },
    { planet_id: 'p12', unit_type: 'garrison', layer: 'surface', strength: 3, hp: 3, owner: 'empire:maren' },
    { planet_id: 'p17', unit_type: 'garrison', layer: 'surface', strength: 3, hp: 3, owner: 'empire:maren' },

    // ── VEKTIS-4 (Adaptive Intelligence) — Rapid response fleet ──
    { planet_id: 'p06', unit_type: 'star_destroyer', layer: 'orbit', strength: 10, hp: 5, owner: 'empire:vektis' },
    { planet_id: 'p06', unit_type: 'cruiser', layer: 'orbit', strength: 8, hp: 5, owner: 'empire:vektis' },
    { planet_id: 'p14', unit_type: 'cruiser', layer: 'orbit', strength: 8, hp: 5, owner: 'empire:vektis' },
    { planet_id: 'p14', unit_type: 'cruiser', layer: 'orbit', strength: 8, hp: 5, owner: 'empire:vektis' },
    { planet_id: 'p32', unit_type: 'frigate', layer: 'orbit', strength: 7, hp: 5, owner: 'empire:vektis' },
    { planet_id: 'p32', unit_type: 'frigate', layer: 'orbit', strength: 7, hp: 5, owner: 'empire:vektis' },
    { planet_id: 'p45', unit_type: 'corvette', layer: 'orbit', strength: 6, hp: 4, owner: 'empire:vektis' },
    { planet_id: 'p45', unit_type: 'corvette', layer: 'orbit', strength: 6, hp: 4, owner: 'empire:vektis' },
    // TIE Fighter squadrons for Vektis (Advanced & Interceptor mix)
    { planet_id: 'p06', unit_type: 'tie_x1_advanced', layer: 'orbit', strength: 4, hp: 2, owner: 'empire:vektis' },
    { planet_id: 'p06', unit_type: 'tie_x1_advanced', layer: 'orbit', strength: 4, hp: 2, owner: 'empire:vektis' },
    { planet_id: 'p14', unit_type: 'tie_x1_advanced', layer: 'orbit', strength: 4, hp: 2, owner: 'empire:vektis' },
    { planet_id: 'p14', unit_type: 'tie_x1_advanced', layer: 'orbit', strength: 4, hp: 2, owner: 'empire:vektis' },
    { planet_id: 'p32', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:vektis' },
    { planet_id: 'p32', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:vektis' },
    { planet_id: 'p45', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:vektis' },
    { planet_id: 'p45', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:vektis' },
    { planet_id: 'p06', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:vektis' },
    { planet_id: 'p14', unit_type: 'tie_interceptor', layer: 'orbit', strength: 3, hp: 1, owner: 'empire:vektis' },
    // Ground presence for Vektis
    { planet_id: 'p06', unit_type: 'garrison', layer: 'surface', strength: 2, hp: 3, owner: 'empire:vektis' },

    // ── GOVERNOR AVATARS (Hidden units) ──
    { planet_id: 'p01', unit_type: 'governor_avatar', layer: 'surface', strength: 5, hp: 5, owner: 'empire:crassus', designation: 'Governor-General Crassus-9' },
    { planet_id: 'p04', unit_type: 'governor_avatar', layer: 'surface', strength: 5, hp: 5, owner: 'empire:siris', designation: 'Director Siris-Vael' },
    { planet_id: 'p12', unit_type: 'governor_avatar', layer: 'surface', strength: 5, hp: 5, owner: 'empire:maren', designation: 'Governor Maren Osk' },
    { planet_id: 'p06', unit_type: 'governor_avatar', layer: 'surface', strength: 5, hp: 5, owner: 'empire:vektis', designation: 'Governor Vektis-4' },

    // ── THE EMPEROR (Hidden unit) ──
    { planet_id: 'p01', unit_type: 'emperor', layer: 'surface', strength: 8, hp: 8, owner: 'empire:emperor', designation: 'The Emperor' },
  ],
};

if (typeof module !== 'undefined') module.exports = CONFIG;
