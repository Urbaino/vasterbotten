import test from 'node:test'
import assert from 'node:assert';
import ChannelService from '../../out/services/channelService.js'

const eventService = {
    SubscribeToGameEvent: () => null,
    SubscribeToPlayerEvent: () => null,
}

test('Should replace role mention name with ID', (t) => {
    const sut = new ChannelService(null, null, null, null, eventService)

    const message = "ababab <@&Foo> <@&Faa> oho! <@&Fee>"

    const roles = [
        { name: "Foo", id: 123 },
        { name: "Faa", id: 456 },
        { name: "Fee", id: 789 }]
    const guild = { roles: { cache: roles } }

    const res = sut.ReplaceRoleNameWithIdInTag(message, guild)
    assert.strictEqual(res, "ababab <@&123> <@&456> oho! <@&789>");
});

test('New game, avoid double message', async (t) => {
    const gameName = "Spelet";
    const client = {
        user: {}
    }
    const pretenderService = {
        status: () => ({
            gameName,
            gameStarted: () => false,
            currentPlayers: () => [],
            pendingNations: () => [],
        })
    }
    const sut = new ChannelService(client, null, pretenderService, null, eventService)
    let message = ''

    const guild = {
        channels: {
            cache: [{
                name: gameName.toLowerCase(),
                isText: () => true,
                send: (m) => { message = m; return { pin: () => { } } },
                messages: {
                    fetchPinned: () => []
                }
            }]
        }
    }

    await sut.SetStatusMessage(gameName, guild);

    assert.strictEqual(message, 'Inga pretenders valda.')
})

test('New round, show appropriate message', async (t) => {
    const status = {
        gameName: "Spelet",
        gameStarted: () => true,
        finishedPlayers: () => ["Apa", "Papa"],
        unfinishedPlayers: () => [],
    }
    const sut = new ChannelService(null, null, null, null, eventService)

    const message = await sut.ChannelStatusMessageContent(status);

    assert.ok(message.includes('Alla är klara. Nästa runda beräknas...'))
})
