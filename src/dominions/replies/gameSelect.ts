import { codeBlock } from "@discordjs/builders";
import { InteractionReplyOptions, MessageActionRow } from "discord.js";
import { PretenderService } from "../../types/pretenderService";
import selectGame from "../components/selectGame";

const gameSelect: (service: PretenderService) => Promise<InteractionReplyOptions> = async (service) => {
    let content = []
    let currentGames = service.gameNames() ?? []
    if (!currentGames.length) {
        return {
            content: 'Inga spel är startade, försök igen senare!',
            components: [],
            ephemeral: true
        };
    }

    content.push('Välj spel')
    currentGames.length && content.push(codeBlock(currentGames.join('\n')))

    const gameRow = new MessageActionRow().addComponents(await selectGame.component(service));
    return {
        content: content.join('\n'),
        components: [gameRow],
        ephemeral: true
    };
}

export default gameSelect