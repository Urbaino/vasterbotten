import { MessageActionRow, MessageComponentInteraction, MessageSelectMenu } from 'discord.js';
import InMemoryPretenderService from '../services/inMemoryPretenderService';
import { MessageComponentHandler } from '../types/messageComponentHandler';
import notPlaying from './notPlaying';

const customId = 'selectNation';

const selectNation: MessageComponentHandler = {
    customId,
    execute: async (interaction: MessageComponentInteraction) => {
        if (!interaction.isSelectMenu()) return;
        if (interaction.values.length !== 1) return;

        if (await InMemoryPretenderService.claim(interaction.values[0], interaction.user.username)) {
            const buttonRow = new MessageActionRow()
                .addComponents(await notPlaying.component())

            await interaction.update({ content: `Du har valt ${interaction.values}`, components: [buttonRow] });
        }
        else {
            await interaction.update({ content: `Någonting gick fel.`, components: [] });
        }
    },
    component: async () => {
        const pending = (await InMemoryPretenderService.pending())
        console.log('pending', pending)
        const nations = pending.map(nation => ({ label: nation, value: nation }))
        return new MessageSelectMenu()
            .setCustomId(customId)
            .setPlaceholder('Välj nation')
            .addOptions(nations)
    }
};

export default selectNation