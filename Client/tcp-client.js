client = null;

//the default Function for getting an message
functionOnMessage = function (strText){
	console.log("Server: " + strText);
}



function createClient(strIp, strStartMessage){
	//load the the net library 
	var net = require('net');

	client = new net.Socket();


	client.on('data', function(data) {
		//if the client get a message
  		functionOnMessage(data.toString());
  		//client.destroy(); // kill client after server's response
	});

	client.on('close', function() {
  		console.log('Connection closed');
	});

	
	//make the connection
	client.connect(1331, strIp, function() {
		console.log('Connected');
		client.write(strStartMessage);
	});
}




function sendToServer(strText){

	//if the client hasn't been create jet
	if(client == null){
		console.error("Client hasn't been create jet");
		return;
	}

	//send the text
	client.write(strText);
}
