import { Welly_Scene } from "../../Scenes/WELLY_Scene";
import { Character } from "../Character";

export class Npc extends Character
{
    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    protected initPhysic(): void
    {
        (this.body as Phaser.Physics.Arcade.Body).setSize(28, 46);
        (this.body as Phaser.Physics.Arcade.Body).setOffset(17, 4);
        (this.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    protected updateControls(): void
    {
    }

    protected updateAnimations(): void
    {
        if ((this.body as Phaser.Physics.Arcade.Body).velocity.length() > 0)
        {
            this.anims.play(`Walk${this.currentDirection}`, true);
        }
        else
        {
            this.anims.play(`Idle${this.currentDirection}`, true);
        }
    }
}