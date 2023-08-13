import { CST } from "../CST";
import { CharacterSpawner } from "../Characters/CharacterSpawner";
import { Npc } from "../Characters/Npcs/Npc";
import { InteractionComponent } from "../Characters/Players/InteractionComponent";
import { Player } from "../Characters/Players/Player";
import { Welly_Scene, SceneData } from "./WELLY_Scene";

export class SceneGame extends Welly_Scene
{
    // Map
    private currentMap: Phaser.Tilemaps.Tilemap;
    private layer2: Phaser.Tilemaps.TilemapLayer;
    private layer3: Phaser.Tilemaps.TilemapLayer;

    // Characters
    private player: Player
    private npcs: Phaser.Physics.Arcade.Group;

    constructor()
    {
        super({key: CST.SCENES.GAME});
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init(data?: SceneData): void
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

        this.createMap();
        this.createCamera();
        this.createPhysics();

        this.events.on("postupdate", this.postUpdate, this);
    }

    private createMap(): void
    {
        this.currentMap = this.add.tilemap("oasisMap");

        const tilesetOasis = this.currentMap.addTilesetImage("assetOasis", "assetOasis");
        if (tilesetOasis)
        {
            const layer1 = this.currentMap.createLayer("Layer1", tilesetOasis, 0, 0);
            this.layer2 = this.currentMap.createLayer("Layer2", tilesetOasis, 0, 0) as Phaser.Tilemaps.TilemapLayer;

            this.createNpcs();
            this.createPlayer();

            this.layer3 = this.currentMap.createLayer("Layer3", tilesetOasis, 0, 0) as Phaser.Tilemaps.TilemapLayer;

            if (layer1)
            {
                const platformsBounds = layer1.getBounds();
                this.physics.world.setBounds(0, 0, platformsBounds.width, platformsBounds.height);
            }
        }
    }

    private createNpcs(): void
    {
        this.npcs = this.physics.add.group();

        // @ts-ignore - A phaser type issue. classType can use a CharacterSpawner since it's a phaser image.
        const npcSpawners = this.currentMap.createFromObjects("Characters", {name: "Npc", classType: CharacterSpawner}) as CharacterSpawner[];
        for (const npcSpawner of npcSpawners)
        {
            const npc = new Npc(this, npcSpawner.x, npcSpawner.y);
            this.npcs.add(npc);
            npc.init(npcSpawner.getSpawnData());
            npcSpawner.destroy();
        }
    }

    private createPlayer(): void
    {
        // @ts-ignore - A phaser type issue. classType can use a CharacterSpawner since it's a phaser image.
        const playerSpawners = this.currentMap.createFromObjects("Characters", {name: "Player", classType: CharacterSpawner}) as CharacterSpawner[];
        const playerSpawner = playerSpawners[0]; // There should be only one player

        this.player = new Player(this, playerSpawner.x, playerSpawner.y);
        this.player.init(playerSpawner.getSpawnData());

        playerSpawner.destroy();
    }

    private createCamera(): void
    {
        this.cameras.main.zoomTo(CST.GAME.ZOOM, 0.0);
        this.cameras.main.startFollow(this.player);
    }

    private createPhysics(): void
    {
        this.layer2.setCollisionByProperty({Collide: true});
        this.layer3.setCollisionByProperty({Collide: true});

        this.physics.add.collider(this.player, this.layer2);
        this.physics.add.collider(this.player, this.layer3);

        this.physics.add.collider(this.player, this.npcs);

        // @ts-ignore - interactionComponent has everything we need
        this.physics.add.overlap(this.player.getInteractableComp(), this.npcs, this.onPlayerOverlapInteractable);
    }

    private onPlayerOverlapInteractable(interactionComponent: InteractionComponent, npc: Npc): void
    {
        interactionComponent.onInteractableOverlapped(npc);
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    public update(time: number, delta: number): void
    {
        super.update(time, delta);

        this.player.update();
    }

    private postUpdate(sys: Phaser.Scenes.Systems, time: number, delta: number): void
    {
        this.player.postUpdate();
    }
}