class Ninja extends Character {

    constructor(id, x, y) {
        // id, x, y, width, height, type, mass, team, jumpSpeed, maxHorizontalSpeed, damage, health
        super(id, x, y, unit*50, unit*50, NINJA, 50, PLAYER, 20, 10, 1, 100);
        this.moveX = 0;
        this.swordSpeed = 10;
        this.acceleration = 0.5;
        this.swordThetaOffset = 0;
        this.swordThetaSpeed = 0.8;
        this.swordTheta = 0;
        this.setYOffset(33);
        this.setWidth(70);
        this.setHeight(165);
        this.surface = FLOOR;
        this.isFacingRight = true;
        this.sign = 1;
        this.verticalClimbSpeed = 9;
        this.enemyType = BOSS_ENEMY;
        this.enemyX = width*0.5;
        this.enemyY = height*0.5;
        this.swordArmPivotX = this.x + 18;
        this.swordArmPivotY = this.y + 8;
        this.healthRegen = 0.05;

        this.bodyImage = ninjaBodyRight;
        this.swordArmImage = ninjaSwordRight;
        this.longLimbImage = ninjaLongLimb;
        this.shortLimbImage = ninjaShortLimb;

        this.assignPivots();

        this.isPlayer = true;
    }

    assignPivots() {

        let jointLimbs = [];
        let jointLimbArrays = [[], [], [], []];

        this.SWORD_ARM_INDEX = 0;
        this.LEFT_LEG_INDEX = 1;
        this.RIGHT_LEG_INDEX = 2;
        this.EMPTY_ARM_INDEX = 3;


        // sword arm

        // past elbow
        jointLimbs[this.SWORD_ARM_INDEX] = new PivotLimb(this.swordArmImage, 0, 30);
        jointLimbArrays[this.SWORD_ARM_INDEX] = [jointLimbs[this.SWORD_ARM_INDEX]];
        // before elbow
        let swordArm = new PivotLimb(this.shortLimbImage, this.sign*18, 8, 0, jointLimbArrays[this.SWORD_ARM_INDEX]);


        // left leg

        // past knee
        jointLimbs[this.LEFT_LEG_INDEX] = new PivotLimb(this.longLimbImage, 0, 36);
        jointLimbArrays[this.LEFT_LEG_INDEX] = [jointLimbs[this.LEFT_LEG_INDEX]];
        // before knee
        let leftLeg = new PivotLimb(this.longLimbImage, -this.sign*9, 52, 0, jointLimbArrays[this.LEFT_LEG_INDEX]);


        // right leg

        // past knee
        jointLimbs[this.RIGHT_LEG_INDEX] = new PivotLimb(this.longLimbImage, 0, 36);
        jointLimbArrays[this.RIGHT_LEG_INDEX] = [jointLimbs[this.RIGHT_LEG_INDEX]];
        // before knee
        let rightLeg = new PivotLimb(this.longLimbImage, this.sign*9, 52, 0, jointLimbArrays[this.RIGHT_LEG_INDEX]);


        // empty arm

        // past elbow
        jointLimbs[this.EMPTY_ARM_INDEX] = new PivotLimb(this.longLimbImage, 0, 30);
        jointLimbArrays[this.EMPTY_ARM_INDEX] = [jointLimbs[this.EMPTY_ARM_INDEX]];
        // before elbow
        let emptyArm = new PivotLimb(this.shortLimbImage, -this.sign*18, 8, 0, jointLimbArrays[this.EMPTY_ARM_INDEX]);


        // all limbs
        let limbs = [ swordArm, leftLeg, rightLeg, emptyArm ];

        // body
        this.body = new PivotLimb(this.bodyImage, this.x, this.y, null, limbs, this.EMPTY_ARM_INDEX);

    }

    draw() {

        this.assignImages();

        this.sign = this.isFacingRight ? 1 : -1;
        
        this.updateLimbs();
        this.drawBody();

        this.drawHealthBar();        
        
    }

    updateLimbs() {
        if (this.isSpidering) {
            this.updateLimbsSpidering();
        } else {
            this.updateLimbsFloor();
        }
    }

