// Require the necessary discord.js classes
import { token } from '../config.json';
import { Client, Intents } from 'discord.js';
import { register } from './register';
import commands from './commands';

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', async () => {
    console.log('Registering commands');
    await register();
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = commands.get(interaction.commandName);
    console.debug(new Date(), ' - ', interaction.user.username, ' - ', interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Login to Discord with your client's token
client.login(token);

process.on('SIGINT', () => {
    console.log('Process terminating, signing out...')
    client.destroy();
    console.log('Signed out!')
    process.exit(0)
})