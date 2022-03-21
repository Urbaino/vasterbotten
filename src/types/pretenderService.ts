import { Collection } from "discord.js"

export type Player = string
export type Nation = string

export interface PretenderService {
    claim: (nation: Nation, player: Player) => Promise<boolean>,
    unclaim: (player: Player) => Promise<void>,
    pending: () => Promise<Nation[]>,
    all: () => Promise<Collection<Nation, Player | null>>,
    submitPretender: (nation: Nation) => Promise<void>
    removePretender: (nation: Nation) => Promise<void>
}