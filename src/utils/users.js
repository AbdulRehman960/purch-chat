const users= []

// addUser , removeUser , getUser, getUsersInRoom

const addUser=({id , username , room, roomMap,imposters,maxPlayers})=>{
//Clean Data
username = username.trim().toLowerCase()
room= room.trim().toLowerCase()
if(roomMap){
roomMap =roomMap.trim().toLowerCase()
}

//validate Data
if(!username || !room){
    return{
        error:'Username and room are required!'
    }
}

//check for existing User
const existingUser= users.find((user)=>{

    return user.room === room && user.username=== username
})

//validate username
if (existingUser){
    return{
        error:"Username is Taken!"
    }
}



//Store User
const roomInfo={room,roomMap,imposters,maxPlayers}
const user= {id,username,room,roomInfo}
users.push(user)
console.log(users)
return{ user }

}

const removeUser=(id)=>{
    const index= users.findIndex((user)=>user.id=== id)

    if(index !== -1){
        return users.splice(index,1)[0]
    }
    

}

const getUser=(id)=>{
    if(!id){
        return{
            error:'Id is required!'
        }
    }
    return users.find((user)=>user.id===id)
}

const getUsersInRoom=(room)=>{
    room= room.trim().toLowerCase()
    return users.filter((user)=> user.room===room)
}

const roomsList=()=>{
    const rooms=users.map((user)=>user.roomInfo)
    const result = [];
const map = new Map();
for (const item of rooms) {
    if(!map.has(item.room)){
        map.set(item.room, true);    // set any value to Map
        result.push({
            room: item.room,
            roomMap: item.roomMap,
            imposters:item.imposters,
            maxPlayers:item.maxPlayers,
        });
    }
}
return result

}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    roomsList,
}