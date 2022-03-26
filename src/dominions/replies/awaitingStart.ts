import { codeBlock } from "@discordjs/builders";
import { Interaction, InteractionReplyOptions, MessageActionRow } from "discord.js";
import { PretenderService } from '../../types/pretenderService';
import notPlaying from '../components/notPlaying'

const awaitingStart: (interaction: Interaction, service: PretenderService) => Promise<InteractionReplyOptions> = async (interaction, service) => {
    let content = []
    content.push(`Du spelar som ${service.status()?.playerNation(interaction.user.username)?.name}.`)
    content.push(``)

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

    const buttonRow = new MessageActionRow().addComponents(await notPlaying.component(service))
    return {
        content: content.join('\n'),
        components: [buttonRow],
        ephemeral: true
    };
}

export default awaitingStart