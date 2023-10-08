export declare type MonsterStatistics =
{
    monsterTexture: string;
    monsterCount: number;
}

export declare type GameStatistics =
{
    monsterStatistics: MonsterStatistics[];
    waveCount: number;
    elapsedTime: number;
};

export class GameAnalytics
{
    protected static _instance: GameAnalytics;

    protected killedMonsters: Map<string /** monsterName */, number /** killCount */>;
    protected waveCount: number = 0;

    /** How much time this run has lasted */
    private elapsedTime: number = 0;

    private constructor()
    {
        GameAnalytics._instance = this;
    }

    public static get instance(): GameAnalytics
    {
        return this._instance;
    }

    public static init(): void
    {
        if (this._instance == undefined)
        {
            this._instance = new GameAnalytics();
        }
    }

    public static resetGameplay(): void
    {
        if (this._instance == undefined)
        {
            this.init();
        }

        this._instance.killedMonsters = new Map<string, number>();
        this._instance.waveCount = 0;
        this._instance.elapsedTime = 0;
    }

    public update(time: number, delta: number): void
    {
        this.elapsedTime += delta;
    }

    public onWaveCleared(): void
    {
        ++this.waveCount;
    }

    public onMonsterDie(monsterName: string, monsterTexture: string): void
    {
        const monsterCount = this.killedMonsters.get(monsterName);
        if (monsterCount == undefined)
        {
            this.killedMonsters.set(monsterTexture, 1);
        }
        else
        {
            this.killedMonsters.set(monsterTexture, monsterCount + 1);
        }
    }

    public getGameStatistics(): GameStatistics
    {
        let monsterStatistics = [] as MonsterStatistics[];

        this.killedMonsters.forEach((monsterCount: number, monsterTexture: string) =>
        {
            monsterStatistics.push({monsterTexture: monsterTexture, monsterCount: monsterCount});
        });

        return {
            monsterStatistics: monsterStatistics,
            waveCount: this.waveCount,
            elapsedTime: Math.round(this.elapsedTime)
        };
    }
}