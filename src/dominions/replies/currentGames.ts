import { codeBlock } from "@discordjs/builders";
import { InteractionReplyOptions, MessageActionRow } from "discord.js";
import { PretenderService } from "../../types/pretenderService";
import Status from "../../types/status";
import leaveGame from "../components/leaveGame";

const gameStatusString = (game: Status) => game.gameName + (game.gameStarted() ? '' : ' (Ej startat)')

const currentGames: (player: string, service: PretenderService) => Promise<InteractionReplyOptions> = async (player, service) => {
    let content = []
    const currentGames = service.gameNames().map(name => service.status(name)).filter(g => g !== null) as Status[]
    if (!currentGames.length) {
        return {
            content: 'Inga spel är startade, försök igen senare!',
            components: [],
            ephemeral: true
        };
    }
    let components: MessageActionRow[] = []

    const playerGames = currentGames.filter(g => g.playerNation(player))
    if (playerGames.length) {
        content.push('Du spelar i följande spel:')
        content.push(codeBlock(playerGames.map(gameStatusString).join('\n')))
        components = [new MessageActionRow().addComponents(await leaveGame.component(playerGames.map(g => g.gameName)))];
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
        components,
        ephemeral: true
    };
}

export default currentGames