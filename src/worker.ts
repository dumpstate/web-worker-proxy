import { Message, MessageType } from './protocol'

export async function run<T>(init: () => Promise<T>) {
    const target = await init()
    const requests: Message[] = []
    let running: Promise<void> | null = null

    async function processRequest(request: Message) {
        const { id, body } = request

        let result = null
        let error: Error | null = null

        try {
            result = await (
                Promise.resolve()
                    .then(() => (target as any)[body.method](...body.args))
            )
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

    async function start() {
        while (requests.length) {
            const request = requests.shift()
            if (!request) { break }

            await processRequest(request)
        }
    }

    self.onmessage = (evt) => {
        requests.push(evt.data)

        if (!running) {
            running = start().finally(() => {
                running = null
            })
        }
    }

    self.postMessage({
        id: 0,
        type: MessageType.ResponseWorkerReady,
        body: {},
    })
}
