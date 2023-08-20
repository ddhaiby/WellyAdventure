import { Welly_Scene } from "../Scenes/WELLY_Scene";
import { DIRECTION, DIRECTIONS } from "./CharacterMovementComponent";

export declare type SpawnData =
{
    /** Walk speed */
    walkSpeed: number;

    /** Run speed */
    runSpeed: number;

    /** The texture to use for the character */
    characterTexture: string;

    /** Which direction this character should look at */
    startDirection: DIRECTION;

    /** Id to determine the dialogues of this character */
    dialogueId: string;
};

export class CharacterSpawner extends Phaser.Physics.Arcade.Image
{
    /** Walk speed */
    protected walkSpeed: number = 110;

    /** Run speed */
    protected runSpeed: number = 190;

    /** The texture to use for the character */
    protected characterTexture: string = "";

    /** Which direction this character should look at */
    protected startDirection: DIRECTION = DIRECTIONS.Down;

    /** Id to determine the dialogues of this character */
    protected dialogueId: string = "";

    constructor(scene: Welly_Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number | undefined)
    {
        super(scene, x, y, texture, frame);
    }

    public getSpawnData(): SpawnData
    {
        return {
            walkSpeed: this.walkSpeed,
            runSpeed: this.runSpeed,
            characterTexture: this.characterTexture,
            startDirection: this.startDirection,
            dialogueId: this.dialogueId,
        };
    }
}