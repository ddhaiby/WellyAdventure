import { CST } from "../../Common/CST";
import { WELLY_Utils } from "../../Common/Utils/WELLY_Utils";

export class WaveCountdownWidget extends Phaser.GameObjects.Graphics
{
    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, { x: x, y: y });
        this.scene.add.existing(this);

        this.setDefaultStyles({
            lineStyle: { width: 3, color: WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.BLUE), alpha: 1 },
            fillStyle: { color: WELLY_Utils.hexColorToNumber(CST.STYLE.COLOR.ORANGE), alpha: 1 }
        })
    }

    public onCountdownTick(remainDuration: number, totalDuration: number): void
    {
        this.clear();
        this.slice(0, 0, 24, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(remainDuration / totalDuration * 360), false);
        this.fillPath();
        this.strokePath();
    }
}