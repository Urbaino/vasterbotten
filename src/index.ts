// Require the necessary discord.js classes
import { token, saveGameDir } from './config.json';
import { Client, Intents } from 'discord.js';
import { register } from './register';
import handlers from './handlers';
import InMemoryPretenderService from './services/inMemoryPretenderService';
import StatusDumpService from './services/statusDumpService';
import DmService from './services/dmService';
import NewTurnService from './services/newTurnService';

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Helper services
const dmService = new DmService(client);

// Dominions Service
const statusService = new StatusDumpService(saveGameDir);
const pretenderService = new InMemoryPretenderService(statusService);
const newTurnService = new NewTurnService(statusService, pretenderService, dmService);

// When the client is ready, run this code (only once)
client.once('ready', async () => {
    // console.log('Registering commands');
    // await register();

    statusService.BeginMonitor();

    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
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

client.on('interactionCreate', async interaction => {
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
client.login(token);

// Shut down gracefully
const dispose = () => {
    client.destroy();
    console.log('Signed out!')
    statusService.EndMonitor();
}

process.on('SIGINT', () => {
    console.log('Process interrupted, signing out...')
    dispose();
    process.exit(0)
})

process.on('SIGTERM', () => {
    console.log('Process terminated, signing out...')
    dispose();
    process.exit(0)
})
