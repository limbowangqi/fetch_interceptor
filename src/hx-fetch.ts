import Interceptor from './Interceptors/Interceptor'
import RealInterceptorChain from './chain/RealInterceptorChain'
import HxRequest from './request/HxRequest'
import AppInterceptors from './Interceptors/AppInterceptors'
import NetworkInterceptors from './Interceptors/NetworkInterceptors'

class HxFetch{

  private interceptors:Array<Interceptor>

  constructor(){
    this.interceptors = [] // 拦截器集合
  }

  public addInterceptor(interceptor:Interceptor){
    this.interceptors.push(interceptor)
  }

  public async request(url:string, options :RequestInit = {}) {
    // 构建默认拦截器
    const interceptorList = []
    // 自定义拦截器
    if(this.interceptors.length !== 0){
      this.interceptors.forEach(i =>  interceptorList.push(i))
    }
    // 添加默认
    interceptorList.push(new AppInterceptors())
    interceptorList.push(new NetworkInterceptors())

    // 模拟request
    const request : HxRequest = {
      url,options
    }

    // 发起请求 
    const chain = new RealInterceptorChain(interceptorList, 0, request)

    return chain.proceed(request);
  }

}

const hxFetch = new HxFetch();

export default hxFetch

