require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')

module.exports = async function cards(){
  await new Neo4jQuery()
  .merge({label: 'Card', value: 2, p: 0.07692307692307693})
  .merge({label: 'Card', value: 3, p: 0.07692307692307693})
  .merge({label: 'Card', value: 4, p: 0.07692307692307693})
  .merge({label: 'Card', value: 5, p: 0.07692307692307693})
  .merge({label: 'Card', value: 6, p: 0.07692307692307693})
  .merge({label: 'Card', value: 7, p: 0.07692307692307693})
  .merge({label: 'Card', value: 8, p: 0.07692307692307693})
  .merge({label: 'Card', value: 9, p: 0.07692307692307693})
  .merge({label: 'Card', value: 10, p: 0.3076923076923077})
  .merge({label: 'Card', value: 11, p: 0.07692307692307693})
  .run()

  console.log("Cards done");
}