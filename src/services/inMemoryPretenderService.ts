import { Collection } from "discord.js";
import { Nation } from "../types/nation";
import { PretenderService, Player } from "../types/pretenderService";

const nations = new Collection<Nation['id'], Player | null>();

const InMemoryPretenderService: PretenderService = {
    claim: async (nation: Nation['id'], player: Player) => {
        if (!nations.findKey((_, n) => n === nation)) return false;
        nations.set(nation, player);
        return true;
    },
    unclaim: async (player: Player) => {
        let nation = nations.findKey(p => p === player);
        if (!nation) return false;
        nations.set(nation, null);
        return true;
    },
    pending: async () => {
        return nations.filter((player) => player === null).map((_, nation) => nation);
    },
    all: async () => nations,
}

export default InMemoryPretenderService