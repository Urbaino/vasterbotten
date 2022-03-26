import { Nation } from "./nation"
import Status from "../services/status"

export type Player = string

export interface PretenderService {
    claim: (nation: Nation['id'], player: Player) => Promise<boolean>,
    unclaim: (player: Player) => Promise<boolean>,
    status: () => Status | null,
}