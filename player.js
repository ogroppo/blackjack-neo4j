require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')
const nextValueCase = require('./nextValueCase')
const nextTypeCase = require('./nextTypeCase')

module.exports = async function player(){
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
        'false as splittable'
      )

      if(cards === 2)
        q.with(
          `(CASE
            WHEN nextValue = 21
              THEN 'blackJack'
            ELSE type
          END) as nextType`,
          `(CASE
            WHEN score.value = card.value
              THEN true
            ELSE false
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
      .return('count(r) as count')

      addedScores = await q.fetchRow('count')
    }while(addedScores > 0)

    //Splits
    await new Neo4jQuery()
    .match({$: 'score', label: 'PlayerScore', splittable: true})
    .with(
      `(CASE
        WHEN score.type = 'soft'
          THEN 11
        ELSE score.value / 2
      END) as splitCardValue`,
      'score'
    )
    .match({$: 'card', label: 'Card'})
    .with(
      `(CASE
        WHEN splitCardValue + card.value > 21
          THEN splitCardValue + card.value - 10
        ELSE splitCardValue + card.value
      END) as nextValue`,
      `(CASE
        WHEN splitCardValue = 11
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
      splittable: false, //allow one split only allowed
      withCards: 2 //e.g. allow to double
    }) 
    .merge([
      'score',
      {$: 'r', type: 'player', move: 'split', value: '$card.value', p: '$card.p'},
      'splitScore'
    ])
    .run()

  }catch(e){
    console.error(e);
  }
}