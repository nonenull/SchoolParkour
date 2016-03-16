StartGameLayer = cc.Layer.extend({
    sprite: null,
    size: cc.winSize,
    bgSprites: [],
    ctor: function () {
        //this._super();
        this._super();

        this.addBG(0);
        this.addBG(1);

        this.addRunner();
        this.scheduleUpdate();
        this.addTouchEventListenser();

        this.addMonster();
        return true;
    },
    addBG: function (type) {
        var PlayBG = new cc.Sprite(res.PlayBG);
        var playBgX, playBgY;
        playBgY = this.size.height * (1 / 2);
        playBgX = this.size.width * (1 / 2 + type);
        //cc.log(playBgX);
        PlayBG.attr({
            x: playBgX,
            y: playBgY
        });
        this.addChild(PlayBG, 0);
        this.bgSprites.push(PlayBG);
    },
    addRunner: function () {
        var frames = [];
        var frame;
        var i;
        var size = cc.rect(0, 0, 193, 197);
        for (i = 1; i <= 12; i++) {
            frame = new cc.SpriteFrame(res['Runner' + i], size);
            frames.push(frame);
        }
        var runnerAnimate = new cc.Animation(frames, 0.05);
        var action = cc.animate(runnerAnimate);
        this.runnerSprite = new cc.Sprite();
        this.runnerSprite.setPosition(this.size.width * (1 / 5), this.size.height * (1 / 4));
        this.runnerSprite.runAction(cc.repeatForever(action));
        this.addChild(this.runnerSprite, 5);
    },
    jumpRunner: function () {
        var action, x, y, forwardBy, backBy;
        //cc.log(this.runnerSprite.y, this.size.height * (1 / 4));
        if (this.runnerSprite.y - this.size.height * (1 / 4) < 0.1) {
            //cc.log('jump');
            x = 0;
            y = 100;
            forwardBy = new cc.JumpBy.create(0.4, cc.p(x, y), 100, 0);
            backBy = forwardBy.reverse();
            action = new cc.Sequence(forwardBy, backBy);
            this.runnerSprite.runAction(action);
        }
    },
    addMonster: function () {
        var allMonster = new cc.Sprite(res.Monster,cc.rect(0,0,120,123));
        allMonster.attr({
            x: this.size.width * (1 / 2),
            y: this.size.height * (1 / 4)
        });
        this.addChild(allMonster);
    },
    addTouchEventListenser: function () {
        this.touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            //onTouchBegan event callback function
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                target.jumpRunner();
                return false;
            }
        });
        cc.eventManager.addListener(this.touchListener, this);
    },
    update: function () {
        var speed = 5;
        for (var i = 0; i < this.bgSprites.length; i++) {
            bg = this.bgSprites[i]
            bg.x = bg.x - speed
            if (bg.x <= -this.size.width * (1 / 2)) {
                bg.x = this.size.width * 1.5;
            }
        }
    }
});

var StartGameScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new StartGameLayer();
        this.addChild(layer);
    }
});

