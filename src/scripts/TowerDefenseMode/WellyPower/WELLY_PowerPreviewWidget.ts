import { WELLY_BaseScene } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_WellyPowerData } from "./WELLY_WellyPower";

export class WELLY_PowerPreviewWidget extends Phaser.GameObjects.Container 
{
    public scene: WELLY_BaseScene;

    private rangeIndicator: Phaser.GameObjects.Graphics;
    private powerData: WELLY_WellyPowerData;

    private isValid: boolean = true;

    constructor(scene: WELLY_BaseScene, x: number, y: number, powerData?: WELLY_WellyPowerData)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.rangeIndicator = this.scene.add.graphics();
        this.add(this.rangeIndicator);
        
        if (powerData)
        {
            this.setPowerData(powerData);
        }
    }

    public setPowerData(powerData: WELLY_WellyPowerData): void
    {
        this.powerData = powerData;
        this.drawRangeIndicator(powerData.range);
    }

    private drawRangeIndicator(range?: number) : void
    {
        range = range ?? 100;

        this.rangeIndicator.clear();
        this.rangeIndicator.fillStyle(this.isValid ? 0x0000AA : 0xAA0000, 0.25);
        this.rangeIndicator.fillCircle(0, 0, range * 0.5);
        this.rangeIndicator.lineStyle(3, this.isValid ? 0x0000FF : 0xFF0000, 0.8);
        this.rangeIndicator.strokeCircle(0, 0, range * 0.5);
    }

    public setValid(isValid: boolean): void
    {
        this.isValid = isValid;
        this.drawRangeIndicator(this.powerData.range);
    }
}