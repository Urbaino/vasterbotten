import { codeBlock } from "@discordjs/builders";
import { Interaction, InteractionReplyOptions } from "discord.js";
import { PretenderService } from '../../types/pretenderService';

const awaitingStart: (interaction: Interaction, service: PretenderService) => Promise<InteractionReplyOptions> = async (interaction, service) => {
    let content = [];

    let currentPlayers = service.status()?.currentPlayers() ?? []
    if (currentPlayers.length) {
        content.push(`Valda pretenders:`)
        content.push(codeBlock(currentPlayers.join('\n')))
    }
    else {
        content.push('Inga pretenders valda.')
    }

    let pendingNations = service.status()?.pendingNations() ?? [];
    if (pendingNations.length) {
        content.push(`Kvar att välja:`)
        content.push(codeBlock(pendingNations.join('\n')))
    }
    else {
        content.push('Alla pretenders valda!')
    }

    return {
        content: content.join('\n'),
        components: [],
        ephemeral: true
    };
}

export default awaitingStart