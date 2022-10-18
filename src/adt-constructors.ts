type PickTU<T, D extends keyof T, K> = T extends { [DK in D]: K } ? T : never

type Some<A> = { _tag: 'Some'; value: A }
type None = { _tag: 'None' }
export type Option<A> = Some<A> | None

export const some = <A>(a: A): Some<A> => ({ _tag: 'Some', value: a })
export const none: None = { _tag: 'None' }

type MakeConstructors = <D extends PropertyKey>(
	d: D,
) => <T extends { [DK in D]: string }>() => {
	<SimpleConstructors extends ReadonlyArray<T[D]>>(
		simpleConstructors: [T[D]] extends [SimpleConstructors[number]]
			? SimpleConstructors
			: never,
	): {
		[K in T[D]]: Omit<PickTU<T, D, K>, D> extends infer O
			? [keyof O] extends [never]
				? () => PickTU<T, D, K>
				: (data: O) => PickTU<T, D, K>
			: never
	}

	<
		SimpleConstructors extends ReadonlyArray<T[D]>,
		SmartConstructors extends {
			[K in Exclude<T[D], SimpleConstructors[number]>]: (
				data: Omit<PickTU<T, D, K>, D>,
			) => Option<Omit<PickTU<T, D, K>, D>>
		},
	>(
		simpleConstructors: SimpleConstructors,
		smartConstructors: SmartConstructors,
	): {
		[K in SimpleConstructors[number]]: Omit<PickTU<T, D, K>, D> extends infer O
			? [keyof O] extends [never]
				? () => PickTU<T, D, K>
				: (data: O) => PickTU<T, D, K>
			: never
	} & {
		[K in keyof SmartConstructors]: (
			data: Omit<PickTU<T, D, K>, D>,
		) => Option<PickTU<T, D, K>>
	}
}

export const makeConstructors: MakeConstructors = (d) => () =>
	((simple: any, smart: any) =>
		Object.keys(smart ?? {}).reduce(
			(co, key) => ({
				...co,
				[key]: (args: any) => {
					const constructed = smart[key](args)
					if (constructed._tag === 'Some') {
						return some({ [d]: key, ...constructed.value })
					}
					return constructed
				},
			}),
			simple.reduce(
				(co: any, key: any) => ({
					...co,
					[key]: (data: any) => ({ [d]: key, ...data }),
				}),
				{},
			),
		)) as any

export const constructors = makeConstructors('_type')
