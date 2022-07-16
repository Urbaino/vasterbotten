import { codeBlock } from "@discordjs/builders";
import { InteractionReplyOptions } from "discord.js";
import { Player, PretenderService } from "../../types/pretenderService";
import Status from "../../types/status";

const gameStatusString = (game: Status) => game.gameName + (game.gameStarted() ? '' : ' (Ej startat)')

const currentGames: (player: Player, service: PretenderService) => Promise<InteractionReplyOptions> = async (player, service) => {
    let content = []
    const currentGames = service.gameNames().map(name => service.status(name)).filter(g => g !== null) as Status[]
    if (!currentGames.length) {
        return {
            content: 'Inga spel är startade, försök igen senare!',
            components: [],
            ephemeral: true
        };
    }

    const playerGames = currentGames.filter(g => g.playerNation(player))
    if (playerGames.length) {
        content.push('Du spelar i följande spel:')
        content.push(codeBlock(playerGames.map(gameStatusString).join('\n')))
    }
    else {
        content.push('Du är inte med i något spel.')
    }
    if (currentGames.length > playerGames.length) {
        content.push('Följande övriga spel finns:')
        content.push(codeBlock(currentGames.filter(g => !g.playerNation(player)).map(gameStatusString).join('\n')))
    }

    return {
        content: content.join('\n'),
        components: [],
        ephemeral: true
    };
}

export default currentGames