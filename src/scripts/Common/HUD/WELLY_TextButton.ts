import { CST } from "../CST";

export declare type GPC_TextButtonStyle = {
    textureNormal?: string;
    textureHovered?: string;
    texturePressed?: string;
    textureDisabled?: string;
    textOffsetNormalY?: number;
    textOffsetHoveredY?: number;
    textOffsetPressedY?: number;
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

    protected textOffsetNormalY: number = -12;
    protected textOffsetHoveredY: number = -10;
    protected textOffsetPressedY: number = -1;

    protected buttonText: Phaser.GameObjects.Text;
    protected buttonImage: Phaser.GameObjects.Image;

    protected textureNormal: string;
    protected texturePressed: string;
    protected textureHovered: string;
    protected textureDisabled: string;

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

        this.textColorNormal = (style && style.textColorNormal) ? style.textColorNormal : "#000000";
        this.textColorHovered = (style && style.textColorHovered) ? style.textColorHovered : this.textColorNormal;
        this.textColorPressed = (style && style.textColorPressed) ? style.textColorPressed : this.textColorNormal;
        this.textColorDisabled = (style && style.textColorDisabled) ? style.textColorDisabled : this.textColorNormal;

        this.textOffsetNormalY = (style && (style.textOffsetNormalY !== undefined)) ? style.textOffsetNormalY : -12;
        this.textOffsetHoveredY = (style && (style.textOffsetHoveredY !== undefined)) ? style.textOffsetHoveredY : -10;
        this.textOffsetPressedY = (style && (style.textOffsetPressedY !== undefined)) ? style.textOffsetPressedY : -1;

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

        this.buttonText = this.scene.add.text(0, 0, text, { fontFamily: CST.STYLE.TEXT.FONT_FAMILY, fontSize: fontSize, color: textColor, stroke: textStroke, strokeThickness: textStrokeThickness, align: "center" });
        this.buttonText.setOrigin(0.5);
        this.add(this.buttonText);

        this.updateVisual();
        this.setupInteractions();
    }

    protected setupInteractions(): void
    {
        this.interactiveObject = this.buttonImage.visible ? this.buttonImage : this.buttonText;

        this.interactiveObject.setInteractive({
            pixelPerfect: this.pixelPerfect && (this.interactiveObject == this.buttonImage),
            //cursor: "url(assets/cursors/icono-selectedstatic.cur), pointer"
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

    public setTextOffsets(textOffsetNormalY: number, textOffsetHoveredY?: number, textOffsetPressedY?: number): void
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
    }

    public setText(value: string): this
    {
        this.buttonText.setText(value);
        return this;
    }

    private updateVisual(): void
    {
        if (!this._isEnabled)
        {
            this.buttonImage.setTexture(this.textureDisabled);
            this.buttonText.setColor(this.textColorDisabled);
        }
        else if (this.isPressed)
        {
            this.buttonImage.setTexture(this.texturePressed);
            this.buttonText.setColor(this.textColorPressed);
        }
        else if (this.isHovered)
        {
            this.buttonImage.setTexture(this.textureHovered);
            this.buttonText.setColor(this.textColorHovered);
        }
        else
        {
            this.buttonImage.setTexture(this.textureNormal);
            this.buttonText.setColor(this.textColorNormal);
        }

        this.buttonImage.setVisible((this.buttonImage.texture.key.length > 0) && (this.buttonImage.texture.key != "__MISSING"))
        this.width = this.buttonImage.visible ? this.buttonImage.displayWidth : this.buttonText.displayWidth;
        this.height = this.buttonImage.visible ? this.buttonImage.displayHeight : this.buttonText.displayHeight;

        this.updateTextPosition();
    }

    private updateTextPosition(): void
    {
        const offsetY = this._isEnabled ? (this.isPressed ? this.textOffsetPressedY : (this.isHovered ? this.textOffsetHoveredY : this.textOffsetNormalY)) : this.textOffsetNormalY;
        this.buttonText.setY(offsetY);
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