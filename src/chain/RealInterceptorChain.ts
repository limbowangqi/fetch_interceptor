import Interceptor from '../Interceptors/Interceptor'
import Chain from './Chain'
import HxRequest from '../request/HxRequest'

/**
 * 责任链的实现类
 */
 export default class RealInterceptorChain implements Chain {

  interceptorList:Array<Interceptor>
  index:number
  request:HxRequest

  /**
   * 构造方法 
   * @param interceptorList 拦截器集合
   * @param index 
   */
  constructor(interceptorList:Array<Interceptor>, index:number, request:HxRequest){
    this.interceptorList = interceptorList
    this.index = index
    this.request = request
  } 

  getRequest() :HxRequest {
    return this.request
  }

  proceed(request: HxRequest) :Promise<Response> {

    if(this.index >= this.interceptorList.length){
      throw new Error('')
    }

    const next = new RealInterceptorChain(this.interceptorList, this.index + 1, request)
    const interceptor = this.interceptorList[this.index]
    const response =  interceptor.intercept(next);

    return response;
  }
}
