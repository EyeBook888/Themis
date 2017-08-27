//a civilization handles everything that change on race like ship-layout or troops per population

function humanCivilization(){

	//load the needed images
  this.arrayImages = new Array();

	//troops
  this.arrayImages["troopRedSmall"] = new Image();
  this.arrayImages["troopRedSmall"].src = "../Images/troopRedSmall.png"

  this.arrayImages["troopBlueSmall"] = new Image();
	this.arrayImages["troopBlueSmall"].src = "../Images/troopBlueSmall.png"

  this.arrayImages["troopYellowSmall"] = new Image();
  this.arrayImages["troopYellowSmall"].src = "../Images/troopYellowSmall.png"

  this.arrayImages["troopGreenSmall"] = new Image();
  this.arrayImages["troopGreenSmall"].src = "../Images/troopGreenSmall.png"


	this.getTroopImage = function(arrayTroop){

		//fit the image
      	if(arrayTroop["player"] == 0){//player1 is blue and player2 is red
       		var strImageId = "troopRedSmall";
      	}else if(arrayTroop["player"] == 1){
        	var strImageId = "troopBlueSmall";
      	}else if(arrayTroop["player"] == 2){
          var strImageId = "troopYellowSmall";
        }else if(arrayTroop["player"] == 3){
          var strImageId = "troopGreenSmall";
        }

      	return this.arrayImages[strImageId];

	}
}