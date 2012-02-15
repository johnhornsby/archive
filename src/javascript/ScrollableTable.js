var ScrollableTable = function(options){
	EventDispatcher.call(this);
	if(options===undefined)return;				//inheritance handling
	
	this._cellWidth = options.cellWidth || 0;
	this._cellHeight = options.cellHeight || 0;
	
	//this._categorisedData;
	this._dataDelegate = options.dataDelegate;		//Required!
	this._delegate = options.delegate || this;
	this._cellClass = options.cellClass;			//Required
	
	this._frameElement = options.frameElement;
	this._container = options.containerElement;		//Required
	this._displayList = [];
	this._queuedCellsArray = [];
	this._cellObjectArray = [];
	
	this._isAnimating = false;
	this._maxCells = 0;
	this._y = 0;
	this._x = 0;
	this._windowIndexRange;
	this._direction = options.direction || ScrollableTable.DIRECTION_VERTICAL;
	this._cellDimensionValue = (options.direction === ScrollableTable.DIRECTION_VERTICAL)? this._cellHeight : this._cellWidth;
	this._frameDimensionValue = 574;//(options.direction === ScrollableTable.DIRECTION_VERTICAL)? this._frameElement.style.height : this._frameElement.style.width;
}
ScrollableTable.prototype = new EventDispatcher();
ScrollableTable.prototype.constructor = ScrollableTable;
ScrollableTable.prototype.supr = EventDispatcher.prototype;

ScrollableTable.DIRECTION_VERTICAL = 0;
ScrollableTable.DIRECTION_HORIZONTAL = 1;




//PRIVATE
//_________________________________________________________________________________________________
ScrollableTable.prototype.onDestroy = function(){
	this.onClear();
	this._displayList = [];
	this._cellObjectArray = [];
	this.removeAllCells();
	
};

ScrollableTable.prototype.onClear = function(){
	this._maxCells = 0;
	this.stopPlaneAnimation();
	this.queueAllCells();
};


ScrollableTable.prototype.onSetData = function(){
	this.onClear();
	this._maxCells = this._dataDelegate.getNumberOfCells() || 0;
	if(this._direction === ScrollableTable.DIRECTION_VERTICAL){
		this._container.style.height = this._maxCells * this._cellHeight + "px";
	}else{
		this._container.style.width = this._maxCells * this._cellWidth + "px";
	}
	this.floodTable();
};

ScrollableTable.prototype.floodTable = function(){
	var r;
	var l = this._maxCells;
	var cellObject;
	for(r = 0; r < l; r++){
		cellObject = this.getCellObject(r);
		cellObject.data = this._dataDelegate.getDataForCellIndex(r);
		//reset savedData here, as floodTable may be called to replace data in cells when we filter, we need to ditch any savedState as this explicitly refers to the previous data.
		cellObject.savedState = undefined;			
		//this._cellObjectArray[r] = {data:this._categorisedData[r],visible:false,y:r,cell:undefined,savedState:undefined};//cellObject;
	}
};

ScrollableTable.prototype.updateTable = function(){
	this._windowIndexRange = this.getWindowIndexRange();
	this.queueClippedCells(this._windowIndexRange);
	var cellObject;
	var cell;
	var i;
	//console.log("top:"+this._windowIndexRange.top+" height:"+this._windowIndexRange.height);
	for(i = this._windowIndexRange.top; i < this._windowIndexRange.top + this._windowIndexRange.height; i++){
		if(i > -1 && i < this._maxCells){
			cellObject = this.getCellObject(i);
			if(cellObject.visible===false){	
				cell = this.dequeueCell();
				if(cell===undefined){
					cell = new this._cellClass({index:i,containerElement:this._container});
					cell.addEventListener(ScrollableCellEvent.CLICK,this.onCellClickHandler.context(this));
				}
				cell.setData(cellObject.data,cellObject.savedState);
				cell.setVisible(true);
				if(this._direction === ScrollableTable.DIRECTION_VERTICAL){
					cell.setX(0);
					cell.setY(i*this._cellHeight);
				}else{
					cell.setX(i*this._cellWidth);
					cell.setY(0);
				}
				cellObject.cell = cell;
				cellObject.visible = true;
				this._displayList.push({cell:cell,index:i,cellObject:cellObject});//TODO
			}
			cellObject.cell.update();
		}
	}
};

