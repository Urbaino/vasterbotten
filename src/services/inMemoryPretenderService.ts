import { Collection } from "discord.js";
import { Nation } from "../types/nation";
import { PretenderService, Player } from "../types/pretenderService";
import Status from "./status";
import StatusDumpService from "./statusDumpService";

export default class InMemoryPretenderService implements PretenderService {
    private nations: Collection<Nation['id'], Player | null>
    private statusService: StatusDumpService

    constructor(statusService: StatusDumpService) {
        this.nations = new Collection<Nation['id'], Player | null>();
        this.statusService = statusService;
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

    async status() {
        return new Status(await this.statusService.ReadStatus(), this.nations);
    }
}
