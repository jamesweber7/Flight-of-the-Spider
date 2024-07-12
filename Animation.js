class Animation {

    constructor(fileName, numberOfImages, timeDilation, hasIndex) {

        this.fileName = fileName;
        this.images = [];
        this.length = numberOfImages;
        for (let i = 0; i < this.length; i++) {
            this.images[i] = loadImage(fileName + (i+1) + ".png");
        }
        this.hasIndex = hasIndex;
        if (this.hasIndex) {
            this.index = 0;
        } else {
            this.index = gameTime;
        }
        this.width = this.images[0].width;
        this.originalWidth = this.width;
        this.height = this.images[0].height;
        this.halfWidth = this.width*0.5;
        this.halfHeight = this.height*0.5;

        this.timeDilation = timeDilation;

    }

    draw(x, y) {
        if (this.hasIndex) {
            this.index += timeSpeed/this.timeDilation;
            if (this.index >= this.length) {
                this.index = 0;
            }
            image(this.images[floor(this.index)], x, y);
        } else {
            image(this.images[floor(gameTime/this.timeDilation % this.length)], x, y);
        }
    }

    drawThrough(x, y) {
        this.index += timeSpeed/this.timeDilation;
        if (this.index >= this.length) {
            this.index = 0;
            return true;
        }
        image(this.images[floor(this.index)], x, y);
        return false;
    }

    setDimension(width, height) {
        this.setWidth(width);
        this.setHeight(height);
    }

    setWidth(width) {
        this.width = width;
        this.halfWidth = this.width * 0.5;
    }

    setHeight(height) {
        this.height = height;
        this.halfHeight = this.height * 0.5;
    }

    resetDimension() {
        for (let i = 0; i < this.images.length; i++) {
            this.images[i].resize(unit*this.originalWidth, 0);
        }
        this.setWidth(this.images[0].width);
        this.setHeight(this.images[0].height);
    }

    copy() {
        return new Animation(this.fileName, this.length, this.timeDilation, this.hasIndex);
    }

}