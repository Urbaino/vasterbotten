import { MessageButton, MessageComponentInteraction } from 'discord.js';
import { MessageButtonStyles } from 'discord.js/typings/enums';
import { MessageComponentHandler } from '../types/messageComponentHandler';
import { PretenderService } from '../types/pretenderService';

const customId = 'notPlaying';

const notPlaying: MessageComponentHandler = {
    customId,
    execute: async (interaction: MessageComponentInteraction, service: PretenderService) => {
        if (!interaction.isButton()) return;

        if ((await service.status()).turn > 0) {
            await interaction.update({ content: `Du kan inte lämna spelet när det har startat.`, components: [] });
        }
        else {
            service.unclaim(interaction.user.username);
            await interaction.update({ content: `Du har lämnat spelet.`, components: [] });
        }
    },
    component: async () => new MessageButton()
        .setCustomId(customId)
        .setLabel('Lämna spelet')
        .setStyle(MessageButtonStyles.DANGER)
};

export default notPlaying