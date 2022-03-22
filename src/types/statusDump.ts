import { Nation } from './nation';

export interface StatusDump {
    gameName: string;
    turn: number;
    nations: Nation[];
}
