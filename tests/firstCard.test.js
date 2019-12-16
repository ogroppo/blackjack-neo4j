import test from 'ava';
require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

test('First card', async t => {
  let scores = await new Neo4jQuery()
  .match({$: 'score', withCards: 1})
  .return('score.value as value')
  .orderBy('value')
  .fetchRows('value')

	t.is(scores.length, 10)
	t.is(scores[0], 2)
	t.is(scores[9], 11)
});