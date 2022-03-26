import { InteractionReplyOptions } from "discord.js";

const noGameLoaded: () => Promise<InteractionReplyOptions> = async () => {
    return {
        content: `Inget spel är laddat, tyvärr.`,
        components: [],
        ephemeral: true
    };
}

export default noGameLoaded