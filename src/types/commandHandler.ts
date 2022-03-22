import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { PretenderService } from "./pretenderService";

export interface CommandHandler {
    data: SlashCommandBuilder,
    execute: (interaction: CommandInteraction, service: PretenderService) => Promise<void>
}
