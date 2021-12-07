# fetch_interceptor
### 对前端网络库fetch进行封装，基于责任链模式，新增拦截器功能。

设计思路参考[OKHTTP](https://github.com/square/okhttp "OKHTTP")

责任链模式的定义： 

    为了避免请求发送者与多个请求处理者耦合在一起，将所有请求的处理者连成一条链；当有请求发生时，可将请求沿着这条链传递，直到所有处理者处理完毕。
根据定义，我们知道在责任链模式中需要三个角色 **（发送者、处理者、链）**

## 基类
### 链（chain）
```javascript
// 责任链 接口
export default interface Chain {

  getRequest:() => HxRequest

  proceed:(request: HxRequest) => Promise<Response>

}
```
**getRequest方法：** 获取当前的request对象  
**proceed方法：** 对request进行处理，并且返回Promise<Response>

### 处理者（Interceptor）
```javascript
// 拦截器 接口
export default interface Interceptor{

  intercept: (chain: Chain)=>Promise<Response>
}
```
**intercept方法：** 接收链对象，并返回Promise<Response>

### 发送者（request）
无

## 实现类
### chain（RealInterceptorChain）
```javascript
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
```

### Interceptor（AppInterceptors、NetworkInterceptors）
```javascript
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
```

### 发送者（HxFetch）
```javascript
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
    // 添加默认拦截器
    interceptorList.push(new AppInterceptors())
    interceptorList.push(new NetworkInterceptors())

    // 模拟request
    const request : HxRequest = {
      url,options
    }

    const chain = new RealInterceptorChain(interceptorList, 0, request)
    
		// 发起请求 
    return chain.proceed(request);
  }

}
```
这样我们就实现了责任链模式的fetch，下面我们来讲讲他的运行流程。

## 源码分析
### 出参拦截处理
**1.发送者的request方法**

    将自定义拦截器、系统默认拦截器按照制定顺序添加  
    创建一个索引index为0的chain对象，并且将request、interceptorList传入。  
    调用chain的proceed方法，并将request作为参数。

**2.RealInterceptorChain的proceed方法** 

    判断当前chain对象的索引index是否大于等于interceptorList的length
    创建一个索引为index+1的chain对象，并且将request、interceptorList传入。
    从interceptorList中取出index的interceptor对象，并执行interceptor方法，同时将chain作为参数。
    返回interceptor方法的返回值。  

**3.AppInterceptors的intercept方法**  

    从chain对象中取出request对象，并添加自定义参数。
    执行chain的proceed方法，并将request对象作为参数。
    返回proceed方法的返回值。  

**4.执行步骤2**  

**5.NetworkInterceptors的intercept方法**

    从chain对象中取出request对象。
    request作为参数，执行fetch请求
    返回fetch请求的返回值promise。

### 入参拦截处理
有上面的流程可以知道，发送者的request方法最终会返回接受到一个promise对象。  
我们现在来看看promise的运行流程

**1.NetworkInterceptors的intercept方法**

    为promise对象执行then方法，执行response.json方法
    
**2.RealInterceptorChain的proceed方法**

    无
    
**3.AppInterceptors的intercept方法**

    为promise对象执行then方法，添加自定义参数。
    
**4.执行步骤2** 

**5.发送者的request方法**

    无

## 总结
**chain的proceed方法，会将上一个拦截器传入的request对象作为参数，传入到下个拦截器中。**  
**NetworkInterceptors作为最底层的拦截器，负责真正的fetch调用，并且返回promise对象。**  
**其他拦截器，执行chain.proceed方法，会将当前处理交给下个拦截器。**  

**使用递归的方式，对每个拦截器的request进行处理传递。**  
**通过promise的then方法，对response进行处理传递。**
