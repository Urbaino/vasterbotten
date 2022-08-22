import { codeBlock } from "@discordjs/builders";
import { InteractionReplyOptions } from "discord.js";
import { Player, PretenderService } from "../../types/pretenderService.js";
import Status from "../../types/status.js";
import { TurnStatus } from "../../types/turnStatus.js";


const currentGames: (player: Player, service: PretenderService) => Promise<InteractionReplyOptions> = async (player, service) => {
    const content = []
    const currentGames = service.gameNames().map(name => service.status(name)).filter(g => g !== null) as Status[]
    if (!currentGames.length) {
        return {
            content: 'Inga spel är startade, försök igen senare!',
            components: [],
            ephemeral: true
        };
    }

    const started: Status[] = []
    const notStarted: Status[] = []
    const notPlaying: Status[] = []

    currentGames.forEach(game => {
        if (!game.playerNation(player)) notPlaying.push(game)
        else if (!game.gameStarted()) notStarted.push(game)
        else started.push(game)
    })

    if (started.length) {
        content.push('Du spelar i följande spel: (* indikerar din tur)')
        content.push(codeBlock(started.map(g => (g.playerNation(player)?.turnStatus === TurnStatus.Finished ? '' : '*') + g.gameName).join('\n')))
    }
    if (notStarted.length) {
        content.push('Dina ej startade spel:')
        content.push(codeBlock(notStarted.map(g => g.gameName).join('\n')))
    }
    if (notPlaying.length === currentGames.length) {
        content.push('Du är inte med i något spel.')
    }
    if (notPlaying.length) {
        content.push('Följande övriga spel finns:')
        content.push(codeBlock(notPlaying.map(g => g.gameName).join('\n')))
    }

    return {
        content: content.join('\n'),
        components: [],
        ephemeral: true
    };
}

export default currentGames