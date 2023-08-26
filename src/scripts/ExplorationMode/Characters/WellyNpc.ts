import { CST } from "../../Common/CST";
import { IInteractable } from "../../Common/Interactable/Interactable";
import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { DIRECTIONS } from "../../Common/Characters/CharacterMovementComponent";
import { Player } from "../../Common/Characters/Players/Player";
import { Npc } from "../../Common/Characters/Npcs/Npc";

export class WellyNpc extends Npc implements IInteractable
{
    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);

        this.setCollideWorldBounds(true);
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    protected initPhysic(): void
    {
        super.initPhysic();
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
    }

    // Interactions
    ////////////////////////////////////////////////////////////////////////

    public onInteract(source: Player): void
    {
        const dialogues = this.scene.cache.json.get("dialogues");
        const characterDialogue = dialogues[this.name];
        
        if (characterDialogue == undefined)
        {
            return;
        }

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

        this.emit(CST.EVENTS.UI.REQUEST_DIALOGUE, characterDialogue[this.dialogueId], this.name, this.texture.key, 28); // 28 is the 28th frame of the spritesheet (idle bottom right)
    }
}