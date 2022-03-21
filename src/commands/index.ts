import { Collection } from "discord.js";
import { Command } from "../types/command";
import dominions from "./dominions";

const commands = new Collection<string, Command>();

// List all available commands here!
commands.set(dominions.data.name, dominions);

export default commands 