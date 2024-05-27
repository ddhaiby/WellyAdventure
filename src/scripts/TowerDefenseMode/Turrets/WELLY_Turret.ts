import { WELLY_SpawnData as WELLY_SpawnData } from "../../Common/Characters/WELLY_CharacterSpawner";
import { WELLY_Npc as WELLY_Npc } from "../../Common/Characters/Npcs/WELLY_Npc";
import { WELLY_BaseScene } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_JunkMonster } from "../Characters/Npcs/WELLY_JunkMonster";
import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_ITurretData as WELLY_ITurretData } from "../HUD/WELLY_TurretDataWidget";
import { WELLY_DIRECTION, WELLY_DIRECTIONS } from "../../Common/Characters/WELLY_CharacterMovementComponent";
import { WELLY_TurretData as WELLY_TurretData } from "./WELLY_TurretData";
import { WELLY_Utils } from "../../Utils/WELLY_Utils";

export declare type WELLY_TurretSpawnData = WELLY_SpawnData & 
{
    level: number;
    turretData: WELLY_TurretData;
};

export class WELLY_Turret extends WELLY_Npc implements WELLY_ITurretData
{
    public scene: WELLY_BaseScene;

    public body: Phaser.Physics.Arcade.Body;

    /** The level of this turret. The higher the stronger it is */
    protected level: number = 0;

    /** The max level of this turret. It will be determine with the turretData */
    protected maxLevel: number = 0;

    /** The monster this turret should attack */
    protected currentFocus: WELLY_JunkMonster | undefined;

    /** All the monsters this turret could attack */
    protected targetsInRange: WELLY_JunkMonster[] = [];

    /** Whether the turret is reloading. If true, the turret can't attack */
    protected isReloading: boolean = false;

    /** How many time the turret can attack per second */
    protected attackSpeed: number = 1;

    /** Attack speed bonus granted by the game or from bonus */
    protected bonusAttackSpeed: number = 0;

    /** Base damage to inflict to a target */
    protected damage: number = 50;

    /** Damage bonus granted by the game or from bonus */
    protected bonusDamage: number = 0;

    /** Range bonus granted by the game or from bonus */
    protected bonusRange: number = 0;

    /** For how long frozen enemies should stay in this state */
    protected freezeDuration: number = 0;

    /** How many targets should be frozen from an area attack. Set to 0 to freeze all targets in range */
    protected freezeTargetCount: number = 0;

    // TODO: Make an enum or use CST
    protected attackType: string = "projectile";

    /** Text that shows the current level of the turret */
    protected levelText: Phaser.GameObjects.Text;

    protected rangeIndicator: Phaser.GameObjects.Graphics;

    protected turretData: WELLY_TurretData;

    protected attackFunction: Function;

