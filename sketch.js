let t;

function setup() {
	createCanvas(windowWidth, windowHeight);
	frameRate(60);
	t = new Transform();
}

function draw() {
	push();
	fill(30);
	rect(0, 0, width, height);
	pop();

	const step = 10;
	if (keyIsDown(DOWN_ARROW)) {
		let translated = new Transform(t.x, t.y + step);
		if (translated.y < height)
			t = translated;
	}
	if (keyIsDown(UP_ARROW)) {
		let translated = new Transform(t.x, t.y - step);
		if (translated.y >= 0)
			t = translated;
	}
	if (keyIsDown(RIGHT_ARROW)) {
		let translated = new Transform(t.x + step, t.y);
		if (translated.x < width)
			t = translated;
	}
	if (keyIsDown(LEFT_ARROW)) {
		let translated = new Transform(t.x - step, t.y);
		if (translated.x >= 0)
			t = translated;
	}

	push();
	fill(127);
	translate(t.x, t.y);
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
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
}