import { Collection } from "discord.js";
import { CommandHandler } from "./types/commandHandler";
import { MessageComponentHandler } from "./types/messageComponentHandler";
import dominions from "./dominions/dominions";
import selectNation from "./dominions/components/selectNation";
import selectGame from "./dominions/components/selectGame";
import leaveGame from "./dominions/components/leaveGame";

const commands = new Collection<string, CommandHandler>();
const messageComponents = new Collection<string, MessageComponentHandler>();

// List all available commands here!
commands.set(dominions.data.name, dominions);
// TODO: Leave

// List all available message components here!
messageComponents.set(selectNation.customId, selectNation);
messageComponents.set(selectGame.customId, selectGame);
messageComponents.set(leaveGame.customId, leaveGame);

export default { commands, messageComponents } 