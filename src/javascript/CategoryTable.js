var CategoryTable = function(){
	
	this.ROW_HEIGHT = 255;
	
	this._categorisedData;
	//this._categoryType;
	this._container = document.getElementById("plane");
	this._displayList = [];
	this._queuedCellsArray = [];
	this._cellObjectArray = [];
	
	this._isAnimating = false;
	this._maxRows;
	this._y = 0;
	
	this._categoryScrubberViewController;
	
	this.init();
}






//PRIVATE
//_________________________________________________________________________________________________
CategoryTable.prototype.init = function(){
	this._categoryScrubberViewController = new CategoryScrubberViewController();
	this._categoryScrubberViewController.addEventListener(CategoryScrubberViewControllerEvent.SET_SCROLL_VALUE,this.onScrubberSetScrollValue.rEvtContext(this));
	this._categoryScrubberViewController.show();
}

CategoryTable.prototype.onDestroy = function(){
	this.onClear();
	this._displayList = [];
	this._cellObjectArray = [];
	this.removeAllCells();
	this._categoryScrubberViewController.removeEventListener(CategoryScrubberViewControllerEvent.SET_SCROLL_VALUE);
	this._categoryScrubberViewController.destroy();
	this._categoryScrubberViewController = undefined;
};

CategoryTable.prototype.onClear = function(){
	this._maxRows = 0;
	this.stopPlaneAnimation();
	this.queueAllCells();
};


CategoryTable.prototype.onSetData = function(data){
	//FOR NOW
	//Clear queue all cells if any, removes from display lists, makes invisible.
	//We will probably need to create a better more effcient solution that keeps as much in place as it and simply replaces the data and redraws.
	//Scroll position is maintained currently as this is only reset when views change, however we may need to check to this if we remove categories with no data.
	this.onClear();
	//--
	
	this._categorisedData = data;
	this._maxRows = this._categorisedData.length;
	this.floodTable();
};

CategoryTable.prototype.floodTable = function(){
	var r;
	var l = this._categorisedData.length;
	var cellObject;
	for(r = 0; r < l; r++){
		cellObject = this.getCellObject(r);
		cellObject.data = this._categorisedData[r];
		//reset savedData here, as floodTable may be called to replace data in cells when we filter, we need to ditch any savedState as this explicitly refers to the previous data.
		cellObject.savedState = undefined;			
		//this._cellObjectArray[r] = {data:this._categorisedData[r],visible:false,y:r,categoryCell:undefined,savedState:undefined};//cellObject;
	}
};

CategoryTable.prototype.updateTable = function(){
	this._windowIndexRange = this.getWindowIndexRange();
	this.queueClippedCells(this._windowIndexRange);
	var cellObject;
	var categoryCell;
	var r;
	var categoryTitle;
	//console.log("top:"+this._windowIndexRange.top+" height:"+this._windowIndexRange.height);
	for(r = this._windowIndexRange.top; r < this._windowIndexRange.top + this._windowIndexRange.height; r++){
		if(r > -1 && r < this._maxRows){
			cellObject = this.getCellObject(r);
			if(cellObject.visible===false){	
				categoryCell = this.dequeueCell();
				if(categoryCell===undefined){
					categoryCell = new CategoryCell(r);
				}
				categoryCell.setVisible(true);
				categoryCell.setY(r*this.ROW_HEIGHT);
				//categoryCell.setData(cellObject.data,cellObject.savedState, Globals.artefactDataManager.getCategoryArtefactMetaDataWithIndex(r));
				//TODO
				//Needs to be refactored not to directed use private artefactDataManager wrapTitle but access a optimised preformated hash table
				if(Globals.artefactDataManager.getSelectionObject().category === ArtefactDataManager.CATEGORY_YEAR){
					categoryTitle = cellObject.data[0].d / 10000 >> 0;
				}else {
					categoryTitle = cellObject.data[0].p.toUpperCase();
				}
				categoryCell.setData(cellObject.data,cellObject.savedState, categoryTitle);
				cellObject.categoryCell = categoryCell;
				cellObject.visible = true;
				this._displayList.push({categoryCell:categoryCell,y:r,cellObject:cellObject});
			}
			cellObject.categoryCell.update();
		}
	}
};

