var ScrollableCell = function(options){
	EventDispatcher.call(this);
	
	this._index = options.index;
	this._parentTableContainer = options.containerElement;
	this._containerElement;
	
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
	//build containers
	var html='';
	html +='<div class="ScrollableCellContainer" id="ScrollableCell'+this._index+'">';
	html +='</div>';
	
	$(this._parentTableContainer).append(html);
	
	this._containerElement = $("#ScrollableCell"+this._index).get(0);
	
};




//PUBLIC
//____________________________________________________________________________________________________
ScrollableCell.prototype.destroy = function(){

};

ScrollableCell.prototype.clear = function(){

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



ScrollableCell.prototype.setData = function(tilesData,restoreStateObject){
	if(restoreStateObject!==undefined){
	
	}
};

ScrollableCell.prototype.setScrollDelta = function(dx,dy,x,y){

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