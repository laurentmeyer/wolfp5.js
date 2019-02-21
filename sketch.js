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

	sqrDistance(t) {
		return (sq(this.x - t.x) + sq(this.y - t.y));
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
        this.map = new Map();
        this.player = new Player(this.map.centerFirstFreeSquare());
        this.maxX = this.map.walls[0].length;
        this.maxY = this.map.walls.length;
		this.columns = floor(width / 2);
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
		this.translationStepPerSec = 2;
		this.rotationStepPerSec = 180;
		this.color = color(255, 204, 0);
		this.fov = 40.0;
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
			let translation = new Transform(-xTranslation, -yTranslation);
			this.transform = world.map.allowedTranslation(this.transform, translation);
		}
		if (keyIsDown(UP_ARROW)) {
			let xTranslation = translationStep * cos(this.transform.rotation);
			let yTranslation = -translationStep * sin(this.transform.rotation);
			let translation = new Transform(xTranslation, yTranslation);
			this.transform = world.map.allowedTranslation(this.transform, translation);
		}
		this.hits = new Array(world.columns);
		const angleStep = this.fov / world.columns;
		for (let i = 0; i < world.columns; i++) {
			this.hits[i] = new Hit(this.fov / 2 - i * angleStep);
		}
	}

	draw() {
		push();
		fill(this.color);
		let t = world.map.toMapPosition(new Transform(this.transform.x, this.transform.y));
		translate(t.x, t.y);
		rotate(-90 - this.transform.rotation);
		triangle(-5, -10, 0, 10, 5, -10);
		pop();
		for (let i = 0; i < world.columns; i++) {
			this.hits[i].draw(i);
		}
	}
}

class Hit {
    constructor(angle = 0) {
        this.ray = new Transform(world.player.transform.x, world.player.transform.y, world.player.transform.rotation + angle);
		this.impact = this.raycast();
		this.color = color(255, 0, 0);
        this.distance = this.distance();
    }

    distance() {
        var dx = this.impact.x - this.ray.x;
        var dy = this.impact.y - this.ray.y;
        return (sqrt(dx * dx + dy * dy));
    }

    raycastVertical() {
        if (this.ray.rotation == 90 || this.ray.rotation == 270)
            return (null);
        let impact = new Transform();
        let west = this.ray.rotation > 90 && this.ray.rotation < 270;
        impact.x = west ? floor(this.ray.x) : ceil(this.ray.x);
		let adj = impact.x - this.ray.x;
		let t = tan(this.ray.rotation);
        impact.y = this.ray.y - adj * t;
        if (!this.withinBounds(impact, 0, west))
            return (null);
        while (world.map.walls[Math.trunc(impact.y)][Math.trunc(impact.x - west)] == ' ') {
            impact.x += west ? -1 : 1;
            impact.y += west ? t : -t;
            if (!this.withinBounds(impact, 0, west))
                return (null);
        }
        return (impact);
    }

    raycastHorizontal() {
        if (this.ray.rotation == 0 || this.ray.rotation == 180)
            return (null);
        let impact = new Transform();
        let north = this.ray.rotation < 180;
        impact.y = north ? floor(this.ray.y) : ceil(this.ray.y);
		let adj = impact.y - this.ray.y;
		let t = tan(90 + this.ray.rotation);
        impact.x = this.ray.x + adj * t;
        if (!this.withinBounds(impact, north, 0))
            return (null);
        while (world.map.walls[Math.trunc(impact.y - north)][Math.trunc(impact.x)] == ' ') {
            impact.y += north ? -1 : 1;
            impact.x += north ? -t : t;
            if (!this.withinBounds(impact, north, 0))
                return (null);
        }
        return (impact);
    }

    raycast() {
        let h = this.raycastHorizontal(); 
        let v = this.raycastVertical(); 
        let shortest;
        if (null == v)
            shortest = h;
        else if (null == h)
            shortest = v;
        else
            shortest = this.ray.sqrDistance(v) < this.ray.sqrDistance(h) ? v : h;
        this.verticalHit = (shortest == v);
        return (shortest);
    }

    withinBounds(impact, north, west) {
        return (impact.y - north >= 0 && impact.y - north <= world.maxY - 1
            && impact.x - west >= 0 && impact.x - west <= world.maxX - 1);
    }

    drawMap() {
        push();
        let r = world.map.toMapPosition(world.player.transform);
        stroke(this.color);
        let i = world.map.toMapPosition(this.impact);
        line(r.x, r.y, i.x, i.y);
        pop();
    }

    drawFps(i) {
        push();
        let h = world.map.width / this.distance;
        if (h > world.map.height)
            h = world.map.height;
		let x = width / 2 + i;
		let y = height / 2;
        this.verticalHit ? stroke(0, 127, 0) : stroke(0, 0, 127);
		line(x, y - h / 2, x, y + h / 2);
        pop();
    }

    draw(i) {
        this.drawMap();
        this.drawFps(i);
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

    allowedTranslation(position, translation) {
        var allowed = new Transform();
        allowed.rotation = position.rotation;

        var x = position.x + translation.x;
        var tx = Math.trunc(x);
        allowed.x = this.walls[Math.trunc(position.y)][tx] == ' ' ? x : position.x;
        var y = position.y + translation.y;
        var ty = Math.trunc(y);
        allowed.y = this.walls[ty][Math.trunc(allowed.x)] == ' ' ? y : position.y;
        return (allowed);
    }

    centerFirstFreeSquare() {
        for (var j = 0; j < this.walls.length; j++) {
            for (var i = 0; i < this.walls[0].length; i++) {
                if (this.walls[j][i] == ' ') {
                    return (new Transform(i + 0.5, j + 0.5));
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