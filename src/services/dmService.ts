import { Client, UserResolvable } from 'discord.js';

class DmService {
    private client: Client

    constructor(client: Client) {
        this.client = client;
    }

    async SendDm(userId: UserResolvable, message: string) {
        const user = await this.client.users.fetch(userId);
        user.send(message);
    }
}

export default DmService