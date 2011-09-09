// JavaScript Document
var LayoutManager = function(){
	
	this._TILE_WIDTH = 113;
	this._TILE_HEIGHT = 85;
	
	this._containerElement = document.getElementById("plane");
	this._gridHashTable = {};
	this._totalTiles=0;
	this._totalArea=0;
	this._maxTiles;
	this._maxRadius=0;
	this._interval;
	this._optimumRatio;
	this._maxArea;
	
	this._lastTime;
	this._nowTime;
	
	this._currentData;
	this._windowRect;// = new Rectangle();
	this._dataRect;//
	this._displayList = [];
	this._queuedElements = [];
	
	
	//this._BALANCED_FEED = [9,4,4,4,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
	this._BALANCED_FEED = [9,9,9,9,4,4,4,4,4,4,4,4,4,4,4,4,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
	this._FLIP_FLOP_FEED = [1,0,0,1,0,1,1,0];
	
	this._currentBalancedFeed = [];
	this._currentFlipFlopFeed = [];
	
	
	this._errorMode = false;
}


LayoutManager.prototype.begin = function(){
	this.resetGrid();
	this.floodGrid();
	this.update();
}

LayoutManager.prototype.resetGrid = function(){
	this._currentData = window.layout.getDataManager().getData({order:1});
	this._maxTiles = this._currentData.length;
	
	this._optimumRatio = this._BALANCED_FEED.length / this._BALANCED_FEED.sum();
	this._maxArea = this._maxTiles / this._optimumRatio;
	this._dataRect = this.calculateDataAreaRect(this._maxArea);
}


//994 on iPad and 224 on iMac
LayoutManager.prototype.floodGrid = function(){
	
	this._lastTime = new Date().getTime();
	var gridSizeOptionsArray;
	var chosenTileAreaSize;
	var searchDirection;
	var modX;
	var modY;
	var gridObject;
	var searchDirectionString;
	
	var fillRect = this._dataRect;
	
	for(var c = fillRect.left; c < fillRect.left + fillRect.width; c++){
		for(var r = fillRect.top; r < fillRect.top + fillRect.height; r++){
			gridObject = this.getGridObject(c, r);										//get the grid object for cells location					
	
			//!!!!! GET TILE DATA
			//_______________________________________________________________
			if(gridObject.ocupied === false){											//Check if we need to create a new tile or use existing one
				// NEW TILE //
				if(this._totalTiles + 1 === this._currentData.length ){ 				//no more tiles to be populated
					continue; 															//continue to next loop
				}
				
				gridObject.data = this._currentData[this._totalTiles];					//this must be in this if block and be before we increment totalTiles
				this._totalTiles++;														//what ever happens next we will be adding a tile
				
				
				if(c != fillRect.left && r != fillRect.top){			// get direction of build, this is ensure that we can assess vacant cells outward from different directions.
					searchDirection = 0;//SE
				}else if(c == fillRect.left && r != fillRect.top){
					searchDirection = 1;//SW
				}else if(c != fillRect.left && r == fillRect.top){
					searchDirection = 3;//NE
				}else {
					searchDirection = 2;//NW
				}
				
				gridSizeOptionsArray = this.getGridSizeOptions(c,r,gridObject.data.o,searchDirection);				//check what options are available in the grid from a certain direction, return areas
				
				//chosenTileAreaSize = gridSizeOptionsArray[Math.floor(Math.random()*gridSizeOptionsArray.length)];	//determin what size to use from array, random at the moment
				//this._totalArea += chosenTileAreaSize;
				//
				chosenTileAreaSize = this.chooseTileSize(gridSizeOptionsArray);
				
				modX = this.getOffsetXModifierForAreaAndDirection(chosenTileAreaSize,searchDirection);				//reset offset modifiers, these are used to correctly position larger than 
				modY = this.getOffsetYModifierForAreaAndDirection(chosenTileAreaSize,searchDirection);
				
				this.initiateGridObjectsForTileAreaSize(c+modX,r+modY,chosenTileAreaSize,gridObject.data);	//initated array of gridObjects, set with offset, ocupied = true, area (a) set to area	
			}
		}
	}
	this._nowTime =  new Date().getTime()  - this._lastTime
	console.log("flood complete:"+ this._nowTime);
};


LayoutManager.prototype.update = function(){
	
	//this._lastTime = new Date().getTime();
	var el;
	var gridSizeOptionsArray;
	var chosenTileAreaSize;
	var gridObjectsArray;
	var i;
	var elementWidth;
	var elementHeight;
	var searchDirection;
	var modX;
	var modY;
	var gridObject;
	var searchDirectionString;
	
	
	this._windowRect = this.getWindowRect();
	this.queueClippedElements(this._windowRect);
	
	
	for(var c = this._windowRect.left; c < this._windowRect.left + this._windowRect.width; c++){
		for(var r = this._windowRect.top; r < this._windowRect.top + this._windowRect.height; r++){
			if(this.isWithinMaxRaduis(c, r)){
			//if(this._dataRect.contains(c, r)){											//only iterate through cells that are within the extent of the data rectangle
				gridObject = this.getGridObject(c, r);										//get the grid object for cells location
				if(gridObject.visible===false){												//only process if the cell requries it, tile is already visible on screen
					
					
					
					//!!!!! GET TILE DATA
					//_______________________________________________________________
					if(gridObject.ocupied === false){											//Check if we need to create a new tile or use existing one
						// NEW TILE //
						if(this._totalTiles + 1 === this._currentData.length ){ 				//no more tiles to be populated
							continue; 															//continue to next loop
						}
						
						gridObject.data = this._currentData[this._totalTiles];					//this must be in this if block and be before we increment totalTiles
						this._totalTiles++;														//what ever happens next we will be adding a tile
						
						
						if(c !== this._windowRect.left && r !== this._windowRect.top){			// get direction of build, this is ensure that we can assess vacant cells outward from different directions.
							searchDirection = 0;//SE
							searchDirectionString = "SE";
						}else if(c === this._windowRect.left && r !== this._windowRect.top){
							searchDirection = 1;//SW
							searchDirectionString = "SW";
						}else if(c !== this._windowRect.left && r === this._windowRect.top){
							searchDirection = 3;//NE
							searchDirectionString = "NE";
						}else {
							searchDirection = 2;//NW
							searchDirectionString = "NW";
						}
						
						//gridObject.sd = searchDirectionString;									//temporary 
						
						
						//gridObjectsArray = this.setupGridCells();
						
						gridSizeOptionsArray = this.getGridSizeOptions(c,r,gridObject.data.o,searchDirection);				//check what options are available in the grid from a certain direction, return areas
						
						
						//chosenTileAreaSize = gridSizeOptionsArray[Math.floor(Math.random()*gridSizeOptionsArray.length)];	//determin what size to use from array, random at the moment
						//this._totalArea += chosenTileAreaSize;
						
						chosenTileAreaSize = this.chooseTileSize(gridSizeOptionsArray);
						
						
						modX = this.getOffsetXModifierForAreaAndDirection(chosenTileAreaSize,searchDirection);				//reset offset modifiers, these are used to correctly position larger than 
						modY = this.getOffsetYModifierForAreaAndDirection(chosenTileAreaSize,searchDirection);
						
						gridObjectsArray = this.initiateGridObjectsForTileAreaSize(c+modX,r+modY,chosenTileAreaSize,gridObject.data);	//initated array of gridObjects, set with offset, ocupied = true, area (a) set to area
						
						
						
						
						
					}else{
						// EXISTING TILE //
						//ensure we are gathering from the top left, so calculate the topleft from the gridobject offset
						gridObjectsArray = this.gatherGridObjectsForTileAreaSize(gridObject.x - gridObject.oX, gridObject.y - gridObject.oY ,gridObject.a);		//get gridObjectsArray here for existing grid objects using coord and area
						
					}
					
					
					//!!!!! PUSH TILE DATA ON ELEMENT
					//_______________________________________________________________
					//Get an div element to work with
					el = this.dequeueElement();
					if(el===undefined){
						el = this.createTile();
					}
					
					//This element simply resused to and made to fit the content we want
					el.style.backgroundImage = 'url(http://www.interactivelabs.co.uk/people/john/d/images/'+gridObject.data.id+'_'+this.getImageAreaPathIdentifier(gridObject.a)+'.jpg)';
					
					//element top and left are resest to x and y taking into account the offet of the gridObject.
					//this c and r will be the x and y of the cell, but the tile may need to placed with offset.
					el.style.left = (c*this._TILE_WIDTH) - (gridObject.oX * this._TILE_WIDTH) + "px";
					el.style.top = (r*this._TILE_HEIGHT) - (gridObject.oY * this._TILE_HEIGHT) + "px";
					//el.style.opacity = "0.85";
					el.setAttribute("data",gridObject.data.id);
					el.style.display = "block"; //ensure element is black, will be 'none' if dequeued
					//el.innerHTML = '<div class="tileBorder"></div>';
					el.innerHTML = "<div class='detail'>id:"+gridObject.data.id+"<br>ex:"+(c-gridObject.oX)+" ey:"+(r-gridObject.oY)+"<br>gx:"+c+" gy:"+r+"<br>oX:"+gridObject.oX+" oY:"+gridObject.oY+"<br>a:"+gridObject.a+"<br>s:"+gridObject.sd+"</div>";
					//set width of el to tile size
					switch(gridObject.a){
						case 1:
							el.style.width = this._TILE_WIDTH * 1 + "px";
							el.style.height = this._TILE_HEIGHT * 1 + "px"; 
							elementWidth = 1;
							elementHeight = 1;
							break;
						case 2:
							el.style.width = this._TILE_WIDTH * 1 + "px";
							el.style.height = this._TILE_HEIGHT * 2 + "px";
							elementWidth = 1;
							elementHeight = 2;
							break; 
						case 4:
							el.style.width = this._TILE_WIDTH * 2 + "px";
							el.style.height = this._TILE_HEIGHT * 2 + "px"; 
							elementWidth = 2;
							elementHeight = 2;
							break;
						case 6:
							el.style.width = this._TILE_WIDTH * 2 + "px";
							el.style.height = this._TILE_HEIGHT * 3 + "px";
							elementWidth = 2;
							elementHeight = 3;
							break;
						case 9:
							el.style.width = this._TILE_WIDTH * 3 + "px";
							el.style.height = this._TILE_HEIGHT * 3 + "px";
							elementWidth = 3;
							elementHeight = 3;
							break;  
					}
					
					
					
					//!!!!! UPDATE DISPLAY LIST
					//_______________________________________________________________
					//iterate though grid objects and set visible = true and set into displaylist
					for(i=0;i<gridObjectsArray.length;i++){
						gridObjectsArray[i].visible = true;
					}
					
					//gridObject.visible = true;
					//displayObject coords based on top left of element
					this._displayList.push({element:el,x:c-gridObject.oX,y:r-gridObject.oY,r:(c-gridObject.oX)+(elementWidth-1),b:(r-gridObject.oY)+(elementHeight-1),gridObjects:gridObjectsArray})
					
				}
			}
		}
	}
	$("#output_totalTiles").html(this._totalTiles+" of "+this._maxTiles);
	$("#output_totalArea").html(this._totalArea+" of "+this._maxArea);
	$("#output_displayListLength").html(this._displayList.length);
	$("#output_queueListLength").html(this._queuedElements.length);
	$("#output_planeChildren").html(this._containerElement.getElementsByTagName("div").length);
	//this._nowTime =  new Date().getTime()  - this._lastTime
	//console.log("layout complete:"+ this._nowTime);
};

LayoutManager.prototype.dressElement = function(){
	
}


LayoutManager.prototype.chooseTileSize = function(areaSizesArray){
	if(this._currentBalancedFeed.length===0){
		
		var targetArea = this._totalTiles / this._optimumRatio;
		var areaDifference = Math.round(targetArea - this._totalArea);
		//console.log("areaDifference:"+areaDifference)
		
		this._currentBalancedFeed = this._BALANCED_FEED.clone();
		
		//remove singles from balance untill area deifference == 0
		var i;
		var l=this._currentBalancedFeed.length-1;
		for(i=l;i>-1;i--){
			if(areaDifference>0){
				if(this._currentBalancedFeed[i]===1){//equeals a 1x1
					this._currentBalancedFeed.splice(i,1);
					areaDifference--;
				}
			}else{
				break;	
			}
		}
		
		
	}
	if(this._currentFlipFlopFeed.length===0){
		this._currentFlipFlopFeed = this._FLIP_FLOP_FEED.clone();
	}
	//create unique selection array;
	var i=0;
	var l=areaSizesArray.length;
	var matchedIndex;
	var uniqueArray = [];
	var chosenAreaSize;
	var matchValidated = false;
	var matchedIndexArray = [];
	
	//areaSizesArray is in numerical order
	for(i=0;i<l;i++){
		matchedIndex = this._currentBalancedFeed.indexOf(areaSizesArray[i]);
		if(matchedIndex!=-1){
			uniqueArray.push(this._currentBalancedFeed[matchedIndex]);
			matchedIndexArray.push(matchedIndex);
		}
	}
	if(uniqueArray.length > 0){
		//uniqueArray.sort(function sortNumber(a,b){return a - b});//no need to sort as array should be in order
		matchValidated = true;
	}else if(uniqueArray.length===0){
		uniqueArray = [1];					//no matches so use use 1
		matchedIndexArray = [0];							
	}
	
	if(this._currentFlipFlopFeed.pop()===0){//favour smaller number
		chosenAreaSize = uniqueArray.shift();
		matchedIndex = matchedIndexArray.shift();
	}else{
		chosenAreaSize = uniqueArray.pop();
		matchedIndex = matchedIndexArray.pop();
	}
	if(matchValidated===true){
		this._currentBalancedFeed.splice(matchedIndex,1);
		
	}else{
		//console.log("LayoutManager.chooseTileSize() forces to use 1x1");
	}
	
	
	this._totalArea += chosenAreaSize;																//tally up area, used to calculate projected radius
	
	
	return chosenAreaSize;
}


LayoutManager.prototype.isWithinMaxRaduis = function(c,r){
	/*
	if(this._totalTiles===0)return true;
	var percentageOfTiles = this._totalTiles / this._maxTiles;
	var projectedMaxArea = this._totalArea / percentageOfTiles;
	var maxRaduis = Math.sqrt(projectedMaxArea / Math.PI);
	
	var currentRadius = Math.sqrt(Math.abs(Math.pow(c,2) + Math.pow(r,2)));
	//console.log("currentRadius:"+currentRadius+" maxRaduis:"+maxRaduis);
	if(currentRadius < maxRaduis){
		return true;
	}else{
		return false;
	}
	*/
	if(this._totalTiles===0)return true;
	//var percentageOfTiles = this._totalTiles / this._maxTiles;
	//var projectedMaxArea = this._totalArea / percentageOfTiles;
	//var maxRaduis = Math.sqrt(projectedMaxArea / Math.PI);
	
	//var currentRadius = Math.sqrt(Math.abs(Math.pow(c,2) + Math.pow(r,2)));
	//console.log("currentRadius:"+currentRadius+" maxRaduis:"+maxRaduis);
	if(Math.sqrt(Math.abs(Math.pow(c,2) + Math.pow(r,2))) < Math.sqrt((this._totalArea / (this._totalTiles / this._maxTiles)) / Math.PI)){
		return true;
	}else{
		return false;
	}
}

//reset offset modifiers, these are used to correctly position larger than
//1x1 elements when the spwaning cell is not the top left  
LayoutManager.prototype.getOffsetXModifierForAreaAndDirection = function(area,direction){
	if(area===1){
		return 0;
	}else if(area===9 && (direction === 1 || direction === 2)){ // SW & NW
		return -2;	
	}else if(area===4 && (direction === 1 || direction === 2)){ // SW & NW
		return -1;	
	}
	return 0;
}
LayoutManager.prototype.getOffsetYModifierForAreaAndDirection = function(area,direction){
	if(area===1){
		return 0;
	}else if(area===9 && (direction === 2 || direction === 3)){ // SW & NW
		return -2;	
	}else if(area===4 && (direction === 2 || direction === 3)){ // SW & NW
		return -1;	
	}else if(area===2 && (direction === 2 || direction === 3)){ // SW & NW
		return -1;	
	}
	return 0;
}

LayoutManager.prototype.getImageAreaPathIdentifier = function(area){
	switch(area){
		case 2:
			return "12";
			break;
		case 4:
			return "22";
			break;
		case 9:
			return "33";
			break;
	}
	return "11";
}

LayoutManager.prototype.gatherGridObjectsForTileAreaSize = function(c,r,chosenTileAreaSize){
	var a = [];
	a.push(this.getGridObject(c,r));
	switch(chosenTileAreaSize){
		case 2:
			a.push(this.getGridObject(c,r+1));
			break;
		case 4:
			a.push(this.getGridObject(c+1,r));
			a.push(this.getGridObject(c,r+1));
			a.push(this.getGridObject(c+1,r+1));
			break;
		case 9:
			a.push(this.getGridObject(c+1,r));
			a.push(this.getGridObject(c+2,r));
			a.push(this.getGridObject(c,r+1));
			a.push(this.getGridObject(c+1,r+1));
			a.push(this.getGridObject(c+2,r+1));
			a.push(this.getGridObject(c,r+2));
			a.push(this.getGridObject(c+1,r+2));
			a.push(this.getGridObject(c+2,r+2));
			break;
	}
	return a;
}

LayoutManager.prototype.initiateGridObjectsForTileAreaSize = function(c,r,chosenTileAreaSize,data){
	var a = this.gatherGridObjectsForTileAreaSize(c,r,chosenTileAreaSize);
	var i;
	var l = a.length;
	
	
	for(i=0;i<l;i++){
		a[i].oX = a[i].x - a[0].x;
		a[i].oY = a[i].y - a[0].y;
		a[i].ocupied = true;
		a[i].a = chosenTileAreaSize;
		a[i].data = data;
		
	}
	return a;
}

LayoutManager.prototype.getGridSizeOptions = function(c,r,orientation,searchDirection){
	//check grid hash table and check what size options are available
	//add sizes to array if available.
	var gridSizeOptionsArray = [1];
	if(orientation===0){
		switch(searchDirection){
			case 0:				//SE normal
				if(!this.checkGridOcupiedFor2x2(c,r)) gridSizeOptionsArray.push(4);
				if(!this.checkGridOcupiedFor3x3(c,r)) gridSizeOptionsArray.push(9);
				break;
			case 1:				//SW
				if(!this.checkGridOcupiedFor2x2(c-1,r)) gridSizeOptionsArray.push(4);
				if(!this.checkGridOcupiedFor3x3(c-2,r)) gridSizeOptionsArray.push(9);
				break;
			case 2:				//NW
				if(!this.checkGridOcupiedFor2x2(c-1,r-1)) gridSizeOptionsArray.push(4);
				if(!this.checkGridOcupiedFor3x3(c-2,r-2)) gridSizeOptionsArray.push(9);
				break;
			case 3:				//NE
				if(!this.checkGridOcupiedFor2x2(c,r-1)) gridSizeOptionsArray.push(4);
				if(!this.checkGridOcupiedFor3x3(c,r-2)) gridSizeOptionsArray.push(9);
				break;
		}
	}else{
		switch(searchDirection){
			case 0:
				if(!this.checkGridOcupiedFor1x2(c,r)) gridSizeOptionsArray.push(2);
				break;
			case 1:
				if(!this.checkGridOcupiedFor1x2(c,r)) gridSizeOptionsArray.push(2);
				break;
			case 2:
				if(!this.checkGridOcupiedFor1x2(c,r-1)) gridSizeOptionsArray.push(2);
				break;
			case 3:
				if(!this.checkGridOcupiedFor1x2(c,r-1)) gridSizeOptionsArray.push(2);
				break;
		}
		
		//if(!this.checkGridOcupiedFor2x2(c,r)) gridSizeOptionsArray.push(4);
	}
	return gridSizeOptionsArray;
};


/**
*@description 
*/
LayoutManager.prototype.checkGridOcupiedFor2x2 = function(c,r){
	return (this.getGridObject(c,r).ocupied === true || this.getGridObject(c+1,r).ocupied === true || this.getGridObject(c,r+1).ocupied === true || this.getGridObject(c+1,r+1).ocupied === true);
}
LayoutManager.prototype.checkGridOcupiedFor3x3 = function(c,r){
	return (this.getGridObject(c,r).ocupied === true || this.getGridObject(c+1,r).ocupied === true || this.getGridObject(c+2,r).ocupied === true || this.getGridObject(c,r+1).ocupied === true || this.getGridObject(c+1,r+1).ocupied === true || this.getGridObject(c+2,r+1).ocupied === true || this.getGridObject(c,r+2).ocupied === true || this.getGridObject(c+1,r+2).ocupied === true || this.getGridObject(c+2,r+2).ocupied === true);
}
LayoutManager.prototype.checkGridOcupiedFor1x2 = function(c,r){
	return (this.getGridObject(c,r).ocupied === true || this.getGridObject(c,r+1).ocupied === true);
}
LayoutManager.prototype.checkGridOcupiedFor2x3 = function(c,r){
	return (this.getGridObject(c,r).ocupied === true || this.getGridObject(c+1,r).ocupied === true || this.getGridObject(c,r+1).ocupied === true || this.getGridObject(c+1,r+1).ocupied === true || this.getGridObject(c,r+2).ocupied === true || this.getGridObject(c+1,r+2).ocupied === true);
}



LayoutManager.prototype.queueClippedElements = function(rect){
	var gridObjectIndex;
	for(var i=this._displayList.length-1;i>-1;i--){
		
		if(( this._displayList[i].x + 1 > rect.left + rect.width || this._displayList[i].r < rect.left) || (this._displayList[i].y + 1 > rect.top + rect.height || this._displayList[i].b < rect.top)){
			
			//console.log("remove: x:"+this._displayList[i].x+" y:"+this._displayList[i].y);
			this.queueElement(this._displayList[i].element);
			//iterate through array of grid objects and update all
			//this._displayList[i].gridObjects.visible = false;
			for(gridObjectIndex=0;gridObjectIndex<this._displayList[i].gridObjects.length;gridObjectIndex++){
				this._displayList[i].gridObjects[gridObjectIndex].visible = false;
			}
			this._displayList.splice(i,1);
		}
	}
};

LayoutManager.prototype.createTile = function(){
	var el = document.createElement("div");
	el.setAttribute("class","tile");
	this._containerElement.appendChild(el);
	return el;
}

LayoutManager.prototype.queueElement = function(el){
	el.style.display = "none";
	this._queuedElements.push(el);
}
LayoutManager.prototype.dequeueElement = function(){
	if(this._queuedElements.length > 0){
		return this._queuedElements.pop();
	}
	return undefined;
}
LayoutManager.prototype.getGridObject = function(c,r){
	var coords = String(c)+"-"+String(r);
	if(this._gridHashTable[coords]===undefined){
		this._gridHashTable[coords] = this.createGridObject(c,r);
	}
	var o = this._gridHashTable[coords];
	return o;
}

LayoutManager.prototype.createGridObject = function(c,r){
	return {ocupied:false,data:undefined,visible:false,x:c,y:r,oX:0,oY:0,a:1};
}

LayoutManager.prototype.getWindowRect = function(){
	var frame = {};
	var offsetLeft = window.layout.getPlaneController().getPlaneX();
	var offsetTop = window.layout.getPlaneController().getPlaneY();
	if(this._containerElement.offsetLeft > 0){
		frame.left = Math.ceil(Math.abs(offsetLeft / this._TILE_WIDTH))* -1;;
	}else{
		frame.left = Math.floor(Math.abs(offsetLeft / this._TILE_WIDTH)); 
	}
	if(this._containerElement.offsetTop > 0){
		frame.top = Math.ceil(Math.abs(offsetTop / this._TILE_HEIGHT))* -1;
	}else{
		frame.top = Math.floor(Math.abs(offsetTop / this._TILE_HEIGHT)) ;
	}
	frame.width = Math.ceil(( (window.innerWidth - offsetLeft) - (frame.left * this._TILE_WIDTH) ) / this._TILE_WIDTH);
	frame.height = Math.ceil(( (window.innerHeight - offsetTop) - (frame.top * this._TILE_HEIGHT) ) / this._TILE_HEIGHT);
	//frame.width = Math.ceil(( (400 - offsetLeft) - (frame.left * this._TILE_WIDTH) ) / this._TILE_WIDTH);
	//frame.height = Math.ceil(( (300 - offsetTop) - (frame.top * this._TILE_HEIGHT) ) / this._TILE_HEIGHT);
	return frame;
}

LayoutManager.prototype.calculateDataAreaRect = function(area){
	var side = Math.floor(Math.sqrt(area));
	var offset =  - Math.round(side/2);
	console.log("calculateDataAreaRect: left:"+offset+" top:"+offset+" width:"+side+" height:"+side);
	return new Rectangle(offset,offset,side,side);
}