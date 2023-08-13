import { CST } from "../CST";
import { Welly_Scene } from "./WELLY_Scene";
import { SceneGame } from "./SceneGame";

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
        this.scene.add(CST.SCENES.GAME, SceneGame, true, undefined);
        this.scene.remove(CST.SCENES.PRELOAD_ASSETS);
    }
}