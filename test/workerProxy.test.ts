import { workerProxy } from '../src/workerProxy'
import { Foo } from './workers/foo.worker'

describe('workerProxy', async () => {
    const WORKER_PATH = 'base/build/foo.worker.js'

    it('should call worker', async () => {
        const foo = await workerProxy<Foo>(WORKER_PATH)
        expect(await foo.foo()).to.be('bar')
    })

    it('should call worker multiple times', async () => {
        const foo = await workerProxy<Foo>(WORKER_PATH)
        const res = await Promise.all([
            foo.foo(),
            foo.bar(),
            foo.foo(),
        ])

        expect(res).to.eql(['bar', 'baz', 'bar'])
    })

    it('should pass arguments to worker and return it back', async () => {
        const foo = await workerProxy<Foo>(WORKER_PATH)
        const args = [
            'passing',
            'some',
            'args',
            1234,
            {an: 'object'},
            ['an', 'array', 123],
        ]
        const res = await foo.identity(...args)

        expect(res).to.eql(args)
    })

    it('should timeout if worker fails to load', async () => {
        let error = null
        try {
            await workerProxy<Foo>('invalid-path', {loadTimeout: 500})
        } catch(err) {
            error = err

            expect(err.toString()).to.contain('Worker failed to load')
        }

        expect(error).to.not.be(null)
    })
})
