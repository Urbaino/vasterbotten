import { Collection } from "discord.js";
import { Nation } from "../types/nation";
import { Player } from "../types/pretenderService";
import { StatusDump } from "../types/statusDump";
import { TurnStatus } from "../types/turnStatus";

export default class Status {
    readonly gameName: string;
    readonly turn: number;
    readonly nations: (Nation & { player: Player | null; })[];

    constructor(statusDump: StatusDump, pretenders: Collection<Nation['id'], Player | null>) {
        this.gameName = statusDump.gameName;
        this.turn = statusDump.turn;
        this.nations = statusDump.nations.map(n => ({ ...n, player: pretenders.get(n.id) ?? null }));
    }

    private NationHasPlayer(nation: Nation & { player: Player | null }): nation is (Nation & { player: Player }) {
        return nation.player !== null
    }

    pending(): Nation[] { return this.nations.filter(n => n.submitted && !n.player); }
    claimed() { return this.nations.filter(this.NationHasPlayer); }
    unfinished() { return this.nations.filter(n => n.turnStatus !== TurnStatus.Finished); }
    playerNation(username: string) { return this.claimed().find(n => n.player.username === username); }

    currentPlayers() { return this.claimed().map(n => `${n.player.username}: ${n.name}, ${n.tagline}`); }
    pendingNations() { return this.pending().map(n => `${n.name}, ${n.tagline}`); }
    unfinishedPlayers() { return this.unfinished().map(n => `${n.player?.username ?? 'Okänd'} (${n.name}, ${n.tagline})`); }
}
