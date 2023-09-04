import { SpawnData } from "../../../../Common/Characters/CharacterSpawner";
import { Npc } from "../../../../Common/Characters/Npcs/Npc";
import { Welly_Scene } from "../../../../Common/Scenes/WELLY_Scene";
import { JunkMonster } from "../JunkMonster";
import { CST } from "../../../../Common/CST";
import { ITurretData } from "../../../HUD/TurretDataWidget";

export class Turret extends Npc implements ITurretData
{
    public scene: Welly_Scene;

    public body: Phaser.Physics.Arcade.Body;

    /** The level of this turret. The higher the stronger it is */
    protected level: number = 0;

    /** The monster this turret should attack */
    protected currentFocus: JunkMonster | undefined;

    /** Whether the turret is reloading. If true, the turret can't attack */
    protected isReloading: boolean = false;

    /** How many time the turret can attack per second */
    protected attackSpeed: number = 1;

    /** Base damage to inflict to a target */
    protected damage: number = 50;

    protected waitingForUpgradeTween: Phaser.Tweens.Tween;

    /** Text that shows the current level of the turret */
    protected levelText: Phaser.GameObjects.Text;

    protected rangeIndicator: Phaser.GameObjects.Graphics;

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);
        
        this.waitingForUpgradeTween = this.scene.tweens.add({ targets: this, alpha: 0.3, yoyo: true, duration: 600, repeat: -1 });

        this.rangeIndicator = this.scene.add.graphics();
        this.hideRangeIndicator();
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(spawnData?: SpawnData): void
    {
        super.init(spawnData);

        this.levelText = this.scene.add.text(this.x + 8, this.y + 8, "", {fontFamily: CST.STYLE.TEXT.FONT_FAMILY, fontSize: "28px", color: CST.STYLE.COLOR.LIGHT_BLUE, stroke: "black", strokeThickness: 3});
    }

    protected initPhysic(): void
    {
    }

    protected initAnimations(texture: string): void
    {
    }

    // Upgrade
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
        this.level += levelIncrease;

        this.setTexture("canon");
        this.setAlpha(1);
        this.waitingForUpgradeTween.stop();

        const size = 200 + 10 * this.level;
        this.body.setSize(size, size);

        this.levelText.setText(`${this.level}`);

        this.emit("upgrade");
        this.onUpgrade();
    }

    protected onUpgrade(): void
    {
        if (this.rangeIndicator.visible)
        {
            this.hideRangeIndicator();
            this.showRangeIndicator();
        }
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
        }
    }

    protected reload(): void
    {
        this.isReloading = true;

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