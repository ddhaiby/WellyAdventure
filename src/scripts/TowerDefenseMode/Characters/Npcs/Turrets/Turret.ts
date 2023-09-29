import { SpawnData } from "../../../../Common/Characters/CharacterSpawner";
import { Npc } from "../../../../Common/Characters/Npcs/Npc";
import { Welly_Scene } from "../../../../Common/Scenes/WELLY_Scene";
import { JunkMonster } from "../JunkMonster";
import { CST } from "../../../../Common/CST";
import { ITurretData } from "../../../HUD/TurretDataWidget";
import { DIRECTIONS } from "../../../../Common/Characters/CharacterMovementComponent";
import { TurretData } from "../../../Turrets/TurretData";

export declare type TurretSpawnData = SpawnData & 
{
    level: number;
    turretDataPerLevel: TurretData[];
};

export class Turret extends Npc implements ITurretData
{
    public scene: Welly_Scene;

    public body: Phaser.Physics.Arcade.Body;

    /** The level of this turret. The higher the stronger it is */
    protected level: number = 0;

    /** The max level of this turret. It will be determine with turretDataPerLevel */
    protected maxLevel: number = 0;

    /** The monster this turret should attack */
    protected currentFocus: JunkMonster | undefined;

    /** Whether the turret is reloading. If true, the turret can't attack */
    protected isReloading: boolean = false;

    /** How many time the turret can attack per second */
    protected attackSpeed: number = 1;

    /** Base damage to inflict to a target */
    protected damage: number = 50;

    /** Text that shows the current level of the turret */
    protected levelText: Phaser.GameObjects.Text;

    protected rangeIndicator: Phaser.GameObjects.Graphics;

