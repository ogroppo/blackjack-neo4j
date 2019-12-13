const nextValueCase = 
`(CASE
  WHEN score.value + card.value > 21 and card.value = 11 
   THEN score.value + 1
  WHEN score.value + card.value > 21 and score.type = "soft" 
   THEN score.value + card.value - 10
  ELSE score.value + card.value
 END) as nextValue`

 module.exports = nextValueCase