import { CST } from "../CST";
import { Welly_Scene } from "../Scenes/WELLY_Scene";
import { WELLY_Utils } from "../Utils/WELLY_Utils";

export class LoadingScreen extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;

    constructor(scene: Phaser.Scene)
    {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.setDepth(99999);
        this.width = this.scene.scale.displaySize.width;
        this.height = this.scene.scale.displaySize.height;

        const background = this.scene.add.graphics();
        background.fillStyle(WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.WHITE), 1.0);
        background.fillRect(0, 0, this.width, this.height);
        background.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        this.add(background);

        const loadingSprite = this.scene.add.sprite(this.width - 8, this.height, "loadingSpriteSheet");
        loadingSprite.setOrigin(1, 1);
        loadingSprite.anims.create({
            key: "Loading",
            frames: loadingSprite.anims.generateFrameNumbers("loadingSpriteSheet", { start: 0, end: 121 }),
            frameRate: 24,
            repeat: -1
        });
        loadingSprite.play("Loading", true);
        this.add(loadingSprite);

        const loadingText = this.scene.add.text(this.width * 0.5, this.height * 0.5, "LOADING", { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, fontSize: "70px", color: CST.STYLE.COLOR.LIGHT_BLUE, stroke: CST.STYLE.COLOR.BLUE, strokeThickness: 5, align: "right" }).setOrigin(0.5, 0.5);
        this.add(loadingText);
    }
}