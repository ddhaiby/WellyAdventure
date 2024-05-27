import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_BaseScene } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_SceneTowerDefense } from "./WELLY_SceneTowerDefense";
import { WELLY_SceneTowerDefenseUI } from "./WELLY_SceneTowerDefenseUI";
import { WELLY_LoadingScreen } from "../../Common/HUD/WELLY_LoadingScreen";
import { WELLY_GameAnalytics } from "../Analytics/WELLY_GameAnalytics";

export class ScenePreloadAssets extends WELLY_BaseScene
{
    constructor()
    {
        super({key: WELLY_CST.SCENES.PRELOAD_ASSETS, 
            pack: {
                files: [
                {
                    type: 'rexWebFont',
                    key: "rexWebFont",  
                    config: {
                        google: {
                            families: [WELLY_CST.STYLE.TEXT.NANUM_PEN_FONT_FAMILY, WELLY_CST.STYLE.TEXT.MERRIWEATHER_SANS_FONT_FAMILY],
                        },
                        custom: {
                            families: [WELLY_CST.STYLE.TEXT.KICKERS_FONT_FAMILY],
                        urls: ['../../../index.css']
                        },
                    },
                },
                ],
            },
        });
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init() : void
    {
        WELLY_GameAnalytics.init();
    }

    // Preload
    ////////////////////////////////////////////////////////////////////////

    public preload() : void
    {
        this.preloadSplashScreen();
    }

    private preloadSplashScreen(): void
    {
        this.load.setPath("./assets/loadingScreen/");
        this.load.spritesheet("loadingSpriteSheet", "loadingSpriteSheet.png", { frameWidth: 191, frameHeight: 201 });
    }

    // Load - Post create
    ////////////////////////////////////////////////////////////////////////

    private loadAssets(): void
    {
        this.loadAudio();
        this.loadCharacters();
        this.loadHUD();
        this.loadTowerDefenseAssets();
        this.loadWellyBonus();

        this.load.setPath("./assets/data/");
        this.load.json("dialogues", "dialogues.json");
        this.load.json("monstersData", "monstersData.json");
        this.load.json("turretsData", "turretsData.json");
        this.load.json("waveData", "waveData.json");
        this.load.json("wellyBoostData", "wellyBoostData.json");

        this.load.start();
    }

    private loadAudio(): void
    {
        this.load.setPath("./assets/audio/");
        this.load.audio("buttonHovered", "buttonHovered.wav");
        this.load.audio("buttonPressed", "buttonPressed.wav");
    }

    private loadCharacters(): void
    {
        this.load.setPath("./assets/characters/");
        this.load.image("playerFace", "playerFace.png");
        this.load.spritesheet("player", "player.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("Amalia", "Amalia.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyRed", "wellyRed.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyWhite", "wellyWhite.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("iceCreamMachine", "iceCreamMachine.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyItaly", "wellyItaly.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("boss1", "boss1.png", { frameWidth: 128, frameHeight: 128 });
    }

    private loadTowerDefenseAssets(): void
    {
        this.load.setPath("./assets/maps/");
        this.load.image("assetTowerDefenseMap", "assetTowerDefenseMap.png");
        this.load.tilemapTiledJSON("towerDefenseMap", "towerDefenseMap.json");

        this.load.setPath("./assets/turrets/");
        this.load.image("emptyTurret", "emptyTurret.png");
        this.load.image("canon", "canon.png");
        this.load.image("bullet", "bullet.png");
    }

    private loadHUD(): void
    {
        this.load.setPath("./assets/HUD/");

        this.load.image("backgroundButtonNormal", "backgroundButtonNormal.png");
        this.load.image("backgroundButtonPressed", "backgroundButtonPressed.png");
        
        this.load.image("backgroundMenuButtonNormal", "backgroundMenuButtonNormal.png");
        this.load.image("backgroundMenuButtonPressed", "backgroundMenuButtonPressed.png");

        this.load.image("menuButtonNormal", "menuButtonNormal.png");
        this.load.image("menuButtonPressed", "menuButtonPressed.png");

        this.load.image("gameSpeedX1ButtonNormal", "gameSpeedX1ButtonNormal.png");
        this.load.image("gameSpeedX1ButtonPressed", "gameSpeedX1ButtonPressed.png");

        this.load.image("gameSpeedX2ButtonNormal", "gameSpeedX2ButtonNormal.png");
        this.load.image("gameSpeedX2ButtonPressed", "gameSpeedX2ButtonPressed.png");

        this.load.image("gameSpeedX3ButtonNormal", "gameSpeedX3ButtonNormal.png");
        this.load.image("gameSpeedX3ButtonPressed", "gameSpeedX3ButtonPressed.png");

        this.load.image("homeButtonNormal", "homeButtonNormal.png");
        this.load.image("homeButtonPressed", "homeButtonPressed.png");

        this.load.image("playButtonNormal", "playButtonNormal.png");
        this.load.image("playButtonPressed", "playButtonPressed.png");

        this.load.image("restartButtonNormal", "restartButtonNormal.png");
        this.load.image("restartButtonPressed", "restartButtonPressed.png");

        this.load.image("audioOnButtonNormal", "audioOnButtonNormal.png");
        this.load.image("audioOnButtonPressed", "audioOnButtonPressed.png");

        this.load.image("audioOffButtonNormal", "audioOffButtonNormal.png");
        this.load.image("audioOffButtonPressed", "audioOffButtonPressed.png");

        this.load.image("coinSmallIcon", "coinSmallIcon.png");
        this.load.image("coinIcon", "coinIcon.png");

        this.load.image("waveIcon", "waveIcon.png");
        this.load.image("healthWidget", "healthWidget.png");

        this.load.image("stats_ATQ", "stats_ATQ.png");
        this.load.image("stats_ASP", "stats_ASP.png");
        this.load.image("stats_RNG", "stats_RNG.png");
    }

    private loadWellyBonus(): void
    {
        this.load.setPath("./assets/wellyBonus/");
        this.load.image("wellyBonusTemplate", "wellyBonusTemplate.png");
    }

    // Create
    ////////////////////////////////////////////////////////////////////////
  
    public create() : void
    {
        this.input.setDefaultCursor("url(assets/cursors/cursorWellyNormal.cur), pointer");

        new WELLY_LoadingScreen(this);

        this.time.delayedCall(1000, () => { this.loadAssets(); }, undefined, this);

        this.load.once(Phaser.Loader.Events.COMPLETE, () => {
            const sceneUI = this.scene.add(WELLY_CST.SCENES.TOWER_DEFENSE_UI, WELLY_SceneTowerDefenseUI, true, undefined) as WELLY_SceneTowerDefenseUI;

            this.scene.add(WELLY_CST.SCENES.TOWER_DEFENSE, WELLY_SceneTowerDefense, true, undefined);
            sceneUI.scene.bringToTop();

            this.scene.remove(WELLY_CST.SCENES.PRELOAD_ASSETS);
        }, this);
    }
}