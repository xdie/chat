const KEY = 'chatiga';
const SECRET = 'laconchadetumadre!';

var express = require('express')
  , cookieParser = require('cookie-parser')
  , expressSession = require('express-session')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , cookie = cookieParser(SECRET)
  , store = new expressSession.MemoryStore()
;

// Configurando middlewares de Session y Cookie Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookie);
app.use(expressSession({
  secret: SECRET,
  name: KEY,
  resave: true,
  saveUninitialized: true,
  store: store
}));

// Compartiendo session valida en Socket.IO
io.use(function(socket, next) {
  var data = socket.request;
  cookie(data, {}, function(err) {
    var sessionID = data.signedCookies[KEY];
    store.get(sessionID, function(err, session) {
      if (err || !session) {
        return next(new Error('Acceso denegado!'));
      } else {
        socket.handshake.session = session;
        return next();
      }
    });
  });
});

// Pagina principal

app.get("/:name/:filial", function(req, res, next){
  // Armamos nombre y filial a la session
 console.log(req.params);
  req.session.nome = req.params.name;
  req.session.filial = req.params.filial;
  res.render('index');
  next();
});

// Iniciamos la conexion socket.io
io.sockets.on('connection', function (client) {
  // Recuperamos session Express
  var session = client.handshake.session;

  client.on('toServer', function (msg) {
    // msg= "<b>" + session.nome + ' de ' + session.filial + ":</b> " + msg + "<br>";

    msge = [session.nome ,session.filial,msg, startTime()];
    client.emit('toClient', msge);
    client.broadcast.emit('toClient', msge);
  });
});

// Timestamp
function checkTime(i) {
    return (i < 10) ? "0" + i : i;
}
function startTime() {
    var today = new Date(),
        h = checkTime(today.getHours()),
        m = checkTime(today.getMinutes()),
        s = checkTime(today.getSeconds());
        time = h + ":" + m + ":" + s;
    return time;
}

server.listen(3000, function(){
  console.log("Corriendo el Server!");
});