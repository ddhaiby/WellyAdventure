import { WELLY_BaseScene } from "../Scenes/WELLY_BaseScene";
import { WELLY_Character } from "./WELLY_Character";
import { WELLY_SpawnData } from "./WELLY_CharacterSpawner";
import PathFollower from "phaser3-rex-plugins/plugins/pathfollower";

export declare type PathFindingConfig = {
    /** All the positions to follows */
    positions: Phaser.Math.Vector2[],

    /** Threshold to consider that a position has been reached */
    threshold?: number,

    /** Number of times to repeat the path (-1 for infinity). 1 means to go back and forth one time. */
    repeat?: number
}

export declare type WELLY_DIRECTION = "Up" | "Down" | "Right" | "Left" | "UpLeft" | "DownLeft" | "UpRight" | "DownRight";

export class WELLY_DIRECTIONS_NO_DIAGONALE
{
    public static Down: WELLY_DIRECTION = "Down";
    public static Left: WELLY_DIRECTION = "Left";
    public static Right: WELLY_DIRECTION = "Right";
    public static Up: WELLY_DIRECTION = "Up";
}

export class WELLY_DIRECTIONS
{
    public static Down: WELLY_DIRECTION = "Down";
    public static DownLeft: WELLY_DIRECTION = "DownLeft";
    public static Left: WELLY_DIRECTION = "Left";
    public static UpLeft: WELLY_DIRECTION = "UpLeft";
    public static Up: WELLY_DIRECTION = "Up";
    public static UpRight: WELLY_DIRECTION = "UpRight";
    public static Right: WELLY_DIRECTION = "Right";
    public static DownRight: WELLY_DIRECTION = "DownRight";
}

export class WELLY_CharacterMovementComponent
{
    /** Character who owns this movement component */
    protected owner: WELLY_Character;

    protected scene: WELLY_BaseScene;

    /** The physic body of the owner */
    protected ownerBody: Phaser.Physics.Arcade.Body;

    /** Walk speed */
    protected walkSpeed: number = 160;

    /** Walk speed */
    protected runSpeed: number = 250;

    protected tweenFollowPath: Phaser.Tweens.Tween | undefined;
    protected pathFollower: PathFollower | undefined;

    constructor(owner: WELLY_Character)
    {
        this.owner = owner;
        this.scene = owner.scene;
        this.ownerBody = owner.body as Phaser.Physics.Arcade.Body;
    }

    public destroy(): void
    {
        if (this.tweenFollowPath)
        {
            this.tweenFollowPath.remove();
            this.tweenFollowPath = undefined;
        }

        if (this.pathFollower)
        {
            this.pathFollower.destroy();
            this.pathFollower = undefined;
        }
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(spawnData: WELLY_SpawnData): void
    {
        this.walkSpeed = spawnData.walkSpeed ?? 0;
        this.runSpeed = spawnData.runSpeed ?? this.walkSpeed;
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    /** Move the character to the top */
    public walkUp(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(0, -speed);
        this.owner.setDirection(WELLY_DIRECTIONS.Up);
    }

    /** Move the character to the bottom */
    public walkDown(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(0, speed);
        this.owner.setDirection(WELLY_DIRECTIONS.Down);
    }

    /** Move the character to the left */
    public walkOnLeft(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(-speed, 0);
        this.owner.setDirection(WELLY_DIRECTIONS.Left);
    }

    /** Move the character to the right */
    public walkOnRight(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(speed, 0);
        this.owner.setDirection(WELLY_DIRECTIONS.Right);
    }

    /** Move the character to the top left */
    public walkUpLeft(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(-speed, -speed);
        this.owner.setDirection(WELLY_DIRECTIONS.UpLeft);
    }

    /** Move the character to the top right */
    public walkUpRight(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(speed, -speed);
        this.owner.setDirection(WELLY_DIRECTIONS.UpRight);
    }

     /** Move the character to the bottom left */
    public walkDownLeft(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(-speed, speed);
        this.owner.setDirection(WELLY_DIRECTIONS.DownLeft);
    }

    /** Move the character to the bottom right */
    public walkDownRight(): void
    {
        const speed = this.owner.wantsToRun ? this.runSpeed : this.walkSpeed;
        this.walk(speed, speed);
        this.owner.setDirection(WELLY_DIRECTIONS.DownRight);
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
        const path = this.scene.add.path(this.owner.x, this.owner.y);

        for (const point of config.positions)
        {
            path.lineTo(point.x, point.y);
        }

        this.pathFollower = this.scene.rexPathFollowerPlugin.add(this.owner, {
            path: path,
            t: 0,
            rotateToPath: false
        });

        this.tweenFollowPath = this.scene.tweens.add({
            targets: this.pathFollower,
            t: 1,
            ease: "Linear",
            duration: 1000 * path.getLength() / this.walkSpeed,
            repeat: 0,
            yoyo: false,
            onComplete: () => {
                this.pathFollower.destroy();
                this.owner.emit("MOVE_TO_END");
            },
            callbackScope: this
        });

        // let graphics = this.scene.add.graphics({
        //     lineStyle: {
        //         width: 3,
        //         color: 0xFFFF00,
        //         alpha: 1
        // }})
        // path.draw(graphics);
    }

    public isFollowingPath(): boolean
    {
        return (this.tweenFollowPath != undefined);
    }

    public pauseMoveTo(): void
    {
        if (this.tweenFollowPath && !this.tweenFollowPath.isPaused())
        {
            this.tweenFollowPath.pause();
        }
    }

    public resumeMoveTo(): void
    {
        if (this.tweenFollowPath && this.tweenFollowPath.isPaused())
        {
            this.tweenFollowPath.resume();
        }
    }
}