import { IInteractable } from "../../Interactable/Interactable";
import { Character } from "../Character";
import { Player } from "../Players/Player";

export class Npc extends Character implements IInteractable
{
    constructor(scene: Phaser.Scene, x: number, y: number)
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
    }

    // Interactions
    ////////////////////////////////////////////////////////////////////////

    public onInteract(source: Player): void
    {
        console.log("Hey!");
    }
}