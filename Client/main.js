gameProjectionCurrentGame = null;

function gameProjection(){

  this.arrayWorldInformation = null;

  this.canvasCanvas   = document.getElementById("gameBoard");
  this.contextContext = this.canvasCanvas.getContext("2d");

  this.intSelection = new point(0, 0);
  this.pointHover = new point(0, 0);
  this.pointSelection = new point(-1, -1);//a negative value means no selection

  this.intGameStartedAt = new Date().getTime();// to measure the time since the game has started
  //a proximity the time since this gameProjection was created, but the real time is coming from the Server


  //load the needed images
  this.arrayImages = new Array();
  //planets
  this.arrayImages["planet00"] = new Image();
  this.arrayImages["planet00"].src = "../Images/planet00.png"
  
  this.arrayImages["planet01"] = new Image();
  this.arrayImages["planet01"].src = "../Images/planet01.png"
  
  this.arrayImages["planet02"] = new Image();
  this.arrayImages["planet02"].src = "../Images/planet02.png"
  
  this.arrayImages["planet03"] = new Image();
  this.arrayImages["planet03"].src = "../Images/planet03.png"
  //troops
  this.arrayImages["troopRedSmall"] = new Image();
  this.arrayImages["troopRedSmall"].src = "../Images/troopRedSmall.png"

    this.arrayImages["troopBlueSmall"] = new Image();
  this.arrayImages["troopBlueSmall"].src = "../Images/troopBlueSmall.png"



  intTestDistance = 2;

  //for the bord
  this.contextContext.fillHexagon = function(intX, intY, intWidth, intHeight){
    this.beginPath();

    //order:
    //  1
    //6   2
    //5   3
    //  4

    //1
    this.moveTo(intX + intWidth/2, intY);

    //2
    this.lineTo(intX + intWidth, intY + intHeight*(1/4))
    
    //3
    this.lineTo(intX + intWidth, intY + intHeight*(3/4))    
    
    //4
    this.lineTo(intX + intWidth/2, intY + intHeight)
    
    //5
    this.lineTo(intX, intY + intHeight*(3/4))

    //6
    this.lineTo(intX, intY + intHeight*(1/4)) 
  
    //1
    this.lineTo(intX + intWidth/2, intY);


    this.closePath();

    this.fill()
    this.stroke()
  }

  document.getElementById("lobbyUi").style.visibility = "hidden"
  document.getElementById("game").style.visibility = "visible"

  this.getTroopIdByPosition = function(pointPosition){
    arrayTroops = this.arrayWorldInformation["troops"]
    for (var i = 0; i < arrayTroops.length; i++) {//check all troops if the position machetes
      if(arrayTroops[i]["positionX"] == pointPosition.intX && arrayTroops[i]["positionY"] == pointPosition.intY){
        //if the troop match return the id
        return i;
      }
    }
    return null;
  }

  this.getPlanetIdByPosition = function(pointPosition){
    arrayPlanets = this.arrayWorldInformation["planets"]
    for (var i = 0; i < arrayPlanets.length; i++) {//check all troops if the position machetes
      if(arrayPlanets[i]["positionX"] == pointPosition.intX && arrayPlanets[i]["positionY"] == pointPosition.intY){
        //if the troop match return the id
        return i;
      }
    }
    return null;
  }

  //mousemove Event
  this.onMouseMove = function(eventE){

    //calculate the Hexagon Size
    var intMapHeight = this.arrayWorldInformation["mapHeight"]
    var intMapWidth  = this.arrayWorldInformation["mapWidth"]
    
    var intHexWidth  = this.canvasCanvas.width/(intMapWidth+(1/2));
    var intHexHeight = intHexWidth;


    //mouse position
    var intX = eventE.clientX;
    var intY = eventE.clientY;

    var pointMouse = new point(intX, intY);


    //check all hexagons if the mouse collide
    for (var intX = 0; intX < intMapWidth; intX++) {
      for (var intY = 0; intY < intMapHeight; intY++) {

          var hexagonCurrent = new hexagon(
            intX*intHexWidth + (intY%2)*intHexWidth/2,//every 2ed line has to be a bit more to the right
            intY*intHexHeight*(3/4),
            intHexWidth,
            intHexHeight)

          if(hexagonCurrent.collisionWithPoint(pointMouse)){
              this.pointHover = new point(intX, intY);
          }

      };
    };

    strInfoHTML = "";

    //set the info about the troop if there is one
    if(this.getTroopIdByPosition(this.pointHover) != null){
      intTroopId = this.getTroopIdByPosition(this.pointHover)
      strInfoHTML+= "-- Troop --<br>";
      strInfoHTML+= "size: " + this.arrayWorldInformation["troops"][intTroopId]["size"] + "<br>";
      strInfoHTML+= "technology: " + this.arrayWorldInformation["troops"][intTroopId]["technicLevel"] + "<br>";
      strInfoHTML+= "morale: " + this.arrayWorldInformation["troops"][intTroopId]["morale"] + "<br>";
    }

    

    //set the planet Info if there is one
    if(this.getPlanetIdByPosition(this.pointHover) != null){

      intPlanetId = this.getPlanetIdByPosition(this.pointHover)
      strInfoHTML += "<br>-- Planet --<br>" ;
      strInfoHTML += "population: " + this.arrayWorldInformation["planets"][intPlanetId]["population"] + " billion <br>";


      strInfoHTML += "knowledge: ";
      intKnowledge = this.arrayWorldInformation["planets"][intPlanetId]["knowledge"]
      //schow ++ + o - -- instead of number
      if(intKnowledge == 10 || intKnowledge == 9 ){
        strInfoHTML += "++<br>" ;
      }else if(intKnowledge == 8 || intKnowledge == 7 ){
        strInfoHTML += "+<br>" ;
      }else if(intKnowledge == 6 || intKnowledge == 5 ){
        strInfoHTML += "o<br>" ;
      }else if(intKnowledge == 4 || intKnowledge == 3 ){
        strInfoHTML += "-<br>" ;
      }else{
        strInfoHTML += "--<br>" ;
      }

      strInfoHTML += "recovery factor: " + this.arrayWorldInformation["planets"][intPlanetId]["recoveryFactor"];
    }
    
    if(strInfoHTML == ""){
      //if there is no info
      document.getElementById("HoverInfo").innerHTML = " hover over a troop or planet";
    }else{
      document.getElementById("HoverInfo").innerHTML = strInfoHTML;
    }

  }

  //if the player clicks on end Turn
  this.endTurn = function(){
    strJson = '{ "type": "GAMECOMMAND", "command": "ENDTURN" }'
    sendToServer(strJson)
  }

  //to leave the game
  this.leaveGame = function(){
    //send command to Server
    strJson = '{ "type": "GAMECOMMAND", "command": "LEAVEGAME" }'
    sendToServer(strJson);

    // make Lobby visible
    document.getElementById("lobbyUi").style.visibility = "visible"
    document.getElementById("game").style.visibility = "hidden"

    //delete this game
    gameProjectionCurrentGame = null;
  }

  //to surrender
  this.surrender = function(){
    strJson = '{ "type": "GAMECOMMAND", "command": "SURRENDER" }'
    sendToServer(strJson);//send command to Server
  }


  this.onMouseDown = function(eventE){//the click event
    //console.log("click");

    //calculate the Hexagon Size
    var intMapHeight = this.arrayWorldInformation["mapHeight"]
    var intMapWidth  = this.arrayWorldInformation["mapWidth"]
    
    var intHexWidth  = this.canvasCanvas.width/(intMapWidth+(1/2));
    var intHexHeight = intHexWidth;


    //mouse position
    var intX = eventE.clientX;
    var intY = eventE.clientY;

    var pointMouse = new point(intX, intY);


    //check all hexagons if the mouse collide
    for (var intX = 0; intX < intMapWidth; intX++) {
      for (var intY = 0; intY < intMapHeight; intY++) {

          var hexagonCurrent = new hexagon(
            intX*intHexWidth + (intY%2)*intHexWidth/2,//every 2ed line has to be a bit more to the right
            intY*intHexHeight*(3/4),
            intHexWidth,
            intHexHeight)

          if(hexagonCurrent.collisionWithPoint(pointMouse)){
            //if it collide check if there is a troop
            console.log("click at: " + intX + "|" + intY);

            //all conditions that have to be complied to select a troop
            if(this.getTroopIdByPosition(new point(intX, intY)) != null){//for anti error
              var arrayTroop = this.arrayWorldInformation["troops"][this.getTroopIdByPosition(new point(intX, intY))];

              //all conditions that have to be complied to select a troop
              var boolHasTroopOnIt = true;
              var boolIsYours      = arrayTroop["player"] == this.arrayWorldInformation["youAre"];
              var boolMoveAble     = arrayTroop["moveAble"];
              var boolYourTurn     = this.arrayWorldInformation["moveOf"] == this.arrayWorldInformation["youAre"];
              var boolTroopIsSelected = this.getTroopIdByPosition(this.pointSelection) != null;
            }else{
              var boolHasTroopOnIt = false;
              var boolIsYours      = false;
              var boolMoveAble     = false;
              var boolYourTurn     = false;
              var boolTroopIsSelected = false;
            }

            console.log(boolHasTroopOnIt + " " +boolIsYours + " " +boolMoveAble + " " +boolYourTurn);

            if(this.pointSelection.equal(new point(intX, intY))){//if you click twice on the same location
              this.pointSelection = new point(-1, -1);
            }else if(boolHasTroopOnIt && boolIsYours && boolMoveAble && boolYourTurn && !boolTroopIsSelected){
              this.pointSelection = new point(intX, intY);
            }else if(this.getTroopIdByPosition(this.pointSelection) != null){//if the player don't click on a troop and there is a selection 


              //get the id of the current selected troop
              intTroopId = this.getTroopIdByPosition(this.pointSelection);

              //send a Move command to the Server
              console.log("moveto: " + intX + "|" + intY);
              strJson = '{ "type": "GAMECOMMAND", "command": "MOVE", "troopId": ' + intTroopId + ', "newX" : ' + intX + ', "newY" : ' + intY + '}'
              sendToServer(strJson)

              this.pointSelection = new point(-1, -1);
            }
          }

      };
    };
  }
  floatTimer = 0;

  this.draw = function(){

    //calculate the time
    var intPastTime = this.arrayWorldInformation["pastTime"];
    //calculate back the starting time
    var intStartTime = (new Date().getTime()) - intPastTime;
    //if the time is older than the a proximate start time: replace it because you have a better connection now.
    if(this.intGameStartedAt >= intStartTime){
      this.intGameStartedAt = intStartTime;
    }




    //fit the canvas size (width)
    this.canvasCanvas.width = this.canvasCanvas.offsetWidth;

    //calculate the Hexagon Size
    var intMapHeight = this.arrayWorldInformation["mapHeight"]
    var intMapWidth  = this.arrayWorldInformation["mapWidth"]

    var intHexWidth  = this.canvasCanvas.width/(intMapWidth+(1/2));
    var intHexHeight = intHexWidth;

    //fit the canvas size (height)
    this.canvasCanvas.height = (intMapHeight*0.75) * intHexHeight + intHexHeight*0.25;
    this.canvasCanvas.style.height = ((intMapHeight*0.75) * intHexHeight + intHexHeight*0.25) + "px";


    this.contextContext.fillStyle = "black"
    this.contextContext.fillRect(0, 0, this.canvasCanvas.width, this.canvasCanvas.height)

    this.contextContext.fillStyle = "rgba(255, 255, 255, 0)"
    this.contextContext.strokeStyle = "rgba(0, 255, 0, 0.1)"



    //draw all Hexagons
    for (var intX = 0; intX < intMapWidth; intX++) {
      for (var intY = 0; intY < intMapHeight; intY++) {

        var pointCurrentHexagon = new point(intX, intY);//the position as point

        var floatAlphaValue = 0;//how much nontransparent is the current Hexagon. Depends on hover, selection and co.

        if(this.pointHover.equal(pointCurrentHexagon)){
          //hover
          floatAlphaValue+=0.3;
        }

        if(this.getTroopIdByPosition(this.pointSelection) != null){
          //only if the selection effects a troop.

          var intTroopId = this.getTroopIdByPosition(this.pointSelection);

          //find out which technicLevel the troop has because it says how many fields the Troop can move.
          intTechnicLevel = Math.floor(this.arrayWorldInformation["troops"][intTroopId]["technicLevel"]);

          if(this.pointSelection.equal(pointCurrentHexagon) || (new hexagonalGrid().areXAwayNeighbor(this.pointSelection, pointCurrentHexagon, intTechnicLevel)) ){
            //selection
            floatAlphaValue+=0.3;
          }
        }


        this.contextContext.fillStyle = "rgba(0, 255, 0, " + floatAlphaValue + ")"
        

        this.contextContext.fillHexagon(
          intX*intHexWidth + (intY%2)*intHexWidth/2,//every 2ed line has to be a bit more to the right
          intY*intHexHeight*(3/4),
          intHexWidth,
          intHexHeight)

      };
    };


     //draw the planets
    var arrayPlanets = this.arrayWorldInformation["planets"]
    for (var i = 0; i < arrayPlanets.length; i++) {
      //fit the image
      if(arrayPlanets[i]["player"] == 0){//player1 is blue and player2 is red
        this.contextContext.fillStyle = "rgb(255, 100, 100)"
      }else if(arrayPlanets[i]["player"] == 1){
        this.contextContext.fillStyle = "rgb(100, 100, 255)"
      }else{
        this.contextContext.fillStyle = "gray"
      }
      
      var intX = arrayPlanets[i]["positionX"];
      var intY = arrayPlanets[i]["positionY"];

      //select the Image for the plant
      arrayPlanetImageNames = new Array("planet00", "planet01", "planet02", "planet03");
      strPlanetImageName = arrayPlanetImageNames[i%4];

      
      //draw the planet (todo: draw a Image)
      this.contextContext.drawImage(
        this.arrayImages[strPlanetImageName],
        intX*intHexWidth + (intY%2)*intHexWidth/2 +intHexWidth/4,//every 2ed line has to be a bit more to the right, make the Rect a bit smaller.
        intY*intHexHeight*(3/4) +intHexHeight/4,//make the Rect a bit smaller.
        intHexWidth - 2 * intHexWidth/4,//make the Rect a bit smaller.
        intHexHeight- 2 * intHexHeight/4)//make the Rect a bit smaller.

    };



    //draw the troops
    var arrayTroops = this.arrayWorldInformation["troops"]
    for (var i = 0; i < arrayTroops.length; i++) {
      //check if this ship has an animation
      intAnimationId = null;
      for (var a = 0; a < this.arrayWorldInformation["animation"].length; a++) {
        intAnimationRuntime = ((new Date().getTime()) - this.intGameStartedAt ) - (this.arrayWorldInformation["animation"][a]["startTime"]);
        //if the ship has an animation that is less than 1 sec old
        if(this.arrayWorldInformation["animation"][a]["shipId"] == i && intAnimationRuntime <= 1000){
          //this.arrayWorldInformation["troops"]["animation"][a]["startTime"] - (new Date().getTime()) <= 1000
          console.log(( intAnimationRuntime ) + " old animation" )
          intAnimationId = a;
        }
      };


      //fit the image
      if(arrayTroops[i]["player"] == 0){//player1 is blue and player2 is red
        var strImageId = "troopRedSmall";
      }else{
        var strImageId = "troopBlueSmall";
      }
      
      var intX = arrayTroops[i]["positionX"];
      var intY = arrayTroops[i]["positionY"];
      
      if(intAnimationId == null){//only if there is no animation
      //draw the Image
      this.contextContext.drawImage(
        this.arrayImages[strImageId],
        intX*intHexWidth + (intY%2)*intHexWidth/2,//every 2ed line has to be a bit more to the right
        intY*intHexHeight*(3/4),
        intHexWidth,
        intHexHeight)
      }else{
        //draw the jump

        floatTimer = (((new Date().getTime()) - this.intGameStartedAt ) - this.arrayWorldInformation["animation"][intAnimationId]["startTime"])  / 1000; //get time for animation 
        pointFrom = new point(this.arrayWorldInformation["animation"][intAnimationId]["startPositionX"], this.arrayWorldInformation["animation"][intAnimationId]["startPositionY"])//get Start position

        if(arrayTroops[i]["player"] == 0){
          //red faced to the right
          this.drawRightJump(pointFrom, new point(intX, intY), this.arrayImages[strImageId], floatTimer)
        }else{
          //red faced to the left
          this.drawLeftJump(pointFrom, new point(intX, intY), this.arrayImages[strImageId], floatTimer)
        }

      }

    };

  




    //make other update stuff

    //test for winner
    if(this.arrayWorldInformation["winner"] != null){

      if(this.arrayWorldInformation["winner"] == this.arrayWorldInformation["youAre"]){
        document.getElementById("winOrLoose").innerHTML = "You are the winner"
        document.getElementById("GameEndScreen").style.visibility = "visible"
      }else{
        document.getElementById("winOrLoose").innerHTML = "You are the looser"
        document.getElementById("GameEndScreen").style.visibility = "visible"
      }

    }

    //show the time to the next move
    document.getElementById("gameInfo").innerHTML = Math.floor(this.arrayWorldInformation["timeToNextTurn"]) + "s"

    if(this.arrayWorldInformation["moveOf"] == 1){//player1 is blue and player2 is red
      document.getElementById("gameInfo").style.color = "blue";
    }else{
      document.getElementById("gameInfo").style.color = "red";
    }

    //show or hide end Turn button
    if(this.arrayWorldInformation["moveOf"] == this.arrayWorldInformation["youAre"]){//player1 is blue and player2 is red
      document.getElementById("endTurn").style.visibility = "visible";
    }else{
       document.getElementById("endTurn").style.visibility = "hidden";
    }


  }

  this.drawLeftJump = function(pointJumpOffPosition, pointJumpInPosition, imageShip, floatTimer){ //beam the ship
    //calculate the Hexagon Size
    var intMapHeight = this.arrayWorldInformation["mapHeight"]
    var intMapWidth  = this.arrayWorldInformation["mapWidth"]

    var intHexWidth  = this.canvasCanvas.width/(intMapWidth+(1/2));
    var intHexHeight = intHexWidth;

    //jumping out
    var floatDimensionFactor = new point(0, 0);
    floatDimensionFactor.intY = 1;
    floatDimensionFactor.intX = Math.max(0, 1 - (floatTimer*3));

    //the speeding up Spaceship
    this.contextContext.drawImage(
      imageShip,
      (pointJumpOffPosition.intX*intHexWidth + (pointJumpOffPosition.intY%2)*intHexWidth/2) - ((1-floatDimensionFactor.intX)*intHexWidth),//every 2ed line has to be a bit more to the right
      pointJumpOffPosition.intY*intHexHeight*(3/4) + (intHexHeight * (1-floatDimensionFactor.intY))*0.5,
      intHexWidth * floatDimensionFactor.intX,
      intHexHeight * floatDimensionFactor.intY)

    //the "flash"
    if(floatTimer >= 0.4 && floatTimer <= 0.5){
      this.contextContext.fillStyle = "white";
      this.contextContext.fillRect(
        ((pointJumpOffPosition.intX-1)*intHexWidth + (pointJumpOffPosition.intY%2)*intHexWidth/2),
        pointJumpOffPosition.intY*intHexHeight*(3/4) + intHexHeight*0.25,
        1,
        intHexHeight*0.5
      )
    }


    //jumping in
    var strImageId = "troopBlueSmall";
    var floatDimensionFactor = new point(0, 0);
    floatDimensionFactor.intY = 1;
    floatDimensionFactor.intX = Math.min(1, Math.max((floatTimer*3)-1, 0));

    //the speeding up Spaceship
    this.contextContext.drawImage(
      imageShip,
      (pointJumpInPosition.intX*intHexWidth + (pointJumpInPosition.intY%2)*intHexWidth/2) + ((1-floatDimensionFactor.intX)*intHexWidth)*2,//every 2ed line has to be a bit more to the right
      pointJumpInPosition.intY*intHexHeight*(3/4) + (intHexHeight * (1-floatDimensionFactor.intY))*0.5,
      intHexWidth * floatDimensionFactor.intX,
      intHexHeight * floatDimensionFactor.intY)

    //the "flash"
    if(floatTimer >= 0.4 && floatTimer <= 0.5){
      this.contextContext.fillStyle = "white";
      this.contextContext.fillRect(
        ((pointJumpInPosition.intX+2)*intHexWidth + (pointJumpInPosition.intY%2)*intHexWidth/2),
        pointJumpInPosition.intY*intHexHeight*(3/4) + intHexHeight*0.25,
        1,
        intHexHeight*0.5
      )
    }
  }



this.drawRightJump = function(pointJumpOffPosition, pointJumpInPosition, imageShip, floatTimer){ //beam the ship
    //calculate the Hexagon Size
    var intMapHeight = this.arrayWorldInformation["mapHeight"]
    var intMapWidth  = this.arrayWorldInformation["mapWidth"]

    var intHexWidth  = this.canvasCanvas.width/(intMapWidth+(1/2));
    var intHexHeight = intHexWidth;

    //jumping out
    var floatDimensionFactor = new point(0, 0);
    floatDimensionFactor.intY = 1;
    floatDimensionFactor.intX = Math.max(0, 1 - (floatTimer*3));

    //the speeding up Spaceship
    this.contextContext.drawImage(
      imageShip,
      (pointJumpOffPosition.intX*intHexWidth + (pointJumpOffPosition.intY%2)*intHexWidth/2) + ((1-floatDimensionFactor.intX)*intHexWidth)*2,//every 2ed line has to be a bit more to the right
      pointJumpOffPosition.intY*intHexHeight*(3/4) + (intHexHeight * (1-floatDimensionFactor.intY))*0.5,
      intHexWidth * floatDimensionFactor.intX,
      intHexHeight * floatDimensionFactor.intY)

    //the "flash"
    if(floatTimer >= 0.4 && floatTimer <= 0.5){
      this.contextContext.fillStyle = "white";
      this.contextContext.fillRect(
        ((pointJumpOffPosition.intX+2)*intHexWidth + (pointJumpOffPosition.intY%2)*intHexWidth/2),
        pointJumpOffPosition.intY*intHexHeight*(3/4) + intHexHeight*0.25,
        1,
        intHexHeight*0.5
      )
    }


    //jumping in
    var strImageId = "troopBlueSmall";
    var floatDimensionFactor = new point(0, 0);
    floatDimensionFactor.intY = 1;
    floatDimensionFactor.intX = Math.min(1, Math.max((floatTimer*3)-1, 0));

    //the speeding up Spaceship
    this.contextContext.drawImage(
      imageShip,
      (pointJumpInPosition.intX*intHexWidth + (pointJumpInPosition.intY%2)*intHexWidth/2) - ((1-floatDimensionFactor.intX)*intHexWidth),//every 2ed line has to be a bit more to the right
      pointJumpInPosition.intY*intHexHeight*(3/4) + (intHexHeight * (1-floatDimensionFactor.intY))*0.5,
      intHexWidth * floatDimensionFactor.intX,
      intHexHeight * floatDimensionFactor.intY)

    //the "flash"
    if(floatTimer >= 0.4 && floatTimer <= 0.5){
      this.contextContext.fillStyle = "white";
      this.contextContext.fillRect(
        ((pointJumpInPosition.intX-1)*intHexWidth + (pointJumpInPosition.intY%2)*intHexWidth/2),
        pointJumpInPosition.intY*intHexHeight*(3/4) + intHexHeight*0.25,
        1,
        intHexHeight*0.5
      )
    }
  }



}

