import { run } from '../../src/worker'
import { Foo } from '../Foo'

run(async () => new Foo())
