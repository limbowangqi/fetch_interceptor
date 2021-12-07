import Chain from '../chain/Chain'

export default interface Interceptor{

  intercept: (chain: Chain)=>Promise<Response>
}