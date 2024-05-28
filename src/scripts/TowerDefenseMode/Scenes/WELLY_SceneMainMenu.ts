import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_BaseScene, WELLY_SceneData } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_TextButton } from "../../Common/HUD/WELLY_TextButton";
import { WELLY_Utils } from "../../Utils/WELLY_Utils";

export class WELLY_SceneMainMenu extends WELLY_BaseScene
{
    constructor()
    {
        super({key: WELLY_CST.SCENES.TOWER_DEFENSE_MAIN_MENU});
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(data?: WELLY_SceneData): void
    {
    }

    // Preload
    ////////////////////////////////////////////////////////////////////////

    public preload(): void
    {
    }

    // Create
    ////////////////////////////////////////////////////////////////////////

    public create(): void
    {
        super.create();

        const gameWidth = WELLY_CST.GAME.WIDTH
        const gameHeight = WELLY_CST.GAME.HEIGHT;

        const background = this.add.graphics();
        background.fillStyle(WELLY_Utils.hexColorToNumber(WELLY_CST.STYLE.COLOR.BEIGE), 1.0);
        background.fillRect(0, 0, gameWidth, gameHeight);

        const title = this.add.text(WELLY_CST.GAME.WIDTH * 0.5, 30, "Feed 'em All!", {
            fontSize : "110px",
            fontFamily: WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY,
            color: WELLY_CST.STYLE.COLOR.BLUE
        });
        title.setOrigin(0.5, 0);

        this.add.image(280, 500, "mainMenuImage").setScale(0.55);

        const spacing = 46;
        const playButton = new WELLY_TextButton(this, 764, WELLY_CST.GAME.HEIGHT * 0.5 - spacing + 36, "Play", {
            fontSize : "37px",
            textColorNormal: WELLY_CST.STYLE.COLOR.WHITE,
            textColorPressed: "#FFDFD4",
            pixelPerfect: false,
            textOffsetNormalY: -3,
            textOffsetHoveredY: -2,
            textOffsetPressedY: 3,
            textureNormal: "backgroundMenuButtonNormal",
            texturePressed: "backgroundMenuButtonPressed"
        });
        playButton.onClicked(this.startSurvivalGame, this);

        const survivalModeButton = new WELLY_TextButton(this, playButton.x, WELLY_CST.GAME.HEIGHT * 0.5 + spacing + 36, "Survival Mode", {
            fontSize : "37px",
            textColorNormal: WELLY_CST.STYLE.COLOR.WHITE,
            textColorPressed: "#FFDFD4",
            pixelPerfect: false,
            textOffsetNormalY: -3,
            textOffsetHoveredY: -2,
            textOffsetPressedY: 3,
            textureNormal: "backgroundMenuButtonNormal",
            texturePressed: "backgroundMenuButtonPressed"
        });
        survivalModeButton.onClicked(this.startSurvivalGame, this);

        const websiteButton =  new WELLY_TextButton(this, WELLY_CST.GAME.WIDTH - 44, 42, "", {
            textureNormal: "websiteButtonNormal",
            texturePressed: "websiteButtonPressed"
        });
        websiteButton.onClicked(this.openWebsite, this);
    }

    protected startSurvivalGame(): void
    {
        const sceneUI = this.scene.get(WELLY_CST.SCENES.TOWER_DEFENSE_UI);
        const sceneGame = this.scene.get(WELLY_CST.SCENES.TOWER_DEFENSE);

        sceneUI.scene.restart({shouldShowWelcomePage: true});
        sceneGame.scene.restart();

        this.scene.pause();
        this.scene.setVisible(false);
    }

    protected openWebsite(): void
    {
        window.open("https://www.eatwellys.com/");
    }
}