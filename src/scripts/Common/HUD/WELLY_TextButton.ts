import { CST } from "../CST";

export declare type GPC_TextButtonStyle = {
    texturePressed?: string;
    textureHovered?: string;
    textureNormal?: string;
    textureDisabled?: string;
    textOffsetNormalY?: number;
    textOffsetHoveredY?: number;
    textOffsetPressedY?: number;
    pixelPerfect?: boolean;
    fontSize?: string;
    textColor?: string;
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

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, style?: GPC_TextButtonStyle)
    {
        super(scene, x, y);
        scene.add.existing(this);

        this.textureNormal = (style && style.textureNormal) ? style.textureNormal : "buttonNormal";
        this.texturePressed = (style && style.texturePressed) ? style.texturePressed : "buttonPressed";
        this.textureHovered = (style && style.textureHovered) ? style.textureHovered : "buttonHovered";
        this.textureDisabled = (style && style.textureDisabled) ? style.textureDisabled : "buttonDisabled";

        this.textOffsetNormalY = (style && (style.textOffsetNormalY !== undefined)) ? style.textOffsetNormalY : -12;
        this.textOffsetHoveredY = (style && (style.textOffsetHoveredY !== undefined)) ? style.textOffsetHoveredY : -10;
        this.textOffsetPressedY = (style && (style.textOffsetPressedY !== undefined)) ? style.textOffsetPressedY : -1;
        
        const fontSize = (style && (style.fontSize !== undefined)) ? style.fontSize : "20px";
        const textColor = (style && (style.textColor !== undefined)) ? style.textColor : "0x000000";
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
        this.updateTextPosition();

        this.buttonImage.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, this.displayWidth, this.displayHeight),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            pixelPerfect: style ? style.pixelPerfect : true,
            //cursor: "url(assets/cursors/icono-selectedstatic.cur), pointer"
        });

        // Behaviors
        this.buttonImage.on(Phaser.Input.Events.POINTER_OVER, () => {
            if (this._isEnabled)
            {
                this.isHovered = true;
                this.isPressed = false;

                this.buttonImage.setTexture(this.textureHovered);
                this.updateTextPosition();
            }

            this.scene.events.emit(CST.EVENTS.UI.TOOLTIP.HIDE);
        }, this);

        this.buttonImage.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.isPressed = false;
            this.isHovered = false;

            if (this._isEnabled)
            {
                this.buttonImage.setTexture(this.textureNormal);
                this.updateTextPosition();
            }

            this.scene.events.emit(CST.EVENTS.UI.TOOLTIP.HIDE);
        }, this);

        this.buttonImage.on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this._isEnabled)
            {
                this.isPressed = true;
                this.isHovered = false;
                
                this.buttonImage.setTexture(this.texturePressed);
                this.updateTextPosition();
            }

            this.scene.events.emit(CST.EVENTS.UI.TOOLTIP.HIDE);
        }, this);

        this.buttonImage.on(Phaser.Input.Events.POINTER_UP, () => {
            if (this._isEnabled)
            {
                this.isPressed = false;
                this.isHovered = true;

                this.buttonImage.setTexture(this.textureHovered);
                this.updateTextPosition();
            }

            this.scene.events.emit(CST.EVENTS.UI.TOOLTIP.HIDE);
        }, this);

        this.buttonImage.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
            this.scene.events.emit(CST.EVENTS.UI.TOOLTIP.SHOW, this.toolTipText);
        }, this);

        this.buttonImage.on(Phaser.Input.Events.POINTER_WHEEL, (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
            this.scene.events.emit(CST.EVENTS.UI.TOOLTIP.HIDE);
        }, this);
    }

    private updateTextPosition(): void
    {
        const offsetY = this._isEnabled ? (this.isPressed ? this.textOffsetPressedY : (this.isHovered ? this.textOffsetHoveredY : this.textOffsetNormalY)) : this.textOffsetNormalY;
        this.buttonText.setY(offsetY);
    }

    public onClicked(fn: Function, context?: any) : this
    {
        this.buttonImage.on(Phaser.Input.Events.POINTER_UP, () => { fn(); }, context);
        return this;
    }

    public onHovered(fn: Function, context?: any) : this
    {
        this.buttonImage.on(Phaser.Input.Events.POINTER_OVER, fn, context);
        return this;
    }

    public onPointerOut(fn: Function, context?: any) : this
    {
        this.buttonImage.on(Phaser.Input.Events.POINTER_OUT, fn, context);
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