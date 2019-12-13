require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

async function standProbs(){
  const start = new Date()
  try {
    await new Neo4jQuery()
    .match({$: 'PlayerScore', label: 'PlayerScore'})
    .where(
      {$: 'PlayerScore', value: {'<=': 21}},
      'AND',
      {$: 'PlayerScore', withCards: {'>=': 2}}
    )
    .match({$: 'DealerScore', label: 'DealerScore'})
    .where('(:DealerScore{value:0})-[:dealer]->(DealerScore)')
    //loseP
    .optionalMatch([
      'DealerScore',
      'dealerCards:dealer*',
      'f',
    ])
    .where({$: 'f', value: {'>': '$PlayerScore.value'}}, 'AND', {$: 'f', value: {'>=': 17}}, 'AND', {$: 'f', value: {'<=': 21}})
    .with('sum(reduce(p = 1, card in dealerCards | p * card.p)) as loseP, PlayerScore, DealerScore')    
    //winP
    .optionalMatch([
      'DealerScore',
      'dealerCards:dealer*',
      {$: 'f', label: 'DealerScore'},
    ])
    .where([{$: 'f', value: {'>=': 17}}, 'AND', {$: 'f', value: {'<': '$PlayerScore.value'}}], 'OR', {$: 'f', value: {'>': 21}})
    .with('sum(reduce(p = 1, card in dealerCards | p * card.p)) as winP, loseP, PlayerScore, DealerScore')
    //
    .merge(['PlayerScore', 'probRel:stand', 'DealerScore'])
    .set('probRel.adv = (winP - loseP)')
    .log()
    .run()

    await new Neo4jQuery()
    .match({$: 'PlayerScore', label: 'PlayerScore'})
    .where({$: 'PlayerScore', value: {'>': 21}})
    .match({$: 'DealerScore', label: 'DealerScore'})
    .where('(:DealerScore{value:0})-[:dealer]->(DealerScore)')
    .merge(['PlayerScore', 'probRel:stand', 'DealerScore'])
    .set('probRel.adv = -1')
    .log("Bust probs")
    .run()

    //bj exeption
    await new Neo4jQuery()
    .match({$: 'PlayerScore', label: 'PlayerScore', type: 'blackJack'})
    .match({$: 'DealerScore', label: 'DealerScore'})
    .where('(:DealerScore{value:0})-[:dealer]->(DealerScore)')
    //loseP
    .with('0 as loseP, PlayerScore, DealerScore')
    //drawP
    .optionalMatch([
      'DealerScore',
      'card:dealer',
      'f',
    ])
    .where({$: 'f', value: '$PlayerScore.value'})
    .with('COALESCE(card.p, 0) as drawP, loseP, PlayerScore, DealerScore')
    //winP
    .with('1 - drawP - loseP as winP, loseP, PlayerScore, DealerScore')
    .merge(['PlayerScore', 'probRel:stand', 'DealerScore'])
    .set('probRel.adv = (winP - loseP)')
    .log()
    .run()
    
    
  } catch (e) {
    console.error(e);
  }

  console.log("Stand probs computed in", (new Date() - start)/1000, 'seconds');
}

standProbs()