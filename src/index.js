const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter= require('bad-words')
//var morgan = require('morgan')
const {generateMessage}=require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom,roomsList } = require('./utils/users')
const { create } = require('domain')
var onlineUsers=0
const app=express()
const server=http.createServer(app)
const io=socketio(server)

// const port=process.env.PORT || 5000
const publicDirectoryPath= path.join(__dirname,'../public')
//app.use(morgan('combined'))
app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log('New WebSocket Connection')

    onlineUsers+=1


    io.emit('livingRooms',({
        rooms:roomsList(),
        onlineUsers:onlineUsers
    }))

    socket.on('join',({username,room,roomMap,imposters,maxPlayers},callback)=>{
        console.log(username,room,roomMap,imposters,maxPlayers)
        const {error,user}=addUser({id:socket.id,username,room,roomMap,imposters,maxPlayers})

        if (error){
            return callback(error)
        }

       
        socket.join(user.room)

        socket.emit('message',generateMessage('admin',"welcome"))
        socket.broadcast.to(user.room).emit('message',generateMessage('admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData',({
            room:user.room,
            users:getUsersInRoom(user.room),
            rooms:roomsList()
        }))
        
        io.emit('livingRooms',({
            rooms:roomsList(),
            onlineUsers:onlineUsers
        }))
        // return callback("complete")
    })

    socket.on('sendMessage',(message,callback)=>{
             console.log(message)
        const user=getUser(socket.id)
        const filter=new Filter({ regex: /\*|\.|$/gi })
        
        if(filter.isProfane(message)){
            message=filter.clean(message)
        }
        
        
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        onlineUsers-=1
        io.emit('livingRooms',({
            rooms:roomsList(),
            onlineUsers:onlineUsers
        }))

        if(user){
            io.to(user.room).emit('message',generateMessage('admin',`${user.username} has left.`))
            io.to(user.room).emit('roomData',({
                room:user.room,
                users:getUsersInRoom(user.room),
                rooms:roomsList()
            }))
        }
    })
    
})

server.listen(3000 , ()=>{
    console.log("Server Is Up And Running on port 3000")
})