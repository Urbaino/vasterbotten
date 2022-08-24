import { bold, codeBlock } from '@discordjs/builders';
import { Client, Guild, GuildBasedChannel, OverwriteResolvable, Snowflake } from 'discord.js';
import { PretenderService } from '../types/pretenderService.js';
import Status from '../types/status.js';
import { StatusDump } from '../types/statusDump.js';
import RoleService from './roleService.js';
import StatusDumpService from './statusDumpService.js';

type ChannelId = Snowflake

const CategoryName = "Dominions"

class ChannelService {
    private client: Client
    private statusService: StatusDumpService
    private roleService: RoleService
    private pretenderService: PretenderService

    constructor(client: Client, statusService: StatusDumpService, pretenderService: PretenderService, roleService: RoleService) {
        this.client = client;
        this.statusService = statusService;
        this.roleService = roleService;
        this.pretenderService = pretenderService;
        this.statusService.Subscribe('newGame', this.HandleNewGame.bind(this))
        this.statusService.Subscribe('deleted', this.HandleDeleted.bind(this))
        this.statusService.Subscribe('newTurn', this.HandleNewTurn.bind(this))
        this.statusService.Subscribe('turnUpdated', this.HandleTurnUpdated.bind(this))
    }

    private async FindOrCreateCategoryChannel(guild: Guild): Promise<ChannelId> {
        const category = guild.channels.cache.find(c => c.type === 'GUILD_CATEGORY' && c.name === CategoryName)
        if (category) return category.id
        console.debug("Creating Dominions category in guild", guild.id)
        const newCategory = await guild.channels.create(CategoryName, {
            type: 'GUILD_CATEGORY',
        })
        return newCategory.id
    }

    private async HandleNewGame(status: StatusDump) {
        const guilds = this.client.guilds.cache;
        return await Promise.all(guilds.map(async guild => {
            const categoryId = await this.FindOrCreateCategoryChannel(guild)
            await this.CreateChannelWithRole(status.gameName, guild, categoryId)
        }))
    }

    private async HandleDeleted(status: StatusDump) {
        const guilds = this.client.guilds.cache;
        return await Promise.all(guilds.map(async guild => {
            await this.DeleteChannelWithRole(status.gameName, guild)
        }))
    }

    private async HandleNewTurn(statusDump: StatusDump) {
        const guilds = this.client.guilds.cache;
        await Promise.all(guilds.map(async guild => {
            await this.SetStatusMessage(statusDump, guild)
        }))
    }

    private async HandleTurnUpdated(statusDump: StatusDump) {
        const guilds = this.client.guilds.cache;
        await Promise.all(guilds.map(async guild => {
            await this.SetStatusMessage(statusDump, guild)
        }))
    }

    async SetStatusMessage(statusDump: StatusDump, guild: Guild) {
        const status = this.pretenderService.statusFromDump(statusDump);
        if (!status) return null

        const channel = guild.channels.cache.find(c => c.name === status.gameName.toLowerCase())
        if (!channel || !channel.isText() || !this.client.user) return
        const user = this.client.user
        const pinnedMessages = await channel.messages.fetchPinned()
        const statusMessage = pinnedMessages.find(m => m.author.id === user.id)

        const content = this.ChannelStatusMessageContent(status)
        if (!content) return

        if (statusMessage) await statusMessage.edit(content)
        else {
            const m = await channel.send(content)
            await m.pin()
        }
    }

    private ChannelStatusMessageContent(status: Status) {
        const content = []
        content.push(bold(`${status.gameName}`) + ` runda ${status.turn}.`);

        if (status.finishedPlayers().length) {
            content.push('Följande spelare har genomfört sin tur:')
            content.push(codeBlock(status.finishedPlayers().join('\n') ?? ''))
        }

        content.push('Vi väntar på:')
        content.push(codeBlock(status.unfinishedPlayers().join('\n') ?? ''))

        return content.join('\n')
    }

    async SetupChannels() {
        const gameNames = this.statusService.GameNames()
        const guilds = this.client.guilds.cache;
        await Promise.all(guilds.map(async guild => {
            const categoryId = await this.FindOrCreateCategoryChannel(guild)

            const channelsByGameNames: GuildBasedChannel[] = []
            await Promise.all(gameNames.map(async gameName => {
                channelsByGameNames.push(await this.CreateChannelWithRole(gameName, guild, categoryId));
                const status = this.statusService.Status(gameName)
                if (!status) return
                await this.SetStatusMessage(status, guild)
            }))

            const channelsWithoutGame = guild.channels.cache.filter(channel => channel.parentId === categoryId && !channelsByGameNames.find(c => c.id === channel.id))
            console.debug(channelsWithoutGame.entries.length, "games to delete");
            await Promise.all(channelsWithoutGame.map(async c => {
                const channel = await this.client.channels.fetch(c.id)
                if (!channel) return
                await channel.delete("Game ended")
                console.log("Deleted hanging channel", c.id)
            }))
        }))
    }

    private async CreateChannelWithRole(name: string, guild: Guild, categoryId: ChannelId) {
        const existingChannel = guild.channels.cache.find(c => c.name === name.toLowerCase());
        if (existingChannel) return existingChannel;

        console.debug("Creating new Game channel", name, "in guild", guild.id)
        const role = await this.roleService.AddRoleToGuild(guild, name);

        const permissionOverwrites: OverwriteResolvable[] = [
            {
                id: guild.id,
                deny: ["VIEW_CHANNEL"],
            },
            {
                id: role.id,
                allow: ["VIEW_CHANNEL"],
            },
        ];
        if (this.client.user) permissionOverwrites.push({ id: this.client.user.id, allow: ["VIEW_CHANNEL"], })

        return await guild.channels.create(name, {
            type: 'GUILD_TEXT',
            parent: categoryId,
            reason: "New game started",
            topic: "Dominions 5 - " + name,
            permissionOverwrites,
        })
    }

    private async DeleteChannelWithRole(name: string, guild: Guild) {
        const channel = guild.channels.cache.find(c => c.name === name.toLowerCase());
        if (!channel) {
            console.error("Failed to delete channel", name, "as it could not be found in guild", guild.id)
            return
        }
        await channel.delete("Game ended")
        await this.roleService.RemoveRoleFromGuild(guild, name);
        console.debug("Deleted Game channel", name, "in guild", guild.id)
    }

    async SendToChannel(name: string, message: string) {

        const guilds = this.client.guilds.cache
        await Promise.all(guilds.map(async guild => {

            const channel = await guild.channels.cache.find(c => c.name === name.toLowerCase());
            if (!channel) {
                console.error("Failed to send message to channel", name, "as it could not be found in guild", guild.id)
                return
            }
            if (!channel.isText()) {
                console.error("Failed to send message to channel", name, "as it not a text channel in guild", guild.id)
                return
            }
            await channel.send(message);
        }))

    }
}

export default ChannelService