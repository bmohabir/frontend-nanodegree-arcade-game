# Bug Run

Bug Run is a Frogger-like HTML Canvas game written in object-oriented JavaScript. The game features controls and gameplay elements inspired by "bullet-hell" shoot-em-up games.

## Instructions

To begin playing Bug Run, open the index.html file using a web browser.

## Gameplay

### Objective

The goal is to move the player from the starting point at the bottom of the screen to the stream of water at the top of the screen.

### Levels

Each level is composed of the following:

* Two rows of grass at the bottom of the screen make up the safe area. The bottom row contains the player starting point at the center.
* Three stone paths lie directly above the safe area. Enemies will roam across these paths endlessly forming an obstacle to the player.
* A stream of water at the top of the screen marks the goal. When the player safely reaches the water, the level ends and the player gains points.

### Enemies

The beetles moving across the stone paths will try to stop you from getting past. If your character fully touches or is touched by one of them, you will lose a life and be sent back to the starting point. Enemy beetles may continuously move in one direction or may patrol their path by moving back and forth.

### Score

The player can increase their score in several ways:
* Completing a level will award the player with 100 points times the number of the level (ie. completing level 4 awards 400 points).
* Completing a level more quickly will award the player bonus completion points. The faster the level is completed, the more bonus points awarded (time is not counted while the game is paused).
* Grazing the front or back of an enemy without fully touching the enemy awards 'graze' points. The amount of graze points awarded is based on how long the player stays within grazing range of an enemy.

The player score will be decreased by 50 points each time they lose a life.

### Game Over

If the player has no more lives left, the game ends.

## Controls

### Movement

* **Up Arrow/W**:  Moves player up
* **Down Arrow/S**:  Moves player down
* **Left Arrow/A**:  Moves player left
* **Right Arrow/D**:  Moves player right
* **Shift**:  Slows down player movement while held down, useful for carefully navigating between enemies

### Interface

* **P**:  Pauses/unpauses gameplay while ingame (or click the onscreen pause button)
* **Spacebar**:  Start game/continue to next level (or click the onscreen Play/Next button)

...