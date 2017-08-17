function Player(intId, strName){
	this.intId 		= intId;
	this.strName 	= strName;
	this.gameMyGame = null;
}

function Game(strName, playerHost){
	console.log("new Game");
	this.strName 			= strName;
	this.arrayMyPlayers 	= new Array();


	this.arrayMyPlayers[0] = playerHost;
	this.arrayMyPlayers[0].gameMyGame = this;//register this Game at the HostPlayer


	//all information about the game
	this.arrayWorldInformation = {
		"type" : "WORLDINFO" //if you send this data the client knows what it is. 
	}


	this.arrayWorldInformation["mapHeight"] = 10;
	this.arrayWorldInformation["mapWidth"] = 20;
	this.arrayWorldInformation["planetAmount"] = 20;
	this.arrayWorldInformation["moveOf"] = 0;
	this.arrayWorldInformation["timePerTurn"] = 30;
	this.arrayWorldInformation["timeToNextTurn"] = this.arrayWorldInformation["timePerTurn"];

	this.arrayWorldInformation["troops"] = new Array();
	//place start troop
	this.arrayWorldInformation["troops"][0] = {"size": 5, "player" : 0, "positionX": 0, "positionY": 0, "technicLevel" : 3, "moveAble" : true}
	this.arrayWorldInformation["troops"][1] = {"size": 5, "player" : 1, "positionX": 19, "positionY": 9, "technicLevel" : 3, "moveAble" : true}

	this.arrayWorldInformation["planets"] = new Array();



	this.joinPlayer = function(playerPlayer){
		console.log(playerPlayer)
		this.arrayMyPlayers[1] = playerPlayer;
		this.arrayMyPlayers[1].gameMyGame = this;//register this Game at the 2ed Player

		this.sendUpdate();
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
			if(arrayTroop0["size"] > arrayTroop1["size"]){//Troop0 win
				arrayReturnTroop = arrayTroop0;
				arrayTroop0["size"] = arrayTroop0["size"] - arrayTroop1["size"];//later more advanced calculation 
			}else{//Troop1 win
				arrayReturnTroop = arrayTroop1;
				arrayTroop1["size"] = arrayTroop1["size"] - arrayTroop0["size"];//later more advanced calculation
			}

			return  arrayReturnTroop;
		}else{
			arrayReturnTroop = arrayTroop0
			arrayReturnTroop["size"] += arrayTroop1["size"]
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
    				this.arrayWorldInformation["troops"][intId]["size"] += arrayPlanets[i]["population"]
    			}else{
    				//spawn a new Troop
    				arrayNewTroop = {"size": arrayPlanets[i]["population"], "player" : arrayPlanets[i]["player"], "positionX": pointPosition.intX, "positionY": pointPosition.intY, "technicLevel" : 2, "moveAble" : true};
    				this.arrayWorldInformation["troops"].push(arrayNewTroop);
    			}
    		}
    	}

    	//set the time back
		this.arrayWorldInformation["timeToNextTurn"] = this.arrayWorldInformation["timePerTurn"];


		//change the player	
		this.arrayWorldInformation["moveOf"] += 1;
		this.arrayWorldInformation["moveOf"] %= this.arrayMyPlayers.length;




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

		this.sendUpdate();
	}



	this.sendUpdate = function(){

		for (var i = 0; i < this.arrayMyPlayers.length; i++) {//take every Player
			//get the Player Id
			intPlayerId = arrayAllPlayers.indexOf(this.arrayMyPlayers[i]);

			//change the Information so that the player know who he is
			this.arrayWorldInformation["youAre"] = i;

			var strWorldInformation = JSON.stringify(this.arrayWorldInformation);

			//send him the new version of the game information
			sendToSocket(intPlayerId, strWorldInformation)
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
			var intTechnicLevel = this.arrayWorldInformation["troops"][arrayCommand["troopId"]]["technicLevel"];
			var pointCurrentPosition = new point(this.arrayWorldInformation["troops"][arrayCommand["troopId"]]["positionX"], this.arrayWorldInformation["troops"][arrayCommand["troopId"]]["positionY"])
			var pointDestination = new point(arrayCommand["newX"], arrayCommand["newY"]);

			if(!(new hexagonalGrid().areXAwayNeighbor(pointCurrentPosition, pointDestination, intTechnicLevel))){
				console.warn(playerPlayer.strName + " try move a troop out of its range.");
				return;
			}

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
				//BUG: same how the wrong troop get cut off
				console.log("troop0: ");
				console.log(arrayTroopOnField[0]);
				
				console.log("troop1: ");
				console.log(arrayTroopOnField[1]);

				this.arrayWorldInformation["troops"].splice(this.arrayWorldInformation["troops"].indexOf(arrayTroopOnField[0]), 1);
				this.arrayWorldInformation["troops"].splice(this.arrayWorldInformation["troops"].indexOf(arrayTroopOnField[1]), 1);

				//console.log("after remove")
				//console.log(this.arrayWorldInformation["troops"])

				//add the new Troop
				this.arrayWorldInformation["troops"].push(arrayNewTroop);

				//console.log(this.arrayWorldInformation["troops"])
			}


			//if there is a planet
			if(this.getPlanetIdByPosition(new point(arrayCommand["newX"], arrayCommand["newY"])) != null){
				//save the id of the planet
				var intPlanetId = this.getPlanetIdByPosition(new point(arrayCommand["newX"], arrayCommand["newY"]));
				//save the id of the troop
				var intTroopId = this.getTroopsIdByPosition(new point(arrayCommand["newX"], arrayCommand["newY"]))[0];

				//override the owner
				this.arrayWorldInformation["planets"][intPlanetId]["player"] = this.arrayWorldInformation["troops"][intTroopId]["player"]
			}


			return;
		}

		console.error("unknown game-command");
		console.log(arrayCommand);

	}

	//place the planets for the game
	for( i = 0; i < this.arrayWorldInformation["planetAmount"]; i++){
		
		//generate position for plants until one position is find where no planet is jet
		pointNewPlanetAt = new point(0, 0)
		do {
			pointNewPlanetAt.intX = Math.floor(Math.random()*this.arrayWorldInformation["mapWidth"])
			pointNewPlanetAt.intY = Math.floor(Math.random()*this.arrayWorldInformation["mapHeight"])
			console.log(pointNewPlanetAt.toString());
			console.log(this.getPlanetIdByPosition(pointNewPlanetAt));
		} while(this.getPlanetIdByPosition(pointNewPlanetAt) != null)

		intPopulation = 1; //todo: random

		this.arrayWorldInformation["planets"][i] = {"player" : null, "positionX": pointNewPlanetAt.intX, "positionY": pointNewPlanetAt.intY, "population" : intPopulation}
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
		arrayAllGames.push(new Game(arrayCommand["name"], arrayAllPlayers[intId]));

		//update the lobby for every Player
		sendToEveryone(getLobby());

		return;
	}else if(arrayCommand["type"] == "JOINGAME"){
		//join a game as 2ed player
		var intGameId = arrayCommand["id"];

		//test if there is space
		if(arrayAllGames[intGameId].arrayMyPlayers.length == 1){
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
	document.body.innerHTML = "";

	//print the clients on the window
	document.body.innerHTML = document.body.innerHTML + "<h3>----------------------- Player ---------------------</h3>";
	for (var i = 0; i < arrayAllPlayers.length; i++) {
		document.body.innerHTML = document.body.innerHTML + i + ": " + arrayAllPlayers[i].strName + "<br>";
	};

	document.body.innerHTML = document.body.innerHTML + "<h3>----------------------- Games ----------------------</h3>";
	for (var i = 0; i < arrayAllGames.length; i++) {
		document.body.innerHTML += i + ": " + arrayAllGames[i].strName +  " (";

		//display all players in the game
		for (var x = 0; x < arrayAllGames[i].arrayMyPlayers.length; x++) {
			if(x != 0){
				document.body.innerHTML += "|";
			}
			document.body.innerHTML += arrayAllGames[i].arrayMyPlayers[x].strName
		};
		document.body.innerHTML += ") <br>";
	};
	document.body.innerHTML += "version: "+ getVersion();

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
		if(arrayAllGames[i].arrayMyPlayers.length == 2){
			arrayAllGames[i].update();
		}
	}
}


function getLobby(){//return all Information that is needed to show the Lobby
	strLobbyInformation  = '{';

	strLobbyInformation += '"type" : "LOBBYINFO",';

	strLobbyInformation += '"online" : ' + this.arrayAllPlayers.length + ',';

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

window.setInterval(update, 100);


createServer();
functionOnMessage = interpretMessage;
