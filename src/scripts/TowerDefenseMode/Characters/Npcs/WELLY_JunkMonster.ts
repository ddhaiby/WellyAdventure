import { WELLY_DIRECTION, WELLY_DIRECTIONS } from "../../../Common/Characters/WELLY_CharacterMovementComponent";
import { WELLY_SpawnData } from "../../../Common/Characters/WELLY_CharacterSpawner";
import { WELLY_Npc } from "../../../Common/Characters/Npcs/WELLY_Npc";
import { WELLY_Bar } from "../../../Common/HUD/WELLY_Bar";
import { WELLY_BaseScene } from "../../../Common/Scenes/WELLY_BaseScene";
import { WELLY_MonsterSpawnerData } from "../../WaveSystem/WELLY_WaveInstance";
import { WELLY_Turret } from "./Turrets/WELLY_Turret";

export class WELLY_JunkMonster extends WELLY_Npc
{
    public scene: WELLY_BaseScene;

    public body: Phaser.Physics.Arcade.Body;

    /** Component showing the health */
    protected healthBar: WELLY_Bar;

    /** Health of the monster. The mosnter is considered dead when it reaches 0 */
    private health: number = 100;

    /** Max health of the monster */
    private maxHealth: number = 100;

    /** How much coin the player gets from killing this monster */
    private coin: number = 50;

    /** Damage of the monster when they reach the end */
    private damage: number = 10;

    protected healthBarOffsetX: number = 0;
    protected healthBarOffsetY: number = -6;

    private prevX: number = 0;
    private prevY: number = 0;

    constructor(scene: WELLY_BaseScene, x: number, y: number)
    {
        super(scene, x, y);

        scene.physics.add.existing(this);
        this.setCollideWorldBounds(false);

        this.prevX = this.x;
        this.prevY = this.x;
    }

    public destroy(fromScene?: boolean | undefined): void
    {
        if (this.healthBar)
        {
            this.healthBar.destroy(fromScene);
        }
        super.destroy(fromScene);
    }

    public setDepth(value: number): this
    {
        if (this.healthBar)
        {
            this.healthBar.setDepth(value);
        }
        
        return super.setDepth(value);
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(monsterSpawnData: WELLY_MonsterSpawnerData): void
    {
        super.init(monsterSpawnData);

        this.setDepth(monsterSpawnData.depth ?? 0);
        this.health = monsterSpawnData.health;
        this.maxHealth = this.health;
        this.coin = monsterSpawnData.coin;
        this.damage = monsterSpawnData.damage;
        
        this.initHealthBar();
    }

    protected initAnimations(texture: string): void
    {
        if (texture == undefined || texture == "__MISSING")
        {
            return;
        }

        this.setTexture(texture);

        const directions = Object.keys(WELLY_DIRECTIONS);
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

    protected initHealthBar(): void
    {
        this.healthBar = new WELLY_Bar(this.scene, {
            width: 36,
            height: 4,
            radius: 2,
            value: 1,
            color: 0xFF0000
        });
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    public update(): void
    {
        super.update();
        
        this.healthBar.setX(this.x - this.healthBar.width * 0.5 + this.healthBarOffsetX);
        this.healthBar.setY(this.y - this.height * 0.5 - this.healthBar.height + this.healthBarOffsetY);
    }

    protected updateControls(): void
    {
        super.updateControls();
    }

    protected updateAnimations(): void
    {
        super.updateAnimations();

        const threshold = 0.001;
        const velocityX = this.x - this.prevX;
        const velocityY = this.y - this.prevY;

        let directionV = "";
        let directionH = "";
        let hasMoved = false;

        if (velocityX > threshold)
        {
            directionH = WELLY_DIRECTIONS.Right;
            hasMoved = true;
        }
        else if (velocityX < -threshold)
        {
            directionH = WELLY_DIRECTIONS.Left;
            hasMoved = true;
        }

        if (velocityY > threshold)
        {
            directionV = WELLY_DIRECTIONS.Down;
            hasMoved = true;
        }
        else if (velocityY < -threshold)
        {
            directionV = WELLY_DIRECTIONS.Up;
            hasMoved = true;
        }

        const direction = directionV + directionH as WELLY_DIRECTION;
        this.setDirection(direction);

        this.prevX = this.x;
        this.prevY = this.y;

        if (hasMoved)
        {
            this.anims.play(`Walk${this.currentDirection}`, true);
        }
        else
        {
            this.anims.play(`Idle${this.currentDirection}`, true);
        }
    }

    public getHealth(): number
    {
        return this.health;
    }

    public getMaxHealth(): number
    {
        return this.maxHealth;
    }

    public setHealth(inHealth: number, source?: WELLY_Turret): void
    {
        const oldHealth = this.health;

        this.health = Phaser.Math.Clamp(inHealth, 0, this.maxHealth);
        this.healthBar.setValue(this.health / this.maxHealth);

        if ((this.health <= 0) && (oldHealth > 0))
        {
            this.die(source);
        }
    }

    public setMaxHealth(inMaxHealth: number): void
    {
        if (inMaxHealth > 0)
        {
            this.maxHealth = inMaxHealth;
            this.health = Math.min(this.health, this.maxHealth);
        }
    }

    public takeDamage(damage: number, damager?: WELLY_Turret): void
    {
        if (this.isAlive())
        {
            this.setHealth(this.health - damage, damager);
        }
    }

    public isAlive(): boolean
    {
        return (this.health > 0)
    }

    public die(sourceTurret?: WELLY_Turret): void
    {
        this.health = 0;
        this.stopWalking();

        if (this.body)
        {
            this.disableBody(true, true);
        }

        this.emit("DIE", sourceTurret);
    }

    public getCoin(): number
    {
        return this.coin;
    }

    public getCurrentDamage(): number
    {
        return this.damage;
    }
}