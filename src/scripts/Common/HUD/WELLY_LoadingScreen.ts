import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_BaseScene } from "../Scenes/WELLY_BaseScene";
import { WELLY_Utils } from "../../Utils/WELLY_Utils";

export class WELLY_LoadingScreen extends Phaser.GameObjects.Container
{
    public scene: WELLY_BaseScene;

    constructor(scene: Phaser.Scene)
    {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.width = WELLY_CST.GAME.WIDTH
        this.height = WELLY_CST.GAME.HEIGHT;

        const background = this.scene.add.graphics();
        background.fillStyle(WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.BEIGE), 1.0);
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

        const loadingText = this.scene.add.text(this.width * 0.5, this.height * 0.5, "LOADING", { fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, fontSize: "70px", color: WELLY_CST.STYLE.COLOR.LIGHT_BLUE, align: "right" }).setOrigin(0.5, 0.5);
        this.add(loadingText);
    }
}