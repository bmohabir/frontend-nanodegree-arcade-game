///////////////////////////////////////////////
////// This is a Frogger-type game with ///////
// 'bullet hell'-style aspects and controls. //
/////////////////// Enjoy! ////////////////////
///////////////////////////////////////////////



/* global vars */

// used by UI.handleClicks method
var thisCanvas,
	topBorder,
	leftBorder;

// x and y coordinates for placing sprites on tiles
// (for convenience)
var rows = {
    'w': -6,
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

// speed multiplier for all moving entities, used for special states (ie. paused)
var globalSpeed = 1;

// array containing currently spawned enemies
var allEnemies = [];



/* Enemy class */

// Constructor for enemies our player must avoid
var Enemy = function(posX, posY, speed, onPatrol) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // Ensure constructor is called with new keyword to keep vars
    // in correct scope (and shorten new enemy calls)
    if(!(this instanceof Enemy)) {
        return new Enemy(posX, posY, speed, onPatrol);
    }

    // Assign valid spawn coordinates
    this.x = isNaN(parseFloat(posX)) || posX > 505 || posX < -100 ? cols.a : posX;
    this.y = isNaN(parseFloat(posY)) || posY > rows.gb || posY < rows.st ? rows.sm : posY;

    // Sets enemy speed factor (negative reverses direction)
    this.speed = isNaN(parseFloat(speed)) ? 100 : speed;

    // Loads correctly facing sprite
    this.sprite = this.loadSprite();

    // Determines if enemy 'collides' with level boundaries
    this.onPatrol = onPatrol || false;
};

// left-facing and right-facing enemy sprites
Enemy.prototype.sprites = {
    'l': 'images/enemy-bug-left.png',
    'r': 'images/enemy-bug-right.png'
};

// speed multiplier for enemies
Enemy.prototype.speedFactor = 1;

// calculates enemy speed
Enemy.prototype.calcSpeed = function() {
	return (globalSpeed * this.speedFactor * this.speed);
};

// loads correct sprite based on enemy movement direction
Enemy.prototype.loadSprite = function () {
    return (this.speed < 0) ? this.sprites.l : this.sprites.r;
};

