class PivotLimb {

    constructor(image, x, y, rotation, pivots, firstForegroundIndex, pivotXOffset, pivotYOffset) {
        this.image = overrideParameter(image, pureVoid);
        this.x = overrideParameter(x, 0);
        this.y = overrideParameter(y, 0);
        this.rotation = overrideParameter(rotation, 0);
        this.pivots = overrideParameter(pivots, []);
        this.firstForegroundIndex = overrideParameter(firstForegroundIndex, 0);
        this.pivotXOffset = overrideParameter(pivotXOffset, 0);
        this.pivotYOffset = overrideParameter(pivotYOffset, 0);
    }

    draw() {

        push();
        translate(this.x, this.y, 0);
        rotate(this.rotation);
        for (let i = 0; i < this.firstForegroundIndex; i++) {
            this.pivots[i].draw();
        }
        image(this.image, -this.pivotXOffset, -this.pivotYOffset);
        for (let i = this.firstForegroundIndex; i < this.pivots.length; i++) {
            this.pivots[i].draw();
        }
        pop();
        
    }

    drawJoint() {
        push();
        translate(this.x, this.y, 0);
        rotate(this.rotation);
        for (let i = 0; i < this.firstForegroundIndex; i++) {
            this.pivots[i].drawJoint();
        }
        circle(0, 0, 10);
        for (let i = this.firstForegroundIndex; i < this.pivots.length; i++) {
            this.pivots[i].drawJoint();
        }
        pop();
    }

    getPosition() {
        return [this.x, this.y, this.rotation];
    }

    getPivotPosition(pivotIndexes) {
        if (!Array.isArray(pivotIndexes)) {
            return this.pivots[pivotIndexes].getPosition();
        }
        
        if (pivotIndexes.length > 0) {
            let index = pivotIndexes.splice(0, 1);
            return this.pivots[index].getPivotPosition(pivotIndexes);
        }
        return this.getPosition();
    }

    update(image, x, y, rotation) {
        if (validParameter(image)) {
            this.updateImage(image);
        }
        this.updatePosition(x, y, rotation);
    }

    updatePosition(x, y, rotation) {
        if (validParameter(x)) {
            this.updateX(x);
        }
        if (validParameter(y)) {
            this.updateY(y);
        }
        if (validParameter(rotation)) {
            this.updateRotation(rotation);
        }
    }

    updateX(x, speed) {
        if (validParameter(speed)) {
            return this.x = constrain(x, this.x - speed, this.x + speed);
        }
        this.x = x;
    }

    updateY(y, speed) {
        if (validParameter(speed)) {
            return this.y = constrain(y, this.y - speed, this.y + speed);
        }
        this.y = y;
    }

    updateOffset(pivotXOffset, pivotYOffset) {

        if (validParameter(pivotXOffset)) {
            this.updateOffsetX(pivotXOffset);
        }
        if (validParameter(pivotYOffset)) {
            this.updateOffsetY(pivotYOffset);
        }

    }

    updateOffsetX(pivotXOffset) {
        this.pivotXOffset = pivotXOffset;
    }

    updateOffsetY(pivotYOffset) {
        this.pivotYOffset = pivotYOffset;
    }

    updateRotation(rotation, speed) {
        if (validParameter(speed)) {
            let maxLoops = 4;
            for (let i = 0; i < maxLoops && (abs(this.rotation - rotation) > PI); i++) {
                if (this.rotation > rotation) {
                    this.rotation -= 2*PI;
                } else {
                    this.rotation += 2*PI;
                }
            }
            return this.rotation = constrain(rotation, this.rotation - speed, this.rotation + speed);
        }
        this.rotation = rotation;
    }

    updateImage(image) {
        this.image = image;
    }

    worldPosition(pivotIndexes) {

        if (!validParameter(pivotIndexes)) {
            return this.getPosition();
        }
        let worldX = this.x;
        let worldY = this.y;
        let worldRotation = this.rotation;
        let index = pivotIndexes.splice(0, 1);

        return this.pivots[index].relativePosition(worldX, worldY, worldRotation, pivotIndexes);

    }

