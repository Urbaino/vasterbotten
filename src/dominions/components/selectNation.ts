import { MessageActionRowComponent, MessageComponentInteraction, MessageSelectMenu } from 'discord.js';
import { MessageComponentHandler } from '../../types/messageComponentHandler.js';
import { PretenderService } from '../../types/pretenderService.js';
import awaitingStart from '../replies/awaitingStart.js';
import gameStatus from '../replies/gameStatus.js';

const customId = 'selectNation';

const selectNation: MessageComponentHandler & { component: (gameName: string, service: PretenderService) => Promise<MessageActionRowComponent> } = {
    customId,
    execute: async (interaction: MessageComponentInteraction, service: PretenderService) => {
        if (!interaction.isSelectMenu()) return;
        if (interaction.values.length !== 1) return;
        const [gameName, nationId] = interaction.values[0].split('__')

        const status = service.status(gameName);

        if (await service.claim(gameName, nationId, interaction.user)) {
            await interaction.update(status?.gameStarted()
                ? await gameStatus(gameName, interaction.user, service)
                : await awaitingStart(gameName, service));

            return;
        }

        await interaction.update({ content: `Någonting gick fel.`, components: [] });
    },
    component: async (gameName: string, service: PretenderService) => {
        const nations = service.status(gameName)?.pending().map(nation => ({ label: `${nation.name}, ${nation.tagline}`, value: `${gameName}__${nation.id}` })) ?? []
        return new MessageSelectMenu()
            .setCustomId(customId)
            .setPlaceholder('Välj nation att spela')
            .addOptions(nations)
    }
};

export default selectNation