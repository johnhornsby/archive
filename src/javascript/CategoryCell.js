var CategoryCell = function(categoryIndex){
	EventDispatcher.call(this);
	
	this._categoryIndex = categoryIndex;
	this._parentTableContainer = document.getElementById("plane");
	this._containerElement;
	this._tilesContainer;
	this._y = 0;
	this._tileContainerX = 0;
	this._veilElement;
	this._titleBlockElement;
	this._tileEngine;
	
	this._isScrolling = false;
	this._isAnimating = false;
	
	this.init();
};
CategoryCell.prototype = new EventDispatcher();


CategoryCell.prototype.init = function(){
	this.build();
};

CategoryCell.prototype.build = function(){
	//build containers
	var html='';
	html +='<div class="categoryCellContainer" id="categoryCell'+this._categoryIndex+'">';
	html +='<div class="categoryCellTilesContainer"></div>';
	html +='<h1 class="categoryTitleBlockContainer"></h1>';
	//html +='<div class="categoryVeilContainer"></div>';
	html +='</div>';
	
	$(this._parentTableContainer).append(html);
	
	this._containerElement = $("#categoryCell"+this._categoryIndex).get(0);
	this._tilesContainer = $("#categoryCell"+this._categoryIndex+" > .categoryCellTilesContainer").get(0);
	this._titleBlockElement = $("#categoryCell"+this._categoryIndex+" > .categoryTitleBlockContainer");
	//this._veilElement = $("#categoryCell"+this._categoryIndex+" > .categoryVeilContainer").get(0);
	
	var tileEngineConfiguration = new TileEngineConfiguration();
	tileEngineConfiguration.fillMode = TileEngineConfiguration.FILL_MODE_SCREEN;
	tileEngineConfiguration.fillPattern = TileEngineConfiguration.FILL_PATTERN_TOP_TO_BOTTOM;
	tileEngineConfiguration.fillConstraintType = TileEngineConfiguration.FILL_CONSTRAINT_TYPE_RECT;
	tileEngineConfiguration.fillConstraintRadius = "auto";
	tileEngineConfiguration.fillConstraintRect = "0,auto,3,0";
	tileEngineConfiguration.fillContainer = this._tilesContainer;
	
	this._tileEngine = new TileEngine(tileEngineConfiguration);
};

CategoryCell.prototype.onDragEnd = function(finalLeftDelta,finalTopDelta,left,top){
	var outsideDragBounds = this.checkOutsideDragBounds();
	if(outsideDragBounds === false){		//animate inertia
		if(Math.abs(finalLeftDelta) > Math.abs(finalTopDelta) && Globals.os === Globals.OS_OTHER){
			this.initInertiaAnimation(finalLeftDelta);
		}
	}
};

CategoryCell.prototype.checkOutsideDragBounds = function(){
	var tileEngineBounds = this._tileEngine.getBounds();
	var offsetLeft = this._tileContainerX;
	var offsetRight = offsetLeft + tileEngineBounds.width + Globals.TILE_WIDTH;
	var isOutside = false;
	var correctedOffsetLeft = 0;
	if(offsetLeft > 0 || offsetRight < window.innerWidth && offsetLeft < 0 && tileEngineBounds.width + Globals.TILE_WIDTH < window.innerWidth){ //off left
		isOutside = true;
	}else if(offsetRight < window.innerWidth && offsetLeft < 0 && tileEngineBounds.width + Globals.TILE_WIDTH > window.innerWidth){
		isOutside = true;
		correctedOffsetLeft = window.innerWidth - (tileEngineBounds.width + Globals.TILE_WIDTH);
		correctedOffsetLeft = Math.round(correctedOffsetLeft/Globals.TILE_WIDTH)*Globals.TILE_WIDTH;
	}
	if(isOutside === true){
		//Globals.log("Constrain offsetLeft to :"+correctedOffsetLeft+" from:"+offsetLeft );
		jTweener.addTween(this, {
			time: Globals.CONSTRAINT_TWEEN_TIME,
			transition: 'easeOutQuad',
			_tileContainerX:correctedOffsetLeft,
			onUpdate: this.onTweenUpdate.context(this),
			onComplete: this.onTweenComplete.context(this)
		});
		this._isAnimating = true;
		return true;
	}
	
	return false;
};