// reverses movement direction of enemy
Enemy.prototype.changeDir = function () {
    this.speed = -1 * this.speed;
    this.sprite = this.loadSprite();
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
// (also handles enemy-enemy and enemy-level collision)
Enemy.prototype.update = function (dt) {
    var enemies = allEnemies.length,
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



/* Player class */

// Player constructor
var Player = function() {
	// sets position to default spawn coordinates
    this.x = this.startPos.x;
    this.y = this.startPos.y;

    // loads default sprite
    this.sprite = this.getSprite();

    // self-explanatory
    this.lives = 4;
    this.score = 0;

    // for handling smooth movement
    this.xMove = 0;
    this.yMove = 0;

    // stores shift key state
    this.isShifting = false;
};

// starting position preset
Player.prototype.startPos = {
    'x': cols.c,
    'y': rows.gb
};

// player sprites, 'available' property is toggled when sprite is unlocked
Player.prototype.sprites = {
    'default': {'sprite': 'images/char-boy.png', 'available': true},
    'catgirl': {'sprite': 'images/char-cat-girl.png', 'available': false},
    'horngirl': {'sprite': 'images/char-horn-girl.png', 'available': false},
    'pinkgirl': {'sprite': 'images/char-pink-girl.png', 'available': false},
    'princess': {'sprite': 'images/char-princess-girl.png', 'available': false}
};

// selects player sprite from player sprites object, or selects default
/* TODO: character selection */
Player.prototype.getSprite = function(aSprite) {
    aSprite = aSprite || 'default';
    return this.sprites[aSprite].sprite;
};

// horizontal and vertical speed
Player.prototype.speed = {
	'x': 350,
	'y': 400
};

// player speed multipler
Player.prototype.speedFactor = 1;

// calculate player movement speed
Player.prototype.calcSpeed = function() {
    if (this.isShifting) {
        return {'x': this.speed.x * (this.speedFactor/2) * globalSpeed, 'y': this.speed.y * (this.speedFactor/2) * globalSpeed};
    } else {
        return {'x': this.speed.x * this.speedFactor * globalSpeed, 'y': this.speed.y * this.speedFactor * globalSpeed};
    }
};

// updates player's position and checks for win/death conditions
Player.prototype.update = function(dt) {
    var numEnemies = allEnemies.length,
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
	} else if (this.y < -11) {
		this.y = -11;
	}

    // check for enemy touch/graze
    for (i=0; i < numEnemies; i++) {
        if (((allEnemies[i].y > this.y && allEnemies[i].y - this.y <= 58) || (this.y > allEnemies[i].y && this.y - allEnemies[i].y <= 74)) && Math.abs(allEnemies[i].x - this.x) < 69) {
            this.touchEnemy();
        } else if (((allEnemies[i].y > this.y && allEnemies[i].y - this.y <= 62) || (this.y > allEnemies[i].y && this.y - allEnemies[i].y <= 79)) && Math.abs(allEnemies[i].x - this.x) < 75) {
            // player gains points for grazing enemy sprites
            this.score += Math.round(35 * dt);
        }
    }

    // check if level complete
    if (!this.won && (this.y <= rows.w)) {
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
Player.prototype.touchEnemy = function() {
    this.lives--;
    (this.score - 50) >= 0 ? this.score -= 50 : this.score = 0;
    this.lives ? this.respawn() : Game.gameOver();
};

// calculates win score and triggers level complete
Player.prototype.win = function() {
    var level = Game.level,
        completeTime;

    Game.levelStopTime = Date.now();
    completeTime = Game.levelStopTime - Game.levelStartTime - Game.totalPauseTime;

    // bonus points for fast level completion
    if (completeTime <= 1500) {
        this.score += level * 800;
    } else if (completeTime <= 2000) {
        this.score += level * 500;
    } else if (completeTime <= 3000) {
        this.score += level * 400;
    } else if (completeTime <= 5000) {
        this.score += level * 200;
    } else if (completeTime <= 10000) {
        this.score += level * 100;
    }
    this.score += level * 100;
    this.won = true;
    Game.levelComplete();
};

// renders player sprite to canvas, similar to enemy render method
Player.prototype.render = function() {
	// prevent error in cases where player should not be visible (ie. game over)
	if (this.sprite) {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	}
};

// generates movement values based on player input
Player.prototype.handleInput = function(key, step, isShifting) {
    // pause using keyboard
    if (key === 'p' && step === 'down' && UI.pauseButton) {
    	Game.togglePause();
    	return;
    }

    /* TODO: spacebar for game start/next level */

    // calcSpeed will slow movement when shift is held
    this.isShifting = isShifting;

    if (step === 'down') {
    	// get moving
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
    		// stop moving
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



/* UI object */

// contains all user interface elements
var UI = {};

// calls required update methods for UI elements
UI.update = function(dt) {
	// timers for level start and complete events, including reset pause timer
    if (Game.levelStarted) {
        this.pauseButton = false;
        UI.timer > 0 ? UI.timer -= 1.5 * dt : (Game.levelStarted = false, UI.timer = 3.0, Game.totalPauseTime = 0, Game.levelStartTime = Date.now());
    } else if (player.won) {
        this.pauseButton = false;
        UI.timer > 0 ? UI.timer -= 1.5 * dt : (player.won = false, UI.timer = 3.0);
    } else if (!Game.isGameOver) {
    	// restores pause button during gameplay
    	/* TODO: method to simplify 'player is ingame' checks */
        this.pauseButton = true;
    } else if (Game.isGameOver) {
    	this.pauseButton = false;
    }
};

// timer for temporary UI elements (ie. level start/complete fade)
UI.timer = 3.0;

// renders applicable UI elements
UI.render = function() {
	if (this.pauseButton) {
		this.renderPauseButton();
	}
	if (Game.levelStarted) {
		this.renderLevel(Game.level);
	}
    if (player.sprite && !player.won) {
    	this.renderLives();
    }
    if (Game.paused) {
    	this.renderPaused();
    }
	if (player.won) {
		this.renderLevelComplete();
	}
	if (Game.isGameOver) {
		this.renderGO();
	}
    this.renderScore();
};

// display remaining lives
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

// display player score
UI.renderScore = function() {
    ctx.font = 'bold 32px sans-serif';
    ctx.lineWidth = 2;
    ctx.fillText(''+player.score, 505/2, 100);
    ctx.strokeText(''+player.score, 505/2, 100);
    ctx.font = 'bold 60px sans-serif'
    ctx.lineWidth = 3;
};

// whether or not pause button should be visible
UI.pauseButton = true;

// draw pause/resume button
UI.renderPauseButton = function() {
	ctx.beginPath();
	ctx.fillStyle = 'red';
	ctx.arc(46, 90, 22, 0, 2*Math.PI);
	ctx.fill();
    ctx.fillStyle = 'white';
	ctx.closePath;
	Game.paused ? (
		ctx.beginPath(),
		ctx.moveTo(37, 80),
		ctx.lineTo(58, 90),
		ctx.lineTo(37, 100),
		ctx.fill(),
		ctx.closePath()
	) : (
		ctx.font = 'bold 28px Impact',
		ctx.fillText("I I", 45, 102),
        ctx.font = 'bold 60px sans-serif'
	);
};

// draws level start text
UI.renderLevel = function(level) {
    ctx.globalAlpha = UI.timer > 1.0 ? 1.0 : UI.timer + 0.1;
    ctx.fillText('Level ' + level, 505/2, 333);
    ctx.strokeText('Level ' + level, 505/2, 333);
    ctx.globalAlpha = 1.0;
};

// draws level complete text
UI.renderLevelComplete = function() {
    ctx.globalAlpha = UI.timer > 1.0 ? 1.0 : UI.timer + 0.1;
    ctx.fillText('Level Complete!', 505/2, 333);
    ctx.strokeText('Level Complete!', 505/2, 333);
    ctx.globalAlpha = 1.0;
};

// draw pause screen
UI.renderPaused = function() {
	ctx.fillText('PAUSED', 505/2, 333);
	ctx.strokeText('PAUSED', 505/2, 333);
};

// draw game over screen
UI.renderGO = function() {
	ctx.fillText('GAME OVER', 505/2, 333);
	ctx.strokeText('GAME OVER', 505/2, 333);
};

// handles mouse-interactive UI elements
UI.handleClicks = function(e) {
	thisCanvas = document.getElementsByTagName('canvas')[0];
	topBorder = thisCanvas.getBoundingClientRect().top;
	leftBorder = thisCanvas.getBoundingClientRect().left;

	// clickable pause button
	if (UI.pauseButton && e.clientX - leftBorder > 24 && e.clientX - leftBorder < 68 && e.clientY - topBorder > 68 && e.clientY - topBorder < 112) {
		Game.togglePause();
	}

	/* TODO: game start/next level buttons */
};



/* Game object */

// contains gameplay and level code
var Game = {};

// initializes player and starts the game
Game.play = function() {
    player = new Player();
    this.playLevel(this.level);
};

// current level
Game.level = 1;

// level starting state
Game.levelStarted = true;

// object containing levels (enemies and powerups)
// each level is an array containing enemy and powerup objects to spawn and their parameters
Game.levels = {
    1: [
        Enemy(cols.a, rows.sm, 100, false), Enemy(cols.d, rows.sb, 100, false), Enemy(cols.c, rows.st, 100, false)
    ],
    2: [
        Enemy(cols.a, rows.sm, 250, true), Enemy(cols.e, rows.sb, -350, false), Enemy(cols.a, rows.st, 250, false), Enemy(cols.d, rows.st, 250, false)
    ]
};

// handles state changes
Game.update = function() {
	// disables player movement when necessary
    player.speedFactor = (this.levelStarted || player.won || this.isGameOver) ? 0 : 1;
    if ((!player.won) && allEnemies.length === 0) {
        var nextLevel = this.level + 1;
        // load next level, or end the game if there isn't one
        this.levels[nextLevel] instanceof Array ? (player.respawn(), this.playLevel(nextLevel)) : this.gameOver();
    }
};

// pause/unpause the game
// if called with 'force' parameter, will set the pause state to value of 'force'
Game.togglePause = function(force) {
    force = force || false;
    if (force) {
        this.paused = false;
    }
    this.paused ? (globalSpeed = 1, this.paused = false, this.totalPauseTime = (Date.now() - this.pauseStartTime)) : (globalSpeed = 0, this.paused = true, this.pauseStartTime = Date.now());
};

// GAME OVER
Game.gameOver = function() {
	if (player.won) {
		player.won = false;
	}
	// move player out of win zone or win events will retrigger
    player.respawn();
    player.sprite = undefined;
    this.isGameOver = true;
};

// load entities from level array and update level counter, then trigger game start
Game.playLevel = function(level) {
    this.level = level;
    this.levels[level].forEach(function(entity) {
        if (entity instanceof Enemy) {
            allEnemies.push(entity);
        }
    });
    this.levelStarted = true;
};

// clear non-player entities in preparation for level change/game over
Game.levelComplete = function() {
    allEnemies.length = 0;
};



/* TODO: powerups, character select */


// start playing!
Game.play();



/* input handling */

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
        80: 'p',
        32: 'space'
};

// use keydown for faster response and hold
document.addEventListener('keydown', function(e) {
	e.shiftKey ? player.handleInput(allowedKeys[e.keyCode], 'down', true) : player.handleInput(allowedKeys[e.keyCode], 'down', false);
});

// use keyup to stop movement
document.addEventListener('keyup', function(e) {
    e.shiftKey ? player.handleInput(allowedKeys[e.keyCode], 'up', true) : player.handleInput(allowedKeys[e.keyCode], 'up', false);
});

// for clickable UI elements
document.addEventListener("click", UI.handleClicks);

// pause game on loss of focus or backed up calls will send enemies all over the place
window.addEventListener('blur', function(){
	// no pause screen on special states (game over/level started/level complete)
    if (!Game.isGameOver && !Game.levelStarted && !(allEnemies.length === 0)) {
    	Game.togglePause(true);
    } else {
        // fake pause if lost focus during special state
        globalSpeed = 0;
    }
});

// undo fake pause on focus resume
window.addEventListener('focus', function(){
    if (!Game.paused && globalSpeed === 0) {
        globalSpeed = 1;
    }
});
