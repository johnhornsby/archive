var RandomCanvas = function(){
	EventDispatcher.call(this);
	
	this._tilesContainer = document.getElementById("plane");
	this._tileContainerY = 0;
	this._tileContainerX = 0;
	this._tileEngine;
	
	this._isAnimating = false;			//plane is being tweened to correct dragging outide of bounds, or insertia tweened
	
	this.init();
};
RandomCanvas.prototype = new EventDispatcher();







//INTERNAL
//_____________________________________________________________________________________________
RandomCanvas.prototype.init = function(){
	this.build();
};

RandomCanvas.prototype.build = function(){
	var tileEngineConfiguration = new TileEngineConfiguration();
	tileEngineConfiguration.fillMode = TileEngineConfiguration.FILL_MODE_SCREEN;
	tileEngineConfiguration.fillPattern = TileEngineConfiguration.FILL_PATTERN_TOP_TO_BOTTOM;
	tileEngineConfiguration.fillConstraintType = TileEngineConfiguration.FILL_CONSTRAINT_TYPE_RADIUS;
	tileEngineConfiguration.fillConstraintRadius = "auto";
	//tileEngineConfiguration.fillConstraintRect = "0,auto,3,0";
	tileEngineConfiguration.fillContainer = this._tilesContainer;
	
	this._tileEngine = new TileEngine(tileEngineConfiguration);
};

RandomCanvas.prototype.onSetData = function(tilesData){
	//RESET position here, because when you filter the decrease in content may give you a blank screen
	this.resetTileContainer();
	
	this._tileEngine.setData(tilesData);
};

RandomCanvas.prototype.onUpdate = function(){
	this._tileEngine.render();
};

RandomCanvas.prototype.onSetScrollDelta = function(dx,dy,x,y){
	this.stopPlaneAnimation();
	
	this._tileContainerX += dx;
	this._tilesContainer.style.left = this._tileContainerX + "px";
	this._tileContainerY += dy;
	this._tilesContainer.style.top = this._tileContainerY + "px";
	this._tileEngine.render();
};

RandomCanvas.prototype.onDragEnd = function(finalLeftDelta,finalTopDelta,left,top){
	var outsideDragBounds = this.checkOutsideDragBounds();
	if(outsideDragBounds === false){		//animate inertia
		if(Globals.os === Globals.OS_OTHER){
			this.initInertiaAnimation(finalLeftDelta,finalTopDelta);
		}
	}
};

RandomCanvas.prototype.checkOutsideDragBounds = function(){
	var tileEngineRadius = this._tileEngine.getRadius();			//what is the constraint
	var centreX = Math.round(window.innerWidth/2);
	var centreY = Math.round(window.innerHeight/2);
	var containerOffsetX = this._tileContainerX - centreX;			//what is distance from the orgin of the container to the center of the screeen
	var containerOffsetY = this._tileContainerY - centreY;
	var normalisedOffsetX = containerOffsetX / Globals.TILE_WIDTH;	//normalised to the tile proportions of the grid
	var normalisedOffsetY = containerOffsetY / Globals.TILE_HEIGHT;
	var currentRadius = Math.sqrt(Math.pow(normalisedOffsetX,2) +Math.pow(normalisedOffsetY,2)); //normalised current radius 
	if(currentRadius > tileEngineRadius){
		var theta = Math.atan(Math.abs(normalisedOffsetY)/Math.abs(normalisedOffsetX));	//get angle of current offset from centre, important to use normalised to tile proportions as this will give you an incorrect angle.
		var normalisedX = Math.cos(theta) * tileEngineRadius;
		var normalisedY = Math.sin(theta) * tileEngineRadius;
		var compensatedX = normalisedX * Globals.TILE_WIDTH;
		var compensatedY = normalisedY * Globals.TILE_HEIGHT;	
		
		if(containerOffsetX >= 0 && containerOffsetY < 0){			//Quadrant 1
			compensatedY = compensatedY * -1;
		}else if(containerOffsetX >= 0 && containerOffsetY >= 0){	//Quadrant 4
			//all is coo
		}else if(containerOffsetX < 0 && containerOffsetY >= 0){ 	//Quadrant 3
			compensatedX = compensatedX * -1;	
		}else{														//Quadrant 2
			compensatedY = compensatedY * -1;
			compensatedX = compensatedX * -1;	
		}
		console.log("Constrain radius currentRadius:"+currentRadius+" tileEngineRadius:"+tileEngineRadius+" compensatedX:"+compensatedX+" compensatedY:"+compensatedY);
		jTweener.addTween(this._tilesContainer, {
			time: Globals.CONSTRAINT_TWEEN_TIME,
			transition: 'easeOutQuad',
			left: centreX + compensatedX,
			top: centreY + compensatedY,
			onUpdate: this.onTweenUpdate.context(this),
			onComplete: this.onTweenComplete.context(this)
		});
		this._isAnimating = true;
		return true;
	}
	return false;
};

