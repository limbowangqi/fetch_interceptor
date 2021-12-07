import Interceptor from './Interceptor'
import Chain from '../chain/Chain'
// import 'whatwg-fetch'

/**
 * 拦截器中最重要的一环
 * 网络请求真正的地方 fetch
 * 
 */
export default class NetworkInterceptors implements Interceptor{
  
  intercept(chain: Chain) : Promise<Response> {
    const request = chain.getRequest()

    return fetch(request.url,request.options).then((response) => {
      return response.json()
    })
  }
}