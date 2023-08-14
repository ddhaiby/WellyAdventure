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
    }

    private preloadCharacters(): void
    {
        this.load.setPath("./assets/characters/");
        this.load.spritesheet("player", "player.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("amalia", "amalia.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyRed", "wellyRed.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyWhite", "wellyWhite.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyItaly", "wellyItaly.png", { frameWidth: 64, frameHeight: 64 });
    }

    private preloadMaps(): void
    {
        this.load.setPath("./assets/maps/");
        this.load.image("assetOasis", "assetOasis.png");
        this.load.tilemapTiledJSON("oasisMap", "Oasis.json");
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