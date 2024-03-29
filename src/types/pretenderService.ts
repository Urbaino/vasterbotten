import { Nation } from "./nation.js"
import Status from "./status.js"
import { StatusDump } from "./statusDump.js"
import { UserResolvable } from "discord.js"

export type Player = { username: string, id: UserResolvable }

export interface PretenderService {
    claim: (gameName: string, nation: Nation['id'], player: Player) => Promise<boolean>,
    unclaim: (gameName: string, player: Player) => Promise<boolean>,
    status: (gameName: string) => Status | null,
    gameNames: () => string[],
    statusFromDump: (statusDump: StatusDump) => Status | null
}