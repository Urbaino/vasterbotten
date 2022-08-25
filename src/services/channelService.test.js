import test from 'node:test'
import assert from 'node:assert';
import ChannelService from '../../out/services/channelService.js'

test('Should replace role mention name with ID', (t) => {
    const eventService = {
        SubscribeToGameEvent: () => null,
        SubscribeToPlayerEvent: () => null,
    }
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
