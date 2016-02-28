// x and y coordinates for all tiles, adjusted for
// proper sprite placement
var rows = {
    'w': -10,
    'st': 62,
    'sm': 145,
    'sb': 228,
    'gt': 311,
    'gb': 404
};
var cols = {
    'a': 0,
    'b': 101,
    'c': 202,
    'd': 303,
    'e': 404
};

// Enemies our player must avoid
var Enemy = function(posX, posY, speed, onPatrol) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // Ensure constructor is called with new to keep vars
    // in correct scope
    if(!(this instanceof Enemy)) {
        return new Enemy(posX, posY, speed, onPatrol);
    }

    // Assign spawn coordinates and movement direction
    // includes default values (0 is valid for x but not y
    // because of tile boundaries)
    this.x = posX === undefined ? cols.a : posX;
    this.y = posY || rows.sm;

    // Sets enemy speed factor (negative reverses direction)
    this.speed = speed === undefined ? 100 : speed;

    // Loads sprite matching movement direction
    this.sprite = this.loadSprite();

    // Determines if enemy changes direction at level bounds
    // or not
    this.onPatrol = onPatrol || false;
};

// available enemy sprites, contains left-facing and
// right-facing sprites
Enemy.prototype.sprites = {
    'l': 'images/enemy-bug-left.png',
    'r': 'images/enemy-bug-right.png'
};

// speed multiplier for use with powerups (TODO)
Enemy.prototype.speedFactor = 1;

// loads correct sprite based on enemy movement direction
Enemy.prototype.loadSprite = function () {
    return (this.speed < 0) ? this.sprites.l : this.sprites.r;
};

// reverses movement direction of enemy called on
Enemy.prototype.changeDir = function () {
    this.speed = -1 * this.speed;
    this.sprite = this.loadSprite();
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    var enemies = allEnemies.length,
        // store position before update to correct bad moves
        xBeforeCol = this.x,
        i;

    // move enemy to new position
    this.x += this.speed * this.speedFactor * dt;

    // check level boundary for wrap-around/collision
    if (this.onPatrol) {
        if (this.speed > 0 && this.x >= 407) {
            this.changeDir();
            // return enemy to position before collision to prevent
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
    for (i=0; i < enemies; i++) {
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
var Player = function() {
    this.x = this.startPos.x;
    this.y = this.startPos.y;
    this.sprite = this.selectSprite();
};

// starting position preset
Player.prototype.startPos = {
    'x': cols.c,
    'y': rows.gb
};

// object containing available player sprites and info for which
// sprites are available
Player.prototype.sprites = {
    'default': {'sprite': 'images/char-boy.png', 'available': true},
    'catgirl': {'sprite': 'images/char-cat-girl.png', 'available': false},
    'horngirl': {'sprite': 'images/char-horn-girl.png', 'available': false},
    'pinkgirl': {'sprite': 'images/char-pink-girl.png', 'available': false},
    'princess': {'sprite': 'images/char-princess-girl.png', 'available': false}
};

// selects player character sprite from player sprites object
// TODO: character selection interface
Player.prototype.selectSprite = function(aSprite) {
    aSprite = aSprite || 'default';
    return this.sprites[aSprite].sprite;
};

// updates player's position
Player.prototype.update = function(x, y) {
    // cancel update call when there is no player movement
    if (!x && !y) {
        return;
    }
    // store position before moving for boundary collision handling
    var posBeforeCol = {'x': this.x, 'y': this.y};

    if (x > 0 && this.x <= 372) {
            this.x += x;
    } else if (x < 0 && this.x >= 32) {
            this.x += x;
    }
    if (y > 0 && this.y <= 321) {
            this.y += y;
    } else if (y < 0 && this.y >= 72) {
            this.y += y;
    }

};

// renders player sprite to canvas, similar to enemy render method
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// handles player input and sends appropriate offsets to update
// method
Player.prototype.handleInput = function(key) {
    switch (key) {
        case 'left':
            this.update(-34, 0);
            break;
        case 'up':
            this.update(0, -83);
            break;
        case 'right':
            this.update(34, 0);
            break;
        case 'down':
            this.update(0, 83);
            break;
        default:
            return;
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
var enemyOne = new Enemy(cols.b, rows.sb, 120, true);
var enemyTwo = new Enemy(cols.a, rows.sb, 30, false);
var enemyThree = new Enemy (cols.e, rows.sm, -140, false);
var enemyFour = new Enemy(cols.b, rows.sm, -60, false);
var enemyFive = new Enemy (cols.b, rows.st, 200, true);
allEnemies.push(enemyOne);
allEnemies.push(enemyTwo);
allEnemies.push(enemyThree);
allEnemies.push(enemyFour);
allEnemies.push(enemyFive);

player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
