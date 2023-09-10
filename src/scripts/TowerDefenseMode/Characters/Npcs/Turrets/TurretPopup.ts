import { CST } from "../../../../Common/CST";
import { Welly_Scene } from "../../../../Common/Scenes/WELLY_Scene";
import { IPopupConfig, WELLY_Popup } from "../../../../Common/HUD/WELLY_Popup";
import { Turret } from "./Turret";
import { WELLY_TextButton } from "../../../../Common/HUD/WELLY_TextButton";

export class TurretPopup extends WELLY_Popup
{
    public scene: Welly_Scene;

    constructor(turret: Turret, x?: number | undefined, y?: number | undefined, config?: IPopupConfig | undefined)
    {
        super(turret.scene, x, y, config);

        const button = new WELLY_TextButton(this.scene, 0, 0, "UPGRADE", {
            textureNormal: "buttonConnectNormal", textOffsetNormalY: -1,
            texturePressed: "buttonConnectNormal", textOffsetHoveredY: -1,
            textureHovered: "buttonConnectNormal", textOffsetPressedY: -1,
            fontSize: "18px",
            textColorNormal: CST.STYLE.COLOR.BLUE,
            textStrokeThickness: 0
        });
        button.setPosition(0, button.displayHeight + 8);
        this.add(button);

        button.onClicked(() => { this.emit("requestUpgrade"); }, this);
    }

    public destroy(fromScene?: boolean | undefined): void
    {
        this.emit("destroyed");
        super.destroy(fromScene);    
    }
}