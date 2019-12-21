# BlackJack Neo4j

A very fun exercise to calculate player advantage when adopting an optimal strategy.

### Interesting questions that a probability tree implemented with a graph can answer

* What is the global advantage of the player (***spoiler*** -0.0267164)
* What is the best move for every score
* What is the player advantage for every combination of player score and dealer score
* How many cards are needed to get to the maximised probability of winning

#### How to run

1) install neo4j
2) get this repo and run `npm install`
3) create a `.env` file in root with the following vars
```
NEO4J_URL=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASS=neo4j
```
4) run `npm run setup`, wait a bit and see the DB populated!
5) run `npm run advantage` and see... that playing BlackJack is actually 0.3% better than roulette :) 

Get rich or die trying!
💸