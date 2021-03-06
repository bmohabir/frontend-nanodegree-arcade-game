///////////////////////////////////////////////
////// This is a Frogger-type game with ///////
// 'bullet hell'-style aspects and controls. //
/////////////////// Enjoy! ////////////////////
///////////////////////////////////////////////



/* global vars */

// x and y coordinates for placing sprites on tiles (for convenience)
//     w = water
//     st/sm/sb = stone top/middle/bottom
//     gt/gb = grass top/bottom
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

// speed multiplier for all game movement
var globalSpeed = 1;

// array containing currently spawned enemies
// starting value contains enemies shown on title screen
var allEnemies = [];

/* TODO: powerups array */



/* Enemy class */

// Constructor for enemies our player must avoid
// posX: optional, numerical horizontal spawn coordinate (default: cols.a)
// posY: optional, numerical vertical spawn coordinate (default: rows.sm)
// speed: optional, numerical speed; positive moves left to right,
//     negative moves right to left (default: 100)
// onPatrol: optional; if true, enemy travels back and
//     forth within visible level boundaries
var Enemy = function(posX, posY, speed, onPatrol) {
    // ensure constructor is called with new keyword to keep vars in correct
    // scope (and shorten new enemy calls)
    if(!(this instanceof Enemy)) {
        return new Enemy(posX, posY, speed, onPatrol);
    }

    // assign only valid spawn coordinates
    this.x = (isNaN(parseFloat(posX)) || (posX > 505) || (posX < -100)) ?
        cols.a : posX;
    this.y = (isNaN(parseFloat(posY)) || (posY > rows.gb) || (posY < rows.st)) ?
        rows.sm : posY;

    this.speed = isNaN(parseFloat(speed)) ? 100 : speed;
    this.sprite = this.setSprite();
    this.onPatrol = onPatrol || false;
};

// left-facing and right-facing enemy sprites
Enemy.prototype.sprites = {
    'l': 'images/enemy-bug-left.png',
    'r': 'images/enemy-bug-right.png'
};

// speed multiplier for enemies
Enemy.prototype.speedFactor = 1;

// returns calculated enemy speed
Enemy.prototype.getSpeed = function() {
    return (globalSpeed * this.speedFactor * this.speed);
};

// returns a sprite from .sprites object based on enemy movement direction
Enemy.prototype.setSprite = function () {
    return (this.speed < 0) ? this.sprites.l : this.sprites.r;
};

// reverses direction of enemy movement and updates sprite
Enemy.prototype.changeDir = function () {
    this.speed *= -1;
    this.sprite = this.setSprite();
};

