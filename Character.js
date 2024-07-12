class Character {

    constructor(id, x, y, width, height, type, mass, team, jumpSpeed, maxHorizontalSpeed, damage, health) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.halfWidth = this.width * 0.5;
        this.height = height;
        this.halfHeight = this.height * 0.5;
        this.type = type;
        this.mass = mass;
        this.team = team;
        this.jumpSpeed = jumpSpeed;
        this.moveY = 0;
        this.maxHorizontalSpeed = maxHorizontalSpeed;
        this.moveX = 0;
        this.damage = damage;
        this.health = health;
        this.maxHealth = this.health;
        this.weight = this.damage + this.health;
        this.isPlayer = false;
        this.enemyIndex = 0;
        this.isSearchingForEnemy = true;
        this.xOffset = 0;
        this.yOffset = 0;
        this.healthRegen = 1;

        this.uid = random(10000);

    }

    drawShape() {
        fill(255);
        noStroke();
        rectMode(CORNERS);
        rect(this.left(), this.top(), this.right(), this.bottom());
        rectMode(CENTER);
    }

    setId(id) {
        this.id = id;
    }

    setTeam(team) {
        this.team = team;
    }

    setHealth(health) {
        this.health = health;
    }

    setPlayer() {
        this.isPlayer = true;
        this.damage *= 2;
        this.weight *= 3;
    }

    findNewPlayerEnemy() {
        print(this.type + " FINDING NEW PLAYER ENEMY");
        let totalPlayerWeight = world.totalPlayerWeight();
        this.isSearchingForEnemy = true;
        for (let i = 0; i < (world.players.length - 1) && this.isSearchingForEnemy; i++) {
            if (random() <= world.players[i].weight/totalPlayerWeight) {
                this.isSearchingForEnemy = false;
                this.enemyIndex = i;
            }
        }
        if (this.isSearchingForEnemy) {
            this.isSearchingForEnemy = false;
            this.enemyIndex = world.players.length - 1;
        }
        print("NEW PLAYER ENEMY INDEX : " + this.enemyIndex);
    }

    findNewEnemy() {
       let totalEnemyWeight = world.totalEnemyWeight();
        for (let i = 0; i < world.smallEnemies.length && this.isSearchingForEnemy; i++) {
            if (random() <= world.smallEnemies[i].weight/totalEnemyWeight) {
                this.isSearchingForEnemy = false;
                this.enemyIndex = i;
                this.enemyType = SMALL_ENEMY
            }
        }
        for (let i = 0; i < (world.enemies.length - 1) && this.isSearchingForEnemy; i++) {
            if (random() <= world.enemies[i].weight/totalEnemyWeight) {
                this.isSearchingForEnemy = false;
                this.enemyIndex = i;
                this.enemyType = BOSS_ENEMY;
            }
        }
        if (this.isSearchingForEnemy) {
            this.isSearchingForEnemy = false;
            this.enemyIndex = world.enemies.length - 1;
            this.enemyType = BOSS_ENEMY;
        }
        
    }

    findNewUndefinedEnemy() {
        if (this.type == PLAYER) {
            this.findNewEnemy();
            return;
        }            
        this.findNewPlayerEnemy();
    }

    findEnemy(enemyType) {
        print(enemyType, this.enemyIndex);
        switch (enemyType) {

            case PLAYER :
                this.assignEnemyPosition(world.players);
                break;
            case BOSS_ENEMY :
                this.assignEnemyPosition(world.enemies);
                break;
            case SMALL_ENEMY :
                this.assignEnemyPosition(world.smallEnemies);
                break;

        }
        
    }

    assignEnemyPosition(enemyArray) {
        
        if (this.enemyIndex < enemyArray.length) {
            this.enemyX = enemyArray[this.enemyIndex].x;
            this.enemyY = enemyArray[this.enemyIndex].y;
        } else {
            this.enemyX = width*0.5;
            this.enemyY = height*0.5;
        }
    }

    checkWallCollisions() {
        for (let i = 0; i < world.borders.length; i++) {
            world.borders[i].checkCollision(this);
        }
    }

    checkWallPosition(cushion) {
        let surface;

        let floorIndex = 0;
        let ceilingIndex = 1;
        let leftWallIndex = 2;
        let rightWallIndex = 3;

        cushion = overrideParameter(cushion, 5*timeSpeed);
        if (world.borders[floorIndex].isInteracting(this.bottom(), cushion)) {
            surface = FLOOR;
        } else if (world.borders[ceilingIndex].isInteracting(this.top(), cushion)) {
            surface = CEILING;
        } else if (world.borders[leftWallIndex].isInteracting(this.left(), cushion)) {
            surface = LEFT_WALL;
        } else if (world.borders[rightWallIndex].isInteracting(this.right(), cushion)) {
            surface = RIGHT_WALL;
        }
        if (surface != this.surface) {
            this.updateSurface(surface);
        }
    }

    updateSurface(surface) {

        this.surface = surface;

    }

    // doubleCheckCollisions() {
    //     this.checkCollisions();
    //     this.doubleCheckWorldWallCollisions();
    // }

    // checkCollisions() {
    //     for (let i = 0; i < world.colliders.length; i++) {
    //         if (world.colliders[i].isInteracting(this)) {
    //             let collider = world.colliders[i];
    //             if (collider.isCollidingTop(this.bottom())) {
    //                 this.isJumping = false;
    //                 this.setBottom(collider.top());
    //                 this.moveY = 0;
    //             } else if (collider.isCollidingBottom(this.top())) {
    //                 this.setTop(collider.bottom());
    //                 this.moveY = 0;
    //             } else if (collider.isCollidingLeft(this.right())) {
    //                 this.setRight(collider.left());
    //             } else if (collider.isCollidingRight(this.left())) {
    //                 this.setLeft(collider.right());
    //             }
    //         }
    //     }
    // }

    // doubleCheckWorldWallCollisions() {
        
    //     let floorIndex = 0;
    //     if (world.colliders[floorIndex].isInteracting(this)) {
    //         this.isJumping = false;
    //         this.setBottom(world.colliders[floorIndex].top());
    //     }
    //     let ceilingIndex = 1;
    //     if (world.colliders[ceilingIndex].isInteracting(this)) {
    //         this.setTop(world.colliders[ceilingIndex].bottom());
    //     }
    //     let leftWallIndex = 2;
    //     if (world.colliders[leftWallIndex].isInteracting(this)) {
    //         this.setLeft(world.colliders[leftWallIndex].right());
    //     }
    //     let rightWallIndex = 3;
    //     if (world.colliders[rightWallIndex].isInteracting(this)) {
    //         this.setRight(world.colliders[rightWallIndex].left());
    //     }
        

    // }

    drawHealthBar(healthBarY) {

        this.health = constrain(this.health + this.healthRegen*timeSpeed, 0, this.maxHealth);
        if (!validParameter(healthBarY)) {
            healthBarY = this.bottom() + 20;
        }
        stroke(100,0,0,100);
        strokeWeight(10);
        line(this.left(), healthBarY, this.right(), healthBarY);
        stroke(255,0,0);
        line(this.left(), healthBarY, constrain(this.left() + (this.width*this.health/this.maxHealth), this.left(), this.left() + this.width), healthBarY);
    }

    hitFor(damage) {
        this.findNewUndefinedEnemy();
        if (!this.isPlayer) {
            this.health -= damage;
        } else {
            this.health -= damage*0.5;
        }
        if (this.health <= 0) {
            this.delete();
        }
    }

    delete() {
        for (let i = 0; i < 35; i++) {
            world.addBlood(random(this.left(), this.right()), random(this.top(), this.bottom()), random(10, 25));
        }
        switch (this.team) {
            case PLAYER :
                gameOver();
                break;
            case SMALL_ENEMY :
                world.removeSmallEnemy(this.id);
                break;
        }
            
    }

    moveLeft() {
        this.moveX = max(this.moveX - this.acceleration*timeSpeed, -this.maxHorizontalSpeed);
    }

    moveRight() {
        this.moveX = min(this.moveX + this.acceleration*timeSpeed, this.maxHorizontalSpeed);
    }

    stopHorizontal(rawFriction, hardStopSpeed) {

        rawFriction = overrideParameter(rawFriction, 0.9);
        let friction = timeSpeed == 1 ? rawFriction : pow(rawFriction, timeSpeed);
        hardStopSpeed = overrideParameter(hardStopSpeed, 1);

        if (this.moveX == constrain(this.moveX, -hardStopSpeed, hardStopSpeed)) {
            this.moveX = 0;
            return;
        }

        this.moveX *= friction;
        
    }

    jump() {
        if (!this.isJumping) {
            this.moveY = -this.jumpSpeed;
        }
    }

    setYOffset(yOffset) {
        this.yOffset = yOffset;
    }

    setXOffset(xOffset) {
        this.xOffset = xOffset;
    }

    setLeft(left) {
        this.x = left - this.xOffset + this.halfWidth;
    }

    setRight(right) {
        this.x = right - this.xOffset - this.halfWidth;
    }

    setTop(top) {
        this.y = top - this.yOffset + this.halfHeight;
    }

    setBottom(bottom) {
        this.y = bottom - this.yOffset - this.halfHeight;
    }

    left() {
        return this.x + this.xOffset - this.halfWidth;
    }

    right() {
        return this.x + this.xOffset + this.halfWidth;
    }

    top() {
        return this.y + this.yOffset - this.halfHeight;
    }

    bottom() {
        return this.y + this.yOffset + this.halfHeight;
    }

    setWidth(width) {
        this.width = width;
        this.halfWidth = this.width * 0.5;
    }

    setHeight(height) {
        this.height = height;
        this.halfHeight = this.height * 0.5;
    }

    setDimension(width, height) {
        this.setWidth(width);
        this.setHeight(height);
    }

    knockBack(knockBackRotation, speed, maxSpeed) {
        if (validParameter(maxSpeed)) {
            this.moveX = constrain(this.moveX + speed*cos(knockBackRotation), -abs(maxSpeed*cos(knockBackRotation)), abs(maxSpeed*cos(knockBackRotation)));
            this.moveY = constrain(this.moveY + speed*sin(knockBackRotation), -abs(maxSpeed*sin(knockBackRotation)), abs(maxSpeed*sin(knockBackRotation)));
            return;
        }
        this.moveX += speed*cos(knockBackRotation);
        this.moveY += speed*sin(knockBackRotation);
    }

    velocity() {
        return sqrt(sq(this.moveX) + sq(this.moveY));
    }

    velocityTheta() {
        return atan(this.moveY/this.moveX) + (this.moveX > 0 ? 0 : PI);
    }


}