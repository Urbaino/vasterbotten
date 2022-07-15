import { SlashCommandBuilder } from '@discordjs/builders';
import { AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { CommandHandler } from '../types/commandHandler';
import { PretenderService } from '../types/pretenderService';
import awaitingStart from './replies/awaitingStart';
import currentGames from './replies/currentGames';
import gameStatus from './replies/gameStatus';
import nationSelect from './replies/nationSelect';
import noAvailablePretenders from './replies/noAvailablePretenders';
import noGameLoaded from './replies/noGameLoaded';
import playerNation from './replies/playerNation';

const gameNameOption = 'gamename'

const dominions: CommandHandler = {
    data: new SlashCommandBuilder()
        .setName('dominions')
        .addStringOption(option =>
            option
                .setName(gameNameOption)
                .setDescription('Namn på spelet du vill hantera.')
                .setAutocomplete(true))
        .setDescription('Här hanterar du spel på vår egna Dominions-server.'),
    options: (_: AutocompleteInteraction, service: PretenderService) => { return service.gameNames() },
    execute: async (interaction: CommandInteraction, service: PretenderService) => {

        let gameName = interaction.options.getString(gameNameOption);
        if (!gameName) {
            await interaction.reply(await currentGames(interaction.user.username, service));
            return
        }

        const status = service.status(gameName)

        if (!status) {
            await interaction.reply(await noGameLoaded());
            return;
        }

        if (status.playerNation(interaction.user.username)) {
            await interaction.reply(await playerNation(gameName, interaction, service));
            if (status.gameStarted()) {
                await interaction.followUp(await gameStatus(gameName, service));
            }
            else {
                await interaction.followUp(await awaitingStart(gameName, service));
            }
        }
        else {
            if (status.pending().length) {
                await interaction.reply(await nationSelect(gameName, service));
            }
            else {
                if (status.gameStarted()) {
                    await interaction.reply(await gameStatus(gameName, service));
                }
                else {
                    await interaction.reply(await noAvailablePretenders());
                }
            }

        }

    }
};

export default dominions