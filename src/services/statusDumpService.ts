import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { StatusDump } from '../types/statusDump'
import EventEmitter from 'events'

export type StatusEvent = 'newTurn'

export default class StatusDumpService {
    private readonly dir: string;
    private timer?: NodeJS.Timer;
    private status: { [gameName: string]: StatusDump } = {};

    private events = new EventEmitter();

    constructor(dir: string) {
        this.dir = dir;
    }

    private StatusFilePath = (gameName: string) => path.join(this.dir, gameName, 'statusdump.txt')

    private async ReadStatus(gameName: string): Promise<StatusDump> {
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

    private SetStatus(gameName: string, status: StatusDump) {
        this.status[gameName] = status;
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
        console.debug(new Date(), ':', 'event', ':', event);
        this.events.emit(event, status)
    }

    private ProcessEvents(newStatus: StatusDump) {
        const currentStatus = this.status[newStatus.gameName];

        if (!currentStatus || !newStatus) return newStatus;
        if (currentStatus.turn !== newStatus.turn) this.RaiseEvent('newTurn', newStatus)

        return newStatus
    }

    private async UpdateStati() {
        const savedGames = await fsp.readdir(this.dir, { withFileTypes: true });
        await Promise.all(savedGames.filter(save => save.isDirectory).map(async save => {
            this.SetStatus(save.name, this.ProcessEvents(await this.ReadStatus(save.name)))
        }));
        // TODO: Remove deleted games (directory does not exist anymore) from this.status
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
