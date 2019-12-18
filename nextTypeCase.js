const nextTypeCase = `(CASE
  WHEN score.value = 11 AND score.withCards = 1 AND card.value = 10
    THEN 'blackJack'
  WHEN score.value = 10 AND score.withCards = 1 AND card.value = 11
    THEN 'blackJack'
  WHEN score.type = "hard" AND card.value = 11 AND score.value < 11
    THEN 'soft'
  WHEN score.type = "hard" AND card.value = 11 AND score.value >= 11 AND score.value < 21
    THEN 'hard'
  WHEN score.type = "hard" AND card.value <> 11 AND score.value + card.value <= 21
    THEN 'hard'
  WHEN score.type = "soft" AND card.value = 11 AND score.value < 21
    THEN 'soft'
  WHEN score.type = "soft" AND card.value <> 11 AND score.value + card.value <= 21
    THEN 'soft'
  WHEN score.type = "soft" AND card.value <> 11 AND score.value + card.value > 21
    THEN 'hard'
  ELSE 'bust'
END) as nextType`

module.exports = nextTypeCase