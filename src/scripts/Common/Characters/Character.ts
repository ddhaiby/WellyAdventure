import { Welly_Scene } from "../Scenes/WELLY_Scene";
import { SpawnData } from "./CharacterSpawner";
import { CharacterMovementComponent, DIRECTION, DIRECTIONS, PathFindingConfig } from "./CharacterMovementComponent";
import { MoveToPoint } from "../PathFinding/MoveToEntity";
import { CST } from "../CST";

export class Character extends Phaser.Physics.Arcade.Sprite
{
    /** Whether this character is walking */
    protected isWalking: boolean = false;

    /** Whether this character wants to run */
    public wantsToRun: boolean = false;

    protected characterMovementComponent: CharacterMovementComponent;

    /** The direction this character is looking at */    
    protected currentDirection: DIRECTION = DIRECTIONS.Down;
 
    /** Id to determine the dialogues of this character */
    protected dialogueId: string = CST.NONE;

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y, "");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.allowGravity = false;
        this.setCollideWorldBounds(false);

        this.characterMovementComponent = new CharacterMovementComponent(this);
    }

    public destroy(fromScene?: boolean | undefined): void
    {
        if (this.characterMovementComponent)
        {
            this.characterMovementComponent.destroy();
        }

        super.destroy(fromScene);
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(spawnData?: SpawnData): void
    {
        if (spawnData == undefined)
        {
            spawnData = {
                walkSpeed: 100,
                runSpeed: 100,
                characterTexture: this.texture.key,
                startDirection: DIRECTIONS.Down,
                dialogueId: CST.NONE,
                moveToPointId: -1,
                moveToPointRepeat: 0
            }
        }

        this.characterMovementComponent.init(spawnData);

        this.dialogueId = spawnData.dialogueId ?? CST.NONE;
        this.setDirection(spawnData.startDirection ?? DIRECTIONS.Down);
        this.setName(spawnData.characterTexture);

        this.initAnimations(spawnData.characterTexture);
        this.initPhysic();
    }

    protected initPhysic(): void
    {
    }

    protected initAnimations(texture: string): void
    {
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    public update(): void
    {
        super.update();

        this.updateAnimations();
        this.updateControls();
    }

    public postUpdate(): void
    {
    }

    /** Update the anims of this Character */
    protected updateAnimations(): void
    {
    }

    /** Define the way to control this Character */
    protected updateControls(): void
    { 
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    /** Set the direction this character is looking at */
    public setDirection(direction: DIRECTION): void
    {
        this.currentDirection = direction;
    }

    public getCurrentDirection(): DIRECTION
    {
        return this.currentDirection;
    }

    /** Move the character to the top */
    public walkUp(): void
    {
        this.isWalking = true;
        this.characterMovementComponent.walkUp();
    }

    /** Move the character to the bottom */
    public walkDown(): void
    {
        this.isWalking = true;
        this.characterMovementComponent.walkDown();
    }

    /** Move the character to the left */
    public walkOnLeft(): void
    {
        this.isWalking = true;
        this.characterMovementComponent.walkOnLeft();
    }

    /** Move the character to the right */
    public walkOnRight(): void
    {
        this.isWalking = true;
        this.characterMovementComponent.walkOnRight();
    }

    /** Move the character to the top left */
    public walkUpLeft(): void
    {
        this.isWalking = true;
        this.characterMovementComponent.walkUpLeft();
    }

    /** Move the character to the top right */
    public walkUpRight(): void
    {
        this.isWalking = true;
        this.characterMovementComponent.walkUpRight();
    }

     /** Move the character to the bottom left */
    public walkDownLeft(): void
    {
        this.isWalking = true;
        this.characterMovementComponent.walkDownLeft();
    }

    /** Move the character to the bottom right */
    public walkDownRight(): void
    {
        this.isWalking = true;
        this.characterMovementComponent.walkDownRight();
    }

    /** Stop all character movements */
    public stopWalking(): void
    {
        if (this.isWalking)
        {
            this.characterMovementComponent.stopWalking();
            this.isWalking = false;
        }
    }

    protected startRunning(): void
    {
        this.wantsToRun = true;
    }

    protected stopRunning(): void
    {
        this.wantsToRun = false;
    }

    public moveTo(config: PathFindingConfig): void
    {
        this.characterMovementComponent.moveTo(config);
    }
}