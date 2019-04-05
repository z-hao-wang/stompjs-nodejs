import * as stompjs from '@stomp/stompjs';
export declare namespace ActiveMqConnector {
    interface Options {
        brokerURL: string;
        user: string;
        password: string;
        debug?: boolean;
        heartbeatIncoming?: number;
        heartbeatOutgoing?: number;
        reconnectDelay?: number;
    }
}
export declare class ActiveMqConnector {
    client: stompjs.Client;
    protected debug: boolean;
    protected connecting: boolean;
    constructor(options: ActiveMqConnector.Options);
    connect(): Promise<void | {}>;
    subscribe(topic: string, handler: (msg: string) => void): stompjs.StompSubscription | undefined;
    publish(topic: string, msg: string | object): void;
}
