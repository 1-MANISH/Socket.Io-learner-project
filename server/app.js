import express from "express"
import { Server } from "socket.io"
import {createServer} from "http"
import cors from "cors"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"

// variables
const PORT = process.env.PORT || 4000
const app = express()
const server = new createServer(app)


// middleware
// configure cors
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(cookieParser())


const io = new Server(server,{
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    },
}) // for circuit


// when a user connects we get the socket connection 
io.on("connection", (socket) => {

    console.log(`User Connected: ${socket.id}`);


    // as we get the message event triggered from frontend 
    socket.on("message",(data) => {
        socket.broadcast.emit("getMessage", data)
    })
    
    socket.on("room-message",({room,roomMessage}) => {
        io.to(room).emit("getRoomMessage", roomMessage)
    })

    socket.on("group-join",(groupName) => {
        socket.join(groupName)
        io.emit("group-joined-message", `${socket.id} joined the group ${groupName}`)
    })
    
   
    socket.on("disconnect", () => {
        console.log(`User Disconnected: ${socket.id}`);
        
    })
})






// base route
app.get("/", (req, res) => {
    res.send("Hello World")
})

// login route
app.post("/login", (req, res) => {
    
    const {userName, password} = req.body

    if(userName && password){
        const token = jwt.sign(
            {userName}, 
            "secret",
            {expiresIn: "1h"}
        )

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 1000*60*60
        })

         return res.status(200)
        .json({success: true})
    }
   
})

app.get('/logout', (req, res) => {

    res.status(200)
    .cookie("token", null, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 0
    })
    .json({success: true})
})


// socket middleware

io.use((socket,next)=>{


    cookieParser()(socket.request, socket.request.res, (err)=>{

        
        if(err)
            return next(err)
        
        const token = socket.request.cookies["token"]

        if(!token){
            return next(new Error("Authentication error"))
        }

        const decoded = jwt.verify(token, "secret")

        if(!decoded){
            return next(new Error("Authentication error"))
        }

        next()
        
    })

})


// start the server -  with same instance as express server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})