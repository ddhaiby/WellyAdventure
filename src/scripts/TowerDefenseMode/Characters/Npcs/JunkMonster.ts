import { DIRECTIONS } from "../../../Common/Characters/CharacterMovementComponent";
import { SpawnData } from "../../../Common/Characters/CharacterSpawner";
import { Npc } from "../../../Common/Characters/Npcs/Npc";
import { WELLY_Bar } from "../../../Common/HUD/WELLY_Bar";
import { Welly_Scene } from "../../../Common/Scenes/WELLY_Scene";
import { MonsterSpawnerData } from "../../WaveSystem/WaveInstance";
import { Turret } from "./Turrets/Turret";

export class JunkMonster extends Npc
{
    public scene: Welly_Scene;

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

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(false);
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

    public init(monsterSpawnData: MonsterSpawnerData): void
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

        if ((this.body as Phaser.Physics.Arcade.Body).velocity.length() > 0)
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

    public setHealth(inHealth: number, source?: Turret): void
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

    public takeDamage(damage: number, damager?: Turret): void
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

    public die(sourceTurret?: Turret): void
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