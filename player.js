require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')
const nextValueCase = require('./nextValueCase')
const nextTypeCase = require('./nextTypeCase')

async function player(){
  try{
    await new Neo4jQuery()
    .merge({label: 'PlayerScore', value: 0, type: 'hard'})
    .run()

    //Hits
    let cards = 0, addedScores
    do{
      cards += 1;
      const q = new Neo4jQuery()
      .match({$: 'score', label: 'PlayerScore'})
      .where(
        {$: 'score', value: {'<=': 21}}, 
        'AND NOT',
        {$: 'score', type: 'blackJack'},
        'AND NOT',
        [{$: 'score'}, {type: 'player'}, {}]
      )
      .match({$: 'card', label: 'Card'})
      .with(
        nextValueCase,
        nextTypeCase,
        'card',
        'score',
        '0 as splittable'
      )

      if(cards === 2)
        q.with(
          `(CASE
            WHEN nextValue = 21
              THEN 'blackJack'
            ELSE nextType
          END) as nextType`,
          `(CASE
            WHEN score.value = card.value
              THEN card.value
            ELSE 0
          END) as splittable`,
          'nextValue', 
          'card',
          'score'
        )

      q.merge({
        $: 'nextScore',
        label: 'PlayerScore',
        value: '$nextValue', 
        type: '$nextType', 
        splittable: '$splittable', 
        withCards: cards > 2 ? 3 : cards
      })
      .merge([
        {$: 'score'},
        {$: 'r', type: 'player', move: 'hit', value: '$card.value', p: '$card.p'},
        {$: 'nextScore'}
      ])
      .return('count(nextScore) as count')

      addedScores = await q.fetchRows('count')
      
    }while(addedScores > 0)

    //Splits
    await new Neo4jQuery()
    .match({$: 'score', label: 'PlayerScore'})
    .where({$: 'score', splittable: {'>': 0}})
    .match({$: 'card', label: 'Card'})
    .with(
      `(CASE
        WHEN score.splittable + card.value > 21
          THEN score.splittable + card.value - 10
        ELSE score.splittable + card.value
      END) as nextValue`,
      `(CASE
        WHEN score.splittable = 11
          THEN 'aceSplit' 
        WHEN card.value = 11
          THEN 'soft'
        ELSE 'hard'
      END) as nextType`,
      'card',
      'score',
    )
    .merge({
      $: 'splitScore',
      label: 'PlayerScore', 
      value: "$nextValue", 
      type: '$nextType', //if type: aceSplit it will not continue in the hit tree
      splittable: 0, //allow one split only allowed
      withCards: 2 //e.g. allow to double
    }) 
    .merge([
      'score',
      {$: 'r', type: 'player', move: 'split', value: '$card.value', p: '$card.p'},
      'splitScore'
    ])
    .run()

    //Cover new scores created by split
    let addedHitRels
    do{
      const q = new Neo4jQuery()
      .match({$: 'score', label: 'PlayerScore'})
      .where(
        {$: 'score', value: {'<=': 21}}, 
        'AND NOT',
        {$: 'score', type: 'blackJack'},
        'AND NOT',
        {$: 'score', type: 'aceSplit'},
        'AND NOT',
        [{$: 'score'}, {type: 'player'}, {}]
      )
      .match({$: 'card', label: 'Card'})
      .with(
        nextValueCase,
        nextTypeCase,
        'card',
        'score'
      )

      q.merge({
        $: 'nextScore',
        label: 'PlayerScore',
        value: '$nextValue', 
        type: '$nextType', 
        splittable: 0, 
        withCards: 3
      })
      .merge([
        {$: 'score'},
        {$: 'r', type: 'player', move: 'hit', value: '$card.value', p: '$card.p'},
        {$: 'nextScore'}
      ])
      .return('count(r) as count')

      addedHitRels = await q.fetchRows('count')
      
    }while(addedHitRels > 0)

    console.log("Player done");

  }catch(e){
    console.error(e);
  }
}

module.exports = player