RandomCanvas.prototype.initInertiaAnimation = function(finalDeltaLeft,finalDeltaTop){
	var leftAnimationProperties = this.getAnimaitonProperties(finalDeltaLeft);
	var topAnimationProperties = this.getAnimaitonProperties(finalDeltaTop);
	
	jTweener.addTween(this._tilesContainer, {
		time: Math.max(leftAnimationProperties.time, topAnimationProperties.time),
		transition: 'easeOutQuad',
		left: this._tileContainerX + leftAnimationProperties.distance,
		top: this._tileContainerY + topAnimationProperties.distance,
		onUpdate: this.onTweenUpdate.context(this),
		onComplete: this.onTweenComplete.context(this)
	});
	this._isAnimating = true;
};

RandomCanvas.prototype.getAnimaitonProperties = function(delta){
	var frameCount = 0;
	var distance = 0;
	while(delta > 0.5 || delta < -0.5){
		delta *= 0.9;
		distance += delta;
		frameCount++;
	}
	var fps = 30;
	var milliseconds = (1000/fps); 
	var time = (1 / milliseconds) * frameCount;
	return {time:time, distance:distance};
};

RandomCanvas.prototype.onTweenUpdate = function(){
	this._tileContainerY = $(this._tilesContainer).offset().top;
	this._tileContainerX = $(this._tilesContainer).offset().left;
	this._tileEngine.render();
};

RandomCanvas.prototype.onTweenComplete = function(){
	this.stopPlaneAnimation();
	//this.checkOutsideDragBounds();
};

RandomCanvas.prototype.stopPlaneAnimation = function(){
	if(this._isAnimating === true){
		jTweener.removeTween(this._tilesContainer);
		this._isAnimating = false;
	}
};

RandomCanvas.prototype.resetTileContainer = function(){
	this._tileContainerX = Math.round(window.innerWidth/2);
	this._tileContainerY = Math.round(window.innerHeight/2);
	this._tilesContainer.style.left = this._tileContainerX + "px";
	this._tilesContainer.style.top = this._tileContainerY + "px";
};







//PUBLIC
//_______________________________________________________________________________________________
RandomCanvas.prototype.destroy = function(){
	this.stopPlaneAnimation();
	this._tileEngine.destroy();
};

RandomCanvas.prototype.clear = function(){
	this.stopPlaneAnimation();
	this._tileEngine.clear();
};

RandomCanvas.prototype.update = function(){
	this.onUpdate();
};

RandomCanvas.prototype.setData = function(data){
	this.onSetData(data);
};

RandomCanvas.prototype.setScrollDelta = function(dx,dy,x,y){
	this.onSetScrollDelta(dx,dy,x,y);
};

RandomCanvas.prototype.dragEnd = function(finalLeftDelta,finalTopDelta,left,top){
	this.onDragEnd(finalLeftDelta,finalTopDelta,left,top);
};

RandomCanvas.prototype.getArtefactInformationAtPoint = function(pt){
	return this._tileEngine.getArtefactInformationAtPoint(pt);
};