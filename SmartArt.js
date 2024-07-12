class SmartArt {

    constructor(index, art, x, y, mode, translateXOffset, translateYOffset, rotation, action, sound, playTime) {
        this.index = index;
        this.art = art;
        this.mode = mode;
        this.x = x;
        this.y = y;
        
        if (hasValidParameter(translateXOffset, translateYOffset, rotation)) {
            this.hasTranslation = true;
            this.translateXOffset = overrideParameter(translateXOffset, 0);
            this.translateYOffset = overrideParameter(translateYOffset, 0);
            this.rotation = overrideParameter(rotation, 0);
        }
        if (hasValidParameter(action)) {
            this.action = action;
        }
        if (validParameter(sound)) {
            this.hasSound = true;
            this.sound = sound;
            this.playTime = playTime;
        }
    }

    draw() {

        if (this.hasSound) {
            this.playSound();
        }
        if (this.hasTranslation) {
            return this.drawTranslation();
        }
        return this.drawArt();
        
    }

    drawArt() {

        if (this.mode == ANIMATION) {
            this.drawAnimation();
        } else if (this.mode == PLAY_THROUGH_ANIMATION) {
            return this.drawThroughAnimation();
        } else {
            this.drawImage();
        }
    }

    drawTranslation() {
        push();
        translate(this.x + this.translateXOffset, this.y + this.translateYOffset, 0);
        rotate(this.rotation);
        let returnValue;
        if (this.mode == ANIMATION) {
            returnValue = this.drawAnimationZero();
        } else if (this.mode == PLAY_THROUGH_ANIMATION) {
            returnValue =  this.drawThroughAnimationZero();
        } else {
            returnValue = this.drawImageZero();
        }
        pop();
        return returnValue;
    }

    drawAnimation() {
        this.art.draw(this.x, this.y);
    }

    drawThroughAnimation() {
        if (this.art.drawThrough(this.x, this.y)) {
            this.performAction();
        }
    }

    drawImage() {
        image(this.art, this.x, this.y);
    }

    drawAnimationZero() {
        this.art.draw(0, 0);
    }

    drawThroughAnimationZero() {
        if (this.art.drawThrough(0, 0)) {
            this.performAction();
        }
    }

    drawImageZero() {
        image(this.art, 0, 0);
    }

    playSound() {
        if (frameCount % this.playTime == 0) {
            this.sound.play();
        }
    }

    performAction() {
        switch (this.action) {

            case ADD_CRAWLER :
                world.addCrawler(this.x, this.y);
                this.delete();
                return;

        }
    }

    delete() {
        world.removeSmartArt(this.index);
    }


}