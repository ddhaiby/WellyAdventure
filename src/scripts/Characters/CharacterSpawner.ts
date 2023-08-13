export declare type SpawnData =
{
    /** Walk speed */
    walkSpeed: number;

    /** Run speed */
    runSpeed: number;

    /** The texture to use for the character */
    characterTexture: string;
};

export class CharacterSpawner extends Phaser.Physics.Arcade.Image
{
    /** Walk speed */
    protected walkSpeed: number = 110;

    /** Run speed */
    protected runSpeed: number = 190;

    /** The texture to use for the character */
    protected characterTexture: string = "";

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number | undefined)
    {
        super(scene, x, y, texture, frame);
    }

    public getSpawnData(): SpawnData
    {
        return {
            walkSpeed: this.walkSpeed,
            runSpeed: this.runSpeed,
            characterTexture: this.characterTexture
        };
    }
}