    updateLimbsFloor() {
        // body
        this.updateBodyFloor();
        // left leg
        this.updateLegFloor(this.LEFT_LEG_INDEX, 1);
        // right leg
        this.updateLegFloor(this.RIGHT_LEG_INDEX, -1);
        // empty arm
        this.updateEmptyArmFloor(0, -1);
        // sword arm
        this.updateSwordArm();
    }

    updateLimbsSpidering() {
        // body
        this.updateBodySpidering();
        // left leg
        this.updateLegSpidering(this.LEFT_LEG_INDEX, 1);
        // right leg
        this.updateLegSpidering(this.RIGHT_LEG_INDEX, -1);
        // empty arm
        this.updateEmptyArmSpidering(0, 1);
        // sword arm
        this.updateSwordArm();
    }

    drawHealthBar() {
        if (this.isSpidering && this.surface == CEILING) {
            super.drawHealthBar(this.top() - 20);
        } else {
            super.drawHealthBar();
        }
    }

    assignImages() {

        if (!this.isFacingRight && this.moveX > 0) {

            this.isFacingRight = true;
            this.sign = 1;

            this.updateDirectionalImages();
            this.updateDirectionalPivots();

        } else if (this.isFacingRight && this.moveX < 0) {

            this.isFacingRight = false;
            this.sign = -1;

            this.updateDirectionalImages();
            this.updateDirectionalPivots();

        }

    }

    updateDirectionalImages() {

        if (this.isFacingRight) {
            this.bodyImage = ninjaBodyRight;
            this.swordArmImage = ninjaSwordRight;
        } else {
            this.bodyImage = ninjaBodyLeft;
            this.swordArmImage = ninjaSwordLeft;
        }
        this.body.updateImage(this.bodyImage);
        this.body.pivots[this.SWORD_ARM_INDEX].pivots[0].updateImage(this.swordArmImage);

    }

    updateDirectionalPivots() {

        // empty arm
        this.body.pivots[this.EMPTY_ARM_INDEX].updateX(-this.sign*18);

        // sword arm
        this.body.pivots[this.SWORD_ARM_INDEX].updateX(this.sign*18);

    }

    updateLegFloor(index, sign) {

        let pivotY = 52;
        let theta = PI*0.3*sin(sign*this.limbTheta);
        this.body.pivots[index].updateRotation( theta*0.5);

        let kneeTheta = constrain(theta*0.7, min(this.sign*1, this.sign*0.1), max(this.sign*1, this.sign*0.1));
        let kneePivotY = 36;
        let kneePivotX = 0;
        // this.body.pivots[index].pivots[0].update(null, kneePivotX, kneePivotY, kneeTheta);
        this.body.pivots[index].updatePivotRotation(0, kneeTheta);

    }

    updateLegSpidering(index, sign) {
        switch (this.surface) {

            case LEFT_WALL :
                this.updateLegSpideringLeft(index, sign);
                break;
            case RIGHT_WALL :
                this.updateLegSpideringRight(index, sign);
                break;
            case CEILING :
                this.updateLegSpideringCeiling(index, sign);
                break;

        }
    }

    updateLegSpideringLeft(index, sign) {

        // above knee
        let pivotY = 52;
        let theta = PI*0.5+PI*0.1*sin(sign*this.limbTheta);

        // this.body.pivots[index].update(null, pivotX, pivotY, theta);
        this.body.pivots[index].updateRotation(theta);        

        // below knee / ankle
        let kneePivotX = 0;
        let kneePivotY = 36;
        
        this.body.pivots[index].updatePivotRotation(0, -theta);

    }

    updateLegSpideringRight(index, sign) {

        // above knee
        let pivotY = 52;
        let theta = -PI*0.5+PI*0.1*sin(sign*this.limbTheta);

        // this.body.pivots[index].update(null, pivotX, pivotY, theta);
        this.body.pivots[index].updateRotation(theta);
        

        // below knee / ankle
        let kneePivotX = 0;
        let kneePivotY = 36;
        this.body.pivots[index].updatePivotRotation(0, -theta);

    }

