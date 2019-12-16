require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

async function move(){
  const start = new Date()
  try {
    await new Neo4jQuery()
    .match([
      {$: 'PlayerScore', label: 'PlayerScore'},
      {$: 'probsRel', type: 'probs'},
      {$: 'DealerScore', label: 'DealerScore'}
    ])
    .with(
      'PlayerScore',
      'probsRel',
      'DealerScore',
      'floor(probsRel.standAdv * 100000)/100000 as standAdv',
      'floor(probsRel.hitAdv * 100000)/100000 as hitAdv',
      'floor(probsRel.doubleAdv * 100000)/100000 as doubleAdv',
      'floor(probsRel.splitAdv * 100000)/100000 as splitAdv',
    )
    .with(`
    CASE
      WHEN PlayerScore.splittable > 0 AND splitAdv > 0 AND splitAdv > doubleAdv AND splitAdv > hitAdv AND splitAdv > standAdv
        THEN 'P'
      WHEN doubleAdv > 0 AND doubleAdv > hitAdv AND doubleAdv > standAdv
        THEN 'D'
      WHEN hitAdv >= standAdv
        THEN 'H'
      ELSE 'S'
    END as move,
    probsRel
    `)
    .set('probsRel.move = move')
    .run()

  } catch (e) {
    console.error(e);
  }

  console.log("Move computed in", (new Date() - start)/1000, 'seconds');
}

move()
