require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')
const nextValueCase = require('./nextValueCase')
const nextTypeCase = require('./nextTypeCase')

module.exports = async function dealer(){
  try{
    await new Neo4jQuery()
    .merge({label: 'DealerScore', value: 0, type: 'hard'})
    .run()
  
    let cards = 0, addedScores
    do{
      cards++
      addedScores = await new Neo4jQuery()
      .match({$: 'score', label: 'DealerScore'})
      .where(
        {$: 'score', value: {'<': 17}}, 
        'AND NOT', 
        [{$: 'score'}, {type: 'dealer'}, {}]        
      )
      .match({$: 'card', label: 'Card'})
      .with(nextValueCase, nextTypeCase, 'card', 'score')
      .merge({$: 'nextScore', label: 'DealerScore', value: '$nextValue', type: '$nextType'})
      .merge([
        {$: 'score'},
        {$: 'r', type: 'dealer', value: '$card.value', p: '$card.p'},
        {$: 'nextScore'}
      ])
      .return({$: 'count(r)', as: 'count'})
      .fetchRow('count')      
      
    }while(addedScores > 0)

  }catch(e){
    console.error(e);
  }
} 
  