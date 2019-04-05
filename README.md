# stompjs-nodejs
Wrapper for stompjs works with nodejs and with typings

## Usage
npm i stompjs-nodejs --save

example with active MQ.

```
import { ActiveMqConnector } from 'stompjs-nodejs';

const client = new ActiveMqConnector({brokerUrl: 'ws://localhost:61614/ws'})

client.subsribe('/topic/name', (msg) => {
    console.log('received', msg);
});

client.publish('/topic/name', 'a message to pub');
```

subsribe and publish will auto connect at first call (lazy init)

but if you want to connect in advance, can do
```
await client.connect()
```

## Notes
Currently it only tested to work with active MQ, I did not test on other MQ lib.
Currently this wrapper only works for pub/sub mode, doesn't work for queue yet.

contributions are welcome.

Special thanks to original author Deepak Kumar for writing stompjs lib
