import { InteractionReplyOptions, MessageActionRow } from "discord.js";
import { PretenderService } from "../../types/pretenderService";
import leaveGame from "../components/leaveGame";

const gameLeave: (player: string, service: PretenderService) => Promise<InteractionReplyOptions> = async (player, service) => {
    let content = []
    let currentGames = service.gameNames() ?? []
    if (!currentGames.length) {
        return {
            content: 'Inga spel är startade, försök igen senare!',
            components: [],
            ephemeral: true
        };
    }
    let currentPlayingGames = service.gameNames().filter(gameName => service.status(gameName)?.currentPlayers().find(p => p === player))
    if (!currentPlayingGames.length) {
        return {
            content: 'Du är inte med i något spel!',
            components: [],
            ephemeral: true
        };
    }

    content.push('Välj vilket spel du vill lämna:')

    const gameRow = new MessageActionRow().addComponents(await leaveGame.component(currentPlayingGames))
    return {
        content: content.join('\n'),
        components: [gameRow],
        ephemeral: true
    };
}

export default gameLeave