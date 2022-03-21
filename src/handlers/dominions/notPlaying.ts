import { MessageButton, MessageComponentInteraction } from 'discord.js';
import { MessageButtonStyles } from 'discord.js/typings/enums';
import { MessageComponentHandler } from '../../types/messageComponentHandler';

const customId = 'notPlaying';

const notPlaying: MessageComponentHandler = {
    customId,
    execute: async (interaction: MessageComponentInteraction) => {
        if (!interaction.isButton()) return;

        await interaction.update({ content: `Du har lämnat spelet.`, components: [] });
    },
    component: new MessageButton()
        .setCustomId(customId)
        .setLabel('Ta bort mig från spelet')
        .setStyle(MessageButtonStyles.DANGER)
};

export default notPlaying