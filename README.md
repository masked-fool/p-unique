# p-unique
> 重复调用时，仅创建一次 promise，并执行其相关的副作用操作。
>避免同类型的副作用重复操作，若前一次 promise 的副作用操作未执行完，仍旧处于 pending，此时重复调用也不会重新创建 promise，从而避免了执行相同的操作错误情况.
## 常用的业务场景
1. 前一次请求A未响应之前，不会发起第二次请求A，也即防重复请求，比使用 axios 的cancelToken 取消请求更好，因为我们根本没有做一个新的请求，更加符合业务场景。
2. 防止重复 setData 等
> 任何你想避免重复执行的逻辑，都可以使用 function 处理并返回对应的 promise，交给该库处理。

```ts
import pUnique from 'p-unique'

// vue methods
bindTap: pUnique(()=> {
  // do side effects
  return io.get('testUrl').then().catch()
})

// function
const somethingFetch = ()=> {
  const debounceFetch = pUnique(()=> {
    // do side effects
    return io.get('testUrl').then().catch()
  },
  {debouncedMilliseconds: 1000}
  )
  debounceFetch()
}

```
