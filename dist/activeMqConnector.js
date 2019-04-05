"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// poly fill for nodejs is required
Object.assign(global, { WebSocket: require('ws') });
if (typeof TextEncoder !== 'function') {
    const TextEncodingPolyfill = require('text-encoding');
    Object.assign(global, { TextEncoder: TextEncodingPolyfill.TextEncoder });
    Object.assign(global, { TextDecoder: TextEncodingPolyfill.TextDecoder });
}
const stompjs = require("@stomp/stompjs");
class ActiveMqConnector {
    constructor(options) {
        this.connecting = false;
        const stompOptions = {
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
            stompOptions.debug = (msg) => console.log(msg);
        }
        this.debug = options.debug || false;
        this.client = new stompjs.Client(stompOptions);
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client.connected)
                return Promise.resolve();
            // wait a bit and resolve
            if (this.connecting)
                return new Promise(r => setTimeout(r, 200));
            this.connecting = true;
            return new Promise((resolve, reject) => {
                this.client.onConnect = (frame) => {
                    // Do something, all subscribes must be done is this callback
                    // This is needed because this will be executed after a (re)connect
                    this.connecting = false;
                    resolve();
                };
                this.client.onStompError = (frame) => {
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
        });
    }
    subscribe(topic, handler) {
        // if topic is already subscribed, don't subscribe again
        if (this.client.connected) {
            if (this.debug) {
                console.log(`ActiveMQ subscribe`, topic);
            }
            return this.client.subscribe(topic, (message) => {
                handler(message.body);
            });
        }
        else {
            this.connect().then(() => {
                this.subscribe(topic, handler);
            });
        }
    }
    publish(topic, msg) {
        if (this.client.connected) {
            const body = typeof msg === 'string' ? msg : JSON.stringify(msg);
            this.client.publish({ destination: topic, body });
        }
        else {
            this.connect().then(() => {
                this.publish(topic, msg);
            });
        }
    }
}
exports.ActiveMqConnector = ActiveMqConnector;
