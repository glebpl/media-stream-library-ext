'use strict';
import { RtspConfig } from 'media-stream-library/lib/components/rtsp-session'
import { WSConfig } from 'media-stream-library/lib/components/ws-source/openwebsocket';
import { WSSource } from 'media-stream-library/lib/components/ws-source';
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

    private _src?: WSSource;
    private _sink: SourceBufferSink;

    constructor(config: SourceBufferPipelineConfig) {
        const {ws: wsConfig, rtsp: rtspConfig, sink} = config;
        super(rtspConfig);

        this.append(sink);
        this._sink = sink;

        this.ready = WSSource.open(wsConfig).then(wsSource => {
            // optional callback
            /*wsSource.onServerClose = () => {
                this.onServerClose && this.onServerClose();
            };*/
            this.prepend(wsSource);
            this._src = wsSource;
        });
    }

    close() {
        this._src && this._src.outgoing.end();
    }
}