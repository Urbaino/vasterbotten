import { InteractionReplyOptions } from "discord.js";

const noAvailablePretenders: () => Promise<InteractionReplyOptions> = async () => {
    return {
        content: `Det finns inga lediga pretenders. Ladda upp en ny för att välja nation.`,
        components: [],
        ephemeral: true
    }
}

export default noAvailablePretenders