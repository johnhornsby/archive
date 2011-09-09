var TouchScrollPanel = function(options){
	EventDispatcher.call(this);
	
	this._frameElement = options.frameElement;
	this._contentElement = options.contentElement;
	this._scrollDirection = options.scrollDirection || TouchScrollPanel.SCROLL_DIRECTION_VERTICAL;
	
	this._thumbElement;
	this._thumbContainerElement;
	this._lastX = 0;
	this._lastY = 0;
	this._originX = 0;
	this._originY = 0;
	this._leftDelta = 0;
	this._topDelta = 0;
	this._isDragging = false;
	this._downStartTime = 0;
	this._isStopChildMouseUp = false;
	
	this._inertiaInterval = undefined;
	this._fadeThumbInterval = undefined;
	this._fadeThumbTimeout = undefined;
	this._isThumbVisible;
	
	this._y = 0;
	this._x = 0;
	
	
	this.init();
};
//inheritance
TouchScrollPanel.prototype = new EventDispatcher();

TouchScrollPanel.SCROLL_DIRECTION_VERTICAL = 0;
TouchScrollPanel.SCROLL_DIRECTION_HORIZONTAL = 1;
TouchScrollPanel.MOUSE_DRAG_MODIFIER = 2;
TouchScrollPanel.CLICK_THRESHOLD_DURATION = 500 // milliseconds 500
TouchScrollPanel.CLICK_THRESHOLD_DISTANCE = 10 // pixels






//PRIVATE
//__________________________________________________________________________________________
TouchScrollPanel.prototype.init = function(){
	$(this._frameElement).bind('mousewheel',this.onMouseWheelHandler.context(this));
	$(this._frameElement).bind('mousedown',this.onDownFrameHandler.context(this));
	$(this._frameElement).bind('touchstart',this.onDownFrameHandler.context(this));
	this.build();
};

TouchScrollPanel.prototype.build = function(){
	switch(this._scrollDirection){
		case TouchScrollPanel.SCROLL_DIRECTION_VERTICAL:
			$(this._frameElement).append('<div class="touchScrollPanelVerticleThumbContainer"><div class="touchScrollPanelVerticleThumb"><div class="touchScrollPanelThumbGraphics"></div></div></div>');
			this._thumbElement = $(this._frameElement).find('.touchScrollPanelVerticleThumb')[0];
			this._thumbContainerElement = $(this._frameElement).find('.touchScrollPanelVerticleThumbContainer')[0];
			break;
		case TouchScrollPanel.SCROLL_DIRECTION_HORIZONTAL:
			$(this._frameElement).append('<div class="touchScrollPanelHorizontalThumbContainer"><div class="touchScrollPanelHorizontalThumb"><div class="touchScrollPanelThumbGraphics"></div></div></div>');
			this._thumbElement = $(this._frameElement).find('.touchScrollPanelHorizontalThumb')[0];
			this._thumbContainerElement = $(this._frameElement).find('.touchScrollPanelHorizontalThumbContainer')[0];
			break;
	}
	this.onFadeOutThumb();
	this.updateThumb();
};

TouchScrollPanel.prototype.onDownFrameHandler = function(e){
	console.log('onDownFrameHandler');
	
	jTweener.removeTween(this._contentElement);
	var pageX;
	var pageY;
	var eventType = (e.type.indexOf('touch')!=-1)?'touch':'mouse';
	if(eventType==='touch'){
		if (e.targetTouches.length != 1){
			return false;
		}
		$(window).bind('touchmove',this.onMoveWindowHandler.rEvtContext(this));
		$(window).bind('touchend',this.onUpWindowHandler.rEvtContext(this));
		pageX = e.targetTouches[0].pageX;
		pageY = e.targetTouches[0].pageY; 
	}else{
		$(window).bind('mousemove',this.onMoveWindowHandler.rEvtContext(this));
		$(window).bind('mouseup',this.onUpWindowHandler.rEvtContext(this));
		pageX = e.pageX;
		pageY = e.pageY; 
	}
	
	this._lastX = this._originX = pageX;
	this._lastY = this._originY = pageY;
	this._isDragging = false;
	//this._isStopChildMouseUp = false;
	this._downStartTime = new Date().getTime();
	
	this.onFadeInThumb();
	
	if(eventType!=='touch'){
		return false;// don't return false as this causes problems for child elements receiving event on iPad, return false on desktop as this stops highlighing text
	}
	
};

