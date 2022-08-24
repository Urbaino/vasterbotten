import EventEmitter from 'events'
import { StatusDump } from '../types/statusDump.js'

export type GameEvents = 'newTurn' | 'deleted' | 'newGame' | 'turnUpdated'
export type PlayerEvents = 'pretenderSubmitted' | 'pretenderClaimed' | 'playerLeft'

class EventService {
    private events = new EventEmitter();

    public RaiseGameEvent(event: GameEvents, status: StatusDump) {
        console.debug(new Date(), ':', 'event', ':', event, ':', status.gameName);
        this.events.emit(event, status)
    }

    public SubscribeToGameEvent(event: GameEvents, listener: (status: StatusDump) => void) {
        this.events.addListener(event, listener);
    }


    public RaisePlayerEvent(event: PlayerEvents, gameName: string) {
        console.debug(new Date(), ':', 'event', ':', event, ':', gameName);
        this.events.emit(event, gameName)
    }

    public SubscribeToPlayerEvent(event: PlayerEvents, listener: (gameName: string) => void) {
        this.events.addListener(event, listener);
    }
}

export default EventService