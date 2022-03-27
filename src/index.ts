// Require the necessary discord.js classes
import Vasterbotten from './bot'

// Start the bot
let bot = new Vasterbotten()
bot.Start();

// Shut down gracefully
process.on('SIGINT', () => {
    console.log('Process interrupted, signing out...')
    bot.Stop();
    process.exit(0)
})

process.on('SIGTERM', () => {
    console.log('Process terminated, signing out...')
    bot.Stop();
    process.exit(0)
})
