import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { AutocompleteInteraction, CommandInteraction } from "discord.js";
import { PretenderService } from "./pretenderService";

export interface CommandHandler {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder,
    execute: (interaction: CommandInteraction, service: PretenderService) => Promise<void>,
    options: (interaction: AutocompleteInteraction, service: PretenderService) => string[] | null
}
