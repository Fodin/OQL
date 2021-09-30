import { oql } from '../src';

describe('Set tests', () => {
  test('Test for empty arguments', () => {
    expect(oql([], { test: '2' })).toStrictEqual({ test: '2' });
  });

  test('Test set primitive to property', () => {
    expect(oql(['set first', 1], { first: 0 })).toStrictEqual({ first: 1 });
  });

  test('Test set primitive to deep nested property', () => {
    expect(oql(['set first.second.third', 1], { first: { second: { third: 0 } } })).toStrictEqual({
      first: { second: { third: 1 } },
    });
  });

  test('Test set property', () => {
    expect(oql(['set first', { odin: 1 }], { first: 0 })).toStrictEqual({ first: { odin: 1 } });
  });

  test('Test set replaces old values', () => {
    expect(oql(['set first', { odin: 1 }], { first: { odin: 0, dva: 2 } })).toStrictEqual({
      first: { odin: 1 },
    });
  });

  test('Test set primitive by name', () => {
    expect(oql(['set first.id=abc', 1], { first: [{ id: 'abc' }, { id: 'bcd' }] })).toStrictEqual({
      first: [1, { id: 'bcd' }],
    });
  });

  test('Test set property by name 1', () => {
    expect(
      oql(['set first.id=abc', { odin: 1 }], { first: [{ id: 'abc' }, { id: 'bcd' }] }),
    ).toStrictEqual({ first: [{ odin: 1 }, { id: 'bcd' }] });
  });

  test('Test set property by name 2', () => {
    expect(
      oql(['set first.id=abc', { id: 'abc', odin: 1 }], { first: [{ id: 'abc' }, { id: 'bcd' }] }),
    ).toStrictEqual({ first: [{ id: 'abc', odin: 1 }, { id: 'bcd' }] });
  });

  test('Test set property by index', () => {
    expect(
      oql(['set first.0', { odin: 1 }], { first: [{ id: 'abc' }, { id: 'bcd' }] }),
    ).toStrictEqual({ first: [{ odin: 1 }, { id: 'bcd' }] });
  });

  test('Test set property by negative index', () => {
    expect(
      oql(['set first.-2', { odin: 1 }], { first: [{ id: 'abc' }, { id: 'bcd' }] }),
    ).toStrictEqual({ first: [{ odin: 1 }, { id: 'bcd' }] });
  });

  test('Test set property by name 3', () => {
    expect(
      oql(['set first.id=abc.third', { odin: 1 }], {
        first: [{ id: 'abc', third: 1 }, { id: 'bcd' }],
      }),
    ).toStrictEqual({ first: [{ id: 'abc', third: { odin: 1 } }, { id: 'bcd' }] });
  });
});

describe('Add tests', () => {
  test('Test add primitive to property', () => {
    expect(oql(['add first', 1], { first: 0 })).toStrictEqual({ first: 1 });
  });

  test('Test add property', () => {
    expect(oql(['add first', { odin: 1 }], { first: 0 })).toStrictEqual({ first: { odin: 1 } });
  });

  test('Test add property saves old values', () => {
    expect(oql(['add first', { odin: 1 }], { first: { odin: 0, dva: 2 } })).toStrictEqual({
      first: { odin: 1, dva: 2 },
    });
  });

  test('Test add to empty property', () => {
    expect(oql(['add first', { odin: 1 }], { first: {} })).toStrictEqual({ first: { odin: 1 } });
  });

  test('Test add to empty object', () => {
    expect(oql(['add first', { odin: 1 }], {})).toStrictEqual({ first: { odin: 1 } });
  });

  test('Test add primitive by name', () => {
    expect(() => {
      oql(['add first.id=abc', 1], { first: [{ id: 'abc' }, { id: 'bcd' }] });
    }).toThrowError('You cannot merge array or primitive to object');
  });

  test('Test add primitive to array of primitives', () => {
    expect(() => {
      oql(['add first.id=abc', 1], { first: [1, 2] });
    }).toThrowError("Prop or value id=abc hasn't been found");
  });

  test('Test add property by name 1', () => {
    expect(
      oql(['add first.id=abc', { odin: 1 }], { first: [{ id: 'abc' }, { id: 'bcd' }] }),
    ).toStrictEqual({ first: [{ id: 'abc', odin: 1 }, { id: 'bcd' }] });
  });

  test('Test add property by name 2', () => {
    expect(
      oql(['add first.id=abc', { id: 'abc', odin: 1 }], { first: [{ id: 'abc' }, { id: 'bcd' }] }),
    ).toStrictEqual({ first: [{ id: 'abc', odin: 1 }, { id: 'bcd' }] });
  });

  test('Test add property by index', () => {
    expect(
      oql(['add first.0', { odin: 1 }], { first: [{ id: 'abc' }, { id: 'bcd' }] }),
    ).toStrictEqual({ first: [{ id: 'abc', odin: 1 }, { id: 'bcd' }] });
  });

  test('Test add property by negative', () => {
    expect(
      oql(['add first.-2', { odin: 1 }], { first: [{ id: 'abc' }, { id: 'bcd' }] }),
    ).toStrictEqual({ first: [{ id: 'abc', odin: 1 }, { id: 'bcd' }] });
  });
});
