StartGameLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        this.initLayer();
        this.addBG(0);
        this.addBG(1);
        this.addTopBar();
        this.addRunner();
        this.scheduleUpdate();
        this.addTouchEventListenser();
        this.schedule(this.addMonster, 4, 16 * 1024, 1);
        this.schedule(this.timeOutSchedule, 1, this.timeout - 1, 0);
        return true;
    },
    initLayer: function () {
        this.sprite = null;
        this.size = cc.winSize;
        //存放背景精灵的数组
        this.bgSprites = [];
        //存放怪物精灵的数组
        this.monsterSprites = [];
        //怪物速度
        this.monsterSpeed = 3;
        //背景移动速度 像素/帧
        this.bgSpeed = 6;
        //游戏倒计时
        this.timeout = 30;
        //玩家血量
        this.blood = 3;
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
    timeOutSchedule: function () {
        this.timeout -= 1;
        this.timeoutLabel.setString("Time: " + this.timeout);
        if (this.timeout === 0) {
            cc.log('时间到');
            this.gameOver();
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
    hurtRunner: function () {
        var forwardBy, backBy, action;
        forwardBy = new cc.FadeOut(0.2);
        backBy = forwardBy.reverse();
        action = new cc.Sequence(forwardBy, backBy);
        this.runnerSprite.runAction(action.repeat(2));
    },
    deadRunner: function () {
        this.runnerSprite.setRotation(0);
        this.runnerSprite.runAction(new cc.RotateTo(1, 720));
    },
    jumpRunner: function () {
        var action, x, y, forwardBy, backBy;
        //cc.log(this.runnerSprite.y, this.size.height * (1 / 4));
        //判断玩家在地上才允许跳起来
        if (this.runnerSprite.y - this.size.height * (1 / 4) < 0.1) {
            //cc.log('jump');
            x = 5;
            y = 200;
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
        //返回小于等于n的最大整数,随机生成怪物
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
        //cc.log('生成怪物');
        this.monsterSprites.push(monster);
        var action = new cc.MoveTo(this.monsterSpeed, cc.p(-(monster.width), y));
        var callback = new cc.CallFunc(function () {
            this.removeMonster(1);
        }, this);
        setTimeout(function () {
            monster.runAction(new cc.Sequence(action, callback));
            //cc.log('怪物出动');
        }, Math.ceil(Math.random() * 2000));
    },
    removeMonster: function (removeNum) {
        if (removeNum == 0) {
            removeNum = this.monsterSprites.length;
        }
        for (var i = 0; i < removeNum; i++) {
            try {
                this.monsterSprites[i].removeFromParent();
                this.monsterSprites.splice(i, 1);
            } catch (e) {
                cc.log(this.monsterSprites[i]);
                cc.log("name: " + e.name + " errorNumber: " + (e.number & 0xFFFF ) + " message: " + e.message);
                this.monsterSprites.splice(i, 1);
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
    gameOver: function () {
        cc.director.runScene(new GameOverScene());
    },
    collision: function () {
        if (this.monsterSprites.length <= 0) {
            return;
        }
        //cc.log(this.monsterSprites.length);
        var monster = this.monsterSprites[0];
        if (monster.hasOwnProperty('isCollision')) {
            return;
        }
        var runner = this.runnerSprite;

        // 计算两者之间的距离,pDistance()以两者的中心点为原点作计算
        var distance = cc.pDistance(runner.getPosition(), monster.getPosition());
        //cc.log('两者距离: ' + distance);
        var radiusSum = monster.width / 2 + runner.width / 2;
        //cc.log("distance:" + distance + "; radius:" + radiusSum);
        if (distance < radiusSum) {
            //cc.log('----------碰撞到了');
            this.hurtRunner();
            //cc.director.pause();
            monster.isCollision = true;
            this.blood -= 1;
            this.bloodLabel.setString("Blood: " + this.blood);
            if (this.blood === 0) {
                this.deadRunner();
                this.unscheduleAllCallbacks()
                this.schedule(this.gameOver, 0.5, 1, 0);
            }
        }

        //针对第三三种方法又加深了一下，使得对矩形类的精灵也能有好的判断，
        //主要就是分别对X和Y方向设置不同的Radius，然后去进行分别判断
        //var distanceX = Math.abs(monster.getPositionX() - runner.getPositionX());
        //var distanceY = Math.abs(monster.getPositionY() - runner.getPositionY());
        //var radiusYSum = monster.height/2 + runner.height/2;
        //if (distanceX < monster.width/2 && distanceY < radiusYSum) {
        //    cc.log('碰撞到了');
        //    monster.isCollision = true;
        //    this.blood -= 1;
        //    this.bloodLabel.setString("Blood: " + this.blood);
        //    if (this.blood === 0) {
        //        this.deadRunner();
        //        this.unscheduleAllCallbacks();
        //        this.schedule(this.gameOver, 0.5, 1, 0);
        //    }
        //}
    },
    update: function () {
        for (var i = 0; i < this.bgSprites.length; i++) {
            bg = this.bgSprites[i];
            bg.x = bg.x - this.bgSpeed;
            if (bg.x <= -this.size.width * (1 / 2)) {
                bg.x = this.size.width * 1.5;
            }
        }
        this.collision();
    }
});

var StartGameScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new StartGameLayer();
        this.addChild(layer);
    }
});

