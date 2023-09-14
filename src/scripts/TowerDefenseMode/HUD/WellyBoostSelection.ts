import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";
import { CST } from "../../Common/CST";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin";

export class BoostButtonWidget extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;

    protected title: Phaser.GameObjects.Text;
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

    public onClicked(fn: Function, context?: any) : this
    {
        this.background.on(Phaser.Input.Events.POINTER_UP, () => { fn(); }, context);
        return this;
    }

    public setBoostData(boostId: string): void
    {
        this.title.setText(boostId);
    }
}

export class WellyBoostSelection extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;

    private boostWidget1: BoostButtonWidget;
    private boostWidget2: BoostButtonWidget;
    private boostWidget3: BoostButtonWidget;

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

        this.boostWidget1 = new BoostButtonWidget(this.scene, 0, 0);
        this.boostWidget1.onClicked(() => { this.onBoostSelected(); }, this);

        this.boostWidget2 = new BoostButtonWidget(this.scene, 0, 0);
        this.boostWidget2.onClicked(() => { this.onBoostSelected(); }, this);

        this.boostWidget3 = new BoostButtonWidget(this.scene, 0, 0);
        this.boostWidget3.onClicked(() => { this.onBoostSelected(); }, this);

        const buttonColumn = this.scene.rexUI.add.sizer({
            orientation: "horizontal",
            space: { top: 0, item: 100 },
            x: 0,
            y: 0
        }).setOrigin(0.5);

        this.add(buttonColumn);
        buttonColumn.add(this.boostWidget1);
        buttonColumn.add(this.boostWidget2);
        buttonColumn.add(this.boostWidget3);
        buttonColumn.layout();
    }

    public show(boostIds: string[]): void
    {
        if (boostIds.length < 3)
        {
            return;
        }

        this.boostWidget1.setBoostData(boostIds[0]);
        this.boostWidget2.setBoostData(boostIds[1]);
        this.boostWidget3.setBoostData(boostIds[2]);

        this.setVisible(true);
    }

    public hide(): void
    {
        this.setVisible(false);
    }

    protected onBoostSelected(): void
    {
        this.emit("wellyBoostSelected");
        this.setVisible(false);
    }
}