    updateLegSpideringCeiling(index, sign) {

        // above knee
        let pivotY = 52;
        let theta = this.sign*PI*0.6+PI*0.067*sin(sign*3*this.limbTheta);
        this.body.pivots[index].updateRotation(theta);

        // below knee / ankle
        let kneePivotX = 0;
        let kneePivotY = 36;
        let kneeTheta = -theta*0.2;

        this.body.pivots[index].updatePivotRotation(0, kneeTheta);

    }

    updateBodyFloor() {
        this.body.updatePosition(this.x, this.y, 0);
    }
    
    updateBodySpidering() {
        if (this.surface == CEILING) {
            // this.body.update(this.bodyImage, this.x, this.y, this.sign*PI*0.4);
            this.body.updatePosition(this.x, this.y, this.sign*PI*0.4);
        } else {
            this.updateBodyFloor();
        }
    }

    drawBody() {
        this.body.draw();
    }

    drawBodySpidering() {
        push();

        translate(this.x, this.y, 0);
        rotate(this.sign*PI*0.4);
        image(this.bodyImage, 0, 0);

        pop();

    }

    updateEmptyArmFloor(thetaOffset, speedFactor) {
        let armPivotX = -this.sign*18;
        let armPivotY = 8;
        let theta = thetaOffset+PI*0.3*sin(this.limbTheta*speedFactor);

        this.body.pivots[this.EMPTY_ARM_INDEX].updateRotation( -theta*0.5);

        let elbowTheta = constrain(theta*0.3, min(thetaOffset+this.sign*1, thetaOffset+this.sign*0.1), max(thetaOffset+this.sign*1, thetaOffset+this.sign*0.1));
        let elbowPivotX = 0;
        let elbowPivotY = 30;

        // this.body.pivots[this.EMPTY_ARM_INDEX].pivots[0].update(null, elbowPivotX, elbowPivotY, elbowTheta);
        this.body.pivots[this.EMPTY_ARM_INDEX].updatePivotRotation(0, -elbowTheta);


    }

    updateEmptyArmSpidering(thetaOffset, speedFactor) {
        if (this.surface == CEILING) {
            this.updateEmptyArmSpideringCeiling();
        } else {
            this.updateEmptyArmFloor(thetaOffset, speedFactor);
        }
    }

    updateEmptyArmSpideringCeiling() {

        let thetaOffset = PI;
        let theta = this.sign*thetaOffset+PI*0.1*sin(this.limbTheta*2);
        this.body.pivots[this.EMPTY_ARM_INDEX].updateRotation(theta*0.8);

        let elbowPivotX = 0;
        let elbowPivotY = 30;
        this.body.pivots[this.EMPTY_ARM_INDEX].updatePivot(0, null, elbowPivotX, elbowPivotY, theta*0.3);
        this.body.pivots[this.EMPTY_ARM_INDEX].updatePivotRotation(0, theta*0.3);

    }

    updateSwordArm() {

        this.swordArmPivotX = this.x + this.sign*18;
        this.swordArmPivotY = this.y + 8;

        if (this.isPlayer) {
            this.isSwinging = (mouseIsPressed && mouseButton == LEFT);
            this.swordControlX = mappedMouseX();
            this.swordControlY = mappedMouseY();
        } else {
            this.swordControlX = this.enemyX;
            this.swordControlY = this.enemyY - 50;
        }

        let swordThetaOffset = abs(this.swordThetaOffset);
        if (this.isSwinging) {
            swordThetaOffset = constrain(swordThetaOffset + this.swordThetaSpeed, PI*2.2-min(PI*1.2, abs(PI*(this.bottom()-this.swordControlY)/500)), PI*2.2);
        } else {
            swordThetaOffset = constrain(swordThetaOffset - this.swordThetaSpeed, PI*2.2-min(PI*1.2, abs(PI*(this.bottom()-this.swordControlY)/500)), PI*2.2);
        }
        this.swordThetaOffset = swordThetaOffset;
        this.swordThetaOffset *= this.sign;
        
        let swordTheta = atan((this.swordControlY-this.swordArmPivotY)/(this.swordControlX - this.swordArmPivotX)) - PI*.08;

        if (!this.isFacingRight) {
            swordTheta -= PI*0.8;
        }

        if (this.swordArmPivotX > this.swordControlX) {
            swordTheta += PI;
        }
        
        if (abs(abs(swordTheta) - abs(this.swordTheta)) > PI*0.05 || (frameCount-mouseReleaseTime) < 5*timeUnit) {
            this.isHitting = true;
        } else {
            this.isHitting = false;
        }
        this.swordTheta = swordTheta;

        // this.body.pivots[this.SWORD_ARM_INDEX].update(null, this.swordArmPivotX - this.x, this.swordArmPivotY - this.y, this.swordThetaOffset);
        // this.body.pivots[this.SWORD_ARM_INDEX].pivots[0].update(this.swordArmImage, null, 30, this.swordTheta - this.swordThetaOffset);

        this.body.pivots[this.SWORD_ARM_INDEX].updateRotation(this.swordThetaOffset - this.body.rotation);
        this.body.pivots[this.SWORD_ARM_INDEX].updatePivotRotation(0, this.swordTheta - this.swordThetaOffset);

        this.checkSwordHits();
    }

