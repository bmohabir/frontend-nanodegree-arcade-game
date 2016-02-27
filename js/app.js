var rows = {
    'sTop': 62,
    'sMid': 145,
    'sBot': 228,
    'gTop': 311,
    'gBot': 394
}

var cols = {
    'a': 0,
    'b': 101,
    'c': 202,
    'd': 303,
    'e': 404
}

// Enemies our player must avoid
var Enemy = function(posX, posY, speed, onPatrol) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // Ensure constructor isn't called incorrectly to keep
    // vars in correct scope
    if(!(this instanceof Enemy)) {
        return new Enemy(posX, posY, direction, speed, onPatrol);
    }

    // Assign spawn coordinates and movement direction
    this.x = posX;
    this.y = posY;

    // Sets enemy speed factor (negative reverses direction)
    this.speed = speed;

    // Loads sprite matching movement direction
    this.sprite = this.loadSprite(speed);

    // Determines if enemy changes direction at level bounds
    // or not
    this.onPatrol = onPatrol;
};

Enemy.prototype.lSprite = 'images/enemy-bug-left.png';
Enemy.prototype.rSprite = 'images/enemy-bug-right.png';
Enemy.prototype.loadSprite = function (speed) {
    if (0 > speed) {
        return this.lSprite;
    } else {
        return this.rSprite;
    }
}

Enemy.prototype.changeDir = function () {
    this.speed = -1 * this.speed;
    this.sprite = this.loadSprite(this.speed);
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    var lastEnemy = allEnemies.length,
        xBeforeCol = this.x,
        i;

    // move enemy to new position
    this.x += this.speed * dt;

    // check level boundary for wrap-around/collision
    if (this.onPatrol) {
        if (this.speed > 0 && this.x >= 407) {
            this.changeDir();
            // return enemy to previous position to prevent
            // getting stuck in collision loop
            this.x = xBeforeCol;
        } else if (this.speed < 0 && this.x <= -5) {
            this.changeDir();
            this.x = xBeforeCol;
        }
    } else {
        if (this.speed > 0 && this.x >= 505) {
            this.x = -100;
        } else if (this.speed < 0 && this.x <= -100) {
            this.x = 505;
        }
    }

    // check for collision between enemies
    for (i=0; i < lastEnemy; i++) {
        if (allEnemies[i] !== this && allEnemies[i].y === this.y && Math.abs(allEnemies[i].x - this.x) <= 93) {
            this.changeDir();
            this.x = xBeforeCol;
        }
    }
};


// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
var enemyOne = new Enemy(cols.b, rows.sBot, 120, true);
var enemyTwo = new Enemy(cols.a, rows.sBot, 30, false);
var enemyThree = new Enemy (cols.e, rows.sMid, -140, false);
var enemyFour = new Enemy(cols.b, rows.sMid, -60, false);
var enemyFive = new Enemy (cols.b, rows.sTop, 200, true);
allEnemies.push(enemyOne);
allEnemies.push(enemyTwo);
allEnemies.push(enemyThree);
allEnemies.push(enemyFour);
allEnemies.push(enemyFive);


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
/*
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
*/
