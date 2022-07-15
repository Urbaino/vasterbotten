import { MessageActionRowComponent, MessageComponentInteraction, MessageSelectMenu } from 'discord.js';
import { MessageComponentHandler } from '../../types/messageComponentHandler';
import { PretenderService } from '../../types/pretenderService';
import awaitingStart from '../replies/awaitingStart';
import gameStatus from '../replies/gameStatus';
import nationSelect from '../replies/nationSelect';
import noAvailablePretenders from '../replies/noAvailablePretenders';
import noGameLoaded from '../replies/noGameLoaded';
import playerNation from '../replies/playerNation';

const customId = 'selectGame';

const selectGame: MessageComponentHandler & { component: (service: PretenderService) => Promise<MessageActionRowComponent> } = {
    customId,
    execute: async (interaction: MessageComponentInteraction, service: PretenderService) => {
        if (!interaction.isSelectMenu()) return;
        if (interaction.values.length !== 1) return;
        const gameName = interaction.values[0]

        const status = service.status(gameName)

        if (!status) {
            await interaction.reply(await noGameLoaded());
            return;
        }

        if (status.playerNation(interaction.user.username)) {
            await interaction.update(await playerNation(gameName, interaction, service));
            if (status.gameStarted()) {
                await interaction.followUp(await gameStatus(gameName, service));
            }
            else {
                await interaction.followUp(await awaitingStart(gameName, service));
            }
        }
        else {
            if (status.pending().length) {
                await interaction.update(await nationSelect(gameName, service));
            }
            else {
                if (status.gameStarted()) {
                    await interaction.update(await gameStatus(gameName, service));
                }
                else {
                    await interaction.update(await noAvailablePretenders());
                }
            }

        }
    },
    component: async (service: PretenderService) => {
        const games = service.gameNames().map(game => ({ label: game, value: game }))
        return new MessageSelectMenu()
            .setCustomId(customId)
            .setPlaceholder('Välj spel')
            .addOptions(games)
    }
};

export default selectGame