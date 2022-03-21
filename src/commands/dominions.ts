import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, Interaction } from 'discord.js';
import { Command } from '../types/command';

const dominions: Command = {
    data: new SlashCommandBuilder()
        .setName('dominions')
        .setDescription('Hantering av vår egna Dominions-server!'),
    execute: async (interaction: Interaction<CacheType>) => {
        if (!interaction.isMessageComponent()) return
        await interaction.reply('Dominions command received! Doing nothing!');
    },
};

export default dominions