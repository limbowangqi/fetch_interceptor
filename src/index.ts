import Chain from './chain/Chain';
import fetch from './hx-fetch';
import Interceptor from './Interceptors/Interceptor';

export default function test_111(){

  const testInterceptor : Interceptor = {

    intercept : (chain: Chain): Promise<Response> => {
      const request =  chain.getRequest()
      request.options.headers = {
        'zdy_header':'zdy_1.0.1',
        ...request.options.headers
      }
      return chain.proceed(request).then(res => {

        return {
          'zdy_header':'zdy_1.0.1',
          ...res
        }
      })
    }
  }

  fetch.addInterceptor(testInterceptor)

  fetch.request('/api/app/type/list').then((res) => {
    console.log('res',res)
  })
}
