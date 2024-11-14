import { useEffect, useMemo, useState } from 'react'
import {io} from "socket.io-client"
import { 
  Box, 
  Button, 
  Container, 
  Stack, 
  TextField, 
  Typography 
} from '@mui/material'

function App() {

  const[login,setLogin] = useState(false)
  const[userName,setUserName] = useState("")
  const[password,setPassword] = useState("")

  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [message, setMessage] = useState("")
  const [roomMessage, setRoomMessage] = useState("")
  const [messages,setMessages] = useState([])
  const [roomMessages, setRoomMessages] = useState([])
  const [room,setRoom] = useState("")

  const [groupName,setGroupName] = useState("")


  
  
  useEffect(()=>{ 

    if(socket === null) return

    socket.on("welcome", (data) => {
      console.log(data);
    })

    socket.on("getMessage",(data) => {
      setMessages((prev) => [...prev,data])
      
    })
    socket.on("getRoomMessage",(data) => {
      setRoomMessages((prev) => [...prev,data])
      
    })
    socket.on("group-joined-message",(message) => {
      console.log(message);
    })

    // by default
    socket.on("connect",()=>{
      console.log(`connected with socket_id: ${socket.id}`);
    })
 
    
  },[connected])

  const handleConnect = () => {
      const socket  = io("http://localhost:4000",{
        withCredentials: true // to pass token with request
      })
    
      setSocket(socket)
      setConnected(true)
    
    
  }
  const handleDisconnect = () => {
    
    socket.disconnect()
    setConnected(false)
    setSocket(null)
    setMessages([])
    setRoomMessages([])

  }

  const handleSubmit = (e) => {
    e.preventDefault()
    socket.emit("message", message)
    setMessage("")
  }
  const handleRoomSubmit = (e) => {
    e.preventDefault()
    socket.emit("room-message",{room,roomMessage})
    setRoom("")
    setRoomMessage("")
  }

  const handleGroupJoinSubmit = (e) => {
    e.preventDefault()
    socket.emit("group-join",groupName)
    setGroupName("")
  }

  const loginHandler = async (e) => {
    e.preventDefault()
    try {

      const response  = await fetch("http://localhost:4000/login",{
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({userName,password})
      })
  
      const data = await response.json()


      console.log(data);
      
      
      setLogin(data.success)

      handleConnect()
      
    } catch (error) {
      console.log(error);
    }
  }
  const handleLogout = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:4000/logout",{
        method:"GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
      })
      const data = await response.json()
      
      handleDisconnect()
      setLogin(!(data.success))
      setUserName("")
      setPassword("")

      
    } catch (error) {
      console.log(error);
      
    }
  }
  return (
    <Container maxWidth="sm" style={{backgroundColor:"lightblue",minHeight:"100vh"}}>
        


      {
        !login && (
          <Box 
            sx={{
              display:"flex",
              flexDirection:"column",
              alignItems:"center",
              justifyContent:"center",
              height:"200px",
              gap:"20px"
            }}
          >
           <form onSubmit={loginHandler}>
           <TextField 
              id="outlined-basic" 
              label="UserName" 
              variant="outlined" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)} 
            />
            <TextField 
              id="outlined-basic" 
              label="Password" 
              variant="outlined" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <Button 
              variant="contained" 
              type='submit' 
              
            >
              Login
            </Button>

           </form>
          </Box>
        )
      }




        {
          login && (
            <>
            
            <Box 
          sx={{
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"center",
            height:"200px",
            gap:"20px"
          }}
        >
          <Typography variant='h3'>Chat APP</Typography>
          <Button onClick={handleLogout}>logout</Button>
          
        
          
        </Box>

        

        {
          connected && (
            <>
            <Box
              sx={{
                display:"flex",
                flexDirection:"column",
                alignItems:"center",
                justifyContent:"center",
                height:"200px",
                gap:"20px"
                }}
              >
                <form
                    style={{
                      display:"flex",
                      gap:"10px",
                    }}
                    onSubmit={handleSubmit}
                >
                  <TextField 
                    id="outlined-basic" 
                    label="Message" 
                    variant="outlined" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button type='submit' variant="contained">Send</Button>
              </form>
            </Box>

            <Box 
              sx={{
                display:"flex",
                flexDirection:"column",
                alignItems:"center",
                justifyContent:"center",
                height:"200px",
                gap:"20px"
              }}
            >

              <form
                    style={{
                      display:"flex",
                      gap:"10px",
                    }}
                    onSubmit={handleRoomSubmit}
                >
                  <TextField 
                    id="outlined-basic" 
                    label="Room" 
                    variant="outlined" 
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    />
                     <TextField 
                    id="outlined-basic" 
                    label="Room Message" 
                    variant="outlined" 
                    value={roomMessage}
                    onChange={(e) => setRoomMessage(e.target.value)}
                    />
                    <Button type='submit' variant="contained">Room send</Button>
              </form>
         
            </Box>

            <Box 
              sx={{
                display:"flex",
                flexDirection:"column",
                alignItems:"center",
                justifyContent:"center",
                height:"200px",
                gap:"20px"
              }}
            >

              <Typography variant='h5'>Join Group</Typography>

              <form
                    style={{
                      display:"flex",
                      gap:"10px",
                    }}
                    onSubmit={handleGroupJoinSubmit}
                >
                  <TextField 
                    id="outlined-basic" 
                    label="Group Name" 
                    variant="outlined" 
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    />

                   
                    <Button type='submit' variant="contained">Join Group</Button>
              </form>
         
        
          
            </Box>

            </>
            
          
          )
        }  

        {
          messages.length > 0 && (
            <Box
              sx={{
                display:"flex",
                flexDirection:"column",
                
                height:"200px",
                gap:"20px",
                overflowY:"scroll",
                border:"1px solid black"
                }}
              >
                <Typography variant='h4'>Messages</Typography>
                {
                  messages.map((message,index) => (
                    <Typography key={index}>{message}</Typography>
                  ))
                }
            </Box>
          )
        }{
          roomMessages.length > 0 && (
            <Box
              sx={{
                display:"flex",
                flexDirection:"column",
                
                height:"200px",
                gap:"20px",
                overflowY:"scroll",
                border:"1px solid black"
                }}
              >
                <Typography variant='h4'>Room Messages</Typography>
                {
                  roomMessages.map((message,index) => (
                    <Typography key={index}>{message}</Typography>
                  ))
                }
            </Box>
          )
        }
            
            </>
          )
        }
        
          

    </Container>
  )
}

export default App