    constructor(scene: WELLY_BaseScene, x: number, y: number)
    {
        super(scene, x, y);

        this.levelText = this.scene.add.text(this.x + 8, this.y + 8, "", {fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY, fontSize: "28px", color: WELLY_CST.STYLE.COLOR.LIGHT_BLUE, stroke: "black", strokeThickness: 3});

        this.rangeIndicator = this.scene.add.graphics();
        this.hideRangeIndicator();

        this.targetsInRange = [];
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
            const framePerAnim = this.turretData.gameStatsPerLevel[this.level].framePerAnim;

            const directions = Object.keys(WELLY_DIRECTIONS);
            for (let i = 0; i < directions.length; ++i)
            {
                const direction = directions[i];
                const animKey = `Idle${direction}`;

                this.anims.remove(animKey);
                this.anims.create({
                    key: animKey,
                    frames: this.anims.generateFrameNumbers(key, { start: i * framePerAnim, end: i * framePerAnim }),
                    frameRate: 1,
                    repeat: 0
                });
            }
        }
        return this;
    }

    public disableBody(disableGameObject?: boolean | undefined, hideGameObject?: boolean | undefined): this
    {
        this.setCurrentFocus(undefined);
        return super.disableBody(disableGameObject, hideGameObject);
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(spawnData: WELLY_TurretSpawnData): void
    {
        super.init(spawnData);

        this.turretData = spawnData.turretData;
        this.maxLevel = this.turretData.gameStatsPerLevel.length - 1;

        // TODO: Make an attack component so the turret could stack a few types of attack and have them handled independently
        // Example: A turret could usually throw projectile and then get a welly bonus that frozes/hurts an area
        // Could also be another projectile fired in addition BUT independently
        this.attackFunction = (spawnData.turretData.attackType == "projectile") ? this.attackProjectile : this.attackArea;

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
        this.updateCurrentFocus();
        this.updateAnimations();
    }

    protected updateCurrentFocus(): void
    {
        for (const target of this.targetsInRange)
        {
            if (!this.scene.physics.overlap(target, this))
            {
                Phaser.Utils.Array.Remove(this.targetsInRange, target);
            }
        }

        if (this.currentFocus && !this.targetsInRange.includes(this.currentFocus))
        {
            this.setCurrentFocus(undefined);
        }
    }

    protected updateAnimations(): void
    {
        super.updateAnimations();

        if (!this.currentFocus)
        {
            return;
        }

        const rotation = Math.atan2(this.y - this.currentFocus.y, this.x - this.currentFocus.x) * 180 / Math.PI;
        const threshold = 22.5;
        
        if (rotation > 0)
        {
            if (rotation < threshold)
            {
                this.setDirection(WELLY_DIRECTIONS.Left);
            }
            else if (rotation < 90 - threshold)
            {
                this.setDirection(WELLY_DIRECTIONS.UpLeft);
            }
            else if (rotation < 90 + threshold)
            {
                this.setDirection(WELLY_DIRECTIONS.Up);
            }
            else if (rotation < 180 - threshold)
            {
                this.setDirection(WELLY_DIRECTIONS.UpRight);
            }
            else
            {
                this.setDirection(WELLY_DIRECTIONS.Right);
            }
        }
        else if (rotation > -threshold)
        {
            this.setDirection(WELLY_DIRECTIONS.Left);
        }
        else if (rotation > -90 + threshold)
        {
            this.setDirection(WELLY_DIRECTIONS.DownLeft);
        }
        else if (rotation > -90 - threshold)
        {
            this.setDirection(WELLY_DIRECTIONS.Down);
        }
        else if (rotation > -180 + threshold)
        {
            this.setDirection(WELLY_DIRECTIONS.DownRight);
        }
        else
        {
            this.setDirection(WELLY_DIRECTIONS.Right);
        }

        this.anims.play(`Idle${this.currentDirection}`, true);
    }
    
    protected setCurrentFocus(inFocus: WELLY_JunkMonster | undefined): void
    {
        if (this.currentFocus != inFocus)
        {
            this.currentFocus = inFocus;

            if (this.currentFocus)
            {
                this.attackFunction();
            }
        }
    }

    public onMonsterInRange(monster: WELLY_JunkMonster): void
    {
        Phaser.Utils.Array.Add(this.targetsInRange, monster);

        if (!this.currentFocus)
        {
            this.setCurrentFocus(monster);
        }
        else
        {
            this.setCurrentFocus(this.getClosestFocus(this.currentFocus, monster));
        }
    }

    protected getClosestFocus(monster1: WELLY_JunkMonster, monster2: WELLY_JunkMonster): WELLY_JunkMonster
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
        if ((level >= 0) && (level <= this.maxLevel))
        {
            this.level = level;
            this.levelText.setText(`${this.level + 1}`);

            const gameStats = this.turretData.gameStatsPerLevel[level];

            this.damage = gameStats.damage ?? 0;
            this.attackSpeed = gameStats.attackSpeed;
            this.freezeDuration = gameStats.freezeDuration ?? 0;
            this.freezeTargetCount = gameStats.freezeTargetCount ?? 0;
            this.setRange(gameStats.range);
            this.setTexture(gameStats.texture);

            this.emit("upgrade", this);
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

    public getTurretId(): string
    {
        return this.turretData.id;
    }

    public getUpgradePrice(): number
    {
        return this.isLevelMax() ? Infinity : this.turretData.gameStatsPerLevel[this.level].price;
    }

    public isLevelMax(): boolean
    {
        return (this.level >= this.maxLevel);
    }

    protected attackProjectile(): void
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
                        target.takeDamage(this.getCurrentDamage(), this);
                        target.freeze(this.freezeDuration);
                    }
                    bullet.destroy();
                }
            });

            this.reload();
        }
    }

    protected attackArea(): void
    {
        if (!this.isReloading && this.currentFocus)
        {
            if ((this.freezeTargetCount > 0) && (this.freezeTargetCount < this.targetsInRange.length))
            {
                let targetsIndexes = WELLY_Utils.iota(this.targetsInRange.length, 0);
                const count = Math.min(targetsIndexes.length, this.freezeTargetCount);

                for (let i = 0; i < count; ++i)
                {
                    const targetIndex = Phaser.Math.Between(0, targetsIndexes.length - 1);
                    const target = this.targetsInRange[targetsIndexes[targetIndex]];

                    target.takeDamage(this.getCurrentDamage(), this);
                    target.freeze(this.freezeDuration);

                    Phaser.Utils.Array.Remove(targetsIndexes, targetIndex);
                }
            }
            else
            {
                for (const target of this.targetsInRange)
                {
                    target.takeDamage(this.getCurrentDamage(), this);
                    target.freeze(this.freezeDuration);
                }
            }

            this.reload();
        }
    }

    protected reload(): void
    {
        this.isReloading = true;

        this.scene.time.delayedCall(1000 / this.getCurrentAttackSpeed(), () => {
            this.isReloading = false;
            this.attackFunction();
        }, undefined, this);
    }

    public getNextStat(statName: string): number
    {
        if (this.turretData)
        {
            const nextLevel = this.level + 1;
            if ((nextLevel >= 0) && (nextLevel < this.turretData.gameStatsPerLevel.length))
            {
                return this.turretData.gameStatsPerLevel[nextLevel][statName];
            }
        }

        return this.turretData.gameStatsPerLevel[this.level][statName];
    }

    public getCurrentDamage(): number
    {
        return this.damage + this.bonusDamage;
    }

    public getNextDamage(): number
    {
        return this.getNextStat("damage") + this.bonusDamage;
    }

    public setBonusDamage(bonusDamage: number): void
    {
        this.bonusDamage = bonusDamage;
    }

    public getCurrentAttackSpeed(): number
    {
        return this.attackSpeed + this.bonusAttackSpeed;
    }

    public getNextAttackSpeed(): number
    {
        return this.getNextStat("attackSpeed") + this.bonusAttackSpeed;
    }

    public setBonusAttackSpeed(bonusAttackSpeed: number): void
    {
        this.bonusAttackSpeed = bonusAttackSpeed;
    }

    public getCurrentRange(): number
    {
        return this.body.width * 0.5;
    }

    public getNextRange(): number
    {
        return this.getNextStat("range") * 0.5 + this.bonusRange;
    }

    protected setRange(range: number): void
    {
        const bodySize = range;
        this.body.setSize(bodySize, bodySize);
    }

    public setBonusRange(bonusRange: number): void
    {
        // Reset the range with the new bonusRange.
        this.setRange(this.body.width - this.bonusRange + bonusRange);
        this.bonusRange = bonusRange;
    }

    public getLevel(): number
    {
        return this.level;
    }

    public getNextLevel(): number
    {
        return Math.min(this.level + 1, this.maxLevel);
    }

    public showRangeIndicator(): void
    {
        if (!this.rangeIndicator.visible)
        {
            this.hideRangeIndicator();

            const range = this.getCurrentRange();
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