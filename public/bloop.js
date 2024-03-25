function gra(min, max) {
    return Math.random() * (max - min) + min;
}


var sd = new Date()
  setInterval(function() {
    var b = Math.abs(new Date() - sd)/1000 * 0.000001
    document.getElementById('f').value = b
    document.getElementById('t').innerHTML = 'You have mined ' + b + ' PidgonCoins!';
}, gra(500, 1000))