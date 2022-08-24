// Require the necessary discord.js classes
import config from './config.json' assert {type: "json"};
import { Client, Intents } from 'discord.js';
import handlers from './handlers.js';
import StatusDumpService from './services/statusDumpService.js';
import DmService from './services/dmService.js';
import NewTurnService from './services/newTurnService.js';
import FilePretenderServiceBuilder from './services/filePretenderService.js';
import { CommandsService } from './services/commandsService.js';
import ChannelService from './services/channelService.js';
import RoleService from './services/roleService.js';
import EventService from './services/eventService.js';

class Vasterbotten {

    public static readonly dataDir = "/data";
    public static readonly saveGameDir = "/saves";

    // Create a new client instance
    private client = new Client({ intents: [Intents.FLAGS.GUILDS] });

    // Dominions Services
    private eventService = new EventService();
    private statusService = new StatusDumpService(Vasterbotten.saveGameDir, this.eventService);

    public async Start() {
        // Load and monitor the game
        await this.statusService.BeginMonitor();

        // Helper services
        const dmService = new DmService(this.client);
        const roleService = new RoleService(this.client);
        const pretenderService = await FilePretenderServiceBuilder.build(Vasterbotten.dataDir, this.statusService, roleService, this.eventService);
        const channelService = new ChannelService(this.client, this.statusService, pretenderService, roleService, this.eventService);
        const newTurnService = new NewTurnService(pretenderService, dmService, this.eventService);

        // When the client is ready, run this code (only once)
        this.client.once('ready', async () => {
            console.log('Ensuring all commands are registered');
            await new CommandsService(Vasterbotten.dataDir).ensureSubmitted()
            await channelService.SetupChannels()
            await roleService.SetupRoles(pretenderService)
            console.log('Ready!');
        });

        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;

            const command = handlers.commands.get(interaction.commandName);
            console.debug(new Date(), ':', interaction.user.username, ':', interaction.commandName, interaction.options.getSubcommand());

            if (!command) {
                console.warn('Command does not exist: ', interaction.commandName, interaction.options.getSubcommand())
                return;
            }

            try {
                await command.execute(interaction, pretenderService);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        });

        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isAutocomplete()) return;

            const command = handlers.commands.get(interaction.commandName);
            console.debug(new Date(), ':', interaction.user.username, ':', 'Autocomplete', ':', interaction.commandName, interaction.options.getSubcommand());

            if (!command) {
                console.warn('Autocomplete command does not exist: ', interaction.commandName, interaction.options.getSubcommand())
                return;
            }
            const choices = command.options(interaction, pretenderService);
            if (!choices) {
                console.warn('Command does not use options: ', interaction.commandName, interaction.options.getSubcommand())
                return;
            }

            try {
                const focusedValue = interaction.options.getFocused().toString();
                const filtered = choices.filter(choice => choice.startsWith(focusedValue));
                await interaction.respond(
                    filtered.map(choice => ({ name: choice, value: choice })),
                );
            } catch (error) {
                console.error(error);
            }
        });

        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isMessageComponent()) return;

            const component = handlers.messageComponents.get(interaction.customId);
            console.debug(new Date(), ':', interaction.user.username, ':', interaction.customId);

            if (!component) {
                console.warn('Component does not exist: ', interaction.customId)
                return;
            }

            try {
                await component.execute(interaction, pretenderService);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this message component!', ephemeral: true });
            }
        });

        // Login to Discord with your client's token
        this.client.login(config.token);
    }

    public async Stop() {
        this.client.destroy();
        console.log('Signed out!')
        this.statusService.EndMonitor();
    }
}

export default Vasterbotten