// save later all the clients connected 
arrayAllSockets = null;

//the default Function for getting an message
functionOnMessage = function (intId, strText){
	console.log("socket " + intId + ": " + strText);
}


function createServer(){

	//load the the net library 
	var net = require('net');

	// save all the clients connected 
	arrayAllSockets = new Array();
	
	serverTcpIpServer = net.createServer(function(socket) {

		//Add the socket to the array to save all sockets
		arrayAllSockets.push(socket);

		socket.on('data', function (data) {

			stringRequest = data.toString();

			intSocketId = arrayAllSockets.indexOf(this);

			functionOnMessage(intSocketId, stringRequest);

  		});

  		socket.on('close', function() {
    		//set the socket to not ridable
    		intSocketId = arrayAllSockets.indexOf(this);
    		arrayAllSockets[intSocketId] = new Array();
    		arrayAllSockets[intSocketId].writable = false;
		});

  		socket.on('error', function() {
    		//set the socket to not ridable
    		intSocketId = arrayAllSockets.indexOf(this);
    		arrayAllSockets[intSocketId] = new Array();
    		arrayAllSockets[intSocketId].writable = false;
		});

	});

	serverTcpIpServer.listen(1331);
}


function isConnectionToSocket(intId){
	return arrayAllSockets[intId].writable;
}

function sendToSocket(intId, strText){

	//if the array doesn't has that id
	if(intId < 0 || intId >= arrayAllSockets.length){
		console.error("client don't exist");
		return;
	}else if(arrayAllSockets == null){
		//if the server hasn't been create jet
		console.error("Server hasn't been create jet");
		return;
	}else if(!arrayAllSockets[intId].writable){
		//if the client isn't connected any more
		console.error("Client has already disconnected");
		return;
	} 

	//send the text
	arrayAllSockets[intId].write(strText);
}


function sendToEveryone(strText){

	//if the server hasn't been create jet
	if(arrayAllSockets == null){
		console.error("Server hasn't been create jet");
		return;
	}

	//send the text
	for (var i = 0; i < arrayAllSockets.length; i++) {
		sendToSocket(i, strText)
	};
}

function getAmountOfConnectedClients(){
	intAmount = 0;
	for (var i = 0; i < arrayAllSockets.length; i++) {
		if(isConnectionToSocket(i)){
			intAmount++;
		}
	};
	return intAmount;
}

function closeServer(){
	for (var i = 0; i < arrayAllSockets.length; i++) {
		arrayAllSockets[i].destroy()
	};
    serverTcpIpServer.close()
}
