function Player(intId, strName){
	this.intId 		= intId;
	this.strName 	= strName;
	this.gameMyGame = null;
}

function Game(strName, playerHost, settings){
	console.log("new Game");
	this.strName 			= strName;
	this.arrayMyPlayers 	= new Array();



	this.arrayMyPlayers[0] = playerHost;
	this.arrayMyPlayers[0].gameMyGame = this;//register this Game at the HostPlayer


	//all information about the game
	this.arrayWorldInformation = {
		"type" : "WORLDINFO" //if you send this data the client knows what it is. 
	}


	this.arrayWorldInformation["playerAmount"] = settings["playerAmount"];

	this.arrayWorldInformation["mapHeight"] = settings["mapHeight"];
	this.arrayWorldInformation["mapWidth"] = settings["mapWidth"];
	this.arrayWorldInformation["planetAmount"] = 50;
	this.arrayWorldInformation["moveOf"] = 0;
	this.arrayWorldInformation["timePerTurn"] = settings["timePerTurn"];
	this.arrayWorldInformation["timeToNextTurn"] = this.arrayWorldInformation["timePerTurn"];


	this.arrayWorldInformation["loserIds"] = new Array();



	this.arrayWorldInformation["troops"] = new Array();
	//place start troop

	//all start position
	var arrayPossibleStartPosition = new Array();
	arrayPossibleStartPosition.push(new point(0, 0));
	arrayPossibleStartPosition.push(new point(this.arrayWorldInformation["mapWidth"]-1, this.arrayWorldInformation["mapHeight"]-1));
	arrayPossibleStartPosition.push(new point(0, this.arrayWorldInformation["mapHeight"]-1));
	arrayPossibleStartPosition.push(new point(this.arrayWorldInformation["mapWidth"]-1, 0));

	console.log("Troops")
	console.log(arrayPossibleStartPosition)
	//place start troop
	for (var i = 0; i < this.arrayWorldInformation["playerAmount"]; i++) {
		console.log(i)
		//get the point
		var pointPosition = arrayPossibleStartPosition[i];
		//generate new troop
		var arrayNewTroop = {"size": 5, "player" : i, "positionX": pointPosition.intX, "positionY": pointPosition.intY, "technicLevel" : 3, "morale": 1, "moveAble" : true}
		//add them to the array
		this.arrayWorldInformation["troops"].push(arrayNewTroop);
	};
	console.log("Troops end")


	this.arrayWorldInformation["planets"] = new Array();

	//for the jump animation
	this.arrayWorldInformation["animation"] = new Array();
	// { type : "JUMP", startTime : 123, "ShipId" : 1, startPositionX : 0, star PositionY : 0}

	//to keep the time in singe with the players
	this.arrayWorldInformation["pastTime"] = 0;



	this.joinPlayer = function(playerPlayer){
		console.log(playerPlayer)
		this.arrayMyPlayers.push(playerPlayer);
		playerPlayer.gameMyGame = this;//register this Game at the 2ed Player
		
		if(this.isFull()){//start game (only if it is full)
			//set the startTime
			this.intGameStartedAt = new Date().getTime();

			this.sendUpdate();
		}else{
			console.log("more Players needed");
		}
	}

	this.isFull = function(){
		return this.arrayMyPlayers.length >= this.arrayWorldInformation["playerAmount"]
	}

	this.isThisLostKnown = function(intId){
		//test if a player has already lost
		for (var i = 0; i < this.arrayWorldInformation["loserIds"].length; i++) {
			if(this.arrayWorldInformation["loserIds"][i] == intId){
				return true;
			}
			console.log(intId + "!=" + this.arrayWorldInformation["loserIds"][i]);
		};
		return false;
	}

	this.letPlayerLose = function(intId){
		if(this.isThisLostKnown(intId)){
			return null;
		}

		//destroy all ship that belong to the player
		for (var i = 0; i < this.arrayWorldInformation["troops"].length; i++) {
			if(this.arrayWorldInformation["troops"][i]["player"] == intId){
				//save the troop
				var arrayCurrentTroop = this.arrayWorldInformation["troops"][i]
				//delete the ship
				this.arrayWorldInformation["troops"].splice(i, 1)
				//set an explosion
				intStartTime = new Date().getTime() - this.intGameStartedAt;
				this.arrayWorldInformation["animation"].push({ "type" : "DUMMY",  "startTime" : intStartTime, "positionX" : arrayCurrentTroop["positionX"], "positionY" : arrayCurrentTroop["positionY"], "troop" : arrayCurrentTroop});
				this.arrayWorldInformation["animation"].push({ "type" : "FIGHT", "positionX" : arrayCurrentTroop["positionX"], "positionY" : arrayCurrentTroop["positionY"], "startTime" : intStartTime});
			}
		};

		//rest all planets
		for (var i = 0; i < this.arrayWorldInformation["planets"].length; i++) {
			if(this.arrayWorldInformation["planets"][i]["player"] == intId){
				this.arrayWorldInformation["planets"][i]["player"] = null;
			}
		}


		this.arrayWorldInformation["loserIds"].push(intId);

	}


	this.getPlanetIdByPosition = function(pointPosition){
    	var arrayPlanets = this.arrayWorldInformation["planets"]

    	for (var i = 0; i < arrayPlanets.length; i++) {//check all planets if the position machetes
    	  if(arrayPlanets[i]["positionX"] == pointPosition.intX && arrayPlanets[i]["positionY"] == pointPosition.intY){
    	    //if the planet match return the id
    	    return i;
    	  }
    	}

    	return null;
  	}


	this.getTroopsIdByPosition = function(pointPosition){
    	var arrayTroops = this.arrayWorldInformation["troops"]
    	var arrayTroopIdOnThatPosition = new Array();
    	for (var i = 0; i < arrayTroops.length; i++) {//check all troops if the position machetes
    	  if(arrayTroops[i]["positionX"] == pointPosition.intX && arrayTroops[i]["positionY"] == pointPosition.intY){
    	    //if the troop match return the id
    	    arrayTroopIdOnThatPosition.push(i);
    	  }
    	}
    	return arrayTroopIdOnThatPosition;
  	}



	this.interactTowTroops = function(arrayTroop0, arrayTroop1){
		if(arrayTroop0["player"] != arrayTroop1["player"]){
			//let tow Troops fight; returns the winner
			//todo: better betels with morale
			//which one wins
			if(arrayTroop0["size"] * arrayTroop0["morale"] > arrayTroop1["size"] * arrayTroop1["morale"]){//Troop0 win
				arrayReturnTroop = arrayTroop0;
				arrayTroop0["size"] = Math.round((arrayTroop0["size"] * arrayTroop0["morale"] - arrayTroop1["size"] * arrayTroop1["morale"])/arrayTroop0["morale"]);//calculate the new size
			}else{//Troop1 win
				arrayReturnTroop = arrayTroop1;
				arrayTroop1["size"] = Math.round((arrayTroop1["size"] * arrayTroop1["morale"] - arrayTroop0["size"] * arrayTroop0["morale"])/arrayTroop1["morale"]);//calculate the new size
			}
			return  arrayReturnTroop;
		}else{
			
			intNewSize = arrayTroop0["size"] + arrayTroop1["size"]

			//get the average technic Level of the troops
			intNewTechnicLevel = ((arrayTroop0["size"] * arrayTroop0["technicLevel"]) + (arrayTroop1["size"] * arrayTroop1["technicLevel"]))/intNewSize

			//get the average morale Level of the troops
			intNewMorale = ((arrayTroop0["size"] * arrayTroop0["morale"]) + (arrayTroop1["size"] * arrayTroop1["morale"]))/intNewSize

			arrayReturnTroop = arrayTroop0
			//set the new values
			arrayReturnTroop["size"] 			= intNewSize;
			arrayReturnTroop["technicLevel"] 	= intNewTechnicLevel;
			arrayReturnTroop["morale"] 			= intNewMorale;

			arrayReturnTroop["moveable"] = false;
			return arrayReturnTroop;
		}

	}


	this.nextTurn = function(){
		//spawn new Troops on planets
		var arrayPlanets = this.arrayWorldInformation["planets"]

    	for (var i = 0; i < arrayPlanets.length; i++) {
    		//test if the planet has a owner and it is the player of the round that ended
    		if(arrayPlanets[i]["player"] == this.arrayWorldInformation["moveOf"]){
    			var pointPosition = new point(arrayPlanets[i]["positionX"], arrayPlanets[i]["positionY"]);

    			if(this.getTroopsIdByPosition(pointPosition).length > 0){//check if there is a troop over the planet
    				//add population amount to the troop
    				var intId = this.getTroopsIdByPosition(pointPosition)[0];
    				this.arrayWorldInformation["troops"][intId]["size"] += Math.round(arrayPlanets[i]["population"]);

    				//increase technical level
    				this.arrayWorldInformation["troops"][intId]["technicLevel"] += arrayPlanets[i]["knowledge"]*0.1;

    				//max level is 5
    				//todo: define by race
    				this.arrayWorldInformation["troops"][intId]["technicLevel"] = Math.min(5, this.arrayWorldInformation["troops"][intId]["technicLevel"]);


    				//increase morale
    				this.arrayWorldInformation["troops"][intId]["morale"] += arrayPlanets[i]["recoveryFactor"]*0.03;

    				//max level is 2.5
    				//todo: define by race
    				this.arrayWorldInformation["troops"][intId]["morale"] = Math.min(2.5, this.arrayWorldInformation["troops"][intId]["morale"]);



    			}else{
    				//spawn a new Troop
    				arrayNewTroop = {"size": Math.round(arrayPlanets[i]["population"]), "player" : arrayPlanets[i]["player"], "positionX": pointPosition.intX, "positionY": pointPosition.intY, "technicLevel" : 1, "morale": 1, "moveAble" : true};
    				this.arrayWorldInformation["troops"].push(arrayNewTroop);
    			}
    		}
    	}

    	//set the time back
		this.arrayWorldInformation["timeToNextTurn"] = this.arrayWorldInformation["timePerTurn"];


		//change the player
		do{
			this.arrayWorldInformation["moveOf"] += 1;
			this.arrayWorldInformation["moveOf"] %= this.arrayMyPlayers.length;
		}while(this.isThisLostKnown(this.arrayWorldInformation["moveOf"]));//change the player again if the next player has already lost




		//set all troops back to moveable
		for (var i = 0; i < this.arrayWorldInformation["troops"].length; i++) {
			this.arrayWorldInformation["troops"][i]["moveAble"] = true;
		};

	}


	this.update = function(){
		//update the game

		//todo: real time calculation
		this.arrayWorldInformation["timeToNextTurn"] -= 0.100;

		if(this.arrayWorldInformation["timeToNextTurn"] <= 0){//change the turn

			this.nextTurn();

			//set all troops back to moveable
			for (var i = 0; i < this.arrayWorldInformation["troops"].length; i++) {
				this.arrayWorldInformation["troops"][i]["moveAble"] = true;
			};
		}

		//clear the animation
		for (var i = 0; i < this.arrayWorldInformation["animation"].length; i++) {
			intParsedTime = (new Date().getTime() - this.intGameStartedAt ) - this.arrayWorldInformation["animation"][i]["startTime"]
			if(intParsedTime > 3000){
				this.arrayWorldInformation["animation"].splice(i,1);
			}
		};

		//update past time (to sing with the client)
		this.arrayWorldInformation["pastTime"] = new Date().getTime() - this.intGameStartedAt;

		this.sendUpdate();
	}



	this.sendUpdate = function(){

		for (var i = 0; i < this.arrayMyPlayers.length; i++) {//take every Player
			if(this.arrayMyPlayers[i] != null){//set only if the client isn't null
				//get the Player Id
				intPlayerId = arrayAllPlayers.indexOf(this.arrayMyPlayers[i]);

				//change the Information so that the player know who he is
				this.arrayWorldInformation["youAre"] = i;

				var strWorldInformation = JSON.stringify(this.arrayWorldInformation);

				//send him the new version of the game information
				sendToSocket(intPlayerId, strWorldInformation)
			}
		};

	}

	this.interpretCommand = function(playerPlayer, arrayCommand){
		//if the client/player send a move or something like that

		if(arrayCommand["command"] == "MOVE"){//move a troop
			//test if it is the move of this player
			if(this.arrayWorldInformation["moveOf"] != this.arrayMyPlayers.indexOf(playerPlayer)){
				console.warn(playerPlayer.strName + " try to move but its not his move.");
				return;
			}

			//test if the troop has already been moved
			if(!this.arrayWorldInformation["troops"][arrayCommand["troopId"]]["moveAble"]){
				console.warn(playerPlayer.strName + " try to move a troop twice.");
				return;
			}

			//test if the is the troop of the player
			if(this.arrayWorldInformation["troops"][arrayCommand["troopId"]]["player"] != this.arrayMyPlayers.indexOf(playerPlayer)){
				console.warn(playerPlayer.strName + " try to move a troop that isn't his.");
				return;
			}

			//test if the player trys to move a troop out of its range
			var intTechnicLevel = Math.floor(this.arrayWorldInformation["troops"][arrayCommand["troopId"]]["technicLevel"]);
			var pointCurrentPosition = new point(this.arrayWorldInformation["troops"][arrayCommand["troopId"]]["positionX"], this.arrayWorldInformation["troops"][arrayCommand["troopId"]]["positionY"])
			var pointDestination = new point(arrayCommand["newX"], arrayCommand["newY"]);

			if(!(new hexagonalGrid().areXAwayNeighbor(pointCurrentPosition, pointDestination, intTechnicLevel))){
				console.warn(playerPlayer.strName + " try move a troop out of its range.");
				return;
			}
			
			//save for the animation
			var pointStartPosition 	= new point(this.arrayWorldInformation["troops"][arrayCommand["troopId"]]["positionX"], this.arrayWorldInformation["troops"][arrayCommand["troopId"]]["positionY"])
			var intTroopId 			= arrayCommand["troopId"];
			var arrayMovedTroop 	= this.arrayWorldInformation["troops"][arrayCommand["troopId"]];



			//make the move
			this.arrayWorldInformation["troops"][arrayCommand["troopId"]]["positionX"] = arrayCommand["newX"];
			this.arrayWorldInformation["troops"][arrayCommand["troopId"]]["positionY"] = arrayCommand["newY"];
			this.arrayWorldInformation["troops"][arrayCommand["troopId"]]["moveAble"] = false;//the troop can only move once

			//test if there are more than one troop on the field ...
			var arrayTroopIdOnField = this.getTroopsIdByPosition(new point(arrayCommand["newX"], arrayCommand["newY"]));
				
			//create a array the the troops and not the ids
			//(because they don't chage when a object is removed)
			var arrayTroopOnField = new Array();
			for (var i = 0; i < arrayTroopIdOnField.length; i++) {
				arrayTroopOnField.push(this.arrayWorldInformation["troops"][arrayTroopIdOnField[i]]);
			};
			if(arrayTroopIdOnField.length > 1){
				console.log("Fight");

				//and then let them interact
				arrayNewTroop = this.interactTowTroops(this.arrayWorldInformation["troops"][arrayTroopIdOnField[0]], this.arrayWorldInformation["troops"][arrayTroopIdOnField[1]]);
				//console.log("Winner");
				console.log(arrayNewTroop);
				
				//remove the old troops 
				console.log("troop0: ");
				console.log(arrayTroopOnField[0]);
				
				console.log("troop1: ");
				console.log(arrayTroopOnField[1]);

				//place a dummy the troop that has not been moved
				
				if(arrayTroopOnField[0] == arrayMovedTroop){
					//troop one hasn't moved
					intStartTime = new Date().getTime() - this.intGameStartedAt 
					this.arrayWorldInformation["animation"].push({ "type" : "DUMMY",  "startTime" : intStartTime, "positionX" : arrayTroopOnField[1]["positionX"], "positionY" : arrayTroopOnField[1]["positionY"], "troop" : arrayTroopOnField[1]});
				}else{
					//troop zero hasn't moved
					intStartTime = new Date().getTime() - this.intGameStartedAt 
					this.arrayWorldInformation["animation"].push({ "type" : "DUMMY",  "startTime" : intStartTime, "positionX" : arrayTroopOnField[0]["positionX"], "positionY" : arrayTroopOnField[0]["positionY"], "troop" : arrayTroopOnField[0]});
				}


				this.arrayWorldInformation["troops"].splice(this.arrayWorldInformation["troops"].indexOf(arrayTroopOnField[0]), 1);
				this.arrayWorldInformation["troops"].splice(this.arrayWorldInformation["troops"].indexOf(arrayTroopOnField[1]), 1);

				//console.log("after remove")
				//console.log(this.arrayWorldInformation["troops"])

				//add the new Troop
				this.arrayWorldInformation["troops"].push(arrayNewTroop);

				if(arrayNewTroop["player"] == this.arrayMyPlayers.indexOf(playerPlayer)){
					//means that the troop that had moved has won
					//and now the troop id is change
					intTroopId = this.arrayWorldInformation["troops"].length-1;//because it is now always the last ship in the array
				}else{
					intTroopId = null; //because the ship don't exist any more.
				}

				//alert("to hear");

				if(arrayTroopOnField[0]["player"] != arrayTroopOnField[1]["player"]){//because only if they belong to different player is a fight
					//set Fight animation
					intStartTime = new Date().getTime() - this.intGameStartedAt 
					this.arrayWorldInformation["animation"].push({ "type" : "FIGHT", "positionX" : arrayCommand["newX"], "positionY" : arrayCommand["newY"], "startTime" : intStartTime});
				}

				//console.log(this.arrayWorldInformation["troops"])
			}

			//set the animation
			//console.log("set Jump Animation");
			intStartTime = new Date().getTime() - this.intGameStartedAt 
			this.arrayWorldInformation["animation"].push({ "type" : "JUMP",  "startTime" : intStartTime, "shipId" : intTroopId, "startPositionX" : pointStartPosition.intX, "startPositionY" : pointStartPosition.intY, "troop" : arrayMovedTroop});
			//shipId is for blocking the normal draw of the ship and troop all Information for drawing it


			//if there is a planet
			if(this.getPlanetIdByPosition(new point(arrayCommand["newX"], arrayCommand["newY"])) != null){
				//save the id of the planet
				var intPlanetId = this.getPlanetIdByPosition(new point(arrayCommand["newX"], arrayCommand["newY"]));
				//save the id of the troop
				var intTroopId = this.getTroopsIdByPosition(new point(arrayCommand["newX"], arrayCommand["newY"]))[0];

				//override the owner
				this.arrayWorldInformation["planets"][intPlanetId]["player"] = this.arrayWorldInformation["troops"][intTroopId]["player"]
			}


			//test if that was the win turn

			//count the troops of each Player
			var intTroopAmounts = new Array();
			
			//set the start value to 0
			for (var i = 0; i < this.arrayMyPlayers.length; i++) {
				intTroopAmounts[i] = 0;
			};
			
			//count
			for (var i = 0; i < this.arrayWorldInformation["troops"].length; i++) {
				intTroopAmounts[this.arrayWorldInformation["troops"][i]["player"]] ++ ;
			};

			//if any player has no troops set him to loser
			for (var i = 0; i < this.arrayMyPlayers.length; i++) {
				if(intTroopAmounts[i] == 0){
					this.letPlayerLose(i);
				}
			};


			return;
		}else if(arrayCommand["command"] == "ENDTURN"){//end the turn
			//check if it is the Turn of the player
			if(this.arrayWorldInformation["moveOf"] != this.arrayMyPlayers.indexOf(playerPlayer)){
				console.log(playerPlayer.strName + " try end a Turn that isn't his.")
				return;
			}
			this.nextTurn();
			return;

		}else if(arrayCommand["command"] == "LEAVEGAME"){//let one player leave the Game
			intPlayerId = this.arrayMyPlayers.indexOf(playerPlayer);
			this.arrayMyPlayers[intPlayerId] = null;//set the game for this player to null
			playerPlayer.gameMyGame = null;
		}else if(arrayCommand["command"] == "SURRENDER"){//let one player leave the Game
			var intPlayerId = this.arrayMyPlayers.indexOf(playerPlayer);
			this.letPlayerLose(intPlayerId);
		}

		console.error("unknown game-command");
		console.log(arrayCommand);

	}

	//place the planets for the game
	//var boolMirrored = true; //to make the game more fair by mirroring the planets
	/*
	for( i = 0; i < this.arrayWorldInformation["planetAmount"]; i++){
		
		//generate position for plants until one position is find where no planet is jet
		pointNewPlanetAt = new point(0, 0)
		do {
			pointNewPlanetAt.intX = Math.floor(Math.random()*this.arrayWorldInformation["mapWidth"])
			pointNewPlanetAt.intY = Math.floor(Math.random()*this.arrayWorldInformation["mapHeight"])
			console.log(pointNewPlanetAt.toString());
			console.log(this.getPlanetIdByPosition(pointNewPlanetAt));
		} while(this.getPlanetIdByPosition(pointNewPlanetAt) != null)

		//per 1 Population size of troop increase by one
		intPopulation = Math.floor(Math.random()*3*10)/10;

		//per 1 Knowledge technical Level is increase by 0.03
		intKnowledge = Math.floor(Math.random()*10);

		// per 1 recovery factor morale is increase by 0.03;
		intRecoveryFactor = Math.floor(Math.random()*5);

		this.arrayWorldInformation["planets"][i] = {"player" : null, "positionX": pointNewPlanetAt.intX, "positionY": pointNewPlanetAt.intY, "population" : intPopulation , "recoveryFactor" : intRecoveryFactor, "knowledge" : intKnowledge};
	}

	*/

	for( i = 0; i < this.arrayWorldInformation["planetAmount"]; i+=2){
		
		intMiddleX = Math.floor(this.arrayWorldInformation["mapWidth"]/2);
		
		//generate position for plants until one position is find where no planet is jet
		pointNewPlanetAt = new point(0, 0)
		do {
			pointNewPlanetAt.intX = Math.floor(Math.random()*intMiddleX)
			pointNewPlanetAt.intY = Math.floor(Math.random()*this.arrayWorldInformation["mapHeight"]);
		} while(this.getPlanetIdByPosition(pointNewPlanetAt) != null)

		//per 1 Population size of troop increase by one
		intPopulation = Math.floor(Math.random()*3*10)/10;

		//per 1 Knowledge technical Level is increase by 0.03
		intKnowledge = Math.floor(Math.random()*10);

		// per 1 recovery factor morale is increase by 0.03;
		intRecoveryFactor = Math.floor(Math.random()*5);

		this.arrayWorldInformation["planets"][i] = {"player" : null, "positionX": pointNewPlanetAt.intX, "positionY": pointNewPlanetAt.intY, "population" : intPopulation , "recoveryFactor" : intRecoveryFactor, "knowledge" : intKnowledge};
	


		//create the mirror planet position
		pointNewMirrorPlanetAt = new point(0, pointNewPlanetAt.intY);
		pointNewMirrorPlanetAt.intX = this.arrayWorldInformation["mapWidth"] - pointNewPlanetAt.intX -1;

		pointNewMirrorPlanetAt.intY = this.arrayWorldInformation["mapHeight"] - pointNewPlanetAt.intY -1;

		//set the planet
		this.arrayWorldInformation["planets"][i+1] = {"player" : null, "positionX": pointNewMirrorPlanetAt.intX, "positionY": pointNewMirrorPlanetAt.intY, "population" : intPopulation , "recoveryFactor" : intRecoveryFactor, "knowledge" : intKnowledge};
	

	}


}


