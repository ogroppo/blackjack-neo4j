import test from 'ava';
require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')
const nextTypeCase = require('../nextTypeCase')
const nextValueCase = require('../nextValueCase')

test('Check 21s-11', async t => {
  let res = await new Neo4jQuery()
  .with('{value: 21, type: "soft"} as score, {value: 11} as card')
  .with(nextTypeCase, nextValueCase)
  .return('*')
  .fetchOne()

	t.is(res.nextValue, 22)
	t.is(res.nextType, 'bust')
});

test('Check 21h-11', async t => {
  let res = await new Neo4jQuery()
  .with('{value: 21, type: "hard"} as score, {value: 11} as card')
  .with(nextTypeCase, nextValueCase)
  .return('*')
  .fetchOne()

	t.is(res.nextValue, 22)
	t.is(res.nextType, 'bust')
});

test('Check 20h-11', async t => {
  let res = await new Neo4jQuery()
  .with('{value: 20, type: "hard"} as score, {value: 11} as card')
  .with(nextTypeCase, nextValueCase)
  .return('*')
  .fetchOne()

	t.is(res.nextValue, 21)
	t.is(res.nextType, 'hard')
});

test('Check 20s-11', async t => {
  let res = await new Neo4jQuery()
  .with('{value: 20, type: "soft"} as score, {value: 11} as card')
  .with(nextTypeCase, nextValueCase)
  .return('*')
  .fetchOne()

	t.is(res.nextValue, 21)
	t.is(res.nextType, 'soft')
});

test('Check 11s-11', async t => {
  let res = await new Neo4jQuery()
  .with('{value: 11, type: "soft"} as score, {value: 11} as card')
  .with(nextTypeCase, nextValueCase)
  .return('*')
  .fetchOne()

	t.is(res.nextValue, 12)
	t.is(res.nextType, 'soft')
});

test('Check 16s-10', async t => {
  let res = await new Neo4jQuery()
  .with('{value: 16, type: "soft"} as score, {value: 10} as card')
  .with(nextTypeCase, nextValueCase)
  .return('*')
  .fetchOne()

	t.is(res.nextValue, 16)
	t.is(res.nextType, 'hard')
});

test('Check 16h-10', async t => {
  let res = await new Neo4jQuery()
  .with('{value: 16, type: "hard"} as score, {value: 10} as card')
  .with(nextTypeCase, nextValueCase)
  .return('*')
  .fetchOne()

	t.is(res.nextValue, 26)
	t.is(res.nextType, 'bust')
});

test('Check 0h-10', async t => {
  let res = await new Neo4jQuery()
  .with('{value: 0, type: "hard"} as score, {value: 11} as card')
  .with(nextTypeCase, nextValueCase)
  .return('*')
  .fetchOne()

	t.is(res.nextValue, 11)
	t.is(res.nextType, 'soft')
});

test('Check 11s-blackJack', async t => {
  let res = await new Neo4jQuery()
  .with('{value: 11, type: "soft", withCards: 1} as score, {value: 10} as card')
  .with(nextTypeCase, nextValueCase)
  .return('*')
  .fetchOne()

	t.is(res.nextValue, 21)
	t.is(res.nextType, 'blackJack')
});

test('Check 11s-10', async t => {
  let res = await new Neo4jQuery()
  .with('{value: 11, type: "soft", withCards: 3} as score, {value: 10} as card')
  .with(nextTypeCase, nextValueCase)
  .return('*')
  .fetchOne()

	t.is(res.nextValue, 21)
	t.is(res.nextType, 'soft')
});

test('Check 10s-11', async t => {
  let res = await new Neo4jQuery()
  .with('{value: 10, type: "soft", withCards: 3} as score, {value: 11} as card')
  .with(nextTypeCase, nextValueCase)
  .return('*')
  .fetchOne()

	t.is(res.nextValue, 21)
	t.is(res.nextType, 'soft')
});

test('Check 10-blackJack', async t => {
  let res = await new Neo4jQuery()
  .with('{value: 10, type: "hard", withCards: 1} as score, {value: 11} as card')
  .with(nextTypeCase, nextValueCase)
  .return('*')
  .fetchOne()

	t.is(res.nextValue, 21)
	t.is(res.nextType, 'blackJack')
});