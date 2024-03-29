import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import config from '../config.json' assert {type: "json"};
import handlers from '../handlers.js';
import { FileService } from './fileService.js';

const rest = new REST({ version: '9' }).setToken(config.token);

export class CommandsService {

    private readonly handlersJSON = handlers.commands.map(c => c.data.toJSON());
    private readonly filename = 'commands.json';

    private dir: string

    constructor(dir: string) {
        this.dir = dir;
    }

    public async ensureSubmitted() {
        try {
            var saved = await FileService.readFromFile(this.dir, this.filename);
            if (saved === JSON.stringify(this.handlersJSON)) {
                console.log("All commands already registered")
                return;
            }
        }
        catch { }
        this.registerCommands();
        await FileService.saveToFile(this.dir, this.filename, this.handlersJSON);
    }

    private registerCommands = async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: this.handlersJSON },
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    };

}