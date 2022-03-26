import { PretenderService } from "../types/pretenderService";
import { StatusDump } from "../types/statusDump";
import DmService from "./dmService";
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

    private NotifyNewTurn(statusDump: StatusDump) {
        let status = this.pretenderService.statusFromDump(statusDump)
        for (let player of status.claimed().map(n => n.player)) {
            this.dmService.SendDm(player.id, `Ny runda i Dominions! Runda ${status.turn} har börjat, ${this.messages[Math.floor(Math.random() * this.messages.length)]}`)
        }
    }

}
