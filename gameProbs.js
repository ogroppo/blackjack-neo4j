require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

async function gameProbs(){
  const start = new Date()
  try {
    let adv = await new Neo4jQuery()
    .match([
      {label: 'PlayerScore', value:0},
      {$: 'cards', type: 'player', depth: '2'},
      {label: 'PlayerScore'},
      {$: 'probRel', type: 'probs'},
      {label: 'DealerScore'}
    ])
    .match([
      {label: 'DealerScore', value:0},
      {$: 'card', type: 'dealer'},
      'DealerScore'
    ])
    .with('probRel', 'cards', 'card.p as dealerP')
    //.where({$: 'probRel', move: 'S'}, 'OR', {$: 'probRel', move: 'D'})
    .with(`CASE
      WHEN probRel.move = 'S'
        THEN probRel.standAdv
      WHEN probRel.move = 'D'
        THEN probRel.doubleAdv
      WHEN probRel.move = 'P'
        THEN probRel.splitAdv
      WHEN probRel.move = 'H'
        THEN probRel.hitAdv
    END as adv`,'cards', 'probRel', 'dealerP')
    .with('sum(reduce(p = 1, card in cards | p * card.p) * adv * dealerP) as adv')
    .return('adv')
    .log()
    .fetchRow('adv')

    console.log({adv});
       
  } catch (e) {
    console.error(e);
  }

  console.log("Game probs computed in", (new Date() - start)/1000, 'seconds');
}
gameProbs()