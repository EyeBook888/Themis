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




// files are included here:
var fs = require('fs');
eval(fs.readFileSync('../both/math.js')+'');
eval(fs.readFileSync('../both/main.js')+'');
eval(fs.readFileSync('./tcp-server.js')+'');
eval(fs.readFileSync('./main.js')+'');