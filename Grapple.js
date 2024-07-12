class Grapple {
    
    constructor(id, x, y, rotation, isFacingRight, damage) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.image = isFacingRight ? grapplerHarpoonRight : grapplerHarpoonLeft;
        this.length = 57;
        let speed = 45;
        let adjacent = cos(this.rotation);
        let opposite = sin(this.rotation);
        this.moveX = speed*adjacent;
        this.moveY = speed*opposite;
        this.trueHorizontalSize = this.length * adjacent;
        this.trueVerticalSize = this.length * opposite;
        this.inWall = false;
        this.damage = damage;
        this.spawnTime = gameTime;
        this.lifeTime = 200;
    }

    draw() {
        print(this.x, this.y);
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        image(this.image, 0, 0);
        pop();
        if (this.isFalling) {
            this.fall();
        } else if (gameTime - this.spawnTime > this.lifeTime) {
            let grappler = world.players[world.characterId(GRAPPLER)];
            if ((!grappler.isGrappling || this.id != grappler.connectedGrappleId) && this.id != grappler.hookedGrappleId) {
                this.isFalling = true;
            }
        }
    }

    move() {
        if (!this.inWall) {
            this.x += this.moveX * timeSpeed;
            this.y += this.moveY * timeSpeed;
            this.checkHits();
            this.checkCollisions();
        }
    }

    checkCollisions() {
        // collision distance = grapple length (57) * 0.5 - depth in wall
        let collisionDistance = 17;
        let xCollisionOffset = collisionDistance*cos(this.rotation)
        let xPos = this.x + xCollisionOffset;
        if (xPos < world.leftWall) {
            this.x = world.leftWall - xCollisionOffset;
            return this.setInWall();
        }
        if (xPos > world.rightWall) {
            this.x = world.rightWall - xCollisionOffset;
            return this.setInWall();
        }
        let yCollisionOffset = collisionDistance*sin(this.rotation)
        let yPos = this.y + yCollisionOffset;
        if (yPos < world.ceiling) {
            this.y = world.ceiling - yCollisionOffset;
            return this.setInWall();
        }
        if (yPos > world.floor) {
            this.y = world.floor - yCollisionOffset;
            return this.setInWall();
        }
    }

    setInWall() {
        this.moveY = 0;
        this.inWall = true;
        let grappler = world.players[world.characterId(GRAPPLER)];
        
        if (this.id == grappler.connectedGrappleId && grappler.isGrappling) {
            grappler.setGrappleFlying();
        }
        return this.inWall;
    }

    checkHits() {
        for (let i = 0; i < world.enemies.length; i++) {
            if (this.hitEnemy(world.enemies[i].left(), world.enemies[i].top(), world.enemies[i].right(), world.enemies[i].bottom())) {
                for(let j = 0; j < 5; j++) {
                    world.addBlood(random(min(this.x, world.enemies[i].x), max(this.x, world.enemies[i].x)), random(min(this.y, world.enemies[i].y), max(this.y, world.enemies[i].y)));
                }
                world.enemies[i].hitFor(this.damage);
            }
        }
        for (let i = 0; i < world.smallEnemies.length; i++) {
            if (this.hitEnemy(world.smallEnemies[i].left(), world.smallEnemies[i].top(), world.smallEnemies[i].right(), world.smallEnemies[i].bottom())) {
                for(let j = 0; j < 5; j++) {
                    world.addBlood(random(min(this.x, world.smallEnemies[i].x), max(this.x, world.smallEnemies[i].x)), random(min(this.y, world.smallEnemies[i].y), max(this.y, world.smallEnemies[i].y)));
                }
                world.smallEnemies[i].hitFor(this.damage);
            }
        }
    }

    hitEnemy(left, top, right, bottom) {

        let halfLength = this.length * 0.5;
   
        let x1 = this.x - halfLength * cos(this.rotation);
        let y1 = this.y - halfLength * sin(this.rotation);

        let x2 = this.x + halfLength * cos(this.rotation);
        let y2 = this.y + halfLength * sin(this.rotation);
       
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

    basePosition() {
        return [this.x - this.trueHorizontalSize*0.48, this.y - this.trueVerticalSize*0.48];
    }

    fall() {
        this.rotation += this.moveX > 0 ? -PI*0.04 : PI*0.04;
        this.moveY += 0.8;
        this.y += this.moveY;
    }

    checkDeletion() {
        if (this.y > height + this.length) {
            this.delete();
        }
    }

    delete() {
        let grappler = world.players[world.characterId(GRAPPLER)];
        grappler.removeGrapple(this.id);
    }

}