import { Message, MessageType } from './protocol'

export async function run<T>(init: () => Promise<T>) {
    const target = await init()

    async function processRequest(request: Message) {
        const { id, body } = request

        let result = null
        let error: Error | null = null

        try {
            const prop = (target as any)[body.method]

            if (typeof prop === 'function') {
                result = await (
                    Promise.resolve()
                        .then(() => (target as any)[body.method](...body.args))
                )
            } else {
                result = prop
            }
        } catch (err: any) {
            error = err
        } finally {
            let reply = null

            if (error === null) {
                reply = {
                    type: MessageType.ResponseSuccess,
                    body: result,
                }
            } else {
                reply = {
                    type: MessageType.ResponseFailure,
                    body: error.toString(),
                }
            }

            self.postMessage({ id, ...reply })
        }
    }

    self.onmessage = (evt) => {
        processRequest(evt.data)
    }

    self.postMessage({
        id: 0,
        type: MessageType.ResponseWorkerReady,
        body: {},
    })
}
