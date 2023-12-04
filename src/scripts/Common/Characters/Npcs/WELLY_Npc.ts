import { WELLY_BaseScene } from "../../Scenes/WELLY_BaseScene";
import { WELLY_Character } from "../WELLY_Character";
import { WELLY_SpawnData } from "../WELLY_CharacterSpawner";

export class WELLY_Npc extends WELLY_Character
{
    constructor(scene: WELLY_BaseScene, x: number, y: number)
    {
        super(scene, x, y);
    }

    public init(spawnData?: WELLY_SpawnData): void
    {
        super.init(spawnData);

        this.body.setSize(this.displayWidth, this.displayHeight);
    }
}