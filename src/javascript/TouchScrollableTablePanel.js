var TouchScrollableTablePanel = function(options){
	TouchScrollPanel.call(this,options);
	if(options === undefined) return;				// inheritance handling
	
	this._scrollableTable = options.scrollableTable;
	this._isAnimating = false;
	this.__tempDestination = 0;
	
};
//inheritance
TouchScrollableTablePanel.prototype = new TouchScrollPanel();
TouchScrollableTablePanel.prototype.constructor = TouchScrollableTablePanel;
TouchScrollableTablePanel.prototype.supr = TouchScrollPanel.prototype;

//OVERRIDE
//__
/*
TouchScrollableTablePanel.prototype.init = function(){
	this.supr.init.call(this);
	this._scrollableTable.addEventListener(ScrollableTableEvent.RELOAD_TABLE,this.onScrollableTableReload.context(this));
};
*/

TouchScrollableTablePanel.prototype.clear = function(){
	this.supr.clear.call(this);
	this.clearUpdateTweenScroll();
};

TouchScrollableTablePanel.prototype.updateDomScrollPosition = function(){
	this._scrollableTable.setScrollRect({left:this._x, top:this._y, width:this._frameElement.clientWidth, height:this._frameElement.clientHeight});
	//this.updateScrollThumbPosition();
	this.drawThumb();
	
};

TouchScrollableTablePanel.prototype.scrollToPreviousPage = function(){
	var cellDimension;
	var frameDimension;
	var excludeIntersected = true;
	var range = this._scrollableTable.getVisibleIndexRange(excludeIntersected);
	
	if(this._scrollDirection === TouchScrollPanel.SCROLL_DIRECTION_VERTICAL){
		cellDimension = Globals.TILE_HEIGHT;
		frameDimension = this._frameElement.clientHeight;
	}else{
		cellDimension = Globals.TILE_WIDTH;
		frameDimension = this._frameElement.clientWidth;
	}
	
	var maxCellsVisibleInFrame = Math.floor(frameDimension / cellDimension);
	var destinationIndex = range.index - maxCellsVisibleInFrame;
	var maxCells = this._scrollableTable.getMaxCells();
	var destination;
	if(destinationIndex <= 0){
		destination = 0;
	}else{
		destination = cellDimension * destinationIndex * -1;
	}
	this.slideToIndexPos(destination);
};

TouchScrollableTablePanel.prototype.scrollToNextPage = function(){
	var cellDimension;
	var frameDimension;
	var excludeIntersected = true;
	var range = this._scrollableTable.getVisibleIndexRange(excludeIntersected);
	
	if(this._scrollDirection === TouchScrollPanel.SCROLL_DIRECTION_VERTICAL){
		cellDimension = Globals.TILE_HEIGHT;
		frameDimension = this._frameElement.clientHeight;
	}else{
		cellDimension = Globals.TILE_WIDTH;
		frameDimension = this._frameElement.clientWidth;
	}
	
	var maxCellsVisibleInFrame = Math.floor(frameDimension / cellDimension);
	var destinationIndex = range.index + maxCellsVisibleInFrame;
	var maxCells = this._scrollableTable.getMaxCells();
	var destination;
	
	if(destinationIndex + maxCellsVisibleInFrame >= maxCells){
		destination = frameDimension - (cellDimension * maxCells);
	}else{
		destination = cellDimension * destinationIndex * -1;
	}
	this.slideToIndexPos(destination);
};

TouchScrollableTablePanel.prototype.setMouseWheenDelta = function(delta){
	this.supr.setMouseWheenDelta.call(this,delta);
};


//PRIVATE
//__
TouchScrollableTablePanel.prototype.slideToIndexPos = function(destination){
	this.__tempDestination = this.getScrollPosition();
	Animator.addTween(this,{__tempDestination:destination, time:0.5, transition:'easeOutQuad', onUpdate:this.updateTweenedScroll.context(this), onComplete:this.updateTweenScrollComplete.context(this)});
};
TouchScrollableTablePanel.prototype.updateTweenedScroll = function(){
	this.setScrollPosition(this.__tempDestination);
};

TouchScrollableTablePanel.prototype.updateTweenScrollComplete = function(){
	//Globals.log("updateTweenScrollXComplete");
};
TouchScrollableTablePanel.prototype.clearUpdateTweenScroll = function(){
	//Globals.log("clearUpdateTweenScrollX");
	Animator.removeTween(this);
};
TouchScrollableTablePanel.prototype.onScrollableTableReload = function(e){
	
};