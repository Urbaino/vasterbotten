import { MessageActionRowComponent, MessageComponentInteraction } from "discord.js";

export interface MessageComponentHandler {
    customId: string,
    execute: (interaction: MessageComponentInteraction) => Promise<void>,
    component: () => Promise<MessageActionRowComponent>
}
