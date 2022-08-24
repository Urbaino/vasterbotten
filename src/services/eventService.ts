import EventEmitter from 'events'
import { StatusDump } from '../types/statusDump.js'

export type DominionEvents = 'newTurn' | 'deleted' | 'newGame' | 'turnUpdated' | 'pretenderSubmitted' | 'pretenderClaimed' | 'playerLeft'

class EventService {
    private events = new EventEmitter();

    public Raise(event: DominionEvents, status: StatusDump) {
        console.debug(new Date(), ':', 'event', ':', event, ':', status.gameName);
        this.events.emit(event, status)
    }

    public Subscribe(event: DominionEvents, listener: (status: StatusDump) => void) {
        this.events.addListener(event, listener);
    }
}

export default EventService