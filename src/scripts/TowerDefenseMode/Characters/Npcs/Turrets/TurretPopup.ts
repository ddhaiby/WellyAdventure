import { CST } from "../../../../Common/CST";
import { Welly_Scene } from "../../../../Common/Scenes/WELLY_Scene";
import { IPopupConfig, WELLY_Popup } from "../../../../Common/HUD/WELLY_Popup";
import { Turret } from "./Turret";
import { WELLY_TextButton } from "../../../../Common/HUD/WELLY_TextButton";

export class TurretPopup extends WELLY_Popup
{
    public scene: Welly_Scene;
    protected turret: Turret;
    protected upgradeButton: WELLY_TextButton;
    protected turretNameText: Phaser.GameObjects.Text;

    constructor(turret: Turret, x?: number | undefined, y?: number | undefined, config?: IPopupConfig | undefined)
    {
        super(turret.scene, x, y, config);

        this.upgradeButton = new WELLY_TextButton(this.scene, 0, 0, "UPGRADE", {
            textureNormal: "buttonConnectNormal", textOffsetNormalY: -1,
            texturePressed: "buttonConnectNormal", textOffsetHoveredY: -1,
            textureHovered: "buttonConnectNormal", textOffsetPressedY: -1,
            fontSize: "18px",
            textColorNormal: CST.STYLE.COLOR.BLUE,
            textStrokeThickness: 0
        });
        this.upgradeButton.setPosition(0, this.upgradeButton.displayHeight + 8);
        this.add(this.upgradeButton);

        this.upgradeButton.onClicked(() => { this.emit("requestUpgrade"); }, this);

        this.turretNameText = this.scene.add.text(turret.x - this.x, turret.y - turret.displayHeight * 0.5 - 4 - this.y, turret.name.toUpperCase(),{ fontSize: "14px", color: CST.STYLE.COLOR.WHITE, fontFamily: CST.STYLE.TEXT.FONT_FAMILY, stroke: CST.STYLE.COLOR.BLACK, strokeThickness: 3 }).setOrigin(0.5, 1);
        this.add(this.turretNameText);

        this.turret = turret;
        this.turret.on("upgrade", this.onTurretUpgraded, this);
        this.updateData(this.turret);
    }

    public destroy(fromScene?: boolean | undefined): void
    {
        if (this.turret)
        {
            this.turret.off("upgrade", this.onTurretUpgraded);
        }

        this.emit("destroyed");
        super.destroy(fromScene);    
    }

    private updateData(turret: Turret): void
    {
        const text = turret.canUpgrade() ? `UPGRADE  ${turret.getUpgradePrice()}\[img=coin_24]` : "LEVEL MAX";
        this.upgradeButton.setText(text);
    }

    private onTurretUpgraded(turret: Turret): void
    {
        this.updateData(turret);
    }

    public getTurret(): Turret
    {
        return this.turret;
    }
}