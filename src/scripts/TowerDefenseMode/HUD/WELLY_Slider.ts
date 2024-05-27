import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";
import { WELLY_BaseScene } from "../../Common/Scenes/WELLY_BaseScene";

export enum WELLY_SliderOrientation {
    LEFT_TO_RIGHT,
    TOP_TO_BOTTOM,
    BOTTOM_TO_TOP
};

export declare type WELLY_SlideConfig = {
    value: number;
    minValue: number;
    maxValue: number;
    step?: number;

    orientation?: WELLY_SliderOrientation;

    width: number;
    height: number;

    thumbWidth?: number;
    thumbHeight?: number;

    trackThickness?: number;
    
    backTrackRadius?: number;
    backTrackColorNormal?: number;
    backTrackColorPressed?: number;
    backTrackColorHovered?: number;
    backTrackColorDisabled?: number;

    frontTrackRadius?: number;
    frontTrackColorNormal?: number;
    frontTrackColorPressed?: number;
    frontTrackColorHovered?: number;
    frontTrackColorDisabled?: number;

    thumbRadius?: number;
    thumbColorNormal?: number;
    thumbColorPressed?: number;
    thumbColorHovered?: number;
    thumbColorDisabled?: number;
};

export class WELLY_Slider extends Phaser.GameObjects.Container
{
    public scene: WELLY_BaseScene;

    protected backTrack: RoundRectangle;
    protected frontTrack: RoundRectangle;
    protected thumb: RoundRectangle | Phaser.GameObjects.Image;

    protected value: number = 0.5;
    protected minValue: number = 1;
    protected maxValue: number = 0;
    protected step: number = 0.1;

    protected orientation: WELLY_SliderOrientation;

    protected trackThickness?: number;

    protected backTrackColorNormal?: number;
    protected backTrackColorPressed?: number;
    protected backTrackColorHovered?: number;
    protected backTrackColorDisabled?: number;

    protected frontTrackColorNormal?: number;
    protected frontTrackColorPressed?: number;
    protected frontTrackColorHovered?: number;
    protected frontTrackColorDisabled?: number;

    protected thumbColorNormal?: number;
    protected thumbColorPressed?: number;
    protected thumbColorHovered?: number;
    protected thumbColorDisabled?: number;

    protected isPressed: boolean = false;

    protected worldX: number;
    protected worldY: number;

    constructor(scene: WELLY_BaseScene, x: number, y: number, config: WELLY_SlideConfig) {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.width = config.width;
        this.height = config.height;

        this.worldX = this.getWorldTransformMatrix().tx;
        this.worldY = this.getWorldTransformMatrix().ty;

        this.orientation = config.orientation ?? WELLY_SliderOrientation.LEFT_TO_RIGHT;

        this.trackThickness = config.trackThickness ?? ((this.orientation == WELLY_SliderOrientation.LEFT_TO_RIGHT) ? this.height : this.width);

        const trackWidth = (this.orientation == WELLY_SliderOrientation.LEFT_TO_RIGHT) ? this.width : this.trackThickness;
        const trackHeight = (this.orientation == WELLY_SliderOrientation.LEFT_TO_RIGHT) ? this.trackThickness : this.height;

        const thumbHeight = config.thumbHeight ?? ((this.orientation == WELLY_SliderOrientation.LEFT_TO_RIGHT) ? this.height : this.width);
        const thumbWidth = config.thumbWidth ?? ((this.orientation == WELLY_SliderOrientation.LEFT_TO_RIGHT) ? this.width : this.height );

        this.backTrackColorNormal = config.backTrackColorNormal ?? 0x0000ff;
        this.backTrackColorPressed = config.backTrackColorPressed ?? this.backTrackColorNormal;
        this.backTrackColorHovered = config.backTrackColorHovered ?? this.backTrackColorNormal;
        this.backTrackColorDisabled = config.backTrackColorDisabled ?? this.backTrackColorNormal;

        this.frontTrackColorNormal = config.frontTrackColorNormal ?? 0xff0000;
        this.frontTrackColorPressed = config.frontTrackColorPressed ?? this.frontTrackColorNormal;
        this.frontTrackColorHovered = config.frontTrackColorHovered ?? this.frontTrackColorNormal;
        this.frontTrackColorDisabled = config.frontTrackColorDisabled ?? this.frontTrackColorNormal;

        this.thumbColorNormal = config.thumbColorNormal ?? 0x00ff00;
        this.thumbColorPressed = config.thumbColorPressed ?? this.thumbColorNormal;
        this.thumbColorHovered = config.thumbColorHovered ?? this.thumbColorNormal;
        this.thumbColorDisabled = config.thumbColorDisabled ?? this.thumbColorNormal;

        this.backTrack = this.scene.rexUI.add.roundRectangle(0, 0, trackWidth, trackHeight, config.backTrackRadius, this.backTrackColorNormal, 1.0);
        this.add(this.backTrack);

        this.frontTrack = this.scene.rexUI.add.roundRectangle(/*-trackWidth * 0.5*/0, this.backTrack.y, trackWidth, trackHeight, config.frontTrackRadius, this.frontTrackColorNormal, 1.0);
        this.add(this.frontTrack);

        this.thumb = this.scene.rexUI.add.roundRectangle(0, 0, thumbWidth, thumbHeight, config.thumbRadius, this.thumbColorNormal, 1.0);
        this.add(this.thumb);
       
        //TODO: Faire un warning et inveser min et max si jamais
        this.minValue = config.minValue;
        this.maxValue = config.maxValue;
        this.step = config.step ?? 1;
        this.setValue(config.value);

        switch (this.orientation)
        {
            case WELLY_SliderOrientation.LEFT_TO_RIGHT:
                this.backTrack.setOrigin(0, 0.5);
                this.frontTrack.setOrigin(0, 0.5);
                this.thumb.setOrigin(0.5);
                this.backTrack.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1, 1), Phaser.Geom.Rectangle.Contains);
                break;

