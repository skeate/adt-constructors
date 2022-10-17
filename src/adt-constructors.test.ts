import { constructors, makeConstructors } from './adt-constructors'

type Foo = { _type: 'bar'; value: string } | { _type: 'baz'; value: string }
type Bar = { tag: 'bar'; value: number } | { tag: 'baz'; value: string }
type Baz = { _tag: 'bar'; zot: string } | { _tag: 'baz'; value: string }

const id = <A>(a: A): A => a

describe('adt-constructors', () => {
	it('provides a default that works on _type', () => {
		const Foo = constructors<Foo>()({
			bar: id,
			baz: id,
		})

		expect(Foo.bar({ value: 'a' })).toEqual({ _type: 'bar', value: 'a' })
		expect(Foo.baz({ value: 'b' })).toEqual({ _type: 'baz', value: 'b' })
	})

	it('provides a way to make a constructor-generator that works on a custom discriminant', () => {
		const Bar = makeConstructors('tag')<Bar>()({
			bar: id,
			baz: id,
		})

		expect(Bar.bar({ value: 3 })).toEqual({ tag: 'bar', value: 3 })
		expect(Bar.baz({ value: '3' })).toEqual({ tag: 'baz', value: '3' })

		const Baz = makeConstructors('_tag')<Baz>()({
			bar: id,
			baz: id,
		})

		expect(Baz.bar({ zot: '3' })).toEqual({ _tag: 'bar', zot: '3' })
		expect(Baz.baz({ value: '3' })).toEqual({ _tag: 'baz', value: '3' })
	})
})
