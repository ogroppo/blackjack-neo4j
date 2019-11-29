require('dotenv').config()
const Neo4jQuery = require('fluent-neo4j')
var fs = require('fs');

async function computeProbs(){
  const start = new Date()
  try {
    const scoreLabels = await new Neo4jQuery()
    .match({alias: 'score', label: 'Score'})
    .returnDistinct('score.value as value, score.type as type')
    .orderBy('value, type')
    .fetchRows()

    const rounds = await new Neo4jQuery()
    .match({alias: 'score', label: 'Score'})
    .with('DISTINCT score.round as round')
    .orderBy('round')
    .return('round')
    .debug()
    .fetchRows('round')

    const scores = await new Neo4jQuery()
    .match({alias: 'score', label: 'Score'})
    .return('score')
    .debug()
    .fetchRows('score')

    const moves = await new Neo4jQuery()
    .match([
      {alias: 'prevScore', label: 'Score'},
      {alias: 'card', type: 'player'},
      {alias: 'nextScore', label: 'Score'}
    ])
    .return('prevScore, card, nextScore')
    .debug()
    .fetchRows()

    fs.writeFileSync('scoreLabels.json', JSON.stringify(scoreLabels, null, 2), 'utf8');
    fs.writeFileSync('rounds.json', JSON.stringify(rounds, null, 2), 'utf8');
    fs.writeFileSync('scores.json', JSON.stringify(scores, null, 2), 'utf8');
    fs.writeFileSync('moves.json', JSON.stringify(moves, null, 2), 'utf8');
  } catch (e) {
    console.error(e);
  }

  console.log("Probs computed in", (new Date() - start)/1000, 'seconds');
}

computeProbs()
