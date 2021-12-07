import Interceptor from './Interceptor'
import Chain from '../chain/Chain'

export default class AppInterceptors implements Interceptor{
  
  intercept(chain: Chain) :Promise<Response>  {
    const request =  chain.getRequest()
    // 添加app自定义header
    request.options.headers = {
      'appVersion':'1.0.11',
      ...request.options.headers 
    }

    return chain.proceed(request).then(res => {
      // 自定义返回参数
      return {
        'responseAppId':'abcdefg',
        ...res
      }
    })
  }
}