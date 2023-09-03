import { Welly_Scene } from "../Scenes/WELLY_Scene";

export declare interface IPopupConfig
{
}

export class WELLY_Popup extends Phaser.GameObjects.Container
{
    protected screenBackground: Phaser.GameObjects.Graphics | undefined;

    constructor(scene: Welly_Scene, x?: number | undefined, y?: number | undefined, config?: IPopupConfig)
    {
        super(scene, x, y);
        this.scene.add.existing(this);
        this.setDepth(9999);
        const worldView = this.scene.cameras.main.worldView;

        // this.screenBackground = this.scene.add.graphics();
        // this.screenBackground.fillStyle(0x000000, 0.5);
        // this.screenBackground.fillRoundedRect(worldView.x , worldView.y,  worldView.width, worldView.height, 0);

        this.setInteractive(new Phaser.Geom.Rectangle(worldView.x - this.x, worldView.y - this.y,  worldView.width, worldView.height), Phaser.Geom.Rectangle.Contains);

        this.on(Phaser.Input.Events.POINTER_UP, () => {
            this.destroy();
        }, this);
    }

    public destroy(fromScene?: boolean | undefined): void
    {
        if (this.screenBackground)
        {
            this.screenBackground.destroy();
        }

        super.destroy(fromScene);    
    }
}