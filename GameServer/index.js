const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const Room = require('./lib/room');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const db = {
    rooms: []
};

// Get room details /room/MyGameRoom
app.get('/room/:roomId', function (req, res) {
    const roomId = req.params.roomId;

    let room = db.rooms.find((room) => {
        return room.name === roomId;
    }) || {};

    res.status(200).send(room);
});

// Add player to room /room/MyGameRoom/players
app.post('/room/:roomId/players/:playerName', function (req, res) {
    const roomId = req.params.roomId;
    const playerName = req.params.playerName;

    if (!playerName) {
        res.status(500).send('Please give a name to the player');

        return;
    }

    if (!roomId) {
        res.status(500).send('Invalid room name');

        return;
    }

    let room = db.rooms.find((room) => {
        return room.name === roomId;
    });

    if (!room) {
        room = new Room(roomId);
        db.rooms.push(room);
    }

    if (!room.addUniquePlayer(playerName)) {
        res.status(400).send(`Player already exists with name ${req.body.name}`);

        return;
    }

    res.status(200).send(room);
});

app.post("/room/:roomId/reset", (req, res)=>{
    const roomId = req.params.roomId;
    let room = db.rooms.find((room) => {
                 return room.name === roomId;
               });
 
    if (!roomId || !room) {
        res.status(500).send('Invalid room');

        return;
    }

    room.resetScores();
    res.status(200).send('Scores has been reset');
})

app.get('/room/:roomId/players/:userId/draw', function(req,res){
   let currentResult = Math.floor((Math.random() * 13) + 1);
   const playerName = req.params.userId;
   const roomId = req.params.roomId;
   let room = db.rooms.find((room) => {
                return room.name === roomId;
            });

    if (!roomId || !room) {
        res.status(500).send('Invalid room');

        return;
    }
   const player = room.getPlayerByName(playerName);
   player.addScore(currentResult);
   const playerScore = player.getScore();
   if(playerScore > 21 || playerScore === 21){
        const roomStatus = room.players.map((player)=>{
            return {
                name: player.name,
                score: player.score
            }
        })
        room.resetScores();
        res.status(400).send({roomStatus});
   }
   else{
        res.status(200).send({"value":currentResult});
   }
})

app.post('/room/:roomId/players/:userId/score', function (req, res) {
    const roomId = req.params.roomId;

    let room = db.rooms.find((room) => {
        return room.name === roomId;
    });

    if (!roomId || !room) {
        res.status(500).send('Invalid room');

        return;
    }

    const userId = req.params.userId;
    const user = room.getPlayerByName(userId);

    if (!userId || !user) {
        res.status(500).send('Invalid request');

        return;
    }

    user.addScore(req.body.score);

    res.status(200).send({});
});

app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(3000);