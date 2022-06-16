import { MessageComponentInteraction, MessageSelectMenu } from 'discord.js';
import { MessageComponentHandler } from '../../types/messageComponentHandler';
import { PretenderService } from '../../types/pretenderService';
import awaitingStart from '../replies/awaitingStart';
import gameStatus from '../replies/gameStatus';
import playerNation from '../replies/playerNation';

const customId = 'selectNation';

const selectNation: MessageComponentHandler = {
    customId,
    execute: async (interaction: MessageComponentInteraction, service: PretenderService) => {
        if (!interaction.isSelectMenu()) return;
        if (interaction.values.length !== 1) return;
        const value = interaction.values[0]

        const status = service.status();

        if (await service.claim(value, interaction.user)) {
            await interaction.update(await playerNation(interaction, service));
            await interaction.followUp(status?.gameStarted()
                ? await gameStatus(interaction, service)
                : await awaitingStart(interaction, service));

            return;
        }

        await interaction.update({ content: `Någonting gick fel.`, components: [] });
    },
    component: async (service: PretenderService) => {
        const nations = service.status()?.pending().map(nation => ({ label: `${nation.name}, ${nation.tagline}`, value: nation.id })) ?? []
        return new MessageSelectMenu()
            .setCustomId(customId)
            .setPlaceholder('Välj nation')
            .addOptions(nations)
    }
};

export default selectNation