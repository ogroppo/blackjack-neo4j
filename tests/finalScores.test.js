import test from 'ava';
require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

test('Final Scores card', async t => {
  let scores = await new Neo4jQuery()
  .match({$: 'score', type: 'final'})
  .return('score.value as value')
  .orderBy('value')
  .fetch('value')

	t.is(scores.length, 29)
	t.is(scores[0], 4)
  t.is(scores[28], 31)
  
  let blackJackCount = await new Neo4jQuery()
  .match({$: 'score', type: 'final', blackJack: true})
  .return('count(score) as count')
  .fetchOne('count')

	t.is(blackJackCount, 1)
});

test('Busts', async t => {
  let scores = await new Neo4jQuery()
  .match({$: 'score', label: 'PlayerScore', type: 'bust'})
  .return('score.value as value')
  .orderBy('value')
  .log()
  .fetch('value')

	t.is(scores.length, 10)
	t.is(scores[0], 22)
	t.is(scores[9], 31)
});

test('Busts Dealer', async t => {
  let scores = await new Neo4jQuery()
  .match({$: 'score', label: 'DealerScore', type: 'bust'})
  .return('score.value as value')
  .orderBy('value')
  .log()
  .fetch('value')

	t.is(scores.length, 5)
	t.is(scores[0], 22)
	t.is(scores[4], 26)
});