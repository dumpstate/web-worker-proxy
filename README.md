# web-worker-proxy

Web worker proxy for JavaScript objects.

## Installation

Package is published to GitHub Packages NPM registry. Add to your `.npmrc`:

```
@dumpstate:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<GITHUB_TOKEN_WITH_READ_PACKAGES_SCOPE>
```

install package:

```
npm install @dumpstate/web-worker-proxy --save
```

## Usage

1. Define and build _Worker_ script.

```ts
import { run } from '@dumpstate/web-worker-proxy'
import { Foo } from '...'

run(async () => {
    // NB construct an object to be 'run' on the Worker.
    //    e.g. load WASM file.
    return new Foo()
})
```

Use your favourite build tool, to bundle the script.

2. Create worker proxy.

```ts
import { ProxyType, workerProxy } from '@dumpstate/web-worker-proxy'
import { Foo } from '...'

const foo: ProxyType<Foo> = await workerProxy<Foo>('/path/to/worker/script.js')

// NB ProxyType<Foo> is a type mapping, that for all:
//    - properties, turn them into `() => Promise<T>` functions,
//    - functions, turn them into `(...args) => Promise<ReturnType<T>>` async functions.
```

`foo` is a [_Proxy_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), that sends a message to a dedicated [_Worker_](https://developer.mozilla.org/en-US/docs/Web/API/Worker) and resolves appropriate response.
