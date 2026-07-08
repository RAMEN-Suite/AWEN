/// <reference lib="webworker" />

import {
  calculateGroupedAnnotations,
  type AnnotationListCalculationRequest,
} from './annotation-list-calculation';

addEventListener(
  'message',
  ({ data }: MessageEvent<AnnotationListCalculationRequest>) => {
    postMessage(calculateGroupedAnnotations(data));
  },
);
