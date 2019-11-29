export default function getPathD(startX, startY, endX, endY){
  var xDiff = endX - startX;

  var c1X = xDiff/3;
  var c2X = xDiff/3*2;

  var d = `M${startX},${startY} C${startX + c1X},${startY} ${startX + c2X},${endY} ${endX},${endY}`;

  return d;
}
