function getManifest(){
	var fs = require('fs');
	try{
    	var arrayBuffer = fs.readFileSync(process.cwd() + "/package.json");//nwjs
	}catch(error){
		//for node (because it is in Themis/Server and not in Themis)

		//go one folder higher
		var strPath = process.cwd()
		var arrayFolders = strPath.split("/");
		var strNewPath = "";

		//enter each Folder without the last one in new Path 
		for (var i = 0; i < arrayFolders.length-1; i++) {
			strNewPath+= "/" + arrayFolders[i];
		};

		try{
    		var arrayBuffer = fs.readFileSync(strNewPath + "/package.json");//node
		}catch(error){
			console.error("can't find manifest");
			return null;
		}
	}
    
    var strContent = arrayBuffer.toString();
    var objContent = JSON.parse(strContent);
    return objContent;
}

function getVersion(){
	return getManifest()["version"];
}