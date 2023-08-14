import { CST } from "../CST";
import { WELLY_DialogueBox } from "../HUD/DialogueBox";
import { Welly_Scene, SceneData } from "./WELLY_Scene";

declare type UIKeys = 
{
    nextPage: Phaser.Input.Keyboard.Key;
    skip: Phaser.Input.Keyboard.Key;
}

export class SceneGameUI extends Welly_Scene
{
    private dialogueBox: WELLY_DialogueBox;

    constructor()
    {
        super({key: CST.SCENES.GAME_UI});
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(data?: SceneData): void
    {
    }

    // Preload
    ////////////////////////////////////////////////////////////////////////

    public preload(): void
    {
    }

    // Create
    ////////////////////////////////////////////////////////////////////////

    public create(): void
    {
        super.create();

        this.createDialogueBox();
        this.createShortcuts(); 
    }

    private createDialogueBox(): void
    {
        this.dialogueBox = new WELLY_DialogueBox(this, {
            x: CST.GAME.WIDTH * 0.5,
            y: CST.GAME.HEIGHT - 12,
            width: CST.GAME.WIDTH - 100,
            height: 80,
            page: { maxLines: 3, pageBreak: "\n" }
        });

        this.dialogueBox.setOrigin(0.5, 1);
        this.dialogueBox.layout();
    }

    private createShortcuts(): void
    {
        const keys = this.input.keyboard?.addKeys({
            nextPage: Phaser.Input.Keyboard.KeyCodes.ENTER,
            skip: Phaser.Input.Keyboard.KeyCodes.ESC,
        }, false) as UIKeys;

        if (keys)
        {
            keys.nextPage.on('down', () => {
                if (this.dialogueBox.isTyping)
                {
                    this.dialogueBox.stop(true);
                }
                else if(this.dialogueBox.isLastPage)
                {
                    this.dialogueBox.closeDialogue()
                }   
                else
                {
                    this.dialogueBox.typeNextPage()
                }
            }, this);

            keys.skip.on('down', () => {
                this.dialogueBox.stop(true)
                this.dialogueBox.closeDialogue()
            });
        }
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    public update(): void
    {
    }

    public requestDialogue(message: string, title: string, iconTexture: string = "", iconFrame: string = ""): void
    {
        this.dialogueBox.showMessage(message, title, iconTexture, iconFrame);
    }
}