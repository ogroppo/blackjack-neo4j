import test from 'ava';
require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

test('Add to 1', async t => {
  let sums = await new Neo4jQuery()
  .match([
    {$: 'score', type: 'final'},
    {$: 's', type: 'probs'},
    {}
  ])
  .with('round((s.winP + s.drawP + s.loseP) * 100000)/100000 as sum')
  .return('sum')
  .fetch('sum')

	t.is(sums.every(sum => sum === 1), true)
});