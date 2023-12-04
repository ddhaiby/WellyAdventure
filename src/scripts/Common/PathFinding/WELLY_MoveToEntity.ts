import { WELLY_BaseScene } from "../Scenes/WELLY_BaseScene";
import { WELLY_DIRECTION, WELLY_DIRECTIONS } from "../Characters/WELLY_CharacterMovementComponent";

export class WELLY_MoveToPoint extends Phaser.GameObjects.Image
{
    /** The entity id we should move to after we reached this one  */
    public moveToPointId: number = -1;

    constructor(scene: WELLY_BaseScene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number | undefined)
    {
        super(scene, x, y, texture, frame);
    }
}