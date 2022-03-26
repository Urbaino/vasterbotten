import { InteractionReplyOptions } from "discord.js";
import { PretenderService } from '../../types/pretenderService';

const noAvailablePretenders: (service: PretenderService) => Promise<InteractionReplyOptions> = async () => {
    return {
        content: `Det finns inga lediga pretenders. Ladda upp en ny för att välja nation.`,
        components: [],
        ephemeral: true
    }
}

export default noAvailablePretenders