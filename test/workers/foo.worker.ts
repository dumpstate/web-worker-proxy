import { run } from '../../src/worker'

export class Foo {
    public foo(): string { return 'bar' }
    public bar(): string { return 'baz' }
    public identity(...args: any[]) { return args }
}

run<Foo>(async () => new Foo())
