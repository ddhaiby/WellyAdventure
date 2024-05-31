import { WELLY_JunkMonster } from "../Characters/Npcs/WELLY_JunkMonster";
import { WELLY_SceneTowerDefense } from "../Scenes/WELLY_SceneTowerDefense";
import { WELLY_WellyPower, WELLY_WellyPowerData } from "./WELLY_WellyPower";

export class WELLY_WellyPower_DotArea extends WELLY_WellyPower
{
    protected scene: WELLY_SceneTowerDefense;
    protected damageZone: Phaser.GameObjects.Zone;

    protected updateTimer: Phaser.Time.TimerEvent | undefined;

    /** All the monsters this power could attack */
    protected targetsInRange: WELLY_JunkMonster[] = [];

    protected rainParticles: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: WELLY_SceneTowerDefense, wellyPowerData: WELLY_WellyPowerData)
    {
        super(scene, wellyPowerData);

        this.damageZone = this.scene.add.zone(0, 0, 1, 1);
        this.scene.physics.add.existing(this.damageZone, true);

        // @ts-ignore
        this.scene.physics.add.overlap(this.damageZone, this.scene.waveManager.getMonsters(), (damageZone: Phaser.GameObjects.Zone, monster: WELLY_JunkMonster) => {
            if (this.damageZone.active)
            {
                Phaser.Utils.Array.Add(this.targetsInRange, monster);
            }
        }, undefined, this);
    }

    public activate(x?: number, y?: number): void
    {
        const range = this.powerData.range ?? 100;
        const body = this.damageZone.body as Phaser.Physics.Arcade.StaticBody;

        this.damageZone.setPosition(x, y);
        this.damageZone.setSize(range, range);

        body.position.x = this.damageZone.x - range * 0.5;
        body.position.y = this.damageZone.y - range * 0.5;
        body.width = range;
        body.height = range;

        this.damageZone.setActive(true);

        this.updateTimer = this.scene.time.addEvent({
            delay: 200,
            callback: this.update,
            callbackScope: this,
            loop: true
        });

        super.activate(x, y);

        const offsetY = -50;

        this.rainParticles = this.scene.add.particles(0, 0, "tenderParticle", {
            x: 0,
            y: 0,
            lifespan: 400,
            speedY: { min: 300, max: 600 },
            gravityY: 800,
            quantity: 5,
            frequency: 100,
            alpha: { start: 1, end: 0.5 },
            scale: { start: 0.6, end: 0.2 },
            rotate: { start: 0, end: 360 },
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Rectangle(this.damageZone.x - range * 0.5, this.damageZone.y - range * 0.5 + offsetY, range, range * 0.5)
            },
            deathZone: {
                type: 'onLeave',
                source: new Phaser.Geom.Circle(this.damageZone.x, this.damageZone.y + offsetY, range * 0.5),
            }
        });
    }

    public deactivate(): void {
        super.deactivate();

        this.damageZone.setActive(false);

        this.updateTimer?.remove();
        this.updateTimer = undefined;

        this.rainParticles.destroy();
    }

    protected update(): void
    {
        const damage = (1 + 0.15 * this.scene.getCurrentWave()) * 20;

        for (const target of this.targetsInRange)
        {
            if (this.scene.physics.overlap(target, this.damageZone))
            {
                target.takeDamage(damage, undefined);
            }
            else
            {
                Phaser.Utils.Array.Remove(this.targetsInRange, target);
            }
        }
    }
}