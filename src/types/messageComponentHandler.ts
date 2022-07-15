import { MessageComponentInteraction } from "discord.js";
import { PretenderService } from "./pretenderService";

export interface MessageComponentHandler {
    customId: string,
    execute: (interaction: MessageComponentInteraction, service: PretenderService) => Promise<void>
}
