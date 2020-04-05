const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generatelocationMessage }  = require('../src/utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('../src/utils/users')

// we create the express app
const app = express();

const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room})

        if(error) {
           return callback(error)
        }

        socket.join(user.room)

        socket.emit('messageToClient', generateMessage('Wellcome User!'))
        socket.broadcast.to(room).emit('messageToClient', generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('messageToServer', (sentence, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(sentence)) {
            return callback('Bad language is not allowed!')
        }
        io.to(user.room).emit('messageToClient', generateMessage(user.username, sentence)) 
        callback()
    })

    socket.on('sendLocation', (loc, callback) => {
        const user = getUser(socket.id)
        const url = `https://google.com/maps?q=${loc.latitude},${loc.longitude}`
        io.to(user.room).emit('sendLocation', generatelocationMessage(user.username, url))
        callback('Location shared!')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('messageToClient', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }      
    })
})

// to listen 
server.listen(port, () => {
    console.log('App is running on port: ' + port);
})