    moveParts() {
        let limbThetaSlowDownSpeed = 0.97;
        this.limbTheta = this.limbTheta % PI;
        if (!this.isSpidering || this.surface == CEILING) {
            if (this.moveX != 0) {
                this.limbTheta = this.x*0.01;
            } else {
                this.limbTheta *= limbThetaSlowDownSpeed;
            }
        } else {
            if (this.moveY != 0) {
                this.limbTheta = this.y*0.01;
            } else {
                this.limbTheta *= limbThetaSlowDownSpeed;
            }
        }
    }

    checkSwordHits() {
        if (this.isHitting) {
            for (let i = 0; i < world.enemies.length; i++) {
                if (this.inSwordHitBox(world.enemies[i].left(), world.enemies[i].top(), world.enemies[i].right(), world.enemies[i].bottom())) {
                    world.enemies[i].hitFor(this.damage);
                }
            }
            for (let i = 0; i < world.smallEnemies.length; i++) {
                if (this.inSwordHitBox(world.smallEnemies[i].left(), world.smallEnemies[i].top(), world.smallEnemies[i].right(), world.smallEnemies[i].bottom())) {
                    world.smallEnemies[i].delete();
                }
            }
        }
    }

    move() {

        if (this.moveY != 0) {
            this.isJumping = true;
        }

        if (this.isPlayer) {
            this.playerMove();
        } else {
            this.artificialMove();
        }
        this.x += this.moveX * timeUnit * unit;
        this.y += this.moveY * timeUnit * unit;

        this.moveParts();

        this.checkWallPosition(5*timeSpeed);
        this.checkWallCollisions();

    }

    checkWallPosition() {
        super.checkWallPosition();
        if (validParameter(this.surface)) {
            this.isSpidering = this.surface == FLOOR ? false : true;
            this.isJumping = false;
            this.moveY = 0;
        } else {
            this.isSpidering = false;
        }
    }

    updateSurface(surface) {
        super.updateSurface(surface);
        switch (this.surface) {

            case FLOOR :
                this.setBottom(world.floor);
                break;

            case LEFT_WALL :
                this.setLeft(world.leftWall);
                break;

            case CEILING :
                this.setTop(world.ceiling);
                break;
                
            case RIGHT_WALL :
                this.setRight(world.rightWall);
                break;

        }
    }

