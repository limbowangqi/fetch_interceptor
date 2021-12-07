import HxRequest from '../request/HxRequest'

// 责任链
export default interface Chain {

  getRequest:() => HxRequest

  proceed:(request: HxRequest) => Promise<Response>

}