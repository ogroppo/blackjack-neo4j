require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

module.exports = async function standProbs(){
  const start = new Date()
  try {
    console.log("Doing stand probs");
    await new Neo4jQuery()
    .match({$: 'PlayerScore', label: 'PlayerScore', type: "final"})
    .where({$: 'PlayerScore', value: {'<=': 21}})
    .match({$: 'DealerScore', label: 'DealerScore'})
    .where('({value:0})-[:dealer]->(DealerScore)')
    //loseP
    .optionalMatch([
      'DealerScore',
      'dealerCards:dealer*',
      'f',
    ])
    .where({$: 'f', value: {'>': '$PlayerScore.value'}}, 'AND', {$: 'f', value: {'>=': 17}}, 'AND', {$: 'f', value: {'<=': 21}})
    .with('sum(reduce(p = 1, card in dealerCards | p * card.p)) as loseP, PlayerScore, DealerScore')    
    //drawP
    .optionalMatch([
      'DealerScore',
      'dealerCards:dealer*',
      'f',
    ])
    .where({$: 'f', value: '$PlayerScore.value'}, 'AND', {$: 'f', value: {'>=': 17}})
    .with('sum(reduce(p = 1, card in dealerCards | p * card.p)) as drawP, loseP, PlayerScore, DealerScore')    
    //winP
    .optionalMatch([
      'DealerScore',
      'dealerCards:dealer*',
      {$: 'f', label: 'DealerScore'},
    ])
    .where([{$: 'f', value: {'>=': 17}}, 'AND', {$: 'f', value: {'<': '$PlayerScore.value'}}], 'OR', {$: 'f', value: {'>': 21}})
    .with('sum(reduce(p = 1, card in dealerCards | p * card.p)) as winP, drawP, loseP, PlayerScore, DealerScore')
    //
    .merge(['PlayerScore', 'probRel:probs', 'DealerScore'])
    .set('probRel.adv = (winP - loseP), probRel.winP = winP, probRel.loseP = loseP, probRel.drawP = drawP')
    .run()

    console.log("Doing bust probs");

    //Bust case
    await new Neo4jQuery()
    .match({$: 'PlayerScore', label: 'PlayerScore', type: "final"})
    .where({$: 'PlayerScore', value: {'>': 21}})
    .match({$: 'DealerScore', label: 'DealerScore'})
    .where('({value:0})-[:dealer]->(DealerScore)')
    .merge(['PlayerScore', 'probRel:probs', 'DealerScore'])
    .set('probRel.adv = -1, probRel.winP = 0, probRel.loseP = 1, probRel.drawP = 0')
    .run()

    console.log("Doing blackjack probs");

    //blackJack case
    await new Neo4jQuery()
    .match({$: 'PlayerScore', label: 'PlayerScore', type: 'final', blackJack: true})
    .match({$: 'DealerScore', label: 'DealerScore'})
    .where('({value:0})-[:dealer]->(DealerScore)')
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
    .with('1 - drawP - loseP as winP, drawP, loseP, PlayerScore, DealerScore')
    .merge(['PlayerScore', 'probRel:probs', 'DealerScore'])
    .set('probRel.adv = (winP - loseP), probRel.winP = winP, probRel.loseP = loseP, probRel.drawP = drawP')
    .run()
        
  } catch (e) {
    console.error(e);
  }

  console.log("Stand probs computed in", (new Date() - start)/1000, 'seconds');
}