    playerMove() {

        if (world.rightPressed && !world.leftPressed) {
            if (!this.isSpidering || this.surface != RIGHT_WALL) {
                this.moveX = constrain(this.moveX + this.acceleration*timeUnit, -this.maxHorizontalSpeed, this.maxHorizontalSpeed);
            } else if (!world.downPressed) {
                this.moveX = max(0, this.moveX - this.acceleration);
                this.moveY = -this.verticalClimbSpeed;
            }
        } else if (world.leftPressed && !world.rightPressed) {
            if (!this.isSpidering || this.surface != LEFT_WALL) {
                this.moveX = constrain(this.moveX - this.acceleration*timeUnit, -this.maxHorizontalSpeed, this.maxHorizontalSpeed);
            } else if (!world.downPressed) {
                this.moveX = min(0, this.moveX + this.acceleration);
                this.moveY = -this.verticalClimbSpeed;
            }
        } else if (this.moveX > 0) {
            this.moveX = constrain(this.moveX - this.acceleration*timeUnit, 0, this.maxHorizontalSpeed);
        } else {
            this.moveX = constrain(this.moveX + this.acceleration*timeUnit, -this.maxHorizontalSpeed, 0);
        }
        if (this.isSpidering && world.downPressed && !world.leftPressed && !world.rightPressed) {
            if (this.surface == LEFT_WALL || this.surface == RIGHT_WALL) {
                this.moveY = this.verticalClimbSpeed;
            }
        }
        if (world.spacePressed || world.upPressed) {
            print(this.surface);
            if (!this.isJumping) {
                switch (this.surface) {
                    case FLOOR :
                        this.moveY = -this.jumpSpeed;
                        break;

                    case LEFT_WALL :
                        this.moveY = -this.jumpSpeed*0.5;
                        this.moveX = this.maxHorizontalSpeed*0.7;
                        break;

                    case RIGHT_WALL :
                        this.moveY = -this.jumpSpeed*0.5;
                        this.moveX = -this.maxHorizontalSpeed*0.7;
                        break;

                    case CEILING :
                        this.moveY = this.jumpSpeed*0.3;
                        break;

                }
            }
        }
        if (!this.isSpidering) {
            this.moveY += this.mass*0.01;
        }
    }

    artificialMove() {

        if (this.isSearchingForEnemy && world.hasEnemies()) {
        this.findNewEnemy();
        }
        
        this.findEnemy(this.enemyType);
        
        if (this.x > min(this.enemyX + 400, world.rightWall - 100))  {
            this.runningRight = false;
        } else if (this.x < max(this.enemyX - 400, world.leftWall + 100)) {
            this.runningRight = true;
        }
        if (this.runningRight) {
            this.moveX = min(this.moveX + this.acceleration, this.maxHorizontalSpeed);
        } else {
            this.moveX = max(this.moveX - this.acceleration, -this.maxHorizontalSpeed);
        }
        if (abs(this.x - this.enemyX) < 40 && !this.isJumping) {
            this.moveY = -this.jumpSpeed;
            this.isJumping = true;
            this.isSwinging = false;
        } else {
            this.isSwinging = true;
        }

        this.moveY += this.mass*0.01;
        if (this.top() <= world.ceiling) {
            this.setTop(world.ceiling + 10);
            this.moveY += this.jumpSpeed;
        }
    }

    checkCollisions() {
        this.isSpidering = false;
        for (let i = 0; i < world.colliders.length; i++) {
            if (world.colliders[i].isInteracting(this)) {
                let collider = world.colliders[i];
                if (collider.isCollidingTop(this.bottom())) {
                    this.surface = FLOOR;
                    this.setBottom(collider.top());

                } else if (collider.isCollidingBottom(this.top())) {
                    this.surface = CEILING;
                    this.setTop(collider.bottom());
                    this.isSpidering = true;

                } else if (collider.isCollidingLeft(this.right())) {
                    this.surface = RIGHT_WALL;
                    this.setRight(collider.left());
                    this.isSpidering = true;

                } else if (collider.isCollidingRight(this.left())) {
                    this.setLeft(collider.right());
                    this.surface = LEFT_WALL;
                    this.isSpidering = true;

                }
                this.isJumping = false;
                this.moveY = 0;
            }
        }
    }

