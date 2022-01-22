import PendingPromise from './p-pending'
import isEqual from 'licia/isEqual'
interface INTERFACE_UNIQUE_PROMISE<T> extends Promise<T> {
  payload ?: any[]
  executor ?: string
  debouncedTimer ?: ReturnType<typeof setTimeout>
}
type TYPE_PROMISE_QUEUE = INTERFACE_UNIQUE_PROMISE<any>[]
const pendingPromiseQueue:TYPE_PROMISE_QUEUE = []
const debouncingPromiseQueue :TYPE_PROMISE_QUEUE  = []
const defaultOptions = {
  debouncedMilliseconds: 0,
}
const uselessPromise = new PendingPromise()
const unique = (sideEffectivePromise: Function, options = defaultOptions):Function=>{
  const context:any = this
  options = {...defaultOptions, ...options}
  const {debouncedMilliseconds} = options
  const pickPromise = (queue:TYPE_PROMISE_QUEUE, {executor, payload}):INTERFACE_UNIQUE_PROMISE<any> => {
    return queue.filter(item => {
      if (item.executor === executor && isEqual(item.payload, payload)) {
        return item
      }
    })[0]
  }
  const removeQueueElement = (queue:TYPE_PROMISE_QUEUE, promise) => {
    const spliceIndex = queue.findIndex(
      item => item.executor === promise.executor && isEqual(item.payload, promise.payload)
    )
    if (spliceIndex > -1) {
      queue.splice(spliceIndex, 1)
    }
  }
  const invoke =  function(...payload) {
    const hasEvent:boolean = payload[0].target && payload[0].currentTarget
    if (hasEvent) {
      const exclude:string[] = ['timeStamp']
      exclude.forEach((keyName):void => {
        delete payload[0][keyName]
      })
    }
    const executor:string = sideEffectivePromise.toString()
    const debounced:boolean = debouncedMilliseconds > 0

    if (debounced) {
      const debouncingPromise = pickPromise(debouncingPromiseQueue, {executor, payload})
      if (debouncingPromise.executor) {
        if (debouncingPromise.debouncedTimer) {
          clearTimeout(debouncingPromise.debouncedTimer)
          debouncingPromise.debouncedTimer = setTimeout(
            () => removeQueueElement(debouncingPromiseQueue, debouncingPromise),
            debouncedMilliseconds
          )
        }
        return uselessPromise
      }
    }
    const pendingPromise = pickPromise(pendingPromiseQueue, {executor, payload})
    if (pendingPromise.executor) {
      return uselessPromise
    } else {
      const promise:INTERFACE_UNIQUE_PROMISE<any> = sideEffectivePromise.apply(context, payload)
      promise.executor = executor

      promise.payload = payload
      if (debounced) {
        debouncingPromiseQueue.push(promise)
        promise.debouncedTimer = setTimeout(
          () => removeQueueElement(debouncingPromiseQueue, promise),
          debouncedMilliseconds
        )
      }
      pendingPromiseQueue.push(promise)
      promise
        .then(() => removeQueueElement(pendingPromiseQueue, promise))
        .catch(() => removeQueueElement(pendingPromiseQueue, promise))
      return  promise
    }
  }
  return invoke
}
export default unique