arrayAllPlayers	= new Array();//all Players currently connected to this server
arrayAllGames	= new Array();//all Games currently running;




function interpretMessage(intId, strText){

	console.log(strText);

	var arrayCommand = JSON.parse(strText);
	//"type" says which kind of command it is.

	console.log(arrayCommand);


	if(arrayCommand["type"] == "REGISTER"){
		//a new client set his name etc.

		//add the new Player into the array
		arrayAllPlayers[intId] = new Player(intId, arrayCommand["name"]);

		return;
	}else if(arrayCommand["type"] == "CREATEGAME"){
		//create a new Game
		console.log(arrayAllPlayers[intId]);
		arrayAllGames.push(new Game(arrayCommand["name"], arrayAllPlayers[intId], arrayCommand["settings"]));

		//update the lobby for every Player
		sendToEveryone(getLobby());

		return;
	}else if(arrayCommand["type"] == "JOINGAME"){
		//join a game as 2ed player
		var intGameId = arrayCommand["id"];

		//test if there is space
		if(!arrayAllGames[intGameId].isFull()){
			//join the player
			arrayAllGames[intGameId].joinPlayer(arrayAllPlayers[intId])
		}else{
			console.log("try to join a full game");
		}
		return;
	}else if(arrayCommand["type"] == "GETLOBBYINFO"){
		//send the Lobby information
		sendToSocket(intId, getLobby());

		return;
	}else if(arrayCommand["type"] == "GAMECOMMAND"){
		arrayAllPlayers[intId].gameMyGame.interpretCommand(arrayAllPlayers[intId], arrayCommand);
		return;
	}

	console.error("get an unknown Command");
	console.log(arrayCommand);
}


