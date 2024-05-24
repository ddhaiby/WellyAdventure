import Label from "phaser3-rex-plugins/templates/ui/label/Label";
import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_BaseScene, WELLY_SpeedMode } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_Utils } from "../../Utils/WELLY_Utils";
import { WELLY_TurretData } from "../Turrets/WELLY_TurretData";
import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";
import { WELLY_TextButton } from "../../Common/HUD/WELLY_TextButton";

export class WELLY_BottomMenu extends Phaser.GameObjects.Container
{
    public scene: WELLY_BaseScene;
    protected turretButtons: Label[];
    protected turretsData: WELLY_TurretData[];
    protected turretCounterTexts: Phaser.GameObjects.Text[];
    protected turretPriceTexts: Phaser.GameObjects.Text[];

    protected audioButton: WELLY_TextButton;
    protected gameSpeedButton: WELLY_TextButton;

    constructor(scene: WELLY_BaseScene, x: number, y: number, width: number, height: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);
        this.width = width;
        this.height = height;

        const background = this.scene.add.rectangle(0, 0, this.width, this.height, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.LIGHT_BLUE), 1);
        this.add(background);

        const topBackground = this.scene.add.rectangle(0, -this.height * 0.5, this.width, 10, 0x526CC1, 1);
        topBackground.setOrigin(0.5, 0)
        this.add(topBackground);

        this.createLeftButtons();
        this.createTurretButtons();
    }

    protected createLeftButtons(): void
    {
        const leftBackground = this.scene.rexUI.add.roundRectangle(-this.width * 0.5 + 74, 2, 160, 72, 36, 0xE9EFFF, 0.1);
        leftBackground.setOrigin(0, 0.5);
        this.add(leftBackground);

        this.audioButton =  new WELLY_TextButton(this.scene, leftBackground.x + 44, leftBackground.y, "", {
            textureNormal: "audioOnButtonNormal",
            texturePressed: "audioOnButtonPressed"
        });
        this.audioButton.onClicked(() => { this.onAudioButtonClicked(); } , this);
        this.add(this.audioButton);

        this.gameSpeedButton =  new WELLY_TextButton(this.scene, this.audioButton.x + this.audioButton.width + 16, leftBackground.y, "", {
            textureNormal: "gameSpeedX1ButtonNormal",
            texturePressed: "gameSpeedX1ButtonPressed"
        });
        this.gameSpeedButton.onClicked(() => { this.onGameSpeedButtonClicked(); } , this);
        this.add(this.gameSpeedButton);
    }

    protected createTurretButtons(): void
    {
        const turretButtonList = this.scene.rexUI.add.sizer({
            orientation: "left-to-right",
            space: { item: 20 },
            x: 0,
            y: -this.height * 0.5 + 22
        }).setOrigin(0.5, 0);

        this.turretButtons = [];
        this.turretCounterTexts = [];
        this.turretPriceTexts = [];

        this.turretsData = this.scene.cache.json.get("turretsData");

        for (const turretData of this.turretsData)
        {
            const turretContainer = this.scene.add.container();
            turretContainer.width = 68;
            turretContainer.height = turretContainer.width;

            const buttonBackground = this.scene.rexUI.add.roundRectangle(0, 0, turretContainer.width, turretContainer.height, 10, 0xE9EFFF, 1);
            buttonBackground.setStrokeStyle(5, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.WHITE));

            const turretButton = this.scene.rexUI.add.label({
                background: buttonBackground,
                icon: this.scene.add.image(0, 0, turretData.gameStatsPerLevel[0].texture, turretData.gameStatsPerLevel[0].framePerAnim * 7),
                space: { left: 0, right: 0, top: 0, bottom: 0, icon: 0 }
            });
            turretButton.setInteractive(new Phaser.Geom.Rectangle(-turretContainer.width * 0.5, -turretContainer.height * 0.5, turretContainer.width, turretContainer.height), Phaser.Geom.Rectangle.Contains);
            this.scene.input.setDraggable(turretButton);
            turretButton.on(Phaser.Input.Events.POINTER_DOWN, () => { this.scene.sound.play("buttonPressed", { volume: 0.02 }); }, this);
            this.turretButtons.push(turretButton);
            turretContainer.add(turretButton);

            const turretCounterText = this.scene.add.text(turretContainer.width * 0.5 - 4, turretContainer.height * 0.5 - 4, `x${turretData.maxInstances}`, { fontSize: "16px", color: WELLY_CST.STYLE.COLOR.BLUE, fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY });
            turretCounterText.setOrigin(1,1);
            turretContainer.add(turretCounterText);
            this.turretCounterTexts.push(turretCounterText);

            const priceWidget = this.scene.rexUI.add.sizer({ height: 24, orientation: "left-to-right", space: {item: 4} });
            priceWidget.add(this.scene.add.image(0, 0, "coinSmallIcon"));
            const priceText = this.scene.add.text(0, 0, turretData.gameStatsPerLevel[0].price.toString(), { fontSize: "18px", color: WELLY_CST.STYLE.COLOR.YELLOW, fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY });
            priceWidget.add(priceText);
            this.turretPriceTexts.push(priceText);

            const previewWidget = this.scene.rexUI.add.sizer({ orientation: "top-to-bottom", space: {item: 4} });
            previewWidget.add(turretContainer);
            previewWidget.add(priceWidget);

            turretButtonList.add(previewWidget);
        }
        this.add(turretButtonList);
        turretButtonList.layout();
    }

    public getTurretButtons(): Label[]
    {
        return this.turretButtons;
    }

    public updateButtons(turretId: string, turretRemainInstances: number): void
    {
        const index = this.turretsData.findIndex((value: WELLY_TurretData) => { return value.id == turretId }, this);
        if ((index != undefined) && (index >= 0) && (index < this.turretCounterTexts.length))
        {
            this.turretCounterTexts[index].setText(`x${Math.max(0, turretRemainInstances)}`);

            if (turretRemainInstances <= 0)
            {
                const tint = 0x555555;
                const background = this.turretButtons[index].getElement("background") as RoundRectangle;
                const icon = this.turretButtons[index].getElement("icon") as Phaser.GameObjects.Image;
                const priceText = this.turretPriceTexts[index];

                background.setFillStyle(tint);
                icon.setTint(tint);
                priceText.setTint(tint);
            }
        }
    }

    protected onAudioButtonClicked(): void
    {
        this.scene.sound.setMute(!this.scene.sound.mute);

        const normalTexture = this.scene.sound.mute ? "audioOffButtonNormal" : "audioOnButtonNormal";
        const pressedTexture = this.scene.sound.mute ? "audioOffButtonPressed": "audioOnButtonPressed";

        this.audioButton.setTextures(normalTexture, pressedTexture);
    }

    protected onGameSpeedButtonClicked(): void
    {
        this.emit("gameSpeedButtonClicked");
    }

    public updateGameSpeed(speedMode: WELLY_SpeedMode): void
    {
        switch(speedMode)
        {
            case WELLY_SpeedMode.SLOW: this.gameSpeedButton.setTextures(`gameSpeedX${1}ButtonNormal`, `gameSpeedX${1}ButtonPressed`); break;
            case WELLY_SpeedMode.NORMAL: this.gameSpeedButton.setTextures(`gameSpeedX${2}ButtonNormal`, `gameSpeedX${2}ButtonPressed`); break;
            case WELLY_SpeedMode.FAST: this.gameSpeedButton.setTextures(`gameSpeedX${3}ButtonNormal`, `gameSpeedX${3}ButtonPressed`); break;
            default: console.error("WELLY_BottomMenu::updateGameSpeed - Invalid speed mode"); break;   
        }
    }
}