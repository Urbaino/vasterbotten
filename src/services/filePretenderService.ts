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
        const nationsByGame: FilePretenderService['nationsByGame'] = {}
        Promise.all(statusService.GameNames().map(async gameName => {
            nationsByGame[gameName] = await this.readFromFile(dir, gameName);
        }))
        return new FilePretenderService(dir, statusService, nationsByGame);
    }

    private static async readFromFile(dir: string, gameName: string | undefined): Promise<Collection<Nation['id'], Player>> {
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
    private nationsByGame: { [gameName: string]: Collection<Nation['id'], Player> };
    private statusService: StatusDumpService;
    private dir: string;

    public static readonly filename = (gameName: string) => `${gameName}_players.json`

    constructor(dir: string, statusService: StatusDumpService, nations: FilePretenderService['nationsByGame']) {
        this.dir = dir;
        this.nationsByGame = nations;
        this.statusService = statusService;
    }


    private async saveToFile(gameName: string) {
        const nations = this.nationsByGame[gameName];
        if (!nations) return
        const entries = [];
        for (const nationPlayerPair of nations.entries()) {
            entries.push(nationPlayerPair)
        }
        await fsp.writeFile(path.join(this.dir, FilePretenderService.filename(gameName)), JSON.stringify(entries));
    }

    public async claim(gameName: string, nation: Nation['id'], player: Player) {
        const nations = this.nationsByGame[gameName];
        if (!!nations.get(nation)) return false;
        nations.set(nation, { id: player.id, username: player.username });
        await this.saveToFile(gameName);
        return true;
    }

    public async unclaim(gameName: string, player: Player) {
        const nations = this.nationsByGame[gameName];
        let nation = nations.findKey(p => p.id === player.id);
        if (!nation) return false;
        nations.delete(nation);
        await this.saveToFile(gameName);
        return true;
    }

    public gameNames = () => this.statusService.GameNames()

    public status(gameName: string) {
        const status = this.statusService.Status(gameName);
        if (!status) return null
        return new Status(status, this.nationsByGame[gameName]);
    }

    public statusFromDump(statusDump: StatusDump) {
        const nations = this.nationsByGame[statusDump.gameName];
        if (!nations) {
            console.error(`Nations for ${statusDump.gameName} does not exist!`);
            return null;
        }
        return new Status(statusDump, nations);
    }

}
