const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let gameState = createNewGameState();

function createNewGameState() {
  return {
    hunger: 50,
    energy: 70,
    health: 100,
    points: 0,
    isAlive: true,
    actionsTaken: 0
  };
}

app.post('/api/action', (req, res) => {
  if (!gameState.isAlive) {
    return res.json({ 
      error: "Game over! Refresh to restart.",
      points: gameState.points 
    });
  }

  const action = req.body.action;
  let event = "";

  switch(action) {
    case 'hunt':
      if (gameState.energy >= 20) {
        gameState.hunger += 30;
        gameState.energy -= 20;
        event = "🦖 Hunted successfully! +15pts";
        gameState.points += 15;
      } else {
        event = "😴 Too tired to hunt! +5pts";
        gameState.points += 5;
      }
      break;

    case 'rest':
      gameState.energy += 40;
      gameState.hunger -= 15;
      event = "💤 Rested well +10pts";
      gameState.points += 10;
      break;

    case 'drink':
      gameState.health = Math.min(100, gameState.health + 20);
      event = "💦 Drank water +5pts";
      gameState.points += 5;
      break;
  }

  if (Math.random() < 0.3) {
    event += " | 🌋 Volcanic eruption! +10pts";
    gameState.health -= 10;
    gameState.points += 10;
  }

  gameState.hunger = Math.max(0, gameState.hunger - 5);
  gameState.energy = Math.max(0, gameState.energy - 3);
  gameState.actionsTaken++;
  gameState.points += 10; 

  gameState.isAlive = gameState.health > 0 && gameState.hunger > 0;

  res.json({
    hunger: gameState.hunger,
    energy: gameState.energy,
    health: gameState.health,
    points: gameState.points,
    event: `${event} | Total Points: ${gameState.points}`
  });
});

app.post('/api/reset', (req, res) => {
  gameState = createNewGameState();
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});