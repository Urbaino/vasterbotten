import { Controller } from "./controller";
import { TurnStatus } from "./turnStatus";

export interface Nation {
    nationNumber: number;
    pretenderNumber: number;
    controller: Controller;
    aiDifficultyNumber: number;
    turnStatus: TurnStatus;
    id: string;
    name: string;
    tagline: string;
    submitted: boolean;
}
