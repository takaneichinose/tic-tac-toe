class Tic {
  constructor() {
    this.storage   = new Array();
    this.pattern   = new Array();
    this.button    = document.querySelectorAll('.but');
    this.play      = 1;
    this.winPlay   = null;
  }
  
  buildPattern() {
    this.pattern.push(
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    );
  }

  buildStorage() {
    this.storage = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  
  getWin(getPlay, getPattern) {
    var count = 0;
    
    for (var i in getPattern) {
      if (this.storage[getPattern[i]] === getPlay) {
        count++;
      }
    }

    if (count === 3) {
      this.winPlay = getPlay;
    }
  }
  
  confirmPattern(getPlay, aiValidate) {
    var returnValue = false;

    for (var i in this.pattern) {
      var matchCount = 0;

      for (var j in this.pattern[i]) {
        var matchIndex = this.pattern[i][j];
        
        if (this.storage[matchIndex] === getPlay) {
          matchCount++;
        }
        else if (this.storage[matchIndex] > 0) {
          matchCount--;
        }
      }
      
      if (matchCount > 1 && aiValidate) {
        returnValue = this.pattern[i];

        break;
      }
      else if (matchCount > 2 && !aiValidate) {
        returnValue = this.pattern[i];

        break;
      }
    }

    return returnValue;
  }
  
  computerMove() {
    var patternResult = this.confirmPattern(1, true);
    
    if (!patternResult) {
      var isNext = true;

      while (isNext) {
        var random = Math.floor(Math.random() * 9);
        
        if (this.storage[random] === 0) {
          this.storage[random] = this.play;

          isNext = false;
          
          this.buildTable();
          this.play = 1;
        }
        else {
          for (var i in this.storage) {
            isNext = false;

            if (this.storage[i] === 0) {
              isNext = true;

              break;
            }
          }
        }
      }
    }
    else {
      for (var i in patternResult) {
        if (this.storage[patternResult[i]] === 0) {
          this.storage[patternResult[i]] = this.play;
    
          this.buildTable();
          this.play = 1;
        }
      }
    }
  }
  
  buildTable() {
    var tic          = this;
    var countStorage = 0;
    
    for (var i in this.storage) {
      if (this.storage[i] == 0) {
        countStorage++;
      }
    }

    Array.prototype.forEach.call(this.button, function(btn, i) {
      btn.classList.remove('blue');
      btn.classList.remove('red');

      switch(tic.storage[i]) {
        case 1:
          btn.classList.add('blue');
          
          break;
        case 2:
          btn.classList.add('red');
          
          break;
      }
    });

    if (this.play === 0) {
      this.play = 1;
    }
    else if (this.play === 1) {
      this.play = 2;
      
      tic.computerMove();
    }

    tic.getWin(1, tic.confirmPattern(1, false));
    tic.getWin(2, tic.confirmPattern(2, false));

    if (!!this.winPlay) {
      if (confirm('PLAYER ' + this.winPlay + ' WINS! Play again?')) {
        this.buildStorage();
        this.reset();
      }
    }
    else if (countStorage == 0) {
      if (confirm('It\'s a draw! Do you like to try again?')) {
        this.reset();
      }
    }
  }
  
  main() {
    this.buildPattern();
    this.buildStorage();
  }

  reset() {
    this.play    = 0;
    this.winPlay = null;

    this.buildStorage();
    this.buildTable();
  }
}

var tic = new Tic();

tic.main();

Array.prototype.forEach.call(tic.button, function(btn, i) {
  btn.addEventListener('click', function() {
    if (tic.play === 1) {
      if (tic.storage[i] === 0) {
        tic.storage[i] = tic.play;
        
        tic.buildTable();
      }
    }
  });
});

document.querySelector('#reset').addEventListener('click', function() {
  if (confirm('Are you sure you want to reset the game?')) {
    tic.reset();
  }
});