import { Collection } from "discord.js"
import { Nation } from "./nation"
import { StatusDump } from "./statusDump"

export type Player = string

export interface PretenderService {
    init: () => Promise<void>
    claim: (nation: Nation['id'], player: Player) => Promise<boolean>,
    unclaim: (player: Player) => Promise<boolean>,
    pending: () => Promise<Nation['id'][]>,
    all: () => Promise<Collection<Nation['id'], Player | null>>,
    claimed: () => Promise<Collection<Nation['id'], Player>>,
    status: () => Promise<StatusDump>,
    userHasClaimed: () => Promise<Nation['name'] | null>
}