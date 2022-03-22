import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageActionRow } from 'discord.js';
import { CommandHandler } from '../types/commandHandler';
import { PretenderService } from '../types/pretenderService';
import notPlaying from './notPlaying';
import selectNation from './selectNation';

const dominions: CommandHandler = {
    data: new SlashCommandBuilder()
        .setName('dominions')
        .setDescription('Här hanterar du ditt deltagande i vår egna Dominions-server.'),
    execute: async (interaction: CommandInteraction, service: PretenderService) => {

        var status = await service.status();

        if (status.turn < 0) {
            const pretenders = status.claimed()
            const currentPlayers = pretenders.map(n => `${n.player}: ${n.name}`)
            let playerNation = pretenders.find(n => n.player === interaction.user.username)
            if (playerNation) {
                const pending = status.pending().map(n => n.name);
                // const buttonRow = new MessageActionRow().addComponents(await notPlaying.component(service))
                await interaction.reply({
                    content: `Du spelar som ${playerNation.name}.\n\nValda pretenders:\n${currentPlayers.length ? currentPlayers.join('\n* ') : 'Inga'}\n\nKvar att välja:\n${pending.length ? pending.join('\n') : 'Inga!'}`,
                    // components: [buttonRow], 
                    ephemeral: true
                });
            } else {
                if (status.pending().length) {
                    const nationRow = new MessageActionRow().addComponents(await selectNation.component(service));
                    await interaction.reply({
                        content: `Välj din nation${currentPlayers.join('\n')}`,
                        components: [nationRow],
                        ephemeral: true
                    });
                }
                else {
                    await interaction.reply({
                        content: `Ingen har laddat upp en pretender ännu, du kan inte välja nation.`,
                        components: [],
                        ephemeral: true
                    });
                }
            }
        }
        else {
            const unfinishedPlayers = status.unfinished().map(n => n.player)
            await interaction.reply({
                content: `Runda ${status.turn}, vi väntar på:\n${unfinishedPlayers.join('\n')}`,
                components: [],
                ephemeral: true
            });
        }
    }
};

export default dominions