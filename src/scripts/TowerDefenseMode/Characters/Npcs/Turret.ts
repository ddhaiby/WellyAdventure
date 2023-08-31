import { Npc } from "../../../Common/Characters/Npcs/Npc";
import { Welly_Scene } from "../../../Common/Scenes/WELLY_Scene";
import { JunkMonster } from "./JunkMonster";

export class Turret extends Npc
{
    public scene: Welly_Scene;

    /** The level of this turret. The higher the stronger it is */
    protected level: 0;

    /** The monster this turret should attack */
    protected currentFocus: JunkMonster | undefined;

    /** Whether the turret is reloading. If true, the turret can't attack */
    protected isReloading: boolean = false;

    /** How many time the turret can attack per second */
    protected attackSpeed: number = 1; 

    constructor(scene: Welly_Scene, x: number, y: number)
    {
        super(scene, x, y);

        this.setAlpha(1);
        const tween = this.scene.tweens.add({ targets: this, alpha: 0.3, yoyo: true, duration: 600, repeat: -1 });
        
        this.setInteractive();
        this.once(Phaser.Input.Events.POINTER_UP, () => {
            this.setTexture("canon");
            this.setAlpha(1);
            tween.stop();
        }, this);

        this.once(Phaser.Input.Events.POINTER_UP, () => {
            this.upgrade();
        }, this);
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    protected initPhysic(): void
    {
    }

    protected initAnimations(texture: string): void
    {
       // this.setTexture("");
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

        console.log(this.currentFocus)
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

    protected upgrade(levelIncrease: number = 1): void
    {
        this.level += levelIncrease;
        (this.body as Phaser.Physics.Arcade.Body).setSize(200, 200);
    }

    protected attack(): void
    {
        if (!this.isReloading && this.currentFocus)
        {
            this.currentFocus.takeDamage(25);

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