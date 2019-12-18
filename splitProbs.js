require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

module.exports = async function splitProbs(){
  const start = new Date()
  try {
    await new Neo4jQuery()
    .match({$: 'PlayerScore', label: 'PlayerScore'})
    .where({$: 'PlayerScore', splittable: {'>': 0}})
    .match({$: 'DealerScore', label: 'DealerScore'})
    .where('({value:0})-[:dealer]->(DealerScore)')
    .match([
      'PlayerScore',
      'card:player{move:"split"}',
      'SplitScore',
      'splitProb:probs', 
      'DealerScore'
    ])
    .with('sum(card.p * splitProb.standAdv)*2 as splitAdv, PlayerScore, DealerScore')    
    .match(['PlayerScore', 'probRel:probs', 'DealerScore'])
    .set('probRel.splitAdv = splitAdv')
    .run()
        
  } catch (e) {
    console.error(e);
  }

  console.log("Split probs computed in", (new Date() - start)/1000, 'seconds');
}