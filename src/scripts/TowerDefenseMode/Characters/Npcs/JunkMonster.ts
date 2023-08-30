import { DIRECTIONS } from "../../../Common/Characters/CharacterMovementComponent";
import { Npc } from "../../../Common/Characters/Npcs/Npc";
import { Welly_Scene } from "../../../Common/Scenes/WELLY_Scene";

export class JunkMonster extends Npc
{
    public scene: Welly_Scene;
    private health: number = 100;

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);

        this.setCollideWorldBounds(false);
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    protected initAnimations(texture: string): void
    {
        if (texture == undefined || texture == "__MISSING")
        {
            return;
        }

        this.setTexture(texture);

        const directions = Object.keys(DIRECTIONS);
        for (let i = 0; i < directions.length; ++i)
        {
            const direction = directions[i];
            this.anims.create({
                key: `Idle${direction}`,
                frames: this.anims.generateFrameNumbers(texture, { start: i * 4, end: i * 4 }),
                frameRate: 1,
                repeat: 0
            });

            this.anims.create({
                key: `Walk${direction}`,
                frames: this.anims.generateFrameNumbers(texture, { start: i * 4, end: (i + 1) * 4 - 1 }),
                frameRate: 6,
                repeat: -1
            });
        }    
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    protected updateControls(): void
    {
        super.updateControls();
    }

    protected updateAnimations(): void
    {
        super.updateAnimations();

        if ((this.body as Phaser.Physics.Arcade.Body).velocity.length() > 0)
        {
            this.anims.play(`Walk${this.currentDirection}`, true);
        }
        else
        {
            this.anims.play(`Idle${this.currentDirection}`, true);
        }
    }

    protected die(): void
    {
        this.health = 0;
        this.stopWalking();
        this.disableBody(true, false);

        this.emit("DIE");
    }

    public onDie(fn: Function, context?: any): void
    {
        this.on("DIE", fn, context);
    }
}