import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { CommandHandler } from '../types/commandHandler';
import { PretenderService } from '../types/pretenderService';
import awaitingStart from './replies/awaitingStart';
import gameStatus from './replies/gameStatus';
import nationSelect from './replies/nationSelect';
import noAvailablePretenders from './replies/noAvailablePretenders';
import noGameLoaded from './replies/noGameLoaded';

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
            if (status.turn < 0) {
                await interaction.reply(await awaitingStart(interaction, service));
            }
            else {
                await interaction.reply(await gameStatus(interaction, service));
            }
        }
        else {
            if (status.pending().length) {
                await interaction.reply(await nationSelect(service));
            }
            else {
                if (status.turn < 0) {
                    await interaction.reply(await noAvailablePretenders(service));
                }
                else {
                    await interaction.reply(await gameStatus(interaction, service));
                }
            }

        }
    }
};

export default dominions