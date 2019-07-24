'use strict';
import { RtspConfig } from 'media-stream-library/lib/components/rtsp-session'
import { WSConfig } from 'media-stream-library/lib/components/ws-source/openwebsocket';
import {CLOSE_NORMAL, WSSourceExt} from './ws-source-ext';
import { RtspMp4Pipeline } from 'media-stream-library/lib/pipelines/rtsp-mp4-pipeline';
import { SourceBufferSink } from './source-buffer-sink';

// console.log(RtspMp4Pipeline);

export interface SourceBufferPipelineConfig {
    ws?: WSConfig
    rtsp?: RtspConfig
    sink?: SourceBufferSink
}

export class SourceBufferPipeline extends RtspMp4Pipeline {
    // public onSourceOpen?: (mse: MediaSource, tracks: MediaTrack[]) => void
    // public onServerClose?: () => void;
    public ready: Promise<void>;

    private _src?: WSSourceExt;
    private _sink: SourceBufferSink;

    constructor(config: SourceBufferPipelineConfig) {
        const {ws: wsConfig, rtsp: rtspConfig, sink} = config;
        super(rtspConfig);

        this.append(sink);
        this._sink = sink;

        this.ready = WSSourceExt.open(wsConfig).then(wsSource => {
            // optional callback
            /*wsSource.onServerClose = () => {
                this.onServerClose && this.onServerClose();
            };*/
            this.prepend(wsSource);
            this._src = wsSource;
        });
    }

    /**
     * Closes incoming socket and outgoing sink
     * @param {number} code
     * @param {string} reason
     */
    close(code: number = CLOSE_NORMAL, reason: string = '') {
        if(this._src) {
            this._src.close(code, reason);
            this._src.outgoing.end();
        }
    }
}