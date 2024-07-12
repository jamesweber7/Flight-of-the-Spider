class Crawler extends Character {

    constructor(id, x, y) {
        // id, x, y, width, height, type, mass, team, jumpSpeed, maxHorizontalSpeed, damage, health
        super(id, x, y, 96, 45, CRAWLER, 20, SMALL_ENEMY, 12, 8, 0.5, 4);
        this.bodyXOffset = 0;
        this.bodyYOffset = 10;
        this.moveY = 0;
        this.moveX = 0;
        this.acceleration = 1;
        this.enemyX = width*0.5;
        this.enemyY = height*0.5;
        this.moveToX = random(300, 700);
        this.moveToY = random(200, 400);

        this.healthRegen = 0;

        this.lasers = [];
        this.lastAttacked = 0;

        this.bodyImage = crawlerBody;
        this.eyeImage = crawlerEye;
        this.pupilImage = crawlerPupil;
        this.rightLegImage = crawlerLegRight;
        this.leftLegImage = crawlerLegLeft;
        this.rightSpikeImage = crawlerSpikeRight;
        this.leftSpikeImage = crawlerSpikeLeft;

        this.INNER_LEFT_LEG_INDEX = 0;
        this.INNER_RIGHT_LEG_INDEX = 1;
        this.LEFT_LEG_INDEX = 2;
        this.RIGHT_LEG_INDEX = 3;
        this.EYE_INDEX = 4;

        // left leg
        let leftLegOffsetX = -23;
        let leftLegOffsetY = -3;
        let leftSpikeOffsetX = 0;
        let leftSpikeOffsetY = -42;
        let leftSpike = new PivotLimb(this.leftSpikeImage, leftSpikeOffsetX, leftSpikeOffsetY, PI*0.15);
        let leftLeg = new PivotLimb(this.leftLegImage, leftLegOffsetX, leftLegOffsetY, -PI*0.15, [leftSpike]);

        // right leg
        let rightLegOffsetX = 23;
        let rightLegOffsetY = -3;
        let rightSpikeOffsetX = 0;
        let rightSpikeOffsetY = -42;
        let rightSpike = new PivotLimb(this.rightSpikeImage, rightSpikeOffsetX, rightSpikeOffsetY, -PI*0.15);
        let rightLeg = new PivotLimb(this.rightLegImage, rightLegOffsetX, rightLegOffsetY, PI*0.15, [rightSpike]);

        // eye
        let eyeOffsetX = 0;
        let eyeOffsetY = -5;
        let pupilOffsetY = -24;
        let pupil = new PivotLimb(this.pupilImage, 0, pupilOffsetY);
        let eye = new PivotLimb(this.eyeImage, eyeOffsetX, eyeOffsetY, 0, [pupil]);

        let innerLeftSpike = new PivotLimb(this.leftSpikeImage, leftSpikeOffsetX, leftSpikeOffsetY, -PI*0.2);
        let innerLeftLeg = new PivotLimb(this.leftLegImage, leftLegOffsetX, leftLegOffsetY, PI*0.2, [innerLeftSpike]);

        let innerRightSpike = new PivotLimb(this.rightSpikeImage, rightSpikeOffsetX, rightSpikeOffsetY, PI*0.2);
        let innerRightLeg = new PivotLimb(this.rightLegImage, rightLegOffsetX, rightLegOffsetY, -PI*0.2, [innerRightSpike]);



        // let limbArray = [leftLeg, rightLeg, eye];
        let limbArray = [innerLeftLeg, innerRightLeg, leftLeg, rightLeg, eye];

        // image, x, y, rotation, pivots, firstForegroundIndex, pivotXOffset, pivotYOffset
        this.body = new PivotLimb(this.bodyImage, this.x, this.y, 0, limbArray, limbArray.length);

    }

    draw() {
        this.updatePivots();
        this.body.draw();
    }

    updatePivots() {
        this.updateEye();
        this.updateInnerLegs();
        this.updateOuterLegs();
        this.updateBody();
    }

    updateEye() {

        let pupilX = this.body.x + this.body.pivots[this.EYE_INDEX].x + this.body.pivots[this.EYE_INDEX].pivots[0].x;
        let pupilY = this.body.y + this.body.pivots[this.EYE_INDEX].y + this.body.pivots[this.EYE_INDEX].pivots[0].y;
        let rotation = atan((this.enemyY - pupilY)/(this.enemyX - pupilX)) - this.body.rotation - this.body.pivots[this.EYE_INDEX].rotation;
        if (pupilX >= this.enemyX) {
            rotation -= PI;
        }
        this.body.pivots[this.EYE_INDEX].updatePivotRotation(0, rotation);

    }

    updateLeg(index, sign, positionValueOffset, maxSpreadTheta) {
        let speedFactor = 0.08;

        let thetaOffset = sign*PI*0.18;

        let positionValue = (this.y + this.x)*speedFactor*sign + positionValueOffset

        let theta = thetaOffset+maxSpreadTheta*sin(positionValue);

        let maxLegMovementSpeed = PI*0.05;
        let currentLegRotation = this.body.getPivotRotation(index);
        theta = constrain(theta, currentLegRotation - maxLegMovementSpeed, currentLegRotation + maxLegMovementSpeed);

        let spikeTheta = -theta;
        let currentSpikeRotation = this.body.getPivotRotation([index, 0]);
        spikeTheta = constrain(spikeTheta, currentSpikeRotation - maxLegMovementSpeed, currentSpikeRotation + maxLegMovementSpeed);

        this.body.pivots[index].updateRotation(theta);
        this.body.pivots[index].updatePivotRotation(0, spikeTheta);

        if (this.surface != null && abs(theta - maxSpreadTheta) < 0.03 && abs(this.moveX + this.moveY) > 0.1) {
            playSound(crawlerStepSound);
        }
    }

    updateAttackingLeg(index, sign) {
        let attackTowardsX = this.enemyX;
        let attackTowardsY = this.enemyY;
        let thetaOffset = PI*0.5;
        let elbowThetaOffset = PI*0.2;

        let rotationalThetaOffsetValue = sign*PI*0.5+PI*gameTime*0.05+PI*0.2*noise(gameTime);
        let rotationalThetaOffsetSpan = 0.1*PI;
        let rotationalThetaOffset = rotationalThetaOffsetSpan*cos(rotationalThetaOffsetValue);

        let currentLegRotation = this.body.getPivotRotation(index);
        let currentSpikeRotation = this.body.getPivotRotation([index, 0]);
        
        this.body.pointTowards(attackTowardsX, attackTowardsY, thetaOffset + sign*elbowThetaOffset + rotationalThetaOffset, [index]);
        this.body.pointTowards(attackTowardsX, attackTowardsY, -thetaOffset + rotationalThetaOffset, [index, 0]);

        let maxLegMovementSpeed = PI*0.15;
        let newLegRotation = this.body.getPivotRotation(index);
        if (newLegRotation != constrain(newLegRotation, currentLegRotation-maxLegMovementSpeed, currentLegRotation+maxLegMovementSpeed)) {
            this.body.updatePivotRotation(index, constrain(newLegRotation, currentLegRotation-maxLegMovementSpeed, currentLegRotation+maxLegMovementSpeed));
        }
        let newSpikeRotation = this.body.getPivotRotation([index, 0]);
        if (newSpikeRotation != constrain(newLegRotation, currentSpikeRotation-maxLegMovementSpeed, currentSpikeRotation+maxLegMovementSpeed)) {
            this.body.updatePivotRotation([index, 0], constrain(newSpikeRotation, currentSpikeRotation-maxLegMovementSpeed, currentSpikeRotation+maxLegMovementSpeed));
        }
    }

    updateOuterLegs() {
        if (validParameter(this.surface)) {
            this.updateLeftLeg();
            this.updateRightLeg();
        } else {
            this.updateLeftLegJumping();
            this.updateRightLegJumping();
        }
    }

    updateInnerLegs() {
        if (this.isAttacking()) {
            this.updateLeftAttackingSpike();
            this.updateRightAttackingSpike();
            this.checkSpikeCollisions();
        } else {
            this.updateInnerLeftLeg();
            this.updateInnerRightLeg();
        }
    }

    isAttacking() {

        let attackConeSlope = this.x > this.enemyX ? -2 : 2;
        let yIntercept = -attackConeSlope*this.x + this.y;

        if (this.y < this.enemyY && this.enemyY > attackConeSlope*this.enemyX + yIntercept) {
            this.isAboveEnemy = true;
            return true;
        }

        let attackDistance = 220;
        for (let i = 0; i < world.players.length; i++) {
            if (dist(this.x, this.y, world.players[i].x, world.players[i].y) < attackDistance) {
                this.enemyIndex = world.players[i].id;
                return true;
            }
        }
             
        
        return false;
        
    }

    updateLeftLeg() {

        this.updateLeg(this.LEFT_LEG_INDEX, -1, 0, PI*0.1);

    }

    updateRightLeg() {

        this.updateLeg(this.RIGHT_LEG_INDEX, 1, PI, PI*0.1);

    }

    updateLeftLegJumping() {

        this.updateJumpingLeg(this.LEFT_LEG_INDEX, -1);

    }

    updateRightLegJumping() {

        this.updateJumpingLeg(this.RIGHT_LEG_INDEX, 1);

    }

    updateJumpingLeg(index, sign) {

        let pivotMoveSpeed = PI*0.14*timeSpeed;
        let legRotation = -abs(this.body.getPivotRotation(index));
        if (this.y < height*0.5) {
            legRotation -= pivotMoveSpeed;
        } else {
            legRotation += pivotMoveSpeed;
        }
        legRotation = -sign*constrain(legRotation, -PI*0.7, -PI*0.18);

        let spikeRotation = abs(this.body.getPivotRotation([index, 0]));
        if (this.y < height*0.5) {
            spikeRotation += pivotMoveSpeed;
        } else {
            spikeRotation -= pivotMoveSpeed;
        }
        spikeRotation = sign*constrain(spikeRotation, -PI*0.18, PI*1.5);
        
        this.body.updatePivotRotation(index, legRotation);
        this.body.updatePivotRotation([index, 0], spikeRotation);
    }

    updateLeftAttackingSpike() {

        this.updateAttackingLeg(this.INNER_LEFT_LEG_INDEX, -1, PI*0.5, PI*0.07);

    }

    updateRightAttackingSpike() {

        this.updateAttackingLeg(this.INNER_RIGHT_LEG_INDEX, 1, PI*1.5, PI*0.07);

    }

    updateInnerLeftLeg() {

        this.updateLeg(this.INNER_LEFT_LEG_INDEX, -1, PI*0.5, PI*0.07);

    }

    updateInnerRightLeg() {

        this.updateLeg(this.INNER_RIGHT_LEG_INDEX, 1, PI*1.5, PI*0.07);

    }

    updateBody() {

        this.body.updatePosition(this.x + this.bodyXOffset, this.y + this.bodyYOffset);
    }

    move() {

        this.controlEnemy();
        this.findEnemy();
        this.moveToX = this.enemyX;
        this.moveToY = this.enemyY - 50*floor(noise(this.uid)*7);
        this.preventOverlap();
        
        let cushion = 50;

        let highest;

        if (!validParameter(this.surface) || this.isAboveEnemy) {

            let bodyRotationOffset = PI*0.5;
            let enemyYOffset = -abs(this.enemyY - this.y)*0.4;
            this.body.pointTowards(this.enemyX, this.enemyY + enemyYOffset, bodyRotationOffset);
            if (this.isAboveEnemy && validParameter(this.surface)) {
                this.surface = null;
                this.moveX = this.jumpSpeed*cos(this.body.rotation - bodyRotationOffset);
                this.moveY = this.jumpSpeed*sin(this.body.rotation - bodyRotationOffset);
            }
            this.moveY += this.mass*0.01;
            this.isAboveEnemy = false;

        }
        if (!validParameter(this.surface)) {
            this.moveY += this.mass*0.05;
            this.isAboveEnemy = false;
            let bodyOffset = PI*0.5;
            this.body.pointTowards(this.enemyX, this.enemyY, bodyOffset);
        } else if (this.isAboveEnemy) {
            this.surface = null;
            let bodyOffset = PI*0.5;
            this.body.pointTowards(this.enemyX, this.enemyY, bodyOffset);
            this.moveX = this.jumpSpeed*cos(this.body.rotation - bodyOffset);
            this.moveY = this.jumpSpeed*sin(this.body.rotation - bodyOffset);
            this.isAboveEnemy = false;
        }
        if (this.surface == FLOOR || this.surface == CEILING) {
            highest = (this.surfaceValue(LEFT_WALL) > this.surfaceValue(RIGHT_WALL) ? LEFT_WALL : RIGHT_WALL);
            if (this.surfaceValue(highest) > this.surfaceValue(this.surface)) {
                if (highest == LEFT_WALL) {
                    this.moveLeft();
                } else {
                    this.moveRight();
                }
            } else if (this.x > this.moveToX + cushion) {
                this.moveLeft();
            } else if (this.x < this.moveToX - cushion) {
                this.moveRight();
            } else {
                this.stopHorizontal();
            }
            this.moveY = 0;
        } else if (this.surface == LEFT_WALL || this.surface == RIGHT_WALL) {
            highest = (this.surfaceValue(FLOOR) > this.surfaceValue(CEILING) ? FLOOR : CEILING);
            if (this.surfaceValue(highest) > this.surfaceValue(this.surface)) {
                if (highest == FLOOR) {
                    this.moveDown();
                } else {
                    this.moveUp();
                }
            } else if (this.y > this.moveToY + cushion) {
                this.moveUp();
            } else if (this.y < this.moveToY - cushion) {
                this.moveDown();
            } else {
                this.stopVertical();
            }
            this.moveX = 0;
        }

        this.x += this.moveX*timeSpeed;
        this.y += this.moveY*timeSpeed;

        this.checkWallPosition();
    }

    preventOverlap() {
        let spacerDistance = 70;
        if (this.surface == FLOOR || this.surface == CEILING) {
            for (let i = 0; i < world.smallEnemies.length; i++) {
                if (this.id != world.smallEnemies[i].id) {
                    if (this.surface == world.smallEnemies[i].surface && abs(this.x - world.smallEnemies[i].x) < spacerDistance - 0.1*abs(this.x - this.enemyX)) {
                        this.moveToX += this.x < world.smallEnemies[i].x ? -width : width;
                        if (this.moveToX == world.smallEnemies[i].x) {
                            this.moveToX = width*noise(this.uid + gameTime);
                        }
                    }
                }
            }
        } else if (this.surface == LEFT_WALL || this.surface == RIGHT_WALL) {
            for (let i = 0; i < world.smallEnemies.length; i++) {
                if (this.id != world.smallEnemies[i].id) {
                    if (this.surface == world.smallEnemies[i].surface && abs(this.y - world.smallEnemies[i].y) < spacerDistance - 0.1*abs(this.y - this.enemyY)) {
                        this.moveToY += this.y < world.smallEnemies[i].y ? -height : height;
                    }
                    if (this.y == world.smallEnemies[i].y) {
                        this.moveToY = height*noise(this.uid + gameTime);
                    }
                }
            }         
        }
    }

    checkWorldWallCollisions() {

        let surface1, surface2;

        let floorIndex = 0;
        let ceilingIndex = 1;

        if (world.colliders[floorIndex].isInteracting(this)) {
            surface1 = FLOOR;
        } else if (world.colliders[ceilingIndex].isInteracting(this)) {
            surface1 = CEILING;
        }

        let leftWallIndex = 2;
        let rightWallIndex = 3;

        if (world.colliders[leftWallIndex].isInteracting(this)) {
            surface2 = LEFT_WALL;
        } else if (world.colliders[rightWallIndex].isInteracting(this)) {
            surface2 = RIGHT_WALL;
        }

        let newSurface;
        if (validParameter(surface1)) {

            if (validParameter(surface2)) {
                newSurface = (this.surfaceValue(surface1) > this.surfaceValue(surface2)) ? surface1 : surface2;
            } else {
                newSurface = surface1;
            }

        } else {
            newSurface = surface2;
        }
        if (newSurface != this.surface) {
            this.updateSurface(newSurface);
        }    

        if (surface1 == FLOOR) {
            this.setBottom(world.borders[floorIndex].value);
        } else if (surface1 == CEILING) {
            this.setTop(world.borders[ceilingIndex].value);
        }
        
        if (surface2 == LEFT_WALL) {
            this.setLeft(world.borders[leftWallIndex].value);
        } else if (surface2 == RIGHT_WALL) {
            this.setRight(world.borders[rightWallIndex].value);
        }

    }

    checkWallPosition() {
        let surface1, surface2;

        let floorIndex = 0;
        let ceilingIndex = 1;

        let cushion = 5*timeSpeed;
        if (world.borders[floorIndex].isInteracting(this.bottom(), cushion)) {
            surface1 = FLOOR;
        } else if (world.borders[ceilingIndex].isInteracting(this.top(), cushion)) {
            surface1 = CEILING;
        }

        let leftWallIndex = 2;
        let rightWallIndex = 3;

        if (world.borders[leftWallIndex].isInteracting(this.left(), cushion)) {
            surface2 = LEFT_WALL;
        } else if (world.borders[rightWallIndex].isInteracting(this.right(), cushion)) {
            surface2 = RIGHT_WALL;
        }

        let newSurface;
        if (validParameter(surface1)) {

            if (validParameter(surface2)) {
                newSurface = (this.surfaceValue(surface1) > this.surfaceValue(surface2)) ? surface1 : surface2;
            } else {
                newSurface = surface1;
            }

        } else {
            newSurface = surface2;
        }
        if (newSurface != this.surface) {
            this.updateSurface(newSurface);
        }

        if (surface1 == FLOOR) {
            this.setBottom(world.borders[floorIndex].value);
        } else if (surface1 == CEILING) {
            this.setTop(world.borders[ceilingIndex].value);
        }
        
        if (surface2 == LEFT_WALL) {
            this.setLeft(world.borders[leftWallIndex].value);
        } else if (surface2 == RIGHT_WALL) {
            this.setRight(world.borders[rightWallIndex].value);
        }
    }

    surfaceValue(surface) {

        switch (surface) {

            case CEILING :
                return 1/(max(this.moveToY, world.ceiling+1) - world.ceiling);
                
            case FLOOR :
                return 1/(world.floor - min(this.moveToY, world.floor-1));

            case LEFT_WALL :
                return 1/(max(this.moveToX, world.leftWall+1) - world.leftWall);

            case RIGHT_WALL :
                return 1/(world.rightWall - min(this.moveToX, world.rightWall-1));

        }

    }
    

    updateSurface(newSurface) {

        this.surface = newSurface;

        let rotation;
        switch (this.surface) {

            case FLOOR :
                rotation = 0;
                this.setYOffset(10);
                this.setXOffset(0);
                this.setDimension(96, 45);
                break;
            case LEFT_WALL :
                rotation = PI*0.5;
                this.setYOffset(0);
                this.setXOffset(-10);
                this.setDimension(45, 96);
                break;
            case CEILING :
                rotation = PI;
                this.setYOffset(-10);
                this.setXOffset(0);
                this.setDimension(96, 45);
                break;
            case RIGHT_WALL :
                rotation = PI*1.5;
                this.setYOffset(0);
                this.setXOffset(10);
                this.setDimension(45, 96);
                break;

        }

        this.body.updateRotation(rotation);

    }

    findEnemy() {
        super.findEnemy(PLAYER);
    }

    controlEnemy() {
        if (gameTime % 480 == 0) {
            this.findNewPlayerEnemy();
        }
    }

    moveUp() {
        this.moveY = max(this.moveY - this.acceleration*timeSpeed, -this.maxHorizontalSpeed);
    }

    moveDown() {
        this.moveY = min(this.moveY + this.acceleration*timeSpeed, this.maxHorizontalSpeed);
    }

    stopVertical() {

        let hardStopSpeed = 1;
        if (this.moveY == constrain(this.moveY, -hardStopSpeed, hardStopSpeed)) {
            this.moveY = 0;
            return;
        }
        
        let rawFriction = 0.9;
        let friction = timeSpeed == 1 ? rawFriction : pow(rawFriction, timeSpeed);

        this.moveY *= friction;

    }

    setYOffset(yOffset) {
        this.bodyYOffset = yOffset;
    }

    setXOffset(xOffset) {
        this.bodyXOffset = xOffset;
    }

    delete() {
        playSound(crawlerSplat);
        super.delete();
    }

    checkSpikeCollisions() {

        let damage = this.damage*timeSpeed;
        if (validParameter(this.surface)) {
            damage *= 2;
        }

        for (let i = 0; i < world.players.length; i++) {

            let damageToPlayer = 0;
            if (this.inSpikeHitBox(this.INNER_LEFT_LEG_INDEX, -1, world.players[i])) {
                damageToPlayer += damage;
            }
            if (this.inSpikeHitBox(this.INNER_RIGHT_LEG_INDEX, 1, world.players[i])) {
                damageToPlayer += damage;
            }

            let knockBackDistance = 40;
            if (damageToPlayer != 0 && dist(this.x, this.y, world.players[i].x, world.players[i].y < knockBackDistance)) {
                let bodyOffset = PI*0.5;
                if (!validParameter(this.surface)) {
                    if (this.y < this.enemyY) {
                        world.players[i].knockBack(this.velocityTheta(), this.velocity()*0.35, 15);
                    }
                } else {
                    world.players[i].knockBack((this.body.rotation + bodyOffset), 2, 8);
                }
            }
            world.players[i].hitFor(damageToPlayer);

        }

    }

    inSpikeHitBox(legIndex, sign, player) {

        let left = player.left();
        let top = player.top();
        let right = player.right();
        let bottom = player.bottom();

        let elbowPosition = this.body.offsetWorldPosition(-sign*35, 120, [legIndex, 0]);
        let spikeX1 = elbowPosition[0];
        let spikeY1 = elbowPosition[1];

        let spikePosition = this.body.worldPosition([legIndex]);
        let spikeX2 = spikePosition[0];
        let spikeY2 = spikePosition[1];
       
        let m = (spikeY2 - spikeY1) / (spikeX2 - spikeX1);
        let b = spikeY2 - m * spikeX2;

        let y = m*left+b;
                
        if (y == constrain(y, top, bottom) && y == constrain(y, min(spikeY1, spikeY2), max(spikeY1, spikeY2))) {
            world.addBlood(random(spikeX1, spikeX2), random(spikeY1, spikeY2));
            return true;
        }

        y = m*right+b;
        if (y == constrain(y, top, bottom) && y == constrain(y, min(spikeY1, spikeY2), max(spikeY1, spikeY2))) {
            world.addBlood(random(spikeX1, spikeX2), random(spikeY1, spikeY2));
            return true;
        }

        let x = (top-b)/m;
        if (x == constrain(x, left, right) && x == constrain(x, min(spikeX1, spikeX2), max(spikeX1, spikeX2))) {
            world.addBlood(random(spikeX1, spikeX2), random(spikeY1, spikeY2));
            return true;
        }

        x = (bottom-b)/m;
        if (x == constrain(x, left, right) && x == constrain(x, min(spikeX1, spikeX2), max(spikeX1, spikeX2))) {
            world.addBlood(random(spikeX1, spikeX2), random(spikeY1, spikeY2));
            return true;
        }

        if (spikeX1 == constrain(spikeX1, left, right) && spikeY1 == constrain(spikeY1, top, bottom)) {
            world.addBlood(random(spikeX1, spikeX2), random(spikeY1, spikeY2));
            return true;
        }

        if (spikeX2 == constrain(spikeX2, left, right) && spikeY2 == constrain(spikeY2, top, bottom)) {
            world.addBlood(random(spikeX1, spikeX2), random(spikeY1, spikeY2));
            return true;
        }

        return false;
    }

}