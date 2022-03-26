import { Collection } from "discord.js";
import { Nation } from "../types/nation";
import { PretenderService, Player } from "../types/pretenderService";
import { StatusDump } from "../types/statusDump";
import Status from "./status";
import StatusDumpService from "./statusDumpService";

export default class InMemoryPretenderService implements PretenderService {
    private nations: Collection<Nation['id'], Player>
    private statusService: StatusDumpService

    constructor(statusService: StatusDumpService) {
        this.nations = new Collection<Nation['id'], Player>();
        this.statusService = statusService;
    }

    async claim(nation: Nation['id'], player: Player) {
        if (!!this.nations.get(nation)) return false;
        this.nations.set(nation, player);
        return true;
    }

    async unclaim(player: Player) {
        let nation = this.nations.findKey(p => p === player);
        if (!nation) return false;
        this.nations.delete(nation);
        return true;
    }

    status() {
        if (!this.statusService.Status) return null
        return new Status(this.statusService.Status, this.nations);
    }

    statusFromDump(statusDump: StatusDump) {
        return new Status(statusDump, this.nations);
    }

}
