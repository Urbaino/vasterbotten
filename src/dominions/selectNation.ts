import { MessageComponentInteraction, MessageSelectMenu } from 'discord.js';
import { MessageComponentHandler } from '../types/messageComponentHandler';
import { PretenderService } from '../types/pretenderService';

const customId = 'selectNation';

const selectNation: MessageComponentHandler = {
    customId,
    execute: async (interaction: MessageComponentInteraction, service: PretenderService) => {
        if (!interaction.isSelectMenu()) return;
        if (interaction.values.length !== 1) return;

        if (await service.claim(interaction.values[0], interaction.user.username)) {
            await interaction.update({ content: `Du har valt ${interaction.values}`, components: [] });
        }
        else {
            await interaction.update({ content: `Någonting gick fel.`, components: [] });
        }
    },
    component: async (service: PretenderService) => {
        const nations = (await service.status()).pending().map(nation => ({ label: nation.id, value: nation.name }))
        return new MessageSelectMenu()
            .setCustomId(customId)
            .setPlaceholder('Välj nation')
            .addOptions(nations)
    }
};

export default selectNation