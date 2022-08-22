import { Nation } from './nation.js';

export interface StatusDump {
    gameName: string;
    turn: number;
    nations: Nation[];
}
