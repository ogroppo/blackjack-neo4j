import test from 'ava';
require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

test('Every card has a hit', async t => {
  let scores = await new Neo4jQuery()
  .match({$: 'PlayerScore', label: 'PlayerScore'})
  .where(
    [
      {$: 'PlayerScore', type: 'soft'},
      'OR',
      {$: 'PlayerScore', type: 'hard'},
    ],
    'AND',
    {$: 'PlayerScore', value: {'<=': 21}},
    'AND NOT',
    ['PlayerScore',':player{move:"hit"}','']
  )
  .return('PlayerScore')
  .log()
  .fetch()  

	t.is(scores.length, 0)
});

test('Every bust has no hit', async t => {
  let hits = await new Neo4jQuery()
  .match({$: 'PlayerScore', label: 'PlayerScore', type: "bust"})
  .match(['PlayerScore','r:player{move:"hit"}',''])
  .return('r')
  .fetch()

	t.is(hits.length, 0)
});