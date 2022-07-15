import { InteractionReplyOptions } from "discord.js";

const noGameLoaded: () => Promise<InteractionReplyOptions> = async () => {
    return {
        content: `Inget spel med det namnet är laddat, tyvärr.`,
        components: [],
        ephemeral: true
    };
}

export default noGameLoaded