let t;
let timer;

function setup() {
	createCanvas(windowWidth, windowHeight);
	frameRate(60);
	angleMode(DEGREES);

	t = new Transform();
	timer = new Timer();
}

function draw() {
	timer.update();

	const translationStepPerSec = 100;
	let translationStep = translationStepPerSec * timer.delta;
	const rotationStepPerSec = 180;
	let rotationStep = rotationStepPerSec * timer.delta;
	if (keyIsDown(RIGHT_ARROW)) {
		t.rotate(-rotationStep);
	}
	if (keyIsDown(LEFT_ARROW)) {
		t.rotate(rotationStep);
	}
	if (keyIsDown(DOWN_ARROW)) {
		let xTranslation = translationStep * cos(t.rotation);
		let yTranslation = -translationStep * sin(t.rotation);
		let translated = new Transform(t.x - xTranslation, t.y - yTranslation, t.rotation);
		t = translated;
	}
	if (keyIsDown(UP_ARROW)) {
		let xTranslation = translationStep * cos(t.rotation);
		let yTranslation = -translationStep * sin(t.rotation);
		let translated = new Transform(t.x + xTranslation, t.y + yTranslation, t.rotation);
		t = translated;
	}

	push();
	fill(30);
	rect(0, 0, width, height);
	pop();

	push();
	fill(127);
	translate(t.x, t.y);
    rotate(-90 - t.rotation);
	triangle(-5, -10, 0, 10, 5, -10);
	pop();

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