import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction, CacheType } from "discord.js";

export interface Command {
    data: SlashCommandBuilder,
    execute: (interaction: Interaction<CacheType>) => Promise<void>
}
