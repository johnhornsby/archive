// JavaScript Document
var PlaneController = function(interactiveElement){
	this._delegate;
	this._interactiveElement = interactiveElement;
	this._originX = 0;
	this._originY = 0;
	this._lastX = 0;
	this._lastY = 0;
	//this._x = 0; //unused
	//this._y = 0;
	this._leftDelta = 0;
	this._topDelta = 0;
	//this._inertiaDeltaX = 0;
	//this._inertiaDeltaY = 0;
	this._downStartTime = 0;
	this._clickStartArray = [new Date().getTime()];//start this with a time so we don't have to check later for things.
	this._singleClickTimeout;
	this._mouseDown = false;
	this._click = false;
	//this._inertiaInterval;
	
	this.init();
}

PlaneController.MOUSE_DRAG_MODIFIER = 2;
PlaneController.CLICK_THRESHOLD_DURATION = 250 // milliseconds 500
PlaneController.DOUBLE_CLICK_THRESHOLD_DURATION = 250 // milliseconds 500
PlaneController.CLICK_THRESHOLD_DISTANCE = 10 // pixels



PlaneController.prototype.init = function(){
	
}

PlaneController.prototype.onMouseDown = function(e){
	//console.log("onMouseDown()");
	//this.stopInertia();
	this._click = true;
	this._downStartTime = new Date().getTime();
	clearTimeout(this._singleClickTimeout);
	
	this._lastX = this._originX = e.pageX;
	this._lastY = this._originY = e.pageY;
	//this._interactiveElement.addEventListener('mousemove',this.onMouseMove.rEvtContext(this), false);
	//this._interactiveElement.addEventListener('mouseup',this.onMouseUp.rEvtContext(this), false);
	$(document).bind('mousemove',this.onMouseMove.rEvtContext(this));
	$(document).bind('mouseup',this.onMouseUp.rEvtContext(this));
	this._mouseDown = true;
	this._delegate.mouseDown(0,0,this._lastX,this._lastY);
	return false;
}
PlaneController.prototype.onMouseMove = function(e){
	//console.log("onMouseMove()");
	if(this._mouseDown === true){
		this._leftDelta = e.pageX - this._lastX;
		this._topDelta = e.pageY - this._lastY;
		//this.appendPosition(this._leftDelta,this._topDelta);
		this._delegate.setScrollDelta(this._leftDelta,this._topDelta,e.pageX,e.pageY);
		this._lastX = e.pageX;
		this._lastY = e.pageY;
		
	}
	return false;
}
PlaneController.prototype.onMouseUp = function(e){
	//console.log("onMouseUp()");
	
	this._mouseDown=false;	
	//this._interactiveElement.removeEventListener('mousemove', this.onMouseMove.rEvtContext(this), false);
	//this._interactiveElement.removeEventListener('mouseup', this.onMouseUp.rEvtContext(this), false);
	$(document).unbind('mousemove',this.onMouseMove.rEvtContext(this));
	$(document).unbind('mouseup',this.onMouseUp.rEvtContext(this));
	
	
	//Check for click;
	var distanceMoved = Point.distance(new Point(e.pageX, e.pageY), new Point(this._originX, this._originY));			//check distance moved since mouse down
	var downTimeDuration = new Date().getTime() - this._downStartTime;													//check duration of mousedown and mouseup
	var timeElapsedSinceLastClick;
	this._lastX = e.pageX;																						//record the x and y so we can use the coords in single click, and dragEnd
	this._lastY = e.pageY;
									
	if(this._click === true && distanceMoved < PlaneController.CLICK_THRESHOLD_DISTANCE && downTimeDuration < PlaneController.CLICK_THRESHOLD_DURATION){
		this._clickStartArray.push(this._downStartTime);																//add time of start click to array
		timeElapsedSinceLastClick = this._downStartTime - this._clickStartArray[this._clickStartArray.length-2];		//duration between this click and last, from mousedown of first click to mousedown of second click
		if(timeElapsedSinceLastClick < PlaneController.DOUBLE_CLICK_THRESHOLD_DURATION){								//if double click duration is below doubleClickThreshold then create double click
			this.onDoubleClick(e.pageX,e.pageY);
		}else{
	
			this._singleClickTimeout = setTimeout(this.onSingleClick.context(this,e.pageX,e.pageY),PlaneController.DOUBLE_CLICK_THRESHOLD_DURATION);//use timeout on single click to allow for user to double click and overide single click action
		}
		return false;
	}
	
	//this._inertiaDeltaX = this._leftDelta;
	//this._inertiaDeltaY = this._topDelta;
	//this._inertiaInterval = setInterval(this.addInertia.context(this),33);
	this._delegate.dragEnd(this._leftDelta,this._topDelta,this._lastX,this._lastY);
	return false;
}
PlaneController.prototype.onSingleClick = function(x,y){
	//console.log("onClick x:"+this._lastX+" y:"+this._lastY);
	this._delegate.singleClick(this._lastX,this._lastY);
}

