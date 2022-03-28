import { bold, codeBlock } from "@discordjs/builders";
import { Interaction, InteractionReplyOptions } from "discord.js";
import { PretenderService } from '../../types/pretenderService';

const gameStatus: (interaction: Interaction, service: PretenderService) => Promise<InteractionReplyOptions> = async (interaction, service) => {
    let content = []
    content.push(bold(`${service.status()?.gameName} runda ${service.status()?.turn}.`));

    content.push('Vi väntar på:')
    content.push(codeBlock(service.status()?.unfinishedPlayers().join('\n') ?? ''))

    return {
        content: content.join('\n'),
        components: [],
        ephemeral: true
    };
}

export default gameStatus