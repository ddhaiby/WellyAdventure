export declare type WELLY_MonsterStatistics =
{
    monsterTexture: string;
    monsterCount: number;
}

export declare type WELLY_GameStatistics =
{
    monsterStatistics: WELLY_MonsterStatistics[];
    waveCount: number;
    elapsedTime: number;
};

export class WELLY_GameAnalytics
{
    protected static _instance: WELLY_GameAnalytics;

    protected killedMonsters: Map<string /** monsterName */, number /** killCount */>;
    protected waveCount: number = 0;

    /** How much time this run has lasted */
    private elapsedTime: number = 0;

    private constructor()
    {
        WELLY_GameAnalytics._instance = this;
    }

    public static get instance(): WELLY_GameAnalytics
    {
        return this._instance;
    }

    public static init(): void
    {
        if (this._instance == undefined)
        {
            this._instance = new WELLY_GameAnalytics();
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

    public getGameStatistics(): WELLY_GameStatistics
    {
        let monsterStatistics = [] as WELLY_MonsterStatistics[];

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