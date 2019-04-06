// poly fill for nodejs is required
Object.assign(global, { WebSocket: require('ws') });

if (typeof TextEncoder !== 'function') {
  const TextEncodingPolyfill = require('text-encoding');
  Object.assign(global, { TextEncoder: TextEncodingPolyfill.TextEncoder });
  Object.assign(global, { TextDecoder: TextEncodingPolyfill.TextDecoder });
}

import * as stompjs from '@stomp/stompjs';

export namespace StompClient {
  export interface Options {
    brokerURL: string;
    user: string;
    password: string;
    debug?: boolean;
    heartbeatIncoming?: number;
    heartbeatOutgoing?: number;
    reconnectDelay?: number;
  }
}

export class StompClient {
  client: stompjs.Client;
  protected debug: boolean;
  protected connecting = false;
  protected publishQueue: { topic: string; body: string }[] = [];
  protected subscribedArr: { topic: string; handler: (msg: string) => void }[] = [];

  constructor(options: StompClient.Options) {
    const stompOptions: stompjs.StompConfig = {
      brokerURL: options.brokerURL,
      connectHeaders: {
        login: options.user,
        passcode: options.password,
      },
      reconnectDelay: options.reconnectDelay || 5000,
      // if your cpu is slow, this heart beat better set to a higher value
      heartbeatIncoming: options.heartbeatIncoming || 15000,
      heartbeatOutgoing: options.heartbeatOutgoing || 15000,
    };
    if (options.debug) {
      stompOptions.debug = (msg: string) => console.log(msg);
    }
    this.debug = options.debug || false;
    this.client = new stompjs.Client(stompOptions);
  }

  async connect() {
    if (this.client.connected) return Promise.resolve();
    // wait a bit and resolve
    if (this.connecting) return new Promise(r => setTimeout(r, 200));
    this.connecting = true;
    return new Promise((resolve, reject) => {
      // onConnect will be called on everytime connect including reconnect.
      // need to re-subscribe all topics when reconnected
      this.client.onConnect = (frame: any) => {
        // Do something, all subscribes must be done is this callback
        // This is needed because this will be executed after a (re)connect
        this.connecting = false;
        this.publishQueue.forEach(({ topic, body }) => {
          this.client.publish({ destination: topic, body });
        });
        this.subscribedArr.forEach(({ topic, handler }) => {
          this.client.subscribe(topic, (message: stompjs.IFrame) => {
            handler(message.body);
          });
        });
        console.log(
          `StompClient onConnect sent publishQueue.length=${this.publishQueue.length} subscribedArr.length=${
            this.subscribedArr.length
          }`,
        );
        resolve();
      };

      this.client.onStompError = (frame: any) => {
        // Will be invoked in case of error encountered at Broker
        // Bad login/passcode typically will cause an error
        // Complaint brokers will set `message` header with a brief message. Body may contain details.
        // Compliant brokers will terminate the connection after any error
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        this.connecting = false;
        reject();
      };

      this.client.activate();
    });
  }

  subscribe(topic: string, handler: (msg: string) => void) {
    // if topic is already subscribed, don't subscribe again
    this.subscribedArr.push({ topic, handler });
    if (this.client.connected) {
      if (this.debug) {
        console.log(`ActiveMQ subscribe`, topic);
      }
      return this.client.subscribe(topic, (message: stompjs.IFrame) => {
        handler(message.body);
      });
    } else {
      this.connect();
    }
  }

  publish(topic: string, msg: string | object) {
    const body: string = typeof msg === 'string' ? msg : JSON.stringify(msg);
    if (this.client.connected) {
      try {
        this.client.publish({ destination: topic, body });
      } catch (e) {
        console.error('publish failed retry', e);
        this.publishQueue.push({ topic, body });
        this.connect();
      }
    } else {
      this.publishQueue.push({ topic, body });
      this.connect();
    }
  }
}
