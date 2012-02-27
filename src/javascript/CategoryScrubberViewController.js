var CategoryScrubberViewController = function(){
	EventDispatcher.call(this);
	
	this._planeController;
	this._scrollDirection = 0;
	this._scrubberTrackElement;
	this._scrubberThumbElement;
	this._isVisible = false;
	this._value = 0.5;
	this._thumbPosition = 0;
	
	this._scrubberThumbDimension = 86;
	this._scrubberTrackDimension = 0;
	this._isThumbDragging = false;
	
	this.init();
}
CategoryScrubberViewController.prototype = new EventDispatcher();

CategoryScrubberViewController.SCROLL_DIRECTION_VERTICAL = 0;



CategoryScrubberViewController.prototype.init = function(){
	this._scrubberThumbElement = document.getElementById("category-scrubber-thumb");
	this._scrubberTrackElement = document.getElementById("category-scrubber-track");
	this._planeController = new PlaneController(this._scrubberTrackElement);
	this._planeController.setDelegate(this);
	
	
};

CategoryScrubberViewController.prototype.onScrubberTrackResize = function(){
	this._scrubberTrackDimension = $(this._scrubberTrackElement).height();
	this.setScrollValue(this._value);
};

CategoryScrubberViewController.prototype.convertPositionToValue = function(p){
	return p / (this._scrubberTrackDimension - this._scrubberThumbDimension); 
}

CategoryScrubberViewController.prototype.convertValueToPosition = function(v){
	return (this._scrubberTrackDimension - this._scrubberThumbDimension) * v;
}

CategoryScrubberViewController.prototype.onSetScrollValue = function(v){	//value between 0 and 1
	this._value = Math.max(Math.min(v,1),0);
	this._thumbPosition = this.convertValueToPosition(this._value);
	this._scrubberThumbElement.style.top = this._thumbPosition + "px";
};

//PLANE CONTROLLER DELEGATE METHODS
//________________________________________________________________________________
CategoryScrubberViewController.prototype.setScrollDelta = function(leftDelta,topDelta,left,top){
	var value;
	if(this._isThumbDragging){
		value = this.convertPositionToValue(this._thumbPosition + topDelta);
	}else{
		value = this.convertPositionToValue(top);
	}
	this.onSetScrollValue(value);
	this.dispatchEvent(new CategoryScrubberViewControllerEvent(CategoryScrubberViewControllerEvent.SET_SCROLL_VALUE,this._value));
};

CategoryScrubberViewController.prototype.singleClick = function(left,top){
};

CategoryScrubberViewController.prototype.doubleClick = function(left,top){
};

CategoryScrubberViewController.prototype.mouseDown = function(leftDelta,topDelta,left,top){
	if(top > this._thumbPosition &&  top < this._thumbPosition + this._scrubberThumbDimension){
		//clicked on thumb
		Globals.log("clicked on thumb");
		this._isThumbDragging = true;
	}else{
		//clicked on track
		Globals.log("clicked on track");
		this._isThumbDragging = false;
<<<<<<< HEAD
		this.setScrollDelta(leftDelta,topDelta,left,top);
=======
		this.setScrollDelta(leftDelta,top-(this._thumbPosition - this._scrubberThumbDimension),left,top);
>>>>>>> GraphicProduction
	}
};

CategoryScrubberViewController.prototype.dragEnd = function(finalLeftDelta,finalTopDelta,left,top){
	if(this._isThumbDragging){
		this._isThumbDragging = false;
	}
};

<<<<<<< HEAD
=======
CategoryScrubberViewController.prototype.setMouseWheelScrollDelta = function(delta){
	var value;
	value = this.convertPositionToValue(this._thumbPosition + delta);
	this.onSetScrollValue(value);
	this.dispatchEvent(new CategoryScrubberViewControllerEvent(CategoryScrubberViewControllerEvent.SET_SCROLL_VALUE,this._value));
};
>>>>>>> GraphicProduction



//PUBLIC
//________________________________________________________________________________
CategoryScrubberViewController.prototype.destroy = function(){
	this.hide();
};

CategoryScrubberViewController.prototype.setScrollValue = function(v){	//value between 0 and 1
	this.onSetScrollValue(v);
};
CategoryScrubberViewController.prototype.getScrollValue = function(){   //value between 0 and 1
	return this._value;
};

CategoryScrubberViewController.prototype.show = function(){
	if(!this._isVisible){
		Globals.log("show");
		this._scrubberTrackElement.style.right = "0px";
		this._planeController.activate();
		this._isVisible = true;
		this._scrubberTrackDimension = $(this._scrubberTrackElement).height();
		$(window).bind("resize",this.onScrubberTrackResize.rEvtContext(this));
	}
};

CategoryScrubberViewController.prototype.hide = function(){
	if(this._isVisible){
		Globals.log("hide");
		this._scrubberTrackElement.style.right = "-50px";
		this._planeController.deactivate();
		this._isVisible = false;
		this._scrubberTrackDimension = $(this._scrubberTrackElement).height();
		$(window).unbind("resize",this.onScrubberTrackResize.rEvtContext(this));
	}
};

CategoryScrubberViewController.prototype.reset = function(){
	
};






//Event Classes
//_________________________________________________________________________________________	
var CategoryScrubberViewControllerEvent = function(eventType,data){
	this.eventType = eventType;
	this.data = data;
};
CategoryScrubberViewControllerEvent.SET_SCROLL_VALUE = "setScrollValue";