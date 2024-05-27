import { WELLY_CST } from "../../WELLY_CST";
import { GPC_TextButtonStyle, WELLY_TextButton } from "../../Common/HUD/WELLY_TextButton";
import { WELLY_BaseScene } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_Utils } from "../../Utils/WELLY_Utils";
import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";
import { WELLY_Slider, WELLY_SliderOrientation } from "./WELLY_Slider";

export class WELLY_PauseMenu extends Phaser.GameObjects.Container
{
    public scene: WELLY_BaseScene;

    protected menuBackground: RoundRectangle;
    protected title: Phaser.GameObjects.Text;

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

        this.title = scene.add.text(this.width * 0.5, this.menuBackground.y - this.menuBackground.height * 0.5 + 28, "PAUSED", { fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, fontSize: "46px", color: WELLY_CST.STYLE.COLOR.LIGHT_BLUE, align: "center" });
        this.title.setOrigin(0.5, 0);
        this.add(this.title);
        
        this.createAudioOptions();
        this.createBottomButtons();
    }

    protected createAudioOptions(): void
    {
        const titleMusic = this.scene.add.text(
            Math.floor(this.width * 0.5 - this.menuBackground.width * 0.5 + this.menuBackground.width * 0.333) - 4,
            this.title.y + this.title.height + 20,
            "MUSIC", 
            { fontFamily: WELLY_CST.STYLE.TEXT.MERRIWEATHER_SANS_FONT_FAMILY, fontSize: "22px", color: WELLY_CST.STYLE.COLOR.LIGHT_BLUE, align: "center" }
        );
        titleMusic.setOrigin(0.5, 0);
        this.add(titleMusic);
        
        const sliderMusic = new WELLY_Slider(this.scene, titleMusic.x, titleMusic.y + titleMusic.height + 20, {
            width: 24, height: 170,
            minValue: 0, maxValue: 100, value: 80, step: 1,
            trackThickness: 12,
            thumbWidth: 16, thumbHeight: 16, thumbRadius: 12,
            thumbColorNormal: WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.LIGHT_BLUE),
            thumbColorPressed: WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.BLUE),
            backTrackColorNormal: 0xD17352,
            backTrackColorPressed: 0x526CC,
            frontTrackColorNormal: 0xC7B6B6,
            frontTrackColorPressed: 0x526CC,
            orientation: WELLY_SliderOrientation.BOTTOM_TO_TOP
        });
        this.add(sliderMusic);

        const titleEffects = this.scene.add.text(
            Math.floor(this.width * 0.5 - this.menuBackground.width * 0.5 + this.menuBackground.width * 0.666) + 4,
            titleMusic.y,
            "EFFECTS",
            { fontFamily: WELLY_CST.STYLE.TEXT.MERRIWEATHER_SANS_FONT_FAMILY, fontSize: "22px", color: WELLY_CST.STYLE.COLOR.LIGHT_BLUE, align: "center" }
        );
        titleEffects.setOrigin(0.5, 0);
        this.add(titleEffects);

        const sliderEffects = new WELLY_Slider(this.scene, titleEffects.x, sliderMusic.y, {
            width: 24, height: 170,
            minValue: 0, maxValue: 100, value: 30, step: 1,
            trackThickness: 12,
            thumbWidth: 16, thumbHeight: 16, thumbRadius: 12,
            thumbColorNormal: WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.LIGHT_BLUE),
            thumbColorPressed: WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.BLUE),
            backTrackColorNormal: 0xD17352,
            backTrackColorPressed: 0x526CC,
            frontTrackColorNormal: 0xC7B6B6,
            frontTrackColorPressed: 0x526CC,
            orientation: WELLY_SliderOrientation.BOTTOM_TO_TOP
        });
        this.add(sliderEffects);
    }

    protected createBottomButtons(): void
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