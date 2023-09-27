import Label from "phaser3-rex-plugins/templates/ui/label/Label";
import { CST } from "../../Common/CST";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";

declare type ButtonData = { button: Label, texture: string };

export class BottomMenu extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;
    protected turretButtonsData: ButtonData[];

    constructor(scene: Welly_Scene, x: number, y: number, width: number, height: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);
        this.width = width;
        this.height = height;

        const background = this.scene.add.rectangle(0, 0, this.width, this.height, WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.WHITE), 1);
        this.add(background);
        this.initTurretList();
    }

    protected initTurretList(): void
    {
        const turretDataList = [
            { texture: "Amalia", name: "Amalia" },
            { texture: "player", name: "Welly Friend"},
            { texture: "wellyItaly", name: "Welly Italian Friend"},
        ];

        const turretList = this.scene.rexUI.add.sizer({
            orientation: "left-to-right",
            space: { item: 20 },
            x: 0,
            y: 0
        }).setOrigin(0.5);

        this.turretButtonsData = [];

        for (const turretData of turretDataList)
        {
            const turretButton = this.scene.rexUI.add.label({
                background: this.scene.rexUI.add.roundRectangle(0, 0, 80, 80, 10, WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.LIGHT_BLUE), WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.BLUE)),
                icon: this.scene.add.image(0, 0, turretData.texture),
                space: { left: 0, right: 0, top: 0, bottom: 0, icon: 0 }
            });
            turretButton.setInteractive();
            this.scene.input.setDraggable(turretButton);
            this.turretButtonsData.push({ button: turretButton, texture: turretData.texture });

            turretList.add(turretButton);
        }
        this.add(turretList);
        turretList.layout();
    }

    public getTurretButtonsData(): ButtonData[]
    {
        return this.turretButtonsData;
    }
}