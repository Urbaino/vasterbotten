import test from 'node:test'
import assert from 'node:assert';
import NewTurnService from '../../out/services/newTurnService.js'
import { Controller } from '../../out/types/controller.js';

test('2 players left, not GameOver', (t) => {
    const statusService = {
        Subscribe: () => null
    }
    const sut = new NewTurnService(statusService, null, null,)

    const status = {
        allNations: () => [
            { controller: Controller.human, pretenderNumber: 1 },
            { controller: Controller.ai, pretenderNumber: 2 },
            { controller: Controller.dead, pretenderNumber: 3 },
            { controller: Controller.defeated, pretenderNumber: 4 },
        ]
    }
    const x = sut.GameOver(status)
    assert.strictEqual(x, false);
});

test('Only Human left, GameOver', (t) => {
    const statusService = {
        Subscribe: () => null
    }
    const sut = new NewTurnService(statusService, null, null,)

    const status = {
        allNations: () => [
            { controller: Controller.human, pretenderNumber: 1 },
            { controller: Controller.dead, pretenderNumber: 2 },
            { controller: Controller.dead, pretenderNumber: 3 },
            { controller: Controller.defeated, pretenderNumber: 4 },
        ]
    }
    const x = sut.GameOver(status)
    assert.strictEqual(x, true);
});

test('Only AI left, GameOver', (t) => {
    const statusService = {
        Subscribe: () => null
    }
    const sut = new NewTurnService(statusService, null, null,)

    const status = {
        allNations: () => [
            { controller: Controller.dead, pretenderNumber: 1 },
            { controller: Controller.ai, pretenderNumber: 2 },
            { controller: Controller.dead, pretenderNumber: 3 },
            { controller: Controller.defeated, pretenderNumber: 4 },
        ]
    }
    const x = sut.GameOver(status)
    assert.strictEqual(x, true);
});

test('Only same team left, GameOver', (t) => {
    const statusService = {
        Subscribe: () => null
    }
    const sut = new NewTurnService(statusService, null, null,)

    const status = {
        allNations: () => [
            { controller: Controller.human, pretenderNumber: 1 },
            { controller: Controller.ai, pretenderNumber: 1 },
            { controller: Controller.dead, pretenderNumber: 3 },
            { controller: Controller.defeated, pretenderNumber: 4 },
        ]
    }
    const x = sut.GameOver(status)
    assert.strictEqual(x, true);
});