import { Npc } from "../../../Common/Characters/Npcs/Npc";
import { Welly_Scene } from "../../../Common/Scenes/WELLY_Scene";

export class Turret extends Npc
{
    public scene: Welly_Scene;

    protected level: 0;

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

    protected initPhysic(): void
    {
    }

    protected initAnimations(texture: string): void
    {        
       // this.setTexture("");
    }

    protected upgrade(levelIncrease: number = 1): void
    {
        this.level += levelIncrease;
        (this.body as Phaser.Physics.Arcade.Body).setSize(200, 200);
    }
}