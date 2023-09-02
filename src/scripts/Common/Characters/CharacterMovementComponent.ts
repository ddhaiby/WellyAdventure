import { Character } from "./Character";
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

export class CharacterMovementComponent
{
    /** Character who owns this movement component */
    protected owner: Character;

    /** The physic body of the owner */
    protected ownerBody: Phaser.Physics.Arcade.Body;

    /** Walk speed */
    protected walkSpeed: number = 160;

    /** Walk speed */
    protected runSpeed: number = 250;

    /** All the positions this character should follow */
    private positions: Phaser.Types.Math.Vector2Like[] = [];

    /** How many time this character should follow the given path (see positions) */
    private pathCount: number = 0;
    
    /** The threshold to consider we reached a position. The lower this value the more accurate we want the component to be */
    private threshold: number = 10;

    /** Internal timer called to check the position of the character when they follow a path */
    private internalPositionCheckTimerEvent: Phaser.Time.TimerEvent | undefined;

    constructor(owner: Character)
    {
        this.owner = owner;
        this.ownerBody = owner.body as Phaser.Physics.Arcade.Body;
    }

    public destroy(): void
    {
        if (this.internalPositionCheckTimerEvent)
        {
            this.internalPositionCheckTimerEvent.remove(false);
            this.internalPositionCheckTimerEvent.destroy();
            this.internalPositionCheckTimerEvent = undefined;
        }
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(spawnData: SpawnData): void
    {
        this.walkSpeed = spawnData.walkSpeed;
        this.runSpeed = spawnData.runSpeed;
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    // Update
    ////////////////////////////////////////////////////////////////////////

    /** Move the character to the top */
    public walkUp(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(0, -speed);
        this.owner.setDirection(DIRECTIONS.Up);
    }

    /** Move the character to the bottom */
    public walkDown(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(0, speed);
        this.owner.setDirection(DIRECTIONS.Down);
    }

    /** Move the character to the left */
    public walkOnLeft(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(-speed, 0);
        this.owner.setDirection(DIRECTIONS.Left);
    }

    /** Move the character to the right */
    public walkOnRight(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(speed, 0);
        this.owner.setDirection(DIRECTIONS.Right);
    }

    /** Move the character to the top left */
    public walkUpLeft(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(-speed, -speed);
        this.owner.setDirection(DIRECTIONS.UpLeft);
    }

    /** Move the character to the top right */
    public walkUpRight(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(speed, -speed);
        this.owner.setDirection(DIRECTIONS.UpRight);
    }

     /** Move the character to the bottom left */
    public walkDownLeft(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(-speed, speed);
        this.owner.setDirection(DIRECTIONS.DownLeft);
    }

    /** Move the character to the bottom right */
    public walkDownRight(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(speed, speed);
        this.owner.setDirection(DIRECTIONS.DownRight);
    }

    /** Move the character giving a XY-velocity */
    public walk(x: number, y: number): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.owner.setVelocity(x,y);
        this.ownerBody.velocity.normalize().scale(speed);
    }

    /** Stop all character movements */
    public stopWalking(): void
    {
        this.owner.setVelocity(0,0);
    }

    protected startRunning(): void
    {
        this.owner.wantsToRun = true;
    }

    protected stopRunning(): void
    {
        this.owner.wantsToRun = false;
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
            if ((lastPosition.x == undefined) || (Math.abs(lastPosition.x - this.owner.x) > this.threshold) || (lastPosition.y == undefined) || (Math.abs(lastPosition.y - this.owner.y) > this.threshold))
            {
                this.positions.push({ x: this.owner.x, y: this.owner.y } as Phaser.Types.Math.Vector2Like);
            }

            this.positions.reverse();

            this.moveTo_Internal(config.positions);
        }
    }

    private moveTo_Internal(positions: Phaser.Types.Math.Vector2Like[]): void
    {
        const currentPosition = positions[positions.length - 1];
        if (currentPosition.x == undefined)
        {
            currentPosition.x = this.owner.x;
        }

        if (currentPosition.y == undefined)
        {
            currentPosition.y = this.owner.y;
        }

        this.owner.scene.physics.moveTo(this.owner, currentPosition.x, currentPosition.y, this.walkSpeed);
        
        const velocityThreshold = 10;
        
        let directionV = "";
        let directionH = "";

        if (this.ownerBody.velocity.x > velocityThreshold)
        {
            directionH = DIRECTIONS.Right;
        }
        else if (this.ownerBody.velocity.x < -velocityThreshold)
        {
            directionH = DIRECTIONS.Left;
        }

        if (this.ownerBody.velocity.y > velocityThreshold)
        {
            directionV = DIRECTIONS.Down;
        }
        else if (this.ownerBody.velocity.y < -velocityThreshold)
        {
            directionV = DIRECTIONS.Up;
        }

        const direction = directionV + directionH as DIRECTION;
        this.owner.setDirection(direction);

        const positionCheck = () => {
            const dist = Math.abs(this.owner.x - (currentPosition.x as number)) + Math.abs(this.owner.y - (currentPosition.y as number));

            if (dist > this.threshold)
            {
                this.internalPositionCheckTimerEvent = this.owner.scene.time.delayedCall(30, positionCheck, undefined, this);
            }
            else
            {
                this.ownerBody.reset(this.owner.x, this.owner.y);
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
}