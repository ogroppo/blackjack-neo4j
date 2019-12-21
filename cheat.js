require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')
const fs = require('fs');

async function cheat(){
  const start = new Date()
  try {
    const results = await new Neo4jQuery()
    .match([
      {$: 'PlayerScore', label: 'PlayerScore', withCards: 2},
      {$: 'bestRel', type: 'best'},
      {$: 'DealerScore', label: 'DealerScore'}
    ])
    .where(
      'NOT', 
      {$: 'PlayerScore', type: 'aceSplit'},
      'AND NOT',
      {$: 'PlayerScore', type: 'blackJack'},
    )
    .optionalMatch([
      'PlayerScore',
      {$: 'splitRel', type: 'player', move: 'split'},
      {$: 'SplitScore'},
      {$: 'bestSplitRel', type: 'best'},
      'DealerScore'
    ])
    .with(
      'sum(splitRel.p * bestSplitRel.adv)*2 as splitAdv',
      'PlayerScore, DealerScore, bestRel',
    )
    .with(`CASE
      WHEN PlayerScore.splittable > 0 and splitAdv > bestRel.adv
        THEN {move: 'P', adv: splitAdv}
      ELSE
        bestRel
    END as bestRel`,'PlayerScore, DealerScore')
    .return('*')
    .orderBy('PlayerScore.splittable, PlayerScore.type, PlayerScore.value')
    .log()
    .fetch()

    //console.log(results);
    
    let csv = ',2,3,4,5,6,7,8,9,10,11\n'

    let matrix = {}

    results.forEach(({PlayerScore, DealerScore, bestRel}) => {
      let rowName = `${PlayerScore.type} ${PlayerScore.value}`
      if(PlayerScore.splittable){
        rowName = PlayerScore.splittable === 11 ? `A/A` : `${PlayerScore.splittable}/${PlayerScore.splittable}`
      }
 
      matrix[rowName] = matrix[rowName] || []
      matrix[rowName][DealerScore.value - 2] = bestRel.move
    })


    Object.keys(matrix).forEach(key => {
      csv += [key].concat(matrix[key]).join(',') + '\n'
    })
        
    fs.writeFileSync('cheat.csv', csv, 'utf8');

  } catch (e) {
    console.error(e);
  }

  console.log("Cheat sheet computed in", (new Date() - start)/1000, 'seconds');
}

module.exports = cheat