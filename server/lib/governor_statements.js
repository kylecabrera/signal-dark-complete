// Governor personality statements based on actions
const GOV_STATEMENTS = {
  'siris': {
    name: 'Siris-Vael',
    avatar: '🔍',
    patrol: [
      'Probability matrices recalibrated. Patrol vectors optimized.',
      'The odds are shifting in our favor. Surveillance intensified.',
      'Pattern recognition systems online. No movement escapes detection.',
      'Calculations suggest heightened activity. Observation grids deployed.',
      'Intelligence networks tightening. Nowhere left to hide.',
    ],
    scan: [
      'Sector analysis complete. Anomalies catalogued.',
      'Data streams processed. Rebel signatures isolated.',
      'Thermal imaging reveals hidden movements.',
      'Communications intercepts confirm rebel staging.',
      'Probability models predict rebel concentration here.',
    ],
    discovery: [
      'Unexpected. I have identified rebel infrastructure.',
      'Excellent. A rebel cell has been exposed.',
      'The pattern becomes clearer. Another nest of traitors.',
      'Insurgent network mapped. Elimination authorized.',
    ]
  },
  'crassus': {
    name: 'Crassus-9',
    avatar: '⚔️',
    sweep: [
      'Sweep teams deployed. The rebellion ends with overwhelming force.',
      'Military might descending. Rebel resistance will be crushed.',
      'Drop ships inbound. This world will bend or break.',
      'Assault formations ready. Time for the rebels to face real soldiers.',
      'Orbital bombardment standing by. Rebel positions marked for annihilation.',
    ],
    produce: [
      'New units rolling off production lines. More firepower incoming.',
      'Fleet strength increasing. Rebel odds of survival plummeting.',
      'Reinforcements arrived. The rebellion is outnumbered and outgunned.',
      'Military expansion accelerating. Overwhelming force principle engaged.',
    ],
    victory: [
      'Another planet pacified. The rebellion shrinks.',
      'Rebel stronghold destroyed. Their cause is lost.',
      'Insurgent forces eliminated. Order restored.',
      'Victory through superior firepower. As always.',
    ]
  },
  'maren': {
    name: 'Maren Osk',
    avatar: '🕷️',
    propaganda: [
      'Disinformation campaign activated. Citizens will choose loyalty willingly.',
      'Public opinion shifting. The people reject the rebellion\'s lies.',
      'Media control ensuring. Truth is what we say it is.',
      'Hearts and minds being won. Rebellion support is crumbling.',
      'Subtle manipulation at work. The population turns against the insurgents.',
    ],
    blackmail: [
      'Leverage acquired on rebel sympathizer.',
      'Informant networks expanding. Rebellion compromised from within.',
      'Secrets exposed. Rebel morale collapsing.',
      'Compromised officials proving... cooperative.',
    ],
    discovery: [
      'A cell discovered through my intelligence sources.',
      'Rebellion\'s structure laid bare to my analysis.',
      'The traitors reveal themselves. I see all.',
      'Another thread in the web. And I control the web.',
    ]
  },
  'vektis': {
    name: 'Vektis-4',
    avatar: '⚙️',
    scan: [
      'Behavioral modeling complete. Rebel patterns predictable.',
      'Threat assessment updated. Confidence margin: expanding.',
      'Machine learning cycles advancing. Prediction accuracy: 94.7%.',
      'Adaptive response protocols engaged. Learning your tactics faster than you evolve them.',
      'Neural networks converging on solution. The rebellion is data. I am inevitable.',
    ],
    move: [
      'Unit positioning optimized via combat simulation algorithms.',
      'Fleet maneuvers executing predicted attack vectors.',
      'Convergence pattern initiated. You cannot escape what I have calculated.',
      'Tactical disposition follows mathematical certainty of victory.',
    ],
    discovery: [
      'Anomaly pattern recognized. Rebel activity detected.',
      'Signature match confirmed. Target identified.',
      'Behavioral traces located. Insurgent position calculated.',
      'The algorithms never lie. Your rebellion is here. I am coming.',
    ]
  },
  'quorum': {
    name: 'The Quorum',
    avatar: '👥',
    consensus: [
      'Four minds. One purpose. The rebellion\'s end is near.',
      'Unified command structure engaged. Coordinated assault commencing.',
      'All four governors aligned. Total sector control assured.',
      'Quorum consensus: annihilation protocols authorized.',
      'Four governors, one will. Your fate is sealed.',
    ]
  }
};

function getGovernorStatement(governor, actionType) {
  const govData = GOV_STATEMENTS[governor];
  if (!govData) return null;

  // Map action types to statement pools
  const pool = govData[actionType] || govData.discovery;
  if (!pool || pool.length === 0) return null;

  const statement = pool[Math.floor(Math.random() * pool.length)];
  return `[${govData.avatar} ${govData.name}] ${statement}`;
}

module.exports = { GOV_STATEMENTS, getGovernorStatement };
