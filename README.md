## adt-constructors

It is useful in Typescript to have union types distinguished by some particular
shared property, called a "discriminant"[^1]. For example, in the following:

```ts
type Foo = { tag: 'bar', value: string } | { tag: 'baz' }
```

The property `tag` is shared among all possible values of `Foo`, but its value
differs. Given a value of type `Foo`, you can know whether or not it has a
`value` property by checking if its `tag` property equals `'bar'`.

```ts
declare const foo: Foo

if (foo.tag === 'bar') {
  console.log(foo.value) // typescript knows foo.value here is a string
}
```

This pattern is extremely common, but requires a fair amount of boilerplate to
actually implement. There are some libraries (for example,
[`ts-adt`](https://github.com/pfgray/ts-adt)) which alleviate some of the pain
of actually declaring the types.

This library exists to help provide a means to actually construct _values_ of
these types.

## Usage

This library exports two functions: `constructors` and `makeConstructors`. The
first is meant for unions discriminated on the key named `_type` (which is the
default of `ts-adt`). The second allows you to customize this aspect (in fact,
`constructors` is really just `makeConstructors('_type')`)

```ts
import type { ADT } from 'ts-adt'
import { constructors } from 'adt-constructors'

type Foo = ADT<{
  bar: { value: string };
  baz: {};
}>

const id = <A>(a: A): A => a

const Foo = constructors<Foo>()({
  bar: id,
  baz: id,
})

const bar = Foo.bar({ value: 'zot' })
```

In most cases, you can set the value of the constructor objects to the identity
function, as shown above. The function receives as an argument all the data in
the target object except the actual tag property, and should return data of the
same shape. An example that doesn't use `id`:

```ts
import type { MakeADT } from 'ts-adt'
import { makeConstructors } from 'adt-constructors'

type Either<L, R> = MakeADT<
  '_tag',
  {
    left: { left: L };
    right: { right: R };
  }
>

const Either = <L, R>() => makeConstructors('_tag')<Either<L, R>>()({
  left: ({ left }) => ({ left }),
  right: ({ right }) => ({ right }),
})
```


[^1]: See [here](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) for more information.
