import { Message, MessageType } from './protocol'
import { idGenerator } from './utils'

const WORKER_READY_REQUEST_ID = 0
const DEFAULT_OPTS = {
    loadTimeout: 5000,
}

type CallablePropNames<T> = {
    [k in keyof T]: T[k] extends Function ? k : never
}[keyof T]

type CallableProps<T> = Pick<T, CallablePropNames<T>>

export type ProxyType<T> = {
    [k in keyof CallableProps<T>]: T[k] extends (...args: any[]) => any ? (...args: Parameters<T[k]>) => Promise<ReturnType<T[k]>> : never
}

export interface WorkerProxyOpts {
    readonly loadTimeout: number
}

export async function workerProxy<T>(path: string, opts: WorkerProxyOpts = DEFAULT_OPTS): Promise<ProxyType<T>> {
    const requests = new Map()
    const ready = new Promise((resolve, reject) => {
        requests.set(WORKER_READY_REQUEST_ID, [resolve, reject])
    })
    const { loadTimeout } = opts
    const worker = new Worker(path)

    const nextId = idGenerator()

    worker.onmessage = (evt) => {
        const { id, type, body } = (evt.data as Message)
        const cbks = requests.get(id)
        if (cbks === null) {
            return
        }

        const [resolve, reject] = cbks

        requests.delete(id)

        switch (type) {
            case MessageType.ResponseWorkerReady:
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
                })
            }
        }
    })

    setTimeout(() => {
        const cbks = requests.get(WORKER_READY_REQUEST_ID)
        if (!cbks) { return }
        const [_, reject] = cbks

        reject(new Error('Worker failed to load'))
    }, loadTimeout)

    await ready

    return proxy
}
