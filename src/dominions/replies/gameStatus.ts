import { bold, codeBlock } from "@discordjs/builders";
import { InteractionReplyOptions, MessageActionRow } from "discord.js";
import { PretenderService } from '../../types/pretenderService';

const gameStatus: (service: PretenderService) => Promise<InteractionReplyOptions> = async (service) => {
    let content = []
    content.push(bold(`Runda ${service.status()?.turn}.`))
    content.push('Vi väntar på:')
    content.push(codeBlock(service.status()?.unfinishedPlayers().join('\n') ?? ''))
    return {
        content: content.join('\n'),
        components: [],
        ephemeral: true
    };
}

export default gameStatus