CategoryTable.prototype.queueClippedCells = function(indexRange){
	//var cellObjectIndex;
	for(var i=this._displayList.length-1;i>-1;i--){
		
		if( this._displayList[i].y > indexRange.top + indexRange.height || this._displayList[i].y + 1 < indexRange.top){
			
			//console.log("remove: x:"+this._displayList[i].x+" y:"+this._displayList[i].y);
			
			this._displayList[i].cellObject.savedState = this._displayList[i].categoryCell.getSaveState(); //save tile engine state to cellObject to when we scroll back over the grid is rendered the same and ready behave as previous instance 
			
			this.queueCategoryCell(this._displayList[i].categoryCell);
			//iterate through array of grid objects and update all
			//this._displayList[i].gridObjects.visible = false;
			//for(gridObjectIndex=0;gridObjectIndex<this._displayList[i].gridObjects.length;gridObjectIndex++){
			this._displayList[i].cellObject.visible = false;
			
			
			//}
			this._displayList.splice(i,1);
		}
	}
};

CategoryTable.prototype.queueAllCells = function(){
	for(var i=this._displayList.length-1;i>-1;i--){
		this._displayList[i].cellObject.savedState = this._displayList[i].categoryCell.getSaveState();
		this.queueCategoryCell(this._displayList[i].categoryCell);
		this._displayList[i].cellObject.visible = false;
		this._displayList.splice(i,1);
	}
};

CategoryTable.prototype.queueCategoryCell = function(categoryCell){
	categoryCell.setVisible(false);
	//NOTE: Does not clear! Should it?
	this._queuedCellsArray.push(categoryCell);
}
CategoryTable.prototype.dequeueCell = function(){
	if(this._queuedCellsArray.length > 0){
		return this._queuedCellsArray.pop();
	}
	return undefined;
};

CategoryTable.prototype.removeAllCells = function(){
	if ( this._container.hasChildNodes()){
		while ( this._container.childNodes.length >= 1 ){
			this._container.removeChild(this._container.firstChild);       
		} 
	}
	this._queuedCellsArray = [];
};

CategoryTable.prototype.getCellObject = function(r){
	if(this._cellObjectArray[r] === undefined){
		this._cellObjectArray[r] = this.createCellObject(r);
	}
	var o = this._cellObjectArray[r];
	return o;
};

CategoryTable.prototype.createCellObject = function(r){
	return {data:undefined,visible:false,y:r,categoryCell:undefined,savedState:undefined};
};

CategoryTable.prototype.getWindowIndexRange = function(){
	var frame = {};
	//var offsetTop = window.layout.getPlaneController().getPlaneY();
	var offsetTop = this._y;
	//or
	//var offsetTop = this._containerElement.offsetTop
	if(offsetTop > 0){
		frame.top = Math.ceil(Math.abs(offsetTop / this.ROW_HEIGHT))* -1;
	}else{
		frame.top = Math.floor(Math.abs(offsetTop / this.ROW_HEIGHT)) ;
	}
	frame.height = Math.ceil(( (window.innerHeight - offsetTop) - (frame.top * this.ROW_HEIGHT) ) / this.ROW_HEIGHT);
	return frame;
};

CategoryTable.prototype.onSetScrollDelta = function(dx,dy,x,y){
	this.stopPlaneAnimation();
	//console.log(this._y);
	if(Math.abs(dy) > Math.abs(dx)){
		this._y += dy;
		this._container.style.top = this._y+"px";
		this.updateTable();
		this.updateScrollValue();
	}else{
		var cellObject = this.getCellObjectWithY(y);
		if(cellObject.categoryCell !== undefined){
			cellObject.categoryCell.setScrollDeltaX(dx);
			cellObject.categoryCell.update();
		}
	}
};

CategoryTable.prototype.getCellObjectWithY = function(y){
	var index = (((-this._y) + y) / this.ROW_HEIGHT) >> 0;
	return this.getCellObject(index);
};

CategoryTable.prototype.onDragEnd = function(finalLeftDelta,finalTopDelta,left,top){
	var outsideDragBounds = this.checkOutsideDragBounds();
	var cellObject = this.getCellObjectWithY(top);
	if(cellObject.categoryCell !== undefined){
		cellObject.categoryCell.dragEnd(finalLeftDelta,finalTopDelta,left,top);
		//cellObject.categoryCell.update();
	}
	
	if(outsideDragBounds === false){		//animate inertia
		if(Math.abs(finalLeftDelta) < Math.abs(finalTopDelta) && Globals.isDesktop){
			this.initInertiaAnimation(finalTopDelta);
		}
	}
};

