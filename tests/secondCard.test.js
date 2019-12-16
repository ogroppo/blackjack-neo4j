import test from 'ava';
require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

test('Second card', async t => {
  let scores = await new Neo4jQuery()
  .match({$: 'score', withCards: 2})
  .returnDistinct('score.type as type')
  .orderBy('type')
  .fetchRows('type')

	t.is(scores.length, 4)
	t.is(scores[0], 'aceSplit')
	t.is(scores[1], 'blackJack')
	t.is(scores[2], 'hard')
	t.is(scores[3], 'soft')
});