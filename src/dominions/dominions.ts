import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { CommandHandler } from '../types/commandHandler';
import { PretenderService } from '../types/pretenderService';
import gameSelect from './replies/gameSelect';

const dominions: CommandHandler = {
    data: new SlashCommandBuilder()
        .setName('dominions')
        .setDescription('Här ansluter du till spel i vår egna Dominions-server, samt ser deras status.'),
    execute: async (interaction: CommandInteraction, service: PretenderService) => {

        await interaction.reply(await gameSelect(service));
    }
};

export default dominions