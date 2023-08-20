import { Welly_Scene } from "../Scenes/WELLY_Scene";
import { SpawnData } from "./CharacterSpawner";

export declare type PathFindingConfig = {
    /** All the positions to follows */
    positions: Phaser.Types.Math.Vector2Like[],

    /** Threshold to consider that a position has been reached */
    threshold?: number,

    /** Number of times to repeat the path (-1 for infinity). 1 means to go back and forth one time. */
    repeat?: number
}

export declare type DIRECTION = "Up" | "Down" | "Right" | "Left" | "UpLeft" | "DownLeft" | "UpRight" | "DownRight";

export class DIRECTIONS_NO_DIAGONALE
{
    public static Down: DIRECTION = "Down";
    public static Left: DIRECTION = "Left";
    public static Right: DIRECTION = "Right";
    public static Up: DIRECTION = "Up";
}

export class DIRECTIONS
{
    public static Down: DIRECTION = "Down";
    public static DownLeft: DIRECTION = "DownLeft";
    public static Left: DIRECTION = "Left";
    public static UpLeft: DIRECTION = "UpLeft";
    public static Up: DIRECTION = "Up";
    public static UpRight: DIRECTION = "UpRight";
    public static Right: DIRECTION = "Right";
    public static DownRight: DIRECTION = "DownRight";
}

export class Character extends Phaser.Physics.Arcade.Sprite
{
    /** Walk speed */
    protected walkSpeed: number = 160;

    /** Whether this character is walking */
    protected isWalking: boolean = false;

    /** Walk speed */
    protected runSpeed: number = 250;

    /** Whether this character wants to run */
    protected wantsToRun: boolean = false;

    /** The direction this character is looking at */    
    protected currentDirection: DIRECTION = DIRECTIONS.Down;

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y, "");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.allowGravity = false;
        this.setCollideWorldBounds(true);
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(spawnData: SpawnData): void
    {
        this.walkSpeed = spawnData.walkSpeed;
        this.runSpeed = spawnData.runSpeed;
        this.setDirection(spawnData.startDirection);
        this.setName(spawnData.characterTexture);

        this.initAnimations(spawnData.characterTexture);
        this.initPhysic();
    }

    protected initPhysic(): void
    {
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

    /** Move the character to the top */
    public walkUp(): void
    {
        const speed = this.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(0, -speed);
        this.setDirection(DIRECTIONS.Up);
    }

    /** Move the character to the bottom */
    public walkDown(): void
    {
        const speed = this.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(0, speed);
        this.setDirection(DIRECTIONS.Down);
    }

    /** Move the character to the left */
    public walkOnLeft(): void
    {
        const speed = this.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(-speed, 0);
        this.setDirection(DIRECTIONS.Left);
    }

    /** Move the character to the right */
    public walkOnRight(): void
    {
        const speed = this.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(speed, 0);
        this.setDirection(DIRECTIONS.Right);
    }

    /** Move the character to the top left */
    public walkUpLeft(): void
    {
        const speed = this.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(-speed, -speed);
        this.setDirection(DIRECTIONS.UpLeft);
    }

    /** Move the character to the top right */
    public walkUpRight(): void
    {
        const speed = this.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(speed, -speed);
        this.setDirection(DIRECTIONS.UpRight);
    }

     /** Move the character to the bottom left */
    public walkDownLeft(): void
    {
        const speed = this.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(-speed, speed);
        this.setDirection(DIRECTIONS.DownLeft);
    }

    /** Move the character to the bottom right */
    public walkDownRight(): void
    {
        const speed = this.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(speed, speed);
        this.setDirection(DIRECTIONS.DownRight);
    }

    /** Move the character giving a XY-velocity */
    public walk(x: number, y: number): void
    {
        const speed = this.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.isWalking = true;
        this.setVelocity(x,y);
        (this.body as Phaser.Physics.Arcade.Body).velocity.normalize().scale(speed);
    }

    /** Stop all character movements */
    public stopWalking(): void
    {
        if (this.isWalking)
        {
            this.setVelocity(0,0);
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

    public getCurrentDirection(): DIRECTION
    {
        return this.currentDirection;
    }

    public moveTo(config: PathFindingConfig): void
    {
        if (config.positions.length > 0)
        {
            this.pathCount = config.repeat ?? 0;
            this.threshold = config.threshold ?? 10;
            
            this.positions = [];
            config.positions.forEach((vector: Phaser.Types.Math.Vector2Like) => { this.positions.push(Object.assign({}, vector)); });

            const lastPosition = this.positions[this.positions.length - 1];
            if ((lastPosition.x == undefined) || (Math.abs(lastPosition.x - this.x) > this.threshold) || (lastPosition.y == undefined) || (Math.abs(lastPosition.y - this.y) > this.threshold))
            {
                this.positions.push({ x: this.x, y: this.y } as Phaser.Types.Math.Vector2Like);
            }

            this.positions.reverse();

            this.moveTo_Internal(config.positions);
        }
    }

    private moveTo_Internal(positions: Phaser.Types.Math.Vector2Like[]): void
    {
        console.log(this.positions.length)
        const currentPosition = positions[positions.length - 1];
        
        if (currentPosition.x == undefined)
        {
            currentPosition.x = this.x;
        }

        if (currentPosition.y == undefined)
        {
            currentPosition.y = this.y;
        }

        this.scene.physics.moveTo(this, currentPosition.x, currentPosition.y, this.walkSpeed);
        
        const characterBody = (this.body as Phaser.Physics.Arcade.Body);
        const velocityThreshold = 10;
        
        let directionV = "";
        let directionH = "";

        if (characterBody.velocity.x > velocityThreshold)
        {
            directionH = DIRECTIONS.Right;
        }
        else if (characterBody.velocity.x < -velocityThreshold)
        {
            directionH = DIRECTIONS.Left;
        }

        if (characterBody.velocity.y > velocityThreshold)
        {
            directionV = DIRECTIONS.Down;
        }
        else if (characterBody.velocity.y < -velocityThreshold)
        {
            directionV = DIRECTIONS.Up;
        }

        const direction = directionV + directionH as DIRECTION;
        this.setDirection(direction);

        const positionCheck = () => {
            const dist = Math.abs(this.x - (currentPosition.x as number)) + Math.abs(this.y - (currentPosition.y as number));

            if (dist > this.threshold)
            {
                this.scene.time.delayedCall(50, positionCheck, undefined, this);
            }
            else
            {
                (this.body as Phaser.Physics.Arcade.Body).reset(this.x, this.y);
                positions.pop();

                if (positions.length > 0)
                {
                    this.moveTo_Internal(positions);
                }
                else if (this.pathCount > 0)
                {
                    this.pathCount = (this.pathCount as number) - 1;
                    this.moveTo({ repeat: this.pathCount, positions: this.positions, threshold: this.threshold });
                }
                else if (this.pathCount < 0)
                {
                    this.moveTo({ repeat: this.pathCount, positions: this.positions, threshold: this.threshold });
                }
            }
        };

        positionCheck();
    }

    private pathCount: number = 0;
    private threshold: number = 10;
    private positions: Phaser.Types.Math.Vector2Like[] = [];
}