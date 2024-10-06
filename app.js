const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const { title } = require("process");
const { log } = require("console");

const app = express();
const server = http.createServer(app); //linking http server with express
const io = socket(server); //passing server in socket

const chess = new Chess(); //chess is the variable which will hold the newly create chess object
let players = {};
let currentPlayer = "w"; //first player will be white

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", {title:"Chess Game"});
});

io.on("connection",function (uniquesocket){
 console.log("connected");

 if(!players.white){
   players.white=uniquesocket.id;
   uniquesocket.emit("playerRole","w");
 }

 else if (!players.black){
  players.black=uniquesocket.id;
  uniquesocket.emit("playerRole","b");
 }
 else{
  uniquesocket.emit("spectaterRole");
 }

 uniquesocket.on("disconnect",function(){
  if(uniquesocket.id===players.white){
    delete players.white;
  }
 else if(uniquesocket.id===players.black){
    delete players.black;
 }
 });
 
 uniquesocket.on("move",(move)=>{
  try {
    if(chess.turn()==="b" && uniquesocket.id !==players.black) return;
    if(chess.turn()==="w" && uniquesocket.id !==players.white) return;
   
    const result = chess.move(move);
    if(result){
      currentPlayer = chess.turn();
      io.emit("move",move);
      io.emit("boardState", chess.fen());  //chess.fen shows the current state of board i.e. position of all the dices
    }
    else{
       console.log("Invalid move:",move);
       uniquesocket.emit("invalidMove:",move);
    }

  
  } catch (err) {
     console.log(err);
     uniquesocket.emit("Invalid move:",move)
  }
 })
});




server.listen(3000, function () {
  console.log("listening on port 3000 ");
});
