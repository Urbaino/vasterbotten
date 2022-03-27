import { Collection } from "discord.js";
import fsp from 'fs/promises'
import path from 'path'
import { playersDir } from '../config.json'
import { Nation } from "../types/nation";
import { PretenderService, Player } from "../types/pretenderService";
import { StatusDump } from "../types/statusDump";
import Status from "./status";
import StatusDumpService from "./statusDumpService";

export default class FilePretenderServiceBuilder {

    public static async build(statusService: StatusDumpService) {
        let nations = await this.readFromFile(statusService.Status?.gameName);
        return new FilePretenderService(statusService, nations);
    }

    private static async readFromFile(gameName: string | undefined): Promise<FilePretenderService['nations']> {
        if (gameName) {
            try {
                const file = await fsp.readFile(path.join(playersDir, FilePretenderService.filename(gameName)), { encoding: 'utf8' })
                let players: ([Nation['id'], Player])[] = JSON.parse(file)
                console.log("Loaded", players.length, "players");
                return new Collection(players)
            }
            catch {
                console.log('Could not load players');
            }
        }
        return new Collection<Nation['id'], Player>()
    }
}

class FilePretenderService implements PretenderService {
    private nations: Collection<Nation['id'], Player>
    private statusService: StatusDumpService

    public static readonly filename = (gameName: string) => `${gameName}_players.json`

    constructor(statusService: StatusDumpService, nations: FilePretenderService['nations']) {
        this.nations = nations;
        this.statusService = statusService;
    }


    private async saveToFile() {
        const entries = [];
        for (const e of this.nations.entries()) {
            entries.push(e)
        }
        const gameName = this.statusService.Status?.gameName
        if (!gameName) return
        await fsp.writeFile(path.join(playersDir, FilePretenderService.filename(gameName)), JSON.stringify(entries));
    }

    public async claim(nation: Nation['id'], player: Player) {
        if (!!this.nations.get(nation)) return false;
        this.nations.set(nation, { id: player.id, username: player.username });
        await this.saveToFile();
        return true;
    }

    public async unclaim(player: Player) {
        let nation = this.nations.findKey(p => p.id === player.id);
        if (!nation) return false;
        this.nations.delete(nation);
        await this.saveToFile();
        return true;
    }

    public status() {
        if (!this.statusService.Status) return null
        return new Status(this.statusService.Status, this.nations);
    }

    public statusFromDump(statusDump: StatusDump) {
        return new Status(statusDump, this.nations);
    }

}
