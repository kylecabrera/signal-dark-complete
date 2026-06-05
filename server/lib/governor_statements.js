// Governor personality statements based on actions
// All governors can do all actions, just with different emotional personalities
const GOV_STATEMENTS = {
  'siris': {
    name: 'Siris-Vael',
    avatar: '🔍',
    tone: 'analytical',
    actions: {
      patrol: [
        'Probabilities shifting. Increased surveillance deployed.',
        'Pattern matrices updated. Observation intensified.',
        'Likelihood calculations suggest heightened rebel activity here.',
      ],
      sweep: [
        'Sector analysis initiated. No stone left unturned.',
        'Data suggests rebel concentration. Full sweeps authorized.',
        'Predictive models indicate rebel positions. Investigation commencing.',
      ],
      produce: [
        'Production optimized through strategic analysis.',
        'Supply chain efficiency models implemented.',
        'Unit output calculated to mathematical precision.',
      ],
      move: [
        'Troop positioning follows calculated probabilities.',
        'Fleet movements based on game-theoretic analysis.',
        'Strategic placement optimizing threat coverage.',
      ],
      propaganda: [
        'Public opinion modeling suggests loyalty intervention.',
        'Messaging crafted to exploit psychological patterns.',
        'Information campaign tailored to predicted demographics.',
      ],
      blackmail: [
        'Leverage points identified through data analysis.',
        'Compromised individuals located via network analysis.',
        'Informant placement following probability matrices.',
      ],
      discovery: [
        'Pattern recognition reveals rebel infrastructure.',
        'Anomaly detection systems locate insurgent cells.',
        'Data analysis confirms rebel presence.',
      ]
    }
  },
  'crassus': {
    name: 'Crassus-9',
    avatar: '⚔️',
    tone: 'aggressive',
    actions: {
      patrol: [
        'Combat patrols deployed. Rebels won\'t escape.',
        'War machines rolling out. Dominance assured.',
        'Military might on display. Fear spreads.',
      ],
      sweep: [
        'Assault teams crushing resistance. No mercy.',
        'Brutal force descending. Rebellion ends now.',
        'Overwhelming firepower committed. This world bends or breaks.',
      ],
      produce: [
        'War factories running at maximum output.',
        'Weapons flooding in. Rebel numbers mean nothing.',
        'Arsenal expanding. Victory through strength.',
      ],
      move: [
        'Forces repositioning for maximum devastation.',
        'Military might shifting. Nowhere is safe.',
        'Armies marching. Rebellion will be crushed.',
      ],
      propaganda: [
        'Fear propaganda spreading. Citizens surrender willingly.',
        'Intimidation messaging deployed. Morale breaking.',
        'Threats and power displays convincing the population.',
      ],
      blackmail: [
        'Hostage leverage compelling cooperation.',
        'Threat tactics breaking rebel sympathizers.',
        'Intimidation exposing rebel collaborators.',
      ],
      discovery: [
        'Rebels found. They will pay.',
        'Insurgents located. Annihilation incoming.',
        'Enemy cells identified. Extermination authorized.',
      ]
    }
  },
  'maren': {
    name: 'Maren Osk',
    avatar: '🕷️',
    tone: 'manipulative',
    actions: {
      patrol: [
        'Subtle monitoring in place. Citizens watched.',
        'Informant networks observing. Nothing escapes notice.',
        'Delicate surveillance ensuring loyalty.',
      ],
      sweep: [
        'Civil order enforcement maintaining control.',
        'Police action removing undesirables.',
        'Public safety operations crushing dissent.',
      ],
      produce: [
        'Production managed through bureaucratic efficiency.',
        'Supply networks controlled by imperial oversight.',
        'Resource allocation ensuring continued dominance.',
      ],
      move: [
        'Forces repositioned through administrative channels.',
        'Troop movements disguised as routine transfers.',
        'Military deployment cloaked in policy language.',
      ],
      propaganda: [
        'Hearts and minds being won through persuasion.',
        'Public opinion shifting toward loyalty.',
        'Disinformation campaign gaining traction.',
      ],
      blackmail: [
        'Leverage acquired. Cooperation ensured.',
        'Secrets exposed. Compliance guaranteed.',
        'Blackmail networks expanding. Control tightening.',
      ],
      discovery: [
        'Rebel infrastructure exposed through investigation.',
        'Conspiracy uncovered via intelligence networks.',
        'Insurgent sympathizers identified.',
      ]
    }
  },
  'vektis': {
    name: 'Vektis-4',
    avatar: '⚙️',
    tone: 'cold',
    actions: {
      patrol: [
        'Surveillance protocols optimized. Detection probability: 97%.',
        'Adaptive monitoring systems deployed.',
        'Machine learning algorithms tracking patterns.',
      ],
      sweep: [
        'Automated search protocols initiated.',
        'Systematic elimination of targets commencing.',
        'Precise tactical operations executing.',
      ],
      produce: [
        'Production efficiency maximized through algorithmic control.',
        'Output scaled according to strategic calculations.',
        'Automated manufacturing optimized.',
      ],
      move: [
        'Unit positioning executing optimal tactical placement.',
        'Fleet movements following calculated vectors.',
        'Strategic repositioning based on threat analysis.',
      ],
      propaganda: [
        'Psychological manipulation vectors activated.',
        'Population control messaging implemented.',
        'Behavioral modification campaigns executing.',
      ],
      blackmail: [
        'Compromised assets identified and activated.',
        'Leverage points extracted from behavioral analysis.',
        'Controlled individuals deployed operationally.',
      ],
      discovery: [
        'Rebel signature confirmed. Target located.',
        'Insurgent cell detected. Parameters calculated.',
        'Pattern match: 99.8% probability of rebel activity.',
      ]
    }
  },
  'quorum': {
    name: 'The Quorum',
    avatar: '👥',
    tone: 'unified',
    actions: {
      consensus: [
        'Four voices, one decision. The rebellion ends.',
        'Unified command structure engaged. Joint operations authorized.',
        'Quorum consensus: total sector dominance assured.',
        'All governors aligned. Your fate sealed.',
        'Coordinated assault commencing. Resistance is futile.',
      ]
    }
  }
};

function getGovernorStatement(governor, actionType) {
  const govData = GOV_STATEMENTS[governor];
  if (!govData) return null;

  // Get the action pool for this governor (or use all actions if not found)
  let pool = govData.actions?.[actionType];

  // If this action isn't specifically defined, pick a random action from their repertoire
  if (!pool) {
    const allActions = Object.keys(govData.actions || {});
    const randomAction = allActions[Math.floor(Math.random() * allActions.length)];
    pool = govData.actions?.[randomAction] || govData.actions?.discovery;
  }

  if (!pool || pool.length === 0) return null;

  const statement = pool[Math.floor(Math.random() * pool.length)];
  return `[${govData.avatar} ${govData.name}] ${statement}`;
}

module.exports = { GOV_STATEMENTS, getGovernorStatement };
