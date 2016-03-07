# Bug Run

Bug Run is a Frogger-like HTML Canvas game written in object-oriented JavaScript. The game features controls and gameplay elements inspired by "bullet hell" shoot-em-up games. Bug Run was created as part of a project for the Udacity Front-End Web Development Nanodegree program.

#### Table of Contents

[1 Usage Instructions](#usage)
[2 Controls](#contols)
  [2.1 Movement](#movement)
  [2.2 Miscellaneous](#misc)
[3 User Interface](#ui)
  [3.1 In-game](#ingame)
[4 Gameplay](#gameplay)
  [4.1 Objective](#objective)
  [4.2 Levels](#levels)
  [4.3 Enemies](#gpenemies)
  [4.4 Score](#score)
  [4.5 Game Over](#gameover)
[5 Level Creation](#lvlcreation)
  [5.1 Levels Object](#lvlsobj)
    [5.1.1 Level Data](#lvldata)
  [5.2 Entities](#entities)
    [5.2.1 Enemies](#lcenemies)
  [5.3 Example](#example)

<a href name="usage"/>
## Usage Instructions

To begin playing Bug Run, open `index.html` using a web browser.

<a href name="controls"/>
## Controls

<a href name="movement"/>
### Movement

* **Up Arrow/W**:  Moves player up
* **Down Arrow/S**:  Moves player down
* **Left Arrow/A**:  Moves player left
* **Right Arrow/D**:  Moves player right
* **Shift**:  Slows down player movement while held down, useful for carefully navigating between enemies

<a href name="misc"/>
### Miscellaneous

* **P**:  Pauses/unpauses gameplay while ingame (or click the onscreen pause button)
* **Spacebar**:  Start game/continue to next level (or click the onscreen Play/Next button)

<a href name="ui"/>
## User Interface

<a href name="ingame"/>
### In-game
* **Pause Button**:  The botton on the top-left of the screen pauses and unpauses the game when clicked
* **Score**:  The number at the top of the screen shows the current player score.
* **Lives**:  The top right of the screen shows the number of lives remaining.

<a href name="gameplay"/>
## Gameplay

<a href name="objective"/>
### Objective

The goal is to move the player from the starting point at the bottom of the screen to the stream of water at the top of the screen.

<a href name="levels"/>
### Levels

Each level is composed of the following:

* Two rows of grass at the bottom of the screen make up the safe area. The bottom row contains the player starting point at the center.
* Three stone paths lie directly above the safe area. Enemies will roam across these paths endlessly, forming an obstacle to the player.
* A stream of water at the top of the screen marks the goal. When the player safely reaches the water, the level ends and the player gains points.

<a href name="gpenemies"/>
### Enemies

The beetles moving across the stone paths will try to stop the player from passing. If your character fully touches or is touched by one of them, you will lose a life and be sent back to the starting point. Enemy beetles may continuously move in one direction or may patrol their path by moving back and forth. If an enemy collides with another enemy, it will be forced to change direction.

<a href name="score"/>
### Score

The player can increase their score in several ways:
* Completing a level will award the player with 100 points times the number of the level (ie. completing level 4 awards 400 points).
* Completing a level more quickly will award the player bonus completion points. The faster the level is completed, the more bonus points awarded (time is not counted while the game is paused).
* Grazing the front or back of an enemy without fully touching the enemy awards 'graze' points. The amount of graze points awarded is based on how long the player stays within grazing range of an enemy.

The player score will be decreased by 50 points each time they lose a life.

<a href name="gameover"/>
### Game Over

The game ends if one of the following conditions are met:
* The player has no remaining lives
* The player has completed the last level

<a href name="lvlcreation"/>
## Level Creation

<a href name="lvlsobj"/>
### Levels Object

Levels are stored in the `game.levels` object within `app.js`. Each level is a key-value pair with the key being the number of the level (stored as a string) and the value being an object containing the level data.

The `game.levels` object also includes a predefined `'title'` level, which contains data for the game's title screen.

<a href name="lvldata"/>
##### Level Data

Each level data object contains key-value pairs for each type of level entity. The key will be a string representing the type of entity and the value will be an array with the entity data. Currently, `'enemies'` is the only valid entity type.

<a href name="entities"/>
### Entities

Each entity data item is an array of arrays, with each sub-array containing the parameters of a particular entity to spawn when the level loads. The `rows` and `cols` objects in `app.js` can be used for easier setting of spawn location parameters.

<a href name="lcenemies"/>
##### Enemies

See the `Enemy` function in `app.js` for details on enemy constructor parameters.

<a href name="example"/>
### Example

Here is an example of the `game.levels` object containing a single level with four enemy entities:

```javascript
game.levels = {
    '1': {
        'enemies': [
            [cols.a, rows.sm, 150], [cols.d, rows.sb, 100, true],
            [cols.c, rows.st, 100], [cols.b, rows.sm, 100]
        ]
    }
};
```