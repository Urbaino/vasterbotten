import { Nation } from "./nation"
import Status from "./status"
import { StatusDump } from "./statusDump"
import { UserResolvable } from "discord.js"

export type Player = { username: string, id: UserResolvable }

export interface PretenderService {
    claim: (gameName: string, nation: Nation['id'], player: Player) => Promise<boolean>,
    unclaim: (gameName: string, player: Player) => Promise<boolean>,
    status: (gameName: string) => Status | null,
    gameNames: () => string[],
    statusFromDump: (statusDump: StatusDump) => Status | null
}