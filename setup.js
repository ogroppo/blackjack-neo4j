const reset = require('./reset')
const cards = require('./cards')
const dealer = require('./dealer')
const player = require('./player')
const standProbs = require('./standProbs')
const move = require('./move')
const cheat = require('./cheat')

async function setup(){
  const start = new Date()
  try {
    //reset db
    await reset()
    
    //add cards
    await cards()

    //setup dealer
    await dealer()

    //setup player
    await player()

    //calc stand advantages
    await standProbs()

    //calc best move
    await move()

    //generate cheat sheet
    await cheat()

  } catch (e) {
    console.error(e);
  }

  console.log("Setup done in", (new Date() - start)/1000, 'seconds');
}

setup()