    relativePosition(relativeX, relativeY, relativeRotation, pivotIndexes) {

        let hypotenuse = sqrt(sq(this.x) + sq(this.y));
        let theta = atan(this.y/this.x);
        if (this.x <= 0) {
            theta -= PI;
        }
        theta += relativeRotation;

        relativeX += hypotenuse*cos(theta);
        relativeY += hypotenuse*sin(theta);
        relativeRotation += this.rotation;

        if (pivotIndexes.length > 0) {

            let index = pivotIndexes.splice(0, 1);
            return this.pivots[index].relativePosition(relativeX, relativeY, relativeRotation, pivotIndexes);

        } else {

            return [relativeX, relativeY, relativeRotation];

        }
        
    }

    offsetWorldPosition(offsetX, offsetY, pivotIndexes) {
        let worldPosition = this.worldPosition(pivotIndexes);
        let worldX = worldPosition[0];
        let worldY = worldPosition[1];
        let worldRotation = worldPosition[2];

        let hypotenuse = sqrt(sq(offsetX) + sq(offsetY));
        let theta = atan(offsetY/offsetX);
        if (offsetX <= 0) {
            theta -= PI;
        }
        theta += worldRotation;

        worldX += hypotenuse*cos(theta);
        worldY += hypotenuse*sin(theta);

        return [worldX, worldY, worldRotation];
    }

    pointTowards(x, y, offsetRotation, pivotIndexes, speed, worldPosition) {

        if (validParameter(pivotIndexes)) {
            if (!validParameter(worldPosition)) {
                worldPosition = this.worldPosition(pivotIndexes.slice());
            }
            if (pivotIndexes.length > 0) {
                let index = pivotIndexes.splice(0, 1);
                return this.pivots[index].pointTowards(x, y, offsetRotation, pivotIndexes, speed, worldPosition);
            }
        } else {
            worldPosition = this.getPosition();
        }
        
        offsetRotation = overrideParameter(offsetRotation, 0);

        let worldX = worldPosition[0];
        let worldY = worldPosition[1];
        let worldRotation = worldPosition[2];
        
        let theta = -atan(-(worldY - y)/(worldX - x));
        if (worldX >= x) {
            theta -= PI;
        }
        theta -= (worldRotation - this.rotation);
        theta += offsetRotation;
        this.updateRotation(theta, speed);
    }

    updatePivot(pivotIndexes, image, x, y, rotation) {
        if (!Array.isArray(pivotIndexes)) {
            this.pivots[pivotIndexes].update(image, x, y, rotation);
            return;
        }
        if (pivotIndexes.length > 0) {
            let index = pivotIndexes.splice(0, 1);
            this.pivots[index].updatePivot(pivotIndexes, image, x, y, rotation);
            return;
        }
        this.update(image, x, y, rotation);

    }

    updatePivotX(pivotIndexes, x, speed) {
        if (!Array.isArray(pivotIndexes)) {
            this.pivots[pivotIndexes].updateX(x, speed);
            return;
        }
        if (pivotIndexes.length > 0) {
            let index = pivotIndexes.splice(0, 1);
            this.pivots[index].updatePivotX(pivotIndexes, x, speed);
            return;
        }
        this.updateX(x, speed);
    }

    updatePivotY(pivotIndexes, y, speed) {
        if (!Array.isArray(pivotIndexes)) {
            this.pivots[pivotIndexes].updateY(y, speed);
            return;
        }
        if (pivotIndexes.length > 0) {
            let index = pivotIndexes.splice(0, 1);
            this.pivots[index].updatePivotY(pivotIndexes, y, speed);
            return;
        }
        this.updateY(y, speed);
    }

    updatePivotRotation(pivotIndexes, rotation, speed) {
        if (!Array.isArray(pivotIndexes)) {
            this.pivots[pivotIndexes].updateRotation(rotation, speed);
            return;
        }
        if (pivotIndexes.length > 0) {
            let index = pivotIndexes.splice(0, 1);
            this.pivots[index].updatePivotRotation(pivotIndexes, rotation, speed);
            return;
        } 
        this.updateRotation(rotation, speed);
    }

