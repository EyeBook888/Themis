

function point(intX, intY){
	this.intX = intX;
	this.intY = intY;

	this.equal = function(pointPoint){
		//check X
		boolEqualX = this.intX == pointPoint.intX;

		//check Y
		boolEqualY = this.intY == pointPoint.intY;

		//check both
		boolEqual  = (boolEqualX && boolEqualY);
		
		return boolEqual;
	}

	this.toString = function(){
		return "(" + this.intX + "|" + this.intY + ")";
	}
}


function hexagon(intX, intY, intWidth, intHeight){
	this.intX 		= intX;
	this.intY 		= intY;
	this.intWidth 	= intWidth;
	this.intHeight 	= intHeight;

	this.collisionWithPoint = function(pointPoint){

		//corner Names
    	//  1
    	//6   2
    	//5   3
    	//  4


		//1st check the rectangle
		boolCollision = true;
		if(pointPoint.intY < this.intY){
			boolCollision = false;
		}
		if(pointPoint.intY > this.intY + this.intHeight){
			boolCollision = false;
		}
		if(pointPoint.intX < this.intX){
			boolCollision = false;
		}
		if(pointPoint.intX > this.intX + this.intWidth){
			boolCollision = false;
		}

		//check the slope
		pointCorner1 = new point(this.intX + this.intWidth/2, this.intY);
		pointCorner2 = new point(this.intX + this.intWidth, this.intY + this.intHeight*(1/4));
		pointCorner3 = new point(this.intX + this.intWidth, this.intY + this.intHeight*(3/4));
		pointCorner4 = new point(this.intX + this.intWidth/2, this.intY + this.intHeight);
		pointCorner5 = new point(this.intX, this.intY + this.intHeight*(3/4));
		pointCorner6 = new point(this.intX, this.intY + this.intHeight*(1/4));

		line61 = new line(0, 0);
		line12 = new line(0, 0);
		line34 = new line(0, 0);
		line45 = new line(0, 0);

		line61.setByTowPoints(pointCorner6, pointCorner1);
		line12.setByTowPoints(pointCorner1, pointCorner2);
		line34.setByTowPoints(pointCorner3, pointCorner4);
		line45.setByTowPoints(pointCorner4, pointCorner5);
		
		if(pointPoint.intY < line61.getValue(pointPoint.intX)){
			boolCollision = false;
		}if(pointPoint.intY < line12.getValue(pointPoint.intX)){
			boolCollision = false;
		}if(pointPoint.intY > line34.getValue(pointPoint.intX)){
			boolCollision = false;
		}
		if(pointPoint.intY > line45.getValue(pointPoint.intX)){
			boolCollision = false;
		}

		return boolCollision;

	}
}

function hexagonalGrid(){

	this.getNeighbors = function(pointPosition){//return all Neighbors of that point in an array
		var arrayNeighbors = new Array();
		//left
		arrayNeighbors.push(new point(pointPosition.intX-1, pointPosition.intY))
		//right
		arrayNeighbors.push(new point(pointPosition.intX+1, pointPosition.intY))

		//top left or top right depends on the row
		arrayNeighbors.push(new point(pointPosition.intX, pointPosition.intY-1))

		//bottom left or bottom right depends on the row
		arrayNeighbors.push(new point(pointPosition.intX, pointPosition.intY+1))


		//top and bottom
		if(pointPosition.intY%2 == 0){//row more to the left
			//top left
			arrayNeighbors.push(new point(pointPosition.intX-1, pointPosition.intY-1))

			//bottom left
			arrayNeighbors.push(new point(pointPosition.intX-1, pointPosition.intY+1))
		}else{//rowmore to the left
			//top right
			arrayNeighbors.push(new point(pointPosition.intX+1, pointPosition.intY-1))

			//bottom right
			arrayNeighbors.push(new point(pointPosition.intX+1, pointPosition.intY+1))
		}

		return arrayNeighbors;
	}

	this.getNeighborsFromAll = function(arrayPositions){//return all Neighbors of all points inside the array in an array
		var arrayNeighbors = new Array();

		for (var a = 0; a < arrayPositions.length; a++) {
			//get the Neighbors of one point
			var arrayNeighborsOfCurrent = this.getNeighbors(arrayPositions[a]);

			//push them all into the array
			for (var b = 0; b < arrayNeighborsOfCurrent.length; b++) {
				//but first test if they are already inside
				boolInside = false;
				for (var c = 0; c < arrayNeighbors.length; c++) {
					if(arrayNeighbors[c].equal(arrayNeighborsOfCurrent[b])){
						boolInside = true;
					}
				};
				//and then push them
				if(!boolInside){
					arrayNeighbors.push(arrayNeighborsOfCurrent[b]);
				}
			}
		};

		return arrayNeighbors;
	}

	this.getXAwayNeighborsFrom = function(pointPosition, intX){//return all neighbors that you can reach with X moves
		
		var arrayNeighbors = new Array();
		arrayNeighbors.push(pointPosition);

		for (var i = 0; i < intX; i++) {
			arrayNeighbors = this.getNeighborsFromAll(arrayNeighbors)
		};

		return arrayNeighbors;
	}

	this.areXAwayNeighbor = function(pointPositionA, pointPositionB, intX){
		arrayNeighborsofA = this.getXAwayNeighborsFrom(pointPositionA, intX);
		for (var i = 0; i < arrayNeighborsofA.length; i++) {
			if(arrayNeighborsofA[i].equal(pointPositionB)){
				return true;
			}
		};
		return false;
	}

	this.areNeighbor = function(pointPositionA, pointPositionB){
		arrayNeighborsofA = this.getNeighbors(pointPositionA);
		for (var i = 0; i < arrayNeighborsofA.length; i++) {
			if(arrayNeighborsofA[i].equal(pointPositionB)){
				return true;
			}
		};

		return false;
	}
}


function line(intA, intB){
	//f(x) = intA * x + intB
	this.intA = intA;
	this.intB = intB;

	this.getValue = function(intX){
		return this.intA * intX + this.intB;
	}

	this.setByTowPoints = function(pointA, pointB){
		this.intA = (pointA.intY - pointB.intY)/(pointA.intX - pointB.intX);//slope
		this.intB = pointA.intY - pointA.intX*this.intA;//y-intercept
	}
}


