class BorderObject {

    constructor(value, side) {
        this.value = value;
        this.side = side;
    }

    checkCollision(character) {
        switch (this.side) {

            case LEFT_WALL :
                if (character.left() < this.value) {
                    character.setLeft(this.value);
                    character.moveX = 0;
                }
                return;

            case CEILING :
                if (character.top() < this.value) {
                    character.setTop(this.value);
                    character.moveY = 0;
                }
                return;

            case RIGHT_WALL :
                if (character.right() > this.value) {
                    character.setRight(this.value);
                    character.moveX = 0;
                }
                return;

            case FLOOR :
                if (character.bottom() > this.value) {
                    character.setBottom(this.value);
                    character.moveY = 0;
                    character.isJumping = false;
                }
                return;

        }
    }

    isInteracting(characterValue, cushion) {

        cushion = overrideParameter(cushion, 0);
        switch (this.side) {

            case LEFT_WALL :
                if (characterValue < this.value + cushion) {
                    return true;
                }
                return false;

            case CEILING :
                if (characterValue < this.value + cushion) {
                    return true;
                }
                return false;

            case RIGHT_WALL :
                if (characterValue > this.value - cushion) {
                    return true;
                }
                return false;

            case FLOOR :
                if (characterValue > this.value - cushion) {
                    return true;
                }
                return false;

        }

    }

}