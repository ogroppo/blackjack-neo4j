import test from 'ava';
require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

test('Only one Score clause no args', async t => {
  let scores = await new Neo4jQuery()
  .match({$: 'score', type: 'blackJack'})
  .return('score')
  .fetch()

	t.is(scores.length, 1)
});

test('2 scores before', async t => {
  let prevScores = await new Neo4jQuery()
  .match({$: 'blackJack', type: 'blackJack'})
  .match([{$: 'p'}, 'prev:PlayerScore', 'card:player', 'blackJack'])
  .return('prev')
  .fetch()

	t.is(prevScores.length, 2)
});

test('No hits after blackjack', async t => {
  let nextScores = await new Neo4jQuery()
  .match({$: 'score', type: 'blackJack'})
  .match(['score', 'r:player{move:"hit"}', ':PlayerScore'])
  .return('r')
  .fetch()

	t.is(nextScores.length, 0)
});