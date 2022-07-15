import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { CommandHandler } from '../types/commandHandler';
import { PretenderService } from '../types/pretenderService';
import gameLeave from './replies/gameLeave';

const dominions: CommandHandler = {
    data: new SlashCommandBuilder()
        .setName('dominions')
        .setDescription('Här lämnar du pågående spel.'),
    execute: async (interaction: CommandInteraction, service: PretenderService) => {

        await interaction.reply(await gameLeave(interaction.user.id, service));
    }
};

export default dominions