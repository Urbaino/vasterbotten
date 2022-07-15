import { Interaction, InteractionReplyOptions, MessageActionRow } from "discord.js";
import { PretenderService } from '../../types/pretenderService';

const playerNation: (gameName: string, interaction: Interaction, service: PretenderService) => Promise<InteractionReplyOptions> = async (gameName, interaction, service) => {
    let content = [];
    content.push(`Du spelar som ${service.status(gameName)?.playerNation(interaction.user.username)?.name}.`)

    return {
        content: content.join('\n'),
        components: [],
        ephemeral: true
    };
}

export default playerNation