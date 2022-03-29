import { Collection } from "discord.js";
import fsp from 'fs/promises'
import path from 'path'
import { Nation } from "../types/nation";
import { PretenderService, Player } from "../types/pretenderService";
import { StatusDump } from "../types/statusDump";
import Status from "../types/status";
import StatusDumpService from "./statusDumpService";

export default class FilePretenderServiceBuilder {

    public static async build(dir: string, statusService: StatusDumpService) {
        let nations = await this.readFromFile(dir, statusService.Status?.gameName);
        return new FilePretenderService(dir, statusService, nations);
    }

    private static async readFromFile(dir: string, gameName: string | undefined): Promise<FilePretenderService['nations']> {
        if (gameName) {
            try {
                const file = await fsp.readFile(path.join(dir, FilePretenderService.filename(gameName)), { encoding: 'utf8' })
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
    private nations: Collection<Nation['id'], Player>;
    private statusService: StatusDumpService;
    private dir: string;

    public static readonly filename = (gameName: string) => `${gameName}_players.json`

    constructor(dir: string, statusService: StatusDumpService, nations: FilePretenderService['nations']) {
        this.dir = dir;
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
        await fsp.writeFile(path.join(this.dir, FilePretenderService.filename(gameName)), JSON.stringify(entries));
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
