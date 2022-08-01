import { workerProxy } from '../src/workerProxy'
import { Foo } from './Foo'

describe('workerProxy', async () => {
    const WORKER_PATH = 'base/build/foo.worker.js'
    const expectedFoo = new Foo()

    it('should call worker', async () => {
        const foo = await workerProxy<Foo>(WORKER_PATH)
        expect(await foo.foo()).to.be(expectedFoo.foo())
    })

    it('should get property value', async () => {
        const foo = await workerProxy<Foo>(WORKER_PATH)
        const res: string = await foo.baz()

        expect(res).to.be(expectedFoo.baz)
    })

    it('should call async worker method', async () => {
        const foo = await workerProxy<Foo>(WORKER_PATH)
        const res: string = await foo.asyncFoo()

        expect(res).to.be(await expectedFoo.asyncFoo())
    })

    it('should call worker multiple times', async () => {
        const foo = await workerProxy<Foo>(WORKER_PATH)
        const res = await Promise.all([
            foo.foo(),
            foo.bar(),
            foo.foo(),
        ])

        expect(res).to.eql([
            expectedFoo.foo(),
            expectedFoo.bar(),
            expectedFoo.foo(),
        ])
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

        expect(res).to.eql(expectedFoo.identity(...args))
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

    it('it should throw error straight from the worker', async () => {
        const foo = await workerProxy<Foo>(WORKER_PATH)
        const errMessage = 'Inner error message'
        let error = null;

        try {
            await foo.raise(new Error(errMessage))
        } catch(err) {
            error = err

            expect(err.message).to.equal(`Error: ${errMessage}`)
        }

        expect(error).to.not.be(null)
    })
})
