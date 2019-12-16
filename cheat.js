require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')
const fs = require('fs');

async function cheat(){
  const start = new Date()
  try {
    const results = await new Neo4jQuery()
    .match([
      {$: 'PlayerScore', label: 'PlayerScore', withCards: 2},
      {$: 'probsRel', type: 'probs'},
      {$: 'DealerScore', label: 'DealerScore'}
    ])
    .where(
      'NOT', 
      {$: 'PlayerScore', type: 'aceSplit'},
      'AND NOT', 
      {$: 'PlayerScore', type: 'blackJack'}
    )
    .return('*')
    .orderBy('PlayerScore.splittable, PlayerScore.type, PlayerScore.value')
    .log()
    .fetchRows()

    //console.log(results);
    
    let csv = ',2,3,4,5,6,7,8,9,10,11\n'

    let matrix = {}

    results.forEach(({PlayerScore, DealerScore, probsRel}) => {
      let rowName = `${PlayerScore.type} ${PlayerScore.value}`
      if(PlayerScore.splittable){
        rowName = PlayerScore.splittable === 11 ? `A/A` : `${PlayerScore.splittable}/${PlayerScore.splittable}`
      }
 
      matrix[rowName] = matrix[rowName] || []
      matrix[rowName][DealerScore.value - 2] = probsRel.move
    })

    Object.keys(matrix).forEach(key => {
      csv += [key].concat(matrix[key]).join(',') + '\n'
    })
        
    fs.writeFileSync('cheat.csv', csv, 'utf8');

  } catch (e) {
    console.error(e);
  }

  console.log("Move computed in", (new Date() - start)/1000, 'seconds');
}

cheat()
