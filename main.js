var AM = new AssetManager();

/*
 * spriteSheet -
 * frameWidth -
 * frameHeight -
 * sheetWidth -
 * frameDuration - the length of how long the animation should last
 * frames - number of frames on the spritesheet
 * loop - boolean to see if
 * scale - changes the size of the image/spritesheet
 */
function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

Background.prototype.update = function () {
};

//spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale
function MafiaDude(game, x, y) {
    this.animation = new Animation(AM.getAsset("./img/Mafia1Idle.png"), 194, 294, 10, 0.01, 30, false, 0.5);
    this.runAnimation = new Animation(AM.getAsset("./img/Mafia1Run.png"), 239, 314, 4, 0.02, 17, false, 0.5);
    this.jumpAnimation = new Animation(AM.getAsset("./img/Mafia1Jump.png"), 233, 393, 4, 0.03, 19, false, 0.5);
    this.shootAnimation = new Animation(AM.getAsset("./img/Mafia1Shoot.png"), 321, 294, 3, 0.03, 15, false, 0.5);
    this.deathAnimation = new Animation(AM.getAsset("./img/Mafia1Death.png"), 370, 321, 5, 0.02, 50, false, 0.5);

    // These variable control if the mafia will do a certain aniamtion
    this.run = false;
    this.jump = false;
    this.death = false;
    this.shoot = false;
    this.ground = 400;
    this.x = x;
    this.y = y;
    this.speed = 100;
    this.game = game;
    this.ctx = game.ctx;
}

MafiaDude.prototype.update = function () {

    if(this.run) {
        console.log("test run");
        if (this.runAnimation.isDone()) {
            this.runAnimation.elapsedTime = 0;
            this.run = false;
            this.jump = true;
        }

        if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14) {
            this.x += this.game.clockTick * this.speed * 8;
        }
    } else if(this.jump) {
        console.log("test jump");
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jump = false;
            this.shoot = true;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 200;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    } else if(this.shoot) {
        console.log("test shoot");
        if (this.shootAnimation.isDone()) {
            this.shootAnimation.elapsedTime = 0;
            this.shoot = false;
            this.death = true;
        }
    } else if(this.death) {
        console.log("test death");
        if (this.deathAnimation.isDone()) {
            this.deathAnimation.elapsedTime = 0;
            this.death = false;
        }
    } else {
        console.log("test idle");
        if (this.animation.isDone()) {
            this.animation.elapsedTime = 0;
            this.run = true;
        }
        if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14) {
            this.x += this.game.clockTick * this.speed * 2;
        }
    }

    // If the animation goes past 1350 px it will reset
    if (this.x > 1350) this.x = 0;
}

MafiaDude.prototype.draw = function () {
    if(this.run) {
        this.runAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    } else if(this.jump) {
        this.jumpAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    } else if(this.shoot) {
        this.shootAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    } else if(this.death) {
        this.deathAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    } else  {
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }
}

AM.queueDownload("./img/Mafia1Idle.png");
AM.queueDownload("./img/Mafia1Jump.png");
AM.queueDownload("./img/Mafia1Run.png");
AM.queueDownload("./img/Mafia1Shoot.png");
AM.queueDownload("./img/Mafia1Death.png");
//AM.queueDownload("./img/background.jpg");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    //gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.jpg")));
    gameEngine.addEntity(new MafiaDude(gameEngine, 0 , 400));

    console.log("All Done!");
});
