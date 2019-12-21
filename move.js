require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

async function move(){
  const start = new Date()
  try {
    let res = await new Neo4jQuery()
    .match({$: 'PlayerScore', label: 'PlayerScore', withCards: 2})
    .match({$: 'DealerScore', label: 'DealerScore'})
    .where('({value:0})-[:dealer]->(DealerScore)')
    //stand adv
    .match([
      'PlayerScore',
      ':player{move:"stand"}',
      'FinalScore',
      'standProb:probs',
      'DealerScore',
    ])
    .with(`CASE 
      WHEN PlayerScore.type = "blackJack" 
        THEN standProb.adv * 1.5
      ELSE
        standProb.adv
    END as standAdv, PlayerScore, DealerScore`)
    //hit Adv
    .optionalMatch([
      'PlayerScore',
      {$: 'cards', type: 'player', move: 'hit', depth: '1'},
      'BetterScore',
      {type: 'player', move: 'stand'},
      'FinalScore',
      'hitProb:probs',
      'DealerScore',
    ])
    .with(
      'sum(reduce(p = 1, card in cards | p * card.p) * hitProb.adv) as hitAdv', 
      'standAdv, PlayerScore, DealerScore',
    )
    //hit with 2 Adv
    .optionalMatch([
      'PlayerScore',
      {$: 'cards', type: 'player', move: 'hit', depth: '2'},
      'BetterScore',
      {type: 'player', move: 'stand'},
      'FinalScore',
      'hitProb:probs',
      'DealerScore',
    ])
    .with(
      '((1 - sum(reduce(p = 1, card in cards | p * card.p)))*-1) + sum(reduce(p = 1, card in cards | p * card.p) * hitProb.adv) as hit2Adv', 
      'hitAdv, standAdv, PlayerScore, DealerScore',
    )
    //double Adv
    .optionalMatch([
      'PlayerScore',
      {$: 'card', type: 'player', move: 'hit'},
      'BetterScore',
      {type: 'player', move: 'stand'},
      'FinalScore',
      'doubleProb:probs',
      'DealerScore',
    ])
    .with(
      'sum(card.p * doubleProb.adv)*2 as doubleAdv',
      'hit2Adv, hitAdv, standAdv, PlayerScore, DealerScore',
    )
    .unwind(`[{move: 'D', adv: doubleAdv}, {move: 'S', adv: standAdv}, {move: 'H', adv: hitAdv}, {move: 'H', adv: hit2Adv}] as bestMove`)
    .with('bestMove', 'PlayerScore', 'DealerScore')
    .orderBy('bestMove.adv DESC')
    .with('collect(bestMove)[0] as bestMove, PlayerScore, DealerScore')
    .merge(['PlayerScore', {$: 'bestRel', type: 'best'}, 'DealerScore'])
    .set('bestRel.move = bestMove.move, bestRel.adv = bestMove.adv')
    //.log()
    .run()

  } catch (e) {
    console.error(e);
  }

  console.log("Move computed in", (new Date() - start)/1000, 'seconds');
}

module.exports = move