CategoryTable.prototype.checkOutsideDragBounds = function(){
	//is cells out side
	var offsetTop = this._y;
	var totalHeight = (this._maxRows * this.ROW_HEIGHT);
	var offsetBottom = offsetTop + totalHeight;
	var isOutside = false;
	var correctedOffsetTop = 0;
	if(offsetTop > 0){ //off top
		isOutside = true;
	}else if(offsetBottom < window.innerHeight && totalHeight > window.innerHeight){
		isOutside = true;
		correctedOffsetTop = window.innerHeight - totalHeight;
	}else if(offsetTop < 0 && totalHeight < window.innerHeight){
		isOutside = true;
		correctedOffsetTop = 0;
	}
	if(isOutside === true){
		Globals.log("Constrain offsetTop to :"+correctedOffsetTop+" from:"+offsetTop );
		jTweener.addTween(this, {
			time: Globals.CONSTRAINT_TWEEN_TIME,
			transition: 'easeOutQuad',
			_y:correctedOffsetTop,
			onUpdate: this.onTweenUpdate.context(this),
			onComplete: this.onTweenComplete.context(this)
		});
		this._isAnimating = true;
		return true;
	}
	return false;
};

CategoryTable.prototype.initInertiaAnimation = function(finalTopDelta){
	var topAnimationProperties = this.getAnimaitonProperties(finalTopDelta);
	var destination = this._y + topAnimationProperties.distance;
	var contentHeight = window.innerHeight - (this._maxRows * this.ROW_HEIGHT);
	if(destination > 0){
		destination = 0;
	}else if(destination < contentHeight){
		destination = contentHeight;
	}
	
	jTweener.addTween(this, {
		time: topAnimationProperties.time,
		transition: 'easeOutQuad',
		_y: destination,
		onUpdate: this.onTweenUpdate.context(this),
		onComplete: this.onTweenComplete.context(this)
	});
	this._isAnimating = true;
};

CategoryTable.prototype.getAnimaitonProperties = function(delta){
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

CategoryTable.prototype.onTweenUpdate = function(){
	this._container.style.top = this._y+"px";
	this.updateTable();
	this.updateScrollValue();
};

CategoryTable.prototype.onTweenComplete = function(){
	this.stopPlaneAnimation();
	this.checkOutsideDragBounds();
};

CategoryTable.prototype.stopPlaneAnimation = function(){
	if(this._isAnimating === true){
		jTweener.removeTween(this);
		this._isAnimating = false;
	}
};

/**
* Update the CategoryScubberViewController when we are dragging and inertia animating
*/
CategoryTable.prototype.updateScrollValue = function(){
	this._categoryScrubberViewController.setScrollValue(this.getScrollValue());
}

/**
* Event handler called from CategoryScrubberViewController when scrollValue has been updated by the user
*/
CategoryTable.prototype.onScrubberSetScrollValue = function(e){
	this.stopPlaneAnimation();
	var value = e.data;
	var position = value * ((this.ROW_HEIGHT * this._maxRows) - window.innerHeight);
	this._y =  -position;
	this._container.style.top = this._y+"px";
	this.updateTable();
}


//PUBLIC
//_______________________________________________________________________________________________
CategoryTable.prototype.destroy = function(){
	this.onDestroy();
};

CategoryTable.prototype.clear = function(){
	this.onClear();
};

/**
* Called from TapestryViewController, after data has been flooded
*/
CategoryTable.prototype.update = function(){
	this.updateTable();
	this.checkOutsideDragBounds();	//need to check boundry as container maybe vertically outside bounds due to prevous scrolling
	this.updateScrollValue();
};

CategoryTable.prototype.setData = function(categorisedData){
	this.onSetData(categorisedData);
};

CategoryTable.prototype.setScrollDelta = function(dx,dy,x,y){
	this.onSetScrollDelta(dx,dy,x,y);
};

CategoryTable.prototype.setMouseWheelScrollDelta = function(dx,dy){
	if(this._y + dy > 0) dy =  - this._y;
	if((this._y + dy + (this.ROW_HEIGHT * this._maxRows)) < window.innerHeight) dy = window.innerHeight - (this._y + (this.ROW_HEIGHT * this._maxRows));
	this.onSetScrollDelta(0,dy,0,0);
};

CategoryTable.prototype.dragEnd = function(finalLeftDelta,finalTopDelta,left,top){
	this.onDragEnd(finalLeftDelta,finalTopDelta,left,top);
};

CategoryTable.prototype.getArtefactInformationAtPoint = function(pt){
	var cellObject = this.getCellObjectWithY(pt.y);
	return cellObject.categoryCell.getArtefactInformationAtPoint(pt);
};

/**
* Returns value between 0 - 1 which specifies the scroll position, this is used to set the CategoryScrubber
*/
CategoryTable.prototype.getScrollValue = function(){
	return (-this._y) / ((this.ROW_HEIGHT * this._maxRows) - window.innerHeight);
}
