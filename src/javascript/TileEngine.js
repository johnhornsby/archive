
var TileEngine = function(configuration){
	
	this._TILE_WIDTH = 113;
	this._TILE_HEIGHT = 85;
	
	this._configuration = configuration;
	this._containerElement = configuration.fillContainer;
	
	this._currentData;
	this.fire = {};
	this._displayList = [];
	this._queuedElements = [];
	
	this._totalTiles=0;
	this._totalArea=0;
	this._maxTiles;
	this._constraintRadius=0;
	this._optimumRatio;
	this._maxArea;
	this._windowRect;
	this._constraintRect;
	this._gridRect;
	
	this._BALANCED_FEED = [9,9,9,9,4,4,4,4,4,4,4,4,4,4,4,4,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
	this._FLIP_FLOP_FEED = [1,0,0,1,0,1,1,0];
	this._currentBalancedFeed = [];
	this._currentFlipFlopFeed = [];
	
	//temp properties
	this._lastTime;
	this._nowTime;
	this._errorMode = false;
	
	//lets do it
	this.init();
}

TileEngine.TILE_WIDTH = 113;
TileEngine._TILE_HEIGHT = 85;




//PRIVATE
//_________________________________________________________________________________________________
TileEngine.prototype.init = function(){
	//oh nothing to do here, wait for setData
};


TileEngine.prototype.onDestroy = function(){
	//clear()
	this.onClear();
	//remove all elements from container
	this.removeAllElements();
};

TileEngine.prototype.onClear = function(){
	//reset properties
	//Globals.log("TileEngine onClear");
	this._totalTiles=0;
	this._totalArea=0;
	this._maxTiles=0;
	this._constraintRadius=0;
	this._optimumRatio=0;
	this._maxArea=0;
	this._currentBalancedFeed = [];
	this._currentFlipFlopFeed = [];
	this._gridRect = new Rectangle();
	//clear grid objects
	this._gridHashTable = {};
	//remove all from displayList
	this.queueAllElements();
};


TileEngine.prototype.onSetData = function(data,restoreStateObject,noOfStubTiles){	
	this.onClear();
	
	if(restoreStateObject !== undefined){
		this.restoreState(restoreStateObject);
	}else if(noOfStubTiles !== undefined){
		this.createStubTiles(data,noOfStubTiles);
	}
	
	this._currentData = data;
	this._maxTiles = this._currentData.length;
	
	if(this._maxTiles===0)return false;
	
	this._optimumRatio = this._BALANCED_FEED.length / this._BALANCED_FEED.sum();
	this._maxArea = this._maxTiles / this._optimumRatio;
	
	//Check Constraint
	var rectSides;
	if(this._configuration.fillConstraintType === TileEngineConfiguration.FILL_CONSTRAINT_TYPE_RECT){
		if(this._configuration.fillConstraintRect === "auto"){
			this._constraintRect = this.calculateDataAreaRect(this._maxArea);
		}else{
			rectSides = this._configuration.fillConstraintRect.split(",");
			this._constraintRect = new Rectangle();
			this._constraintRect.left = parseInt(rectSides[3]);//auto left not supported
			this._constraintRect.top = parseInt(rectSides[0]);//auto top not supporte
			this._constraintRect.width = (rectSides[1]!="auto")?parseInt(rectSides[1]):99999;
			this._constraintRect.height = (rectSides[2]!="auto")?parseInt(rectSides[2]):99999;
		}
		this._constraintRadius = 99999;
	}else{
		if(this._configuration.fillConstraintRadius !== "auto"){
			this._constraintRadius = parseInt(this._configuration.fillConstraintRadius);
		}else{
			this._constraintRadius = Math.sqrt(this._maxArea  / Math.PI);
		}
		this._constraintRect = new Rectangle(-99999,-99999,199998,199998);
	}
	
	
	//TODO
	//check options to flood
};

TileEngine.prototype.restoreState = function(restoreStateObject){
	this._totalTiles = restoreStateObject.totalTiles;
	this._totalArea = restoreStateObject.totalArea
	this._gridHashTable = restoreStateObject.gridHashTable;
	this._currentBalancedFeed = restoreStateObject.currentBalancedFeed;
	this._currentFlipFlopFeed = restoreStateObject.currentFlipFlopFeed;
	this._gridRect = restoreStateObject.bounds;							//restore grid bounds as this is cleared and will not be built again, required for constraint in categoryCell
	//reset all grid objects to visible == false, this will allow them to be drawn again.
	for (var object in this._gridHashTable) { 
		if(object.constructor === String){
			this._gridHashTable[object].visible = false;
		}
	}

};

/**
* Prepopulate blank tiles to fill grid so content is not obsured by title in category view.
**/
TileEngine.prototype.createStubTiles = function(data,noOfStubTiles){
	//{"a":"exercitation Excepteur dolor","id":1,"d":20040101,"c":"adipisicing voluptate","t":"elit, magna","o":1,"m":0,"p":"Grand Hotel – The Musical"}
	var gridObject;
	var i;
	for(i=0;i<noOfStubTiles;i++){
		//copy date and produciton title from real data, this is because the dummy becomes the first data cell and will be used to display the title
		//m is set to 4 and simply uses a black gif, lazy hack here, but I did not want to alter the engine much to implement these stub tiles.
		data.unshift({a:"",id:0,d:data[0].d,c:"",t:"",o:0,m:4,p:data[0].p});	
		gridObject = this.getGridObject(i, 0);
		gridObject.data = data[this._totalTiles];					//this must be in this if block and be before we increment totalTiles
		gridObject.ocupied = true;
		this._totalTiles++;
	}
};

//994 on iPad and 224 on iMac
TileEngine.prototype.floodGrid = function(){
	
	this._lastTime = new Date().getTime();
	var gridSizeOptionsArray;
	var chosenTileAreaSize;
	var searchDirection;
	var modX;
	var modY;
	var gridObject;
	var searchDirectionString;
	
	var fillRect = this._constraintRect;
	
	for(var c = fillRect.left; c < fillRect.left + fillRect.width; c++){
		for(var r = fillRect.top; r < fillRect.top + fillRect.height; r++){
			gridObject = this.getGridObject(c, r);										//get the grid object for cells location					
	
			//!!!!! GET TILE DATA
			//_______________________________________________________________
			if(gridObject.ocupied === false){											//Check if we need to create a new tile or use existing one
				// NEW TILE //
				if(this._totalTiles + 1 === this._maxTiles ){ 							//no more tiles to be populated
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
	Globals.log("TileEngine flood complete:"+ this._nowTime);
};


TileEngine.prototype.update = function(){
	//console.log();
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
	var displayObject;
	var src;
	
	if(this._maxTiles === 0) return false;	//tileEngine may have no tiles because of filtered data
	
	this._windowRect = this.getWindowRect();
	this.queueClippedElements(this._windowRect);
	
	//for(var r = (this._windowRect.top + this._windowRect.height)-1; r > -1; r--){
		//for(var c = this._windowRect.left; c < this._windowRect.left + this._windowRect.width; c++){
			
	for(var c = this._windowRect.left; c < this._windowRect.left + this._windowRect.width; c++){
		for(var r = this._windowRect.top; r < this._windowRect.top + this._windowRect.height; r++){
			
			if(this.isWithinMaxRaduis(c, r)){
				if(this._constraintRect.contains(c, r)){											//only iterate through cells that are within the extent of the data rectangle
					gridObject = this.getGridObject(c, r);										//get the grid object for cells location
					if(gridObject.visible===false){												//only process if the cell requries it, tile is already visible on screen
						
						
						
						//!!!!! GET TILE DATA
						//_______________________________________________________________
						if(gridObject.ocupied === false){											//Check if we need to create a new tile or use existing one
							// NEW TILE //
							if(this._totalTiles === this._maxTiles){ 								//no more tiles to be populated
								continue; 															//continue to next loop
							}
							
							gridObject.data = this._currentData[this._totalTiles];					//this must be in this if block and be before we increment totalTiles
							this._totalTiles++;														//what ever happens next we will be adding a tile
							
							if(this._configuration.fillConstraintType === TileEngineConfiguration.FILL_CONSTRAINT_TYPE_RADIUS){
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
							}else{
								searchDirection = 0;//SE
							}
							
							//gridObject.sd = searchDirectionString;									//temporary 
							
							
							//gridObjectsArray = this.setupGridCells();
							
							gridSizeOptionsArray = this.getGridSizeOptions(c,r,gridObject.data.o,searchDirection);				//check what options are available in the grid from a certain direction, return areas
							
							
							//chosenTileAreaSize = gridSizeOptionsArray[Math.floor(Math.random()*gridSizeOptionsArray.length)];	//determin what size to use from array, random at the moment
							//this._totalArea += chosenTileAreaSize;
							
							chosenTileAreaSize = this.chooseTileSize(gridSizeOptionsArray);
							
							
							modX = this.getOffsetXModifierForAreaAndDirection(chosenTileAreaSize,searchDirection);				//reset offset modifiers, these are used to correctly position larger than 1x1 
							modY = this.getOffsetYModifierForAreaAndDirection(chosenTileAreaSize,searchDirection);
							
							gridObjectsArray = this.initiateGridObjectsForTileAreaSize(c+modX,r+modY,chosenTileAreaSize,gridObject.data);	//initated array of gridObjects, set with offset, ocupied = true, area (a) set to area
	
							this.updateGridBoundry(gridObjectsArray);
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
						//el.style.backgroundImage = 'url('+Globals.ARTEFACT_IMAGES_FOLDER+gridObject.data.id+'_'+this.getImageAreaPathIdentifier(gridObject.a)+'.jpg)';
						src = Globals.ARTEFACT_IMAGES_FOLDER+gridObject.data.id+'_'+this.getImageAreaPathIdentifier(gridObject.a)+'.jpg';
						
						
						//element top and left are resest to x and y taking into account the offet of the gridObject.
						//this c and r will be the x and y of the cell, but the tile may need to placed with offset.
						el.style.left = (c*this._TILE_WIDTH) - (gridObject.oX * this._TILE_WIDTH) + "px";
						el.style.top = (r*this._TILE_HEIGHT) - (gridObject.oY * this._TILE_HEIGHT) + "px";
						//el.style.opacity = "0.85";
						el.setAttribute("data",gridObject.data.id);
						el.style.display = "block"; //ensure element is black, will be 'none' if dequeued
						//el.innerHTML = '<div class="tileBorder"></div>';
						//el.innerHTML = "<div class='detail'>id:"+gridObject.data.id+"<br>ex:"+(c-gridObject.oX)+" ey:"+(r-gridObject.oY)+"<br>gx:"+c+" gy:"+r+"<br>oX:"+gridObject.oX+" oY:"+gridObject.oY+"<br>a:"+gridObject.a+"<br>s:"+gridObject.sd+"</div>"; 
						//set width of el to tile size
						switch(gridObject.a){
							case 1:
								el.style.width = this._TILE_WIDTH * 1 + "px";
								el.style.height = this._TILE_HEIGHT * 1 + "px";
								$(el).children().first().css("width",(this._TILE_WIDTH * 1)-2 + "px").css("height",(this._TILE_HEIGHT * 1)-2 + "px");
								elementWidth = 1;
								elementHeight = 1;
								break;
							case 2:
								el.style.width = this._TILE_WIDTH * 1 + "px";
								el.style.height = this._TILE_HEIGHT * 2 + "px";
								$(el).children().first().css("width",(this._TILE_WIDTH * 1)-2 + "px").css("height",(this._TILE_HEIGHT * 2)-2 + "px");
								elementWidth = 1;
								elementHeight = 2;
								break; 
							case 4:
								el.style.width = this._TILE_WIDTH * 2 + "px";
								el.style.height = this._TILE_HEIGHT * 2 + "px";
								$(el).children().first().css("width",(this._TILE_WIDTH * 2)-2 + "px").css("height",(this._TILE_HEIGHT * 2)-2 + "px"); 
								elementWidth = 2;
								elementHeight = 2;
								break;
							case 6:
								el.style.width = this._TILE_WIDTH * 2 + "px";
								el.style.height = this._TILE_HEIGHT * 3 + "px";
								$(el).children().first().css("width",(this._TILE_WIDTH * 2)-2 + "px").css("height",(this._TILE_HEIGHT * 3)-2 + "px");
								elementWidth = 2;
								elementHeight = 3;
								break;
							case 9:
								el.style.width = this._TILE_WIDTH * 3 + "px";
								el.style.height = this._TILE_HEIGHT * 3 + "px";
								$(el).children().first().css("width",(this._TILE_WIDTH * 3)-2 + "px").css("height",(this._TILE_HEIGHT * 3)-2 + "px");
								elementWidth = 3;
								elementHeight = 3;
								break;  
						}
						$(el).children().last().css("background-image","url(images/mediaType_"+gridObject.data.m+".gif)");
						/*
						switch(gridObject.m){
							case ArtefactDataManager.FILTER_PHOTO:
								
								break;
							case ArtefactDataManager.FILTER_POSTERS:
								break;
							case ArtefactDataManager.FILTER_VIDEO:
								break;
							case ArtefactDataManager.FILTER_AUDIO:
								break;
									
						}
						*/
						
						//!!!!! UPDATE DISPLAY LIST
						//_______________________________________________________________
						//iterate though grid objects and set visible = true and set into displaylist
						for(i=0;i<gridObjectsArray.length;i++){
							gridObjectsArray[i].visible = true;
						}
						
						//gridObject.visible = true;
						//displayObject coords based on top left of element
						
						displayObject = {src:src,loaded:false,element:el,x:c-gridObject.oX,y:r-gridObject.oY,r:(c-gridObject.oX)+(elementWidth-1),b:(r-gridObject.oY)+(elementHeight-1),gridObjects:gridObjectsArray};
						
						Globals.imageLoadManager.requestImageLoad(src, this.loadImageTileComplete.context(this), displayObject);
						
						this._displayList.push(displayObject)
						
					}
				}
			}
		}
	}
	/*
	$("#output_totalTiles").html(this._totalTiles+" of "+this._maxTiles);
	$("#output_totalArea").html(this._totalArea+" of "+this._maxArea);
	$("#output_displayListLength").html(this._displayList.length);
	$("#output_queueListLength").html(this._queuedElements.length);
	$("#output_planeChildren").html(this._containerElement.getElementsByTagName("div").length);
	*/
	//this._nowTime =  new Date().getTime()  - this._lastTime
	//console.log("layout complete:"+ this._nowTime);
};

TileEngine.prototype.loadImageTileComplete = function(displayObject){
	displayObject.element.style.backgroundImage = 'url('+displayObject.src+')';
	displayObject.loaded = true;
};

TileEngine.prototype.dressElement = function(){
	
};


TileEngine.prototype.chooseTileSize = function(areaSizesArray){
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
		//console.log("TileEngine.chooseTileSize() forces to use 1x1");
	}
	
	
	this._totalArea += chosenAreaSize;																//tally up area, used to calculate projected radius
	
	
	return chosenAreaSize;
}


TileEngine.prototype.isWithinMaxRaduis = function(c,r){
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
	
	
	//Not sure we need this
	//if(this._totalTiles===0)return true;
	
	
	
	//var percentageOfTiles = this._totalTiles / this._maxTiles;
	//var projectedMaxArea = this._totalArea / percentageOfTiles;
	//var maxRaduis = Math.sqrt(projectedMaxArea / Math.PI);
	
	//var currentRadius = Math.sqrt(Math.abs(Math.pow(c,2) + Math.pow(r,2)));
	//console.log("currentRadius:"+currentRadius+" maxRaduis:"+maxRaduis);
	if(Math.sqrt(Math.abs(Math.pow(c,2) + Math.pow(r,2))) < this._constraintRadius){
		return true;
	}else{
		return false;
	}
}

TileEngine.prototype.isRectWithinMaxRaduis = function(c,r,w,h){
	if(this.isWithinMaxRaduis(c,r) === false) return false;
	if(this.isWithinMaxRaduis(c+w,r) === false) return false;
	if(this.isWithinMaxRaduis(c,r+h) === false) return false;
	if(this.isWithinMaxRaduis(c+w,r+h) === false) return false;
	return true;
}

//reset offset modifiers, these are used to correctly position larger than
//1x1 elements when the spwaning cell is not the top left  
TileEngine.prototype.getOffsetXModifierForAreaAndDirection = function(area,direction){
	if(area===1){
		return 0;
	}else if(area===9 && (direction === 1 || direction === 2)){ // SW & NW
		return -2;	
	}else if(area===4 && (direction === 1 || direction === 2)){ // SW & NW
		return -1;	
	}
	return 0;
}
TileEngine.prototype.getOffsetYModifierForAreaAndDirection = function(area,direction){
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

TileEngine.prototype.getImageAreaPathIdentifier = function(area){
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

TileEngine.prototype.gatherGridObjectsForTileAreaSize = function(c,r,chosenTileAreaSize){
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

TileEngine.prototype.initiateGridObjectsForTileAreaSize = function(c,r,chosenTileAreaSize,data){
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
/*
TileEngine.prototype.getGridSizeOptions = function(c,r,orientation,searchDirection){
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
*/
TileEngine.prototype.getGridSizeOptions = function(c,r,orientation,searchDirection){
	//check grid hash table and check what size options are available
	//add sizes to array if available.
	var gridSizeOptionsArray = [1];
	if(orientation===0){
		switch(searchDirection){
			case 0:				//SE normal
				if(!this.checkGridOcupiedFor3x3(c,r)){
					if(this._constraintRect.containsRect(c,r,3,3) && this.isRectWithinMaxRaduis(c,r,3,3)){
						gridSizeOptionsArray.push(4);
						gridSizeOptionsArray.push(9);
					}
				}else if(!this.checkGridOcupiedFor2x2(c,r)){
					if(this._constraintRect.containsRect(c,r,2,2) && this.isRectWithinMaxRaduis(c,r,2,2)){
						gridSizeOptionsArray.push(4)
					}
				}
				break;
			case 1:			//SW
				if(!this.checkGridOcupiedFor3x3(c-2,r)){
					if(this._constraintRect.containsRect(c-2,r,3,3) && this.isRectWithinMaxRaduis(c-2,r,3,3)){
						gridSizeOptionsArray.push(4);
						gridSizeOptionsArray.push(9);
					}
				}else if(!this.checkGridOcupiedFor2x2(c-1,r)){
					if(this._constraintRect.containsRect(c-1,r,2,2) && this.isRectWithinMaxRaduis(c-1,r,2,2)){
						gridSizeOptionsArray.push(4)
					}
				}
				break;
			case 2:				//NW				
				if(!this.checkGridOcupiedFor3x3(c-2,r-2)){
					if(this._constraintRect.containsRect(c-2,r-2,3,3) && this.isRectWithinMaxRaduis(c-2,r-2,3,3)){
						gridSizeOptionsArray.push(4);
						gridSizeOptionsArray.push(9);
					}
				}else if(!this.checkGridOcupiedFor2x2(c-1,r-1)){
					if(this._constraintRect.containsRect(c-1,r-1,2,2) && this.isRectWithinMaxRaduis(c-1,r-1,2,2)){
						gridSizeOptionsArray.push(4);
					}
				}
				
				break;
			case 3:				//NE
				if(!this.checkGridOcupiedFor3x3(c,r-2)){
					if(this._constraintRect.containsRect(c,r-2,3,3) && this.isRectWithinMaxRaduis(c,r-2,3,3)){
						gridSizeOptionsArray.push(4);
						gridSizeOptionsArray.push(9);
					}
				}else if(!this.checkGridOcupiedFor2x2(c,r-1)){
					if(this._constraintRect.containsRect(c,r-1,2,2) && this.isRectWithinMaxRaduis(c,r-1,2,2)){
						gridSizeOptionsArray.push(4)
					}
				}
				break;
		}
	}else{
		switch(searchDirection){
			case 0:
				if(!this.checkGridOcupiedFor1x2(c,r)){
					if(this._constraintRect.containsRect(c,r,1,2) && this.isRectWithinMaxRaduis(c,r,1,2)){
						gridSizeOptionsArray.push(2);
					}
				}
				break;
			case 1:
				if(!this.checkGridOcupiedFor1x2(c,r)){
					if(this._constraintRect.containsRect(c,r,1,2) && this.isRectWithinMaxRaduis(c,r,1,2)){
						gridSizeOptionsArray.push(2);
					}
				}
				break;
			case 2:
				if(!this.checkGridOcupiedFor1x2(c,r-1)){
					if(this._constraintRect.containsRect(c,r-1,1,2) && this.isRectWithinMaxRaduis(c,r-1,1,2)){
						gridSizeOptionsArray.push(2);
					}
				}
				break;
			case 3:
				if(!this.checkGridOcupiedFor1x2(c,r-1)){
					if(this._constraintRect.containsRect(c,r-1,1,2) && this.isRectWithinMaxRaduis(c,r-1,1,2)){
						gridSizeOptionsArray.push(2);
					}
				}
				break;
		}
		
		//if(!this.checkGridOcupiedFor2x2(c,r)) gridSizeOptionsArray.push(4);
	}
	return gridSizeOptionsArray;
};


/**
*@description 
*/
TileEngine.prototype.checkGridOcupiedFor2x2 = function(c,r){
	return (this.getGridObject(c,r).ocupied === true || this.getGridObject(c+1,r).ocupied === true || this.getGridObject(c,r+1).ocupied === true || this.getGridObject(c+1,r+1).ocupied === true);
}
TileEngine.prototype.checkGridOcupiedFor3x3 = function(c,r){
	return (this.getGridObject(c,r).ocupied === true || this.getGridObject(c+1,r).ocupied === true || this.getGridObject(c+2,r).ocupied === true || this.getGridObject(c,r+1).ocupied === true || this.getGridObject(c+1,r+1).ocupied === true || this.getGridObject(c+2,r+1).ocupied === true || this.getGridObject(c,r+2).ocupied === true || this.getGridObject(c+1,r+2).ocupied === true || this.getGridObject(c+2,r+2).ocupied === true);
}
TileEngine.prototype.checkGridOcupiedFor1x2 = function(c,r){
	return (this.getGridObject(c,r).ocupied === true || this.getGridObject(c,r+1).ocupied === true);
}
TileEngine.prototype.checkGridOcupiedFor2x3 = function(c,r){
	return (this.getGridObject(c,r).ocupied === true || this.getGridObject(c+1,r).ocupied === true || this.getGridObject(c,r+1).ocupied === true || this.getGridObject(c+1,r+1).ocupied === true || this.getGridObject(c,r+2).ocupied === true || this.getGridObject(c+1,r+2).ocupied === true);
}


TileEngine.prototype.queueClippedElements = function(rect){
	//var gridObjectIndex;
	var i;
	var l = this._displayList.length-1;
	for(var i=l;i>-1;i--){
		
		if(( this._displayList[i].x + 1 > rect.left + rect.width || this._displayList[i].r < rect.left) || (this._displayList[i].y + 1 > rect.top + rect.height || this._displayList[i].b < rect.top)){
			
			//console.log("remove: x:"+this._displayList[i].x+" y:"+this._displayList[i].y);
			this.queueElement(this._displayList[i].element);
			//iterate through array of grid objects and update all
			//this._displayList[i].gridObjects.visible = false;
			for(gridObjectIndex=0;gridObjectIndex<this._displayList[i].gridObjects.length;gridObjectIndex++){
				this._displayList[i].gridObjects[gridObjectIndex].visible = false;
			}
			
			if(this._displayList[i].loaded === false){
				Globals.imageLoadManager.cancelRequestedImageLoad(this._displayList[i].src);
			}
			
			this._displayList.splice(i,1);
		}
	}
};

TileEngine.prototype.queueAllElements = function(){
	for(var i=this._displayList.length-1;i>-1;i--){
		this.queueElement(this._displayList[i].element);
		this._displayList.splice(i,1);
	}
};

TileEngine.prototype.createTile = function(){
	/*
	var el = document.createElement("div");
	el.setAttribute("class","tile");
	this._containerElement.appendChild(el);
	return el;
	*/
	
	return $(this._containerElement).append('<div class="tile"><div class="tileBorder"></div><div class="tileIcon"></div></div>').children().last().get(0);
}

TileEngine.prototype.queueElement = function(el){
	//el.style.display = "none";
	$(el).css('display','none');
	this._queuedElements.push(el);
}
TileEngine.prototype.dequeueElement = function(){
	if(this._queuedElements.length > 0){
		return this._queuedElements.pop();
	}
	return undefined;
}
TileEngine.prototype.removeAllElements = function(){
	if ( this._containerElement.hasChildNodes()){
		while ( this._containerElement.childNodes.length >= 1 ){
			this._containerElement.removeChild(this._containerElement.firstChild);       
		} 
	}
	this._queuedElements = [];
}

TileEngine.prototype.getGridObject = function(c,r){
	var coords = String(c)+"-"+String(r);
	if(this._gridHashTable[coords]===undefined){
		this._gridHashTable[coords] = this.createGridObject(c,r);
	}
	var o = this._gridHashTable[coords];
	return o;
}

TileEngine.prototype.createGridObject = function(c,r){
	return {ocupied:false,data:undefined,visible:false,x:c,y:r,oX:0,oY:0,a:1};
}


/*
TileEngine.prototype.getWindowRect = function(){
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
*/
TileEngine.prototype.getWindowRect = function(){
	var frame = {};
	//var offsetLeft = window.layout.getPlaneController().getPlaneX();
	//var offsetTop = window.layout.getPlaneController().getPlaneY();
	
	
	if(this._containerElement.offsetLeft > 0){
		frame.left = Math.ceil(Math.abs(this._containerElement.offsetLeft / this._TILE_WIDTH))* -1;;
	}else{
		frame.left = Math.floor(Math.abs(this._containerElement.offsetLeft / this._TILE_WIDTH)); 
	}
	if(this._containerElement.offsetTop > 0){
		frame.top = Math.ceil(Math.abs(this._containerElement.offsetTop / this._TILE_HEIGHT))* -1;
	}else{
		frame.top = Math.floor(Math.abs(this._containerElement.offsetTop / this._TILE_HEIGHT)) ;
	}
	//IE 8
	//frame.width = Math.ceil(( ($(window).width() - this._containerElement.offsetLeft) - (frame.left * this._TILE_WIDTH) ) / this._TILE_WIDTH);
	//frame.height = Math.ceil(( ($(window).height() - this._containerElement.offsetTop) - (frame.top * this._TILE_HEIGHT) ) / this._TILE_HEIGHT);
	
	frame.width = Math.ceil(( (window.innerWidth - this._containerElement.offsetLeft) - (frame.left * this._TILE_WIDTH) ) / this._TILE_WIDTH);
	frame.height = Math.ceil(( (window.innerHeight - this._containerElement.offsetTop) - (frame.top * this._TILE_HEIGHT) ) / this._TILE_HEIGHT);
	
	return frame;
}

TileEngine.prototype.calculateDataAreaRect = function(area){
	var side = Math.floor(Math.sqrt(area));
	var offset =  - Math.round(side/2);
	Globals.log("calculateDataAreaRect: left:"+offset+" top:"+offset+" width:"+side+" height:"+side);
	return new Rectangle(offset,offset,side,side);
}

TileEngine.prototype.updateGridBoundry = function(gridObjectArray){
	//Get Rect of gridobject
	var l = gridObjectArray[0].x * this._TILE_WIDTH;
	var t = gridObjectArray[0].y * this._TILE_HEIGHT;
	var r = gridObjectArray[gridObjectArray.length-1].x * this._TILE_WIDTH;
	var b = gridObjectArray[gridObjectArray.length-1].y * this._TILE_HEIGHT;
	
	var tileRect = new Rectangle(l, t, r-l, b-t);
	
	//If intersects boundry or outside then //amend gridBoundry
	if(this._gridRect.containsRect(l, t, r-l, b-t) === false){
		this._gridRect = this._gridRect.union(tileRect);
		//console.log("gridRect:" + this._gridRect.toString());
	}
}




//PUBLIC
//______________________________________________________________________________________________________________
TileEngine.prototype.destroy = function(){
	this.onDestroy();
};

TileEngine.prototype.clear = function(){
	this.onClear();
};

TileEngine.prototype.render = function(){
	this.update();
};

TileEngine.prototype.setData = function(data,restoredStateObject,noOfStubTiles){
	this.onSetData(data,restoredStateObject,noOfStubTiles);
};

TileEngine.prototype.getSaveState = function(){
	return {totalTiles:this._totalTiles,totalArea:this._totalArea,gridHashTable:this._gridHashTable,currentBalancedFeed:this._currentBalancedFeed,currentFlipFlopFeed:this._currentFlipFlopFeed,bounds:this._gridRect};
};

TileEngine.prototype.getBounds = function(){
	return this._gridRect;
};

TileEngine.prototype.getRadius = function(){
	return this._constraintRadius;
};

TileEngine.prototype.getConfiguration = function(){
	return this._configuration;
};

TileEngine.prototype.getArtefactInformationAtPoint = function(pt){
	var containerX = pageX(this._containerElement);
	var containerY = pageY(this._containerElement);
	
	var gridX = pt.x - containerX;
	var gridY = pt.y - containerY;
	
	var gridObjectX = Math.floor(gridX / this._TILE_WIDTH);
	var gridObjectY = Math.floor(gridY / this._TILE_HEIGHT);
	
	var gridObject = this.getGridObject(gridObjectX,gridObjectY)
	
	var rect = new Rectangle();
	rect.left = containerX + ((gridObjectX - gridObject.oX) * this._TILE_WIDTH);
	rect.top = containerY + ((gridObjectY - gridObject.oY) * this._TILE_HEIGHT);
	switch(gridObject.a){
		case 2:
			rect.width = this._TILE_WIDTH;
			rect.height = this._TILE_HEIGHT*2;
			break;
		case 4:
			rect.width = this._TILE_WIDTH*2;
			rect.height = this._TILE_HEIGHT*2;
			break;
		case 6:
			rect.width = this._TILE_WIDTH*3;
			rect.height = this._TILE_HEIGHT*2;
			break;
		case 9:
			rect.width = this._TILE_WIDTH*3;
			rect.height = this._TILE_HEIGHT*3;
			break;
		default:
			rect.width = this._TILE_WIDTH;
			rect.height = this._TILE_HEIGHT;
			break;
	}
	
	Globals.log("TileEngine you clicked on x:"+gridObjectX+" y:"+gridObjectY+" left:"+rect.left+" top:"+rect.top+" width:"+rect.width+" height:"+rect.height);
	
	return {data:gridObject.data,bounds:rect,gridObject:gridObject};
}