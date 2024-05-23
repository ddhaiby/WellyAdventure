import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";
import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_BaseScene } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_Utils } from "../../Utils/WELLY_Utils";
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin";
import { WELLY_WellyBoostData } from "./WELLY_WellyBoostManager";

export class WELLY_WellyBoostButtonWidget extends Phaser.GameObjects.Container
{
    public scene: WELLY_BaseScene;

    protected boostData: WELLY_WellyBoostData;

    protected title: Phaser.GameObjects.Text;
    protected rarityText: Phaser.GameObjects.Text;
    protected description: Phaser.GameObjects.Text;
    protected background: RoundRectangle;

    constructor(scene: WELLY_BaseScene, x: number, y: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.width = 180;
        this.height = 400;

        this.background = scene.rexUI.add.roundRectangle(0, 0, this.width, this.height, 8, WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.WHITE));
        this.add(this.background);

        this.title = scene.add.text(0, this.background.y - this.background.displayHeight * 0.5 + 12, "BONUS 1", { fontFamily: WELLY_CST.STYLE.TEXT.FONT_FAMILY, fontSize: "26px", color: WELLY_CST.STYLE.COLOR.LIGHT_BLUE, stroke: WELLY_CST.STYLE.COLOR.BLUE, strokeThickness: 5, align: "center" });
        this.title.setOrigin(0.5, 0);
        this.add(this.title);

        this.rarityText = scene.add.text(0, this.title.y + this.title.displayHeight + 12, "COMMON", { fontFamily: WELLY_CST.STYLE.TEXT.FONT_FAMILY, fontSize: "15px", color: WELLY_CST.STYLE.COLOR.LIGHT_BLUE, stroke: WELLY_CST.STYLE.COLOR.BLACK, strokeThickness: 3, align: "center" });
        this.rarityText.setOrigin(0.5, 0);
        this.add(this.rarityText);

        const image = scene.add.image(0, 0, "wellyBonusTemplate");
        this.add(image);

        this.description = scene.add.text(0, this.background.y + this.background.displayHeight * 0.5 - 24, "f", { fontFamily: WELLY_CST.STYLE.TEXT.FONT_FAMILY, fontSize: "14px", color: WELLY_CST.STYLE.COLOR.BLUE, strokeThickness: 0, align: "center" });
        this.description.setOrigin(0.5, 1);
        this.description.setWordWrapWidth(this.background.width)
        this.add(this.description);

        const scaleNormal = 1;
        const scalePressed = 0.95;

        this.background.setInteractive();
        this.background.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.scene.rexOutlinePipelinePlugin.add(this.background, { thickness: 4, outlineColor: WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.LIGHT_BLUE) });
            this.scene.sound.play("buttonHovered", { volume: 0.01 });
        }, this);
        
        this.background.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.scene.rexOutlinePipelinePlugin.remove(this.background);
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
        background.fillStyle(WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.BLACK), 0.85);
        background.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);
        background.setInteractive(new Phaser.Geom.Rectangle(-this.width * 0.5, -this.height * 0.5, this.width, this.height), Phaser.Geom.Rectangle.Contains);

        this.add(background);

        const buttonColumn = this.scene.rexUI.add.sizer({
            orientation: "horizontal",
            space: { top: 0, item: 100 },
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