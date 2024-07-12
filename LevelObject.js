class LevelObject {

    constructor(x, y, width, height, type, animationType, animation, assignmentMode) {

        this.x = x;
        this.y = y;
        
        this.type = type;

        this.animationType = animationType;
        if (this.animationType == ANIMATION) {
            this.animation = animation;
        } else if (validParameter(animationType)) {
            this.animation = animation;
        } else {
            this.animation = pureVoid;
        }

        if (assignmentMode == CORNERS) {
            let left = x;
            let top = y;
            let right = width;
            let bottom = height;
            this.width = right - left;
            this.height = bottom - top;
            this.x = left + this.width*0.5;
            this.y = top + this.height*0.5;
        } else if (validParameter(width)) {
            this.width = width * unit;
            this.height = height * unit;
        } else {
            this.width = this.animation.width;
            this.height = this.animation.height;
        }
        this.halfWidth = this.width*0.5;
        this.halfHeight = this.height*0.5;

    }

    draw() {
        if (this.animationType == ANIMATION) {
            this.animation.draw(this.x, this.y);
        } else {
            image(this.animation, this.x, this.y);
        }
    }

     drawShape() {
        fill(255);
        noStroke();
        rect(this.x, this.y, this.width, this.height);
    }

    isInteracting(ch) {
        return (this.isInteractingVertical(ch) && this.isInteractingHorizontal(ch));
    }

    isInteractingVertical(ch) {

        let cushion = timeSpeed*5;

        let chBottom = ch.bottom();
        let thisTop = this.top();
        if (chBottom < thisTop - cushion) {
            return false;
        }

        let chTop = ch.top();
        let thisBottom = this.bottom();
        if (chTop > thisBottom + cushion) {
            return false;
        }

        return true;
    }

    isInteractingHorizontal(ch) {

        let cushion = timeSpeed*5;

        let chRight = ch.right();        
        let thisLeft = this.left();
        if (chRight < thisLeft - cushion) {
            return false;
        }

        let chLeft = ch.left();
        let thisRight = this.right();
        if (chLeft > thisRight + cushion) {
            return false;
        }

        return true;
    }

    isCollidingLeft(someRight) {
        let cushion = 15*timeSpeed;
        if (someRight == constrain(someRight, this.left() - cushion, this.left() + cushion)) {
            return true;
        }
        return false;
    }

    isCollidingRight(someLeft) {
        let cushion = 15*timeSpeed;
        if (someLeft == constrain(someLeft, this.right() - cushion, this.right() + cushion)) {
            return true;
        }
        return false;
    }

    isCollidingTop(someBottom) {
        let cushion = 15*timeSpeed;
        if (someBottom == constrain(someBottom, this.top() - cushion, this.top() + cushion)) {
            return true;
        }
        return false;
    }

    isCollidingBottom(someTop) {
        let cushion = 15*timeSpeed;
        if (someTop == constrain(someTop, this.bottom() - cushion, this.bottom() + cushion)) {
            return true;
        }
        return false;
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