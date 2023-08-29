import { Welly_Scene } from "../../Scenes/WELLY_Scene";
import { Character } from "../Character";
import { DIRECTIONS } from "../CharacterMovementComponent";
import { SpawnData } from "../CharacterSpawner";
import { InteractionComponent } from "./InteractionComponent";

declare type PlayerKeys = 
{
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    run: Phaser.Input.Keyboard.Key;
    interact: Phaser.Input.Keyboard.Key;
}

export class Player extends Character
{
    /** Keys to control the player */
    protected keys: PlayerKeys;

    /** How far a player can interact with entities around them */
    protected interactionRange: number = 30;

    /** Component used to interact with interactable entities */
    protected interactableComp: InteractionComponent;

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(spawnData: SpawnData): void
    {
        super.init(spawnData);
        this.initKeys();
        this.initIniteractableComp();
    }

    protected initPhysic(): void
    {
        (this.body as Phaser.Physics.Arcade.Body).setSize(28, 46);
        (this.body as Phaser.Physics.Arcade.Body).setOffset(17, 4);
    }

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

    protected initIniteractableComp(): void
    {
        this.interactableComp = new InteractionComponent(this, this.x, this.y, this.interactionRange, this.interactionRange);
        this.interactableComp.setOrigin(0, 0);
        this.scene.physics.add.existing(this.interactableComp);
    }

    public getInteractableComp(): InteractionComponent
    {
        return this.interactableComp;
    }

    protected initKeys(): void
    {
        if (this.scene.input.keyboard)
        {
            this.keys = this.scene.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                run: Phaser.Input.Keyboard.KeyCodes.SHIFT,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D,
                interact: Phaser.Input.Keyboard.KeyCodes.L
            }, false) as PlayerKeys;
    
            this.keys.interact.on("down", this.interact, this);
            this.keys.run.on("down", this.startRunning, this);
            this.keys.run.on("up", this.stopRunning, this);
        }
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    public postUpdate(): void
    {
        super.postUpdate();
        
        this.interactableComp.update();
    }

    protected updateControls(): void
    {
        if (this.keys.up.isDown)
        {
            if (this.keys.right.isDown)
            {
                this.walkUpRight();
            }
            else if (this.keys.left.isDown)
            {
                this.walkUpLeft();
            }
            else
            {
                this.walkUp();
            }
        }
        else if (this.keys.down.isDown)
        {
            if (this.keys.right.isDown)
            {
                this.walkDownRight();
            }
            else if (this.keys.left.isDown)
            {
                this.walkDownLeft();
            }
            else
            {
                this.walkDown();
            }
        }
        else if (this.keys.right.isDown)
        {
            this.walkOnRight();
        }
        else if (this.keys.left.isDown)
        {
            this.walkOnLeft();
        }
        else
        {
            this.stopWalking();
        }
    }

    protected updateAnimations(): void
    {
        if (this.isWalking)
        {
            this.anims.play(`Walk${this.currentDirection}`, true);
        }
        else
        {
            this.anims.play(`Idle${this.currentDirection}`, true);
        }
    }

    public interact(): void
    {
        this.interactableComp.interact();
    }

    public getInteractionRange(): number
    {
        return this.interactionRange;
    }
}