CategoryCell.prototype.initInertiaAnimation = function(finalLeftDelta){
	var leftAnimationProperties = this.getAnimaitonProperties(finalLeftDelta);
	var snappedDestinationX = Math.round((leftAnimationProperties.distance + this._tileContainerX)/Globals.TILE_WIDTH)*Globals.TILE_WIDTH;
	
	//var contentWidth = window.innerWidth - (this._tileEngine.getBounds().width + Globals.TILE_WIDTH);
	if(snappedDestinationX > 0){
		snappedDestinationX = 0;
	}
	/*else if(snappedDestinationX < contentWidth){
		snappedDestinationX = contentWidth;
	}*/
	
	
	jTweener.addTween(this, {
		time: leftAnimationProperties.time,
		transition: 'easeOutQuad',
		_tileContainerX: snappedDestinationX,
		onUpdate: this.onTweenUpdate.context(this),
		onComplete: this.onTweenComplete.context(this)
	});
	this._isAnimating = true;
};

CategoryCell.prototype.getAnimaitonProperties = function(delta){
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

CategoryCell.prototype.onTweenUpdate = function(){
	//this._tileContainerX = $(this._tilesContainer).offset().left;
	this._tilesContainer.style.left = this._tileContainerX+"px";
	this._tileEngine.render();
};

CategoryCell.prototype.onTweenComplete = function(){
	this.stopPlaneAnimation();
	this.checkOutsideDragBounds();
};

CategoryCell.prototype.stopPlaneAnimation = function(){
	if(this._isAnimating === true){
		jTweener.removeTween(this);
		this._isAnimating = false;
	}
};




//PUBLIC
//____________________________________________________________________________________________________
CategoryCell.prototype.destroy = function(){
	this.stopPlaneAnimation();
	this._tileEngine.destroy();
};

CategoryCell.prototype.clear = function(){
	this.stopPlaneAnimation();
	this._tileEngine.clear();
};

CategoryCell.prototype.getY = function(){
	return this._y;
};

CategoryCell.prototype.setY = function(y){
	this._y = y;
	this._containerElement.style.top = this._y +"px";
};

CategoryCell.prototype.setData = function(tilesData,restoreStateObject,titleData){
	if(restoreStateObject!==undefined){
		this._tileContainerX = restoreStateObject.tileContainerX;
		this._tilesContainer.style.left = this._tileContainerX + "px";
	}else{
		this._tileContainerX = 0;
		this._tilesContainer.style.left = this._tileContainerX + "px";
	}
	
	//titleData = this._categoryIndex;
	this._titleBlockElement.html(titleData);
	this._tileEngine.setData(tilesData,restoreStateObject);
};

CategoryCell.prototype.setScrollDeltaX = function(x){
	this.stopPlaneAnimation();
	this._tileContainerX += x;
	this._tilesContainer.style.left = this._tileContainerX + "px";
};

CategoryCell.prototype.setVisible = function(b){
	if(b===true){
		this._containerElement.style.display = "block";
	}else{
		this._containerElement.style.display = "none";
	}
};

CategoryCell.prototype.update = function(){
	this._tileEngine.render();
};

CategoryCell.prototype.getSaveState = function(){
	var saveState = this._tileEngine.getSaveState();
	saveState.tileContainerX = this._tileContainerX;
	return saveState;
};

CategoryCell.prototype.isScrolling = function(){
	return this._isScrolling;
};
CategoryCell.prototype.getArtefactInformationAtPoint = function(pt){
	return this._tileEngine.getArtefactInformationAtPoint(pt);
};

CategoryCell.prototype.dragEnd = function(finalLeftDelta,finalTopDelta,left,top){
	this.onDragEnd(finalLeftDelta,finalTopDelta,left,top);
};