import * as stompjs from '@stomp/stompjs';
export declare namespace StompClient {
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
export declare class StompClient {
    client: stompjs.Client;
    protected debug: boolean;
    protected connecting: boolean;
    protected publishQueue: {
        topic: string;
        body: string;
    }[];
    protected subscribedArr: {
        topic: string;
        handler: (msg: string) => void;
    }[];
    constructor(options: StompClient.Options);
    connect(): Promise<void | {}>;
    subscribe(topic: string, handler: (msg: string) => void): stompjs.StompSubscription | undefined;
    publish(topic: string, msg: string | object): void;
}
