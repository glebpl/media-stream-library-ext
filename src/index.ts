'use strict';

import { components as _components, pipelines as _pipelines } from 'media-stream-library/lib/index.browser';
import { SourceBufferPipeline } from './source-buffer-pipeline';
import { SourceBufferSink } from './source-buffer-sink';
import { WSSourceExt } from './ws-source-ext';

export { utils } from 'media-stream-library/lib/index.browser';

export const components = {
    ..._components
    , SourceBufferSink
    , WSSourceExt
};

export const pipelines = {
    ..._pipelines
    , SourceBufferPipeline
};