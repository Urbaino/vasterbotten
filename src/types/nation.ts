import { Controller } from "./controller.js";
import { TurnStatus } from "./turnStatus.js";

export interface Nation {
    nationNumber: number;
    /** Team number. */
    pretenderNumber: number;
    controller: Controller;
    aiDifficultyNumber: number;
    turnStatus: TurnStatus;
    id: string;
    name: string;
    tagline: string;
    submitted: boolean;
}
