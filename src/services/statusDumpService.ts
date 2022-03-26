import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { StatusDump } from '../types/statusDump'
import EventEmitter from 'events'

export type StatusEvent = 'newTurn'

export default class StatusDumpService {
    private dir: string;
    private statusfilePath: string;
    private timer?: NodeJS.Timer;
    private status?: StatusDump | undefined;

    private events = new EventEmitter();

    constructor(dir: string) {
        this.dir = dir;
        this.statusfilePath = path.join(this.dir, 'statusdump.txt')
    }

    private async ReadStatus(): Promise<StatusDump> {
        const file = await fsp.readFile(this.statusfilePath, { encoding: 'utf8' })

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
                submitted: fs.existsSync(path.join(this.dir, `${data[6]}.2h`))
            })
        }
        return statusdump;
    }

    private SetStatus(status: StatusDump | undefined) {
        // console.debug(new Date(), ':', 'Status updated');
        this.status = status;
    }

    public get Status(): StatusDump | undefined {
        return this.status;
    }


    Subscribe(event: StatusEvent, listener: (status: StatusDump) => void) {
        this.events.addListener(event, listener);
    }

    private RaiseEvent(event: StatusEvent, status: StatusDump) {
        console.debug(new Date(), ':', 'event', ':', event);
        this.events.emit(event, status)
    }

    private ProcessEvents(newStatus: StatusDump) {
        if (!this.status || !newStatus) return newStatus;
        if (this.status.turn !== newStatus.turn) this.RaiseEvent('newTurn', newStatus)
        return newStatus
    }

    BeginMonitor() {
        this.timer = setInterval(() => this.ReadStatus().then(this.ProcessEvents.bind(this)).then(this.SetStatus.bind(this)), 5000)
        console.log(`Monitoring statusdump in ${this.dir}`);
    }

    EndMonitor() {
        this.timer && clearInterval(this.timer)
        console.log(`Stopped monitoring statusdump in ${this.dir}`);
    }
}
