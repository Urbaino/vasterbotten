import { Collection } from "discord.js";
import { CommandHandler } from "./types/commandHandler";
import { MessageComponentHandler } from "./types/messageComponentHandler";
import dominions from "./dominions/dominions";
import selectNation from "./dominions/components/selectNation";

const commands = new Collection<string, CommandHandler>();
const messageComponents = new Collection<string, MessageComponentHandler>();

// List all available commands here!
commands.set(dominions.data.name, dominions);

// List all available message components here!
messageComponents.set(selectNation.customId, selectNation);

export default { commands, messageComponents } 