//Playing field size
var COLS = 28;
var ROWS = 31;
var TILE_WIDTH = 22;
var TILE_HEIGHT = 22;

//Grid legend
var EMPTY = 0;
var WALL = 1;
var PACBOY = 2;
var BONUS = 3;
var PELLET = 4;
var ENEMY = 5;
var POWER_PELLET = 6;
var SPAWN_LOCATION = 7;
var DOOR = 8;
// *** ANYTHING ABOVE 30 IS AN ENEMY ID ***

var LEFT = 0;
var UP = 1;
var RIGHT = 2;
var DOWN = 3;

//Bonuses
var BONUSES_COUNT = 2;
var NONE = 0;
var DOUBLE_POINTS = 1;
var CANNON = 2;

//Keyboard codes
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_SPACE = 32;

//Enemy states
var NORMAL = 0;
var VULNERABLE = 1;
var DEAD = 2;

var grid = [];

var mobile = false;

var level = 1;
var score = 0;
var lives = 3;

var enemies = [];

var weapons = [];

var bonusTimer = 100;

var vulnerableTimer = 0;

var bonusReady = false;

var pelletsRemaining = 0;

var levelComplete = false;

var musicEngine = new Audio();
var wakaWaka = new Audio();
var deathSound = new Audio();
	
var pacboy = {
	direction: UP,
	x: 0,
	y: 0,
	movingUp: false,
	movingDown: false,
	movingLeft: false,
	movingRight: false,
	bonusActive: NONE,
	shooting: false,
	
	init: function(d, x, y) {
		this.direction = d;
		this.x = x;
		this.y = y;
	}
}

var target = {
	x: 0,
	y: 0
}

var gate = {
	x: 0,
	y: 0
}

function weapon(d, x, y, id) {
	this.direction = d;
	this.x = x;
	this.y = y;
	this.id = id;
	this.destroyed = false;
	
	this.move = function() {
		var nx = this.x;
		var ny = this.y;
		switch (this.direction) {
			case UP:
				ny--;
				break;
			case DOWN:
				ny++;
				break;
			case LEFT:
				nx--;
				break;
			case RIGHT:
				nx++;
				break;
		}
		
		if (nx < 0)
			nx = COLS-1;
		if (ny < 0)
			ny = ROWS-1;
		if (nx > COLS-1)
			nx = 0;
		if (ny > ROWS-1)
			ny = 0;
		
		switch (grid[ny][nx]) {
			case WALL:
				this.destroyed = true;
				return;
			case DOOR:
				this.destroyed = true;
				return;
			default:
				this.x = nx;
				this.y = ny;
				// Check for weapon-enemy collision
				for (var enemy = 0; enemy < enemies.length; enemy++) {
					if (enemies[enemy].x === this.x && enemies[enemy].y === this.y) {
						if (enemies[enemy].state === VULNERABLE || enemies[enemy].state === NORMAL) {
							if (pacboy.bonusActive === DOUBLE_POINTS)
								score += 200;
							else
								score += 100;
							enemies[enemy].state = DEAD;
							this.destroyed = true;
						} 
					}
				}
		}
		
		console.log("moving");
	}
	
	this.draw = function() {
		if (this.destroyed)
			return;
		
		console.log("drawing");
		
		ctx.fillStyle = "#0f0";
		ctx.fillRect(this.x*TILE_WIDTH+TILE_WIDTH/2-TILE_WIDTH/8, this.y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/8, TILE_WIDTH/4, TILE_HEIGHT/4);
	}
}

