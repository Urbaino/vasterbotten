import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageActionRow } from 'discord.js';
import { CommandHandler } from '../types/commandHandler';
import { PretenderService } from '../types/pretenderService';
import { TurnStatus } from '../types/turnStatus';
import notPlaying from './notPlaying';
import selectNation from './selectNation';

const dominions: CommandHandler = {
    data: new SlashCommandBuilder()
        .setName('dominions')
        .setDescription('Här hanterar du ditt deltagande i vår egna Dominions-server.'),
    execute: async (interaction: CommandInteraction, service: PretenderService) => {

        var status = await service.status();
        const pretenders = await service.claimed()

        if (status.turn < 0) {
            let nation = await service.userHasClaimed()
            const currentPlayers = []
            if (pretenders.hasAny()) {
                currentPlayers.push('');
                for (let pretender of pretenders) {
                    currentPlayers.push(`${pretender[1]}: ${status.nations.find(n => n.id === pretender[0])?.name}`)
                }
            }
            if (nation) {
                const buttonRow = new MessageActionRow().addComponents(await notPlaying.component(service))
                await interaction.reply({ content: `Du spelar som ${nation}.${currentPlayers.join('\n')}`, components: [buttonRow], ephemeral: true });
            } else {

                const nationRow = new MessageActionRow().addComponents(await selectNation.component(service));
                await interaction.reply({ content: `Välj din nation!${currentPlayers.join('\n')}`, components: [nationRow], ephemeral: true });
            }
        }
        else {
            const unfinishedIds = status.nations.filter(n => n.turnStatus !== TurnStatus.Finished).map(n => n.id);
            let unfinishedPlayers: string[] = []
            for (let id of unfinishedIds) {
                unfinishedPlayers.push(pretenders.get(id) ?? id)
            }
            await interaction.reply({ content: `Runda ${status.turn}, vi väntar på: \n${unfinishedPlayers} `, components: [], ephemeral: true });
        }
    }
};

export default dominions