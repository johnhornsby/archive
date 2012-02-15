var ScrollableCell = function(options){
	EventDispatcher.call(this);
	if(options===undefined)return;	//return here if options are undefined to protect from errors when constructor is simply called to inherit methods
	
	this._index = options.index;
	this._parentTableContainer = options.containerElement;
	this._containerElement;
	this._data;
	
	this._y = 0;
	this._x = 0;
	
	this.init();
};
ScrollableCell.prototype = new EventDispatcher();
ScrollableCell.prototype.constructor = ScrollableCell;
ScrollableCell.prototype.supr = EventDispatcher.prototype;

ScrollableCell.prototype.init = function(){
	this.build();
};

ScrollableCell.prototype.build = function(){	
	this._containerElement = document.createElement("div");
	$(this._parentTableContainer).append(this._containerElement);
};






//PUBLIC
//____________________________________________________________________________________________________
ScrollableCell.prototype.destroy = function(){
	this.clear();
	$(this._containerElement).remove();
};

ScrollableCell.prototype.clear = function(){
	//$(this._containerElement).empty();
};

ScrollableCell.prototype.getX = function(){
	return this._x;
};
ScrollableCell.prototype.setX = function(x){
	this._x = x;
	this._containerElement.style.left = this._x +"px";
};

ScrollableCell.prototype.getY = function(){
	return this._y;
};
ScrollableCell.prototype.setY = function(y){
	this._y = y;
	this._containerElement.style.top = this._y +"px";
};

ScrollableCell.prototype.setData = function(data,restoreStateObject){
	this._data = data;
	if(restoreStateObject!==undefined){
	}
};

ScrollableCell.prototype.setVisible = function(b){
	if(b===true){
		this._containerElement.style.display = "block";
	}else{
		this._containerElement.style.display = "none";
	}
};

ScrollableCell.prototype.update = function(){

};

ScrollableCell.prototype.getSaveState = function(){
	var saveState = undefined
	return saveState;
};

ScrollableCell.prototype.dragEnd = function(finalLeftDelta,finalTopDelta,left,top){

};




//Event Classes
//_________________________________________________________________________________________	
var ScrollableCellEvent = function(eventType,data){
	this.eventType = eventType;
	this.data = data;
};
ScrollableCellEvent.CLICK = "click";