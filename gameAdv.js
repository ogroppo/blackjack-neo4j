require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

async function gameAdv(){
  const start = new Date()
  try {
    let adv = await new Neo4jQuery()
    .match([
      {value: 0},
      {$: 'playerCards', type: 'player', depth: 2},
      {label: 'PlayerScore', withCards: 2},
      {$: 'bestRel', type: 'best'},
      {label: 'DealerScore'},
      {$: 'dealerCard', type: 'dealer', direction: -1},
      {value: 0},
    ])
    .with('reduce(p = 1, card in playerCards | p * card.p) * dealerCard.p * bestRel.adv as adv')
    .return('sum(adv) as adv')
    .log()
    .fetchOne('adv')

    console.log("Player edge: ", adv);
       
  } catch (e) {
    console.error(e);
  }

  console.log("Game probs computed in", (new Date() - start)/1000, 'seconds');
}

gameAdv()