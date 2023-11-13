import Label from "phaser3-rex-plugins/templates/ui/label/Label";
import { CST } from "../../Common/CST";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";
import { TurretData } from "../Turrets/TurretData";
import { Turret } from "../Characters/Npcs/Turrets/Turret";
import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";

export class BottomMenu extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;
    protected turretButtons: Label[];
    protected turretsData: TurretData[];
    protected turretCounterTexts: Phaser.GameObjects.Text[];
    protected turretPriceTexts: Phaser.GameObjects.Text[];

    constructor(scene: Welly_Scene, x: number, y: number, width: number, height: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);
        this.width = width;
        this.height = height;

        const background = this.scene.add.rectangle(0, 0, this.width, this.height, WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.WHITE), 1);
        this.add(background);
        this.initTurretButtonList();
    }

    protected initTurretButtonList(): void
    {
        const turretButtonList = this.scene.rexUI.add.sizer({
            orientation: "left-to-right",
            space: { item: 12 },
            x: 0,
            y: -this.height * 0.5 + 12
        }).setOrigin(0.5, 0);

        this.turretButtons = [];
        this.turretCounterTexts = [];
        this.turretPriceTexts = [];

        this.turretsData = this.scene.cache.json.get("turretsData");

        for (const turretData of this.turretsData)
        {
            const turretContainer = this.scene.add.container();
            turretContainer.width = 64;
            turretContainer.height = turretContainer.width;

            const turretButton = this.scene.rexUI.add.label({
                background: this.scene.rexUI.add.roundRectangle(0, 0, turretContainer.width, turretContainer.height, 10, WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.LIGHT_BLUE), WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.BLUE)),
                icon: this.scene.add.image(0, 0, turretData.gameStatsPerLevel[0].texture),
                space: { left: 0, right: 0, top: 0, bottom: 0, icon: 0 }
            });
            turretButton.setInteractive(new Phaser.Geom.Rectangle(-turretContainer.width * 0.5, -turretContainer.height * 0.5, turretContainer.width, turretContainer.height), Phaser.Geom.Rectangle.Contains);
            this.scene.input.setDraggable(turretButton);
            turretButton.on(Phaser.Input.Events.POINTER_DOWN, () => { this.scene.sound.play("buttonPressed", { volume: 0.02 }); }, this);
            this.turretButtons.push(turretButton);
            turretContainer.add(turretButton);

            const turretCounterText = this.scene.add.text(turretContainer.width * 0.5 - 4, turretContainer.height * 0.5 - 4, `x${turretData.maxInstances}`, { fontSize: "16px", color: CST.STYLE.COLOR.BLUE, fontFamily: CST.STYLE.TEXT.FONT_FAMILY });
            turretCounterText.setOrigin(1,1);
            turretContainer.add(turretCounterText);
            this.turretCounterTexts.push(turretCounterText);

            const priceWidget = this.scene.rexUI.add.sizer({ height: 24, orientation: "left-to-right" });
            const priceText = this.scene.add.text(0, 0, turretData.gameStatsPerLevel[0].price.toString(), { fontSize: "16px", color: CST.STYLE.COLOR.BLUE, fontFamily: CST.STYLE.TEXT.FONT_FAMILY });
            priceWidget.add(priceText);
            this.turretPriceTexts.push(priceText);
            priceWidget.add(this.scene.add.image(0, 0, "coin_16"));

            const previewWidget = this.scene.rexUI.add.sizer({ orientation: "top-to-bottom" });
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
        const index = this.turretsData.findIndex((value: TurretData) => { return value.id == turretId }, this);
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
}