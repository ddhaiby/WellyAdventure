import { SpawnData } from "../../../Common/Characters/CharacterSpawner";
import { Npc } from "../../../Common/Characters/Npcs/Npc";
import { Welly_Scene } from "../../../Common/Scenes/WELLY_Scene";
import { JunkMonster } from "./JunkMonster";
import { CST } from "../../../Common/CST";

export class Turret extends Npc
{
    public scene: Welly_Scene;

    /** The level of this turret. The higher the stronger it is */
    protected level: number = 0;

    /** The monster this turret should attack */
    protected currentFocus: JunkMonster | undefined;

    /** Whether the turret is reloading. If true, the turret can't attack */
    protected isReloading: boolean = false;

    /** How many time the turret can attack per second */
    protected attackSpeed: number = 1; 

    protected waitingForUpgradeTween: Phaser.Tweens.Tween;

    protected levelText: Phaser.GameObjects.Text;

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);
        this.waitingForUpgradeTween = this.scene.tweens.add({ targets: this, alpha: 0.3, yoyo: true, duration: 600, repeat: -1 });
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

        const size = 100 + 10 * this.level;
        (this.body as Phaser.Physics.Arcade.Body).setSize(size, size);

        this.levelText.setText(`${this.level}`);
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
                        target.takeDamage(50);
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
}