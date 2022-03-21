import { Collection } from "discord.js";
import { Command } from "../types/command";
import dominions from "./dominions";

const commands = new Collection<string, Command>();
commands.set(dominions.data.name, dominions);

export default commands 