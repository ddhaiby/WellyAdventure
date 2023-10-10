import { CST } from "../CST";
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';

export declare type GPC_TextButtonStyle = {
    textureNormal?: string;
    textureHovered?: string;
    texturePressed?: string;
    textureDisabled?: string;
    textOffsetNormalX?: number;
    textOffsetHoveredX?: number;
    textOffsetPressedX?: number;
    textOffsetNormalY?: number;
    textOffsetHoveredY?: number;
    textOffsetPressedY?: number;
    tintNormal?: number;
    tintHovered?: number;
    tintPressed?: number;
    tintDisabled?: number;
    pixelPerfect?: boolean;
    fontSize?: string;
    textColorNormal?: string;
    textColorHovered?: string;
    textColorPressed?: string;
    textColorDisabled?: string;
    textStroke?: string;
    textStrokeThickness?: number;
}

export class WELLY_TextButton extends Phaser.GameObjects.Container
{
    protected _isEnabled: boolean = true;

    /** Whether this button is currently pressed */
    protected isPressed = false;

    /** Whether this button is hoverred */
    protected isHovered = false;

    protected toolTipText: string = "";

    protected textOffsetNormalX: number = 0;
    protected textOffsetHoveredX: number = 0;
    protected textOffsetPressedX: number = 0;

    protected textOffsetNormalY: number = -12;
    protected textOffsetHoveredY: number = -10;
    protected textOffsetPressedY: number = -1;

    protected buttonText: BBCodeText;
    protected buttonImage: Phaser.GameObjects.Image;

    protected textureNormal: string;
    protected texturePressed: string;
    protected textureHovered: string;
    protected textureDisabled: string;

    protected tintNormal: number | undefined;
    protected tintHovered: number | undefined;
    protected tintPressed: number | undefined;
    protected tintDisabled: number | undefined;

    protected textColorNormal: string;
    protected textColorHovered: string;
    protected textColorPressed: string;
    protected textColorDisabled: string;

    protected pixelPerfect: boolean = false;

