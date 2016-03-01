// used by UI.handleClicks method
var thisCanvas,
	topBorder,
	leftBorder;

// x and y coordinates for placing sprites on tiles
// (for convenience)
var rows = {
    'w': -8,
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

// speed multiplier for all moving entities
var globalSpeed = 1;

// Enemies our player must avoid
var Enemy = function(posX, posY, speed, onPatrol) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // Ensure constructor is called with new to keep vars
    // in correct scope
    if(!(this instanceof Enemy)) {
        return new Enemy(posX, posY, speed, onPatrol);
    }

    // Assign spawn coordinates
    this.x = isNaN(parseFloat(posX)) || posX > 505 || posX < -100 ? cols.a : posX;
    this.y = isNaN(parseFloat(posY)) || posY > rows.gb || posY < rows.w ? rows.sm : posY;

    // Sets enemy speed factor (negative reverses direction)
    this.speed = isNaN(parseFloat(speed)) ? 100 : speed;

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

// speed multiplier for enemies
Enemy.prototype.speedFactor = 1;

// calculates enemy speed multiplier
Enemy.prototype.calcSpeed = function() {
	return (globalSpeed * this.speedFactor * this.speed);
};

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
    this.x += this.calcSpeed() * dt;

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
    this.sprite = this.getSprite();
    this.lives = 4;
    this.xMove = 0;
    this.yMove = 0;
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
// TODO: character selection
Player.prototype.getSprite = function(aSprite) {
    aSprite = aSprite || 'default';
    return this.sprites[aSprite].sprite;
};

// horizontal and vertical movement speed
Player.prototype.speed = {
	'x': 350,
	'y': 400
};

// player speed multipler
Player.prototype.speedFactor = 1;

// calculate player movement speed
Player.prototype.calcSpeed = function() {
	return {'x': this.speed.x * this.speedFactor * globalSpeed, 'y': this.speed.y * this.speedFactor * globalSpeed};
};

// updates player's position
Player.prototype.update = function(dt) {
	// ends game if no more lives
	if (this.lives<1) {
		UI.gameOver();
	}

    var enemies = allEnemies.length,
    	xSpeed = this.calcSpeed().x,
    	ySpeed = this.calcSpeed().y,
        i;

    // smooth movement animation
    if (this.xMove > 0) {
    	this.x += xSpeed * dt;
    } else if (this.xMove < 0) {
    	this.x -= xSpeed * dt;
    }

    if (this.yMove > 0) {
    	this.y += ySpeed * dt;
    } else if (this.yMove < 0) {
    	this.y -= ySpeed * dt;
    }

    // keep player in bounds
    if (this.x > 421) {
            this.x = 421;
    } else if (this.x < -17) {
            this.x = -17;
    }
    if (this.y > 404)
	{
		this.y = 404;
	}

    // check for enemy touch
    for (i=0; i < enemies; i++) {
        if (((0 <= allEnemies[i].y - this.y && allEnemies[i].y - this.y <= 60) || (0 <= this.y - allEnemies[i].y && this.y - allEnemies[i].y <= 75)) && Math.abs(allEnemies[i].x-this.x) < 70) {
            this.touchEnemy();
        }
    }

    // check if level complete
    if (this.y <= rows.w) {
        this.win();
    }

};

// reset player position (upon death or level change)
Player.prototype.respawn = function() {
    this.x = this.startPos.x;
    this.y = this.startPos.y;
    this.xMove = 0;
    this.yMove = 0;
};

// handles player death from enemy contact
// TODO: more game/ui logic
Player.prototype.touchEnemy = function() {
    this.lives--;
    if (this.lives) {
    	this.respawn();
    }
};

// handles level complete
// TODO: more game/ui logic
Player.prototype.win = function() {
    /* levelComplete(); */
    allEnemies.length = 0;
    this.respawn();
};

// renders player sprite to canvas, similar to enemy render method
Player.prototype.render = function() {
	// prevent error in cases where player should not be visible (ie. game over)
	if (this.sprite) {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	}
};

// generates movement values based on player input
Player.prototype.handleInput = function(key, step, slow) {
    // pause when P is pressed
    if (key === 'p' && step === 'down') {
    	UI.togglePause();
    	return;
    }

    // slows player movement when shift is held
    // BUG: this code constantly resets player speed factor, needs fixing
    this.speedFactor = slow ? 0.5 : 1;

    if (step === 'down') {
    	switch (key) {
	        case 'left':
	        	// use 'momentum' to avoid key repeat delay messing up
	        	// player movement
	        	this.xMove <= 0 ? this.xMove -= 1 : this.xMove = -1;
	        	break;
	        case 'up':
	        	this.yMove <= 0 ? this.yMove -= 1 : this.yMove = -1;
	            break;
	        case 'right':
	        	this.xMove >= 0 ? this.xMove += 1 : this.xMove = 1;
	            break;
	        case 'down':
	        	this.yMove >= 0 ? this.yMove += 1 : this.xMove = 1;
	            break;
	    }
    } else {
    	switch (key) {
	        case 'left':
	        	if (this.xMove < 0) {
	        		this.xMove = 0;
	        	}
	            break;
	        case 'up':
	        	if (this.yMove < 0) {
	        		this.yMove = 0;
	        	}
	        	break;
	        case 'right':
	        	if (this.xMove > 0) {
	        		this.xMove = 0;
	        	}
	        	break;
	        case 'down':
	        	if (this.yMove > 0) {
	        		this.yMove = 0;
	        	}
	        	break;
	    }
    }
};

// user interface
var UI = {};

// calls required update methods for UI elements
// TODO: more game/level logic
UI.update = function(dt) {
	// removes level start message after set amount of time
    Game.levelStarted ? (globalSpeed = 0, (UI.timer > 0 ? UI.timer -= 10 * dt : Game.levelStarted = false)) : (globalSpeed = 1, UI.timer = 100);
};

// timer for temporary UI elements (ie. level start)
UI.timer = 20;

// renders UI overlay
UI.render = function() {
	this.renderPauseButton();
    this.renderLevel(Game.level);
	this.renderLives();
	this.renderPaused();
	this.renderGO();
};

// display remaining lives in UI
UI.renderLives = function() {
	var spritePos = 1120,
		i;

	for (i=0; i<player.lives; i++) {
		if (i) {
			ctx.save();
			ctx.scale(0.4, 0.4);
			ctx.drawImage(Resources.get(player.sprite), spritePos, 125);
			ctx.restore();
			spritePos -= 80;
		}
	}
};

// whether or not pause button is applicable
UI.pauseButton = true;

// draw pause/resume button
UI.renderPauseButton = function() {
	if (this.pauseButton) {
		ctx.beginPath();
		ctx.fillStyle = 'red';
		ctx.arc(46, 90, 22, 0, 2*Math.PI);
		ctx.fill();
		ctx.closePath;

		this.paused ? (
			ctx.lineWidth = 2,
			ctx.fillStyle = 'white',
			ctx.beginPath(),
			ctx.moveTo(37, 80),
			ctx.lineTo(58, 90),
			ctx.lineTo(37, 100),
			ctx.fill(),
			ctx.closePath()
		) : (
			ctx.lineWidth = 2,
			ctx.font = 'bold 28px Impact',
			ctx.fillStyle = 'white',
			ctx.fillText("I I", 45, 102)
		);
	}
};

// draws level start
UI.renderLevel = function(level) {
    if (Game.levelStarted) {
        ctx.lineWidth = 3;
        ctx.font = 'bold 60px sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText("Level " + level, 505/2, 333);
        ctx.strokeText("Level " + level, 505/2, 333);
    }
};

// draw pause screen
UI.renderPaused = function() {
	if (this.paused) {
		ctx.lineWidth = 3;
		ctx.font = 'bold 60px sans-serif';
		ctx.fillStyle = 'white';
		ctx.fillText("PAUSED", 505/2, 333);
		ctx.strokeText("PAUSED", 505/2, 333);
	}
};

// draw game over screen
UI.renderGO = function() {
	if (this.isGameOver) {
		ctx.lineWidth = 3;
		ctx.font = 'bold 60px sans-serif';
		ctx.fillStyle = 'white';
		ctx.fillText("GAME OVER", 505/2, 333);
		ctx.strokeText("GAME OVER", 505/2, 333);
	}
};

// handles mouse-interactive UI elements
UI.handleClicks = function(e) {
	thisCanvas = document.getElementsByTagName("canvas")[0];
	topBorder = thisCanvas.getBoundingClientRect().top;
	leftBorder = thisCanvas.getBoundingClientRect().left;

	if (UI.pauseButton && e.clientX - leftBorder > 24 && e.clientX - leftBorder < 68 && e.clientY - topBorder > 68 && e.clientY - topBorder < 112) {
		UI.togglePause();
	}
};

// pause/unpause the game
UI.togglePause = function(force) {
	force = force || false;
	if (force) {
		this.paused = false;
	}
	this.paused ? (globalSpeed = 1, this.paused = false) : (globalSpeed = 0, this.paused = true);
};

// GAME OVER
UI.gameOver = function() {
	player.sprite = undefined;
	this.pauseButton = false;
	this.isGameOver = true;
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
// object for gameplay/level logic
var Game = {};
// method for starting the game
Game.play = function() {
    player = new Player();
    this.playLevel(this.level);
};

// start at level 1
Game.level = 1;

// used for level starting effects
Game.levelStarted = true;

// object containing levels (enemies and powerups)
Game.levels = {
    1: [
        Enemy(cols.a, rows.sm, 350, true), Enemy(cols.e, rows.sb, -450, false), Enemy(cols.a, rows.st, 350, false), Enemy(cols.d, rows.st, 350, false)
    ]
};

// spawn level entities
Game.playLevel = function(level) {
    this.levels[level].forEach(function(entity) {
        if (entity instanceof Enemy) {
            allEnemies.push(entity);
        }
    });
    Game.levelStarted = true;
};

// TODO: levelComplete, powerups, character select

// start playing
Game.play();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
// tweaked for more precise controls and WASD
var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        65: 'left',
        87: 'up',
        68: 'right',
        83: 'down',
        80: 'p'
};
// use keydown for fast response and hold
document.addEventListener('keydown', function(e) {
	e.shiftKey ? player.handleInput(allowedKeys[e.keyCode], 'down', true) : player.handleInput(allowedKeys[e.keyCode], 'down', false);
});
// use keyup to stop movement
document.addEventListener('keyup', function(e) {
    e.shiftKey ? player.handleInput(allowedKeys[e.keyCode], 'up', true) : player.handleInput(allowedKeys[e.keyCode], 'up', false);
});
// for clickable UI elements
document.addEventListener("click", UI.handleClicks);

// pause game on loss of focus or stacked up calls will send enemies all over the place
window.addEventListener('blur', function(){
	// no pausing on game over screen
    if (!UI.isGameOver) {
    	UI.togglePause(true);
    }
});
