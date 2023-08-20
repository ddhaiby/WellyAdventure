import { CST } from "../CST";
import { Welly_Scene } from "./WELLY_Scene";
import { SceneGame } from "./SceneGame";
import { SceneGameUI } from "./SceneGameUI";

export class ScenePreloadAssets extends Welly_Scene
{
    constructor()
    {
        super({key: CST.SCENES.PRELOAD_ASSETS});
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init() : void
    {
    }

    // Preload
    ////////////////////////////////////////////////////////////////////////

    public preload() : void
    {
        this.preloadCharacters();
        this.preloadMaps();

        this.load.setPath("./assets/dialogues/");
        this.load.json("dialogues", "dialogues.json");
    }

    private preloadCharacters(): void
    {
        this.load.setPath("./assets/characters/");
        this.load.spritesheet("player", "player.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("Amalia", "Amalia.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyRed", "wellyRed.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyWhite", "wellyWhite.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyItaly", "wellyItaly.png", { frameWidth: 64, frameHeight: 64 });
    }

    private preloadMaps(): void
    {
        this.load.setPath("./assets/maps/");
        this.load.image("assetCity", "assetCity.png");
        this.load.tilemapTiledJSON("cityMap", "cityMap.json");
    }

    // Create
    ////////////////////////////////////////////////////////////////////////
  
    public create() : void
    {
        const sceneUI = this.scene.add(CST.SCENES.GAME_UI, SceneGameUI, true, undefined) as SceneGameUI;
        this.scene.add(CST.SCENES.GAME, SceneGame, true, undefined);
        sceneUI.scene.bringToTop();

        this.scene.remove(CST.SCENES.PRELOAD_ASSETS);
    }
}