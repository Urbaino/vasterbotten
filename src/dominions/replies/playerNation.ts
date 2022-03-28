import { Interaction, InteractionReplyOptions, MessageActionRow } from "discord.js";
import { PretenderService } from '../../types/pretenderService';
import notPlaying from '../components/notPlaying'

const playerNation: (interaction: Interaction, service: PretenderService) => Promise<InteractionReplyOptions> = async (interaction, service) => {
    let content = [];
    content.push(`Du spelar som ${service.status()?.playerNation(interaction.user.username)?.name}.`)

    const buttonRow = new MessageActionRow().addComponents(await notPlaying.component(service))
    return {
        content: content.join('\n'),
        components: [buttonRow],
        ephemeral: true
    };
}

export default playerNation