import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin";

export const enum SpeedMode {
    SLOW,
    NORMAL,
    FAST
}

export declare type SceneData = {
}

export declare type FormatTimeOption = {
    shouldIncludeSeconds?: boolean;
    shouldIncludeMilliseconds?: boolean;
    shouldIgnoreZeros?: boolean;
    daySymbol: string;
    hourSymbol: string;
    minuteSymbol: string;
    secondSymbol: string;
    millisecondSymbol?: string;
};

const defaultFormatTimeOption: FormatTimeOption = {
    shouldIncludeSeconds: false,
    shouldIncludeMilliseconds: false,
    shouldIgnoreZeros: false,
    daySymbol: "D",
    hourSymbol: "H",
    minuteSymbol: "M",
    secondSymbol: "S",
    millisecondSymbol: "MS",
};

declare type CenterableObject = Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.ComputedSize;

export class Welly_Scene extends Phaser.Scene
{
    public rexUI: UIPlugin;
    
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig)
    {
        super(config);
    }

    // Create
    ////////////////////////////////////////////////////////////////////////

    protected create(): void
    {
    }

    // Utils
    ////////////////////////////////////////////////////////////////////////


    public centerItem(item: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.ComputedSize, offsetX: number = 0, offsetY: number = 0) : CenterableObject
    {
        const sceneWidth: number = this.scale.displaySize.width;
        const sceneHeight: number = this.scale.displaySize.height;

        item.setX((sceneWidth - item.width) / 2 + offsetX);
        item.setY((sceneHeight - item.height) / 2 + offsetY);
        return item;
    }

    public centerVItem(item: CenterableObject, offsetY: number = 0) : CenterableObject
    {
        let sceneHeight = this.scale.displaySize.height;
        item.setY((sceneHeight - item.height) / 2 + offsetY);

        return item;
    }

    public centerHItem(item: CenterableObject, offsetX: number = 0) : CenterableObject
    {
        let sceneWidth = this.scale.displaySize.width;
        item.setX((sceneWidth - item.width) / 2 + offsetX);

        return item;
    }

    static formatTime(milliseconds: number, options: FormatTimeOption = defaultFormatTimeOption) : string
    {
        // Days
        const days = Math.floor(milliseconds / 86400000);
        const dayString = (options.shouldIgnoreZeros && days <= 0) ? "" : `${days}${options.daySymbol} `;
        milliseconds = milliseconds - days * 86400000;

        // Hours
        const hours = Math.floor(milliseconds / 3600000);
        let hoursString = "";
        if (!options.shouldIgnoreZeros || (days > 0) || (hours > 0))
        {
            hoursString = (hours >= 10) ? `${hours}${options.hourSymbol} ` : `0${hours}${options.hourSymbol} `;
        }

        milliseconds = milliseconds - hours * 3600000;

        // Minutes
        const minutes = Math.floor(milliseconds / 60000);
        const minutesString = (minutes >= 10) ? `${minutes}${options.minuteSymbol} ` : `0${minutes}${options.minuteSymbol} `;
        milliseconds = milliseconds - minutes * 60000;

        if (!options.shouldIncludeSeconds)
        {
            return `${dayString}${hoursString}${minutesString}`;
        }
        else
        {
            // Seconds
            const seconds = Math.floor(milliseconds / 1000);
            const secondsString = (seconds >= 10) ? `${seconds}${options.secondSymbol} ` : `0${seconds}${options.secondSymbol} `;
            milliseconds = milliseconds - seconds * 1000;

            if (!options.shouldIncludeMilliseconds)
            {
                return `${dayString}${hoursString}${minutesString}${secondsString}`;
            }
            else
            {
                // Milliseconds
                milliseconds = Math.floor(milliseconds / 10);
                const millisecondsString = (milliseconds >= 10) ? `${milliseconds}${options.millisecondSymbol} ` : `0${milliseconds}${options.millisecondSymbol} `;
                return `${dayString}${hoursString}${minutesString}${secondsString}${millisecondsString}`;
            }
        }
    }
}