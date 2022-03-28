import { Controller } from "../types/controller";
import { PretenderService } from "../types/pretenderService";
import { StatusDump } from "../types/statusDump";
import DmService from "./dmService";
import Status from "./status";
import StatusDumpService from "./statusDumpService";

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
        'må dina spells ha kraftfull verkan!',
        'må din kassa vara breddfylld!'
    ]

    private GameOver(status: Status) {
        const teamsAlive = new Set<number>(status.allNations().filter(n => n.controller === Controller.human).map(n => n.pretenderNumber))
        return teamsAlive.size === 1;
    }

    private NotifyNewTurn(statusDump: StatusDump) {
        let status = this.pretenderService.statusFromDump(statusDump)
        for (let nation of status.claimed()) {
            let message = ''
            if (nation.controller === Controller.human) {
                if (this.GameOver(status)) {
                    message = `Du har lett ditt folk till seger på runda ${status.turn}! Din Gud är den enda sanna Guden! Väl kämpat!`;
                }
                else {
                    message = `Ny runda i Dominions! Runda ${status.turn} har börjat, ${this.messages[Math.floor(Math.random() * this.messages.length)]}`;
                }
            } else if (nation.controller === Controller.defeated) {
                message = `Runda ${status.turn} i Dominions har börjat, tyvärr blev du besegrad. Väl kämpat!`;
            }
            else {
                continue;
            }
            this.dmService.SendDm(nation.player.id, message);
        }
    }

}
