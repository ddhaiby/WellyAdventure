import Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import { CST } from "../../Common/CST";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";
import { GPC_TextButtonStyle, WELLY_TextButton } from "../../Common/HUD/WELLY_TextButton";

export class EndRunWidget extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;

    protected title: Phaser.GameObjects.Text;

    protected mainButtons: Sizer;

    constructor(scene: Welly_Scene, x?: number | undefined, y?: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.width = this.scene.scale.displaySize.width;
        this.height = this.scene.scale.displaySize.height;

        const background = scene.add.graphics();
        background.fillStyle(WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.BLACK), 0.85);
        background.fillRect(-this.width * 0.5, -this.height * 0.5, this.width * 2, this.height * 2);
        background.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        this.add(background);
        
        this.title = this.scene.add.text(this.width * 0.5, 100, "WELLY PLAYED", { fontSize : "80px", color: CST.STYLE.COLOR.WHITE, fontStyle: "bold", strokeThickness: 2, stroke: "black" }).setOrigin(0.5);
        this.add(this.title);

        this.createMainButtons();
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

        const buttonRestart =  new WELLY_TextButton(this.scene, 0, 0, "RESTART", buttonStyle);
        buttonRestart.setTextures("");
        buttonRestart.onClicked(() => { this.onRestartClicked(); } , this);
        this.add(buttonRestart);

        const buttonMainMenu =  new WELLY_TextButton(this.scene, 0, 0, "MAIN MENU", buttonStyle);
        buttonMainMenu.setTextures("");
        buttonMainMenu.onClicked(() => { this.onRestartClicked(); } , this);
        this.add(buttonMainMenu);

        this.mainButtons = this.scene.rexUI.add.sizer({
            orientation: "top-to-bottom",
            space: { top: 0, item: 40 },
            x: this.width * 0.5,
            y: this.height * 0.5
        }).setOrigin(0.5);

        this.add(this.mainButtons);
        this.mainButtons.add(buttonRestart);
        this.mainButtons.add(buttonMainMenu);
        this.mainButtons.layout();
    }

    public show(): void
    {
        this.mainButtons.setVisible(false);

        this.title.setScale(0);
        
        this.scene.tweens.add({
            targets: this.title,
            scale: 1,
            angle: 360,
            duration: 400,
            delay: 600,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.title,
                    scale: 1.3,
                    duration: 150,
                    yoyo: true
                });

                this.scene.time.delayedCall(800, () => {
                    this.mainButtons.setVisible(true);
                }, undefined, this);
            },
            callbackScope: this
        });
        this.setVisible(true);
    }

    private onRestartClicked() : void
    {
        this.emit("requestRestart");
    }
}