export default class PendingPromise implements Promise<any> {
  constructor(resolve ?: Function,reject ?: Function) {
  }
  finally(onfinally?: (() => void) | null): Promise<any> {
    throw new Error("Method not implemented.")
  }
  [Symbol.toStringTag]: string
  static from(fn:Function) {
    return new PendingPromise(resolve => {
      resolve(fn())
    })
  }

  static resolve(value) {
    return new PendingPromise(resolve => {
      resolve(value)
    })
  }

  static reject(error:Error) {
    return new PendingPromise((resolve, reject) => {
      reject(error)
    })
  }
  then(onFulfilled:any, onRejected:never) : any{}
  catch(onRejected:never):any {}
}