# stompjs-nodejs
Wrapper for stompjs works with nodejs and with typings

## Usage
npm i stompjs-nodejs --save

example with active MQ.

```
import { StompClient } from 'stompjs-nodejs';

const client = new StompClient({
    brokerUrl: 'ws://localhost:61614/ws',
    user: 'user',
    password: 'password',
});

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

Special thanks to original authors of stompjs https://github.com/stomp-js/stompjs
