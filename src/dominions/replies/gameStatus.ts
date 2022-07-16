import { bold, codeBlock } from "@discordjs/builders";
import { InteractionReplyOptions } from "discord.js";
import { Player, PretenderService } from '../../types/pretenderService';

const gameStatus: (gameName: string, player: Player, service: PretenderService) => Promise<InteractionReplyOptions> = async (gameName, player, service) => {
    const status = service.status(gameName);

    let content = []
    content.push(bold(`${status?.gameName} runda ${status?.turn}.`));

    const playerNation = status?.playerNation(player);
    playerNation && content.push(`Du spelar som ${playerNation.name}.`)

    content.push('Vi väntar på:')
    content.push(codeBlock(status?.unfinishedPlayers().join('\n') ?? ''))

    return {
        content: content.join('\n'),
        components: [],
        ephemeral: true
    };
}

export default gameStatus