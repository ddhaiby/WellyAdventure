import { PathFindingConfig } from "../../Common/Characters/WELLY_CharacterMovementComponent";
import { WELLY_BaseScene } from "../../Common/Scenes/WELLY_BaseScene";

export class WELLY_WaveSpawner extends Phaser.GameObjects.Image
{
    public scene: WELLY_BaseScene;

    /** The entity id we should move to */
    protected moveToPointId: number = -1;

    protected pathFindingConfig: PathFindingConfig;

    constructor(scene: WELLY_BaseScene, x: number, y: number)
    {
        super(scene, x, y, "");
        this.setVisible(false);
    }

    public setPathFindingConfig(inConfig: PathFindingConfig): void
    {
        this.pathFindingConfig = inConfig;
    }

    public getPathFindingConfig(): PathFindingConfig
    {
        return this.pathFindingConfig;
    }

    public getMoveToPointId(): number
    {
        return this.moveToPointId;
    }
}