function enemy(d, x, y, id) {
	this.direction = d;
	this.x = x;
	this.y = y;
	this.id = id;
	this.state = NORMAL;
	this.target = {
		x: 0,
		y: 0
	};
	
	this.action = function() {
		
	}
	
	this.move = function() {
		var xDistToTarget;
		var yDistToTarget;
		switch (this.id) {
			case 30:
				switch (this.state) {
					case NORMAL:
						this.target.x = pacboy.x;
						this.target.y = pacboy.y;
						xDistToTarget = this.target.x - this.x;
						yDistToTarget = this.target.y - this.y;
						break;
					case VULNERABLE:
						this.target.x = pacboy.x;
						this.target.y = pacboy.y;
						xDistToTarget = this.x - this.target.x;
						yDistToTarget = this.y - this.target.y;
						break;
					case DEAD:
						this.target.x = gate.x;
						this.target.y = gate.y;
						xDistToTarget = this.target.x - this.x;
						yDistToTarget = this.target.y - this.y;
						break;
				}
				
				var nextX = this.x;
				var nextY = this.y;
				switch (this.direction) {
					case UP:
						nextY--;
						break;
					case DOWN:
						nextY++;
						break;
					case LEFT:
						nextX--;
						break;
					case RIGHT:
						nextX++;
						break;
				}

				if (Math.abs(xDistToTarget) < Math.abs(yDistToTarget)) {
					if (yDistToTarget > 0)
						this.direction = DOWN;
					else
						this.direction = UP;
				} else {
					if (xDistToTarget > 0)
						this.direction = RIGHT;
					else
						this.direction = LEFT;
				}
				break;
			default:
				switch (this.state) {
					case NORMAL:
						this.target.x = pacboy.x;
						this.target.y = pacboy.y;
						xDistToTarget = this.target.x - this.x;
						yDistToTarget = this.target.y - this.y;
						break;
					case VULNERABLE:
						this.target.x = pacboy.x;
						this.target.y = pacboy.y;
						xDistToTarget = this.x - this.target.x;
						yDistToTarget = this.y - this.target.y;
						break;
					case DEAD:
						this.target.x = gate.x;
						this.target.y = gate.y;
						xDistToTarget = this.target.x - this.x;
						yDistToTarget = this.target.y - this.y;
						break;
				}
				
				var nextX = this.x;
				var nextY = this.y;
				switch (this.direction) {
					case UP:
						nextY--;
						break;
					case DOWN:
						nextY++;
						break;
					case LEFT:
						nextX--;
						break;
					case RIGHT:
						nextX++;
						break;
				}

				if (Math.abs(xDistToTarget) < Math.abs(yDistToTarget)) {
					if (yDistToTarget > 0)
						this.direction = DOWN;
					else
						this.direction = UP;
				} else {
					if (xDistToTarget > 0)
						this.direction = RIGHT;
					else
						this.direction = LEFT;
				}
		}
	}
}

// Game objects
var canvas, ctx, keystate, frames;
	
function main() {
	canvas = document.getElementById("canvas");
	//canvas = document.createElement("canvas");
	canvas.width = COLS*TILE_WIDTH+12*TILE_WIDTH;
	canvas.height = ROWS*TILE_HEIGHT;
	ctx = canvas.getContext("2d");
	//document.body.appendChild(canvas);
	
	//Taken from Baraa at StackOverflow http://stackoverflow.com/questions/6666907/how-to-detect-a-mobile-device-with-javascript
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
		mobile = true;
	}
	
	frames = 0;
	keystate = {};
	document.addEventListener("keydown", function(evt){
		keystate[evt.keyCode] = true;
	});
	document.addEventListener("keyup", function(evt){
		delete keystate[evt.keyCode];
	});
	
	//Mobile controls obtained from Sam Vloeberghs at http://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android
	document.addEventListener('touchstart', handleTouchStart, false);        
	document.addEventListener('touchmove', handleTouchMove, false);

	var xDown = null;                                                        
	var yDown = null;                                                        

	function handleTouchStart(evt) {                                         
		xDown = evt.touches[0].clientX;                                      
		yDown = evt.touches[0].clientY;                                      
	};                                                

	function handleTouchMove(evt) {
		evt.preventDefault();
		
		if ( ! xDown || ! yDown ) {
			return;
		}

		var xUp = evt.touches[0].clientX;                                    
		var yUp = evt.touches[0].clientY;

		var xDiff = xDown - xUp;
		var yDiff = yDown - yUp;

		if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
			if ( xDiff > 0 ) {
				/* left swipe */ 
				keystate[KEY_LEFT] = true;
				keystate[KEY_RIGHT] = false;
				keystate[KEY_UP] = false;
				keystate[KEY_DOWN] = false;
			} else {
				/* right swipe */
				keystate[KEY_RIGHT] = true;
				keystate[KEY_LEFT] = false;
				keystate[KEY_UP] = false;
				keystate[KEY_DOWN] = false;
			}                       
		} else {
			if ( yDiff > 0 ) {
				/* up swipe */ 
				keystate[KEY_UP] = true;
				keystate[KEY_DOWN] = false;
				keystate[KEY_LEFT] = false;
				keystate[KEY_RIGHT] = false;
			} else { 
				/* down swipe */
				keystate[KEY_DOWN] = true;
				keystate[KEY_LEFT] = false;
				keystate[KEY_UP] = false;
				keystate[KEY_RIGHT] = false;
			}                                                                 
		}
		/* reset values */
		xDown = null;
		yDown = null;                                             
	};
	
	init();
}
	
