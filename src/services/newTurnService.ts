import { Controller } from "../types/controller.js";
import { PretenderService } from "../types/pretenderService.js";
import { StatusDump } from "../types/statusDump.js";
import DmService from "./dmService.js";
import Status from "../types/status.js";
import StatusDumpService from "./statusDumpService.js";

export default class NewTurnService {
    private statusService: StatusDumpService
    private pretenderService: PretenderService
    private dmService: DmService

    constructor(statusService: StatusDumpService, pretenderService: PretenderService, dmService: DmService) {
        this.statusService = statusService;
        this.pretenderService = pretenderService;
        this.dmService = dmService;
        this.statusService.Subscribe('newTurn', this.NotifyNewTurn.bind(this))
    }

    private readonly messages = [
        'må din trupp förflytta sig snabbt!',
        'må dina befälhavare fatta kloka beslut!',
        'må dina magiker trolla väl!',
        'må ditt folk frodas!',
        'må dina präster sprida ditt evangelium långt!',
        'må dina besvärjelser ha kraftfull verkan!',
        'må din kassa vara breddfylld!',
        'må de otrogna falla för dina krigare!'
    ]

    private GameOver(status: Status) {
        const teamsAlive = new Set<number>(status.allNations().filter(n => n.controller === Controller.human || n.controller === Controller.ai).map(n => n.pretenderNumber))
        return teamsAlive.size === 1;
    }

    private NotifyNewTurn(statusDump: StatusDump) {
        const status = this.pretenderService.statusFromDump(statusDump)
        if (!status) return
        for (const nation of status.claimed()) {
            let message = ''
            if (nation.controller === Controller.human) {
                if (this.GameOver(status)) {
                    message = `Du har lett ditt folk till seger i ${status.gameName} på runda ${status.turn}! Din Gud är den enda sanna Guden! Väl kämpat!`;
                }
                else {
                    message = `Ny runda i ${status.gameName}! Runda ${status.turn} har börjat, ${this.messages[Math.floor(Math.random() * this.messages.length)]}`;
                }
            } else if (nation.controller === Controller.defeated) {
                message = `Runda ${status.turn} i ${status.gameName} har börjat, tyvärr blev du besegrad. Väl kämpat!`;
            }
            else {
                continue;
            }
            this.dmService.SendDm(nation.player.id, message);
        }
    }

}
