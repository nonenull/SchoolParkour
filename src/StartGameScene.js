StartGameLayer = cc.Layer.extend({
    sprite: null,
    size: cc.winSize,
    bgSprites: [],
    monsterSpritesArray: [],
    monsterSpeed: 3,
    bgSpeed: 6,
    timeout: 30,
    blood: 3,
    ctor: function () {
        this._super();

        this.addBG(0);
        this.addBG(1);
        this.addTopBar();

        this.addRunner();
        this.scheduleUpdate();
        this.addTouchEventListenser();

        this.schedule(this.addMonster, 4, 16 * 1024, 1);
        this.schedule(this.removeMonster, 2, 16 * 1024, 4);
        this.schedule(this.timeOutSchedule, 1, this.timeout-1, 0);
        return true;
    },
    addTopBar: function () {
        var y = this.size.height - 20;
        this.bloodLabel = new cc.LabelTTF("Blood: " + this.blood, "Arial", 30);
        this.bloodLabel.attr({
            x: this.size.width * (1 / 6),
            y: y,
            color: cc.color('#990000')
        });
        this.addChild(this.bloodLabel, 5);

        // timeout 60
        this.timeoutLabel = cc.LabelTTF.create("Time: " + this.timeout, "Arial", 30);
        this.timeoutLabel.attr({
            x: this.size.width * (3 / 4),
            y: y,
            color: cc.color('#990000')
        });
        this.timeoutLabel.x = this.size.width * (5 / 6);
        this.timeoutLabel.y = y;
        this.addChild(this.timeoutLabel, 5);
    },
    timeOutSchedule: function(){
        this.timeout -= 1;
        this.timeoutLabel.setString("Time: " + this.timeout);
        if(this.timeout === 0){
            cc.log('时间到');
            cc.director.runScene(new GameOverScene());
        }
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
    hurtRunner: function(){
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
    jumpRunner: function () {
        var action, x, y, forwardBy, backBy;
        //cc.log(this.runnerSprite.y, this.size.height * (1 / 4));
        //判断玩家在地上才允许跳起来
        if (this.runnerSprite.y - this.size.height * (1 / 4) < 0.1) {
            //cc.log('jump');
            x = 5;
            y = 100;
            forwardBy = new cc.JumpBy(0.6, cc.p(x, y), 200, 0);
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
        var action = new cc.MoveTo(this.monsterSpeed, cc.p(-(monster.width), y));
        this.monsterSpritesArray.push(monster);
        setTimeout(function () {
            monster.runAction(action)
        }, Math.ceil(Math.random() * 2000));
    },
    removeMonster: function () {
        var i;
        for (i = 0; i < this.monsterSpritesArray.length; i++) {
            var monster = this.monsterSpritesArray[i];
            if (monster.x < 0) {
                //cc.log(monster.x);
                //cc.log("==============remove:" + i);
                monster.removeFromParent();
                monster = undefined;
                this.monsterSpritesArray.splice(i, 1);
            }
        }
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
        for (var i = 0; i < this.bgSprites.length; i++) {
            bg = this.bgSprites[i];
            bg.x = bg.x - this.bgSpeed;
            if (bg.x <= -this.size.width * (1 / 2)) {
                bg.x = this.size.width * 1.5;
            }
        }
        if (this.monsterSpritesArray.length <= 0) {
            return;
        }
        var monster = this.monsterSpritesArray[0];
        if(monster.isCollision){
            return;
        }
        monsterRect = cc.rect(monster.x, monster.y, monster.width, monster.height);

        var runner = this.runnerSprite;
        runnerRect = cc.rect(runner.x, runner.y, runner.width, runner.height);
        var collision = cc.rectOverlapsRect(runnerRect, monsterRect);
        if (collision) {
            cc.log('碰撞到了');
            monster.isCollision = true;
            this.blood -= 1;
            this.bloodLabel.setString("Blood: " + this.blood);
            if(this.blood === 0){
                cc.log('玩家死亡');
                cc.director.runScene(new GameOverScene());
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

