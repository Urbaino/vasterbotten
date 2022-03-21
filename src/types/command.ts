import { SlashCommandBuilder } from "@discordjs/builders";
import { CacheType, CommandInteraction } from "discord.js";

export interface Command {
    data: SlashCommandBuilder,
    execute: (interaction: CommandInteraction<CacheType>) => Promise<void>
}
