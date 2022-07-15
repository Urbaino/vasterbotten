import { bold, codeBlock } from "@discordjs/builders";
import { InteractionReplyOptions } from "discord.js";
import { PretenderService } from '../../types/pretenderService';

const gameStatus: (gameName: string, service: PretenderService) => Promise<InteractionReplyOptions> = async (gameName, service) => {
    const status = service.status(gameName);

    let content = []
    content.push(bold(`${status?.gameName} runda ${status?.turn}.`));

    content.push('Vi väntar på:')
    content.push(codeBlock(status?.unfinishedPlayers().join('\n') ?? ''))

    return {
        content: content.join('\n'),
        components: [],
        ephemeral: true
    };
}

export default gameStatus