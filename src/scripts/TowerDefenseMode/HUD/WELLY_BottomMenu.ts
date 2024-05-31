import Label from "phaser3-rex-plugins/templates/ui/label/Label";
import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_BaseScene, WELLY_SpeedMode } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_Utils } from "../../Utils/WELLY_Utils";
import { WELLY_TurretData } from "../Turrets/WELLY_TurretData";
import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";
import { WELLY_TextButton } from "../../Common/HUD/WELLY_TextButton";
import { WELLY_WellyPowerData } from "../WellyPower/WELLY_WellyPower";

export class WELLY_BottomMenu extends Phaser.GameObjects.Container
{
    public scene: WELLY_BaseScene;

    // Turrets
    protected turretButtons: Label[];
    protected turretsData: WELLY_TurretData[];
    protected turretCounterTexts: Phaser.GameObjects.Text[];
    protected turretPriceTexts: Phaser.GameObjects.Text[];

    // Powers
    protected powerButtons: Map<string, Label>;
    protected powerCooldownText: Map<string, Phaser.GameObjects.Text>;
    protected powersData: WELLY_WellyPowerData[];

    // Options
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
        this.createWellyPowerButtons();
    }

    protected createLeftButtons(): void
    {
        const leftBackground = this.scene.rexUI.add.roundRectangle(-this.width * 0.5 + 74, 2, 160, 72, 36, 0xE9EFFF, 0.1);
        leftBackground.setOrigin(0, 0.5);
        this.add(leftBackground);

        const normalTexture = this.scene.sound.mute ? "audioOffButtonNormal" : "audioOnButtonNormal";
        const pressedTexture = this.scene.sound.mute ? "audioOffButtonPressed": "audioOnButtonPressed";

        this.audioButton =  new WELLY_TextButton(this.scene, leftBackground.x + 44, leftBackground.y, "", {
            textureNormal: normalTexture,
            texturePressed: pressedTexture
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

    protected createWellyPowerButtons(): void
    {
        const powerButtonList = this.scene.rexUI.add.sizer({
            orientation: "left-to-right",
            space: { item: 20 },
            x: this.width * 0.5 - 20,
            y: 4
        }).setOrigin(1, 0.5);

        this.powerButtons = new Map<string, Label>();
        this.powerCooldownText = new Map<string, Phaser.GameObjects.Text>();
        this.powersData = this.scene.cache.json.get("wellyPowerData");

        for (const powerData of this.powersData)
        {
            const powerId = powerData.id;
            const powerContainer = this.scene.add.container();
            powerContainer.width = 88;
            powerContainer.height = powerContainer.width;

            const buttonBackground = this.scene.rexUI.add.roundRectangle(0, 0, powerContainer.width, powerContainer.height, 10, 0xE9EFFF, 1);
            buttonBackground.setStrokeStyle(5, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.WHITE));

            const powerButton = this.scene.rexUI.add.label({
                background: buttonBackground,
                icon: this.scene.add.image(0, 0, powerData.image),
                text: this.scene.add.text(0,0, "16", { fontSize: "39px", fontFamily: WELLY_CST.STYLE.TEXT.MERRIWEATHER_SANS_FONT_FAMILY, color: WELLY_CST.STYLE.COLOR.LIGHT_BLUE }).setOrigin(0.5).setVisible(false),
                space: { left: 0, right: 0, top: 0, bottom: 0, icon: 0 }
            });
            powerButton.setInteractive(new Phaser.Geom.Rectangle(-powerContainer.width * 0.5, -powerContainer.height * 0.5, powerContainer.width, powerContainer.height), Phaser.Geom.Rectangle.Contains);
            
            if (powerData.shouldAim)
            {
                this.scene.input.setDraggable(powerButton);

                powerButton.on(Phaser.Input.Events.DRAG_START, (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                    this.scene.sound.play("buttonPressed", { volume: 0.02 });
                    this.emit("startDragPower", powerId);
                }, this);

                powerButton.on(Phaser.Input.Events.DRAG, (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                    this.emit("dragPower", powerId);
                }, this);

                powerButton.on(Phaser.Input.Events.DRAG_END, (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                    this.emit("endDragPower", powerId);
                }, this);
            }
            else
            {
                powerButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
                    this.scene.sound.play("buttonPressed", { volume: 0.02 });
                    this.emit("powerRequested", powerId);
                }, this);
            }
            
            this.powerButtons.set(powerId, powerButton);
            powerContainer.add(powerButton);

            powerButtonList.add(powerContainer);
        }
        this.add(powerButtonList);
        powerButtonList.layout();
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
                background.setStrokeStyle(background.lineWidth, tint);
                icon.setTint(tint);
                priceText.setTint(tint);
            }
        }
    }

    public onPowerCooldownStart(powerId: string, cooldown: number): void
    {
        const powerButton = this.powerButtons.get(powerId);
        if (powerButton)
        {
            const tint = 0x555555;
            const background = powerButton.getElement("background") as RoundRectangle;
            const icon = powerButton.getElement("icon") as Phaser.GameObjects.Image;
            const cooldownText = powerButton.getElement("text") as Phaser.GameObjects.Text;

            background.setFillStyle(tint);
            background.setStrokeStyle(background.lineWidth, tint);
            icon.setTint(tint);
            cooldownText.setVisible(true);
            
            this.scene.time.delayedCall(cooldown, this.onPowerCooldownEnd, [powerId], this);
            this.scene.tweens.addCounter({
                from: cooldown,
                to: 0,
                ease: 'Linear',
                duration: cooldown,
                repeat: 0,
                yoyo: false,
                onUpdate(tween, targets, key, current: number, previous, param) {
                    cooldownText.setText(`${Math.ceil(current / 1000)}`);
                }
            });
        }
    }

    public onPowerCooldownEnd(powerId: string): void
    {
        const powerButton = this.powerButtons.get(powerId);
        if (powerButton)
        {
            const background = powerButton.getElement("background") as RoundRectangle;
            const icon = powerButton.getElement("icon") as Phaser.GameObjects.Image;
            const cooldownText = powerButton.getElement("text") as Phaser.GameObjects.Text;

            background.setFillStyle(0xE9EFFF);
            background.setStrokeStyle(background.lineWidth, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.WHITE));
            icon.clearTint();
            cooldownText.setVisible(false);
        }
    }

    protected onAudioButtonClicked(): void
    {
        (this.scene.sound as Phaser.Sound.HTML5AudioSoundManager | Phaser.Sound.WebAudioSoundManager).setMute(!this.scene.sound.mute);

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