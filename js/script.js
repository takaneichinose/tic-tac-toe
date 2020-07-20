let Player = {
  X: 0,
  O: 1
}

let Difficulty = {
  Easy: 0,
  Medium: 1,
  Hard: 2
}

let Matches = {
  Two: 2,
  One: 4
}

let app = new Vue({
  el: "#tic_tac_toe",
  data: {
    buttons: [],
    combinations: [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ],
    GameTitle: "Tic Tac Toe V.3",
    aiPlayer: null,
    aiDifficulty: null,
    turn: 0,
    play: true,
    match: null,
    showDialog: true,
    winningPlayer: null,
    dialogStep: 0
  },
  methods: {
    // Analyze the provided combination if the player gets
    // 3 consecutives. For AI purposes, +2 of each was added
    // if has 2 combinations. +4 if has 1 combination.
    analyzeCombination: function(open) {
      open.sort();

      let countX = 0;
      let countO = 0;

      for (let i in open) {
        if (open[i] === Player.X) {
          countX++;
        } else if (open[i] === Player.O) {
          countO++;
        }
      }

      if (countX === 3) {
        return Player.X;
      } else if (countO === 3) {
        return Player.O;
      } else if (countX === 2) {
        return Player.X + Matches.Two;
      } else if (countO === 2) {
        return Player.O + Matches.Two;
      } else if (countX === 1) {
        return Player.X + Matches.One;
      } else if (countO === 1) {
        return Player.O + Matches.One;
      } else {
        return null;
      }
    },
    createOpened: function(combination) {
      let open = [];

      for (let i = 0; i < combination.length; i++) {
        let index = combination[i];

        open.push(this.buttons[index].player);
      }

      return open;
    },
    // Find the combinations of the opened tiles
    findCombination: function() {
      for (let i = 0; i < this.combinations.length; i++) {
        let combination = this.combinations[i];
        let open = this.createOpened(combination);
        let analysis = this.analyzeCombination(open);

        if (analysis === Player.X || analysis === Player.O) {
          this.play = false;

          this.match = combination;

          return true;
        }
      }

      return false;
    },
    // Get the buttons that aren't yet opened
    getFreeButtons: function() {
      let freeButtons = [];

      for (let i = 0; i < this.buttons.length; i++) {
        if (this.buttons[i].active === false) {
          freeButtons.push(i);
        }
      }

      return freeButtons;
    },
    // Insert the possible turn of AI
    robotInsertTurn: function(combination) {
      let turn = null;

      for (let j = 0; j < combination.length; j++) {
        if (this.buttons[combination[j]].player === null) {
          turn = combination[j];
          break;
        }
      }

      return turn;
    },
    // Random move by AI
    robotRandom: function() {
      let freeButtons = this.getFreeButtons();
      let random = Math.round(Math.random() * (freeButtons.length - 1));

      if (random >= 0) {
        return freeButtons[random];
      } else {
        return null;
      }
    },
    // Find combination for AI move
    robotCombinaton: function(selectedMatches) {
      let turn = null;

      for (let i = 0; i < this.combinations.length; i++) {
        let combination = this.combinations[i];
        let open = this.createOpened(combination);
        let analysis = this.analyzeCombination(open);

        // First priority is 2 matches, then 1
        if (analysis === selectedMatches) {
          turn = this.robotInsertTurn(combination);

          break;
        }
      }

      return turn;
    },
    // Attack move by AI
    robotAttack: function(tileIndex) {
      if (tileIndex === null) {
        tileIndex = this.robotCombinaton(this.aiPlayer + Matches.Two);
      }

      if (tileIndex === null) {
        tileIndex = this.robotCombinaton(this.aiPlayer + Matches.One);
      }

      return tileIndex;
    },
    // Defend move by AI
    robotDefend: function() {
      let tileIndex = null;
      let human = this.aiPlayer === 0 ? 1 : 0;

      tileIndex = this.robotCombinaton(human + Matches.Two);

      return tileIndex;
    },
    // Move of the player (AI)
    robotMove: function() {
      if (this.turn === this.aiPlayer) {
        let tileIndex = null;

        switch (this.aiDifficulty) {
          case Difficulty.Easy:
            tileIndex = this.robotRandom();

            break;
          case Difficulty.Medium:
            tileIndex = this.robotAttack(tileIndex);

            if (tileIndex === null) {
              tileIndex = this.robotRandom();
            }

            break;
          case Difficulty.Hard:
            tileIndex = this.robotCombinaton(this.aiPlayer + Matches.Two);

            if (tileIndex === null) {
              tileIndex = this.robotDefend();
            }

            if (tileIndex === null) {
              tileIndex = this.robotCombinaton(this.aiPlayer + Matches.One);
            }

            if (tileIndex === null) {
              tileIndex = this.robotRandom();
            }

            break;
        }

        if (tileIndex !== null) {
          this.makeDecision(tileIndex);
        }
      }
    },
    // Move of the player (human)
    humanMove: function(elm) {
      if (!elm.classList.contains("active")) {
        let tileIndex = elm.dataset.tile;

        this.makeDecision(tileIndex);

        if (this.aiPlayer !== null) {
          this.robotMove();
        }
      }
    },
    // Make decision on rendering the board
    makeDecision: function(tileIndex) {
      if (tileIndex !== null) {
        this.buttons[tileIndex].active = true;
        this.buttons[tileIndex].player = this.turn;
      }

      if (this.findCombination() === true) {
        this.decideGameWin();

        return;
      }

      if (this.findAnotherTile() === false) {
        this.showDialog = true;

        return;
      }

      this.turn = this.turn === 0 ? 1 : 0;
    },
    // Changes the buttons color into match
    changeButtonsToMatch: function() {
      for (let i = 0; i < this.match.length; i++) {
        let j = this.match[i];

        this.buttons[j].match = true;
      }
    },
    // Find another available tile
    findAnotherTile: function() {
      let hasTile = false;

      for (let i = 0; i < this.buttons.length; i++) {
        if (this.buttons[i].active === false) {
          hasTile = true;

          break;
        }
      }

      return hasTile;
    },
    // Game win event
    decideGameWin: function() {
      this.changeButtonsToMatch();

      this.showDialog = true;

      this.winningPlayer = Player[this.turn];
    },
    // Creates the tic tac toe map
    createMap: function() {
      for (let i = 0; i < 9; i++) {
        this.buttons.push({
          player: null,
          active: false,
          match: false
        });
      }
    },
    // Event when the tile is clicked
    tileClick: function(e) {
      if (this.play === true) {
        if (this.turn === this.aiPlayer) {
          return false;
        }

        let elm = e.target;

        this.humanMove(elm);
      }
    },
    // Proceed to next step of the dialog
    proceedToNext: function() {
      this.dialogStep += 1;
    },
    // Choose the opponent to play with
    chooseOpponent: function(isRobot) {
      if (isRobot === true) {
        this.proceedToNext();
      } else {
        this.dialogStep = 4;
        this.showDialog = false;
      }
    },
    // Choose your player (VS AI)
    choosePlayer: function(chosenPlayer) {
      this.aiPlayer = chosenPlayer === 0 ? 1 : 0;

      this.proceedToNext();
    },
    // Choose the AI difficulty
    chooseDifficulty: function(difficulty) {
      this.aiDifficulty = difficulty;

      this.dialogStep = 4;
      this.showDialog = false;

      if (this.aiPlayer === Player.X) {
        this.robotMove();
      }
    },
    // Start the game with same settings
    playAgain: function() {
      this.buttons = [];
      this.turn = 0;
      this.play = true;
      this.match = null;
      this.winningPlayer = null;
      this.showDialog = false;
      this.dialogStep = 4;

      this.createMap();

      if (this.aiPlayer === Player.X) {
        this.robotMove();
      }
    },
    // Initialize the game
    initialize: function() {
      this.aiPlayer = null;
      this.aiDifficulty = null;

      this.playAgain();

      this.showDialog = true;
      this.dialogStep = 0;
    }
  },
  created() {
    this.initialize();
  }
});