TouchScrollPanel.prototype.onMoveWindowHandler = function(e){
	//console.log('onMouseMoveContainer');
	var pageX;
	var pageY;
	var eventType = (e.type.indexOf('touch')!=-1)?'touch':'mouse';
	if(eventType==='touch'){
		if (e.targetTouches.length != 1){
			return false;
		}
		pageX = e.targetTouches[0].pageX;
		pageY = e.targetTouches[0].pageY; 
	}else{
		pageX = e.pageX;
		pageY = e.pageY; 
	}
	
	this._leftDelta = pageX - this._lastX;
	this._topDelta = pageY - this._lastY;
	
	switch(this._scrollDirection){
		case TouchScrollPanel.SCROLL_DIRECTION_VERTICAL:
			this.scrollY(this._topDelta,false);
			break;
		case TouchScrollPanel.SCROLL_DIRECTION_HORIZONTAL:
			this.scrollX(this._leftDelta,false);
			break;
	}
	
	this._lastX = pageX;
	this._lastY = pageY;
	var distanceMoved = Point.distance(new Point(pageX, pageY), new Point(this._originX, this._originY));			//check distance moved since mouse down
	var downTimeDuration = new Date().getTime() - this._downStartTime;													//check duration of mousedown and mouseup
	if(distanceMoved > TouchScrollPanel.CLICK_THRESHOLD_DISTANCE || downTimeDuration > TouchScrollPanel.CLICK_THRESHOLD_DURATION){
		this._isDragging = true;	
	}
	return false;
};

TouchScrollPanel.prototype.onUpWindowHandler = function(e){
	console.log('onUpWindowHandler');
	var pageX;
	var pageY;
	var eventType = (e.type.indexOf('touch')!=-1)?'touch':'mouse';
	if(eventType==='touch'){
		$(window).unbind('touchmove',this.onMoveWindowHandler.rEvtContext(this));
		$(window).unbind('touchend',this.onUpWindowHandler.rEvtContext(this));
		pageX =  this._lastX; //use lastX and lasyY as e.targetTouches.length should === 0
		pageY =  this._lastY; 
	}else{
		$(window).unbind('mousemove',this.onMoveWindowHandler.rEvtContext(this));
		$(window).unbind('mouseup',this.onUpWindowHandler.rEvtContext(this));
		pageX = e.pageX;
		pageY = e.pageY; 
	}
	this._isDragging = false;
	
	var distanceMoved = Point.distance(new Point(pageX, pageY), new Point(this._originX, this._originY));			//check distance moved since mouse down
	var downTimeDuration = new Date().getTime() - this._downStartTime;													//check duration of mousedown and mouseup
	console.log("downTimeDuration:"+downTimeDuration);
	this._lastX = pageX;																						//record the x and y so we can use the coords in single click, and dragEnd
	this._lastY = pageY;
	//console.log('distanceMoved:'+distanceMoved);
	//console.log('downTimeDuration:'+downTimeDuration);
	if(distanceMoved < TouchScrollPanel.CLICK_THRESHOLD_DISTANCE && downTimeDuration < TouchScrollPanel.CLICK_THRESHOLD_DURATION){
		//click ok
		//console.log('go click');
	}else{
		//stop click
		//console.log('stop click');
		this._isStopChildMouseUp = true;
		setTimeout(this.releaseStopChildMouseUpTrap.context(this),33);//only release the trap ofter a frame, this is to ensure that we block all 
		this.checkScrollBoundry();
	}
	
	this._fadeThumbTimeout = setTimeout(this.onFadeOutThumb.context(this),1000);
	
	
	return false;
};

TouchScrollPanel.prototype.onFadeOutThumb = function(){
	this._isThumbVisible = false;
	jTweener.removeTween(this._thumbElement);
	jTweener.addTween(this._thumbElement,{opacity:0,time:3});
};

TouchScrollPanel.prototype.onFadeInThumb = function(){
	this._isThumbVisible = true;
	clearTimeout(this._fadeThumbTimeout);
	jTweener.removeTween(this._thumbElement);
	jTweener.addTween(this._thumbElement,{opacity:1,time:1});
};

TouchScrollPanel.prototype.releaseStopChildMouseUpTrap = function(){
	console.log('releaseStopChildMouseUpTrap');
	this._isStopChildMouseUp = false;
};


