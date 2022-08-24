import { Client, Guild, UserResolvable } from 'discord.js';
import { PretenderService } from '../types/pretenderService';

class RoleService {
    private client: Client

    constructor(client: Client) {
        this.client = client;
    }

    async SetupRoles(pretenderService: PretenderService) {
        await Promise.all(pretenderService.gameNames().map(async gameName => {
            const players = pretenderService.status(gameName)?.claimed()
            if (!players) return
            await Promise.all(players.map(async p => {
                await this.AddRoleToUser(p.player.id, gameName);
            }))
        }))
    }

    async AddRoleToGuild(guild: Guild, roleName: string) {
        let role = guild.roles.cache.find(r => r.name === roleName)
        if (role) return role
        console.debug("Creating new role", roleName, "in guild", guild.id)
        return await guild.roles.create({ name: roleName })
    }

    async RemoveRoleFromGuild(guild: Guild, roleName: string) {
        let role = guild.roles.cache.find(r => r.name === roleName)
        if (!role) return
        await role.delete()
        console.debug("Deleted role", roleName, "in guild", guild.id)
    }

    async AddRoleToUser(userId: UserResolvable, roleName: string) {
        const guilds = this.client.guilds.cache;
        await Promise.all(guilds.map(async guild => {
            try {
                const role = await this.AddRoleToGuild(guild, roleName)
                const user = await guild.members.fetch(userId);
                if (user.roles.cache.find(r => r.id === role.id)) return
                await user.roles.add(role)
                console.debug("Added user", userId, "to role", roleName, "in guild", guild.id)
            } catch (e) {
                console.debug(e)
                return Promise.resolve()
            }
        }))
    }

    async RemoveRoleFromUser(userId: UserResolvable, roleName: string) {
        const guilds = this.client.guilds.cache;
        await Promise.all(guilds.map(async guild => {
            try {
                let role = guild.roles.cache.find(r => r.name === roleName)
                if (!role) return
                const user = await guild.members.fetch(userId);
                await user.roles.remove(role)
                console.debug("Removed user", userId, "from role", roleName, "in guild", guild.id)
            } catch (e) {
                console.debug(e)
                return Promise.resolve()
            }
        }))
    }
}

export default RoleService