ScrollableTable.prototype.queueClippedCells = function(indexRange){
	var i = this._displayList.length;
	
	while(i--){
		if( this._displayList[i].index > indexRange.top + indexRange.height || this._displayList[i].index + 1 < indexRange.top){
			//console.log("remove: x:"+this._displayList[i].x+" y:"+this._displayList[i].y);
			this._displayList[i].cellObject.savedState = this._displayList[i].cell.getSaveState(); //save tile engine state to cellObject to when we scroll back over the grid is rendered the same and ready behave as previous instance 
			this.queueCell(this._displayList[i].cell);
			this._displayList[i].cellObject.visible = false;
			this._displayList.splice(i,1);
		}
	}
};

ScrollableTable.prototype.queueAllCells = function(){
	var i = this._displayList.length;
	while(i--){
		this._displayList[i].cellObject.savedState = this._displayList[i].cell.getSaveState();
		this.queueCell(this._displayList[i].cell);
		this._displayList[i].cellObject.visible = false;
		this._displayList.splice(i,1);
	}
};

ScrollableTable.prototype.queueCell = function(cell){
	cell.setVisible(false);
	cell.clear();
	//NOTE: Does not clear! Should it?
	this._queuedCellsArray.push(cell);
}
ScrollableTable.prototype.dequeueCell = function(){
	if(this._queuedCellsArray.length > 0){
		return this._queuedCellsArray.pop();
	}
	return undefined;
};

ScrollableTable.prototype.removeAllCells = function(){
	var cell;
	var i = this._queuedCellsArray.length;
	while(i--){
		cell = this.__queuedCellsArray[i];
		cell.removeEventListener(ScrollableCell.CLICK);
	}
	if ( this._container.hasChildNodes()){
		while ( this._container.childNodes.length >= 1 ){
			this._container.removeChild(this._container.firstChild);       
		} 
	}
	this._queuedCellsArray = [];
};

ScrollableTable.prototype.getCellObject = function(index){
	if(this._cellObjectArray[index] === undefined){
		this._cellObjectArray[index] = this.createCellObject(index);
	}
	var o = this._cellObjectArray[index];
	return o;
};

ScrollableTable.prototype.createCellObject = function(index){
	return {data:undefined,visible:false,index:index,cell:undefined,savedState:undefined};
};

ScrollableTable.prototype.getWindowIndexRange = function(){
	var frame = {};
	//var offsetTop = window.layout.getPlaneController().getPlaneY();
	
	var offsetDimensionValue;
	if(this._direction === ScrollableTable.DIRECTION_VERTICAL){
		offsetDimensionValue = this._y;
	}else{
		offsetDimensionValue = this._x;
	}
	//or
	//var offsetTop = this._containerElement.offsetTop
	if(offsetDimensionValue > 0){
		frame.top = Math.ceil(Math.abs(offsetDimensionValue / this._cellDimensionValue))* -1;
	}else{
		frame.top = Math.floor(Math.abs(offsetDimensionValue / this._cellDimensionValue)) ;
	}
	frame.height = Math.ceil(( (this._frameDimensionValue - offsetDimensionValue) - (frame.top * this._cellDimensionValue) ) / this._cellDimensionValue);
	return frame;
};

/**
	Remove or alter this function, this function is a hang over from CategoryTable
*/
ScrollableTable.prototype.onSetScrollDelta = function(dx,dy,x,y){
	this.stopPlaneAnimation();
	//console.log(this._y);
	if(Math.abs(dy) > Math.abs(dx)){
		this._y += dy;
		this._container.style.top = this._y+"px";
		this.updateTable();
	}else{
		var cellObject = this.getCellObjectWithY(y);
		if(cellObject.cell !== undefined){
			cellObject.cell.setScrollDeltaX(dx);
			cellObject.cell.update();
		}
	}
};

ScrollableTable.prototype.onSetScrollPosition = function(x,y){
	this.stopPlaneAnimation();
	this._x = x;
	this._y = y;
	this._container.style.left = this._x+"px";
	this._container.style.top = this._y+"px";
	this.updateTable();
};

