export class Foo {

    public baz: string = 'foo'

    public foo(): string {
        return 'bar'
    }

    public asyncFoo(): Promise<string> {
        return Promise.resolve('async bar')
    }

    public bar(): string {
        return 'baz'
    }

    public identity(...args: any[]) {
        return args
    }

    public raise(err: Error) {
        throw err
    }

}