    protected turretDataPerLevel: TurretData[];

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);

        this.levelText = this.scene.add.text(this.x + 8, this.y + 8, "", {fontFamily: CST.STYLE.TEXT.FONT_FAMILY, fontSize: "28px", color: CST.STYLE.COLOR.LIGHT_BLUE, stroke: "black", strokeThickness: 3});

        this.rangeIndicator = this.scene.add.graphics();
        this.hideRangeIndicator();
    }

    public setPosition(x?: number | undefined, y?: number | undefined, z?: number | undefined, w?: number | undefined): this
    {
        super.setPosition(x, y, z, w);
        if (this.levelText)
        {
            this.levelText.setPosition(this.x + 8, this.y + 8);
        }

        return this;
    }

    public setTexture(key: string, frame?: string | number | undefined): this
    {
        super.setTexture(key, frame);

        if (key != undefined && key != "__MISSING" && key != "")
        {
            const directions = Object.keys(DIRECTIONS);
            for (let i = 0; i < directions.length; ++i)
            {
                const direction = directions[i];
                const animKey = `Idle${direction}`;

                this.anims.remove(animKey);
                this.anims.create({
                    key: animKey,
                    frames: this.anims.generateFrameNumbers(key, { start: i * 4, end: i * 4 }),
                    frameRate: 1,
                    repeat: 0
                });
            }
        }
        return this;
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(spawnData: TurretSpawnData): void
    {
        super.init(spawnData);

        this.turretDataPerLevel = spawnData.turretDataPerLevel;
        this.maxLevel = this.turretDataPerLevel.length - 1;

        this.upgradeTo(spawnData.level);
    }

    protected initPhysic(): void
    {
    }

    protected initAnimations(texture: string): void
    {
        this.setTexture(texture);
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    public update(): void
    {
        super.update();
        
        if (this.currentFocus && !this.scene.physics.overlap(this.currentFocus, this))
        {
            this.setCurrentFocus(undefined);
        }
    }

    protected setCurrentFocus(inFocus: JunkMonster | undefined): void
    {
        if (this.currentFocus != inFocus)
        {
            this.currentFocus = inFocus;

            if (this.currentFocus)
            {
                this.attack();
            }
        }
    }

    public onMonsterInRange(monster: JunkMonster): void
    {
        if (!this.currentFocus)
        {
            this.setCurrentFocus(monster);
        }
        else
        {
            this.setCurrentFocus(this.getClosestFocus(this.currentFocus, monster));
        }
    }

    protected getClosestFocus(monster1: JunkMonster, monster2: JunkMonster): JunkMonster
    {
        const distMonster1 = Math.abs(this.x - monster1.x) + Math.abs(this.y - monster1.y);
        const distMonster2 = Math.abs(this.x - monster2.x) + Math.abs(this.y - monster2.y);

        return (distMonster1 <= distMonster2) ? monster1 : monster2;
    }

    public upgrade(levelIncrease: number = 1): void
    {
        this.upgradeTo(this.level + levelIncrease);
    }

    public upgradeTo(level: number): void
    {
        if ((level >= 0) && (level < this.maxLevel))
        {
            this.level = level;
            this.levelText.setText(`${this.level + 1}`);

            const turretData = this.turretDataPerLevel[level];
            
            this.damage = turretData.damage;
            this.attackSpeed = turretData.attackSpeed;
            this.setRange(turretData.range);
            this.setTexture(turretData.texture)

            this.emit("upgrade");
            this.onUpgrade();
        }
    }

    public canUpgrade(): boolean
    {
        return !this.isLevelMax();
    }

    protected onUpgrade(): void
    {
        if (this.rangeIndicator.visible)
        {
            this.hideRangeIndicator();
            this.showRangeIndicator();
        }
    }

    public getUpgradePrice(): number
    {
        return this.isLevelMax() ? Infinity : this.turretDataPerLevel[this.level].price;
    }

    public isLevelMax(): boolean
    {
        return (this.level >= this.maxLevel);
    }

    protected attack(): void
    {
        if (!this.isReloading && this.currentFocus)
        {
            const bullet = this.scene.add.image(this.x, this.y, "bullet");
            const target = this.currentFocus;

            this.scene.tweens.add({
                targets: bullet,
                x: this.currentFocus.x,
                y: this.currentFocus.y,
                duration: 80,
                onCompleteScope: this,
                onComplete: () => {
                    if (target)
                    {
                        target.takeDamage(this.damage);
                    }
                    bullet.destroy();
                }
            });

            this.reload();

            const rotation = Math.atan2(this.y - this.currentFocus.y, this.x - this.currentFocus.x) * 180 / Math.PI;
            const threshold = 22.5;
            if (rotation > 0)
            {
                if (rotation < threshold)
                {
                    this.setDirection(DIRECTIONS.Left);
                }
                else if (rotation < 90 - threshold)
                {
                    this.setDirection(DIRECTIONS.UpLeft);
                }
                else if (rotation < 90 + threshold)
                {
                    this.setDirection(DIRECTIONS.Up);
                }
                else if (rotation < 180 - threshold)
                {
                    this.setDirection(DIRECTIONS.UpRight);
                }
                else
                {
                    this.setDirection(DIRECTIONS.Right);
                }
            }
            else if (rotation > -threshold)
            {
                this.setDirection(DIRECTIONS.Left);
            }
            else if (rotation > -90 + threshold)
            {
                this.setDirection(DIRECTIONS.DownLeft);
            }
            else if (rotation > -90 - threshold)
            {
                this.setDirection(DIRECTIONS.Down);
            }
            else if (rotation > -180 + threshold)
            {
                this.setDirection(DIRECTIONS.DownRight);
            }
            else
            {
                this.setDirection(DIRECTIONS.Right);
            }

            this.anims.play(`Idle${this.currentDirection}`, true);
        }
    }

    protected reload(): void
    {
        this.isReloading = true;

        console.log(this.attackSpeed)
        this.scene.time.delayedCall(1000 / this.attackSpeed, () => {
            this.isReloading = false;

            if (this.currentFocus)
            {
                this.attack();
            }
        }, undefined, this);
    }

    public getDamage(): number
    {
        return this.damage;
    }

    public getAttackSpeed(): number
    {
        return this.attackSpeed;
    }

    public getRange(): number
    {
        return this.body.width * 0.5;
    }

    protected setRange(range: number): void
    {
        const bodySize = range;
        this.body.setSize(bodySize, bodySize);
    }

    public getLevel(): number
    {
        return this.level;
    }

    public showRangeIndicator(): void
    {
        if (!this.rangeIndicator.visible)
        {
            this.hideRangeIndicator();

            const range = this.getRange();
            this.rangeIndicator.fillStyle(0x0000AA, 0.25);
            this.rangeIndicator.fillCircle(this.x, this.y, range);
            this.rangeIndicator.lineStyle(3, 0x0000FF, 0.8);
            this.rangeIndicator.strokeCircle(this.x, this.y, range);

            this.rangeIndicator.setVisible(true);
        }
    }

    public hideRangeIndicator(): void
    {
        this.rangeIndicator.clear();
        this.rangeIndicator.setVisible(false);
    }
}