    inSwordHitBox(left, top, right, bottom) {

        // let bodyOffsetX = this.x + this.body.pivots[this.SWORD_ARM_INDEX].x*cos(this.body.rotation);
        // let bodyOffsetY = this.y + this.body.pivots[this.SWORD_ARM_INDEX].y*sin(this.body.rotation + PI*0.5);
        // let elbowTheta = this.swordThetaOffset + PI*0.5;
        // let elbowOffset = 30;
        // let elbowX = this.swordArmPivotX + elbowOffset*cos(elbowTheta);
        // let elbowY = this.swordArmPivotY + elbowOffset*sin(elbowTheta);
        // // let elbowX = bodyOffsetX + this.body.pivots[this.SWORD_ARM_INDEX].pivots[0].y*cos(elbowTheta);
        // // let elbowY = bodyOffsetY + this.body.pivots[this.SWORD_ARM_INDEX].pivots[0].y*sin(elbowTheta);

        // let swordBaseTheta = PI*0.5+this.swordTheta;
        // let swordBaseOffset = 25;
        // let swordX1 = elbowX + swordBaseOffset*cos(swordBaseTheta);
        // let swordY1 = elbowY + swordBaseOffset*sin(swordBaseTheta);

        // let swordTheta = this.swordTheta;
        // let swordLength = this.sign*100;
        // let swordX2 = swordX1 + swordLength*cos(swordTheta);
        // let swordY2 = swordY1 + swordLength*sin(swordTheta);


        // let shoulderX = this.x + this.body.pivots[this.SWORD_ARM_INDEX].x*cos(this.body.rotation);
        // let shoulderY = this.y + this.body.pivots[this.SWORD_ARM_INDEX].y*sin(this.body.rotation + PI*0.5);
        let pivotOffsetX = this.body.pivots[this.SWORD_ARM_INDEX].x;
        let pivotOffsetY = this.body.pivots[this.SWORD_ARM_INDEX].y;
        let pivotOffsetHypotenuse = sqrt(sq(pivotOffsetX) + sq(pivotOffsetY));

        let shoulderRotation = atan(pivotOffsetY/pivotOffsetX);
        if (pivotOffsetX > 0) {
            shoulderRotation -= PI;
        }
        shoulderRotation += this.body.rotation;
        let shoulderX = this.x - pivotOffsetHypotenuse*cos(shoulderRotation);
        let shoulderY = this.y - pivotOffsetHypotenuse*sin(shoulderRotation);


        let elbowRotation = this.body.rotation + this.body.pivots[this.SWORD_ARM_INDEX].rotation + PI*0.5;
        let elbowX = shoulderX + this.body.pivots[this.SWORD_ARM_INDEX].pivots[0].y*cos(elbowRotation);
        let elbowY = shoulderY + this.body.pivots[this.SWORD_ARM_INDEX].pivots[0].y*sin(elbowRotation);

        let handOffset = 25;
        let swordOffsetTheta = PI*0.5+this.swordTheta;
        let swordX1 = elbowX + handOffset*cos(swordOffsetTheta);
        let swordY1 = elbowY + handOffset*sin(swordOffsetTheta);

        let swordTheta = this.swordTheta;
        let swordLength = this.sign*100;
        let swordX2 = swordX1 + swordLength*cos(swordTheta);
        let swordY2 = swordY1 + swordLength*sin(swordTheta);
       
        let m = (swordY2 - swordY1) / (swordX2 - swordX1);
        let b = swordY2 - m * swordX2;

        let y = m*left+b;
                
        if (y == constrain(y, top, bottom) && y == constrain(y, min(swordY1, swordY2), max(swordY1, swordY2))) {
            world.addBlood(random(swordX1, swordX2), random(swordY1, swordY2));
            return true;
        }

        y = m*right+b;
        if (y == constrain(y, top, bottom) && y == constrain(y, min(swordY1, swordY2), max(swordY1, swordY2))) {
            world.addBlood(random(swordX1, swordX2), random(swordY1, swordY2));
            return true;
        }

        let x = (top-b)/m;
        if (x == constrain(x, left, right) && x == constrain(x, min(swordX1, swordX2), max(swordX1, swordX2))) {
            world.addBlood(random(swordX1, swordX2), random(swordY1, swordY2));
            return true;
        }

        x = (bottom-b)/m;
        if (x == constrain(x, left, right) && x == constrain(x, min(swordX1, swordX2), max(swordX1, swordX2))) {
            world.addBlood(random(swordX1, swordX2), random(swordY1, swordY2));
            return true;
        }

        if (swordX1 == constrain(swordX1, left, right) && swordY1 == constrain(swordY1, top, bottom)) {
            world.addBlood(random(swordX1, swordX2), random(swordY1, swordY2));
            return true;
        }

        if (swordX2 == constrain(swordX2, left, right) && swordY2 == constrain(swordY2, top, bottom)) {
            world.addBlood(random(swordX1, swordX2), random(swordY1, swordY2));
            return true;
        }

        return false;
    }

}