class Laser {

    constructor(ownerIndex, index, rotation, x, y) {

        this.ownerIndex = ownerIndex;
        this.index = index;
        this.rotation = rotation;
        this.x = x;
        this.y = y;

        this.damage = 8;
        this.speed = 20;
        this.moveX = this.speed*cos(this.rotation);
        this.moveY = this.speed*sin(this.rotation);

    }

    move() {

        this.x += this.moveX * timeSpeed;
        this.y += this.moveY * timeSpeed;

        if (this.x < -abs(this.moveX) || this.x > width + abs(this.moveX)) {
            this.delete();
        } else if (this.y < -abs(this.moveY) || this.y > height + abs(this.moveY)) {
            this.delete();
        } else {
            this.checkCollisions();
        }

    }

    checkCollisions() {
        let hit = false;
        for (let i = 0; i < world.enemies.length && !hit; i++) {
            if (this.hitEnemy(world.enemies[i].left(), world.enemies[i].top(), world.enemies[i].right(), world.enemies[i].bottom())) {
                for(let j = 0; j < 5; j++) {
                    world.addBlood(random(min(this.x, world.enemies[i].x), max(this.x, world.enemies[i].x)), random(min(this.y, world.enemies[i].y), max(this.y, world.enemies[i].y)));
                }
                hit = true;
                world.enemies[i].hitFor(this.damage);
                this.delete();
            }
        }
        for (let i = 0; i < world.smallEnemies.length && !hit; i++) {
            if (this.hitEnemy(world.smallEnemies[i].left(), world.smallEnemies[i].top(), world.smallEnemies[i].right(), world.smallEnemies[i].bottom())) {
                for(let j = 0; j < 5; j++) {
                    world.addBlood(random(min(this.x, world.smallEnemies[i].x), max(this.x, world.smallEnemies[i].x)), random(min(this.y, world.smallEnemies[i].y), max(this.y, world.smallEnemies[i].y)));
                }
                hit = true;
                world.smallEnemies[i].hitFor(this.damage);
                this.delete();
            }
        }
    }

    draw() {

        strokeWeight(5);
        stroke(255, 0, 0);
        line(this.x, this.y, this.x + 2*this.moveX, this.y + 2*this.moveY);

    }

    hitEnemy(left, top, right, bottom) {

        let x1 = this.x;
        let y1 = this.y;

        let x2 = this.x + 2*this.moveX;
        let y2 = this.y + 2*this.moveY;
       
        let deltaY = (y2 - y1);
        let deltaX = (x2 - x1);
        if (deltaY == 0) {
            deltaY = 0.001;
        }
        if (deltaX == 0) {
            deltaX = 0.001;
        }
        let m = deltaY / deltaX;
        let b = y2 - m * x2;

        let y = m*left+b;
                
        if (y == constrain(y, top, bottom) && y == constrain(y, min(y1, y2), max(y1, y2))) {
            return true;
        }

        y = m*right+b;
        if (y == constrain(y, top, bottom) && y == constrain(y, min(y1, y2), max(y1, y2))) {
            return true;
        }

        let x = (top-b)/m;
        if (x == constrain(x, left, right) && x == constrain(x, min(x1, x2), max(x1, x2))) {
            return true;
        }

        x = (bottom-b)/m;
        if (x == constrain(x, left, right) && x == constrain(x, min(x1, x2), max(x1, x2))) {
            return true;
        }

        if (x1 == constrain(x1, left, right) && y1 == constrain(y1, top, bottom)) {
            return true;
        }

        if (x2 == constrain(x2, left, right) && y2 == constrain(y2, top, bottom)) {
            return true;
        }

        return false;
    }

    delete() {
        world.players[this.ownerIndex].removeLaser(this.index);
    }

    setIndex(index) {
        this.index = index;
    }

}