    /** The gameobject to use for the button interactions (press, hover etc...) */
    private interactiveObject: Phaser.GameObjects.GameObject;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, style?: GPC_TextButtonStyle)
    {
        super(scene, x, y);
        scene.add.existing(this);

        this.textureNormal = (style && style.textureNormal) ? style.textureNormal : "buttonNormal";
        this.texturePressed = (style && style.texturePressed) ? style.texturePressed : this.textureNormal;
        this.textureHovered = (style && style.textureHovered) ? style.textureHovered : this.textureNormal;
        this.textureDisabled = (style && style.textureDisabled) ? style.textureDisabled : this.textureNormal;

        this.tintNormal = (style && style.tintNormal) ? style.tintNormal : undefined;
        this.tintPressed = (style && style.tintPressed) ? style.tintPressed : this.tintNormal;
        this.tintHovered = (style && style.tintHovered) ? style.tintHovered : this.tintNormal;
        this.tintDisabled = (style && style.tintDisabled) ? style.tintDisabled : this.tintNormal;

        this.textColorNormal = (style && style.textColorNormal) ? style.textColorNormal : "#000000";
        this.textColorHovered = (style && style.textColorHovered) ? style.textColorHovered : this.textColorNormal;
        this.textColorPressed = (style && style.textColorPressed) ? style.textColorPressed : this.textColorNormal;
        this.textColorDisabled = (style && style.textColorDisabled) ? style.textColorDisabled : this.textColorNormal;

        this.textOffsetNormalX = (style && (style.textOffsetNormalX !== undefined)) ? style.textOffsetNormalX : 0;
        this.textOffsetHoveredX = (style && (style.textOffsetHoveredX !== undefined)) ? style.textOffsetHoveredX : 0;
        this.textOffsetPressedX = (style && (style.textOffsetPressedX !== undefined)) ? style.textOffsetPressedX : 0;
        
        this.textOffsetNormalY = (style && (style.textOffsetNormalY !== undefined)) ? style.textOffsetNormalY : 0;
        this.textOffsetHoveredY = (style && (style.textOffsetHoveredY !== undefined)) ? style.textOffsetHoveredY : 0;
        this.textOffsetPressedY = (style && (style.textOffsetPressedY !== undefined)) ? style.textOffsetPressedY : 0;

        this.pixelPerfect = (style && (style.pixelPerfect !== undefined)) ? style.pixelPerfect : true

        const fontSize = (style && (style.fontSize !== undefined)) ? style.fontSize : "20px";
        const textColor = (style && (style.textColorNormal !== undefined)) ? style.textColorNormal : "0x000000";
        const textStroke = (style && (style.textStroke !== undefined)) ? style.textStroke : "0x000000";
        const textStrokeThickness = (style && (style.textStrokeThickness !== undefined)) ? style.textStrokeThickness : 0

        this.buttonImage = this.scene.add.image(0, 0, this.textureNormal);
        this.buttonImage.setOrigin(0.5);
        this.width = this.buttonImage.displayWidth;
        this.height = this.buttonImage.displayHeight;
        this.add(this.buttonImage);

        this.buttonText =  new BBCodeText(this.scene, 0, 0, text, { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, fontSize: fontSize, color: textColor, stroke: textStroke, strokeThickness: textStrokeThickness, align: "center" });
        this.scene.add.existing(this.buttonText);
        this.buttonText.setOrigin(0.5);
        this.add(this.buttonText);

        this.updateVisual();
        this.setupInteractions();
    }

    protected setupInteractions(): void
    {
        const newInteractiveObject = this.buttonImage.visible ? this.buttonImage : this.buttonText;

        if (this.interactiveObject && (newInteractiveObject != this.interactiveObject))
        {
            this.interactiveObject.removeInteractive();
            this.interactiveObject.emit(Phaser.Input.Events.POINTER_OUT);
        }
        
        this.interactiveObject = newInteractiveObject;

        this.interactiveObject.setInteractive({
            pixelPerfect: this.pixelPerfect && (this.interactiveObject == this.buttonImage),
        });

        // Behaviors
        this.interactiveObject.on(Phaser.Input.Events.POINTER_OVER, () => {
            if (this._isEnabled)
            {
                this.isHovered = true;
                this.isPressed = false;
                this.updateVisual();
            }
            this.scene.events.emit(CST.EVENTS.UI.TOOLTIP.HIDE);
        }, this);

        this.interactiveObject.on(Phaser.Input.Events.POINTER_OUT, () => {
            if (this._isEnabled)
            {
                this.isPressed = false;
                this.isHovered = false;
                this.updateVisual();
            }
            this.scene.events.emit(CST.EVENTS.UI.TOOLTIP.HIDE);
        }, this);

        this.interactiveObject.on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this._isEnabled)
            {
                this.isPressed = true;
                this.isHovered = false;
                this.updateVisual();
            }
            this.scene.events.emit(CST.EVENTS.UI.TOOLTIP.HIDE);
        }, this);

        this.interactiveObject.on(Phaser.Input.Events.POINTER_UP, () => {
            if (this._isEnabled)
            {
                this.isPressed = false;
                this.isHovered = true;
                this.updateVisual();
            }
            this.scene.events.emit(CST.EVENTS.UI.TOOLTIP.HIDE);
        }, this);

        this.interactiveObject.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
            this.scene.events.emit(CST.EVENTS.UI.TOOLTIP.SHOW, this.toolTipText);
        }, this);

        this.interactiveObject.on(Phaser.Input.Events.POINTER_WHEEL, (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
            this.scene.events.emit(CST.EVENTS.UI.TOOLTIP.HIDE);
        }, this);
    }

    public setTextOffsetsX(textOffsetNormalX: number, textOffsetHoveredX?: number, textOffsetPressedX?: number): void
    {
        this.textOffsetNormalX = textOffsetNormalX;
        this.textOffsetHoveredX = textOffsetHoveredX ?? textOffsetNormalX;
        this.textOffsetPressedX = textOffsetPressedX ?? textOffsetNormalX;
        this.updateVisual();
    }

    public setTextOffsetsY(textOffsetNormalY: number, textOffsetHoveredY?: number, textOffsetPressedY?: number): void
    {
        this.textOffsetNormalY = textOffsetNormalY;
        this.textOffsetHoveredY = textOffsetHoveredY ?? textOffsetNormalY;
        this.textOffsetPressedY = textOffsetPressedY ?? textOffsetNormalY;
        this.updateVisual();
    }

    public setTextures(textureNormal: string, texturePressed?: string, textureHovered?: string, textureDisabled?: string): void
    {
        this.textureNormal = textureNormal;
        this.textureHovered = textureHovered ?? textureNormal;
        this.texturePressed = texturePressed ?? textureNormal;
        this.textureDisabled = textureDisabled ?? textureNormal;
        
        this.updateVisual();
        this.setupInteractions();
    }

    public setText(value: string): this
    {
        this.buttonText.setText(value);
        return this;
    }

    private updateVisual(): void
    {
        let buttonImageTexture = this.textureNormal;
        let buttonTextColor = this.textColorNormal;
        let buttonImageTint = this.tintNormal;

        if (!this._isEnabled)
        {
            buttonImageTexture = this.textureDisabled;
            buttonTextColor = this.textColorDisabled;
            buttonImageTint = this.tintNormal;
        }
        else if (this.isPressed)
        {
            buttonImageTexture = this.texturePressed;
            buttonTextColor = this.textColorPressed;
            buttonImageTint = this.tintPressed;
        }
        else if (this.isHovered)
        {
            buttonImageTexture = this.textureHovered;
            buttonTextColor = this.textColorHovered;
            buttonImageTint = this.tintHovered;
        }

        this.buttonImage.setTexture(buttonImageTexture);
        this.buttonText.setColor(buttonTextColor);
        
        if (buttonImageTint)
        {
            this.buttonImage.setTintFill(buttonImageTint);
        }
        else
        {
            this.buttonImage.clearTint();
        }

        this.buttonImage.setVisible((this.buttonImage.texture.key.length > 0) && (this.buttonImage.texture.key != "__MISSING"))
        this.width = this.buttonImage.visible ? this.buttonImage.displayWidth : this.buttonText.displayWidth;
        this.height = this.buttonImage.visible ? this.buttonImage.displayHeight : this.buttonText.displayHeight;

        this.updateTextPosition();
    }

    private updateTextPosition(): void
    {
        const offsetX = this._isEnabled ? (this.isPressed ? this.textOffsetPressedX : (this.isHovered ? this.textOffsetHoveredX : this.textOffsetNormalX)) : this.textOffsetNormalX;
        const offsetY = this._isEnabled ? (this.isPressed ? this.textOffsetPressedY : (this.isHovered ? this.textOffsetHoveredY : this.textOffsetNormalY)) : this.textOffsetNormalY;
        this.buttonText.setPosition(offsetX, offsetY);
    }

    public onClicked(fn: Function, context?: any) : this
    {
        this.interactiveObject.on(Phaser.Input.Events.POINTER_UP, () => { fn(); }, context);
        return this;
    }

    public onHovered(fn: Function, context?: any) : this
    {
        this.interactiveObject.on(Phaser.Input.Events.POINTER_OVER, fn, context);
        return this;
    }

    public onPointerOut(fn: Function, context?: any) : this
    {
        this.interactiveObject.on(Phaser.Input.Events.POINTER_OUT, fn, context);
        return this;
    }

    public setToolTipText(text: string): void
    {
        this.toolTipText = text;
    }

    public setEnabled(value: boolean): void
    {
        this.isEnabled = value;

        if (this.isEnabled)
        {
            this.buttonImage.setInteractive();
            this.buttonImage.setTexture(this.textureNormal);
        }
        else
        {
            this.buttonImage.disableInteractive();
            this.buttonImage.setTexture(this.textureDisabled);
        }
    }

    public set isEnabled(value: boolean)
    {
        this._isEnabled = value;
    }

    public get isEnabled() : boolean
    {
        return this._isEnabled;
    }
}