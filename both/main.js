function getManifest(){
	var fs = require('fs');
    var arrayBuffer = fs.readFileSync(process.cwd() + "/package.json");
    var strContent = arrayBuffer.toString();
    var objContent = JSON.parse(strContent);
    return objContent;
}

function getVersion(){
	return getManifest()["version"];
}