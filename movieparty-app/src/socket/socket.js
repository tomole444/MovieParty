import io from "socket.io-client";
import {
    SET_FRIEND_USERNAME,
    MOVIEPARTY_IS_STARTED,
    SET_ACCEPTED_FRIENDSHIP,
    GENERICMSG,
    PARTY_INVITATION,
    IN_LOBBY
} from "../actions/types";
import store from "../store";

var socket;
var myusername;

//DA RINOMINARE IL FILE "SocketClient"
export const initSocket = (username) => {
    socket = io({query: "name="+username});
    myusername=username;

    //receive
    socket.on("friendRequest", (data) => {
        console.log("mi è arrivata una richiesta di amicizia da " + data)
        store.dispatch({
            type: SET_FRIEND_USERNAME,
            payload: data
        })
    });

    socket.on("moviePartyInviteReceiver", (data) => {
        console.log("richiesta movieparty da: " + data.sender)
        console.log("room: " + data.room)
        console.log("movieURL: " + data.movieURL)
        store.dispatch({
            type: PARTY_INVITATION,
            payload: data
        })
        //acceptMoviePartyInvite(data.sender, data.room)
        //window.history.pushState({sender: data.sender, room: data.room, movieURL: data.movieURL }, "titolo", "/invited")
    })

    socket.on("moviePartyInviteResponse", (data) => {

        var btn = document.getElementById("btn" + data.receiver)

        if(data.accept){
            console.log(data.receiver + " ha accettato")
            btn.innerHTML= "Accettato"
        } else {
            console.log(data.receiver + " ha rifiutato")
            btn.innerHTML= "Rifiutato"
        }
        
    })

    socket.on("partystarted", (data) => {
        console.log("il party è incominciato")
        store.dispatch({
            type: MOVIEPARTY_IS_STARTED,
            payload: true
        })
    })

    socket.on("message", (data) => {
        console.log(data.text)
    });

    socket.on("friendRequestAccepted", (data) => {
        console.log("richiesta di amicizia accettata da " + data)
        store.dispatch({
            type: SET_ACCEPTED_FRIENDSHIP,
            payload: data
        })
    });

    socket.on("genericmsg", (data) => {
        console.log("dispatch norification")
        store.dispatch({
            type: GENERICMSG,
            payload: data
        })
    })

};

/*const acceptMoviePartyInvite = (sender, room) => {
    joinRoom(room)
    sendMoviePartyResponse(sender, true)
}*/

export const sendMoviePartyResponse = (sender, room, response) => {
    if(response){
        joinRoom(room)
        store.dispatch({
            type: IN_LOBBY,
            payload: true
        })
    }
    socket.emit("moviePartyInviteResponse", {requestSender: sender, requestReceiver: myusername, response: response})
}

export const sendMoviePartyInvite = (myUsername, friendUsername, movieURL) => {
    socket.emit("moviePartyInviteSender", {sender: myUsername, receiver: friendUsername, room: myUsername, movieURL: movieURL})
}

export const joinRoom = (roomName) => {
    socket.emit("join", {myusername: myusername, room: roomName})
}

export const sendStartParty = (roomName) => {
    socket.emit("startparty", {roomName})
}

export const disconnectSocket = () => {
    socket.emit("remove", myusername)
    socket.disconnect()
    socket.off();
}