function init() {
	levelComplete = false;
	
	grid = createGrid(COLS, ROWS);
	
	pelletsRemaining = 0;
	
	loadLevel(level);
	
	pacboy.init(UP, 10, 10);

	enemies = [];
	
	weapons = [];
	
	for (var y = 0; y < ROWS; y++) {
		for (var x = 0; x < COLS; x++) {
			switch (grid[y][x]) {
				case PACBOY:
					pacboy.x = x;
					pacboy.y = y;
					break;
				case PELLET:
					pelletsRemaining++;
					break;
				case DOOR:
					gate.x = x;
					gate.y = y;
					break;
				default:
					if (grid[y][x] >= 30) {
						enemies.push(new enemy(UP, x, y, grid[y][x]));
					}
			}
		}
	}
	
	if (!mobile) {
		musicEngine.preload = "auto";
		switch (level) {
			case 1:
				musicEngine.src = "02-block-town.mp3";
				break;
			case 2:
				musicEngine.src = "03-pacman-s-park.mp3";
				break;
			case 3:
				musicEngine.src = "04-jungly-steps.mp3";
				break;
			default:
				musicEngine.src = "02-block-town.mp3";
		}
	
		musicEngine.loop = true;
		musicEngine.addEventListener("error", function() { alert("Error downloading music. Code " + musicEngine.error.code); }, true);
		musicEngine.addEventListener("canplaythrough", musicLoaded(), true);
	
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.font = "36px Helvetica";
		ctx.fillStyle = "#fff";
		ctx.fillText("LOADING MUSIC", canvas.width/3, canvas.height/2);
	
		wakaWaka.preload = "auto";
		wakaWaka.src = "Waka_Waka.mp3";
		deathSound.preload = "auto";
		deathSound.src = "Death.mp3";	
	} else {
		loop();
	}
}

function musicLoaded() {
	musicEngine.play();
	loop();
}

function loop() {
	if (levelComplete) {
		init();
		return;
	}
	update();
	draw();
	
	window.requestAnimationFrame(loop, canvas);
}
	
function update() {
	frames++;
	
	if (pelletsRemaining === 0) {
		level++;
		levelComplete = true;
		return;
	}
	
	var oldDirection = pacboy.direction;
	
	if (keystate[KEY_LEFT])
		pacboy.direction = LEFT;
	if (keystate[KEY_UP])
		pacboy.direction = UP;
	if (keystate[KEY_RIGHT])
		pacboy.direction = RIGHT;
	if (keystate[KEY_DOWN])
		pacboy.direction = DOWN;
	if (keystate[KEY_SPACE])
		pacboy.shooting = true;
	
	if (frames%10 === 0) {
		bonusTimer--;
		pacboy.movingUp = false;
		pacboy.movingDown = false;
		pacboy.movingLeft = false;
		pacboy.movingRight = false;
		
		if (bonusTimer == 0) {
			pacboy.bonusActive = NONE;
			bonusReady = true;
		}
		
		if (--vulnerableTimer == 0)
			for (var enemy = 0; enemy < enemies.length; enemy++) {
				if (enemies[enemy].state === VULNERABLE)
					enemies[enemy].state = NORMAL;
			}
		
		if (pacboy.shooting) {
			if (pacboy.bonusActive === CANNON) {
				console.log("shot");
				weapons.push(new weapon(pacboy.direction, pacboy.x, pacboy.y, CANNON));
				pacboy.shooting = false;
			}
		}
		
		for (var w = 0; w < weapons.length; w++) {
			weapons[w].move;
			weapons[w].draw;
		}
		
		var nx = pacboy.x;
		var ny = pacboy.y;
		
		switch (pacboy.direction) {
			case LEFT:
				nx--;
				break;
			case UP:
				ny--;
				break;
			case RIGHT:
				nx++;
				break;
			case DOWN:
				ny++;
				break;
		}
		
		if (nx < 0)
			nx = COLS-1;
		if (ny < 0)
			ny = ROWS-1;
		if (nx > COLS-1)
			nx = 0;
		if (ny > ROWS-1)
			ny = 0;
		
		switch (grid[ny][nx]) {
			case WALL:
				pacboy.direction = oldDirection;
				break;
			case DOOR:
				pacboy.direction = oldDirection;
				break;
			case PELLET:
				if (!mobile) {
					wakaWaka.load();
					wakaWaka.play();
				}
				grid[ny][nx] = 0;
				pacboy.x = nx;
				pacboy.y = ny;
				pelletsRemaining--;
				break;
			case POWER_PELLET:
				grid[ny][nx] = 0;
				pacboy.x = nx;
				pacboy.y = ny;
				vulnerableTimer = 80;
				for (var enemy = 0; enemy < enemies.length; enemy++) {
					if (enemies[enemy].state === NORMAL)
						enemies[enemy].state = VULNERABLE;
				}
				break;
			case BONUS:
				if (bonusReady) {
					bonusReady = false;
					bonusTimer = 100;
					pacboy.bonusActive = Math.floor(Math.random()*BONUSES_COUNT+1);
					pacboy.bonusActive = CANNON;
				}
			default:
				pacboy.x = nx;
				pacboy.y = ny;
				// Check for player-enemy collision
				for (var enemy = 0; enemy < enemies.length; enemy++) {
					if (enemies[enemy].x === pacboy.x && enemies[enemy].y === pacboy.y) {
						if (enemies[enemy].state === VULNERABLE) {
							if (pacboy.bonusActive === DOUBLE_POINTS)
								score += 200;
							else
								score += 100;
							enemies[enemy].state = DEAD;
						} else if (enemies[enemy].state === NORMAL)
							death();
					}
				}
		}
		
		for (var enemy = 0; enemy < enemies.length; enemy++) {			
			nx = enemies[enemy].x;
			ny = enemies[enemy].y;
		
			switch (enemies[enemy].direction) {
				case LEFT:
					nx--;
					break;
				case UP:
					ny--;
					break;
				case RIGHT:
					nx++;
					break;
				case DOWN:
					ny++;
					break;
			}
		
			if (nx < 0)
				nx = COLS-1;
			if (ny < 0)
				ny = ROWS-1;
			if (nx > COLS-1)
				nx = 0;
			if (ny > ROWS-1)
				ny = 0;
		
			switch (grid[ny][nx]) {
				case WALL:
					enemies[enemy].direction = Math.floor(Math.random()*4);
					break;
				case DOOR:
					if (enemies[enemy].state === DEAD) {
						enemies[enemy].direction = DOWN;
						enemies[enemy].state = NORMAL;
					} else
						enemies[enemy].direction = UP;
					enemies[enemy].x = nx;
					enemies[enemy].y = ny;
					break;
				default:
					enemies[enemy].move();
					enemies[enemy].x = nx;
					enemies[enemy].y = ny;
			}	
		}	
		// Check for player-enemy collision
		for (var enemy = 0; enemy < enemies.length; enemy++) {
			if (enemies[enemy].x === pacboy.x && enemies[enemy].y === pacboy.y) {
				if (enemies[enemy].state === VULNERABLE) {
					if (pacboy.bonusActive === DOUBLE_POINTS)
						score += 200;
					else
						score += 100;
					enemies[enemy].state = DEAD;
				} else if (enemies[enemy].state === NORMAL)
					death();
			}
		}
	}
}

