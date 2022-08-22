import { MessageComponentInteraction } from "discord.js";
import { PretenderService } from "./pretenderService.js";

export interface MessageComponentHandler {
    customId: string,
    execute: (interaction: MessageComponentInteraction, service: PretenderService) => Promise<void>
}
