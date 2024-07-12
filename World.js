class World {

    static TIME_PER_DAY = 20000;
    constructor() {

        this.players = [];
        this.enemies = [];
        this.smallEnemies = [];
        this.borders = [];
        this.blood = [];
        this.smartArt = [];

        this.numberOfBirds = 0;
        this.numberOfSmallEnemies = 0;

        this.floor = height - 58;
        this.addBorder(this.floor, FLOOR);
        this.ceiling = 34;
        this.addBorder(this.ceiling, CEILING);

        this.leftWall = 68;
        this.addBorder(this.leftWall, LEFT_WALL);
        this.rightWall = width - 68;
        this.addBorder(this.rightWall, RIGHT_WALL);

        this.addCharacter(DRONE);

        this.introduceCrawler();

        this.skyTheta = 0;

        this.timeSurvived = 0;
        this.score = 0;
        this.enemiesKilled = 0;
    }

    draw() {

        this.spawnEnemies();

        this.drawBackground();
        this.drawFrame();
        this.drawStats();

        for (let i = 0; i < this.smartArt.length; i++) {
            this.smartArt[i].draw();
        }

        for (let i = 0; i < this.smallEnemies.length; i++) {
            this.smallEnemies[i].move();
        }
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].move();
        }
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].move();
        }

        for (let i = 0; i < this.smallEnemies.length; i++) {
            this.smallEnemies[i].draw();
        }
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].draw();
        }
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].draw();
        }

        for (let i = 0; i < this.blood.length; i++) {
            this.blood[i].draw();
            this.blood[i].move();
        }

        timeSpeed = 1;

    }

    drawBackground() {
        push();
        translate(width*0.5, height*1.45, 0);
        this.timeSurvived += timeSpeed;
        this.skyTheta = this.timeSurvived / World.TIME_PER_DAY * TWO_PI;
        rotate(this.skyTheta);
        image(sky, 0, 0);
        pop();
        image(cityBackground, width*0.5, height*0.55);
    }

    drawFrame() {
        image(verticalWall, this.leftWall - verticalWall.width * 0.5, height * 0.5);
        image(horizontalWall, width*0.5, this.ceiling - horizontalWall.height*0.5);
        image(verticalWall, this.rightWall + verticalWall.width * 0.5, height * 0.5);
        image(horizontalWall, width*0.5, this.floor + horizontalWall.height * 0.5);
        image(horizontalWall, width*0.5, this.floor + horizontalWall.height * 1.5-4);
    }

    drawStats() {
        textSize(30);
        noStroke();
        fill(255, 249, 189);
        text(`Day ${this.getDaysSurvived()}`, 100, 80);
    }

    spawnEnemies() {

        switch (this.players[0].type) {

            case NINJA :
                return this.spawnEnemiesForNinja();

            case DRONE :
                return this.spawnEnemiesForDrone();

            case GRAPPLER : 
                return this.spawnEnemiesForGrappler();


        }
    }

    spawnEnemiesForNinja() {
        this.spawnBirds();
        this.spawnCrawlersForNinja();
    }

    spawnCrawlersForNinja() {
        let spawnProbability = 0.99 - gameTime/80000;
        let enemyLengthOffset = 0.002;
        let spawnValue = (timeSpeed == 1) ? spawnProbability : pow(spawnProbability, timeSpeed);
        if (random() > spawnValue + this.smallEnemies.length*enemyLengthOffset) {
            this.introduceCrawler();
        }
    }

    spawnEnemiesForDrone() {
        this.spawnBirds();
        this.spawnCrawlersForDrone();
    }

    spawnCrawlersForDrone() {
        let spawnProbability = 0.99 - gameTime/80000;
        let enemyLengthOffset = 0.002;
        let spawnValue = (timeSpeed == 1) ? spawnProbability : pow(spawnProbability, timeSpeed);
        if (random() > spawnValue + this.smallEnemies.length*enemyLengthOffset) {
            this.introduceCrawler();
        }
    }

    spawnEnemiesForGrappler() {
        this.spawnBirds();
        this.spawnCrawlersForGrappler();
    }

    spawnCrawlersForGrappler() {
        let spawnProbability = 0.99 - gameTime/80000;
        let enemyLengthOffset = 0.002;
        let spawnValue = (timeSpeed == 1) ? spawnProbability : pow(spawnProbability, timeSpeed);
        if (random() > spawnValue + this.smallEnemies.length*enemyLengthOffset) {
            this.introduceCrawler();
        }
    }

    spawnBirds() {
        
    }
    
    addCharacter(type) {

        let index = this.players.length;
        switch (type) {

            case NINJA :
                this.players[index] = new Ninja(index, 300, 560);
                break;

            case DRONE :
                this.players[index] = new Drone(index, width/2, height/2);
                break;

            case GRAPPLER : 
                this.players[index] = new Grappler(index, 500, 560);
                break;

        }
    }

    addBird() {
        let index = this.smallEnemies.length;
        this.smallEnemies[index] = new Bird(index);
        this.numberOfBirds ++;
    }

    removeBird(index) {
        this.removeSmallEnemy(index);
        this.numberOfBirds --;
    }

    introduceCrawler(x, y, rotation) {
        if (arguments.length == 0) {
            let cushion = 50;
            if (random() > 0.5) {
                let onFloor = random() > 0.5;
                this.introduceCrawler(random(this.leftWall + cushion, this.rightWall - cushion), onFloor ? this.floor : this.ceiling, onFloor ? 0 : PI);
            } else {
                let onLeft = random() > 0.5;
                this.introduceCrawler(onLeft ? this.leftWall : this.rightWall, random(this.ceiling + cushion, this.floor - cushion), onLeft ? PI*0.5 : PI*1.5);
            }
            return;
        }
        this.numberOfSmallEnemies ++;

        let offsetHypotenuse = -25;
        let xOffset = offsetHypotenuse*cos(rotation + PI*0.5);
        let yOffset = offsetHypotenuse*sin(rotation + PI*0.5);
        this.addSmartArt(risingCrawler.copy(), x, y, PLAY_THROUGH_ANIMATION, xOffset, yOffset, rotation);
        this.smartArt[this.smartArt.length-1].action = ADD_CRAWLER;
    }

    addCrawler(x, y) {
        let index = this.smallEnemies.length;
        this.smallEnemies[index] = new Crawler(index, x, y);
    }

    removeCrawler(index) {
        this.removeSmallEnemy(index);
    }

    removeSmallEnemy(index) {
        this.numberOfSmallEnemies --;
        this.smallEnemies.splice(index, 1);
        for (let i = index; i < this.smallEnemies.length; i++) {
            this.smallEnemies[i].id = i;
        }
        this.enemiesKilled ++;
    }

    addSmartArt(art, x, y, mode, translateXOffset, translateYOffset, offsetRotation, action, sound, playTime) {
        let index = this.smartArt.length;
        this.smartArt[index] = new SmartArt(index, art, x, y, mode, translateXOffset, translateYOffset, offsetRotation, action, sound, playTime)
    }

    removeSmartArt(index) {
        this.smartArt.splice(index, 1);
        for (let i = index; i < this.smartArt.length; i++) {
            this.smartArt[i].index = i;
        }
    }

    addCollider(x, y, width, height, animationType, animation, assignmentMode) {
        this.colliders[this.colliders.length] = new LevelObject(x, y, width, height, COLLIDER, animationType, animation, assignmentMode);
    }

    addBorder(value, side) {
        this.borders[this.borders.length] = new BorderObject(value, side);
    }

    addBlood(x, y, size) {
        let index = this.blood.length;
        if (!validParameter(size)) {
            size = random(5,10);
        }
        this.blood[index] = new BloodDrop(index, x, y, size, 4);
    }

    removeBlood(index) {
        this.blood.splice(index, 1);
        for (let i = index; i < this.blood.length; i++) {
            this.blood[i].index = i;
        }
    }

    removePlayer(id) {
        print("PLAYER " + this.players[id].type + "ID " + id + " IS BEING DELETED");
        print("HERE ARE THE CURRENT PLAYERS " + this.players);
        let wasPlayer = this.players[id].isPlayer;
        
        this.players.splice(id, 1);

        if (this.players.length == 0) {
            gameOver();
            this.addPlaceholderCharacter();
        }

        for (let i = id; i < this.players.length; i++) {
            this.players[i].id = i;
        }
        print("HERE ARE THE NEW PLAYERS " + this.players);
        print("HERE ARE THE PLAYER IDs");
        for (let i = 0; i < this.players.length; i++) {
            print(this.players[i].type + " : " + this.players[i].id);
        }
        for (let i = 0; i < this.enemies.length; i++) {
            print("THIS SHOULD NEVER BE RUN");
            if (id == this.enemies[i].enemyIndex) {
                this.enemies[i].findNewPlayerEnemy();
            } else if (this.enemies[i].enemyIndex > id) {
                this.enemies[i].enemyIndex --;
            }
        }
        for (let i = 0; i < this.smallEnemies.length; i++) {
            if (id == this.smallEnemies[i].enemyIndex) {
                print(this.smallEnemies[i].type + " IS FINDING A NEW ENEMY " + frameCount);
                this.smallEnemies[i].findNewPlayerEnemy();
                print("THIS IS THEIR NEW ENEMYINDEX " + this.smallEnemies[i].enemyIndex + " AND THAT PLAYER IS" + this.players[this.smallEnemies[i].enemyIndex].type);
            } else if (this.smallEnemies[i].enemyIndex > id) {
                print(this.smallEnemies[i].type + " IS DECREMENTING ENEMY ID BC THEIR PLAYER ENEMY HAS A NEW INDEX " + frameCount);
                this.smallEnemies[i].enemyIndex --;
            }
        }
        
    }

    removeEnemy(id) {

        this.enemies.splice(id, 1);
        for (let i = id; i < this.enemies.length; i++) {
            this.enemies[i].id = i;
        }
        if (this.enemies.length == 0) {
            gameOver();
            this.addPlaceholderEnemy();
        }
        for (let i = 0; i < this.players.length; i++) {
            if (id == this.players[i].enemyIndex) {
                this.players[i].findNewEnemy();
            }
        }
        
    }

    player() {
        return this.players[this.playerIndex];
    }

    totalEnemyWeight() {
        if (!this.hasEnemies()) {
            return -1;
        }
        let totalEnemyWeight = 0;
        for (let i = 0; i < this.enemies.length; i++) {
            totalEnemyWeight += this.enemies[i].weight;
        }
        for (let i = 0; i < this.smallEnemies.length; i++) {
            totalEnemyWeight += this.smallEnemies[i].weight;
        }
        return totalEnemyWeight;
    }

    totalPlayerWeight() {
        let totalPlayerWeight = 0;
        for (let i = 0; i < this.players.length; i++) {
            totalPlayerWeight += this.players[i].weight;
        }
        return totalPlayerWeight;
    }

    // ADDS A CHARACTER SO THE GAME DOES NOT BREAK; otherwise world.draw may run through more functions that rely on characters existing
    addPlaceholderCharacter() {
        let index = this.players.length;
        this.players[index] = new Ninja(index, width*5, height*5);
    }

    // ADDS AN ENEMY SO THE GAME DOES NOT BREAK; otherwise world.draw may run through more functions that rely on enemies existing
    addPlaceholderEnemy() {
        let index = this.enemies.length;
        this.enemies[index] = new Ninja(index, width*5, height*5);
    }

    hasEnemies() {
        return (this.hasBossEnemies || this.hasSmallEnemies);
    }

    hasBossEnemies() {
        return (this.enemies.length > 0);
    }

    hasSmallEnemies() {
        return (this.smallEnemies.length > 0);
    }

    pressLeft() {
        this.leftPressed = true;
    }

    unpressLeft() {
        this.leftPressed = false;
    }

    pressRight() {
        this.rightPressed = true;
    }

    unpressRight() {
        this.rightPressed = false;
    }

    pressUp() {
        this.upPressed = true;
    }

    unpressUp() {
        this.upPressed = false;
    }

    pressDown() {
        this.downPressed = true;
    }

    unpressDown() {
        this.downPressed = false;
    }

    pressSpace() {
        this.spacePressed = true;
    }

    unpressSpace() {
        this.spacePressed = false;
    }

    jumpPressed() {
        return this.spacePressed || this.upPressed;
    }

    characterId(type) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].type == type) {
                return this.players[i].id;
            }
        }
        return -1;
    }

    getStats() {
        return {
            score: this.getScore(),
            enemiesKilled: this.enemiesKilled,
            daysSurvived: this.getDaysSurvived(),
        }
    }

    getScore() {
        return floor((this.getDaysSurvived()-1) * 10000 + this.enemiesKilled * 50);
    }

    getEnemiesKilled() {
        return this.enemiesKilled;
    }

    getDaysSurvived() {
        return floor(this.timeSurvived / World.TIME_PER_DAY)+1;
    }

}