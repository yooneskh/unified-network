import { IUnifiedRequest, UnifiedNetwork } from './unified-network';


export {
  IUnifiedRequest,
};


export function makeUnifiedNetwork(base: IUnifiedRequest) {
  return new UnifiedNetwork(base);
}
