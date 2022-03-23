import { codeBlock, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, InteractionReplyOptions, MessageActionRow } from 'discord.js';
import { CommandHandler } from '../types/commandHandler';
import { PretenderService } from '../types/pretenderService';
import notPlaying from './notPlaying';
import selectNation from './selectNation';

const dominions: CommandHandler = {
    data: new SlashCommandBuilder()
        .setName('dominions')
        .setDescription('Här hanterar du ditt deltagande i vår egna Dominions-server.'),
    execute: async (interaction: CommandInteraction, service: PretenderService) => {

        const status = await service.status()

        const currentPlayers = status.claimed().map(n => `${n.player}: ${n.name}, ${n.tagline}`);
        const playerNation = status.claimed().find(n => n.player === interaction.user.username);
        const pendingNations = status.pending().map(n => `${n.name}, ${n.tagline}`);
        const unfinishedPlayers = status.unfinished().map(n => `${n.player} (${n.name}, ${n.tagline})`);

        const nationSelectReply: () => Promise<InteractionReplyOptions> = async () => {
            const nationRow = new MessageActionRow().addComponents(await selectNation.component(service));
            return {
                content: `Välj din nation${currentPlayers.join('\n')}`,
                components: [nationRow],
                ephemeral: true
            };
        }

        const gameStatusReply: () => InteractionReplyOptions = () => {
            return {
                content: `Runda ${status.turn}, vi väntar på:\n${unfinishedPlayers.join('\n')}`,
                components: [],
                ephemeral: true
            };
        }

        const noAvailablePretendersReply: () => InteractionReplyOptions = () => {
            return {
                content: `Det finns inga lediga pretenders. Ladda upp en ny för att välja nation. `,
                components: [],
                ephemeral: true
            }
        }

        const awaitingStartReply: () => Promise<InteractionReplyOptions> = async () => {
            const buttonRow = new MessageActionRow().addComponents(await notPlaying.component(service))
            return {
                content: `Du spelar som ${playerNation?.name}.\n\nValda pretenders:\n${currentPlayers.length ? codeBlock(currentPlayers.join('\n')) : 'Inga'}\nKvar att välja:\n${pendingNations.length ? codeBlock(pendingNations.join('\n')) : 'Inga!'}`,
                components: [buttonRow],
                ephemeral: true
            };
        }

        if (playerNation) {
            if (status.turn < 0) {
                await interaction.reply(await awaitingStartReply());
            }
            else {
                await interaction.reply(gameStatusReply());
            }
        }
        else {
            if (status.pending().length) {
                await interaction.reply(await nationSelectReply());
            }
            else {
                if (status.turn < 0) {
                    await interaction.reply(noAvailablePretendersReply());
                }
                else {
                    await interaction.reply(gameStatusReply());
                }
            }

        }
    }
};

export default dominions