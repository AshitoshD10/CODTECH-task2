const express = require('express')
const path = require('path')
const app = express()

// Use environment port for deployment, fallback to 4000 for local development
const PORT = process.env.PORT || 4000

// Start server and attach it to Socket.io
const server = app.listen(PORT, () => console.log(` server on port ${PORT}`))

// Initialize Socket.io with server instance
const io = require('socket.io')(server)

// Serve frontend files from "public" folder
app.use(express.static(path.join(__dirname, 'public')))  

// Track all connected client socket IDs
let socketsConected = new Set()

// Run function every time a new client connects
io.on('connection', onConnected)

function onConnected(socket) {

  console.log('Socket connected', socket.id)

  // Add new client to active connections set
  socketsConected.add(socket.id)

  // Send updated total connected clients count to all users
  io.emit('clients-total', socketsConected.size)

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id)

    // Remove client when they disconnect
    socketsConected.delete(socket.id)

    // Update total clients count for everyone
    io.emit('clients-total', socketsConected.size) 
  })

  // Listen for chat messages from a client
  socket.on('message', (data) => {

    // Send message to all clients except sender
    socket.broadcast.emit('chat-message', data)
  })

  // Listen for typing/feedback events
  socket.on('feedback', (data) => {

    // Broadcast typing/feedback status to other users
    socket.broadcast.emit('feedback', data)   
  })
}
