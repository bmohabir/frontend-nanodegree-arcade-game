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
    this.sprite = this.getSprite();
    this.lives = 3;
    // used for smooth movement
    this.xCounter = 0;
    this.yCounter = 0;
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

// updates player's position
Player.prototype.update = function(dt) {
    var enemies = allEnemies.length,
        i;

    // smooth movement animation
    if (this.xCounter > 0) {
    	this.x += 300 * dt;
    	this.xCounter--;
    } else if (this.xCounter < 0) {
    	this.x -= 300 * dt;
    	this.xCounter++;
    }

    if (this.yCounter > 0) {
    	this.y += 350 * dt;
    	this.yCounter--;
    } else if (this.yCounter < 0) {
    	this.y -= 350 * dt;
    	this.yCounter++;
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
};

// handles player death from enemy contact
// TODO: more game/ui logic
Player.prototype.touchEnemy = function() {
    this.lives--;
    this.lives === 0 ? gameOver() : this.respawn();
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
Player.prototype.handleInput = function(key, step) {
    if (step === 'down') {
    	switch (key) {
	        case 'left':
	        	// prevent diagonal drift
	        	this.yCounter = 0;
	        	// immediately cancel movement in opposite direction,
	        	// otherwise continue movement (counter value set to avoid key
	        	// repeat delay)
	        	this.xCounter <= 0 ? this.xCounter -= 34 : this.xCounter = -34;
	        	break;
	        case 'up':
	        	this.xCounter = 0;
	        	this.yCounter <= 0 ? this.yCounter -= 34 : this.yCounter = -34;
	            break;
	        case 'right':
	        	this.yCounter = 0;
	        	this.xCounter >= 0 ? this.xCounter += 34 : this.xCounter = 34;
	            break;
	        case 'down':
	        	this.xCounter = 0;
	            this.yCounter >= 0 ? this.yCounter += 34 : this.yCounter = 34;
	            break;
	    }
    } else {
    	switch (key) {
	        case 'left':
	        	// stop moving on keyup to prevent drifting
	        	this.xCounter = 0;
	            break;
	        case 'up':
	        	this.yCounter = 0;
	            break;
	        case 'right':
	        	this.xCounter = 0;
	            break;
	        case 'down':
	        	this.yCounter = 0;
	            break;
	    }
    }

};

// user interface
// TODO: lots
var UI = {};

// calls required update methods for UI elements
UI.update = function() {
	// TODO (not needed yet)
}

// renders UI overlay
UI.render = function() {
	this.renderLives();
	if (this.gameOver) {
		this.renderGO();
	}
}

// display remaining lives in UI
UI.renderLives = function() {
	var spritePos = 1550,
		i;

	for (i=0; i<=player.lives; i++) {
		if (i) {
			ctx.save();
			ctx.scale(0.3, 0.3);
			ctx.drawImage(Resources.get(player.sprite), spritePos, 150);
			ctx.restore();
			spritePos -= 100;
		}
	}
}

// draw game over screen
UI.renderGO = function() {
	ctx.fillText("GAME OVER", 505/2, 333);
	ctx.strokeText("GAME OVER", 505/2, 333);
}

// GAME OVER
var gameOver = function() {
	player.sprite = undefined;
	UI.gameOver = true;
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
// TODO: game/level logic to handle player and enemy spawning
allEnemies.push(Enemy(cols.a, rows.sm, 150, true));
allEnemies.push(Enemy(cols.e, rows.sb, -100, false));
allEnemies.push(Enemy(cols.a, rows.st, 100, false));
allEnemies.push(Enemy(cols.d, rows.st, 100, false));
player = new Player();


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
        83: 'down'
};
// use keydown for fast response and hold
document.addEventListener('keydown', function(e) {
    player.handleInput(allowedKeys[e.keyCode], 'down');
});
// use keyup to stop movement
document.addEventListener('keyup', function(e) {
    player.handleInput(allowedKeys[e.keyCode], 'up');
});