function update(){
	//update the display

	//clear the Window
	clearInfo();

	//print the clients on the window
	printInfo("<h3>----------------------- Player ---------------------</h3>");
	for (var i = 0; i < arrayAllPlayers.length; i++) {
		printInfo(i + ": " + arrayAllPlayers[i].strName + "<br>");
	};

	printInfo("<h3>----------------------- Games ----------------------</h3>");
	for (var i = 0; i < arrayAllGames.length; i++) {
		printInfo(i + ": " + arrayAllGames[i].strName +  " (");

		//display all players in the game
		for (var x = 0; x < arrayAllGames[i].arrayMyPlayers.length; x++) {
			
			if(x != 0){
				printInfo("|");
			}
			if(arrayAllGames[i].arrayMyPlayers[x] != null){
				printInfo(arrayAllGames[i].arrayMyPlayers[x].strName);
			}

		};
		printInfo(") <br>");
	};
	printInfo("version: "+ getVersion());

	//kick disconnected Player;
	for (var i = 0; i < arrayAllPlayers.length; i++) {
		if(!isConnectionToSocket(i)){
			arrayAllPlayers.splice(i, 1);
			arrayAllSockets.splice(i, 1);
		}
	};


	//update all games
	for (var i = 0; i < arrayAllGames.length; i++) {
		//but only if the game is full
		if(arrayAllGames[i].isFull()){
			arrayAllGames[i].update();
		}
	}
}


function getLobby(){//return all Information that is needed to show the Lobby
	strLobbyInformation  = '{';

	strLobbyInformation += '"type" : "LOBBYINFO",';

	strLobbyInformation += '"online" : ' + getAmountOfConnectedClients() + ',';

	strLobbyInformation += '"games" : [';

	for (var i = 0; i < arrayAllGames.length; i++) {//check every game
		if(i != 0){
			strLobbyInformation += ',';
		}
		strLobbyInformation += ' " '+ arrayAllGames[i].strName + '"';//write every name
	};

	strLobbyInformation += ']';

	strLobbyInformation += '}';

	return strLobbyInformation;
}

callInInterval(update, 100);


createServer();
functionOnMessage = interpretMessage;