            case WELLY_SliderOrientation.BOTTOM_TO_TOP:
                this.backTrack.setOrigin(0.5, 0);
                this.frontTrack.setOrigin(0.5, 0);
                this.thumb.setOrigin(0.5);
                this.backTrack.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1, 1), Phaser.Geom.Rectangle.Contains);
                break;

             case WELLY_SliderOrientation.TOP_TO_BOTTOM:
                 this.backTrack.setOrigin(0.5, 1);
                this.frontTrack.setOrigin(0.5, 1);
                this.thumb.setOrigin(0.5);
                this.backTrack.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1, 1), Phaser.Geom.Rectangle.Contains);
                break;

            default:
                break;
        }

        this.updateInteractiveArea();

        this.backTrack.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            if (this.isPressed)
            {
                this.onValidPointerInteract(pointer);
            }
        }, this);

        this.backTrack.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            this.isPressed = true;
            this.onValidPointerInteract(pointer);

            this.backTrack.input.hitArea.setPosition(-this.backTrack.x - this.worldX, -this.backTrack.y - this.worldY);
            this.backTrack.input.hitArea.setSize(this.scene.scale.displaySize.width, this.scene.scale.displaySize.height);
        }, this);

        this.backTrack.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            this.isPressed = false;
            this.updateInteractiveArea();
        }, this);

        this.backTrack.on(Phaser.Input.Events.POINTER_OUT, (pointer: Phaser.Input.Pointer) => {
            this.isPressed = false;
            this.updateInteractiveArea();
        }, this);
    }

    protected updateInteractiveArea(): void
    {
        switch (this.orientation)
        {
            case WELLY_SliderOrientation.LEFT_TO_RIGHT:
                this.backTrack.input.hitArea.setPosition(0, (this.backTrack.height - this.height) * 0.5);
                this.backTrack.input.hitArea.setSize(this.width, this.height);
                break;  

            case WELLY_SliderOrientation.BOTTOM_TO_TOP:
            case WELLY_SliderOrientation.TOP_TO_BOTTOM:
                this.backTrack.input.hitArea.setPosition((this.backTrack.width - this.width) * 0.5, 0);
                this.backTrack.input.hitArea.setSize(this.width, this.height);
                break;

            default:
                break;
        }
    }

    protected onValidPointerInteract(pointer: Phaser.Input.Pointer): void
    {
        let newValue = 0;

        const worldTransformMatrix = this.getWorldTransformMatrix();
        this.worldX = worldTransformMatrix.tx;
        this.worldY = worldTransformMatrix.ty;

        switch (this.orientation)
        {
            case WELLY_SliderOrientation.LEFT_TO_RIGHT:
            {
                const newPercentValue = (pointer.x - this.worldX /*+ this.width * 0.5*/) / this.width;
                newValue = newPercentValue * (this.maxValue - this.minValue);
                break;
            }

            case WELLY_SliderOrientation.BOTTOM_TO_TOP:
            {
                const newPercentValue = (pointer.y - this.worldY /*+ this.width * 0.5*/) / this.height;
                newValue = newPercentValue * (this.maxValue - this.minValue);
                break;
            }
                
            case WELLY_SliderOrientation.TOP_TO_BOTTOM:
            {
                const newPercentValue = (this.worldY - pointer.y /*+ this.width * 0.5*/) / this.height;
                newValue = newPercentValue * (this.maxValue - this.minValue);
                break;
            }

            default:
                break;
        }

        newValue = Math.floor(newValue / this.step) * this.step;

        this.setValue(newValue);
    }

    public setValue(value: number): void
    {
        const oldValue = this.value;
        this.value = Phaser.Math.Clamp(value, this.minValue, this.maxValue);
        this.onValueChanged(oldValue);

        console.log(value);
    }

    public setMinValue(minValue: number): void
    {
        //TODO: Faire un warning et inveser min et max si jamais

        this.minValue = Math.min(minValue, this.maxValue);

        if (this.value < this.minValue)
        {
            this.setValue(this.minValue);
        }
    }

    public setMaxValue(maxValue: number): void
    {
        //TODO: Faire un warning et inveser min et max si jamais

        this.maxValue = Math.max(maxValue, this.minValue);

        if (this.value > this.maxValue)
        {
            this.setValue(this.maxValue);
        }
    }

    public setStep(step: number): void
    {
        this.step = step;
    }

    public setStepCount(count: number): void
    {
        this.step = (this.maxValue - this.minValue) / Math.max(1, (count - 1));
    }

    protected onValueChanged(oldValue: number): void
    {
        const valuePercent = (this.value - this.minValue) / (this.maxValue - this.minValue);

        if (this.orientation == WELLY_SliderOrientation.LEFT_TO_RIGHT)
        {
            this.frontTrack.resize(this.width * valuePercent, this.trackThickness);
            this.thumb.setX(this.width * valuePercent + this.frontTrack.x);
        }
        else if (this.orientation == WELLY_SliderOrientation.BOTTOM_TO_TOP)
        {
            this.frontTrack.resize(this.trackThickness, this.height * valuePercent);
            this.thumb.setY(this.height * valuePercent + this.frontTrack.y);
        }
        else
        {
            this.frontTrack.resize(this.trackThickness, this.height * valuePercent);
            this.thumb.setY(-this.height * valuePercent + this.frontTrack.y);
        }

        this.emit("valueChanged", this.value, oldValue);
    }
}