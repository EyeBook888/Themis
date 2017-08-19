//define the function for nwjs

function callInInterval(functionToCall, intTime){
	window.setInterval(functionToCall, intTime);
}


function printInfo(strText){
	document.body.innerHTML += strText;
}

function clearInfo(){
	document.body.innerHTML = "";
}