function death() {
	deathSound.play();
	lives--;
	
	enemies = [];
	
	if (lives == 0) {
		gameOver();
	} else {
		for (var y = 0; y < ROWS; y++) {
			for (var x = 0; x < COLS; x++) {
				switch (grid[y][x]) {
					case PACBOY:
						pacboy.x = x;
						pacboy.y = y;
						break;
					default:
						if (grid[y][x] >= 30) {
							enemies.push(new enemy(UP, x, y, grid[y][x]));
						}
				}
			}
		}
	}
}

function gameOver() {
	level = 1;
	lives = 3;
	score = 0;
	pacboy.bonusActive = NONE;
	init();
}

function draw() {
	for (var y = 0; y < ROWS; y++) {
		for (var x = 0; x < COLS; x++) {
			ctx.fillStyle = "#000";
			ctx.fillRect(x*TILE_WIDTH, y*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
			switch (grid[y][x]) {
				case EMPTY:
					ctx.fillStyle = "#000";
					ctx.fillRect(x*TILE_WIDTH, y*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
					break;
				case PACBOY:
					ctx.fillStyle = "#0ff";
					break;
				case WALL:
					var levelColour;
					switch (level) {
						case 1:
							levelColour = "#00f";
							break;
						case 2:
							levelColour = "#f00";
							break;
						case 3:
							levelColour = "#0f0";
							break;
						default:
							levelColour = "#00f";
					}
					ctx.fillStyle = levelColour;
					ctx.fillRect(x*TILE_WIDTH, y*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
					break;
				case PELLET:
					ctx.fillStyle = "#ff0";
					ctx.fillRect(x*TILE_WIDTH+TILE_WIDTH/2-TILE_WIDTH/8, y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/8, TILE_WIDTH/4, TILE_HEIGHT/4);
					break;
				case DOOR:
					ctx.fillStyle = "#f0f";
					ctx.fillRect(x*TILE_WIDTH, y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH, TILE_HEIGHT/4);
					break;
					
				case POWER_PELLET:
					ctx.fillStyle = "#ff0";
					ctx.fillRect(x*TILE_WIDTH+TILE_WIDTH/2-TILE_WIDTH/4, y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/4, TILE_WIDTH/2, TILE_HEIGHT/2);
					break;
				case BONUS:
					if (bonusReady) {
						ctx.fillStyle = "#f00";
						ctx.fillRect(x*TILE_WIDTH+TILE_WIDTH/2-TILE_WIDTH/4, y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/4, TILE_WIDTH/2, TILE_HEIGHT/2);
					}
					break;
			}
		}
	}
	
	//Draw Pacboy
	ctx.fillStyle = "#ff0";
	switch (pacboy.direction) {
		case UP:
			ctx.beginPath();
			ctx.arc(pacboy.x*TILE_WIDTH+TILE_WIDTH/2, pacboy.y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH/2, Math.PI/4*7, Math.PI/4*3, false);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(pacboy.x*TILE_WIDTH+TILE_WIDTH/2, pacboy.y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH/2, Math.PI/4, Math.PI/4*5, false);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(pacboy.x*TILE_WIDTH+TILE_WIDTH/2+TILE_WIDTH/4, pacboy.y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH/2/5, 0, 2*Math.PI, false);
			ctx.fillStyle = "#000";
			ctx.fill();
			break;
		case DOWN:
			ctx.beginPath();
			ctx.arc(pacboy.x*TILE_WIDTH+TILE_WIDTH/2, pacboy.y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH/2, Math.PI/4*3, Math.PI/4*7, false);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(pacboy.x*TILE_WIDTH+TILE_WIDTH/2, pacboy.y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH/2, Math.PI/4*5, Math.PI/4, false);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(pacboy.x*TILE_WIDTH+TILE_WIDTH/2-TILE_WIDTH/4, pacboy.y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH/2/5, 0, 2*Math.PI, false);
			ctx.fillStyle = "#000";
			ctx.fill();
			break;
		case LEFT:
			ctx.beginPath();
			ctx.arc(pacboy.x*TILE_WIDTH+TILE_WIDTH/2, pacboy.y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH/2, Math.PI/4*5, Math.PI/4, false);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(pacboy.x*TILE_WIDTH+TILE_WIDTH/2, pacboy.y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH/2, Math.PI/4*7, Math.PI/4*3, false);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(pacboy.x*TILE_WIDTH+TILE_WIDTH/2, pacboy.y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/4, TILE_WIDTH/2/5, 0, 2*Math.PI, false);
			ctx.fillStyle = "#000";
			ctx.fill();
			break;
		case RIGHT:
			ctx.beginPath();
			ctx.arc(pacboy.x*TILE_WIDTH+TILE_WIDTH/2, pacboy.y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH/2, Math.PI/4, Math.PI/4*5, false);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(pacboy.x*TILE_WIDTH+TILE_WIDTH/2, pacboy.y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH/2, Math.PI/4*3, Math.PI/4*7, false);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(pacboy.x*TILE_WIDTH+TILE_WIDTH/2, pacboy.y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/4, TILE_WIDTH/2/5, 0, 2*Math.PI, false);
			ctx.fillStyle = "#000";
			ctx.fill();
			break;
	}
	
	//Draw enemies
	for (var enemy = 0; enemy < enemies.length; enemy++)
		switch (enemies[enemy].id) {
			case 30:
				if (enemies[enemy].state === NORMAL || enemies[enemy].state === VULNERABLE) {
					if (enemies[enemy].state === NORMAL)
						ctx.fillStyle = "#f00";
					else
						ctx.fillStyle = "#00B";
					
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/2, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/2,0,Math.PI, true);
					ctx.fill();
					ctx.fillRect(enemies[enemy].x*TILE_WIDTH, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH, TILE_HEIGHT/2);
					ctx.fillStyle = "#fff";
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill();
					ctx.fillStyle = "#fff";
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill();
					ctx.fillStyle = "#00a";
					switch (enemies[enemy].direction) {
						case UP:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case DOWN:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case LEFT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case RIGHT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
					}
				} else {
					ctx.fillStyle = "#fff";
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill()
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill();
					ctx.fillStyle = "#00a";
					switch (enemies[enemy].direction) {
						case UP:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case DOWN:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case LEFT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case RIGHT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
					}
				}
				break;
			case 31:
				if (enemies[enemy].state === NORMAL || enemies[enemy].state === VULNERABLE) {
					if (enemies[enemy].state === NORMAL)
						ctx.fillStyle = "#0ff";
					else
						ctx.fillStyle = "#00B";
					
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/2, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/2,0,Math.PI, true);
					ctx.fill();
					ctx.fillRect(enemies[enemy].x*TILE_WIDTH, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH, TILE_HEIGHT/2);
					ctx.fillStyle = "#fff";
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill();
					ctx.fillStyle = "#fff";
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill();
					ctx.fillStyle = "#00a";
					switch (enemies[enemy].direction) {
						case UP:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case DOWN:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case LEFT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case RIGHT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
					}
				} else {
					ctx.fillStyle = "#fff";
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill()
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill();
					ctx.fillStyle = "#00a";
					switch (enemies[enemy].direction) {
						case UP:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case DOWN:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case LEFT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case RIGHT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
					}
				}
				break;
			case 32:
				if (enemies[enemy].state === NORMAL || enemies[enemy].state === VULNERABLE) {
					if (enemies[enemy].state === NORMAL)
						ctx.fillStyle = "pink";
					else
						ctx.fillStyle = "#00B";
					
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/2, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/2,0,Math.PI, true);
					ctx.fill();
					ctx.fillRect(enemies[enemy].x*TILE_WIDTH, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH, TILE_HEIGHT/2);
					ctx.fillStyle = "#fff";
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill();
					ctx.fillStyle = "#fff";
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill();
					ctx.fillStyle = "#00a";
					switch (enemies[enemy].direction) {
						case UP:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case DOWN:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case LEFT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case RIGHT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
					}
				} else {
					ctx.fillStyle = "#fff";
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill()
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill();
					ctx.fillStyle = "#00a";
					switch (enemies[enemy].direction) {
						case UP:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case DOWN:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case LEFT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case RIGHT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
					}
				}
				break;
			case 33:
				if (enemies[enemy].state === NORMAL || enemies[enemy].state === VULNERABLE) {
					if (enemies[enemy].state === NORMAL)
						ctx.fillStyle = "orange";
					else
						ctx.fillStyle = "#00B";
					
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/2, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/2,0,Math.PI, true);
					ctx.fill();
					ctx.fillRect(enemies[enemy].x*TILE_WIDTH, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2, TILE_WIDTH, TILE_HEIGHT/2);
					ctx.fillStyle = "#fff";
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill();
					ctx.fillStyle = "#fff";
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill();
					ctx.fillStyle = "#00a";
					switch (enemies[enemy].direction) {
						case UP:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case DOWN:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case LEFT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case RIGHT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
					}
				} else {
					ctx.fillStyle = "#fff";
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill()
					ctx.beginPath();
					ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/6,0,2*Math.PI);
					ctx.fill();
					ctx.fillStyle = "#00a";
					switch (enemies[enemy].direction) {
						case UP:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2-TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case DOWN:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2+TILE_HEIGHT/12,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case LEFT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3-TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
						case RIGHT:
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							ctx.beginPath();
							ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/4*3+TILE_WIDTH/12, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/12,0,2*Math.PI);
							ctx.fill();
							break;
					}
				}
				break;
			default:
				ctx.fillStyle = "#fff";
				ctx.beginPath();
				ctx.arc(enemies[enemy].x*TILE_WIDTH+TILE_WIDTH/2, enemies[enemy].y*TILE_HEIGHT+TILE_HEIGHT/2,TILE_WIDTH/2,0,Math.PI, true);
				ctx.fill();
		}
	
	//Draw HUD
	ctx.fillStyle = "#000";
	ctx.fillRect(TILE_WIDTH*COLS, 0, canvas.width-TILE_WIDTH*COLS, canvas.height);
	
	ctx.beginPath();
	ctx.lineWidth= "6";
	ctx.strokeStyle = "red";
	ctx.rect(TILE_WIDTH*COLS, 0, canvas.width-TILE_WIDTH*COLS, canvas.height);
	ctx.stroke();
	
	ctx.font = "26px Helvetica";
	ctx.fillStyle = "#fff";
	ctx.fillText("SCORE: " + score, TILE_WIDTH*(COLS+1), TILE_HEIGHT*2);
	
	ctx.font = "26px Helvetica";
	ctx.fillStyle = "#fff";
	ctx.fillText("LEVEL: " + level, TILE_WIDTH*(COLS+1), TILE_HEIGHT*4);
	
	var bonusDescription = "";
	
	switch (pacboy.bonusActive) {
		case DOUBLE_POINTS:
			bonusDescription = "2x points";
			break;
		case CANNON:
			bonusDescription = "Cannon";
			break;
		default:
			bonusDescription = "";
	}
	
	ctx.font = "26px Helvetica";
	ctx.fillStyle = "#fff";
	ctx.fillText("BONUS: " + bonusDescription, TILE_WIDTH*(COLS+1), canvas.height - TILE_HEIGHT*4);
	
	ctx.font = "26px Helvetica";
	ctx.fillStyle = "#fff";
	ctx.fillText("LIVES: " + lives, TILE_WIDTH*(COLS+1), canvas.height - TILE_HEIGHT*2);
	
	
}

