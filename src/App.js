import React from 'react';
import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import getPathD from './lib/getPathD'
import scoreLabels from './scoreLabels.json'
import rounds from './rounds.json'
import scores from './scores.json'
import moves from './moves.json'

const HEADER_HEIGHT = 46
const SCORES_LABELS_WIDTH = 60
const ROW_HEIGHT = 60
const ROW_WIDTH = 120
const SVG_HEIGHT = HEADER_HEIGHT + (scoreLabels.length * ROW_HEIGHT)
const SVG_WIDTH = SCORES_LABELS_WIDTH + (scores.length * ROW_WIDTH)
const SLOT_HEIGHT = 40
const SLOT_WIDTH = 8

let slotsLeftOffests = {}
let slotsRightOffests = {}

function getPathDPro(topLeftX, topLeftY, topRightX, topRightY, bottomRightX, bottomRightY, bottomLeftX, bottomLeftY){
  var topXDiff = topRightX - topLeftX;
  var bottomXDiff = bottomRightX - bottomLeftX;

  var topLeftC = topXDiff/3;
  var topRightC = topXDiff/3*2;
  var bottomLeftC = bottomXDiff/3*2;
  var bottomRightC = bottomXDiff/3;

  var d = `M${topLeftX},${topLeftY} 
    C${topLeftC + topLeftX},${topLeftY} 
    ${topRightC + topLeftX},${topRightY} 
    ${topRightX},${topRightY} 
    V${bottomRightY}
    C${bottomRightX - bottomRightC},${bottomRightY} 
    ${bottomRightX - bottomLeftC},${bottomLeftY}
    ${bottomLeftX},${bottomLeftY} 
    Z
  `;

  return d;
}

class App extends React.Component{

  getPathD = (prevScore, card, nextScore) => {
    let prevRowIndex = this.getScoreYIndex(prevScore)
    let nextRowIndex = this.getScoreYIndex(nextScore)

    slotsLeftOffests[prevRowIndex] = slotsLeftOffests[prevRowIndex] || {}
    slotsLeftOffests[prevRowIndex][prevScore.round] = slotsLeftOffests[prevRowIndex][prevScore.round] || []
    slotsRightOffests[nextRowIndex] = slotsRightOffests[nextRowIndex] || {}
    slotsRightOffests[nextRowIndex][nextScore.round] = slotsRightOffests[nextRowIndex][nextScore.round] || []

    let prevSlotPaths = slotsLeftOffests[prevRowIndex][prevScore.round]
    let nextSlotPaths = slotsRightOffests[nextRowIndex][nextScore.round]
    let prevOffsetY = prevSlotPaths.reduce((curr, acc) => curr + acc, 0)
    let nextOffsetY = nextSlotPaths.reduce((curr, acc) => curr + acc, 0)

    let prevScoreTopX = ((prevScore.round-1) * ROW_WIDTH) + SLOT_WIDTH
    let prevScoreTopY = (prevRowIndex * ROW_HEIGHT) + prevOffsetY
    let prevScoreBttomX = prevScoreTopX
    let prevScoreBottomY = prevScoreTopY + (card.p * SLOT_HEIGHT)

    let nextScoreTopX = ((nextScore.round-1) * ROW_WIDTH)
    let nextScoreTopY = (nextRowIndex * ROW_HEIGHT) + nextOffsetY
    let nextScoreBottomX = nextScoreTopX
    let nextScoreBottomY = nextScoreTopY + (card.p * SLOT_HEIGHT)

    prevSlotPaths.push(prevScoreBottomY - prevScoreTopY)
    nextSlotPaths.push(nextScoreBottomY - nextScoreTopY)

    return getPathDPro(
      prevScoreTopX,
      prevScoreTopY,
      nextScoreTopX,
      nextScoreTopY,
      nextScoreBottomX,
      nextScoreBottomY,
      prevScoreBttomX,
      prevScoreBottomY
    )
  }

  getScoreYIndex(score){
    for(let index in scoreLabels){
      let el = scoreLabels[index]
      if(el.value === score.value && el.type === score.type)
        return index
    }
  }

  render(){
    return (
      <div className="App">
        <h1>Blackjaccone</h1>
        <div className="chart">
          <svg height={SVG_HEIGHT} width={SVG_WIDTH}>
            <g>
              <g>
                <text>Score</text>
              </g>
              {
                rounds.map((round, index) =>
                  <g transform={`translate(${(index*ROW_WIDTH)+SCORES_LABELS_WIDTH} 0)`}>
                    <text className="cardNumberLabel">{`${round} Cards`}</text>
                  </g>
                )
              }
            </g>
            <g transform={`translate(0 ${HEADER_HEIGHT})`}>
              {
                scoreLabels.map(({value, type}, index) =>
                  <g transform={`translate(0 ${index * ROW_HEIGHT})`}>
                    <text dy={ROW_HEIGHT/3} dx={2} className="score">{`${type} ${value}`}</text>
                  </g>
                )
              }
            </g>
            <g transform={`translate(${SCORES_LABELS_WIDTH} ${HEADER_HEIGHT})`}>
            {
              scores.map((score) =>
                <g transform={`translate(${(score.round-1) * ROW_WIDTH} ${this.getScoreYIndex(score) * ROW_HEIGHT})`}>
                  <title>{score.type} {score.value} - {score.p}</title>
                  <rect className="probBackground" width={SLOT_WIDTH} height={SLOT_HEIGHT} />
                  <rect className="actualProb" width={SLOT_WIDTH} height={SLOT_HEIGHT*score.p} />
                </g>
              )
            }
            </g>
            <g transform={`translate(${SCORES_LABELS_WIDTH} ${HEADER_HEIGHT})`}>
            {
              moves.map(({prevScore, card, nextScore}) =>
                <path
                  d={this.getPathD(prevScore, card, nextScore)}
                />
              )
            }
            </g>
          </svg>
        </div>
      </div>
    );
  }
}

export default App;
