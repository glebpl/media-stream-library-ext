/* global requirejs:readonly */

requirejs.config({
    baseUrl: './'
    , waitSeconds: 10
    , paths: {
        // zepto: 'https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto'
        // , vp: '../target/player.bundle'
        lib: '../dist/media-stream-library-ext'
        // , 'fetch-client': 'libs/fetch-client.dev'
    }
});

requirejs([
    'lib'
], function(Lib) {

    'use strict';

    let sink;
    let sbp;

    const TRIGGER_THRESHOLD = 100;

    const SourceBufferPipeline = Lib.pipelines.SourceBufferPipeline;
    const SourceBufferSink = Lib.components.SourceBufferSink;
    const playButton = document.querySelector('#play');
    const stopButton = document.querySelector('#stop');
    const $wsUrl = document.querySelector('[name="wsUrl"]');
    const $rtspUrl = document.querySelector('[name="rtspUrl"]');
    const $video = document.querySelector('video');

    let mse;
    let sourceBuffer;
    let onBufferUpdateEnd;

    // console.log(Lib);

    const handleClickPlay = () => {
        stop();

        const wsUrl = $wsUrl.value;
        const rtspUrl = $rtspUrl.value;

        play(wsUrl, rtspUrl);
    };

    const handleSinkStart = (tracks, callback) => {
        // Start a new mediaSource and prepare it with a sourceBuffer.
        // When ready, this component's .onSourceOpen callback will be called
        // with the mediaSource, and a list of valid/ignored media.
        mse = new MediaSource();

        $video.src = window.URL.createObjectURL(mse);

        const handler = () => {
            mse.removeEventListener('sourceopen', handler);
            // this.onSourceOpen && this.onSourceOpen(mse, tracks)

            const mimeCodecs = tracks
                .map(track => track.mime)
                .filter(mime => mime)
                .join(', ');

            sourceBuffer = addSourceBuffer($video, mse, `video/mp4; codecs="${mimeCodecs}"`);

            callback()
        };

        mse.addEventListener('sourceopen', handler)
    };

    const closeStream = () => {
        if(mse && mse.readyState === 'open') {
            mse.endOfStream();
        }
    };

    const play = (wsUrl, rtspUrl) => {
        sink = new SourceBufferSink();

        sink.onStart = handleSinkStart;

        sink.onData = (data, callback) => {
            sourceBuffer.appendBuffer(data);
            onBufferUpdateEnd = callback;
        };

        sink.onEnd = closeStream;

        sink.onError = () => {
            if(sourceBuffer) {
                if (sourceBuffer.updating) {
                    sourceBuffer.addEventListener('updateend', closeStream);
                } else {
                    closeStream();
                }
            }
        };

        sbp = new SourceBufferPipeline({
            ws: { uri: `ws://${wsUrl}/` }
            , rtsp: { uri: rtspUrl }
            , sink: sink
        });

        sbp.ready.then(() => {
            sbp.rtsp.play();
        });
    };

    const stop = () => {
        sbp && sbp.close() && sbp.rtsp.stop();
    };

    /**
     * Add a new sourceBuffer to the mediaSource and remove old ones.
     * @param {HTMLMediaElement} el  The media element holding the media source.
     * @param {MediaSource} mse  The media source the buffer should be attached to.
     * @param {String} [mimeType='video/mp4; codecs="avc1.4D0029, mp4a.40.2"'] [description]
     */
    const addSourceBuffer = (el, mse, mimeType) => {
        const sourceBuffer = mse.addSourceBuffer(mimeType);

        let trigger = 0;
        const onUpdateEndHandler = () => {
            ++trigger;

            if (trigger > TRIGGER_THRESHOLD && sourceBuffer.buffered.length) {
                trigger = 0;

                const index = sourceBuffer.buffered.length - 1;
                const start = sourceBuffer.buffered.start(index);
                const end = el.currentTime - 10;

                try {
                    // remove all material up to 10 seconds before current time
                    if (end > start) {
                        sourceBuffer.remove(start, end);
                        return;
                    }
                } catch (e) {
                    console.warn(e)
                }
            }

            onBufferUpdateEnd && onBufferUpdateEnd();
        };

        sourceBuffer.addEventListener('updateend', onUpdateEndHandler);

        return sourceBuffer
    };

    const handleClickStop = () => {
        stop();
    };

    playButton.addEventListener('click', handleClickPlay);
    stopButton.addEventListener('click', handleClickStop);

    // handleClickPlay();
});