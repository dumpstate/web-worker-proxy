import { Message, MessageType } from './protocol'
import { idGenerator, isNumber } from './utils'

export interface WorkerProxyOpts {
    requestTimeout?: number
}

type CallablePropNames<T> = {
    [k in keyof T]: T[k] extends Function ? k : never
}[keyof T]

type CallableProps<T> = Pick<T, CallablePropNames<T>>

export type ProxyType<T> = {
    [k in keyof CallableProps<T>]: T[k] extends (...args: any[]) => any ? (...args: Parameters<T[k]>) => Promise<ReturnType<T[k]>> : never
}

export async function workerProxy<T>(path: string, opts: WorkerProxyOpts): Promise<ProxyType<T>> {
    const requests = new Map()
    const ready = new Promise((resolve, reject) => {
        requests.set(0, [resolve, reject])
    })
    const worker = new Worker(path)
    const nextId = idGenerator()
    const { requestTimeout } = opts

    worker.onmessage = (evt) => {
        const { id, type, body } = (evt.data as Message)
        const cbks = requests.get(id)
        if (cbks === null) {
            return
        }

        const [resolve, reject] = cbks

        requests.delete(id)

        switch (type) {
            case MessageType.ResponseSuccess:
                resolve(body)
                break
            case MessageType.ResponseFailure:
                reject(new Error(`Failure from worker: ${body.toString()}`))
                break
            default:
                reject(new Error(`Unsupported message type: ${type}`))
                break
        }
    }

    function timeout(id: number): void {
        const request = requests.get(id)
        if (request === null) {
            return
        }

        const [_, reject] = request

        requests.delete(id)
        reject(new Error('Request timed out'))
    }

    const proxy = new Proxy<ProxyType<T>>({} as any, {
        get(obj: ProxyType<T>, method: string) {
            if (method === 'then') {
                return Promise.resolve(obj)
            }

            return (...args: any[]) => {
                const reqId = nextId()

                return new Promise((resolve, reject) => {
                    requests.set(reqId, [resolve, reject])

                    worker.postMessage({
                        id: reqId,
                        type: MessageType.Request,
                        body: {
                            method,
                            args,
                        },
                    } as Message)

                    if (isNumber(requestTimeout)) {
                        setTimeout(() => timeout(reqId), requestTimeout)
                    }
                })
            }
        }
    })

    await ready

    return proxy
}
