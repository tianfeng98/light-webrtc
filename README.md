# Light WebRTC

As you know, webrtc protocol itself does not define signaling interaction protocol, and users need to implement sdp+icecandidate exchange logic by themselves. Therefore, webrtc does not have a standard player, so it needs to use js or native sdk to implement playback.

I wanted to implement a webrtc player to interface with [ZLMediaKit](https://github.com/ZLMediaKit/ZLMediaKit), but I still wanted it to support more platforms, so I wrote this library to implement basic signaling interaction and disconnected reconnection.

# How to use

## Install

### cdn
```html
<script src="https://unpkg.com/light-webrtc@latest/dist/index.iife.js"></script>
```

### npm
```bash
npm i --save light-webrtc
```

### yarn

```bash
yarn add --save light-webrtc
```

### pnpm

```bash
pnpm add light-webrtc
```

## Demo

This is a demo using [ZLMediaKit](https://github.com/ZLMediaKit/ZLMediaKit) as a pull-through platform.

### ESM

```js
import LightWebRTC from 'light-webrtc'
```

### Base

```js
const lightWebRTC = new LightWebRTC({
    media: document.getElementById('video'),
    autoLoad: true,
    getRemoteSdp: (sdp) =>
        fetch(
            "http://127.0.0.1:8080/index/api/webrtc?app=live&stream=test&type=play",
            {
                method: "post",
                body: sdp,
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
            }
        )
            .then((res) => res.json())
            .then((d) => d.sdp),
})
```

Use `autoLoad`, video will load when construct.

if you want load video at another appropriate time, use method `lightWebRTC.load()` and set `autoLoad` to `false`.

### Reconnect

When `iceConnectionState` become `disconnected`, Light WebRTC will reconnect 3 times automatically.

You can change the number of reconnections by setting `retryTime`.

```js
const lightWebRTC = new LightWebRTC({
    media: document.getElementById('video'),
    autoLoad: true,
    retryTime: 5, // Auto reconnect 5 times.
    getRemoteSdp: (sdp) =>
        fetch(
            "http://127.0.0.1:8080/index/api/webrtc?app=live&stream=test&type=play",
            {
                method: "post",
                body: sdp,
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
            }
        )
            .then((res) => res.json())
            .then((d) => d.sdp)
})
```

When [status](#Status) is `failed`, you can run `lightWebRTC.reload()` to reconnect.

### Other stream platform

If you want to use this library with other stream platform, you should write getRemoteSdp by yourself.

For example with [SRS](https://ossrs.net/), you should convert `webrtc://localhost/live/livestream` to http(s) request by yourself and write code in `getRemoteSdp` method.

# Options

## media

type: `HTMLMediaElement`

Your video element

## autoLoad

type: `boolean`

Load source when construct

## retryTime

type: `number`

default: `3`

Retry time when disconnected

## getRemoteSdp

`required`

type: `(localSdp: string) => Promise<string>`

Send offer and get answer

# Methods

## load

type: `() => Promise<void>`

Send offer and `setRemoteDescription` with answer.

## reload

type: `() => Promise<void>`

Create new `RTCPeerConnection` to load.

## destroy

type: `() => void`

Close connection and clear events.

# Events

## Add event listener

```js
lightWebRTC.on('event name', callback)
// or
lightWebRTC.addEventListener('event name', callback)
```

## Remove event listener

```js
lightWebRTC.removeEventListener('event name')
```

## Event name

### status

This event will fire when [status](#Status) change.

```js
lightWebRTC.on('status', status => {
    console.log('status', status);
})
```

### error

```js
lightWebRTC.on('error', error => {
    console.log('error', error);
})
```

# Status

```ts
export enum Status {
  connecting = "connecting",
  connected = "connected",
  reconnecting = "reconnecting",
  failed = "failed",
  disconnected = "disconnected",
  closed = "closed",
}
```

# License

`light-webrtc` is released under the `MIT license`.

