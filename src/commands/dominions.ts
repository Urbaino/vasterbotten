import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction } from 'discord.js';
import { Command } from '../types/command';

const dominions: Command = {
    data: new SlashCommandBuilder()
        .setName('dominions')
        .setDescription('Här hanterar du ditt deltagande i vår egna Dominions-server.'),
    execute: async (interaction: CommandInteraction<CacheType>) => {
        await interaction.reply({ content: 'Dominions command received! Doing nothing!', ephemeral: true },);
    },
};

export default dominions