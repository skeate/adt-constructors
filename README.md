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
[`ts-adt`]) which alleviate some of the pain
of actually declaring the types, but you still need to construct the _values_ on your own.

This library exists to help provide a means to construct values of these types.

## Usage

This library exports two functions: `constructors` and `makeConstructors`. The
first is meant for unions discriminated on the key named `_type` (which is the
default of `ts-adt`). The second allows you to customize this aspect (in fact,
`constructors` is really just `makeConstructors('_type')`).

If your constructors are simple, then you can easily create them by passing an
array of the discriminant key values. This array will offer autocomplete
suggestions if your editor supports that, making the process extremely simple.

```ts
import type { ADT } from 'ts-adt'
import { constructors } from 'adt-constructors'

type Foo = ADT<{
  bar: { value: string };
  baz: {};
}>

const id = <A>(a: A): A => a

const Foo = constructors<Foo>()(['bar', 'baz'])

const bar = Foo.bar({ value: 'zot' })
```

If you want _smart_ constructors which can check the incoming data before
constructing the value, it's a bit more work but it is supported:

```ts
import type { MakeADT } from 'ts-adt'
import { makeConstructors, some, none } from 'adt-constructors'

type Numbers = MakeADT<
  '_tag',
  {
    positive: { num: number };
    int: { int: number };
    float: { float: number };
  }
>

const Numbers =  makeConstructors('_tag')<Numbers>()(['float'], {
  positive: ({ num }) => num > 0 ? some({ num }) : none,
  int: ({ int }) => Math.floor(int) === int ? some({ int }) : none,
})
```

Notice that one of the options in the example above is still a simple
constructor; they can be mixed! However, this is also fully type-checked, so any
tags you don't include in the simple constructor list must be defined in the
smart constructor object.

Note: The `some` function and `none` value are compatible with the [`Option`
type from `fp-ts`][Option]. You do not need to use `fp-ts` to use the type,
though; it is simple enough to just redefine inside this library and avoid the
`fp-ts` dependency. However, `fp-ts` includes a number of utilities that will
probably be useful if you have smart constructors, such as [`fromPredicate`].
The `Option` type is discriminated on its `_tag` key, which will be either
`'Some'` or `'None'`.

### Generics

ADTs with generics aren't very well supported. Unfortunately, Typescript doesn't
yet have a great way to deal with higher-kinded types, so you essentially need
to specify the types in advance:

```ts
import type { ADT } from 'ts-adt'
import { constructors } from 'adt-constructors'

type Either<L, R> = ADT<{
  left: { left: L };
  right: { right: R };
}>

const Either = <L, R>() => constructors<Either<L, R>>()(['left', 'right'])

const EitherNumberString = Either<number, string>()
const num = EitherNumberString.left({ left: 3 })
const str = EitherNumberString.right({ right: 'foo' })
```

Depending on your use case, this might be fine, or you might need to write out
your own constructors. For example, the above might be:

```ts
import type { ADT } from 'ts-adt'
import { constructors } from 'adt-constructors'

type Either<L, R> = ADT<{
  left: { left: L };
  right: { right: R };
}>

const left = <L, R=never>(left: L): Either<L, R> => ({ _type: 'left', left })
const right = <R, L=never>(right: R): Either<L, R> => ({ _type: 'right', right })

const num = left<number, string>(3)
const str = right<string, number>('foo')
```

Check out the [tests](./src/adt-constructors.test.ts) for more examples.

[^1]: See [here](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) for more information.

[`fromPredicate`]: https://gcanti.github.io/fp-ts/modules/Option.ts.html#frompredicate
[Option]: https://gcanti.github.io/fp-ts/modules/Option.ts.html
[`ts-adt`]: https://github.com/pfgray/ts-adt
