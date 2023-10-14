import { PathFindingConfig } from "../../Common/Characters/CharacterMovementComponent";
import { SpawnData } from "../../Common/Characters/CharacterSpawner";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";

export class WaveSpawner extends Phaser.GameObjects.Image
{
    public scene: Welly_Scene;

    /** The entity id we should move to */
    protected moveToPointId: number = -1;

    protected pathFindingConfig: PathFindingConfig;

    constructor(scene: Welly_Scene, x: number, y: number)
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