export default class PendingPromise implements Promise<any> {
    constructor(resolve?: Function, reject?: Function);
    finally(onfinally?: (() => void) | null): Promise<any>;
    [Symbol.toStringTag]: string;
    static from(fn: Function): PendingPromise;
    static resolve(value: any): PendingPromise;
    static reject(error: Error): PendingPromise;
    then(onFulfilled: any, onRejected: never): any;
    catch(onRejected: never): any;
}
