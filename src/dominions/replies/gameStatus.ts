import { bold, codeBlock } from "@discordjs/builders";
import { InteractionReplyOptions } from "discord.js";
import { Player, PretenderService } from '../../types/pretenderService.js';

const gameStatus: (gameName: string, player: Player, service: PretenderService) => Promise<InteractionReplyOptions> = async (gameName, player, service) => {
    const status = service.status(gameName);
    if (!status) return { content: 'Kunde inte läsa status på spelet.', ephemeral: true };

    let content = []
    content.push(bold(`${status.gameName}`) + ` runda ${status.turn}.`);

    const playerNation = status.playerNation(player);
    playerNation && content.push(`Du spelar som ${playerNation.name}.`)

    if (status.finishedPlayers().length) {
        content.push('Följande spelare har genomfört sin tur:')
        content.push(codeBlock(status.finishedPlayers().join('\n') ?? ''))
    }

    content.push('Vi väntar på:')
    content.push(codeBlock(status.unfinishedPlayers().join('\n') ?? ''))

    return {
        content: content.join('\n'),
        components: [],
        ephemeral: true
    };
}

export default gameStatus