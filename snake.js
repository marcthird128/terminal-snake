// snake game
// terminal based
// version 1.0

/*
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org/>
*/

// constants
const INTERVAL = 20;
const CLEAR = '\x1b[0;0H';
const RESET = '\x1b[0m';
const APPLE = '\x1b[31m';
const SNAKE = '\x1b[32m';
const BOMB = '\x1b[47;34m';
const WIDTH = 70;
const HEIGHT = 25;
const STATE_START = 0;
const STATE_GAME = 1;
const STATE_GAMEOVER = 2;

// default screen
let defaultRes = Array.from({length: WIDTH * HEIGHT}, () => ' ');
for (let x = 1; x < WIDTH-1; x++) {
	defaultRes[x] = '-';
	defaultRes[(HEIGHT-1)*WIDTH+x] = '-';
}
for (let y=1; y< HEIGHT-1; y++) {
	defaultRes[y * WIDTH] = '|';
	defaultRes[y * WIDTH + WIDTH - 1] = '|';
}
defaultRes[0] = '+';
defaultRes[WIDTH-1] = '+';
defaultRes[(HEIGHT-1)*WIDTH] = '+';
defaultRes[HEIGHT*WIDTH-1] = '+';

////////////////////////////
// environment setup code //
////////////////////////////

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

///////////////
// game code //
///////////////

// global game vars
var keyBuf, time, speed, inc, state, snake, vx, vy, score, apple, bombs;

// init
function init() {
	keyBuf = [];
	inc = 0;
	snake = [[Math.floor(WIDTH/2), Math.floor(HEIGHT/2)]];
	vx = 1;
	vy = 0;
	score = 0;
	setApple();
	setBombs();
}

// exit
function exit() {
	console.log('\x1b[2J' + CLEAR);
	process.exit(0);
}

// draw string to raw res
function drawString(rawRes, str, x, y) {
	for (let i=0; i<str.length; i++) {
		let char = str[i];
		rawRes[y * WIDTH + x + i] = char;
	}
}

// out of bounds check
function isOutOfBounds(pos) {
	return pos[0] < 1 || pos[0] >= WIDTH-1 || pos[1] < 1 || pos[1] >= HEIGHT-1;
}

// checks if a pos is in a list of positions
function posInPosList(pos, list) {
	let is = false;
	for (let i=0; i<list.length; i++) {
		let d = list[i];
		if (d[0] == pos[0] && d[1] == pos[1]) {
			is = true;
			break;
		}
	}
	return is;
}

// set the apple
function setApple() {
	let x, y;
	do {
		x = 1 + Math.floor(Math.random() * (WIDTH-2));
		y = 1 + Math.floor(Math.random() * (HEIGHT-2));
	} while (posInPosList([x, y], snake));
	apple = [x, y];
}

// get list of positions around
function positionsAround(x, y, distance) {
	let positions = [];
	let diam = distance * 2;
	for (let xi=0; xi<=diam; xi++) {
		for (let yi=0; yi<=diam; yi++) {
			positions.push([x - distance + xi, y - distance + yi]);
		}
	}
	return positions;
}

// is illegal bomb
function isIllegalBomb(x, y) {
	// is on apple?
	if (apple[0] == x && apple[1] == y) return true;
	
	// is out of bounds?
	if (isOutOfBounds([x, y])) return true;
	
	// is too close to snake?
	let extendedSnake = [];
	for (let i=0; i<snake.length; i++) {
		let seg = snake[i];
		extendedSnake.push(...positionsAround(seg[0], seg[1], 4));
	}
	if (posInPosList([x, y], extendedSnake)) return true;
	
	return false;
}

// set bombs
function setBombs() {
	bombs = [];
	let bombCount = Math.floor(1 + score / 10);
	for (let i=0; i<bombCount; i++) {
		let x, y;
		do {
			x = 1 + Math.floor(Math.random() * (WIDTH-2));
			y = 1 + Math.floor(Math.random() * (HEIGHT-2));
		} while (isIllegalBomb(x, y));
		bombs.push([x, y]);
	}
}

// handle keypresses
process.stdin.on('keypress', (buffer, key) => {
	// handle Ctrl C
	if (key.ctrl && key.name == 'c') {
		exit();
	}
	
	// do correct thing for current state
	if (state == STATE_START) {
		if (['1', '2', '3', '4'].includes(key.name)) {
			speed = (4 - key.name) * 20 + INTERVAL;
			state = STATE_GAME;
			init();
		}
	} else if (state == STATE_GAME) {
		if (['left', 'right', 'up', 'down'].includes(key.name)) {
			keyBuf.push(key.name);
		}
	} else if (state == STATE_GAMEOVER) {
		state = STATE_START;
	}
});

