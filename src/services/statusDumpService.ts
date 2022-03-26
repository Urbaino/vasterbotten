import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { StatusDump } from '../types/statusDump'

export default class StatusDumpService {
    private dir: string;
    private timer?: NodeJS.Timer;
    private status?: StatusDump | undefined;

    constructor(dir: string) {
        this.dir = dir;
    }

    private async ReadStatus(): Promise<StatusDump> {
        const statusfilePath = path.join(this.dir, 'statusdump.txt')
        const file = await fsp.readFile(statusfilePath, { encoding: 'utf8' })

        const lines = file.split('\n')
        var statusdump: StatusDump = {
            gameName: lines[0].match(/Status for \'(.*)\'/)?.at(1) ?? '',
            turn: Number.parseInt(lines[1].match(/turn (-?\d+)/)?.at(1) ?? ''),
            nations: []
        }

        for (var i = 2; i < lines.length; ++i) {
            if (lines[i].length === 0) continue;
            var data = lines[i].split('\t');
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

    public get Status(): StatusDump | undefined {
        return this.status;
    }

    BeginMonitor() {
        this.timer = setInterval(() => this.ReadStatus().then(s => this.status = s), 5000)
        console.log(`Monitoring statusdump in ${this.dir}`);
    }

    EndMonitor() {
        this.timer && clearInterval(this.timer)
        console.log(`Stopped monitoring statusdump in ${this.dir}`);
    }
}
