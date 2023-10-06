export declare type gameStatistics =
{
    killedMonsters: Map<string, number>;
    waveCount: number;
};

export class GameAnalytics
{
    protected static _instance: GameAnalytics;

    protected killedMonsters: Map<string /** monsterName */, number /** killCount */>;
    protected waveCount: number = 0;

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
    }

    public onWaveCleared(): void
    {
        ++this.waveCount;
    }

    public onMonsterDie(monsterName: string): void
    {
        const monsterCount = this.killedMonsters.get(monsterName);
        if (monsterCount == undefined)
        {
            this.killedMonsters.set(monsterName, 0);
        }
        else
        {
            this.killedMonsters.set(monsterName, monsterCount + 1);
        }
    }

    public getGameStatistics(): gameStatistics
    {
        return {
            killedMonsters: this.killedMonsters,
            waveCount: this.waveCount,
        };
    }
}