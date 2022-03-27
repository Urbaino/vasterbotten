// Require the necessary discord.js classes
import { token, saveGameDir } from './config.json';
import { Client, Intents } from 'discord.js';
import { register } from './register';
import handlers from './handlers';
import StatusDumpService from './services/statusDumpService';
import DmService from './services/dmService';
import NewTurnService from './services/newTurnService';
import FilePretenderServiceBuilder from './services/filePretenderService';

class Vasterbotten {
    // Create a new client instance
    private client = new Client({ intents: [Intents.FLAGS.GUILDS] });

    // Dominions Services
    private statusService = new StatusDumpService(saveGameDir);

    public async Start() {
        // Load and monitor the game
        await this.statusService.BeginMonitor();

        // Helper services
        const dmService = new DmService(this.client);
        const pretenderService = await FilePretenderServiceBuilder.build(this.statusService);
        const newTurnService = new NewTurnService(this.statusService, pretenderService, dmService);

        // When the client is ready, run this code (only once)
        this.client.once('ready', async () => {
            // console.log('Registering commands');
            // await register();

            console.log('Ready!');
        });

        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;

            const command = handlers.commands.get(interaction.commandName);
            console.debug(new Date(), ':', interaction.user.username, ':', interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction, pretenderService);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        });

        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isMessageComponent()) return;

            const command = handlers.messageComponents.get(interaction.customId);
            console.debug(new Date(), ':', interaction.user.username, ':', interaction.customId);

            if (!command) return;

            try {
                await command.execute(interaction, pretenderService);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this message component!', ephemeral: true });
            }
        });

        // Login to Discord with your client's token
        this.client.login(token);
    }

    public async Stop() {
        this.client.destroy();
        console.log('Signed out!')
        this.statusService.EndMonitor();
    }
}

export default Vasterbotten