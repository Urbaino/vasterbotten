import { MessageActionRowComponent, MessageComponentInteraction, MessageSelectMenu } from 'discord.js';
import { Controller } from '../../types/controller';
import { MessageComponentHandler } from '../../types/messageComponentHandler';
import { PretenderService } from '../../types/pretenderService';
import noGameLoaded from '../replies/noGameLoaded';

const customId = 'leaveGame';

const leaveGame: MessageComponentHandler & { component: (gameNames: string[]) => Promise<MessageActionRowComponent> } = {
    customId,
    execute: async (interaction: MessageComponentInteraction, service: PretenderService) => {
        if (!interaction.isSelectMenu()) return;
        if (interaction.values.length !== 1) return;
        const gameName = interaction.values[0]

        const status = service.status(gameName);
        if (!status) {
            await interaction.update(await noGameLoaded());
            return;
        }
        const playerNation = status.playerNation(interaction.user.username);
        if (!playerNation) {
            await interaction.update({ content: `Du är inte med i detta spel.`, components: [] });
            return
        }
        if (status.gameStarted() && playerNation.controller === Controller.human) {
            await interaction.update({ content: `Du kan inte lämna spelet innan du är besegrad eller har lämnat över till AI.`, components: [] });
            return
        }

        service.unclaim(gameName, interaction.user);
        await interaction.update({ content: `Du har lämnat ${gameName}.`, components: [] });
        await interaction.followUp({ content: `${interaction.user.username} (${playerNation.name}) har lämnat ${gameName}.`, ephemeral: false });
    },
    component: async (gameNames: string[]) => {
        const games = gameNames.map(game => ({ label: game, value: game }))
        return new MessageSelectMenu()
            .setCustomId(customId)
            .setPlaceholder('Välj spel att lämna')
            .addOptions(games)
    }
};

export default leaveGame