import { bold, codeBlock } from "@discordjs/builders";
import { InteractionReplyOptions } from "discord.js";
import { PretenderService } from '../../types/pretenderService.js';

const awaitingStart: (gameName: string, service: PretenderService) => Promise<InteractionReplyOptions> = async (gameName, service) => {
    const status = service.status(gameName);
    if (!status) return { content: 'Kunde inte läsa status på spelet.', ephemeral: true };

    let content = [];
    content.push(bold(`${status.gameName}`));

    let currentPlayers = status.currentPlayers() ?? []
    if (currentPlayers.length) {
        content.push(`Valda pretenders:`)
        content.push(codeBlock(currentPlayers.join('\n')))
    }
    else {
        content.push('Inga pretenders valda.')
    }

    let pendingNations = status.pendingNations() ?? [];
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