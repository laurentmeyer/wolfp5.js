let world;
let timer;

function setup() {
	createCanvas(windowWidth, windowHeight);
	frameRate(60);
	angleMode(DEGREES);

	world = new World();	
	timer = new Timer();
}

function draw() {
	timer.update();
	world.update();


	push();
	fill(30);
	rect(0, 0, width, height);
	pop();

	world.draw();

	push();
	var fps = frameRate();
	fill(255);
	stroke(0);
	text("FPS: " + fps.toFixed(2), 10, height - 10);
	pop();
}

class Transform {
	constructor(x = 0, y = 0, rotation = 0) {
		this.x = x;
		this.y = y;
		this.rotation = this.bindDegrees(rotation);
	}

	bindDegrees(angle) {
		while (angle < 0)
			angle += 360;
		while (angle >= 360)
			angle -= 360;
		return (angle);
	}

	rotate(angle) {
		this.rotation = this.bindDegrees(this.rotation + angle);
	}
}

class Timer {
	constructor() {
		this.last = millis();
		this.delta = 0;
	}

	update () {
		let now = millis();
		this.delta = (now - this.last) / 1000;
		this.last = now;
	}
}

class World {
    constructor() {
        this.player = new Player ();
        this.map = new Map();
    }

    update() {
        this.player.update();
    }

    draw() {
        this.map.draw();
        this.player.draw();
	}
}

class Player {
	constructor(transform = new Transform()) {
		this.transform = transform;
		this.translationStepPerSec = 100;
		this.rotationStepPerSec = 180;
		this.color = color(255, 204, 0);
	}

	update() {
		let translationStep = this.translationStepPerSec * timer.delta;
		let rotationStep = this.rotationStepPerSec * timer.delta;
		if (keyIsDown(RIGHT_ARROW)) {
			this.transform.rotate(-rotationStep);
		}
		if (keyIsDown(LEFT_ARROW)) {
			this.transform.rotate(rotationStep);
		}
		if (keyIsDown(DOWN_ARROW)) {
			let xTranslation = translationStep * cos(this.transform.rotation);
			let yTranslation = -translationStep * sin(this.transform.rotation);
			let translated = new Transform(this.transform.x - xTranslation,
				this.transform.y - yTranslation,
				this.transform.rotation);
			this.transform = translated;
		}
		if (keyIsDown(UP_ARROW)) {
			let xTranslation = translationStep * cos(this.transform.rotation);
			let yTranslation = -translationStep * sin(this.transform.rotation);
			let translated = new Transform(this.transform.x + xTranslation,
				this.transform.y + yTranslation,
				this.transform.rotation);
			this.transform = translated;
		}
	}

	draw() {
		push();
		fill(this.color);
		translate(this.transform.x, this.transform.y);
		rotate(-90 - this.transform.rotation);
		triangle(-5, -10, 0, 10, 5, -10);
		pop();
	}
}

class Map {
    constructor() {
        this.walls = [
            ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
            ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', ' ', 'B', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', ' ', ' ', 'B', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', ' ', 'B', 'B', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', ' ', 'B', 'B', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
			['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W']];
		this.wallsAreLegal = true;
		this.checkWalls();
		this.wallSidePixels = min(height / (this.walls.length), width / (2 * this.walls[0].length));
		this.width = this.wallSidePixels * this.walls[0].length;
		this.height = this.wallSidePixels * this.walls.length;
	}

	checkWalls() {
		for (var j = 0; j < this.walls.length; j++) {
			if (this.walls[j].length != this.walls[0].length) {
				print("Map is not rectangular");
				this.wallsAreLegal = false;
				return;
			}
			for (var i = 0; i < this.walls[0].length; i++) {
				if (i == 0 || i == this.walls[0].length - 1
					|| j == 0 || j == this.walls.length - 1) {
					this.walls[j][i] = 'W';
				}
			}
		}
	}

    toMapPosition(transform) {
        let x = transform.x * this.wallSidePixels;
        let y = transform.y - this.walls.length / 2;
        y *= this.wallSidePixels;
        y += height / 2;
        return (new Transform(x, y, transform.rotation));
    }

	draw() {
		if (!this.wallsAreLegal)
			return;
		push();
		fill(196);
		for (var j = 0; j < this.walls.length; j++) {
			for (var i = 0; i < this.walls[0].length; i++) {
				if (this.walls[j][i] != ' ') {
					let t = this.toMapPosition(new Transform(i, j));
					rect(t.x, t.y, this.wallSidePixels, this.wallSidePixels);
				}
			}
		}
		pop();
	}
}