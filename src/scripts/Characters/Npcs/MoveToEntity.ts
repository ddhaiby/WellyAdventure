import { Welly_Scene } from "../../Scenes/WELLY_Scene";
import { DIRECTION, DIRECTIONS } from "../CharacterMovementComponent";

export class MoveToPoint extends Phaser.GameObjects.Image
{
    /** The entity id we should move to after we reached this one  */
    public moveToPointId: number = -1;

    constructor(scene: Welly_Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number | undefined)
    {
        super(scene, x, y, texture, frame);
    }
}