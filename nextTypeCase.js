const nextTypeCase = `(CASE
  WHEN score.type = "hard" and score.value < 11 and card.value = 11
    THEN 'soft'
  WHEN score.type = "soft" and card.value = 11 and score.value < 21
    THEN 'soft'
  WHEN score.type = "soft" and card.value <> 11 and score.value + card.value <= 21
    THEN 'soft'
  ELSE 'hard'
  END) as nextType`

  module.exports = nextTypeCase