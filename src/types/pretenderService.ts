import { Collection } from "discord.js"
import { Nation } from "./nation"

export type Player = string

export interface PretenderService {
    claim: (nation: Nation['id'], player: Player) => Promise<boolean>,
    unclaim: (player: Player) => Promise<boolean>,
    pending: () => Promise<Nation['id'][]>,
    all: () => Promise<Collection<Nation['id'], Player | null>>,
}