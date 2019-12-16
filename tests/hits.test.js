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
  .fetchRows()

	t.is(scores.length, 0)
});