import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { CommandHandler } from '../types/commandHandler';
import { PretenderService } from '../types/pretenderService';
import awaitingStart from './replies/awaitingStart';
import gameStatus from './replies/gameStatus';
import nationSelect from './replies/nationSelect';
import noAvailablePretenders from './replies/noAvailablePretenders';
import noGameLoaded from './replies/noGameLoaded';
import playerNation from './replies/playerNation';

const dominions: CommandHandler = {
    data: new SlashCommandBuilder()
        .setName('dominions')
        .setDescription('Här hanterar du ditt deltagande i vår egna Dominions-server.'),
    execute: async (interaction: CommandInteraction, service: PretenderService) => {

        const status = service.status()

        if (!status) {
            await interaction.reply(await noGameLoaded());
            return;
        }

        if (status.playerNation(interaction.user.username)) {
            await interaction.reply(await playerNation(interaction, service));
            if (status.gameStarted()) {
                await interaction.followUp(await gameStatus(interaction, service));
            }
            else {
                await interaction.followUp(await awaitingStart(interaction, service));
            }
        }
        else {
            if (status.pending().length) {
                await interaction.reply(await nationSelect(service));
            }
            else {
                if (status.gameStarted()) {
                    await interaction.reply(await gameStatus(interaction, service));
                }
                else {
                    await interaction.reply(await noAvailablePretenders(service));
                }
            }

        }
    }
};

export default dominions