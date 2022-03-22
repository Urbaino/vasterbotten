import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { StatusDump } from '../types/statusDump'

export const ReadStatus = async (dir: string) => {
    const statusfilePath = path.join(dir, 'statusdump.txt')
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
            submitted: fs.existsSync(path.join(dir, `${data[6]}.2h`))
        })

    }

    return statusdump
}