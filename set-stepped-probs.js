require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

async function computeProbs(){
  const start = new Date()
  try {
    await new Neo4jQuery()
    .match({alias: 'Score', label: 'Score'}, {alias: 'PlayerScore', label: 'PlayerScore'}, , {alias: 'PlayerScore', label: 'DealerScore'})
    .detachDelete('Score, PlayerScore, DealerScore')
    .run()

    console.log("Done deleting");

    //first card
    await new Neo4jQuery()
    .match({alias: 'card', label: 'Card'})
    .with(`(CASE
      WHEN card.value = 11
        THEN 'soft'
      ELSE 'hard'
    END) as type`, 'card')
    .create('(:PlayerScore{value: card.value, type: type, cards: 1, p: card.p})')
    .create('(:DealerScore{value: card.value, type: type, cards: 1, p: card.p})')
    .run()

    console.log("Done first card");

    var dealerLoops = 0
    for (var i = 2; i < 50; i++) {
      dealerLoops = i
      var count = await new Neo4jQuery()
      .match({alias: 'card', label: 'Card'})
      .match({alias: 'score', label: 'DealerScore', cards: i-1})
      .where('score.value < 17')
      .with(nextValueCase, typeCase, 'card', 'score')
      .merge({alias: 'nextScore', label: 'DealerScore', _value: 'nextValue', _type: 'type', cards: i})
      .set(`nextScore.p = coalesce(nextScore.p, 0) + (score.p * card.p)`)
      .merge('(score)-[r:dealer{card: card.value, p: card.p}]->(nextScore)')
      .return('count(r) as count')
      //.debug()
      .fetchRow('count')
    
      if(count === 0)
        break
    }
    console.log({dealerLoops});

    var playerLoops = 0
    for (var i = 2; i < 50; i++) {
      playerLoops = i;
      const added = await new Neo4jQuery()
      .match({alias: 'card', label: 'Card'})
      .match({alias: 'score', label: 'PlayerScore', cards: i-1})
      .where(`score.value <= 21 and not (${i-1} = 2 and score.value = 21)`)
      .with(nextValueCase, typeCase, 'card', 'score')
      .merge({alias: 'nextScore', label: 'PlayerScore', _value: 'nextValue', _type: 'type', cards: i})
      .set(`nextScore.p = coalesce(nextScore.p, 0) + (score.p * card.p)`)
      .merge('(score)-[r:player{card: card.value, p: card.p}]->(nextScore)')
      .return('count(r) as count')
      .debug()
      .fetchRow('count')

      if(added === 0)
        break
    }
    console.log({playerLoops});

  } catch (e) {
    console.error(e);
  }

  console.log("Probs computed in", (new Date() - start)/1000, 'seconds');
}

computeProbs()

const nextValueCase = 
`(CASE
  WHEN score.value + card.value > 21 and card.value = 11
   THEN score.value + 1
  WHEN score.value + card.value > 21 and score.type = "soft"
   THEN score.value + card.value - 10
  WHEN score.value + card.value > 21 and score.type = "soft"
   THEN 'bust'
  ELSE score.value + card.value
 END) as nextValue`

const typeCase = `(CASE
WHEN score.type = "hard" and score.value < 11 and card.value = 11
  THEN 'soft'
WHEN score.type = "soft" and card.value = 11
  THEN 'soft'
WHEN score.type = "soft" and card.value <> 11 and score.value + card.value <= 21
  THEN 'soft'
ELSE 'hard'
END) as type`
