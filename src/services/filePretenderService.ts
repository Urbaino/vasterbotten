import { Collection } from "discord.js";
import fsp from 'fs/promises'
import path from 'path'
import { Nation } from "../types/nation.js";
import { PretenderService, Player } from "../types/pretenderService.js";
import { StatusDump } from "../types/statusDump.js";
import Status from "../types/status.js";
import StatusDumpService from "./statusDumpService.js";
import RoleService from "./roleService.js";
import EventService from "./eventService.js";

export default class FilePretenderServiceBuilder {

    public static async build(dir: string, statusService: StatusDumpService, roleService: RoleService, eventService: EventService) {
        const nationsByGame: FilePretenderService['nationsByGame'] = {}
        await Promise.all(statusService.GameNames().map(async gameName => {
            nationsByGame[gameName] = await this.readFromFile(dir, gameName);
        }))
        return new FilePretenderService(dir, statusService, roleService, eventService, nationsByGame);
    }

    private static async readFromFile(dir: string, gameName: string | undefined): Promise<Collection<Nation['id'], Player>> {
        if (gameName) {
            try {
                const file = await fsp.readFile(path.join(dir, FilePretenderService.filename(gameName)), { encoding: 'utf8' })
                let players: ([Nation['id'], Player])[] = JSON.parse(file)
                console.log("Loaded", players.length, "players for", gameName);
                return new Collection(players)
            }
            catch {
                console.log('Could not load players for', gameName);
            }
        }
        return new Collection<Nation['id'], Player>()
    }
}

class FilePretenderService implements PretenderService {
    private nationsByGame: { [gameName: string]: Collection<Nation['id'], Player> };
    private statusService: StatusDumpService;
    private roleService: RoleService;
    private eventService: EventService;
    private dir: string;

    public static readonly filename = (gameName: string) => `${gameName}_players.json`

    constructor(dir: string, statusService: StatusDumpService, roleService: RoleService, eventService: EventService, nations: FilePretenderService['nationsByGame']) {
        this.dir = dir;
        this.nationsByGame = nations;
        this.statusService = statusService;
        this.roleService = roleService;
        this.eventService = eventService
        this.eventService.Subscribe('newGame', this.CreatePlayersFile.bind(this))
        this.eventService.Subscribe('deleted', this.DeletePlayersFile.bind(this))
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

    private async CreatePlayersFile(status: StatusDump) {
        this.nationsByGame[status.gameName] = new Collection<Nation['id'], Player>()
    }

    private async DeletePlayersFile(status: StatusDump) {
        delete this.nationsByGame[status.gameName]
        await fsp.rm(path.join(this.dir, FilePretenderService.filename(status.gameName)), { force: true });
    }

    public async claim(gameName: string, nation: Nation['id'], player: Player) {
        const nations = this.nationsByGame[gameName];
        if (!!nations.get(nation)) return false;
        nations.set(nation, { id: player.id, username: player.username });
        await this.saveToFile(gameName);
        await this.roleService.AddRoleToUser(player.id, gameName);
        return true;
    }

    public async unclaim(gameName: string, player: Player) {
        const nations = this.nationsByGame[gameName];
        let nation = nations.findKey(p => p.id === player.id);
        if (!nation) return false;
        nations.delete(nation);
        await this.saveToFile(gameName);
        await this.roleService.RemoveRoleFromUser(player.id, gameName);
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
