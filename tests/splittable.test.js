import test from 'ava';
require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

test('splittable', async t => {
  let allscores = await new Neo4jQuery()
  .match({$: 'score'})
  .where({$: 'score', splittable: {'>': 0}})
  .return('score')
  .orderBy('score.value')
  .fetchRows('score')

	t.is(allscores.length, 10)
	t.is(allscores[0].value, 4)
  t.is(allscores[9].value, 20)
  
  let twelveScores = await new Neo4jQuery()
  .match({$: 'score', value: 12})
  .where({$: 'score', splittable: {'>': 0}})
  .return('score')
  .orderBy('score.splittable')
  .fetchRows('score')

	t.is(twelveScores.length, 2)
	t.is(twelveScores[0].splittable, 6)
	t.is(twelveScores[1].splittable, 11)
});

test('no splittable has no split next', async t => {
  let count = await new Neo4jQuery()
  .match({$: 'score', splittable: 0})
  .match(['score', 'move:player{move:"split"}', 'next'])
  .return('count(move) as count')
  .fetchRow('count')

	t.is(count, 0)
});