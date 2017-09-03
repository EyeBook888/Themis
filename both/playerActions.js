arrayPlayerActions = new Array();


arrayPlayerActions.push(
	new function(){
		//id = element number in Array
		this.arrayData = {"name" : "surrender", "id" : 0};


		this.takePlace = function(gameGame, intPlayerId){
			console.log("action take Place");
			gameGame.letPlayerLose(intPlayerId);
		}

		this.canTakeAction = function(gameGame, intPlayerId){
			return true;
		};


	}
	)


arrayPlayerActions.push(
	new function(){
		//id = element number in Array
		this.arrayData = {"name" : "destroy all ships", "id" : 1};


		this.takePlace = function(gameGame, intPlayerId){
			gameGame.arrayWorldInformation["troops"] = new Array();
		}

		this.canTakeAction = function(gameGame, intPlayerId){
			return gameGame.arrayWorldInformation["moveOf"] == intPlayerId;
		};


	}
	)



