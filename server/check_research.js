const db = require('./lib/db');

(async () => {
  try {
    // Get one faction
    const { rows: factions } = await db.pool.query(
      `SELECT id, name, ideology FROM factions LIMIT 1`
    );
    if (factions.length === 0) {
      console.log('No factions found');
      process.exit(0);
    }
    
    const faction = factions[0];
    console.log(`\nFaction: ${faction.name} (${faction.ideology})`);
    
    // Check research entries
    const { rows: research } = await db.pool.query(
      `SELECT unit_type, unlocked, research_points FROM faction_unit_research 
       WHERE faction_id = $1 
       ORDER BY unit_type
       LIMIT 10`,
      [faction.id]
    );
    
    console.log(`\nResearch entries (showing first 10):`);
    if (research.length === 0) {
      console.log('  (none found)');
    } else {
      research.forEach(r => {
        console.log(`  ${r.unit_type}: unlocked=${r.unlocked}, points=${r.research_points}`);
      });
    }
    
    const { rows: count } = await db.pool.query(
      `SELECT COUNT(*) as total FROM faction_unit_research WHERE faction_id = $1`,
      [faction.id]
    );
    console.log(`\nTotal research entries: ${count[0].total}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