// Update the enemy's position, required method for game
// dt: time delta between ticks
// also handles level boundary collision for enemies (if applicable)
Enemy.prototype.update = function (dt) {
    // only update enemy position while game is active
    // or title screen/game over (because it looks cool)
    if (game.state !== 'ingame' && game.state !== 'gameover' &&
        game.state !== 'title') {
        return;
    }

    var enemies = allEnemies.length;
    var xBeforeCol = this.x; // store last known 'safe' position
    var i;

    this.x += this.getSpeed() * dt; // move enemy to new position

    // check level boundary for wrap-around/collision
    if (this.onPatrol) {
        if (this.speed > 0 && this.x >= 407) {
            this.changeDir();
            // return enemy to safe position to prevent getting stuck in
            // collision loop
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

    // reverse direction if colliding with another enemy
    for (i=0; i < enemies; i++) {
        if (this.checkCollide(allEnemies[i], this)) {
            // make sure both enemies reverse in head-on collision (for
            // consistency)
            if (this.speed * allEnemies[i].speed < 0) {
                allEnemies[i].changeDir();
            }
            this.changeDir();
            this.x = xBeforeCol;
        }
    }
};

// check for collision between two enemies, returns true or false
// enemyOne: first enemy object
// enemyTwo: second enemy object
Enemy.prototype.checkCollide = function (enemyOne, enemyTwo) {
    return (enemyOne !== enemyTwo && enemyOne.y === enemyTwo.y &&
        Math.abs(enemyOne.x - enemyTwo.x) <= 93);
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    // won't crash if enemy doesn't have a valid sprite
    if (this.sprite) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};



/* Player class */

// Player constructor
// lives: optional, number of lives to start with (default: 4)
// sprite: optional, character to start with, accepts key names
//     in .sprites object (default: 'default')
var Player = function(lives, sprite) {
    if(!(this instanceof Player)) {
        return new Player(lives, sprite);
    }
    // sets position to default spawn coordinates
    this.x = this.startPos.x;
    this.y = this.startPos.y;

    this.sprite = sprite || 'default';
    this.lives = (isNaN(parseInt(lives)) || lives < 1) ? 4 : lives;
    this.score = 0;
    this.alive = true;

    // for handling smooth movement
    this.xMove = 0;
    this.yMove = 0;

    this.isShifting = false; // stores shift key state
    this.ready = false; // for game start/next level
};

// reset player sprite, lives and score
// lives: same as constructor
// sprite: same as constructor
Player.prototype.reset = function(lives, sprite) {
    this.sprite = sprite || 'default';
    this.lives = (isNaN(parseInt(lives)) || lives < 1) ? 4 : lives;
    this.score = 0;
};

// starting position preset
Player.prototype.startPos = {
    'x': cols.c,
    'y': rows.gb
};

// usable player sprites
/* TODO: 'available' property is toggled when sprite is unlocked */
Player.prototype.sprites = {
    'default': {'sprite': 'images/char-boy.png', 'available': true},
    'catgirl': {'sprite': 'images/char-cat-girl.png', 'available': false},
    'horngirl': {'sprite': 'images/char-horn-girl.png', 'available': false},
    'pinkgirl': {'sprite': 'images/char-pink-girl.png', 'available': false},
    'princess': {'sprite': 'images/char-princess-girl.png', 'available': false}
};

// returns player sprite image
// aSprite: optional, key name in .sprites object (default: 'default')
/* TODO: character selection */
Player.prototype.getSprite = function() {
    if (!this.sprite || !this.sprites[this.sprite]) {
        this.sprite = 'default';
    }
    return this.sprites[this.sprite].sprite;
};

// horizontal and vertical speed factors
Player.prototype.speed = {
    'x': 350,
    'y': 400
};

// player speed multipler
Player.prototype.speedFactor = 1;

// returns object containing calculated player horizontal and vertical speed
// halves speed if isShifting is true
Player.prototype.getSpeed = function() {
    var speed;
    if (this.isShifting) {
        return {
            'x': this.speed.x * (this.speedFactor/2) * globalSpeed,
            'y': this.speed.y * (this.speedFactor/2) * globalSpeed
        };
    } else {
        return {
            'x': this.speed.x * this.speedFactor * globalSpeed,
            'y': this.speed.y * this.speedFactor * globalSpeed
        };
    }
};

// updates player's position and checks for win/death conditions
// dt: delta time between ticks
// also increases player score when grazing enemies
Player.prototype.update = function(dt) {
    // stop updating player unless game is active
    if (game.state !== 'ingame') {
        return;
    }

    var numEnemies = allEnemies.length;
    var xSpeed = this.getSpeed().x;
    var ySpeed = this.getSpeed().y;
    var i;

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
    if (this.y > 404) {
        this.y = 404;
    } else if (this.y < -11) {
        this.y = -11;
    }

    // check for enemy touch/graze
    for (i=0; i < numEnemies; i++) {
        if (!this.alive) {
            // stop checking for enemy touch if player is dead (or player will
            // lose multiple lives when touching more than one enemy)
            break;
        } else if (this.checkCollide(allEnemies[i])) {
            this.die();
        } else if (this.checkGraze(allEnemies[i])) {
            this.score += Math.round(200 * dt); // player gains graze points
        }
    }

    // check if level complete
    if (!this.won && (this.y <= rows.w)) {
        this.win();
    }
};

// check for collision with enemy, returns true or false
// enemy: enemy object to check for collision with
Player.prototype.checkCollide = function(enemy) {
    return (((enemy.y > this.y && enemy.y - this.y <= 60) ||
        (this.y > enemy.y && this.y - enemy.y <= 50)) &&
        Math.abs(enemy.x - this.x) <= 64);
};

// check if grazing enemy sprite, returns true or false
// enemy: enemy object to check for graze
Player.prototype.checkGraze = function(enemy) {
    return (((enemy.y > this.y && enemy.y - this.y < 62) ||
        (this.y > enemy.y && this.y - enemy.y <= 32)) &&
        Math.abs(enemy.x - this.x) < 78);
};

// reset player state
Player.prototype.respawn = function() {
    this.x = this.startPos.x;
    this.y = this.startPos.y;
    this.xMove = 0;
    this.yMove = 0;
    this.won = false;
    this.alive = true;
    this.ready = false;
};

// handles player death and sets player dead state
Player.prototype.die = function() {
    this.alive = false;
    this.lives--;
    (this.score - 50) >= 0 ? this.score -= 50 : this.score = 0;
};

// adds level completion bonus to score and sets player win state
Player.prototype.win = function() {
    var level = game.level;
    var finishTime;

    game.levelStopTime = Date.now();
    // calculate completion time by subtracting time paused from time in game
    finishTime = game.levelStopTime - game.levelStartTime - game.totalPauseTime;

    // bonus points for fast level completion
    if (finishTime <= 2000) {
        this.score += level * 800;
    } else if (finishTime <= 3000) {
        this.score += level * 500;
    } else if (finishTime <= 4000) {
        this.score += level * 400;
    } else if (finishTime <= 5000) {
        this.score += level * 200;
    } else if (finishTime <= 10000) {
        this.score += level * 100;
    }

    this.score += level * 100; // award completion points based on level
    this.won = true;
};

// renders player sprite to canvas, similar to enemy render method
Player.prototype.render = function() {
    if (this.sprite) {
        ctx.drawImage(Resources.get(this.getSprite()), this.x, this.y);
    }
};

// generates movement values based on player input
// key: string containing key name from allowedKeys
// step: string 'up' or 'down' referring to key being pressed or released
// isShifting: should be true or false passed based on whether or not shift key
//     is being held, used to slow down player movement when shift is held
Player.prototype.handleInput = function(key, step, isShifting) {
    // set player ready state using spacebar
    if ((game.state === 'title' || game.state === 'nextlvlscreen') &&
        !ui.pleaseWait && key === 'space' && step === 'up') {
        this.ready = true;
    }

    // pause using p key
    if (key === 'p' && step === 'down' && game.isPausable) {
        game.togglePause();
        return;
    }

    this.isShifting = isShifting; // set player shifting state

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
        // stop moving
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



/* UI object */

// contains all user interface elements
var ui = {
    // timers for UI events (ie. fade text and level complete screen)
    'timer': 5.0,
    'sawTimer': {'value': 0.0, 'direction': 1}
};

// calls required update methods for UI elements
// dt: delta time between ticks
ui.update = function(dt) {
    var stDelta;

    switch (game.state) {
        case 'levelstart':
            this.pleaseWait = true;
            this.timer > 0 ? this.timer -= 1.5 * dt : (
                this.pleaseWait = false,
                this.timer = 5.0,
                this.sawTimer.value = 0.0
            );
            break;
        case 'levelcomplete':
            this.pleaseWait = true;
            this.timer > 0 ? this.timer -= 3 * dt : (
                this.pleaseWait = false,
                this.timer = 5.0
            );
            break;
        case 'gameover':
            this.pleaseWait = true;
            stDelta = this.sawTimer.direction * dt;

            // prevent sawTimer overshoot or we might get stuck out of range
            if (this.sawTimer.value + (2.0 * stDelta) > 1.0) {
                this.sawTimer.value = 1.0
            } else if (this.sawTimer.value + (2.0 * stDelta) < 0.0) {
                this.sawTimer.value = 0.0
            } else {
                this.sawTimer.value += 2.0 * stDelta;
            }
            if (this.sawTimer.value === 1.0 || this.sawTimer.value === 0.0) {
                this.sawTimer.direction *= -1;
            }
            this.timer > 0 ? this.timer -= dt : (
                this.pleaseWait = false,
                this.timer = 5.0
            );
            break;
        case 'title':
        case 'nextlvlscreen':
            stDelta = this.sawTimer.direction * dt;

            if (this.sawTimer.value + (1.5 * stDelta) > 1.0) {
                this.sawTimer.value = 1.0
            } else if (this.sawTimer.value + (1.5 * stDelta) < 0.0) {
                this.sawTimer.value = 0.0
            } else {
                this.sawTimer.value += 1.5 * stDelta;
            }
            if (this.sawTimer.value >= 1.0 || this.sawTimer.value <= 0.0) {
                this.sawTimer.direction *= -1;
            }
            break;
    }
};

// checks game state and renders applicable UI elements
ui.render = function() {
    if (game.state === 'title' || (game.state === 'fakepause' &&
        game.prevState === 'title')) {
        this.renderTitle();
        if (game.highScore) {
            this.renderHighScore();
        }
    }
    if (game.isPausable) {
        this.renderPauseButton();
    }
    if (game.state === 'levelstart' || (game.state === 'fakepause' &&
        game.prevState === 'levelstart')) {
        this.renderLvlStart(game.level);
    }
    if (player.sprite && (game.state === 'ingame' || game.state === 'paused' ||
        game.state === 'levelstart' || game.prevState === 'levelstart')) {
        this.renderLives();
    }
    if (game.state === 'paused') {
        this.renderPaused();
    }
    if (game.state === 'levelcomplete' || (game.state === 'fakepause' &&
        game.prevState === 'levelcomplete')) {
        this.renderLvlComplete();
    }
    if (game.state === 'nextlvlscreen' || (game.state === 'fakepause' &&
        game.prevState === 'nextlvlscreen')) {
        this.renderNextScreen();
    }
    if (game.state === 'gameover' || (game.state === 'fakepause' &&
        game.prevState === 'gameover')) {
        this.renderGameOver();
    }
    if (game.state !== 'title' && !(game.state === 'fakepause' &&
        game.prevState === 'title')) {
        this.renderScore();
    }
};

// display title screen
ui.renderTitle = function() {
    // title
    ctx.font = '900 72px sans-serif';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'red';
    ctx.fillText('Bug Run', 505/2, 280);
    ctx.strokeText('Bug Run', 505/2, 280);
    ctx.strokeStyle = 'black';

    // play button background
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(505/2, 317);
    ctx.bezierCurveTo((505/2)+62, 317, (505/2)+62, 365, 505/2, 365);
    ctx.bezierCurveTo((505/2)-62, 365, (505/2)-62, 317, 505/2, 317);
    ctx.fill();
    ctx.closePath();

    // play button icon
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo((505/2)-14, 347);
    ctx.lineTo((505/2)+19, 357);
    ctx.lineTo((505/2)-14, 367);
    ctx.lineTo((505/2)-14, 347);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    // play button text
    ctx.font = '900 oblique 32px sans-serif';
    ctx.strokeText('Play', 505/2-2, 340);
    ctx.fillText('Play', 505/2-2, 340);

    // start play instructions
    ctx.strokeStyle = 'black';
    ctx.lineJoin = 'round';
    ctx.font = 'bold 26px cursive';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = this.sawTimer.value > 1.0 ?
        1.0 : this.sawTimer.value + 0.1;
    ctx.fillText('(click play or press the spacebar)', 505/2, 565);
    ctx.strokeText('(click play or press the spacebar)', 505/2, 565);
    ctx.globalAlpha = 1.0;
};

// display remaining lives
ui.renderLives = function() {
    var spritePos = 1120,
        i;

    for (i=0; i<player.lives; i++) {
        if (i) {
            ctx.save();
            ctx.scale(0.4, 0.4);
            ctx.drawImage(Resources.get(player.getSprite()), spritePos, 125);
            ctx.restore();
            spritePos -= 80;
        }
    }
};

// display player score, displays 'final' score if game over
ui.renderScore = function() {
    ctx.lineWidth = 1.5;

    if (game.state !== 'gameover' && game.prevState !== 'gameover') {
        // ingame score
        ctx.font = '900 30px cursive';
        ctx.fillText(''+player.score, 505/2, 100);
        ctx.strokeText(''+player.score, 505/2, 100);
    } else {
        // endgame score
        ctx.font = '800 32px sans-serif';
        ctx.fillText('Final Score: '+player.score, 505/2, 330);
        ctx.strokeText('Final Score: '+player.score, 505/2, 330);

        // new high score
        if (player.score > game.highScore) {
            ctx.fillStyle = 'yellow';
            ctx.globalAlpha = this.sawTimer.value >= 0.5 ? 1.0 : 0;
            ctx.font = '900 38px monospace';
            ctx.fillText('New High Score!', 256, 375);
            ctx.strokeText('New High Score!', 256, 375);
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = 'white';
        }
    }
};

// displays current high score
ui.renderHighScore = function() {
    ctx.font = '800 30px sans-serif';
    ctx.lineWidth = 1.8;
    ctx.fillText('High Score:  '+game.highScore, 505/2, 100);
    ctx.strokeText('High Score:  '+game.highScore, 505/2, 100);
};

// draw pause/resume button
ui.renderPauseButton = function() {
    // pause button background
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(46, 90, 22, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = 'white';

    game.state === 'paused' ? (
        // pause icon
        ctx.beginPath(),
        ctx.moveTo(37, 80),
        ctx.lineTo(58, 90),
        ctx.lineTo(37, 100),
        ctx.fill(),
        ctx.closePath()
    ) : (
        // play icon
        ctx.font = 'bolder 28px fantasy',
        ctx.fillText("I I", 45, 102)
    );
};

// draws level start text
// level: number of level to introduce
ui.renderLvlStart = function(level) {
    ctx.font = '900 60px cursive';
    ctx.lineWidth = 2;
    ctx.globalAlpha = this.timer > 1.0 ? 1.0 : this.timer + 0.1;
    ctx.fillText('Level ' + level, 505/2, 280);
    ctx.strokeText('Level ' + level, 505/2, 280);
    ctx.globalAlpha = 1.0;

    // ready...go text
    if (this.timer < 3.0) {
        this.timer > 0.5 ? (
            ctx.font = '800 42px sans-serif',
            ctx.fillText('Ready...', 505/2, 330),
            ctx.strokeText('Ready...', 505/2, 330)
        ) : (
            ctx.font = '900 48px sans-serif',
            ctx.fillText('GO!', 505/2, 330),
            ctx.strokeText('GO!', 505/2, 330)
        );
    }
};

// draws level complete text
ui.renderLvlComplete = function() {
    ctx.font = '800 50px cursive';
    ctx.lineWidth = 2;
    ctx.globalAlpha = this.timer > 1.0 ? 1.0 : this.timer + 0.1;
    ctx.fillText('Level Complete!', 505/2, 330);
    ctx.strokeText('Level Complete!', 505/2, 330);
    ctx.globalAlpha = 1.0;
};

// draws next level continue screen
ui.renderNextScreen = function() {
    // next button background
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(505/2, 317);
    ctx.bezierCurveTo((505/2)+62, 317, (505/2)+62, 365, 505/2, 365);
    ctx.bezierCurveTo((505/2)-62, 365, (505/2)-62, 317, 505/2, 317);
    ctx.fill();
    ctx.closePath();

    // play icon
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo((505/2)-14, 347);
    ctx.lineTo((505/2)+19, 357);
    ctx.lineTo((505/2)-14, 367);
    ctx.lineTo((505/2)-14, 347);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    // next button text
    ctx.font = '900 oblique 32px sans-serif';
    ctx.strokeText('Next', 505/2-2, 340);
    ctx.fillText('Next', 505/2-2, 340);

    // next level instruction
    ctx.strokeStyle = 'black';
    ctx.lineJoin = 'round';
    ctx.font = 'bold 26px cursive';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = this.sawTimer.value > 1.0 ?
        1.0 : this.sawTimer.value + 0.1;
    ctx.fillText('(click Next or press the spacebar)', 505/2, 565);
    ctx.strokeText('(click Next or press the spacebar)', 505/2, 565);
    ctx.globalAlpha = 1.0;
};

// draw pause screen
ui.renderPaused = function() {
    ctx.font = '800 60px cursive';
    ctx.lineWidth = 2;
    ctx.fillText('PAUSED', 505/2, 333);
    ctx.strokeText('PAUSED', 505/2, 333);
};

// draw game over screen
ui.renderGameOver = function() {
    ctx.lineWidth = 2;
    ctx.font = '900 60px sans-serif';
    ctx.fillText('GAME OVER', 505/2, 280);
    ctx.strokeText('GAME OVER', 505/2, 280);
};

// handles mouse-interactive UI elements
// e: event passed from event listener
ui.handleClicks = function(e) {
    var x = e.clientX;
    var y = e.clientY;
    var thisCanvas = document.getElementsByTagName('canvas')[0];
    var tBorder = thisCanvas.getBoundingClientRect().top;
    var lBorder = thisCanvas.getBoundingClientRect().left;

    // clickable pause button
    if (game.isPausable && x - lBorder > 24 && x - lBorder < 68 &&
        y - tBorder > 68 && y - tBorder < 112) {
        game.togglePause();
    }

    // clickable play/continue button
    if ((game.state === 'title' || game.state === 'nextlvlscreen') &&
        !this.pleaseWait && x - lBorder > (505/2 - 62) &&
        x - lBorder < (505/2 + 62) && y - tBorder > 317 && y - tBorder < 365) {
        player.ready = true;
    }
};



/* Game object */

// contains gameplay and level code
var game = {
    'level': 1, // holds current level
    'state': 'title', // holds current state
    'totalPauseTime': 0.0, // total time in paused state (reset per level)
    'timer': 5.0, // timer used for game events
    'highScore': 0 // stores high scores
};

// initializes player and starts the game
game.play = function() {
    player = new Player();
};

// object containing levels (enemies and powerups)
// each level is an object containing arrays for each type of entity
// each labeled array contains an array for each entity containing the
// constructor parameters for each entity
// title level contains entities to spawn on title screen
game.levels = {
    'title': {
        'enemies': [
            [cols.a, rows.sm, 250, true], [cols.e, rows.sb, -350],
            [cols.a, rows.st, 250], [cols.d, rows.st, 250]
        ]
    },
    '1': {
        'enemies': [
            [cols.a, rows.sm, 100], [cols.d, rows.sb, 100],
            [cols.c, rows.st, 100]
        ]
    },
    '2': {
        'enemies': [
            [cols.a, rows.sm, 250, true], [cols.e, rows.sb, -350],
            [cols.a, rows.st, 250], [cols.d, rows.st, 250]
        ]
    },
    '3': {
        'enemies': [
            [cols.a, rows.st, 250], [cols.d, rows.st, 250],
            [cols.b, rows.sm, -250], [cols.e, rows.sm, -250],
            [cols.a, rows.sb, 250], [cols.d, rows.sb, 250]
        ]
    }
};

// handles necessary calls for states and state changes
// dt: delta time between ticks
game.update = function(dt) {
    var nextLevel = this.level + 1;

    switch (this.state) {
        case 'title':
            // spawn title screen entities
            if (!allEnemies.length){
                this.levels.title.enemies.forEach(function(enemy) {
                    game.spawnEnemy(enemy);
                });
            }
            // wait for player ready
            if (player.ready) {
                allEnemies.length = 0; // clear title screen enemies
                this.playLevel(this.level);
            }
            break;
        case 'levelstart':
            // wait for ui animation before proceeding
            if (!ui.pleaseWait) {
                this.setState('ingame');
                this.totalPauseTime = 0;
                player.ready = false;
                this.levelStartTime = Date.now();
            }
            break;
        case 'levelcomplete':
            if (!ui.pleaseWait) {
                // check if there is a next level
                this.levels[nextLevel] instanceof Object ?
                    this.setState('nextlvlscreen') :
                    this.gameOver();
            }
            break;
        case 'nextlvlscreen':
            if (player.ready) {
                player.respawn();
                this.playLevel(nextLevel);
            }
            break;
        case 'gameover':
            if (!ui.pleaseWait) {
                if (player.score > this.highScore) {
                    this.highScore = player.score;
                }
                allEnemies.length = 0;
                player.reset();
                player.respawn();
                this.level = 1;
                this.setState('title');
            }
            break;
        case 'ingame':
            // triggers level complete sequence
            if (player.won) {
                this.levelComplete();
            }

            // ends game if player dies and has no lives left
            if (!player.alive) {
                player.lives > 0 ? player.respawn() : this.gameOver();
            }
            break;
    }
};

// toggles game paused state
// force: optional; pauses game if true
game.togglePause = function(force) {
    var pause = force ? true : (this.state === 'paused') ? false : true;

    pause ? (
        this.setState('paused'),
        this.pauseStartTime = Date.now()
    ) : (
        this.setState('ingame'),
        this.totalPauseTime += (Date.now() - this.pauseStartTime)
    );
};

// GAME OVER
game.gameOver = function() {
    player.sprite = undefined;
    this.setState('gameover');
};

// adds enemy to array of currently spawned enemies
// enemy: array containing parameters for Enemy constructor
game.spawnEnemy = function(enemy) {
    if (enemy) {
        allEnemies.push(new Enemy(enemy[0], enemy[1], enemy[2], enemy[3]));
    }
};

// load entities from level array and update level, then set level start state
// level: number of level to load
game.playLevel = function(level) {
    this.level = level;
    this.levels[level].enemies.forEach(function(enemy) {
        game.spawnEnemy(enemy);
    });
    /* TODO: powerup spawning */
    this.setState('levelstart');
};

// clear non-player entities and set level complete state
game.levelComplete = function() {
    allEnemies.length = 0;
    this.setState('levelcomplete');
};

// sets new game state and stores previous state as prevState
// (for easily returning to last state, used with fakepause)
// state: string, name of state to set
// currently valid states: title, levelstart, ingame, paused, fakepause,
//  levelcomplete, nextlvlscreen, gameover
// sets flag to enable player pause functionality while ingame
game.setState = function(state) {
    this.prevState = this.state;
    this.state = state;
    this.isPausable = (state === 'ingame' || state === 'paused') ? true : false;
};



/* TODO: design more levels */
/* TODO: powerups, character select */


// start playing!
game.play();



/* input handling */

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
// tweaked for more precise controls and WASD
// also pausing and ready confirmation
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
    // prevent arrows and space key scrolling page
    if (allowedKeys[e.keyCode]) {
        e.preventDefault();
    }
    e.shiftKey ? player.handleInput(allowedKeys[e.keyCode], 'down', true) :
        player.handleInput(allowedKeys[e.keyCode], 'down', false);
});

// use keyup to stop movement
document.addEventListener('keyup', function(e) {
    e.shiftKey ? player.handleInput(allowedKeys[e.keyCode], 'up', true) :
        player.handleInput(allowedKeys[e.keyCode], 'up', false);
});

// for clickable UI elements
document.addEventListener("click", ui.handleClicks);

// pause game on loss of focus or background up calls will send enemies
// all over the place
window.addEventListener('blur', function(){
    // pause if ingame, otherwise 'fakepause'
    if (game.isPausable) {
        game.togglePause(true);
    } else {
        // fake pause if lost focus during special state
        game.setState('fakepause');
    }
});

// undo fake pause on focus resume
window.addEventListener('focus', function(){
    if (game.state === 'fakepause') {
        game.setState(game.prevState);
    }
});
