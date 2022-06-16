import { MessageButton, MessageComponentInteraction } from 'discord.js';
import { MessageButtonStyles } from 'discord.js/typings/enums';
import { Controller } from '../../types/controller';
import { MessageComponentHandler } from '../../types/messageComponentHandler';
import { PretenderService } from '../../types/pretenderService';
import noGameLoaded from '../replies/noGameLoaded';

const customId = 'notPlaying';

const notPlaying: MessageComponentHandler = {
    customId,
    execute: async (interaction: MessageComponentInteraction, service: PretenderService) => {
        if (!interaction.isButton()) return;
        const status = service.status();
        if (!status) {
            await interaction.update(await noGameLoaded());
            return;
        }
        const playerNation = status.playerNation(interaction.user.username);
        if (playerNation) {

            if (playerNation.controller === Controller.human) {
                await interaction.followUp({ content: `Du kan inte lämna spelet innan du är besegrad eller har lämnat över till AI.`, components: [], ephemeral: true });
                return
            }

            service.unclaim(interaction.user);
            await interaction.followUp({ content: `${interaction.user.username} (${playerNation.name}) har lämnat spelet.`, ephemeral: false });
        }
        await interaction.update({ content: `Du har lämnat spelet.`, components: [] });
    },
    component: async () => new MessageButton()
        .setCustomId(customId)
        .setLabel('Lämna spelet')
        .setStyle(MessageButtonStyles.SECONDARY)
};

export default notPlaying