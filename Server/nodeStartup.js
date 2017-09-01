//define the function for node
function callInInterval(functionToCall, intTime){
	setInterval(functionToCall, intTime);
}

function printInfo(strText){
	console.log(strText);
}

function clearInfo(){
	//todo: real clear the console
	console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
}



//for end the server and other commands
var stdin = process.openStdin();

stdin.addListener("data", function(d) {
	var strCommand =  d.toString().trim();

	if(strCommand == "stop"){//end the server
		closeServer();//close the Server
		process.exit(0);
	}

  });



// files are included here:
var fs = require('fs');
eval(fs.readFileSync('../both/math.js')+'');
eval(fs.readFileSync('../both/main.js')+'');
eval(fs.readFileSync('../both/playerActions.js')+'');
eval(fs.readFileSync('./tcp-server.js')+'');
eval(fs.readFileSync('./main.js')+'');

