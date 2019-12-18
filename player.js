require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')
const nextValueCase = require('./nextValueCase')
const nextTypeCase = require('./nextTypeCase')

async function player(){
  try{
    await new Neo4jQuery()
    .merge({label: 'PlayerScore', value: 0, type: 'hard'})
    .run()

    //First card
    await new Neo4jQuery()
    .match({$: 'score', label: 'PlayerScore', value: 0})
    .match({$: 'card', label: 'Card'})
    .with(
      nextValueCase,
      nextTypeCase,
      'card',
      'score',
    )
    .merge({
      $: 'nextScore',
      label: 'PlayerScore',
      value: '$nextValue', 
      type: '$nextType', 
      withCards: 1
    })
    .merge([
      {$: 'score'},
      {$: 'r', type: 'player', move: 'hit', value: '$card.value', p: '$card.p'},
      {$: 'nextScore'}
    ])
    .run()

    console.log("First card done");
    

    //Second card
    await new Neo4jQuery()
    .match({$: 'score', label: 'PlayerScore', withCards: 1})
    .match({$: 'card', label: 'Card'})
    .with(
      nextValueCase,
      nextTypeCase,
      `(CASE
        WHEN score.value = card.value
          THEN card.value
        ELSE 0
      END) as splittable`,
      'card',
      'score',
    )
    .merge({
      $: 'nextScore',
      label: 'PlayerScore',
      value: '$nextValue', 
      type: '$nextType', 
      withCards: 2,
      splittable: '$splittable', 
    })
    .merge([
      {$: 'score'},
      {$: 'r', type: 'player', move: 'hit', value: '$card.value', p: '$card.p'},
      {$: 'nextScore'}
    ])
    .run()

    console.log("Second card done");

    //Doubles
    await new Neo4jQuery()
    .match({$: 'score', label: 'PlayerScore', withCards: 2})
    .where([{$: 'score', type: 'soft'}, 'OR', {$: 'score', type: 'hard'}])
    .match({$: 'card', label: 'Card'})
    .with(
      nextValueCase,
      'card',
      'score',
    )
    .merge({
      $: 'nextScore',
      label: 'PlayerScore',
      value: '$nextValue', 
      type: 'doubled', 
      withCards: 3
    })
    .merge([
      {$: 'score'},
      {$: 'r', type: 'player', move: 'double', value: '$card.value', p: '$card.p'},
      {$: 'nextScore'}
    ])
    .run()

    console.log("Doubles card done");

    //Splits
    await new Neo4jQuery()
    .match({$: 'score', label: 'PlayerScore', withCards: 2})
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

    console.log("Splits card done");

    //Hits
    let addedScores
    do{
      addedScores = await new Neo4jQuery()
      .match({$: 'score', label: 'PlayerScore'})
      .where(
        [{$: 'score', type: 'soft'}, 'OR', {$: 'score', type: 'hard'}],
        'AND NOT',
        [{$: 'score'}, {type: 'player', move: "hit"}, {}]
      )
      .match({$: 'card', label: 'Card'})
      .with(
        nextValueCase,
        nextTypeCase,
        'card',
        'score',
      )
      .merge({
        $: 'nextScore',
        label: 'PlayerScore',
        value: '$nextValue', 
        type: '$nextType', 
        withCards: 3
      })
      .merge([
        {$: 'score'},
        {$: 'r', type: 'player', move: 'hit', value: '$card.value', p: '$card.p'},
        {$: 'nextScore'}
      ])
      .return('count(r) as count')
      .fetchOne('count')

      console.log({addedScores});
      
      
    }while(addedScores > 0)

    console.log("Hits card done");

    //Final scores
    await new Neo4jQuery()
    .match({$: 'score', label: 'PlayerScore'})
    .where({$: 'score', withCards: {'>=': 2}})
    .merge({
      $: 'finalScore',
      label: 'PlayerScore',
      value: '$score.value', 
      type: 'final', 
    })
    .merge([
      {$: 'score'},
      {$: 'r', type: 'player', move: 'stand', p: 1},
      {$: 'finalScore'}
    ])
    .run()

    console.log("Final scores done");

    console.log("Player done");

  }catch(e){
    console.error(e);
  }
}

module.exports = player