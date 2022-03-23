import { MessageComponentInteraction, MessageSelectMenu } from 'discord.js';
import { MessageComponentHandler } from '../types/messageComponentHandler';
import { PretenderService } from '../types/pretenderService';

const customId = 'selectNation';

const selectNation: MessageComponentHandler = {
    customId,
    execute: async (interaction: MessageComponentInteraction, service: PretenderService) => {
        if (!interaction.isSelectMenu()) return;
        if (interaction.values.length !== 1) return;
        const value = interaction.values[0]

        if (await service.claim(value, interaction.user.username)) {
            const nation = (await service.status()).nations.find(n => n.id === value)
            await interaction.update({ content: `Du spelar som ${nation?.name}, ${nation?.tagline}.`, components: [] });
        }
        else {
            await interaction.update({ content: `Någonting gick fel.`, components: [] });
        }
    },
    component: async (service: PretenderService) => {
        const nations = (await service.status()).pending().map(nation => ({ label: `${nation.name}, ${nation.tagline}`, value: nation.id }))
        return new MessageSelectMenu()
            .setCustomId(customId)
            .setPlaceholder('Välj nation')
            .addOptions(nations)
    }
};

export default selectNation