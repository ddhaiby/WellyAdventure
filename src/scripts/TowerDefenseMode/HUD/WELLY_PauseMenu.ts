import { WELLY_CST } from "../../WELLY_CST";
import { GPC_TextButtonStyle, WELLY_TextButton } from "../../Common/HUD/WELLY_TextButton";
import { WELLY_BaseScene } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_Utils } from "../../Utils/WELLY_Utils";
import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";

export class WELLY_PauseMenu extends Phaser.GameObjects.Container
{
    public scene: WELLY_BaseScene;

    protected menuBackground: RoundRectangle;

    constructor(scene: WELLY_BaseScene, x: number, y: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.width = WELLY_CST.GAME.WIDTH;
        this.height = WELLY_CST.GAME.HEIGHT;

        const background = scene.add.graphics();
        background.fillStyle(0x526CC1, 0.8);
        background.fillRect(0, 0, this.width, this.height);
        background.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        this.add(background);

        this.menuBackground = scene.rexUI.add.roundRectangle(this.width * 0.5, this.height * 0.5, 300, 420, 12);
        this.menuBackground.setFillStyle(WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.BEIGE), 1);
        this.menuBackground.setStrokeStyle(5, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.WHITE), 1);
        this.add(this.menuBackground);

        const title = scene.add.text(this.width * 0.5, this.menuBackground.y - this.menuBackground.height * 0.5 + 28, "PAUSED", { fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, fontSize: "46px", color: WELLY_CST.STYLE.COLOR.LIGHT_BLUE, align: "center" });
        title.setOrigin(0.5, 0);
        this.add(title);

        this.createButtons();
    }

    protected createButtons(): void
    {
        const buttonHome =  new WELLY_TextButton(this.scene, 0, 0, "", {
            textureNormal: "homeButtonNormal",
            texturePressed: "homeButtonPressed"
        });
        buttonHome.onClicked(() => { this.onHomeClicked(); } , this);
        this.add(buttonHome);

        const buttonRestart =  new WELLY_TextButton(this.scene, 0, 0, "", {
            textureNormal: "restartButtonNormal",
            texturePressed: "restartButtonPressed"
        });
        buttonRestart.onClicked(() => { this.onRestartClicked(); } , this);
        this.add(buttonRestart);

        const buttonResume =  new WELLY_TextButton(this.scene, 0, 0, "", {
            textureNormal: "playButtonNormal",
            texturePressed: "playButtonPressed"
        });
        buttonResume.onClicked(() => { this.onResumeClicked(); } , this);
        this.add(buttonResume);

        const mainButtons = this.scene.rexUI.add.sizer({
            orientation: "left-to-right",
            space: { top: 0, item: 20 },
            x: this.width * 0.5,
            y: this.menuBackground.y + this.menuBackground.height * 0.5 - 18
        }).setOrigin(0.5, 1);

        this.add(mainButtons);
        mainButtons.add(buttonHome);
        mainButtons.add(buttonRestart);
        mainButtons.add(buttonResume);
        mainButtons.layout();
    }

    private onResumeClicked() : void
    {
        this.emit("requestResume")
    }

    private onRestartClicked() : void
    {
        this.emit("requestRestart");
    }

    private onHomeClicked() : void
    {
        this.emit("requestMainMenu");
    }
}