import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders';
import { AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { CommandHandler } from '../types/commandHandler';
import { PretenderService } from '../types/pretenderService';
import awaitingStart from './replies/awaitingStart';
import currentGames from './replies/currentGames';
import gameStatus from './replies/gameStatus';
import nationSelect from './replies/nationSelect';
import { Controller } from '../types/controller';

const claimCommand = 'claim'
const statusCommand = 'status'
const leaveCommand = 'leave'

const gameNameOption = 'gamename'
const gameNameOptionBuilder = (option: SlashCommandStringOption) => option.setName(gameNameOption).setDescription('Namn på spelet.').setAutocomplete(true).setRequired(true)

const dominions: CommandHandler = {
    data: new SlashCommandBuilder()
        .setName('dominions')
        .addSubcommand(c => c.setName(claimCommand).setDescription('Registrera dig som spelare').addStringOption(gameNameOptionBuilder))
        .addSubcommand(c => c.setName(statusCommand).setDescription('Se status på spelet').addStringOption(gameNameOptionBuilder))
        .addSubcommand(c => c.setName(leaveCommand).setDescription('Lämna ett spel').addStringOption(gameNameOptionBuilder))
        .setDescription('Här hanterar du ditt deltagande på vår egna Dominions-server.'),
    options: (_: AutocompleteInteraction, service: PretenderService) => { return service.gameNames() },
    execute: async (interaction: CommandInteraction, service: PretenderService) => {
        let gameName = interaction.options.getString(gameNameOption);

        if (!gameName) {
            await interaction.reply(await currentGames(interaction.user, service));
            return
        }

        const status = service.status(gameName)

        if (!status) {
            await interaction.reply(await currentGames(interaction.user, service));
            return;
        }

        switch (interaction.options.getSubcommand()) {
            case statusCommand: {
                if (status.gameStarted()) {
                    await interaction.reply(await gameStatus(gameName, interaction.user, service));
                }
                else {
                    await interaction.reply(await awaitingStart(gameName, service));
                }
                break;
            }

            case claimCommand: {
                const playerNation = status.playerNation(interaction.user)
                if (playerNation) {
                    await interaction.reply({ content: `Du har redan valt nation i ${gameName}. Du spelar som ${playerNation.name}.`, ephemeral: true });
                }
                else if (status.pending().length) {
                    await interaction.reply(await nationSelect(gameName, service));
                }
                else {
                    await interaction.reply({ content: `Det finns inga lediga pretenders i ${gameName}. Ladda upp en ny för att välja nation.`, ephemeral: true });
                }
                break;
            }
            case leaveCommand: {
                const playerNation = status.playerNation(interaction.user);
                if (!playerNation) {
                    await interaction.reply({ content: `Du har ingen nation i ${gameName}.`, ephemeral: true });
                }
                else if (status.gameStarted() && playerNation.controller === Controller.human) {
                    await interaction.reply({ content: `Du kan inte lämna spelet innan du är besegrad eller har lämnat över din nation till AI.`, ephemeral: true });
                }
                else {
                    service.unclaim(gameName, interaction.user);
                    await interaction.reply({ content: `Du har lämnat ${gameName}.`, ephemeral: true });
                    status.gameStarted() && await interaction.followUp({ content: `${interaction.user.username} (${playerNation.name}) har lämnat ${gameName}.`, ephemeral: false });
                }
                break;
            }
        }
    }
}

export default dominions