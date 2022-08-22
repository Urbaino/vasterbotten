import { codeBlock } from "@discordjs/builders";
import { InteractionReplyOptions, MessageActionRow } from "discord.js";
import { PretenderService } from '../../types/pretenderService.js';
import selectNation from '../components/selectNation.js'

const nationSelect: (gameName: string, service: PretenderService) => Promise<InteractionReplyOptions> = async (gameName, service) => {
    let content = []
    let currentPlayers = service.status(gameName)?.currentPlayers() ?? []
    content.push('Välj din nation')
    currentPlayers.length && content.push(codeBlock(currentPlayers.join('\n')))

    const nationRow = new MessageActionRow().addComponents(await selectNation.component(gameName, service));
    return {
        content: content.join('\n'),
        components: [nationRow],
        ephemeral: true
    };
}

export default nationSelect