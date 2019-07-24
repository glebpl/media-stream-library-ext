'use strict';

import { Writable, Readable } from 'stream';
import { Sink } from 'media-stream-library/lib/components/component';
import { MessageType, Message } from 'media-stream-library/lib/components/message';
import { packetType, BYE } from 'media-stream-library/lib/utils/protocols/rtcp'

export interface MediaTrack {
    type: string
    encoding?: string
    mime?: string
    codec?: any
}

export class SourceBufferSink extends Sink {
    // Callback called when MessageType.SDP received
    public onStart?: (tracks: MediaTrack[], callback: Function) => void;
    public onData?: (data: ArrayBuffer | Uint8Array, callback: Function) => void;
    public onEnd?: () => void;
    public onError?: () => void;

    // private _done?: () => void;
    /**
     * The constructor sets up two streams and connects them to the MediaSource.
     */
    constructor() {
        /**
         * Set up an incoming stream and attach it to the sourceBuffer.
         * @type {Writable}
         */
        const incoming = new Writable({
            objectMode: true
            , write: (msg: Message, encoding, callback) => {
                if (msg.type === MessageType.SDP) {
                    // Start a new movie (new SDP info available)

                    // Set up a list of tracks that contain info about
                    // the type of media, encoding, and codec are present.
                    const tracks = msg.sdp.media.map(media => {
                        return {
                            type: media.type
                            , encoding: media.rtpmap && media.rtpmap.encodingName
                            , mime: media.mime
                            , codec: media.codec
                        }
                    });

                    this.onStart && this.onStart(tracks, callback);
                } else if (msg.type === MessageType.ISOM) {
                    // ISO BMFF Byte Stream data to be added to the source buffer
                    this.onData && this.onData(msg.data, callback);
                } else if (msg.type === MessageType.RTCP) {
                    if (packetType(msg.data) === BYE.packetType) {
                        this.onEnd && this.onEnd();
                        // mse.readyState === 'open' && mse.endOfStream()
                    }
                    callback()
                } else {
                    callback()
                }
            }
        });

        incoming.on('finish', () => {
            this.onEnd && this.onEnd();
            // mse && mse.readyState === 'open' && mse.endOfStream()
        });

        // When an error is sent on the incoming stream, close it.
        incoming.on('error', () => {
            this.onError && this.onError();

        });

        /**
         * Set up outgoing stream.
         * @type {Writable}
         */
        const outgoing = new Readable({
            objectMode: true,
            read: function() {
                //
            },
        });

        // When an error is sent on the outgoing stream, whine about it.
        outgoing.on('error', () => {
            console.warn('outgoing stream broke somewhere')
        });

        /**
         * initialize the component.
         */
        super(incoming, outgoing);
    }
}