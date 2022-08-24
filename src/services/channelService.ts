import { Client, Guild, GuildBasedChannel, OverwriteResolvable, Snowflake, UserResolvable } from 'discord.js';
import { StatusDump } from '../types/statusDump.js';
import RoleService from './roleService.js';
import StatusDumpService from './statusDumpService.js';

type ChannelId = Snowflake

const CategoryName = "Dominions"

class ChannelService {
    private client: Client
    private statusService: StatusDumpService
    private roleService: RoleService

    constructor(client: Client, statusService: StatusDumpService, roleService: RoleService) {
        this.client = client;
        this.statusService = statusService;
        this.roleService = roleService;
        this.statusService.Subscribe('newGame', this.HandleNewGame.bind(this))
        this.statusService.Subscribe('deleted', this.HandleDeleted.bind(this))
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

    async SetupChannels() {
        const gameNames = this.statusService.GameNames()
        const guilds = this.client.guilds.cache;
        await Promise.all(guilds.map(async guild => {
            const categoryId = await this.FindOrCreateCategoryChannel(guild)

            const channelsByGameNames: GuildBasedChannel[] = []
            await Promise.all(gameNames.map(async gameName => {
                channelsByGameNames.push(await this.CreateChannelWithRole(gameName, guild, categoryId));
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