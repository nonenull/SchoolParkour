GameOverLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        this.initLayer();
        this.addGameOverLabel();
        this.addRestartLabel();
    },
    initLayer: function(){
        this.size = cc.winSize;
    },
    addGameOverLabel: function () {
        this.gameOverLabel = new cc.LabelTTF("Game Over", "Arial", 50);
        this.gameOverLabel.attr({
            x: this.size.width * (1 / 2),
            y: this.size.height * (1 / 2),
            color: cc.color('#990000')
        });
        this.addChild(this.gameOverLabel, 5);
    },
    addRestartLabel: function () {
        //add start menu
        var restartLabel = new cc.LabelTTF("PLAY AGAIN", "Arial", 50);
        var startItem = new cc.MenuItemLabel(
            restartLabel,
            function () {
                cc.log("Menu is clicked!");
                cc.director.runScene(new StartGameScene());
            }, this);
        startItem.attr({
            x: this.size.width / 2,
            y: this.size.height / 2 - 100,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var menu = new cc.Menu(startItem);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu, 1);
    }
});
var GameOverScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new GameOverLayer();
        this.addChild(layer);
    }
});