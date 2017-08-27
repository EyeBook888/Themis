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

  this.humanCivilization = new humanCivilization();// from both/civilization
  //at the moment just one civilization


  this.intAnimationTime = 333;


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

  this.arrayImages["explosion0"] = new Image();
  this.arrayImages["explosion0"].src = "../Images/explosion0.png"

  this.arrayImages["explosion1"] = new Image();
  this.arrayImages["explosion1"].src = "../Images/explosion1.png"

  this.arrayImages["explosion2"] = new Image();
  this.arrayImages["explosion2"].src = "../Images/explosion2.png"

  this.arrayImages["explosion3"] = new Image();
  this.arrayImages["explosion3"].src = "../Images/explosion3.png"

  this.arrayImages["explosion4"] = new Image();
  this.arrayImages["explosion4"].src = "../Images/explosion4.png"

  this.arrayImages["explosion5"] = new Image();
  this.arrayImages["explosion5"].src = "../Images/explosion5.png"

  this.arrayImages["explosion6"] = new Image();
  this.arrayImages["explosion6"].src = "../Images/explosion6.png"

  this.arrayImages["explosion7"] = new Image();
  this.arrayImages["explosion7"].src = "../Images/explosion7.png"

  this.arrayImages["explosion8"] = new Image();
  this.arrayImages["explosion8"].src = "../Images/explosion8.png"


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

      
      //draw the planet
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
      boolHasAnimation = false;
      for (var a = 0; a < this.arrayWorldInformation["animation"].length; a++) {
        intAnimationRuntime = ((new Date().getTime()) - this.intGameStartedAt ) - (this.arrayWorldInformation["animation"][a]["startTime"]);
        //if the ship has an animation that is less than 1 sec old
        if(this.arrayWorldInformation["animation"][a]["shipId"] == i && intAnimationRuntime <= 1000){
          boolHasAnimation = true;
        }
      };


      var intX = arrayTroops[i]["positionX"];
      var intY = arrayTroops[i]["positionY"];
      
      if(!boolHasAnimation){//only if there is no animation
      //draw the Image
      this.contextContext.drawImage(
        this.humanCivilization.getTroopImage(arrayTroops[i]),
        intX*intHexWidth + (intY%2)*intHexWidth/2,//every 2ed line has to be a bit more to the right
        intY*intHexHeight*(3/4),
        intHexWidth,
        intHexHeight)
      }

    };





    //draw all jump animations
    for (var a = 0; a < this.arrayWorldInformation["animation"].length; a++) {
      var objCurrentAnimation = this.arrayWorldInformation["animation"][a];
      //calculate oldness
      intAnimationRuntime = ((new Date().getTime()) - this.intGameStartedAt ) - (objCurrentAnimation["startTime"]);
      //if an animation that is less than 1 sec old
        if(intAnimationRuntime <= 1000 && objCurrentAnimation["type"] == "JUMP"){// --- a jumping ship
          //draw the jump
          var floatTimer  = intAnimationRuntime; //get time for animation 
          var pointFrom   = new point(objCurrentAnimation["startPositionX"], objCurrentAnimation["startPositionY"])//get Start position
          var pointTo     = new point(objCurrentAnimation["troop"]["positionX"], objCurrentAnimation["troop"]["positionY"]);// get the end position
          var imageTroop  = this.humanCivilization.getTroopImage(objCurrentAnimation["troop"]);
  

          if(objCurrentAnimation["troop"]["player"] == 0){
            //red faced to the right
            this.drawRightJump(pointFrom, pointTo, imageTroop, floatTimer)
          }else{
           //red faced to the left
           this.drawLeftJump(pointFrom, pointTo, imageTroop, floatTimer)
          }

        }
    }

    
    //draw all dummys
    for (var a = 0; a < this.arrayWorldInformation["animation"].length; a++) {
      var objCurrentAnimation = this.arrayWorldInformation["animation"][a];
      //calculate oldness
      intAnimationRuntime = ((new Date().getTime()) - this.intGameStartedAt ) - (objCurrentAnimation["startTime"]);
      //if an animation that is less than 1 sec old
        if(intAnimationRuntime <= 2*this.intAnimationTime && objCurrentAnimation["type"] == "DUMMY"){ // draw a fake ship
          //the ship
          var imageTroop    = this.humanCivilization.getTroopImage(objCurrentAnimation["troop"]);
          var pointPosition = new point(objCurrentAnimation["positionX"], objCurrentAnimation["positionY"])

          //draw the Image
          this.contextContext.drawImage(
            imageTroop,
            pointPosition.intX*intHexWidth + (pointPosition.intY%2)*intHexWidth/2,//every 2ed line has to be a bit more to the right
            pointPosition.intY*intHexHeight*(3/4),
            intHexWidth,
            intHexHeight)
        }
    }
    console.log("end Dummy");



    //draw all fight animations
    for (var a = 0; a < this.arrayWorldInformation["animation"].length; a++) {
      var objCurrentAnimation = this.arrayWorldInformation["animation"][a];
      //calculate oldness
      intAnimationRuntime = ((new Date().getTime()) - this.intGameStartedAt ) - (objCurrentAnimation["startTime"]);
      //if an animation that is less than 1 sec old
        if(intAnimationRuntime <= 1000 && objCurrentAnimation["type"] == "FIGHT"){//draw a fight
          //draw the jump
          //console.log("fight");
          var floatTimer    = Math.max(intAnimationRuntime - this.intAnimationTime*2, -0.1); //get time for animation 
          var pointPosition = new point(objCurrentAnimation["positionX"], objCurrentAnimation["positionY"]);

          this.drawFight(pointPosition, floatTimer);

        }
    }




    //this.drawFight(new point(5, 5), ((new Date().getTime()) - this.intGameStartedAt )%3000);

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

    if(this.arrayWorldInformation["moveOf"] == 0){//player1 is blue and player2 is red
      document.getElementById("gameInfo").style.color = "red";
    }else if(this.arrayWorldInformation["moveOf"] == 1){
      document.getElementById("gameInfo").style.color = "blue";
    }else if(this.arrayWorldInformation["moveOf"] == 2){
      document.getElementById("gameInfo").style.color = "yellow";
    }else if(this.arrayWorldInformation["moveOf"] == 3){
      document.getElementById("gameInfo").style.color = "green";
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
    floatDimensionFactor.intX = Math.max(0, 1 - ((floatTimer/this.intAnimationTime)));

    //the speeding up Spaceship
    this.contextContext.drawImage(
      imageShip,
      (pointJumpOffPosition.intX*intHexWidth + (pointJumpOffPosition.intY%2)*intHexWidth/2) - ((1-floatDimensionFactor.intX)*intHexWidth),//every 2ed line has to be a bit more to the right
      pointJumpOffPosition.intY*intHexHeight*(3/4) + (intHexHeight * (1-floatDimensionFactor.intY))*0.5,
      intHexWidth * floatDimensionFactor.intX,
      intHexHeight * floatDimensionFactor.intY)

    //the "flash"
    if(floatTimer/this.intAnimationTime >= 1.2 && floatTimer/this.intAnimationTime <= 1.5){
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
    floatDimensionFactor.intX = Math.min(1, Math.max((floatTimer/this.intAnimationTime)-1, 0));

    //the speeding up Spaceship
    this.contextContext.drawImage(
      imageShip,
      (pointJumpInPosition.intX*intHexWidth + (pointJumpInPosition.intY%2)*intHexWidth/2) + ((1-floatDimensionFactor.intX)*intHexWidth)*2,//every 2ed line has to be a bit more to the right
      pointJumpInPosition.intY*intHexHeight*(3/4) + (intHexHeight * (1-floatDimensionFactor.intY))*0.5,
      intHexWidth * floatDimensionFactor.intX,
      intHexHeight * floatDimensionFactor.intY)

    //the "flash"
    if(floatTimer/this.intAnimationTime >= 1.2 && floatTimer/this.intAnimationTime <= 1.5){
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
    floatDimensionFactor.intX = Math.max(0, 1 - (floatTimer/this.intAnimationTime));

    //the speeding up Spaceship
    this.contextContext.drawImage(
      imageShip,
      (pointJumpOffPosition.intX*intHexWidth + (pointJumpOffPosition.intY%2)*intHexWidth/2) + ((1-floatDimensionFactor.intX)*intHexWidth)*2,//every 2ed line has to be a bit more to the right
      pointJumpOffPosition.intY*intHexHeight*(3/4) + (intHexHeight * (1-floatDimensionFactor.intY))*0.5,
      intHexWidth * floatDimensionFactor.intX,
      intHexHeight * floatDimensionFactor.intY)

    //the "flash"
    if(floatTimer/this.intAnimationTime >= 1.2 && floatTimer/this.intAnimationTime <= 1.5){
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
    floatDimensionFactor.intX = Math.min(1, Math.max((floatTimer/this.intAnimationTime)-1, 0));

    //the speeding up Spaceship
    this.contextContext.drawImage(
      imageShip,
      (pointJumpInPosition.intX*intHexWidth + (pointJumpInPosition.intY%2)*intHexWidth/2) - ((1-floatDimensionFactor.intX)*intHexWidth),//every 2ed line has to be a bit more to the right
      pointJumpInPosition.intY*intHexHeight*(3/4) + (intHexHeight * (1-floatDimensionFactor.intY))*0.5,
      intHexWidth * floatDimensionFactor.intX,
      intHexHeight * floatDimensionFactor.intY)

    //the "flash"
    if(floatTimer/this.intAnimationTime >= 1.2 && floatTimer/this.intAnimationTime <= 1.5){
      this.contextContext.fillStyle = "white";
      this.contextContext.fillRect(
        ((pointJumpInPosition.intX-1)*intHexWidth + (pointJumpInPosition.intY%2)*intHexWidth/2),
        pointJumpInPosition.intY*intHexHeight*(3/4) + intHexHeight*0.25,
        1,
        intHexHeight*0.5
      )
    }
  }


  this.drawFight = function(pointPosition, floatTimer){

    //calculate the Hexagon Size
    var intMapHeight = this.arrayWorldInformation["mapHeight"]
    var intMapWidth  = this.arrayWorldInformation["mapWidth"]

    var intHexWidth  = this.canvasCanvas.width/(intMapWidth+(1/2));
    var intHexHeight = intHexWidth;



    this.contextContext.fillStyle = "rgba(0,0,0,0)";
    this.contextContext.strokeStyle = "rgba(0,0,0,0)";


    if(floatTimer <= this.intAnimationTime/2 && floatTimer >= 0){ //first draw flashes form laserguns
      var intResolution = 10;//draw 4 circles on top of each other
/*
      //draw a screen wide flash
      if(Math.random() >= 0.9){
       this.contextContext.fillStyle = "white";
       this.contextContext.strokeStyle = "red";
       this.contextContext.fillRect(0, 0, this.canvasCanvas.width, this.canvasCanvas.height);
      }
      */

      var r = 0;
      var g = 0;
      var b = 0;
      var a = 0;

      if(Math.random() >= 0.6){
        var r = 255;
        var g = 255;
        var b = 255;
        var a = 1;
      }

      for (var c = 0; c < intResolution; c++) {

        this.contextContext.fillStyle = "rgba(" + r+ ", " +  g +"," + b + "," + (a/intResolution) + ")";
        this.contextContext.strokeStyle = "rgba(" + r+ ", " +  g +"," + b + "," + (a/intResolution) + ")";;

        this.contextContext.beginPath()
        this.contextContext.arc(
          pointPosition.intX*intHexWidth + intHexWidth/2 + (pointPosition.intY%2)*intHexWidth/2,
          pointPosition.intY*intHexHeight*(3/4) + intHexHeight/2,
          intHexWidth*3 * (c/intResolution),
          0*Math.PI,2*Math.PI)
        this.contextContext.stroke()
        this.contextContext.fill()
      }
    }else if(floatTimer <= this.intAnimationTime && floatTimer >= this.intAnimationTime/2){//draw the explosion
      arrayExplosionImagesIds = ["explosion0", "explosion1", "explosion2", "explosion3", "explosion4", "explosion5", "explosion6", "explosion7", "explosion8"];
      
      var intTotalTime    = this.intAnimationTime/2;
      var intTimePerImage = intTotalTime/arrayExplosionImagesIds.length;
      var intCurrentTime  = floatTimer - this.intAnimationTime/2;

      var intImageId      = Math.floor(intCurrentTime/intTimePerImage);
      var strImageId      = arrayExplosionImagesIds[intImageId];
      console.log(strImageId);
      try{
        this.contextContext.drawImage(
         this.arrayImages[strImageId],
         pointPosition.intX*intHexWidth + (pointPosition.intY%2)*intHexWidth/2,//every 2ed line has to be a bit more to the right
         pointPosition.intY*intHexHeight*(3/4),
         intHexWidth,
          intHexHeight)
      }catch(error){

      }

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
if(parseURLParams() != null){
if(parseURLParams()["auto"] == "true"){
  strId = parseURLParams()["id"];

  //set the parameters into the inputs (Yes I know that is dirty)
  document.getElementById("serverIp").value = "localhost";
  document.getElementById("name").value = "Player" + strId;

  if(strId == "0"){
    window.moveBy(-window.outerWidth, -window.outerHeight)
  }else if(strId == "1"){
    window.moveBy(-window.outerWidth, window.outerHeight)
  }else{
     window.moveBy(+window.outerWidth, -window.outerHeight)
  }
  console.log("Player: " + strId)

  window.setTimeout(function(){connectToServer()}, 100);
}
}

window.onload = function(){
  // set the move and click event 
  document.getElementById("gameBoard").addEventListener("mousemove", function(e){gameProjectionCurrentGame.onMouseMove(e)}, false);
  document.getElementById("gameBoard").addEventListener("click", function(e){gameProjectionCurrentGame.onMouseDown(e)}, false);
}