ScrollableTable.prototype.getCellObjectWithY = function(y){
	var index = (((-this._y) + y) / this._cellHeight) >> 0;
	return this.getCellObject(index);
};

ScrollableTable.prototype.onDragEnd = function(finalLeftDelta,finalTopDelta,left,top){
	var outsideDragBounds = this.checkOutsideDragBounds();
	var cellObject = this.getCellObjectWithY(top);
	if(cellObject.cell !== undefined){
		cellObject.cell.dragEnd(finalLeftDelta,finalTopDelta,left,top);
		//cellObject.cell.update();
	}
	
	if(outsideDragBounds === false){		//animate inertia
		if(Math.abs(finalLeftDelta) < Math.abs(finalTopDelta) && Globals.isDesktop){
			this.initInertiaAnimation(finalTopDelta);
		}
	}
};

ScrollableTable.prototype.checkOutsideDragBounds = function(){
	//is cells out side
	var offsetTop = this._y;
	var totalHeight = (this._maxCells * this._cellHeight);
	var offsetBottom = offsetTop + totalHeight;
	var isOutside = false;
	var correctedOffsetTop = 0;
	if(offsetTop > 0){ //off top
		isOutside = true;
	}else if(offsetBottom < this._frameDimensionValue && totalHeight > this._frameDimensionValue){
		isOutside = true;
		correctedOffsetTop = this._frameDimensionValue - totalHeight;
	}else if(offsetTop < 0 && totalHeight < this._frameDimensionValue){
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

ScrollableTable.prototype.initInertiaAnimation = function(finalTopDelta){
	var topAnimationProperties = this.getAnimaitonProperties(finalTopDelta);
	var destination = this._y + topAnimationProperties.distance;
	var contentHeight = this._frameDimensionValue - (this._maxCells * this._cellHeight);
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

ScrollableTable.prototype.getAnimaitonProperties = function(delta){
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

ScrollableTable.prototype.onTweenUpdate = function(){
	if(this._direction === ScrollableTable.DIRECTION_VERTICAL){
		this._container.style.top = this._y + "px";
	}else{
		this._container.style.left = this._x + "px";
	}
	this.updateTable();
};

ScrollableTable.prototype.onTweenComplete = function(){
	this.stopPlaneAnimation();
	this.checkOutsideDragBounds();
};

ScrollableTable.prototype.stopPlaneAnimation = function(){
	if(this._isAnimating === true){
		jTweener.removeTween(this);
		this._isAnimating = false;
	}
};

ScrollableTable.prototype.onCellClickHandler = function(e){
	//Globals.log(e.eventType);
	this.dispatchEvent(new ScrollableTableEvent(ScrollableTableEvent.CELL_CLICK,e.data));
};

//PUBLIC
//_______________________________________________________________________________________________
ScrollableTable.prototype.destroy = function(){
	this.onDestroy();
};

ScrollableTable.prototype.clear = function(){
	this.onClear();
};

/**
* Called from TapestryViewController, after data has been flooded
*/
ScrollableTable.prototype.reloadTable = function(){
	this.onSetData();
	this.updateTable();
	this.checkOutsideDragBounds();	//need to check boundry as container maybe vertically outside bounds due to prevous scrolling
};

ScrollableTable.prototype.setData = function(categorisedData){
	this.onSetData(categorisedData);
};

ScrollableTable.prototype.setScrollDelta = function(dx,dy,x,y){
	this.onSetScrollDelta(dx,dy,x,y);
};

ScrollableTable.prototype.setScrollPosition = function(x,y){
	this.onSetScrollPosition(x,y);
};

ScrollableTable.prototype.dragEnd = function(finalLeftDelta,finalTopDelta,left,top){
	this.onDragEnd(finalLeftDelta,finalTopDelta,left,top);
};

ScrollableTable.prototype.getArtefactInformationAtPoint = function(pt){
	var cellObject = this.getCellObjectWithY(pt.y);
	
	return cellObject.cell.getArtefactInformationAtPoint(pt);
	
};





//Event Classes
//_________________________________________________________________________________________	
var ScrollableTableEvent = function(eventType,data){
	this.eventType = eventType;
	this.data = data;
};
ScrollableTableEvent.CELL_CLICK = "cellClick";