PlaneController.prototype.onDoubleClick = function(x,y){
	//console.log("onDoubleClick x:"+x+" y:"+y);
	this._delegate.doubleClick(this._lastX,this._lastY);
}


PlaneController.prototype.onTouchStart = function(e){
	//this.stopInertia();
	if (e.targetTouches.length != 1)
		return false;
	this._click = true;
	this._downStartTime = new Date().getTime();
	clearTimeout(this._singleClickTimeout);
	this._lastX = this._originX = e.targetTouches[0].clientX;
	this._lastY = this._originY = e.targetTouches[0].clientY;
	$(document).bind('touchmove',this.onTouchMove.rEvtContext(this));
	$(document).bind('touchend',this.onTouchEnd.rEvtContext(this));
	this._delegate.mouseDown(0,0,this._lastX,this._lastY);
	return false;
}

PlaneController.prototype.onTouchMove = function(e){
	e.preventDefault();
	// Don't track motion when multiple touches are down in this element (that's a gesture)
	if (e.targetTouches.length != 1)
		return false;
	this._leftDelta = e.targetTouches[0].clientX - this._lastX;
	this._topDelta = e.targetTouches[0].clientY - this._lastY;
	//this.appendPosition(this._leftDelta,this._topDelta);
	this._delegate.setScrollDelta(this._leftDelta,this._topDelta,e.targetTouches[0].clientX,e.targetTouches[0].clientY);
	this._lastX = e.targetTouches[0].clientX;
	this._lastY = e.targetTouches[0].clientY;
	//this._delegate.update();
	return false;
}

PlaneController.prototype.onTouchEnd = function(e){
	// Prevent the browser from doing its default thing (scroll, zoom)
	e.preventDefault();
	// Stop tracking when the last finger is removed from this element
	if (e.targetTouches.length > 0)
		return false;
	$(document).unbind('touchmove',this.onTouchMove.rEvtContext(this));
	$(document).unbind('touchend',this.onTouchEnd.rEvtContext(this));
	
	//Check for click;
	var distanceMoved = Point.distance(new Point(this._lastX, this._lastY), new Point(this._originX, this._originY));
	var downTimeDuration = new Date().getTime() - this._downStartTime;
	if(this._click === true && distanceMoved < PlaneController.CLICK_THRESHOLD_DISTANCE && downTimeDuration < PlaneController.CLICK_THRESHOLD_DURATION){
		this._clickStartArray.push(this._downStartTime);
		timeElapsedSinceLastClick = this._downStartTime - this._clickStartArray[this._clickStartArray.length-2];
		if(timeElapsedSinceLastClick < PlaneController.DOUBLE_CLICK_THRESHOLD_DURATION){
			this.onDoubleClick(this._lastX, this._lastY);
		}else{
			this._singleClickTimeout = setTimeout(this.onSingleClick.context(this,e.pageX,e.pageY),PlaneController.DOUBLE_CLICK_THRESHOLD_DURATION);
		}
		return false;
	}
	//this._inertiaDeltaX = this._leftDelta;
	//this._inertiaDeltaY = this._topDelta;
	//this._inertiaInterval = setInterval(this.addInertia.context(this),33);
	//this._delegate.setScrollDeltaEnd();
	this._delegate.dragEnd(this._leftDelta,this._topDelta,this._lastX,this._lastY);
	return false;
}

