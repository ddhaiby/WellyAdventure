import { WELLY_SceneTowerDefense } from "../Scenes/WELLY_SceneTowerDefense";

export declare type WELLY_WellyPowerData = {
    id: string;
    activated: boolean;
    name: string;
    description: string;
    image: string;
    cooldownInSec: number;
    duration?: number | undefined;
    shouldAim?: boolean | undefined;
    range?: number | undefined;
}

export class WELLY_WellyPower extends Phaser.Events.EventEmitter
{
    protected scene: WELLY_SceneTowerDefense;

    protected id: string;
    protected cooldown: number = 0;
    protected duration: number = 0;

    protected powerData: WELLY_WellyPowerData;

    protected isInCooldown: boolean = false;

    constructor(scene: WELLY_SceneTowerDefense, powerData: WELLY_WellyPowerData)
    {
        super();

        this.scene = scene;

        this.powerData = powerData;
        this.id = powerData.id;
        this.cooldown = powerData.cooldownInSec * 1000;
        this.duration = powerData.duration ? powerData.duration * 1000 : 0;
    }

    public getPowerData(): WELLY_WellyPowerData
    {
        return this.powerData;
    }

    public canActivate(x?: number, y?: number): boolean
    {
        return !this.isInCooldown;
    }

    public tryActivate(x?: number, y?: number): void
    {
        if (!this.canActivate(x, y))
        {
            // Add a negative sound
        }
        else
        {
            this.activate(x, y);
        }
    }

    protected activate(x?: number, y?: number): void
    {
        this.onActivated();
    }

    public onActivated(): void
    {
        this.startCooldown();

        if (this.duration > 0)
        {
            this.scene.time.delayedCall(this.duration, () => {
                this.deactivate();
            }, undefined, this);
        }
    }

    public deactivate(): void
    {
    }

    protected startCooldown(): void
    {
        this.isInCooldown = true;
        this.emit("cooldownStarted", this.id, this.cooldown);

        this.scene.time.delayedCall(this.cooldown, () => {
            this.isInCooldown = false;
        this.emit("cooldownEnded", this.id, this.cooldown);
        }, undefined, this);
    }
}