import { Controller } from "../types/controller.js";
import { PretenderService } from "../types/pretenderService.js";
import { StatusDump } from "../types/statusDump.js";
import Status from "../types/status.js";
import EventService from "./eventService.js";
import ChannelService from "./channelService.js";
import { codeBlock } from "@discordjs/builders";

export default class NewTurnService {
    private pretenderService: PretenderService
    private channelService: ChannelService
    private eventService: EventService

    constructor(pretenderService: PretenderService, eventService: EventService, channelService: ChannelService) {
        this.pretenderService = pretenderService;
        this.eventService = eventService;
        this.channelService = channelService;
        this.eventService.SubscribeToGameEvent('newTurn', this.NotifyNewTurn.bind(this))
    }

    private readonly encouragements = [
        'må era trupper förflytta sig snabbt!',
        'må era befälhavare fatta kloka beslut!',
        'må era magiker trolla väl!',
        'må ert folk frodas!',
        'må era präster sprida ert evangelium långt!',
        'må era besvärjelser ha kraftfull verkan!',
        'må era kassor vara breddfyllda!',
        'må de otrogna falla för era krigare!'
    ]

    private GetEncouragement() {
        return this.encouragements[Math.floor(Math.random() * this.encouragements.length)];
    }

    private GameOver(status: Status) {
        const teamsAlive = new Set<number>(status.allNations().filter(n => n.controller === Controller.human || n.controller === Controller.ai).map(n => n.pretenderNumber))
        return teamsAlive.size === 1;
    }

    private NotifyNewTurn(statusDump: StatusDump) {
        const status = this.pretenderService.statusFromDump(statusDump)
        if (!status) return

        const message = []
        if (this.GameOver(status)) {
            message.push(`Kampen i <@&${status.gameName}> är över!`);
            const humanWinners = status.claimed().filter(n => n.controller === Controller.human).map(n => n.player.username);
            if (humanWinners.length) {
                message.push('Segrare är:')
                message.push(codeBlock(humanWinners.join(', ')))
            }
            else message.push('Ni fick alla stryk av AI. Så kan det gå.');
        }
        else if (status.turn === 1) message.push(`Kampen startar i <@&${status.gameName}>! Första rundan har börjat, ${this.GetEncouragement()}`);
        else {
            message.push(`Ny runda i <@&${status.gameName}>! Runda ${status.turn} har börjat, ${this.GetEncouragement()}`);

            const defeated = status.claimed().filter(n => n.controller === Controller.defeated).map(n => n.player.username);
            if (defeated.length) {
                message.push('Dessa spelare blev besegrade:')
                message.push(codeBlock(defeated.join(', ')))
            }
        }

        this.channelService.SendToChannel(status.gameName, message.join('\n'));
    }

}
