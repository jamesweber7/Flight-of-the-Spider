class Grappler extends Character {

    constructor(id, x, y) {
        // id, x, y, width, height, type, mass, team, jumpSpeed, maxHorizontalSpeed, damage, health
        super(id, x, y, unit*50, unit*50, GRAPPLER, 75, PLAYER, 10, 6, 10, 50);
        this.moveX = 0;
        this.acceleration = 0.5;
        this.setWidth(58);
        this.setHeight(250);
        this.setYOffset(56);
        this.enemyType = BOSS_ENEMY;
        this.enemyX = width*0.5;
        this.enemyY = height*0.5;
        this.healthRegen = 0.15;

        this.grapples = [];
        this.grappleConnected = false;
        this.grappleReleased = true;
        this.connectedGrappleId = -1;

        this.isFacingRight = true;
        this.sign = 1;

        this.assignRightImages();

        let objX = 0, objY = 0, xOffset = 0, yOffset = 0, rotation = 0;

        objX = 1;
        objY = 40;
        yOffset = -25;
        xOffset = -9;
        let knee1 = new PivotLimb(this.kneeImage, objX, objY, rotation, null, null, xOffset, yOffset);
        let knee2 = new PivotLimb(this.kneeImage, objX, objY, rotation, null, null, xOffset, yOffset);
        let kneeArray = [knee1];
        
        objX = -8;
        objY = 88;
        yOffset = -18;
        xOffset = 0;
        let backLeg = new PivotLimb(this.legImage, objX, objY, rotation, kneeArray, null, xOffset, yOffset);
        kneeArray = [knee2];
        objX = 8;
        let frontLeg = new PivotLimb(this.legImage, objX, objY, rotation, kneeArray, null, xOffset, yOffset);

        objX = 35;
        objY = 2;
        xOffset = -18;
        yOffset = 0;
        rotation = 0;
        let emptyForearm = new PivotLimb(this.emptyForearmImage, objX, objY, rotation, null, null, xOffset, yOffset);
        objX = -15;
        objY = 4;
        xOffset = -18;
        yOffset = 1;
        rotation = PI*0.5;
        let emptyArm = new PivotLimb(this.bicepImage, objX, objY, rotation, [emptyForearm], null, xOffset, yOffset);
        objX = 35;
        objY = 1;
        xOffset = -41;
        yOffset = 7;
        rotation = 0;
        let gunForearm = new PivotLimb(this.gunForearmImage, objX, objY, rotation, null, null, xOffset, yOffset);
        objX = 15;
        objY = 4;
        xOffset = -16;
        yOffset = 1;
        rotation = 0;
        let gunArm = new PivotLimb(this.bicepImage, objX, objY, rotation, [gunForearm], null, xOffset, yOffset);

        this.GUN_ARM_INDEX = 0;
        this.BACK_LEG_INDEX = 1;
        this.FRONT_LEG_INDEX = 2;
        this.EMPTY_ARM_INDEX = 3;
        let limbs = [gunArm, backLeg, frontLeg, emptyArm];

        this.body = new PivotLimb(this.bodyImage, this.x, this.y, null, limbs, this.FRONT_LEG_INDEX);

        this.isPlayer = true;

    }

    draw() {
        this.updatePivots();
        this.drawGrapples();
        this.body.draw();
        this.drawHealthBar();
    }

    drawGrapples() {
        for (let i = 0; i < this.grapples.length; i++) {
            this.grapples[i].move();
            this.grapples[i].draw();
        }
        for (let i = 0; i < this.grapples.length; i++) {
            if (this.grapples[i].id != this.connectedGrappleId) {
                this.grapples[i].checkDeletion();
            }
        }
    }

    updatePivots() {
        this.assignImages();
        this.updateBody();
        this.updateGunArm();
        this.limbTheta = (this.x*0.01);
        this.updateEmptyArm();
        this.updateBackLeg();
        this.updateFrontLeg();
    }

    updateEmptyArm() {
        if (this.isHookedToWall) {
            let grapplePos = this.grapples[this.hookedGrappleId].basePosition();
            this.body.pointTowards(grapplePos[0], grapplePos[1], 0, [this.EMPTY_ARM_INDEX], 0.1);
            this.body.updatePivotRotation([this.EMPTY_ARM_INDEX, 0], 0, 0.1);
        } else {
            this.updateEmptyArmNotGrappling();
        }
        
    }

    updateEmptyArmNotGrappling() {
        let theta = this.sign*PI*0.7 - PI*0.3*sin(this.sign*this.limbTheta);
        let thetaOffset = this.isFacingRight ? PI*0.2 : PI*0.8;
        
        this.body.pivots[this.EMPTY_ARM_INDEX].updateRotation(theta*0.5 + thetaOffset);

        let elbowTheta = -constrain(theta*0.7, min(this.sign*1, this.sign*0.1), max(this.sign*1, this.sign*0.1));
        this.body.pivots[this.EMPTY_ARM_INDEX].updatePivotRotation(0, elbowTheta);
    }
    

    updateBackLeg() {
        this.updateLegFloor(this.BACK_LEG_INDEX, -this.sign);
    }

    updateFrontLeg() {
        this.updateLegFloor(this.FRONT_LEG_INDEX, this.sign);
    }

    updateLegFloor(index, sign) {

        
        let theta = PI*0.3*sin(sign*this.limbTheta);
        this.body.pivots[index].updateRotation(theta*0.5);

        let kneeTheta = constrain(theta*0.7, min(this.sign*1, this.sign*0.1), max(this.sign*1, this.sign*0.1));
        this.body.pivots[index].updatePivotRotation(0, kneeTheta);

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
           this.assignRightImages();
        } else {
            this.assignLeftImages();
        }
        this.body.updateImage(this.bodyImage);
        this.body.updatePivotImage(this.BACK_LEG_INDEX, this.legImage);
        this.body.updatePivotImage(this.FRONT_LEG_INDEX, this.legImage);
        this.body.updatePivotImage([this.BACK_LEG_INDEX, 0], this.kneeImage);
        this.body.updatePivotImage([this.FRONT_LEG_INDEX, 0], this.kneeImage);
        this.body.updatePivotImage(this.GUN_ARM_INDEX, this.bicepImage);
        this.body.updatePivotImage(this.EMPTY_ARM_INDEX, this.bicepImage);
        this.body.updatePivotImage([this.GUN_ARM_INDEX, 0], this.gunForearmImage);
        this.body.updatePivotImage([this.EMPTY_ARM_INDEX, 0], this.emptyForearmImage);
    }

    assignRightImages() {
        this.bodyImage = grapplerBodyRight;
        this.bicepImage = grapplerBicepRight;
        if (this.isGrappling) {
            this.gunForearmImage = grapplerUnloadedGunForearmRight;
        } else {
            this.gunForearmImage = grapplerLoadedGunForearmRight;
        }
        this.emptyForearmImage = grapplerEmptyForearmRight;
        this.legImage = grapplerLegRight;
        this.kneeImage = grapplerAnkleRight;
    }

    assignLeftImages() {
        this.bodyImage = grapplerBodyLeft;
        this.bicepImage = grapplerBicepLeft;
        if (this.isGrappling) {
            this.gunForearmImage = grapplerUnloadedGunForearmLeft;
        } else {
            this.gunForearmImage = grapplerLoadedGunForearmLeft;
        }
        this.emptyForearmImage = grapplerEmptyForearmLeft;
        this.legImage = grapplerLegLeft;
        this.kneeImage = grapplerAnkleLeft;
    }

    updateDirectionalPivots() {
        
        let objX = 0, xOffset = 0, yOffset = 0;

        objX = this.sign*1;
        xOffset = -this.sign*9;
        this.body.updatePivotX([this.BACK_LEG_INDEX, 0], objX);
        this.body.updatePivotOffset([this.BACK_LEG_INDEX, 0], xOffset);
        this.body.updatePivotX([this.FRONT_LEG_INDEX, 0], objX);
        this.body.updatePivotOffset([this.FRONT_LEG_INDEX, 0], xOffset);
        
        objX = -this.sign*8;
        this.body.updatePivotX([this.BACK_LEG_INDEX], objX);
        
        objX = this.sign*8;
        this.body.updatePivotX([this.FRONT_LEG_INDEX], objX);

        yOffset = this.sign*1;
        this.body.updatePivotOffset([this.EMPTY_ARM_INDEX], null, yOffset);

        yOffset = this.sign*7;
        this.body.updatePivotOffset([this.GUN_ARM_INDEX, 0], null, yOffset);

        yOffset = this.sign*1;
        this.body.updatePivotOffset([this.GUN_ARM_INDEX], null, yOffset);

    }

    updateBody() {
        this.body.updatePosition(this.x, this.y);
    }

    updateGunArm() {
        let pointToX, pointToY;
        if (this.isGrappling) {
            let grappleBasePosition = this.grapples[this.connectedGrappleId].basePosition();
            pointToX = grappleBasePosition[0];
            pointToY = grappleBasePosition[1];
            this.drawGrappleLine(pointToX, pointToY);

        } else {
            pointToX = mappedMouseX();
            pointToY = mappedMouseY();
        }
        this.body.pointTowards(pointToX, pointToY, 0, [this.GUN_ARM_INDEX]);
        if (mouseIsPressed) {
            if (this.canGrapple()) {
                this.shootGrapple();
            }
        } else {
            this.grappleReleased = true;
            if (this.isGrappling) {
                this.stopGrappling();
            }
        }
    }

    move() {
        this.controlGrapples();
        if (this.moveY != 0) {
            this.isJumping = true;
        }
        if (this.isGrappleFlying) {
            let rotation = this.body.worldPosition([this.GUN_ARM_INDEX, 0])[2];
            let speed = 25;
            this.moveX = speed*cos(rotation);
            this.moveY = speed*sin(rotation);
        } else if (this.isHookedToWall) {
            if (world.rightPressed && !world.leftPressed) {
                this.moveRight();
                this.unhookFromWall();
            } else if (world.leftPressed && !world.rightPressed) {
                this.moveLeft();
                this.unhookFromWall();
            } else if (!validParameter(this.surface)) {
                this.unhookFromWall();
            } else {
                this.moveX = 0;
                this.moveY = 0;
            }
        } else {
            if (world.rightPressed && !world.leftPressed) {
                this.moveRight();
            } else if (world.leftPressed && !world.rightPressed) {
                this.moveLeft();
            } else {
                let friction = (validParameter(this.surface) || !this.isJumping) ? 0.9 : 0.985;
                this.stopHorizontal(friction);
            }
            this.moveY += this.mass*0.01;
        }
        this.x += this.moveX*timeSpeed;
        this.y += this.moveY*timeSpeed;

        this.checkWallCollisions();
        if (!this.isGrappleFlying) {
            if (world.jumpPressed()) {
                this.jump();
            }
        } else {
            let cushion = 2*timeSpeed;
            this.checkWallPosition(cushion);
        }
        
    }

    canGrapple() {
        if (!this.grappleReleased) {
            return false;
        }
        if (this.isGrappling) {
            return false;
        }
        let reloadTime = 30;
        if (this.grapples.length > 0 && gameTime - this.grapples[this.grapples.length - 1].spawnTime < reloadTime) {
            return false;
        }
        return true;
    }

    updateSurface(surface) {
        super.updateSurface(surface);
        let distance = 150;
        if (dist(this.x, this.y, this.grapples[this.grapples.length - 1].x, this.grapples[this.grapples.length - 1].y) < distance) {
            this.isGrappleFlying = false;
            this.stopGrappling();
            if (this.surface != FLOOR) {
                this.hookToWall();
            }
        }
    }

    hookToWall() {
        this.hookedGrappleId = this.connectedGrappleId;
        this.isHookedToWall = true;
    }

    unhookFromWall() {
        this.hookedGrappleId = -1;
        this.isHookedToWall = false;
    }

    controlGrapples() {
        
    }

    drawGrappleLine(pointToX, pointToY) {
        if (this.isGrappling) {
            let grappleGunPosition = this.body.offsetWorldPosition(30, -this.sign*16, [this.GUN_ARM_INDEX, 0]);
            stroke(0);
            strokeWeight(1);
            line(grappleGunPosition[0], grappleGunPosition[1], pointToX, pointToY);
        }
    }

    shootGrapple() {
        this.isGrappling = true;
        this.grappleReleased = false;
        let newGrappleIndex = this.grapples.length;
        let grapplePosition = this.body.offsetWorldPosition(14, -this.sign*16, [this.GUN_ARM_INDEX, 0]);
        let grappleX = grapplePosition[0];
        let grappleY = grapplePosition[1];
        let grappleRotation = grapplePosition[2];
        this.grapples[newGrappleIndex] = new Grapple(newGrappleIndex, grappleX, grappleY, grappleRotation, this.isFacingRight, this.damage);
        this.connectedGrappleId = newGrappleIndex;
        this.gunForearmImage = this.isFacingRight ? grapplerUnloadedGunForearmRight : grapplerUnloadedGunForearmLeft;
        this.body.updatePivotImage([this.GUN_ARM_INDEX, 0], this.gunForearmImage);
    }

    removeGrapple(grappleId) {
        this.grapples.splice(grappleId, 1);
        for (let i = grappleId; i < this.grapples.length; i++) {
            if (this.grapples[i].id = this.hookedGrappleId) {
                this.hookedGrappleId = i;
            }
            this.grapples[i].id = i;
        }
        this.connectedGrappleId = this.grapples.length - 1;
    }

    stopGrappling() {
        this.isGrappling = false;
        this.isGrappleFlying = false;
        this.gunForearmImage = this.isFacingRight ? grapplerLoadedGunForearmRight : grapplerLoadedGunForearmLeft;
        this.body.updatePivotImage([this.GUN_ARM_INDEX, 0], this.gunForearmImage);
    }

    setGrappleFlying() {
        this.isGrappleFlying = true;
        this.unhookFromWall();
    }
    
}