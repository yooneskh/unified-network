import { UnifiedNetwork, IUnifiedRequest } from './unified-network';

export function makeUnifiedNetwork(base: IUnifiedRequest) {
  return new UnifiedNetwork(base);
}


export {
  IUnifiedRequest,
  IUnifiedRequestProcessor,
  IUnifiedRequestProcessorConfig,
  IUnifiedResponse,
  httpProcessorFetch,
} from './unified-network';
