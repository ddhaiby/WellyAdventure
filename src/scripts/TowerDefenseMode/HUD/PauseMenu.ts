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

        const buttonColumn = this.scene.rexUI.add.sizer({
            orientation: "top-to-bottom",
            space: { top: 0, item: 40 },
            x: this.width * 0.5,
            y: this.height * 0.5
        }).setOrigin(0.5);

        this.add(buttonColumn);
        buttonColumn.add(buttonResume);
        buttonColumn.add(buttonRestart);
        buttonColumn.layout();
    }

    private updateButtonsAlignment() : void
    {
        // const buttons = [this.buttonResume, this.buttonRestart, this.buttonMainMenu];
        // const visibleButtons = [];

        // for (let button of buttons)
        // {
        //     if (button.visible)
        //         visibleButtons.push(button);
        // }

        // const spacing = 36;
        // const totalHeight = visibleButtons[0].height * visibleButtons.length + spacing * (visibleButtons.length - 1);
        // this.centerItem(visibleButtons[0], 0, (visibleButtons[0].height -totalHeight) * 0.5);

        // for (let i = 1; i < visibleButtons.length; ++i)
        //     Phaser.Display.Align.To.BottomCenter(visibleButtons[i], visibleButtons[0], 0, spacing * i + visibleButtons[0].height * (i - 1));
    }

    private onResumeClicked() : void
    {
        console.log("Resume");
        this.setVisible(false);
    }

    private onRestartClicked() : void
    {
        console.log("Restart");
        this.setVisible(false);
    }
}