const io = require('socket.io-client');

async function testFleetSystem() {
  // Step 1: Create game
  console.log('Step 1: Creating game...');
  const createRes = await fetch('http://localhost:3001/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName: 'Player1' })
  });
  const game1 = await createRes.json();
  const sessionId = game1.sessionId;
  const code = game1.code;
  const player1Id = game1.playerId;
  console.log(`✓ Game created: ${code} (${sessionId})`);
  console.log(`  Player 1: ${player1Id}`);

  // Step 2: Join with second player
  console.log('\nStep 2: Joining with second player...');
  const joinRes = await fetch(`http://localhost:3001/api/sessions/${code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName: 'Player2' })
  });
  const game2 = await joinRes.json();
  const player2Id = game2.playerId;
  console.log(`✓ Player 2 joined: ${player2Id}`);

  // Step 3: Check state before ready
  console.log('\nStep 3: Checking state before ready...');
  const beforeRes = await fetch(`http://localhost:3001/api/admin/${sessionId}/state?adminToken=test123`);
  const before = await beforeRes.json();
  const unitsBefore = before.units.length;
  console.log(`  Units: ${unitsBefore}`);
  console.log(`  Game status: ${before.session.status}`);

  // Step 4: Ready up via Socket.io
  console.log('\nStep 4: Ready up via Socket.io...');
  
  const socket1 = io('http://localhost:3001');
  const socket2 = io('http://localhost:3001');

  await new Promise(resolve => {
    let readyCount = 0;
    socket1.on('connect', () => {
      console.log(`  Socket 1 connected`);
      socket1.emit('join_game', { sessionId, playerId: player1Id });
    });
    
    socket2.on('connect', () => {
      console.log(`  Socket 2 connected`);
      socket2.emit('join_game', { sessionId, playerId: player2Id });
    });

    socket1.on('game_started', (state) => {
      console.log(`✓ Game started! Status: ${state.status}`);
      readyCount++;
      if (readyCount >= 1) {
        setTimeout(resolve, 500);
      }
    });

    socket2.on('game_started', (state) => {
      readyCount++;
      if (readyCount >= 1) {
        setTimeout(resolve, 500);
      }
    });

    setTimeout(() => {
      socket1.emit('player_ready');
      socket2.emit('player_ready');
    }, 500);

    setTimeout(() => {
      console.error('Timeout waiting for game start');
      resolve();
    }, 5000);
  });

  socket1.disconnect();
  socket2.disconnect();

  // Step 5: Check state after ready
  console.log('\nStep 5: Checking state after ready...');
  await new Promise(r => setTimeout(r, 500));
  const afterRes = await fetch(`http://localhost:3001/api/admin/${sessionId}/state?adminToken=test123`);
  const after = await afterRes.json();
  console.log(`  Game status: ${after.session.status}`);
  console.log(`  Units: ${after.units.length}`);

  // Step 6: Check fleets
  console.log('\nStep 6: Checking fleets...');
  const fleetsRes = await fetch(`http://localhost:3001/api/admin/${sessionId}/state?adminToken=test123`);
  const fleets = await fleetsRes.json();
  
  // Count units with fleet_id
  const unitsWithFleet = after.units.filter(u => u.fleet_id).length;
  console.log(`  Units with fleet_id: ${unitsWithFleet}`);
  console.log(`  Total units: ${after.units.length}`);
  
  // Check unique fleet owners
  const owners = new Set(after.units.filter(u => u.fleet_id).map(u => u.owner));
  console.log(`  Unique owners with fleets: ${owners.size}`);
  owners.forEach(owner => {
    const count = after.units.filter(u => u.owner === owner && u.fleet_id).length;
    console.log(`    - ${owner}: ${count} units`);
  });

  console.log('\n✓ Fleet system test complete!');
}

testFleetSystem().catch(console.error);
