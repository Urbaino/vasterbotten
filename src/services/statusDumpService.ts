import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { StatusDump } from '../types/statusDump.js'
import EventEmitter from 'events'

export type StatusEvent = 'newTurn' | 'deleted' | 'newGame' | 'turnUpdated' | 'pretenderSubmitted' | 'pretenderClaimed' | 'playerLeft'

export default class StatusDumpService {
    private readonly dir: string;
    private timer?: NodeJS.Timer;
    private status: { [gameName: string]: StatusDump } = {};

    private events = new EventEmitter();

    constructor(dir: string) {
        this.dir = dir;
    }

    private StatusFilePath = (gameName: string) => path.join(this.dir, gameName, 'statusdump.txt')

    private async ReadStatus(gameName: string): Promise<StatusDump | null> {
        try {
            const file = await fsp.readFile(this.StatusFilePath(gameName), { encoding: 'utf8' })

            const lines = file.split('\n')
            let statusdump: StatusDump = {
                gameName: lines[0].match(/Status for \'(.*)\'/)?.at(1) ?? '',
                turn: Number.parseInt(lines[1].match(/turn (-?\d+)/)?.at(1) ?? ''),
                nations: []
            }

            for (let i = 2; i < lines.length; ++i) {
                if (lines[i].length === 0) continue;
                let data = lines[i].split('\t');
                statusdump.nations.push({
                    nationNumber: Number.parseInt(data[1]),
                    pretenderNumber: Number.parseInt(data[2]),
                    controller: Number.parseInt(data[3]),
                    aiDifficultyNumber: Number.parseInt(data[4]),
                    turnStatus: Number.parseInt(data[5]),
                    id: data[6],
                    name: data[7],
                    tagline: data[8],
                    submitted: fs.existsSync(path.join(this.dir, gameName, `${data[6]}.2h`))
                })
            }
            return statusdump;
        }
        catch (error) {
            console.error(error);
            return null
        }
    }

    private SetStatus(gameName: string, status: StatusDump) {
        this.status[gameName] = status;
    }

    private DeleteStatus(gameName: string) {
        delete this.status[gameName]
    }

    public Status(gameName: string): StatusDump | undefined {
        return this.status[gameName];
    }

    public GameNames() {
        return Object.entries(this.status).map(([key, _]) => key);
    }

    Subscribe(event: StatusEvent, listener: (status: StatusDump) => void) {
        this.events.addListener(event, listener);
    }

    private RaiseEvent(event: StatusEvent, status: StatusDump) {
        console.debug(new Date(), ':', 'event', ':', event, ':', status.gameName);
        this.events.emit(event, status)
    }

    private async UpdateStati() {
        const savedGames = (await fsp.readdir(this.dir, { withFileTypes: true })).filter(save => save.isDirectory).map(save => save.name);

        this.GameNames().filter(game => !savedGames.includes(game)).forEach(game => {
            const status = this.status[game]
            this.DeleteStatus(game)
            this.RaiseEvent('deleted', status)
        })

        await Promise.all(savedGames.map(async save => {
            const newStatus = await this.ReadStatus(save)
            if (!newStatus) return

            const currentStatus = this.status[newStatus.gameName];
            if (!currentStatus) this.RaiseEvent('newGame', newStatus)
            else {
                if (currentStatus.turn !== newStatus.turn) this.RaiseEvent('newTurn', newStatus)
                else for (let i = 0; i < currentStatus.nations.length; ++i) {
                    const currentNation = currentStatus.nations[i];
                    const newNation = newStatus.nations[i];
                    if (currentNation.turnStatus !== newNation.turnStatus) this.RaiseEvent('turnUpdated', newStatus)
                    if (!newStatus.turn && !currentNation.submitted && newNation.submitted) this.RaiseEvent('pretenderSubmitted', newStatus)
                }
            }

            this.SetStatus(newStatus.gameName, newStatus)
        }));
    }

    async BeginMonitor() {
        await this.UpdateStati()
        this.timer = setInterval(this.UpdateStati.bind(this), 5000)
        console.log(`Monitoring statusdumps in ${this.dir}`);
    }

    EndMonitor() {
        this.timer && clearInterval(this.timer)
        console.log(`Stopped monitoring statusdumps in ${this.dir}`);
    }
}
