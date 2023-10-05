import { CST } from "../../Common/CST";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";

export class EndRunWidget extends Phaser.GameObjects.Container
{
    public scene: Welly_Scene;

    protected title: Phaser.GameObjects.Text;

    constructor(scene: Welly_Scene, x?: number | undefined, y?: number)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.width = this.scene.scale.displaySize.width;
        this.height = this.scene.scale.displaySize.height;

        const background = scene.add.graphics();
        background.fillStyle(WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.BLACK), 0.85);
        background.fillRect(0, 0, this.width, this.height);
        background.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        this.add(background);
        
        this.title = this.scene.add.text(this.width * 0.5, 100, "WELLY PLAYED!");
        this.add(this.title);
    }

    public show(): void
    {
        this.setVisible(true);
    }
}