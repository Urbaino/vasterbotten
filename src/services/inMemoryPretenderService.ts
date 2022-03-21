import { Collection } from "discord.js";
import { Nation, PretenderService, Player } from "../types/pretenderService";

const nations = new Collection<Nation, Player | null>();

const InMemoryPretenderService: PretenderService = {
    claim: async (nation: Nation, player: Player) => {
        if (!nations.findKey((_, n) => n === nation)) return false
        nations.set(nation, player)
        return true
    },
    unclaim: async (player: Player) => {
        let nation = nations.findKey(p => p === player)
        if (!nation) return
        nations.set(nation, null)
    },
    pending: async () => {
        return nations.filter((player) => player === null).map((_, nation) => nation)
    },
    all: async () => nations,
    submitPretender: async (nation: Nation) => {
        if (nations.find((_, n) => n === nation)) return;
        nations.set(nation, null)
    },
    removePretender: async (nation: Nation) => {
        nations.delete(nation)
    }
}

export default InMemoryPretenderService