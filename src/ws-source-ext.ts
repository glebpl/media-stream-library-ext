'use strict';

import { WSSource } from 'media-stream-library/lib/components/ws-source';
import { openWebSocket, WSConfig } from 'media-stream-library/lib/components/ws-source/openwebsocket'

export const READY_STATE_CONNECTING = 0;
export const READY_STATE_OPEN = 1;
export const READY_STATE_CLOSING = 2;
export const READY_STATE_CLOSED = 2;

export const CLOSE_NORMAL = 1000;
export const CLOSE_PROTOCOL_ERROR = 1002;
export const CLOSE_UNSUPPORTED_DATA = 1003;
export const CLOSE_ABNORMAL = 1006;

/**
 * Adds 'close' method
 */
export class WSSourceExt extends WSSource {
    private _ws: WebSocket;

    constructor(socket: WebSocket) {
        super(socket);
        this._ws = socket;
    }

    close(code: number = CLOSE_NORMAL, reason: string = '') {
        if(this._ws && ( this._ws.readyState === READY_STATE_CONNECTING || this._ws.readyState === READY_STATE_OPEN )) {
            this._ws.close(code, reason);
        }
    }

    /**
     * Expose websocket opener as a class method that returns a promise which
     * resolves with a new WebSocketComponent.
     * @override
     */
    static open(config?: WSConfig) {
        return openWebSocket(config).then(socket => new WSSourceExt(socket));
    }
}