PlaneController.prototype.onDOMMouseScrollHandler = function(e){
	//Globals.log('onDOMMouseScrollHandler');
	var deltaX = 0;
	var deltaY = -e.detail * 3;
	this.setMouseWheenDelta(deltaX,deltaY);
};


PlaneController.prototype.onMouseWheelHandler = function(e){
	var deltaX = 0;
	var deltaY = e.wheelDelta;
	if(e.wheelDeltaX && e.wheelDeltaY){
		deltaX = e.wheelDeltaX;
		deltaY = e.wheelDeltaY;
	}
	this.setMouseWheenDelta(deltaX,deltaY);
	e.preventDefault();				//prevent lion browser from bounce scroll effect
};

PlaneController.prototype.setMouseWheenDelta = function(deltaX,deltaY){
	this._delegate.setMouseWheelScrollDelta(deltaX,deltaY);
}

/*
PlaneController.prototype.appendPosition = function(x,y){
	this.setPosition(this._x+x,this._y+y);
}

PlaneController.prototype.setPosition = function(x,y){
	this._x  = x;
	this._y = y;
	const kUseTransform = false;
	if (kUseTransform) {
		this._interactiveElement.style.webkitTransform = 'translate(' + this._x + 'px, ' + this._y + 'px)';
	}else{
		//this._interactiveElement.style.left = this._x + 'px';
		this._interactiveElement.style.top = this._y + 'px';
	}
}
*/
/*
PlaneController.prototype.addInertia = function(){
	//console.log("this._inertiaDeltaX:"+this._inertiaDeltaX+" this._inertiaDeltaY:"+this._inertiaDeltaY);
	this._inertiaDeltaX *= 0.9;
	this._inertiaDeltaY *= 0.9;
	this._leftDelta  = Math.round(this._inertiaDeltaX);
	this._topDelta  = Math.round(this._inertiaDeltaY);
	this._delegate.setScrollDelta(this._leftDelta,this._topDelta,this._lastX ,this._lastY);
	if(this._leftDelta === 0 && this._topDelta === 0){
		this.stopInertia();	
	}
}
*/
/*
PlaneController.prototype.stopInertia = function(){
	//console.log("stopInertia()");
	clearInterval(this._inertiaInterval);	
}
*/



//PUBLIC
//________________________________________________________________________________________________________________________
PlaneController.prototype.setDelegate = function(delegate){
	this._delegate = delegate;
};

PlaneController.prototype.activate = function(){
	//this._interactiveElement.addEventListener('mousedown', this.onMouseDown.rEvtContext(this), false);
	//this._interactiveElement.addEventListener('touchstart', this.onTouchStart.rEvtContext(this), false);
	
	$(this._interactiveElement).bind('mousewheel',this.onMouseWheelHandler.context(this));
	$(this._interactiveElement).bind('DOMMouseScroll',this.onDOMMouseScrollHandler.context(this));
	$(this._interactiveElement).bind('mousedown', this.onMouseDown.rEvtContext(this));
	$(this._interactiveElement).bind('touchstart', this.onTouchStart.rEvtContext(this));
};

PlaneController.prototype.deactivate = function(){
	//this._interactiveElement.removeEventListener('mousedown', this.onMouseDown.rEvtContext(this), false);
	//this._interactiveElement.removeEventListener('touchstart', this.onTouchStart.rEvtContext(this), false);
	$(this._interactiveElement).unbind('mousewheel',this.onMouseWheelHandler.context(this));
	$(this._interactiveElement).unbind('DOMMouseScroll',this.onDOMMouseScrollHandler.context(this));
	$(this._interactiveElement).unbind('mousedown', this.onMouseDown.rEvtContext(this));
	$(this._interactiveElement).unbind('touchstart', this.onTouchStart.rEvtContext(this));
};
/*
PlaneController.prototype.getPlaneX = function(){
	return this._x;
};

PlaneController.prototype.getPlaneY = function(){
	return this._y;
};

PlaneController.prototype.setPlaneX = function(x){
	this._x = x;
};

PlaneController.prototype.setPlaneY = function(y){
	this._y = y;
};
*/