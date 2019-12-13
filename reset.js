require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

module.exports = async function reset(){
  await new Neo4jQuery()
  .optionalMatch({$: 'Card', label: 'Card'})
  .optionalMatch({$: 'PlayerScore', label: 'PlayerScore'})
  .optionalMatch({$: 'DealerScore', label: 'DealerScore'})
  .detachDelete('Card, PlayerScore, DealerScore')
  .run()
}