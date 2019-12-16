require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

module.exports = async function hitProbs(){
  const start = new Date()
  try {
    await new Neo4jQuery()
    .match('(PlayerScore:PlayerScore)')
    .where(['PlayerScore',':player{move:"hit"}',''])
    .match({$: 'DealerScore', label: 'DealerScore'})
    .where('(:DealerScore{value:0})-[:dealer]->(DealerScore)')
    .match([
      'PlayerScore',
      'card:player{move:"hit"}',
      'NextScore',
      'nextProbRel:probs', 
      'DealerScore'
    ])
    .with('sum(card.p * nextProbRel.standAdv) as hitAdv, PlayerScore, DealerScore')
    .match(['PlayerScore', 'probRel:probs', 'DealerScore']) 
    .set('probRel.hitAdv = hitAdv')
    .log()
    .run()
        
  } catch (e) {
    console.error(e);
  }

  console.log("Hit probs computed in", (new Date() - start)/1000, 'seconds');
}