import { CST } from "../../Common/CST";
import { GPC_TextButtonStyle, WELLY_TextButton } from "../../Common/HUD/WELLY_TextButton";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";

export class BottomMenu extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

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

        for (const turretData of turretDataList)
        {
            const turretButton = this.scene.rexUI.add.label({
                background: this.scene.rexUI.add.roundRectangle(0, 0, 80, 80, 10, WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.LIGHT_BLUE), WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.BLUE)),
                icon: this.scene.add.image(0, 0, turretData.texture),
                space: { left: 0, right: 0, top: 0, bottom: 0, icon: 0 }
            });
            turretList.add(turretButton);
        }
        this.add(turretList);        
        turretList.layout();
    }
}