TouchScrollPanel.prototype.scrollY = function(delta,noBoundryOffset){
//	console.log('delta:'+delta);
	//var y = this._y;
	var y = this._y;
	var container = this._contentElement;
	var contentHeight = $(this._contentElement).offset().height;
	var frameHeight = this._frameElement.clientHeight;
	var maxScrollDistance = contentHeight - frameHeight;
	var boundryOffset = (noBoundryOffset === true)?0:40;
	var bottom = 0;
	var top = maxScrollDistance * -1
	var lowerLimit = bottom + boundryOffset;
	var upperLimit = top - boundryOffset;
	
	
	var destinationY = y + delta;
	if(destinationY <= bottom &&  destinationY >= top){				// within normal boundry
		//destination is cool
	}else if(destinationY >= lowerLimit){							//beyond lower boundry
		destinationY = lowerLimit;
	}else if(destinationY <= upperLimit){							//beyong upper boundry
		destinationY = upperLimit;	
	}else if(destinationY > bottom && destinationY < lowerLimit){	//within lower boundry			
		destinationY = y + (delta/4);
	}else if(destinationY < top && destinationY > upperLimit){		//within upper boundry
		destinationY = y + (delta/4);
	}
	
	this._y = destinationY;
	
	this.updateDomScrollPosition();
	
};

TouchScrollPanel.prototype.checkScrollBoundry = function(){
	var y = this._y;
	var contentHeight = $(this._contentElement).offset().height;
	var frameHeight = this._frameElement.clientHeight;
	var destination;
	if(y > 0){
		jTweener.addTween(this,{_y:0,time:0.5,onUpdate:this.updateDomScrollPosition.context(this)});
	}else if(y < -(contentHeight-frameHeight)){
		jTweener.addTween(this,{_y:-(contentHeight-frameHeight),time:0.5,onUpdate:this.updateDomScrollPosition.context(this)});
	}
};

TouchScrollPanel.prototype.updateDomScrollPosition = function(){
	this._contentElement.style.top = this._y+"px";
	this.updateScrollThumbPosition();
};

TouchScrollPanel.prototype.updateScrollThumbPosition = function(){
	var destinationY = this._y;//position not availbale in zepto
	var contentHeight = $(this._contentElement).offset().height;
	var frameHeight = this._frameElement.clientHeight;
	var maxScrollDistance = contentHeight - frameHeight;
	var destinationScrollPercentage = destinationY / maxScrollDistance;
	var frameToContentDimensionRatio = frameHeight / contentHeight;
	var scrollThumbMaxTrackLength = (1 - frameToContentDimensionRatio) * frameHeight;
	var scrollThumbDestinationY = (destinationScrollPercentage * scrollThumbMaxTrackLength) * -1;
	$(this._thumbElement).css('top',scrollThumbDestinationY+"px");
};

TouchScrollPanel.prototype.setScrollThumbHeight = function(){
	var contentHeight = $(this._contentElement).offset().height;
	var frameHeight = this._frameElement.clientHeight;
	var visiblePercentage = frameHeight / contentHeight;
	var thumbHeight = frameHeight * visiblePercentage;
	$(this._thumbElement).css('height',thumbHeight+"px");
	if(contentHeight <= frameHeight){
		$(this._thumbElement).css('display','none');
	}else{
		$(this._thumbElement).css('display','block');
	}
};

TouchScrollPanel.prototype.onMouseWheelHandler = function(e){
	//console.log('onMouseWheel:'+e);
	if(this._isThumbVisible === false){
		this.onFadeInThumb();
	}else{
		this._fadeThumbTimeout = setTimeout(this.onFadeOutThumb.context(this),2000);
	}
	switch(this._scrollDirection){
		case TouchScrollPanel.SCROLL_DIRECTION_VERTICAL:
			this.scrollY(e.wheelDelta,true);
			break;
		case TouchScrollPanel.SCROLL_DIRECTION_HORIZONTAL:
			//this.scrollX(e.wheelDelta,true);
			break;
	}
	
	e.preventDefault();				//prevent lion browser from bounce scroll effect
};







//PUBLIC
//__________________________________________________________________________________________
TouchScrollPanel.prototype.isStopChildMouseUp = function(){
	return 	this._isStopChildMouseUp;
};
TouchScrollPanel.prototype.isDragging = function(){
	return 	this._isDragging;
};
TouchScrollPanel.prototype.setScrollY = function(y){
	$(this._contentElement).css('top',y+'px');
};
TouchScrollPanel.prototype.getScrollMinY = function(){
	return 0;
};
TouchScrollPanel.prototype.updateThumb = function(){
	this.onFadeInThumb();
	this._fadeThumbTimeout = setTimeout(this.onFadeOutThumb.context(this),2000);
	this.setScrollThumbHeight();
	this.updateScrollThumbPosition();
};