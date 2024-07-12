class BloodDrop {

    constructor(index, x, y, size, speed) {
        this.index = index;
        if (validParameter(size)) {
            this.size = size;
        } else {
            this.size = random(5);
        }
        this.x = x;
        this.y = y; 
        if (validParameter(speed)) {
            this.speed = speed;
        } else {
            this.speed = random(5);
        }
        this.theta = random(2*PI);
        this.color = color(random(100,225), 0, 0, random(155));
        this.moveX = this.speed*cos(this.theta);
        this.moveY = this.speed*sin(this.theta);
        this.startTime = frameCount;
    }

    draw() {
        noStroke();
        fill(this.color);
        circle(this.x, this.y, this.size);
    }

    move() {
        this.moveY += 0.1;
        this.x += this.moveX*timeUnit;
        this.y += this.moveY*timeUnit;
        if (this.y > world.floor) {
            this.remove();
        } else if (this.x != constrain(this.x, world.leftWall - this.size, world.rightWall + this.size)) {
            this.remove();
        } else if (frameCount - this.startTime > 300) {
            this.remove();
        }
    }

    remove() {
        world.removeBlood(this.index);
    }

    setIndex(index) {
        this.index = index;
    }

    decrementIndex() {
        this.index --;
    }

}