import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageActionRow } from 'discord.js';
import { CommandHandler } from '../../types/commandHandler';
import selectNation from './selectNation';

const dominions: CommandHandler = {
    data: new SlashCommandBuilder()
        .setName('dominions')
        .setDescription('Här hanterar du ditt deltagande i vår egna Dominions-server.'),
    execute: async (interaction: CommandInteraction) => {

        const nationRow = new MessageActionRow()
            .addComponents(selectNation.component);

        await interaction.reply({ content: 'Dominions command received! Providing example!', components: [nationRow], ephemeral: true });
    }
};

export default dominions