import { Collection } from "discord.js";
import { Nation } from "../types/nation";
import { PretenderService, Player } from "../types/pretenderService";
import StatusDumpService from "./statusDumpService";

export default class InMemoryPretenderService implements PretenderService {
    private nations: Collection<Nation['id'], Player | null>
    private statusService: StatusDumpService

    constructor(statusService: StatusDumpService) {
        this.nations = new Collection<Nation['id'], Player | null>();
        this.statusService = statusService;
    }

    async init() {
        (await this.statusService.ReadStatus()).nations.forEach(n => this.nations.set(n.id, null))
    }

    async claim(nation: Nation['id'], player: Player) {
        if (!this.nations.findKey((_, n) => n === nation)) return false;
        this.nations.set(nation, player);
        return true;
    }

    async unclaim(player: Player) {
        let nation = this.nations.findKey(p => p === player);
        if (!nation) return false;
        this.nations.set(nation, null);
        return true;
    }

    async pending() {
        return this.nations.filter((player) => player === null).map((_, nation) => nation);
    }

    async all() {
        return this.nations
    }
}
