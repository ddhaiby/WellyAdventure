import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";
import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_BaseScene } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_Utils } from "../../Utils/WELLY_Utils";
import { WELLY_WellyBoostData } from "./WELLY_WellyBoostManager";

export class WELLY_WellyBoostButtonWidget extends Phaser.GameObjects.Container
{
    public scene: WELLY_BaseScene;

    protected boostData: WELLY_WellyBoostData;

    protected title: Phaser.GameObjects.Text;
    protected rarityText: Phaser.GameObjects.Text;
    protected rarityBackground: RoundRectangle;
    protected description: Phaser.GameObjects.Text;
    protected background: RoundRectangle;

    constructor(scene: WELLY_BaseScene, x: number, y: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.width = 220;
        this.height = 420;

        const orange = "#FF9161";
        const blue = "0x526CC1";

        this.background = scene.rexUI.add.roundRectangle(0, 0, this.width, this.height, 12);
        this.background.setStrokeStyle(5, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.WHITE), 1);
        this.add(this.background);

        this.title = scene.add.text(0, this.background.y - this.background.displayHeight * 0.5 + 16, "BONUS 1", { fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, fontSize: "35px", color: WELLY_CST.STYLE.COLOR.LIGHT_BLUE, align: "center" });
        this.title.setWordWrapWidth(this.background.width - 20);
        this.title.setOrigin(0.5, 0);
        this.add(this.title);

        this.rarityBackground = scene.rexUI.add.roundRectangle(0, this.background.y + this.background.displayHeight * 0.5 - 100, 144, 32, 16,  WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.LIGHT_BLUE));
        this.add(this.rarityBackground);

        this.rarityText = scene.add.text(this.rarityBackground.x, this.rarityBackground.y, "COMMON", { fontFamily: WELLY_CST.STYLE.TEXT.NANUM_PEN_FONT_FAMILY, fontSize: "30px", color: WELLY_CST.STYLE.COLOR.LIGHT_BLUE, align: "center" });
        this.rarityText.setOrigin(0.5, 0.5);
        this.add(this.rarityText);

        const image = scene.add.image(0, -20, "wellyBonusTemplate");
        this.add(image);

        this.description = scene.add.text(0, this.background.y + this.background.displayHeight * 0.5 - 20, "", { fontFamily: WELLY_CST.STYLE.TEXT.MERRIWEATHER_SANS_FONT_FAMILY, fontSize: "18px", color: WELLY_CST.STYLE.COLOR.LIGHT_BLUE, align: "center" });
        this.description.setOrigin(0.5, 1);
        this.description.setWordWrapWidth(this.background.width - 12);
        this.add(this.description);

        const scaleNormal = 1;
        const scalePressed = 0.95;

        this.background.setInteractive();
        this.background.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.background.setFillStyle(WELLY_Utils.hexColorToNumber(blue), 1);
            this.background.setStrokeStyle(3, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.WHITE), 1);
            this.title.setColor(WELLY_CST.STYLE.COLOR.BEIGE)
            this.rarityBackground.setFillStyle(WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.BEIGE), 1);
            // this.rarityText.setColor(orange);
            this.description.setColor(WELLY_CST.STYLE.COLOR.BEIGE);

            this.setScale(1.2);

            this.scene.sound.play("buttonHovered", { volume: 0.01 });
        }, this);
        
        this.background.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.background.setFillStyle(WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.BEIGE), 1);
            this.background.setStrokeStyle(3, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.WHITE), 1);
            this.title.setColor(WELLY_CST.STYLE.COLOR.LIGHT_BLUE)
            this.rarityBackground.setFillStyle(WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.LIGHT_BLUE), 1);
            // this.rarityText.setColor(WELLY_CST.STYLE.COLOR.BEIGE);
            this.description.setColor(WELLY_CST.STYLE.COLOR.LIGHT_BLUE);

            this.setScale(1);            

            this.setScale(scaleNormal);
        }, this);

        this.background.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.setScale(scalePressed);
            this.scene.sound.play("buttonPressed", { volume: 0.2 });
        }, this);

        this.background.on(Phaser.Input.Events.POINTER_UP, () => {
            this.setScale(scaleNormal);
        }, this);
    }

    public select(): void
    {
        const blue = "0x526CC1";

        this.background.setFillStyle(WELLY_Utils.hexColorToNumber(blue), 1);
        this.background.setStrokeStyle(3, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.WHITE), 1);
        this.title.setColor(WELLY_CST.STYLE.COLOR.BEIGE)
        this.rarityBackground.setFillStyle(WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.BEIGE), 1);
        // this.rarityText.setColor(orange);
        this.description.setColor(WELLY_CST.STYLE.COLOR.BEIGE);
    }

    public activate(): void
    {
        this.background.setInteractive();
    }

    public disable(): void
    {
        this.background.emit(Phaser.Input.Events.POINTER_OUT);
        this.background.disableInteractive();
    }

    public onClicked(fn: Function, context?: any) : this
    {
        this.background.on(Phaser.Input.Events.POINTER_UP, () => { fn(); }, context);
        return this;
    }

    public setBoostData(boostData: WELLY_WellyBoostData): void
    {
        this.boostData = boostData;
        this.title.setText(boostData.name);
        this.description.setText(boostData.description);
        this.rarityText.setText(boostData.rarity);
        this.rarityText.setColor(WELLY_CST.STYLE.COLOR.RARITY[boostData.rarity]);
    }

    public getBoostData(): WELLY_WellyBoostData
    {
        return this.boostData;
    }
}

