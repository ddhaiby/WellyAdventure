import { CST } from "../../Common/CST";
import { Welly_Scene, SceneData } from "../../Common/Scenes/WELLY_Scene";
import { CharacterSpawner } from "../../Common/Characters/CharacterSpawner";
import { MoveToPoint } from "../../Common/PathFinding/MoveToEntity";
import { Npc } from "../../Common/Characters/Npcs/Npc";
import { InteractionComponent } from "../../Common/Characters/Players/InteractionComponent";
import { Player } from "../../Common/Characters/Players/Player";
import { SceneExplorationGameUI } from "./SceneExplorationGameUI";

export class SceneExplorationGame extends Welly_Scene
{
    private sceneUI: SceneExplorationGameUI;

    // Map
    private currentMap: Phaser.Tilemaps.Tilemap;
    private layer2: Phaser.Tilemaps.TilemapLayer;
    private layer3: Phaser.Tilemaps.TilemapLayer;

    // Characters
    private player: Player
    private npcs: Phaser.Physics.Arcade.Group;

    constructor()
    {
        super({key: CST.SCENES.EXPLORATION_GAME});
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
        this.initUI();

        this.events.on("postupdate", this.postUpdate, this);
    }

    private createMap(): void
    {
        this.currentMap = this.add.tilemap("cityMap");

        const tileset = this.currentMap.addTilesetImage("assetCity", "assetCity");
        if (tileset)
        {
            const layer1 = this.currentMap.createLayer("Layer1", tileset, 0, 0);
            this.layer2 = this.currentMap.createLayer("Layer2", tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;

            this.createNpcs();
            this.createPlayer();

            this.layer3 = this.currentMap.createLayer("Layer3", tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;

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

        const npcSpawners = this.currentMap.createFromObjects("Characters", {name: "Npc", classType: CharacterSpawner}) as CharacterSpawner[];
        for (const npcSpawner of npcSpawners)
        {
            const spawnData = npcSpawner.getSpawnData();

            const npc = new Npc(this, npcSpawner.x, npcSpawner.y);
            this.npcs.add(npc);
            npc.init(npcSpawner.getSpawnData());
            
            let positions = [] as Phaser.Types.Math.Vector2Like[];

            while (spawnData.moveToPointId >= 0)
            {
                const moveToEntities = this.currentMap.createFromObjects("Characters", {id: spawnData.moveToPointId, classType: MoveToPoint}) as MoveToPoint[];

                if (moveToEntities.length > 0)
                {
                    positions.push(new Phaser.Math.Vector2(moveToEntities[0].x, moveToEntities[0].y))
                    spawnData.moveToPointId = moveToEntities[0].moveToPointId;

                    for (const entity of moveToEntities)
                    {
                        entity.destroy();
                    }
                }
                else
                {
                    spawnData.moveToPointId = -1;
                }
            }

            positions.reverse();
            npc.moveTo({ positions: positions, repeat: spawnData.moveToPointRepeat });
            
            npc.on(CST.EVENTS.UI.REQUEST_DIALOGUE, (message: string, title: string, iconTexture: string, iconFrame: string) => { this.onRequestDialogue(message, title, iconTexture, iconFrame); }, this);
            npcSpawner.destroy();
        }
    }

    private createPlayer(): void
    {
        const playerSpawners = this.currentMap.createFromObjects("Characters", {name: "Player", classType: CharacterSpawner}) as CharacterSpawner[];
        const playerSpawner = playerSpawners[0]; // There should be only one player

        this.player = new Player(this, playerSpawner.x, playerSpawner.y);
        this.player.init(playerSpawner.getSpawnData());

        playerSpawner.destroy();
    }

    private createCamera(): void
    {
        this.cameras.main.zoomTo(CST.GAME.ZOOM.CITY, 0.0);
        this.cameras.main.startFollow(this.player);
    }

    private createPhysics(): void
    {
        this.layer2.setCollisionByProperty({collides: true});
        this.layer3.setCollisionByProperty({collides: true});

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

    private initUI(): void
    {
        this.sceneUI = this.scene.get<SceneExplorationGameUI>(CST.SCENES.EXPLORATION_GAME_UI);
    }

    // Update
    ////////////////////////////////////////////////////////////////////////

    public update(time: number, delta: number): void
    {
        super.update(time, delta);

        this.player.update();
        (this.npcs.getChildren() as Npc[]).forEach((npc: Npc) => { npc.update(); }, this);
    }

    private postUpdate(sys: Phaser.Scenes.Systems, time: number, delta: number): void
    {
        this.player.postUpdate();
    }

    private onRequestDialogue(message: string, title: string, iconTexture: string, iconFrame: string): void
    {
        this.sceneUI.requestDialogue(message, title, iconTexture, iconFrame);
    }
}