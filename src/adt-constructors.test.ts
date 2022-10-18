import { constructors, makeConstructors, none, some } from './adt-constructors'

describe('adt-constructors', () => {
	describe('constructors', () => {
		it('does easy simple constructors', () => {
			type Foo =
				| { _type: 'bar'; value: string }
				| { _type: 'baz'; value: string }

			const Foo = constructors<Foo>()(['baz', 'bar'])

			expect(Foo.bar({ value: 'a' })).toEqual({ _type: 'bar', value: 'a' })
			expect(Foo.baz({ value: 'b' })).toEqual({ _type: 'baz', value: 'b' })
		})

		it('allows smart constructors', () => {
			type NumberOrLowercaseString =
				| { _type: 'number'; n: number }
				| { _type: 'lcstr'; s: string }

			const NumberOrLowercaseString = constructors<NumberOrLowercaseString>()(
				['number'],
				{ lcstr: ({ s }) => (s.toLowerCase() !== s ? none : some({ s })) },
			)

			expect(NumberOrLowercaseString.number({ n: 3 })).toEqual({
				_type: 'number',
				n: 3,
			})
			expect(NumberOrLowercaseString.lcstr({ s: 'b' })).toEqual(
				some({ _type: 'lcstr', s: 'b' }),
			)
			expect(NumberOrLowercaseString.lcstr({ s: 'B' })).toEqual(none)
		})
	})

	describe('makeConstructors', () => {
		it('does simple constructors', () => {
			type Foo = { _tag: 'bar'; x: number } | { _tag: 'baz'; y: string }

			const Foo = makeConstructors('_tag')<Foo>()(['bar', 'baz'])

			expect(Foo.bar({ x: 3 })).toEqual({ _tag: 'bar', x: 3 })
			expect(Foo.baz({ y: 'quux' })).toEqual({ _tag: 'baz', y: 'quux' })
		})

		it('allows smart constructors', () => {
			const Tag = Symbol()

			type Zot<A> =
				| { [Tag]: 'A'; a: A }
				| { [Tag]: 'Nat'; nat: number }
				| { [Tag]: 'Nothing' }

			const Zot = <A>() =>
				makeConstructors(Tag)<Zot<A>>()(['A', 'Nothing'], {
					Nat: ({ nat }) =>
						nat >= 0 && Math.floor(nat) === nat ? some({ nat }) : none,
				})

			const ZotString = Zot<string>()

			expect(ZotString.A({ a: 'foo' })).toEqual({ [Tag]: 'A', a: 'foo' })
			expect(ZotString.Nothing()).toEqual({ [Tag]: 'Nothing' })
			expect(ZotString.Nat({ nat: 3.5 })).toEqual(none)
			expect(ZotString.Nat({ nat: -2 })).toEqual(none)
			expect(ZotString.Nat({ nat: 2 })).toEqual(some({ [Tag]: 'Nat', nat: 2 }))
		})
	})
})
