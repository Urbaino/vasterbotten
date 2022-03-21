import { MessageActionRow, MessageComponentInteraction, MessageSelectMenu } from 'discord.js';
import { MessageComponentHandler } from '../../types/messageComponentHandler';
import notPlaying from './notPlaying';

const customId = 'selectNation';

const selectNation: MessageComponentHandler = {
    customId,
    execute: async (interaction: MessageComponentInteraction) => {
        if (!interaction.isSelectMenu()) return;

        const buttonRow = new MessageActionRow()
            .addComponents(notPlaying.component)

        await interaction.update({ content: `Du har valt ${interaction.values}`, components: [buttonRow] });
    },
    component: new MessageSelectMenu()
        .setCustomId(customId)
        .setPlaceholder('Välj nation')
        .addOptions([
            {
                label: 'Marignon',
                value: 'marignon',
            },
            {
                label: 'Pangaea',
                value: 'pangaea',
            },
        ]),
};

export default selectNation