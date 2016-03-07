# Bug Run

Bug Run is a Frogger-like HTML Canvas game written in object-oriented JavaScript. The game features controls and gameplay elements inspired by "bullet hell" shoot-em-up games. Bug Run was created as part of a project for the Udacity Front-End Web Development Nanodegree program.

## Usage Instructions

To begin playing Bug Run, open 'index.html' using a web browser.

## Controls

### Movement

* **Up Arrow/W**:  Moves player up
* **Down Arrow/S**:  Moves player down
* **Left Arrow/A**:  Moves player left
* **Right Arrow/D**:  Moves player right
* **Shift**:  Slows down player movement while held down, useful for carefully navigating between enemies

### Miscellaneous

* **P**:  Pauses/unpauses gameplay while ingame (or click the onscreen pause button)
* **Spacebar**:  Start game/continue to next level (or click the onscreen Play/Next button)

## User Interface

### In-game
* **Pause Button**:  The botton on the top-left of the screen pauses and unpauses the game when clicked
* **Score**:  The number at the top of the screen shows the current player score.
* **Lives**:  The top right of the screen shows the number of lives remaining.

## Gameplay

### Objective

The goal is to move the player from the starting point at the bottom of the screen to the stream of water at the top of the screen.

### Levels

Each level is composed of the following:

* Two rows of grass at the bottom of the screen make up the safe area. The bottom row contains the player starting point at the center.
* Three stone paths lie directly above the safe area. Enemies will roam across these paths endlessly, forming an obstacle to the player.
* A stream of water at the top of the screen marks the goal. When the player safely reaches the water, the level ends and the player gains points.

### Enemies

The beetles moving across the stone paths will try to stop the player from passing. If your character fully touches or is touched by one of them, you will lose a life and be sent back to the starting point. Enemy beetles may continuously move in one direction or may patrol their path by moving back and forth. If an enemy collides with another enemy, it will be forced to change direction.

### Score

The player can increase their score in several ways:
* Completing a level will award the player with 100 points times the number of the level (ie. completing level 4 awards 400 points).
* Completing a level more quickly will award the player bonus completion points. The faster the level is completed, the more bonus points awarded (time is not counted while the game is paused).
* Grazing the front or back of an enemy without fully touching the enemy awards 'graze' points. The amount of graze points awarded is based on how long the player stays within grazing range of an enemy.

The player score will be decreased by 50 points each time they lose a life.

### Game Over

The game ends if one of the following conditions are met:
* The player has no remaining lives
* The player has completed the last level

## Level Creation

### Levels

Levels are stored in the `game.levels` object within `app.js`. Each level is a key-value pair with the key being the number of the level (stored as a string) and the value being an object containing the level data.

The `game.levels` object also includes a predefined `'title'` level, which contains data for the game's title screen.

#### Level Data

Each level data object contains key-value pairs for each type of level entity. The key will be a string representing the type of entity and the value will be an array with the entity data. Currently, `'enemies'` is the only valid entity type.

### Entities

Each entity data item is an array of arrays, with each sub-array containing the parameters of a particular entity to spawn when the level loads. The `rows` and `cols` objects in `app.js` can be used for easier setting of spawn location parameters.

##### Enemies

See the `Enemy` function in `app.js` for details on enemy constructor parameters.

### Example

Here is an example of the `game.levels` object containing a single level with four enemy entities:

`game.levels = {
    '1': {
        'enemies': [
            [cols.a, rows.sm, 150], [cols.d, rows.sb, 100, true],
            [cols.c, rows.st, 100], [cols.b, rows.sm, 100]
        ]
    }
};`