export class WellyBoostSelection extends Phaser.GameObjects.Container
{
    public scene: WELLY_BaseScene;

    private boostWidgetArray: WELLY_WellyBoostButtonWidget[];

    constructor(scene: WELLY_BaseScene, x: number, y: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.width = this.scene.scale.displaySize.width;
        this.height = this.scene.scale.displaySize.height;

        const background = this.scene.add.graphics();
        background.fillStyle(0x526CC1, 0.8);
        background.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);
        background.setInteractive(new Phaser.Geom.Rectangle(-this.width * 0.5, -this.height * 0.5, this.width, this.height), Phaser.Geom.Rectangle.Contains);

        this.add(background);

        const buttonColumn = this.scene.rexUI.add.sizer({
            orientation: "horizontal",
            space: { top: 0, item: 80 },
            x: 0,
            y: 0
        }).setOrigin(0.5);

        this.add(buttonColumn);

        const boostButtonCount = 3;
        this.boostWidgetArray = [];

        for (let i = 0; i < boostButtonCount; ++i)
        {
            const button = new WELLY_WellyBoostButtonWidget(this.scene, 0, 0);
            button.onClicked(() => { this.onBoostSelected(i); }, this);
            this.boostWidgetArray.push(button);
            buttonColumn.add(button);
        }
        
        buttonColumn.layout();
    }

    public show(boostDatArray: WELLY_WellyBoostData[]): void
    {
        this.setVisible(true);

        for (const boostWidget of this.boostWidgetArray)
        {
            boostWidget.setVisible(false);
            boostWidget.disable();
        }

        this.scene.time.delayedCall(200, () => {
            const newBoostCount = Math.min(boostDatArray.length, this.boostWidgetArray.length)

            for (let i = 0; i < newBoostCount; ++i)
            {
                this.boostWidgetArray[i].setBoostData(boostDatArray[i]);
                this.animateShowBoostWidget(this.boostWidgetArray[i]);
            }
        }, undefined, this);
    }

    public hide(): void
    {
        this.setVisible(false);
    }

    protected onBoostSelected(selectedIndex : number): void
    {
        for (let i = 0; i < this.boostWidgetArray.length; ++i)
        {
            this.boostWidgetArray[i].disable();

            if (i == selectedIndex)
            {
                this.animateHideSelectedBoostWidget(this.boostWidgetArray[i]);
            }
            else
            {
                this.animateHideNonSelectedBoostWidget(this.boostWidgetArray[i]);
            }
        }
    }

    protected animateShowBoostWidget(boostButtonWidget: WELLY_WellyBoostButtonWidget): void
    {
        boostButtonWidget.setScale(0);
        boostButtonWidget.setVisible(true);

        this.scene.tweens.add({
            targets: boostButtonWidget,
            duration: 250,
            scale: 1.05,
            callbackScope: this,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: boostButtonWidget,
                    duration: 250,
                    scale: 1,
                    callbackScope: this,
                    onComplete: () => {
                        boostButtonWidget.activate();
                    }
                });
            }
        });
    }

    protected animateHideSelectedBoostWidget(boostButtonWidget: WELLY_WellyBoostButtonWidget): void
    {
        boostButtonWidget.select();

        this.scene.tweens.add({
            targets: boostButtonWidget,
            duration: 120,
            scale: 1.3,
            callbackScope: this,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: boostButtonWidget,
                    duration: 120,
                    scale: 1.1,
                    callbackScope: this,
                    onComplete: () => {
                        this.scene.time.delayedCall(1100, () => {
                            this.emit("wellyBoostSelected", boostButtonWidget.getBoostData());
                            this.hide();
                        }, undefined, this);
                    }
                });
            }
        });
    }

    protected animateHideNonSelectedBoostWidget(boostButtonWidget: WELLY_WellyBoostButtonWidget): void
    {
        this.scene.tweens.add({
            targets: boostButtonWidget,
            duration: 380,
            scale: 0
        });
    }
}