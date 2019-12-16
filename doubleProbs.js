require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

async function doubleProbs(){
  const start = new Date()
  try {
    await new Neo4jQuery()
    .match({$: 'PlayerScore', label: 'PlayerScore', withCards: 2})
    .match({$: 'DealerScore', label: 'DealerScore'})
    .where('({value:0})-[:dealer]->(DealerScore)')
    .match([
      'PlayerScore',
      {$: 'card', type: 'player', move: "hit"},
      'NextScore',
      'nextProbRel:probs', 
      'DealerScore'
    ])
    .with('sum(card.p * nextProbRel.standAdv)*2 as doubleAdv, PlayerScore, DealerScore')
    .match(['PlayerScore', 'probRel:probs', 'DealerScore']) 
    .set('probRel.doubleAdv = doubleAdv')
    .log()
    .run()
        
  } catch (e) {
    console.error(e);
  }

  console.log("Double probs computed in", (new Date() - start)/1000, 'seconds');
}

module.exports = doubleProbs