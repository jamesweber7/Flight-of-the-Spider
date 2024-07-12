class Drone extends Character {

    constructor(id, x, y) {
        // id, x, y, width, height, type, mass, team, jumpSpeed, maxHorizontalSpeed, damage, health
        super(id, x, y, 96, 45, DRONE, 0, PLAYER, 0, 14, 1, 10);
        this.maxHoverSpeed = 10;
        this.moveY = 0;
        this.moveX = 0;
        this.acceleration = 1.5;
        this.enemyType = BOSS_ENEMY;
        this.enemyX = width*0.5;
        this.enemyY = height*0.5;
        this.moveToX = random(300, 700);
        this.moveToY = random(200, 400);

        this.healthRegen = 0.01;

        this.lasers = [];
        this.lastAttacked = 0;

        this.bodyImage = drone;
        this.turretImage = droneTurret;

        let turret = new PivotLimb(this.turretImage, 0, 22, 0);
        let turretArray = [turret];

        this.body = new PivotLimb(this.bodyImage, this.x, this.y, 0, turretArray, 1);

        this.TURRET_INDEX = 0;

        this.isPlayer = true;

    }

    draw() {
        this.updatePivots();
        this.drawLasers();
        this.body.draw();
        this.drawHealthBar(this.y + 55);
    }

    updatePivots() {
        this.updateBody();
        this.updateTurret();
    }

    updateTurret() {
        if (this.isPlayer) {
            this.pointTurret(mappedMouseX(), mappedMouseY())
        } else {
            this.pointTurret(this.enemyX, this.enemyY);
        }
    }

    pointTurret(targetX, targetY) {

        let turretX = this.body.x + this.body.pivots[this.TURRET_INDEX].x;
        let turretY = this.body.y + this.body.pivots[this.TURRET_INDEX].y;


        let rotation = atan((turretY - targetY)/(turretX-targetX)) - PI*0.5 - this.body.rotation;
        if (turretX >= targetX) {
            rotation += PI;
        }
        rotation = constrain(rotation, -PI*0.5, PI*0.5);

        this.body.updatePivotRotation(this.TURRET_INDEX, rotation);

        this.controlTurretFire();

    }

    updateBody() {

        let rotation = (this.moveX/this.maxHorizontalSpeed)*PI*0.1;

        this.body.updatePosition(this.x, this.y, rotation);

    }

    drawLasers() {
        for (let i = 0; i < this.lasers.length; i++) {
            this.lasers[i].draw();
        }
    }

    move() {

        if (this.isPlayer) {
            this.playerMove();
        } else {
            this.artificialMove();
        }
        this.moveLasers();

        this.x += this.moveX * timeSpeed;
        this.y += this.moveY * timeSpeed;

        // this.doubleCheckCollisions();
        this.checkWallCollisions();

    }

    moveLasers() {
        this.lastAttacked += timeSpeed;
        for (let i = 0; i < this.lasers.length; i++) {
            this.lasers[i].move();
        }
    }

    checkCollisions() {
        let softness = 2;
        for (let i = 0; i < world.colliders.length; i++) {
            if (world.colliders[i].isInteracting(this)) {
                let collider = world.colliders[i];
                if (collider.isCollidingTop(this.bottom())) {
                    this.setBottom(collider.top() - softness);
                } else if (collider.isCollidingBottom(this.top())) {
                    this.setTop(collider.bottom() + softness);
                } else if (collider.isCollidingLeft(this.right())) {
                    this.setRight(collider.left());
                } else if (collider.isCollidingRight(this.left())) {
                    this.setLeft(collider.right());
                }
            }
        }
    }

    controlTurretFire() {
        if (this.isFiringTurret()) {
            let fireRate = 10;
            if (this.lastAttacked > fireRate) {
                this.lastAttacked = 0;
                this.fireTurret();
            }
        }
    }

    isFiringTurret() {
        if (!this.isPlayer) {
            if (abs(this.moveX + this.moveY) < 1) {
                return true;
            }
        } else if (mouseIsPressed) {
            return true;
        }
        return false;
    }

    fireTurret() {
        this.addLaser(this.body.rotation + this.body.pivots[this.TURRET_INDEX].rotation + PI*0.5, this.body.x + this.body.pivots[this.TURRET_INDEX].x, this.body.y + this.body.pivots[this.TURRET_INDEX].y);
    }

    addLaser(rotation, x, y) {
        let index = this.lasers.length;
        playSound(laserSound);
        this.lasers[index] = new Laser(this.id, index, rotation, x, y);
    }

    removeLaser(index) {
        this.lasers.splice(index, 1);
        for (let i = index; i < this.lasers.length; i++) {
            this.lasers[i].setIndex(i);
        }
    }

    playerMove() {

        if (world.leftPressed && !world.rightPressed) {
            this.moveLeft();
        } else if (world.rightPressed && !world.leftPressed) {
            this.moveRight();
        } else {
            this.stopHorizontal();
        }

        if ((world.spacePressed || world.upPressed) && !world.downPressed) {
            this.moveUp();
        } else if (!(world.spacePressed || world.upPressed) && world.downPressed) {
            this.moveDown();
        } else {
            this.stopVertical();
        }

    }

    artificialMove() {

        this.controlPosition();

        let cushion = 50;
        if (this.x > this.moveToX + cushion) {
            this.moveLeft();
        } else if (this.x < this.moveToX - cushion) {
            this.moveRight();
        } else {
            this.stopHorizontal();
        }

        if (this.y > this.moveToY + cushion) {
            this.moveUp();
        } else if (this.y < this.moveToY - cushion) {
            this.moveDown();
        } else {
            this.stopVertical();
        }

    }

    controlPosition() {

        if (gameTime % 180 == 0) {
            this.findNewEnemy();
        }

        this.findEnemy(this.enemyType);

        let repositionTime = 180;
        let cushion = 50;

        let noisePower = 2;
        let noiseSpeed = 0.1;
        this.x += noise(gameTime * noiseSpeed + this.moveToX) * noisePower;
        this.y += noise(gameTime * noiseSpeed + 1000 + this.moveToY) * noisePower;

        if (floor(gameTime) % repositionTime == 0 && abs(this.x - this.moveToX) < cushion && abs(this.y - this.moveToY)) {
            this.findNewPosition();
        }
    }

    findNewPosition() {

        if (this.moveToX < this.enemyX) {
            this.moveToX = this.enemyX + random(width*0.2, width*0.6);
        } else {
            this.moveToX = this.enemyX - random(width*0.2, width*0.6);
        }
        this.moveToY = this.enemyY - random(100, 300);

        this.moveToY = constrain(this.moveToY,  world.ceiling + this.height, world.floor - this.height);
        this.moveToX = constrain(this.moveToX,  world.leftWall + this.width, world.rightWall - this.width);

    }

    moveUp() {
        this.moveY = max(this.moveY - this.acceleration, -this.maxHoverSpeed);
    }

    moveDown() {
        this.moveY = min(this.moveY + this.acceleration, this.maxHoverSpeed);
    }

    stopVertical() {

        let hardStopSpeed = 1;
        if (this.moveY == constrain(this.moveY, -hardStopSpeed, hardStopSpeed)) {
            this.moveY = 0;
            return;
        }
        
        let friction = 0.9;

        this.moveY *= friction;

    }

}