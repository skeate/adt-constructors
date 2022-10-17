type Foo = { tag: 'bar'; value: number } | { tag: 'baz'; value: string }
type Foo2 = { _tag: 'bar'; zot: string } | { _tag: 'baz'; value: string }
type Foo3 = { _tag: 'bar'; value: string } | { _tag: 'baz'; value: string }

type PickTU<T, D extends keyof T, K> = T extends { [DK in D]: K } ? T : never

type MakeConstructors = <D extends string>(
	d: D,
) => <T extends { [DK in D]: string }>() => <
	C extends {
		[K in T[D]]: (data: Omit<PickTU<T, D, K>, D>) => Omit<PickTU<T, D, K>, D>
	},
>(
	c: C,
) => {
	[K in keyof C]: (data: Omit<PickTU<T, D, K>, D>) => PickTU<T, D, K>
}

export const makeConstructors: MakeConstructors = (d) => () => (c) =>
	Object.keys(c).reduce(
		(co, key) => ({
			...co,
			[key]: (args: any) => ({ ...c[key as keyof typeof c](args), [d]: key }),
		}),
		{},
	) as any

export const constructors = makeConstructors('_type')
