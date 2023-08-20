import { CST } from "../../CST";
import { IInteractable } from "../../Interactable/Interactable";
import { Welly_Scene } from "../../Scenes/WELLY_Scene";
import { Character } from "../Character";
import { DIRECTIONS } from "../CharacterMovementComponent";
import { Player } from "../Players/Player";

export class Npc extends Character implements IInteractable
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

    // Interactions
    ////////////////////////////////////////////////////////////////////////

    public onInteract(source: Player): void
    {
        switch (source.getCurrentDirection())
        {
            case DIRECTIONS.Down:
                this.setDirection(DIRECTIONS.Up);
                break;

            case DIRECTIONS.Up:
                this.setDirection(DIRECTIONS.Down);
                break;

            case DIRECTIONS.Right:
                this.setDirection(DIRECTIONS.Left);
                break;

            case DIRECTIONS.Left:
                this.setDirection(DIRECTIONS.Right);
                break;

            case DIRECTIONS.DownLeft:
                this.setDirection(DIRECTIONS.UpRight);
                break;

            case DIRECTIONS.DownRight:
                this.setDirection(DIRECTIONS.UpLeft);
                break;

            case DIRECTIONS.UpLeft:
                this.setDirection(DIRECTIONS.DownRight);
                break;

            case DIRECTIONS.UpRight:
                this.setDirection(DIRECTIONS.DownLeft);
                break;
        }


        const message = "Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice Hey I'm Alice v";
        const title = "Qlice";

        this.emit(CST.EVENTS.UI.REQUEST_DIALOGUE, message, title, this.texture.key, 28); // 28 Is the frame in idle bottom right
    }
}