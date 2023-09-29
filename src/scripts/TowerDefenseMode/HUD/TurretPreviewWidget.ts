import { Welly_Scene } from "../../Common/Scenes/WELLY_Scene";
import { TurretData } from "../Turrets/TurretData";

export class TurretPreviewWidget extends Phaser.GameObjects.Container 
{
    public scene: Welly_Scene;

    private turretImage: Phaser.GameObjects.Image;
    private rangeIndicator: Phaser.GameObjects.Graphics;
    private turretData: TurretData;

    private isValid: boolean = true;

    constructor(scene: Welly_Scene, x: number, y: number, turretData?: TurretData)
    {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.rangeIndicator = this.scene.add.graphics();
        this.add(this.rangeIndicator);
        
        this.turretImage = this.scene.add.image(0, 0, "");
        this.add(this.turretImage);

        if (turretData)
        {
            this.setTurretData(turretData);
        }
    }

    public setTurretData(turretData: TurretData): void
    {
        this.turretData = turretData;
        this.turretImage.setTexture(turretData.texture);
        this.drawRangeIndicator(turretData.range);
    }

    private drawRangeIndicator(range: number) : void
    {
        this.rangeIndicator.clear();
        this.rangeIndicator.fillStyle(this.isValid ? 0x0000AA : 0xAA0000, 0.25);
        this.rangeIndicator.fillCircle(0, 0, range * 0.5);
        this.rangeIndicator.lineStyle(3, this.isValid ? 0x0000FF : 0xFF0000, 0.8);
        this.rangeIndicator.strokeCircle(0, 0, range * 0.5);
    }

    public setValid(isValid: boolean): void
    {
        this.isValid = isValid;
        this.drawRangeIndicator(this.turretData.range);
    }
}