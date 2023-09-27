import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin";

export const enum SpeedMode {
    SLOW,
    NORMAL,
    FAST,
    PAUSE
}

export declare type SceneData = {
}

/** Any object you may want to center with CenterItem, CenterVItem or CenterHItem. They must have a height and a width. */
declare type CenterableObject = Phaser.GameObjects.Text | Phaser.GameObjects.Image;

export class Welly_Scene extends Phaser.Scene
{
    public rexUI: UIPlugin;
    
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig)
    {
        super(config);
    }

    // Create
    ////////////////////////////////////////////////////////////////////////

    protected create(): void
    {
    }

    // Utils
    ////////////////////////////////////////////////////////////////////////


    public centerItem(item: CenterableObject, offsetX: number = 0, offsetY: number = 0) : CenterableObject
    {
        const sceneWidth: number = this.scale.displaySize.width;
        const sceneHeight: number = this.scale.displaySize.height;

        item.setX((sceneWidth - item.width) / 2 + offsetX);
        item.setY((sceneHeight - item.height) / 2 + offsetY);
        return item;
    }

    public centerVItem(item: CenterableObject, offsetY: number = 0) : CenterableObject
    {
        let sceneHeight = this.scale.displaySize.height;
        item.setY((sceneHeight - item.height) / 2 + offsetY);

        return item;
    }

    public centerHItem(item: CenterableObject, offsetX: number = 0) : CenterableObject
    {
        let sceneWidth = this.scale.displaySize.width;
        item.setX((sceneWidth - item.width) / 2 + offsetX);

        return item;
    }
}