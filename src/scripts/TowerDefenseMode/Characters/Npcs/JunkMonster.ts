import { DIRECTIONS } from "../../../Common/Characters/CharacterMovementComponent";
import { SpawnData } from "../../../Common/Characters/CharacterSpawner";
import { Npc } from "../../../Common/Characters/Npcs/Npc";
import { WELLY_Bar } from "../../../Common/HUD/WELLY_Bar";
import { Welly_Scene } from "../../../Common/Scenes/WELLY_Scene";
import { MonsterSpawnerData } from "../../WaveSystem/WaveSpawner";

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

    /** How much gold the player gets from killing this monster */
    private gold: number = 50;

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

    public init(monseterSpawnData: MonsterSpawnerData): void
    {
        super.init(monseterSpawnData);

        this.setDepth(monseterSpawnData.depth ?? 0);
        this.health = monseterSpawnData.health;
        this.maxHealth = this.health;
        this.gold = monseterSpawnData.gold;
        this.damage = monseterSpawnData.damage;
        
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

    public setHealth(inHealth: number): void
    {
        const oldHealth = this.health;

        this.health = Phaser.Math.Clamp(inHealth, 0, this.maxHealth);
        this.healthBar.setValue(this.health / this.maxHealth);

        if ((this.health <= 0) && (oldHealth > 0))
        {
            this.die();
        }
    }

    public takeDamage(damage: number): void
    {
        this.setHealth(this.health - damage);
    }

    public die(): void
    {
        this.health = 0;
        this.stopWalking();
        this.disableBody(true, true);

        this.emit("DIE");
    }

    public onDie(fn: () => void , context?: any): void
    {
        this.on("DIE", fn, context);
    }

    public getGold(): number
    {
        return this.gold;
    }

    public getDamage(): number
    {
        return this.damage;
    }
}