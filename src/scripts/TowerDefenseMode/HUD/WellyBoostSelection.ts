import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";
import { CST } from "../../Common/CST";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin";
import { WellyBoostData } from "../WellyBoost/WellyBoostManager";

export class BoostButtonWidget extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;

    protected boostData: WellyBoostData;

    protected title: Phaser.GameObjects.Text;
    protected description: Phaser.GameObjects.Text;
    protected background: RoundRectangle;

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.width = 180;
        this.height = 400;

        this.background = scene.rexUI.add.roundRectangle(0, 0, this.width, this.height, 8, WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.WHITE));
        this.add(this.background);

        this.title = scene.add.text(0, this.background.y - this.background.displayHeight * 0.5 + 12, "BONUS 1", { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, fontSize: "26px", color: CST.STYLE.COLOR.LIGHT_BLUE, stroke: CST.STYLE.COLOR.BLUE, strokeThickness: 5, align: "center" });
        this.title.setOrigin(0.5, 0);
        this.add(this.title);

        const image = scene.add.image(0, 0, "wellyBonusTemplate");
        this.add(image);

        this.description = scene.add.text(0, this.background.y + this.background.displayHeight * 0.5 - 24, "f", { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, fontSize: "14px", color: CST.STYLE.COLOR.BLUE, strokeThickness: 0, align: "center" });
        this.description.setOrigin(0.5, 1);
        this.description.setWordWrapWidth(this.background.width)
        this.add(this.description);

        const outlinePlugin = this.scene.plugins.get('rexOutlinePipeline') as OutlinePipelinePlugin;
        const scaleNormal = 1;
        const scalePressed = 0.95;

        this.background.setInteractive();
        this.background.on(Phaser.Input.Events.POINTER_OVER, () => {
            outlinePlugin.add(this.background, { thickness: 4, outlineColor: WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.LIGHT_BLUE) });
        }, this);
        
        this.background.on(Phaser.Input.Events.POINTER_OUT, () => {
            outlinePlugin.remove(this.background);
            this.setScale(scaleNormal);
        }, this);

        this.background.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.setScale(scalePressed);
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

    public setBoostData(boostData: WellyBoostData): void
    {
        this.boostData = boostData;
        this.title.setText(boostData.name);
        this.description.setText(boostData.description);
    }

    public getBoostData(): WellyBoostData
    {
        return this.boostData;
    }
}

export class WellyBoostSelection extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;

    private boostWidgetArray: BoostButtonWidget[];

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.width = this.scene.scale.displaySize.width;
        this.height = this.scene.scale.displaySize.height;

        const background = this.scene.add.graphics();
        background.fillStyle(WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.BLACK), 0.85);
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
            const button = new BoostButtonWidget(this.scene, 0, 0);
            button.onClicked(() => { this.onBoostSelected(i); }, this);
            this.boostWidgetArray.push(button);
            buttonColumn.add(button);
        }
        
        buttonColumn.layout();
    }

    public show(boostDatArray: WellyBoostData[]): void
    {
        const newBoostCount = Math.min(boostDatArray.length, this.boostWidgetArray.length)

        for (let i = 0; i < newBoostCount; ++i)
        {
            this.boostWidgetArray[i].setBoostData(boostDatArray[i]);
            this.boostWidgetArray[i].setVisible(true);
            this.boostWidgetArray[i].setScale(1);
            this.boostWidgetArray[i].activate();
        }

        for (let i = newBoostCount; i < this.boostWidgetArray.length; ++i)
        {
            this.boostWidgetArray[i].setVisible(false);
            this.boostWidgetArray[i].disable();
        }

        this.setVisible(true);
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
                this.animateSelectedBoostWidget(this.boostWidgetArray[i]);
            }
            else
            {
                this.animateNonSelectedBoostWidget(this.boostWidgetArray[i]);
            }
        }
    }

    protected animateSelectedBoostWidget(boostButtonWidget: BoostButtonWidget): void
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

    protected animateNonSelectedBoostWidget(boostButtonWidget: BoostButtonWidget): void
    {
        this.scene.tweens.add({
            targets: boostButtonWidget,
            duration: 380,
            scale: 0
        });
    }
}