window.setInterval(function(){
    if(gameProjectionCurrentGame != null){
      gameProjectionCurrentGame.draw()
   }
  }, 20);



function connectToServer(){
  //read the name and Ip from the inputs
  strIp = document.getElementById("serverIp").value;
  strName = document.getElementById("name").value;

  createClient(strIp, '{ "type": "REGISTER", "name": "' + strName + '" }')

  document.getElementById("Serverselector").style.visibility = "hidden"
  document.getElementById("lobbyUi").style.visibility = "visible"


  //get the Lobby info after one minute
  window.setTimeout(function(){sendToServer('{ "type": "GETLOBBYINFO"}');}, 1000);
}

function joinGame(intId){
  sendToServer('{ "type": "JOINGAME", "id": ' + intId + ' }')
}

function createGame(){
  var strGameName = document.getElementById("gameName").value;
  strJson = '{ "type": "CREATEGAME", "name": "' + strGameName + '" }'
  sendToServer(strJson)
}





function interpretMessage(strMessage){

  //console.log(strMessage);

  var arrayCommand = JSON.parse(strMessage);

  if(arrayCommand["type"] == "LOBBYINFO"){
    //if you get Lobby Info

    //create the Lobby HTML
    var strLobbyHTML = "";
    //write the amount of Player that are online
    strLobbyHTML += arrayCommand["online"] + " player online<br><br>"

    //wirte all games
    for (var i = 0; i < arrayCommand["games"].length; i++) {
       strLobbyHTML += "<div onClick='joinGame(" + i + ")'>" + arrayCommand["games"][i] + "</div>"
    };


    //display all elements to the user.
    document.getElementById("lobbyInfo").innerHTML = strLobbyHTML;

    return;
  }
  else if(arrayCommand["type"] == "WORLDINFO"){
    
    if(gameProjectionCurrentGame == null){//Create the new game
      gameProjectionCurrentGame = new gameProjection()      
    }

    //change the worldinfos
    gameProjectionCurrentGame.arrayWorldInformation = arrayCommand;

    return;
  }

  console.error("get an unknown Command");
  console.log(arrayCommand);

}

functionOnMessage = interpretMessage;
//override the default "OnMessage"-function




//set the version
document.getElementById("versionInfo").innerHTML = getVersion();


// auto connect (for test environment)

//to read information form the URL
function parseURLParams() {
  url = window.location.href;

    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

if(parseURLParams()["auto"] == "true"){
  strId = parseURLParams()["id"];

  //set the parameters into the inputs (Yes I know that is dirty)
  document.getElementById("serverIp").value = "localhost";
  document.getElementById("name").value = "Player" + strId;

  if(strId == "0"){
    window.moveBy(-window.outerWidth, -window.outerHeight)
  }else{
    window.moveBy(-window.outerWidth, window.outerHeight)
  }

  window.setTimeout(function(){connectToServer()}, 100);
}


window.onload = function(){
  // set the move and click event 
  document.getElementById("gameBoard").addEventListener("mousemove", function(e){gameProjectionCurrentGame.onMouseMove(e)}, false);
  document.getElementById("gameBoard").addEventListener("click", function(e){gameProjectionCurrentGame.onMouseDown(e)}, false);
}