function loadLevel(level) {
	switch (level) {
		case 1:
			grid[0] = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
			grid[1] = [1,4,4,4,4,4,4,4,4,4,4,4,4,1,1,4,4,4,4,4,4,4,4,4,4,4,4,1];
			grid[2] = [1,4,1,1,1,1,4,1,1,1,1,1,4,1,1,4,1,1,1,1,1,4,1,1,1,1,4,1];
			grid[3] = [1,6,1,1,1,1,4,1,1,1,1,1,4,1,1,4,1,1,1,1,1,4,1,1,1,1,6,1];
			grid[4] = [1,4,1,1,1,1,4,1,1,1,1,1,4,1,1,4,1,1,1,1,1,4,1,1,1,1,4,1];
			grid[5] = [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1];
			grid[6] = [1,4,1,1,1,1,4,1,1,4,1,1,1,1,1,1,1,1,4,1,1,4,1,1,1,1,4,1];
			grid[7] = [1,4,1,1,1,1,4,1,1,4,1,1,1,1,1,1,1,1,4,1,1,4,1,1,1,1,4,1];
			grid[8] = [1,4,4,4,4,4,4,1,1,4,4,4,4,1,1,4,4,4,4,1,1,4,4,4,4,4,4,1];
			grid[9] = [1,1,1,1,1,1,4,1,1,1,1,1,0,1,1,0,1,1,1,1,1,4,1,1,1,1,1,1];
			grid[10] = [0,0,0,0,0,1,4,1,1,1,1,1,0,1,1,0,1,1,1,1,1,4,1,0,0,0,0,0];
			grid[11] = [0,0,0,0,0,1,4,1,1,0,0,0,0,30,0,0,0,0,0,1,1,4,1,0,0,0,0,0];
			grid[12] = [0,0,0,0,0,1,4,1,1,0,1,1,1,8,8,1,1,1,0,1,1,4,1,0,0,0,0,0];
			grid[13] = [1,1,1,1,1,1,4,1,1,0,1,0,0,0,0,0,0,1,0,1,1,4,1,1,1,1,1,1];
			grid[14] = [0,0,0,0,0,0,4,0,0,0,1,0,31,32,33,0,0,1,0,0,0,4,0,0,0,0,0,0];
			grid[15] = [1,1,1,1,1,1,4,1,1,0,1,0,0,0,0,0,0,1,0,1,1,4,1,1,1,1,1,1];
			grid[16] = [0,0,0,0,0,1,4,1,1,0,1,1,1,1,1,1,1,1,0,1,1,4,1,0,0,0,0,0];
			grid[17] = [0,0,0,0,0,1,4,1,1,0,0,0,0,0,3,0,0,0,0,1,1,4,1,0,0,0,0,0];
			grid[18] = [0,0,0,0,0,1,4,1,1,0,1,1,1,1,1,1,1,1,0,1,1,4,1,0,0,0,0,0];
			grid[19] = [1,1,1,1,1,1,4,1,1,0,1,1,1,1,1,1,1,1,0,1,1,4,1,1,1,1,1,1];
			grid[20] = [1,4,4,4,4,4,4,4,4,4,4,4,4,1,1,4,4,4,4,4,4,4,4,4,4,4,4,1];
			grid[21] = [1,4,1,1,1,1,4,1,1,1,1,1,4,1,1,4,1,1,1,1,1,4,1,1,1,1,4,1];
			grid[22] = [1,4,1,1,1,1,4,1,1,1,1,1,4,1,1,4,1,1,1,1,1,4,1,1,1,1,4,1];
			grid[23] = [1,6,4,4,1,1,4,4,4,4,4,4,4,2,4,4,4,4,4,4,4,4,1,1,4,4,6,1];
			grid[24] = [1,1,1,4,1,1,4,1,1,4,1,1,1,1,1,1,1,1,4,1,1,4,1,1,4,1,1,1];
			grid[25] = [1,1,1,4,1,1,4,1,1,4,1,1,1,1,1,1,1,1,4,1,1,4,1,1,4,1,1,1];
			grid[26] = [1,4,4,4,4,4,4,1,1,4,4,4,4,1,1,4,4,4,4,1,1,4,4,4,4,4,4,1];
			grid[27] = [1,4,1,1,1,1,1,1,1,1,1,1,4,1,1,4,1,1,1,1,1,1,1,1,1,1,4,1];
			grid[28] = [1,4,1,1,1,1,1,1,1,1,1,1,4,1,1,4,1,1,1,1,1,1,1,1,1,1,4,1];
			grid[29] = [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1];
			grid[30] = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
			break;
		case 2:
			grid[0] = [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1];
			grid[1] = [1,4,4,4,4,4,4,4,4,4,4,4,4,0,0,4,4,4,4,4,4,4,4,4,4,4,4,1];
			grid[2] = [1,4,1,1,1,1,4,1,1,1,1,1,4,1,1,4,1,1,1,1,1,4,1,1,1,1,4,1];
			grid[3] = [1,6,1,1,1,1,4,1,1,1,1,1,4,1,1,4,1,1,1,1,1,4,1,1,1,1,6,1];
			grid[4] = [1,4,1,1,1,1,4,1,1,1,1,1,4,1,1,4,1,1,1,1,1,4,1,1,1,1,4,1];
			grid[5] = [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1];
			grid[6] = [1,4,31,1,1,1,4,32,1,4,1,1,1,1,1,1,1,33,4,1,1,4,1,1,1,1,4,1];
			grid[7] = [1,4,1,1,1,1,4,1,1,4,1,1,1,1,1,1,1,1,4,1,1,4,1,1,1,1,4,1];
			grid[8] = [1,4,4,4,4,4,4,1,1,4,4,4,4,1,1,4,4,4,4,1,1,4,4,4,4,4,4,1];
			grid[9] = [1,1,4,1,1,1,4,1,1,1,1,1,0,1,1,0,1,1,1,1,1,4,1,1,1,1,1,1];
			grid[10] = [0,0,4,0,0,1,4,1,1,1,1,1,0,1,1,0,1,1,1,1,1,4,1,0,0,0,0,0];
			grid[11] = [0,30,4,0,0,1,4,1,1,0,0,0,0,30,0,0,0,0,0,1,1,4,1,0,0,0,0,0];
			grid[12] = [0,0,4,0,0,1,4,1,1,0,1,1,1,8,8,1,1,1,0,1,1,4,1,0,0,0,0,0];
			grid[13] = [1,1,4,1,1,1,4,1,1,0,1,0,0,0,0,0,0,1,0,1,1,4,1,1,1,1,1,1];
			grid[14] = [0,0,0,0,0,0,4,0,0,0,1,0,31,32,33,0,0,1,0,0,0,4,0,0,0,0,0,0];
			grid[15] = [1,1,4,1,1,1,4,1,1,0,1,0,0,0,0,0,0,1,0,1,1,4,1,1,1,1,1,1];
			grid[16] = [0,0,4,0,0,1,4,1,1,0,1,1,1,1,1,1,1,1,0,1,1,4,1,0,0,0,0,0];
			grid[17] = [0,0,4,0,0,1,4,1,1,0,0,0,0,0,3,0,0,0,0,1,1,4,1,0,0,0,0,0];
			grid[18] = [0,0,4,0,0,1,4,1,1,0,1,4,4,4,1,1,1,1,0,1,1,4,1,0,0,0,0,0];
			grid[19] = [1,1,4,1,1,1,4,1,1,0,4,4,1,4,4,4,1,1,0,1,1,4,1,1,1,1,1,1];
			grid[20] = [1,4,4,4,4,4,4,4,4,4,4,4,4,1,1,4,4,4,4,4,4,4,4,4,4,4,4,1];
			grid[21] = [1,4,1,1,1,1,4,1,1,1,1,1,4,1,1,4,1,1,1,1,1,4,1,1,1,1,4,1];
			grid[22] = [1,4,1,1,1,1,4,1,1,1,1,1,4,1,1,4,1,1,1,1,1,4,1,1,1,1,4,1];
			grid[23] = [1,6,4,4,1,1,4,4,4,4,4,4,4,2,4,4,4,4,4,4,4,4,1,1,4,4,6,1];
			grid[24] = [1,1,1,4,1,1,4,1,1,4,1,1,1,1,1,1,1,1,4,1,1,4,1,1,4,1,1,1];
			grid[25] = [1,1,1,4,1,1,4,1,1,4,1,1,1,1,1,1,1,1,4,1,1,4,1,1,4,1,1,1];
			grid[26] = [1,4,4,4,4,4,4,1,1,4,4,4,4,1,1,4,4,4,4,1,1,4,4,4,4,4,4,1];
			grid[27] = [1,4,1,1,1,1,1,1,1,1,1,1,4,1,1,4,1,1,1,1,1,1,1,1,1,1,4,1];
			grid[28] = [1,4,1,1,1,1,1,1,1,1,1,1,4,1,1,4,1,1,1,1,1,1,1,1,1,1,4,1];
			grid[29] = [1,4,4,4,4,4,4,4,4,4,4,4,4,0,0,4,4,4,4,4,4,4,4,4,4,4,4,1];
			grid[30] = [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1];
			break;
		default:
			grid[0] = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
			grid[1] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[2] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[3] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[4] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[5] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[6] = [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1];
			grid[7] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[8] = [1,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[9] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[10] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[11] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[12] = [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[13] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[14] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[15] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[16] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[17] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[18] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[19] = [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1];
			grid[20] = [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[21] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[22] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[23] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[24] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[25] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1];
			grid[26] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[27] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[28] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[29] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
			grid[30] = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
	}
}

function createGrid(COLS, ROWS) {
	var grid = [];
	for (var x = 0; x < COLS; x++) {
			grid.push([]);
			for (var y = 0; y < ROWS; y++) {
				grid[x].push(0);
			}
		}
	return grid;
};

main();