// update (move snake and do collisions)
function update() {
	// handle time inc
	let nt = Date.now();
	let dt = nt - time;
	time = nt;
	
	// do appropriate thing for game state
	if (state == STATE_START) {
		// do nothing
	} else if (state == STATE_GAME) {		
		// update inc
		inc += dt;
		
		// if inc is big enough...
		if (inc > (vx == 0 ? speed * 2 : speed)) {
			inc = 0;	
				
			// handle buffered keypresses
			let key = keyBuf.shift();
			if (key) {
				if (key == 'left' && vx != 1) {
					vx = -1;
					vy = 0;
				} else if (key == 'right' && vx != -1) {
					vx = 1;
					vy = 0;
				} else if (key == 'up' && vy != 1) {
					vx = 0;
					vy = -1;
				} else if (key == 'down' && vy != -1) {
					vx = 0;
					vy = 1;
				}
			}
		
			// get new snake head
			let oldHead = snake[snake.length - 1];
			let newHead = [oldHead[0] + vx, oldHead[1] + vy];
			
			// make sure its an allowed snake head
			if (posInPosList(newHead, snake) || isOutOfBounds(newHead) || posInPosList(newHead, bombs)) {
				// it collides with the snake
				state = STATE_GAMEOVER;
				return;
			}
			
			// move snake
			snake.push(newHead);
			
			// remove bottom if not apple collide
			if (apple[0] == newHead[0] && apple[1] == newHead[1]) {
				setApple();
				setBombs();
				score++;
			} else {
				snake.shift();
			}
		}
	} else if (state == STATE_GAMEOVER) {
		// do nothing
	}
}

// render, returns a string to be printed to console
function render() {
	// raw result, 1D array of strings 
	let rawRes = defaultRes.slice();
	
	// render depending on state
	if (state == STATE_START) {
		drawString(rawRes, 'TERMINAL SNAKE', Math.floor(WIDTH / 2) - 7, 5);
		drawString(rawRes, 'PRESS 1, 2, 3, or 4 TO START LEVEL', Math.floor(WIDTH / 2) -17, 7);
		drawString(rawRes, 'CTRL + C TO EXIT', Math.floor(WIDTH / 2) - 8, 9);
	} else if (state == STATE_GAME) {
		// draw snake
		for (let i=0; i<snake.length; i++) {
			let seg = snake[i];
			rawRes[seg[0] + seg[1] * WIDTH] = SNAKE + '\u2588' + RESET;
		}
		
		// draw apple
		rawRes[apple[0] + apple[1] * WIDTH] = APPLE + '\u2B24' + RESET;
		
		// draw bombs
		for (let i=0; i<bombs.length; i++) {
			let bomb = bombs[i];
			rawRes[bomb[0] + bomb[1] * WIDTH] = BOMB + '\u2B24' + RESET;
		}
		
		// draw score
		let scoreStr = '' + score;
		drawString(rawRes, scoreStr, Math.floor(WIDTH / 2) - Math.floor(scoreStr.length / 2), HEIGHT - 1);
		
	} else if (state == STATE_GAMEOVER) {
		drawString(rawRes, 'GAME OVER!', Math.floor(WIDTH / 2) - 5, 5);
		let scoreStr = 'YOUR SCORE WAS ' + score;
		drawString(rawRes, scoreStr, Math.floor(WIDTH / 2) - Math.floor(scoreStr.length / 2), 7);
		drawString(rawRes, 'PRESS ANY KEY TO RESTART', Math.floor(WIDTH / 2) - 12, 9);
	} 
	
	// turn into string
	let tw = process.stdout.columns;
	let th = process.stdout.rows;
	let padX = ' '.repeat(Math.max(0, Math.floor((tw - WIDTH) / 2)));
	let padY = ' '.repeat(tw).repeat(Math.max(0, Math.floor((th - HEIGHT) / 2)));
	let finalRes = padY;
	for (let row=0; row<HEIGHT; row++) {
		let sub = rawRes.slice(row * WIDTH, (row + 1) * WIDTH).join('');
		sub = padX + sub + padX;
		
		// handle odd size
		if (tw % 2) sub += ' ';
		
		finalRes += sub;
	}
	finalRes += padY;
	return finalRes;
}

// game loop
function loop() {
	update();
	
	process.stdout.write(CLEAR);
	process.stdout.write(render());
}

// set state to start
state = STATE_START;

// start loop
time = Date.now();
setInterval(loop, INTERVAL);