    updatePivotImage(pivotIndexes, image) {
        if (!Array.isArray(pivotIndexes)) {
            this.pivots[pivotIndexes].updateImage(image);
            return;
        }
        if (pivotIndexes.length > 0) {
            let index = pivotIndexes.splice(0, 1);
            this.pivots[index].updatePivotImage(pivotIndexes, image);
            return;
        } 
        this.updateImage(image);
    }

    updatePivotOffset(pivotIndexes, pivotXOffset, pivotYOffset) {
        if (!Array.isArray(pivotIndexes)) {
            this.pivots[pivotIndexes].updateOffset(pivotXOffset, pivotYOffset);
            return;
        }
        if (pivotIndexes.length > 0) {
            let index = pivotIndexes.splice(0, 1);
            this.pivots[index].updatePivotOffset(pivotIndexes, pivotXOffset, pivotYOffset);
            return;
        }
        this.updateOffset(pivotXOffset, pivotYOffset);
    }

    getPivotX(pivotIndexes) {
        if (!Array.isArray(pivotIndexes)) {
            return this.pivots[pivotIndexes].x;
        }
        if (pivotIndexes.length > 0) {
            let index = pivotIndexes.splice(0, 1);
            return this.pivots[index].getPivotX(pivotIndexes);
        }
        return this.x;
    }

    getPivotY(pivotIndexes) {
        if (!Array.isArray(pivotIndexes)) {
            return this.pivots[pivotIndexes].y;
        }
        if (pivotIndexes.length > 0) {
            let index = pivotIndexes.splice(0, 1);
            return this.pivots[index].getPivotY(pivotIndexes);
        }
        return this.y;
    }

    getPivotRotation(pivotIndexes) {
        if (!Array.isArray(pivotIndexes)) {
            return this.pivots[pivotIndexes].rotation;
        }
        if (pivotIndexes.length > 0) {
            let index = pivotIndexes.splice(0, 1);
            return this.pivots[index].getPivotRotation(pivotIndexes);
        }
        return this.rotation;
    }

    getPivotImage(pivotIndexes) {
        if (!Array.isArray(pivotIndexes)) {
            this.pivots[pivotIndexes].getImage(image);
            return;
        }
        if (pivotIndexes.length > 0) {
            let index = pivotIndexes.splice(0, 1);
            this.pivots[index].getPivotImage(pivotIndexes);
            return;
        } 
        this.getImage(image);
    }

    getPivot(pivotIndexes) {
        if (!Array.isArray(pivotIndexes)) {
            pivotIndexes = [];
            for (let i = 0; i < arguments.length; i++) {
                pivotIndexes[i] = arguments[i];
            }
        }
        if (pivotIndexes.length > 0) {
            let index = pivotIndexes.splice(0, 1);
            return this.pivots[index].getPivot(pivotIndexes);
        }
        return this;
    }

    // final updated pivot is the position of an element in pivot indexes
    // pivot indexes should INCLUDE the front pivot
    // this function bad
    createFlow(pivotIndexes, finalUpdatedPivot, speed) {

        finalUpdatedPivot = overrideParameter(finalUpdatedPivot, 0);
        speed = overrideParameter(speed, 0.03);
        while (pivotIndexes.length > finalUpdatedPivot) {
            this.flowPivot(pivotIndexes.slice(), speed*pivotIndexes.length);
            pivotIndexes.splice(pivotIndexes.length - 1);
        }

    }


    flowPivot(pivotIndexes, speed) {

        if (pivotIndexes.length > 1) {
            let index = pivotIndexes.splice(0,1);
            this.pivots[index].flowPivot(pivotIndexes, speed);
        } else if (pivotIndexes.length == 1) {
            let desiredRotation = this.getPivotRotation(pivotIndexes);
            return this.updateRotation(this.rotation + desiredRotation, speed);
        }
        
    }

}