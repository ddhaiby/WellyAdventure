import { CST } from "../../Common/CST";
import { GPC_TextButtonStyle, WELLY_TextButton } from "../../Common/HUD/WELLY_TextButton";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";

export class PauseMenu extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.width = this.scene.scale.displaySize.width;
        this.height = this.scene.scale.displaySize.height;

        const background = scene.add.graphics();
        background.fillStyle(WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.BLACK), 0.85);
        background.fillRect(0, 0, this.width, this.height);
        background.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);

        this.add(background);

        this.createMainButtons();
        this.createTopRightCornerButtons();
    }

    protected createMainButtons(): void
    {
        const buttonStyle = {
            fontSize : "54px",
            textColorNormal: CST.STYLE.COLOR.ORANGE,
            textColorHovered: CST.STYLE.COLOR.WHITE,
            textColorPressed: CST.STYLE.COLOR.GREY,
            textStrokeThickness : 6,
            textStroke: CST.STYLE.COLOR.BLACK,
            pixelPerfect: false,
            textOffsetNormalY: 0,
            textOffsetHoveredY: -1,
            textOffsetPressedY: 3
        } as GPC_TextButtonStyle ;
        
        const buttonResume =  new WELLY_TextButton(this.scene, 0, 0, "RESUME", buttonStyle);
        buttonResume.setTextures("");
        buttonResume.onClicked(() => { this.onResumeClicked(); } , this);
        this.add(buttonResume);

        const buttonRestart =  new WELLY_TextButton(this.scene, 0, 0, "RESTART", buttonStyle);
        buttonRestart.setTextures("");
        buttonRestart.onClicked(() => { this.onRestartClicked(); } , this);
        this.add(buttonRestart);

        const buttonMainMenu =  new WELLY_TextButton(this.scene, 0, 0, "MAIN MENU", buttonStyle);
        buttonMainMenu.setTextures("");
        buttonMainMenu.onClicked(() => { this.onMainMenuClicked(); } , this);
        this.add(buttonMainMenu);

        const mainButtons = this.scene.rexUI.add.sizer({
            orientation: "top-to-bottom",
            space: { top: 0, item: 40 },
            x: this.width * 0.5,
            y: this.height * 0.5
        }).setOrigin(0.5);

        this.add(mainButtons);
        mainButtons.add(buttonResume);
        mainButtons.add(buttonRestart);
        mainButtons.add(buttonMainMenu);
        mainButtons.layout();
    }

    protected createTopRightCornerButtons(): void
    {
        const buttonStyle = {
            pixelPerfect: false,
            textOffsetNormalY: 0,
            textOffsetHoveredY: -1,
            textOffsetPressedY: 3,
            tintNormal: WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.ORANGE),
            tintHovered: WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.WHITE),
            tintPressed: WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.GREY)
        } as GPC_TextButtonStyle ;

        const topRightButtons = this.scene.rexUI.add.sizer({
            orientation: "left-to-right",
            space: { top: 0, item: 12 },
            x: this.width - 12,
            y: 12
        }).setOrigin(1, 0);

        const buttonMusic =  new WELLY_TextButton(this.scene, 0, 0, "", buttonStyle);
        buttonMusic.setTextures("musicIcon");

        // Temporary until we get sounds for real
        let isMusicOn = true;
        buttonMusic.onClicked(() => {
            isMusicOn = !isMusicOn;
            buttonMusic.setTextures(isMusicOn ? "musicIcon" : "musicIconOff");
            this.onMusicClicked();
        } , this);
        this.add(buttonMusic);

        // Temporary until we get sounds for real
        let isSoundOn = true;
        const buttonSound =  new WELLY_TextButton(this.scene, 0, 0, "", buttonStyle);
        buttonSound.setTextures("soundIcon");
        buttonSound.onClicked(() => {
            isSoundOn = !isSoundOn;
            buttonSound.setTextures(isSoundOn ? "soundIcon" : "soundIconOff");
            this.onSoundClicked();
        } , this);
        this.add(buttonSound);

        this.add(topRightButtons);
        topRightButtons.add(buttonMusic);
        topRightButtons.add(buttonSound);
        topRightButtons.layout();
    }

    private onResumeClicked() : void
    {
        this.emit("requestResume")
    }

    private onRestartClicked() : void
    {
        this.emit("requestRestart");
    }

    private onMainMenuClicked() : void
    {
        this.emit("requestMainMenu");
    }

    private onMusicClicked() : void
    {
        this.emit("toggleMusic");
    }

    private onSoundClicked() : void
    {
        this.emit("toggleSound");
    }
}