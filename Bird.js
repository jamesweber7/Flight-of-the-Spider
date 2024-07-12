class Bird {

    constructor(id) {
        this.id = id;
        this.moveX = random([-4, 4]);
        if (this.moveX > 0) {
            this.x = -width*0.2;
            this.image = birdRight;
        } else {
            this.x = width*1.2;
            this.image = birdLeft;
        }
        this.y = 34 + random(40, 80);
        this.halfWidth = 80;
        this.halfHeight = 30;
        this.damage = 0.5;
        this.weight = 0.5;
        this.health = 20;
    }

    draw() {
        image(this.image, this.x, this.y);
    }

    move() {
        this.x += this.moveX * timeSpeed;
        this.checkCollisions();

        if (this.moveX > 0 && this.x > width*1.1) {
            this.delete();
        } else if (this.moveX < 0 && this.x < -width*0.1) {
            this.delete();
        }
    }

    hitFor(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.delete();
        }
    }

    delete() {
        for (let i = 0; i < 10; i++) {
            world.addBlood(this.x, this.y, random(7, 10));
        }
        world.removeBird(this.id);
    }

    checkCollisions() {
        let hit = false;
        for (let i = 0; i < world.players.length && !hit; i++) {
            if (this.isColliding(world.players[i])) {
                for(let j = 0; j < 3; j++) {
                    world.addBlood(random(min(this.x, world.players[i].x), max(this.x, world.players[i].x)), random(min(this.y, world.players[i].y), max(this.y, world.players[i].y)));
                } 
                world.players[i].hitFor(this.damage);
                hit = true;
            }
        }
    }

    isColliding(character) {

        let chLeft = character.left();
        let chTop = character.top();
        let chRight = character.right();
        let chBottom = character.bottom();
        let left = this.left();
        let top = this.top();
        let right = this.right();
        let bottom = this.bottom();


        if (chBottom < top ) {
            return false;
        }
        if (chTop > bottom) {
            return false;
        }
        if (chLeft > right) {
            return false;
        }
        if (chRight < left) {
            return false;
        }

        return true;

    }

    left() {
        return this.x - this.halfWidth;
    }

    right() {
        return this.x + this.halfWidth;
    }

    top() {
        return this.y - this.halfHeight;
    }

    bottom() {
        return this.y + this.halfHeight;
    }

}