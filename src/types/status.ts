import { Collection } from "discord.js";
import { Controller } from "./controller.js";
import { Nation } from "./nation.js";
import { Player } from "./pretenderService.js";
import { StatusDump } from "./statusDump.js";
import { TurnStatus } from "./turnStatus.js";

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

    gameStarted() { return this.turn > 0 }
    allNations(): Nation[] { return this.nations; }

    pending(): Nation[] { return this.nations.filter(n => n.submitted && !n.player); }
    claimed() { return this.nations.filter(this.NationHasPlayer); }
    finished() { return this.nations.filter(n => n.turnStatus === TurnStatus.Finished); }
    unfinished() { return this.nations.filter(n => n.controller !== Controller.ai && n.turnStatus !== TurnStatus.Finished); }
    playerNation(player: Player) { return this.claimed().find(n => n.player.id === player.id); }

    currentPlayers() { return this.claimed().map(n => `${n.player.username}: ${n.name}, ${n.tagline}`); }
    pendingNations() { return this.pending().map(n => `${n.name}, ${n.tagline}`); }
    finishedPlayers() { return this.finished().map(n => `${n.player?.username ?? 'Okänd'} (${n.name}, ${n.tagline})`); }
    unfinishedPlayers() { return this.unfinished().map(n => `${n.player?.username ?? 'Okänd'} (${n.name}, ${n.tagline})`); }
}
