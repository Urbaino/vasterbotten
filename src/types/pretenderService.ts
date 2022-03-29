import { Nation } from "./nation"
import Status from "./status"
import { StatusDump } from "./statusDump"
import { UserResolvable } from "discord.js"

export type Player = { username: string, id: UserResolvable }

export interface PretenderService {
    claim: (nation: Nation['id'], player: Player) => Promise<boolean>,
    unclaim: (player: Player) => Promise<boolean>,
    status: () => Status | null,
    statusFromDump: (statusDump: StatusDump) => Status
}