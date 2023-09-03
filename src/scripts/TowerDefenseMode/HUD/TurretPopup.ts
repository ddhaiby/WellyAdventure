import { CST } from "../../Common/CST";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";
import { IPopupConfig, WELLY_Popup } from "../../Common/HUD/WELLY_Popup";
import { Turret } from "../Characters/Npcs/Turret";
import { WELLY_TextButton } from "../../Common/HUD/WELLY_TextButton";

export class TurretPopup extends WELLY_Popup
{
    public scene: Welly_Scene;

    constructor(turret: Turret, x?: number | undefined, y?: number | undefined, config?: IPopupConfig | undefined)
    {
        super(turret.scene, x, y, config);

        // const backgroundWidth = 200;
        // const backgroundHeight = 200;
        // const background = this.scene.rexUI.add.roundRectangle(0, backgroundHeight * 0.5 + 24, backgroundWidth, backgroundHeight, 8, WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.WHITE));
        // background.strokeColor = WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.BLUE);
        // background.lineWidth = 2;
        // background.setInteractive();

        // this.add(background);

        // const iconContainer = this.scene.add.container(0, 0);
        
        // iconContainer.add()

        // const label = new Label(this.scene, {
        //     background: background,
        //     icon: 
        // });

        const button = new WELLY_TextButton(this.scene, 0, 0, "UPGRADE", {
            textureNormal: "buttonConnectNormal", textOffsetNormalY: -1,
            texturePressed: "buttonConnectNormal", textOffsetHoveredY: -1,
            textureHovered: "buttonConnectNormal", textOffsetPressedY: -1,
            fontSize: "18px",
            textColor: CST.STYLE.COLOR.BLUE,
            textStrokeThickness: 0
        });
        button.setPosition(0, button.displayHeight + 8);
        this.add(button);

        button.onClicked(() => {
            this.emit("requestUpgrade");
        }, this);

        // Image haut gauche
        // Nom de la tour juste a cote
        // Niveau de latour encore a cote
        // Current Att >> New Att dessous
        // Bouton "upgrade XX <gold image>
        // Bouton désactivé si pas assez de gold

        // Bouger le fichier dans le dossier towerDefense
    }

    public destroy(fromScene?: boolean | undefined): void
    {
        this.emit("destroyed");
        super.destroy(fromScene);    
    }
}