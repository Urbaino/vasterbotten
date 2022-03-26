import { codeBlock } from "@discordjs/builders";
import { InteractionReplyOptions, MessageActionRow } from "discord.js";
import { PretenderService } from '../../types/pretenderService';
import selectNation from '../components/selectNation'

const nationSelect: (service: PretenderService) => Promise<InteractionReplyOptions> = async (service) => {
    let content = []
    let currentPlayers = service.status()?.currentPlayers() ?? []
    content.push('Välj din nation')
    currentPlayers.length && content.push(codeBlock(currentPlayers.join('\n')))

    const nationRow = new MessageActionRow().addComponents(await selectNation.component(service));
    return {
        content: content.join('\n'),
        components: [nationRow],
        ephemeral: true
    };
}

export default nationSelect