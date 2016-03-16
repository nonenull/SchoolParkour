StartGameLayer = cc.Layer.extend({
    sprite: null,
    size: cc.winSize,
    monsterSpritesArray: [],
    monsterSpeed: 5,
    bgSpeed: 5,
    ctor: function () {
        this._super();

        this.addBG(0);
        this.addBG(1);

        this.addRunner();
        this.scheduleUpdate();
        this.addTouchEventListenser();

        this.schedule(this.addMonster, 4, 16 * 1024, 1);
        this.schedule(this.removeMonster, 4, 16 * 1024, 4);
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
        var x, y;
        x = this.size.width * (1 / 5);
        y = this.size.height * (1 / 4);
        this.runnerSprite.setPosition(x, y);
        this.runnerSprite.runAction(cc.repeatForever(action));
        this.addChild(this.runnerSprite, 5);
    },
    jumpRunner: function () {
        var action, x, y, forwardBy, backBy;
        //cc.log(this.runnerSprite.y, this.size.height * (1 / 4));
        if (this.runnerSprite.y - this.size.height * (1 / 4) < 0.1) {
            //cc.log('jump');
            x = 10;
            y = 200;
            forwardBy = new cc.JumpBy.create(0.6, cc.p(x, y), 200, 0);
            backBy = forwardBy.reverse();
            action = new cc.Sequence(forwardBy, backBy);
            this.runnerSprite.runAction(action);
        }
    },
    addMonster: function () {
        var monsterList = {
            'monster0': cc.rect(0, 0, 125, 140),
            'monster1': cc.rect(159, 6, 124, 131),
            'monster2': cc.rect(1, 149, 122, 132),
            'monster3': cc.rect(159, 154, 82, 82),
            'monster4': cc.rect(328, 102, 92, 92),
            'monster5': cc.rect(453, 105, 85, 105)
        };
        //返回小于等于n的最大整数。
        rangeNum = Math.floor(Math.random() * 6);
        var monsterRange = monsterList['monster' + rangeNum];

        var monster = new cc.Sprite(res.Monster, monsterRange);
        var x = this.size.width * 1.5;
        var y = 82 + monsterRange.height / 2;
        monster.attr({
            x: x,
            y: y
        });
        this.addChild(monster);
        var action = new cc.MoveTo(this.monsterSpeed, cc.p(-this.size.width * (1 / 2), y));
        setTimeout(function(){monster.runAction(action)}, Math.ceil(Math.random()*2000));
        this.monsterSpritesArray.push(monster);
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
    removeMonster: function(){
        var i;
        for(i=0;i<this.monsterSpritesArray.length;i++){
            cc.log("==============remove:"+i);
            this.monsterSpritesArray[i].removeFromParent();
            this.monsterSpritesArray[i] = undefined;
            this.monsterSpritesArray.splice(i,1);
            i= i-1;
        }
    },
    update: function () {
        for (var i = 0; i < this.bgSprites.length; i++) {
            bg = this.bgSprites[i]
            bg.x = bg.x - this.bgSpeed
            if (bg.x <= -this.size.width * (1 / 2)) {
                bg.x = this.size.width * 1.5;
            }
        }
    },
});

var StartGameScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new StartGameLayer();
        this.addChild(layer);
    }
});

