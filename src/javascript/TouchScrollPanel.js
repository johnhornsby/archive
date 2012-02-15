var TouchScrollPanel = function(options){
	EventDispatcher.call(this);
	if(options === undefined) return;				// inheritance handling
	
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
	this._isAnimating = false;
	
	this._inertiaInterval = undefined;
	this._fadeThumbInterval = undefined;
	this._fadeThumbTimeout = undefined;
	this._isThumbVisible;
	
	this._y = 0;
	this._x = 0;
	
	this._inertiaInterval;
	this._friction = 0.9;
	this._acceleration = 0;
	this._contentWidth = 0;
	this._contentHeight = 0;
	
	this.init();
};
//inheritance
TouchScrollPanel.prototype = new EventDispatcher();
TouchScrollPanel.prototype.constructor = TouchScrollPanel;
TouchScrollPanel.prototype.supr = EventDispatcher.prototype;

TouchScrollPanel.SCROLL_DIRECTION_VERTICAL = 0;
TouchScrollPanel.SCROLL_DIRECTION_HORIZONTAL = 1;
TouchScrollPanel.MOUSE_DRAG_MODIFIER = 2;
TouchScrollPanel.CLICK_THRESHOLD_DURATION = 500 // milliseconds 500
TouchScrollPanel.CLICK_THRESHOLD_DISTANCE = 10 // pixels






//PRIVATE
//__________________________________________________________________________________________
TouchScrollPanel.prototype.init = function(){
	$(this._frameElement).bind('mousewheel',this.onMouseWheelHandler.context(this));
	$(this._frameElement).bind('DOMMouseScroll',this.onDOMMouseScrollHandler.context(this));
	$(this._frameElement).bind('mousedown',this.onDownFrameHandler.context(this));
	$(this._frameElement).bind('touchstart',this.onDownFrameHandler.context(this));
	//addEvent(this._frameElement,'touchstart',this.onDownFrameHandler.context(this));
	this.build();
	window.requestAnimFrame(this.updateAnimation.context(this));
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
	this.stopTweenAnimation();
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
		//addEvent(window,'touchmove',this.onMoveWindowHandler.context(this));
		//addEvent(window,'touchend',this.onUpWindowHandler.context(this));
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
		//// don't return false as this causes problems for child elements receiving event on iPad, return false on desktop as this stops highlighing text
		e.preventDefault();
		return false;
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
	e.preventDefault();//return false;
	
};

TouchScrollPanel.prototype.onUpWindowHandler = function(e){
	console.log('onUpWindowHandler');
	var pageX;
	var pageY;
	var eventType = (e.type.indexOf('touch')!=-1)?'touch':'mouse';
	if(eventType==='touch'){
		//addEvent(window,'touchmove',this.onMoveWindowHandler.context(this));
		//addEvent(window,'touchend',this.onUpWindowHandler.context(this));
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
		var outside = this.checkScrollBoundry();
		var delta = 0;
		if(outside === false){
			if(this._scrollDirection === TouchScrollPanel.SCROLL_DIRECTION_VERTICAL){
				delta = this._topDelta;
			}else{
				delta = this._leftDelta;
			}
			this.initInertiaAnimation(delta);
		}
	}
	
	this._fadeThumbTimeout = setTimeout(this.onFadeOutThumb.context(this),1000);
	
	
	return false;
};

TouchScrollPanel.prototype.initInertiaAnimation = function(finalTopDelta){
	var topAnimationProperties = this.getAnimaitonProperties(finalTopDelta);
	var destination;
	
	if(this._scrollDirection === TouchScrollPanel.SCROLL_DIRECTION_VERTICAL){
		destination = this._y + topAnimationProperties.distance;
		/*
		var contentHeight = this._frameElement.clientHeight - (this._maxCells * Globals.TILE_HEIGHT);
		if(destination > 0){
			destination = 0;
		}else if(destination < contentHeight){
			destination = contentHeight;
		}
		*/
		this.__tempZ = this._y;
	}else{
		destination = this._x + topAnimationProperties.distance;
		/*
		var contentWidth = this._frameElement.clientWidth - (this._maxCells * Globals.TILE_WIDTH);
		if(destination > 0){
			destination = 0;
		}else if(destination < contentWidth){
			destination = contentWidth;
		}
		*/
		this.__tempZ = this._x
	}
	/*
	Animator.addTween(this,{
		__tempZ:destination,
		time:topAnimationProperties.time,
		transition:'easeOutQuad',
		onUpdate:this.onTweenUpdate.context(this),
		onComplete:this.onTweenComplete.context(this)
	});
	*/
	this._velocity = finalTopDelta;
	this._contentWidth = $(this._contentElement).width();
	this._inertiaInterval = setInterval(this.updateAnimation.context(this),33);
	
	this._isAnimating = true;
};

TouchScrollPanel.prototype.updateAnimation = function(){
	/
	Globals.log("updateAnimation");
	if(this._isAnimating===false)return;
	this._velocity = this._velocity * this._friction;
	//Globals.log(this._velocity);
	
	var containerBottom;
	var boundryModifier;
	var ammountIntoBoundry;
	var acceleration;
	var destination;
	
	if(this._scrollDirection === TouchScrollPanel.SCROLL_DIRECTION_VERTICAL){
		this.setScrollY(this._y + this._velocity);
	}else{
		boundryModifier = 0;
		
		if(this._x > 0){
			containerBottom = this._x + this._contentWidth;
			ammountIntoBoundry = this._contentWidth - containerBottom;
			
			ammountIntoBoundry =  Math.min(90,ammountIntoBoundry);
			ammountIntoBoundry =  Math.max(0,ammountIntoBoundry);
			ammountIntoBoundry = Math.sin(this.degreesToRadians(ammountIntoBoundry));
			ammountIntoBoundry = 100 - (ammountIntoBoundry * 100);
			boundryModifier = ammountIntoBoundry;
			
		}else if(this._x < (this._frameElement.clientWidth - this._contentWidth)) {
			ammountIntoBoundry = (this._frameElement.clientWidth - this._contentWidth) - this._x;
			
			ammountIntoBoundry =  Math.min(90,ammountIntoBoundry);
			ammountIntoBoundry =  Math.max(0,ammountIntoBoundry);
			ammountIntoBoundry = Math.sin(this.degreesToRadians(ammountIntoBoundry));
			ammountIntoBoundry = 100 - (ammountIntoBoundry * 100);
			boundryModifier = ammountIntoBoundry;
		}

		acceleration = this._velocity + boundryModifier;
		
		destination = this._x + acceleration;
		this.setScrollX(this._x + acceleration);
		
		//Globals.log("boundryModifier:"+boundryModifier);
		
		if((acceleration < 0.5 && acceleration > -0.5) && (boundryModifier < 0.5 && boundryModifier > -0.5)){
			this.stopTweenAnimation();
		}
	}
	
	
}

TouchScrollPanel.prototype.degreesToRadians = function(d){
	return (Math.PI/180) * d;
}


TouchScrollPanel.prototype.getAnimaitonProperties = function(delta){
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

TouchScrollPanel.prototype.onTweenUpdate = function(){
	if(this._scrollDirection === TouchScrollPanel.SCROLL_DIRECTION_VERTICAL){
		this.setScrollY(this.__tempZ);
	}else{
		this.setScrollX(this.__tempZ);
	}
};

TouchScrollPanel.prototype.onTweenComplete = function(){
	this.stopTweenAnimation();
	this.checkScrollBoundry();
};

TouchScrollPanel.prototype.stopTweenAnimation = function(){
	if(this._isAnimating === true){
		Globals.log("stopTweenAnimation");
		//Animator.removeTween(this);
		clearInterval(this._inertiaInterval);
		this._isAnimating = false;
	}
};


//---------------



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
	//var contentHeight = $(this._contentElement).offset().height;
	var contentHeight = $(this._contentElement).height();
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

TouchScrollPanel.prototype.scrollX = function(delta,noBoundryOffset){
//	console.log('delta:'+delta);
	//var y = this._y;
	var x = this._x;
	var container = this._contentElement;
	//var contentHeight = $(this._contentElement).offset().height;
	var contentWidth = $(this._contentElement).width();
	var frameWidth = this._frameElement.clientWidth;
	var maxScrollDistance = contentWidth - frameWidth;
	var boundryOffset = (noBoundryOffset === true)?0:40;
	var right = 0;
	var left = maxScrollDistance * -1
	var lowerLimit = right + boundryOffset;
	var upperLimit = left - boundryOffset;
		
	var destinationX = x + delta;
	if(destinationX <= right &&  destinationX >= left){				// within normal boundry
		//destination is cool
	}else if(destinationX >= lowerLimit){							//beyond lower boundry
		destinationX = lowerLimit;
	}else if(destinationX <= upperLimit){							//beyong upper boundry
		destinationX = upperLimit;	
	}else if(destinationX > right && destinationX < lowerLimit){	//within lower boundry			
		destinationX = x + (delta/4);
	}else if(destinationX < left && destinationX > upperLimit){		//within upper boundry
		destinationX = x + (delta/4);
	}
	
	this._x = destinationX;
	
	this.updateDomScrollPosition();
};

TouchScrollPanel.prototype.checkScrollBoundry = function(){
	if(this._scrollDirection === TouchScrollPanel.SCROLL_DIRECTION_VERTICAL){
		var y = this._y;
		var contentHeight = $(this._contentElement).height();
		var frameHeight = this._frameElement.clientHeight;
		var destination;
		if(y > 0){
			jTweener.addTween(this,{_y:0,time:0.5,onUpdate:this.updateDomScrollPosition.context(this)});
			return true;
		}else if(y < -(contentHeight-frameHeight)){
			jTweener.addTween(this,{_y:-(contentHeight-frameHeight),time:0.5,onUpdate:this.updateDomScrollPosition.context(this)});
			return true;
		}return false;
	}else{
		var x = this._x;
		var contentWidth = $(this._contentElement).width();
		var frameWidth = this._frameElement.clientWidth;
		var destination;
		if(x > 0){
			jTweener.addTween(this,{_x:0,time:0.5,onUpdate:this.updateDomScrollPosition.context(this)});
			return true;
		}else if(x < -(contentWidth-frameWidth)){
			jTweener.addTween(this,{_x:-(contentWidth-frameWidth),time:0.5,onUpdate:this.updateDomScrollPosition.context(this)});
			return true;
		}return false;
	}
};

TouchScrollPanel.prototype.updateDomScrollPosition = function(){
	if(this._scrollDirection === TouchScrollPanel.SCROLL_DIRECTION_VERTICAL){
		this._contentElement.style.top = this._y+"px";
	}else{
		this._contentElement.style.left = this._x+"px";
	}
	this.updateScrollThumbPosition();
};

TouchScrollPanel.prototype.updateScrollThumbPosition = function(){
	if(this._scrollDirection === TouchScrollPanel.SCROLL_DIRECTION_VERTICAL){
		var destinationY = this._y;//position not availbale in zepto
		//var contentHeight = $(this._contentElement).offset().height;
		var contentHeight = $(this._contentElement).height();
		var frameHeight = this._frameElement.clientHeight;
		var maxScrollDistance = contentHeight - frameHeight;
		var destinationScrollPercentage = destinationY / maxScrollDistance;
		var frameToContentDimensionRatio = frameHeight / contentHeight;
		var scrollThumbMaxTrackLength = (1 - frameToContentDimensionRatio) * frameHeight;
		var scrollThumbDestinationY = (destinationScrollPercentage * scrollThumbMaxTrackLength) * -1;
		$(this._thumbElement).css('top',scrollThumbDestinationY+"px");
	}else{
		var destinationX = this._x;//position not availbale in zepto
		//var contentHeight = $(this._contentElement).offset().height;
		var contentWidth = $(this._contentElement).width();
		var frameWidth = this._frameElement.clientWidth;
		var maxScrollDistance = contentWidth - frameWidth;
		var destinationScrollPercentage = destinationX / maxScrollDistance;
		var frameToContentDimensionRatio = frameWidth / contentWidth;
		var scrollThumbMaxTrackLength = (1 - frameToContentDimensionRatio) * frameWidth;
		var scrollThumbDestinationX = (destinationScrollPercentage * scrollThumbMaxTrackLength) * -1;
		$(this._thumbElement).css('left',scrollThumbDestinationX+"px");
	}
};

TouchScrollPanel.prototype.setScrollThumbDimension = function(){
	var jQObject = $(this._contentElement);
	//var offsetObject = jQObject.offset();
	if(this._scrollDirection === TouchScrollPanel.SCROLL_DIRECTION_VERTICAL){
		var contentHeight = jQObject.height();
		var frameHeight = this._frameElement.clientHeight;
		var visiblePercentage = frameHeight / contentHeight;
		var thumbHeight = frameHeight * visiblePercentage;
		$(this._thumbElement).css('height',thumbHeight+"px");
		if(contentHeight <= frameHeight){
			$(this._thumbElement).css('display','none');
		}else{
			$(this._thumbElement).css('display','block');
		}
	}else{
		var contentWidth = jQObject.width();
		var frameWidth = this._frameElement.clientWidth;
		var visiblePercentage = frameWidth / contentWidth;
		var thumbWidth = frameWidth * visiblePercentage;
		$(this._thumbElement).css('width',thumbWidth+"px");
		if(contentWidth <= frameWidth){
			$(this._thumbElement).css('display','none');
		}else{
			$(this._thumbElement).css('display','block');
		}
	}
};

TouchScrollPanel.prototype.onDOMMouseScrollHandler = function(e){
	//Globals.log('onDOMMouseScrollHandler');
    var delta = -e.detail;
	this.setMouseWheenDelta(delta);
};


TouchScrollPanel.prototype.onMouseWheelHandler = function(e){
	this.setMouseWheenDelta(e.wheelDelta);
	e.preventDefault();				//prevent lion browser from bounce scroll effect
};

TouchScrollPanel.prototype.setMouseWheenDelta = function(delta){
	//Globals.log('onMouseWheel:'+delta);
	if(this._isThumbVisible === false){
		this.onFadeInThumb();
	}else{
		this._fadeThumbTimeout = setTimeout(this.onFadeOutThumb.context(this),2000);
	}
	switch(this._scrollDirection){
		case TouchScrollPanel.SCROLL_DIRECTION_VERTICAL:
			this.scrollY(delta,true);
			break;
		case TouchScrollPanel.SCROLL_DIRECTION_HORIZONTAL:
			//this.scrollX(e.wheelDelta,true);
			this.scrollX(delta,true);
			break;
	}
}





//PUBLIC
//__________________________________________________________________________________________
TouchScrollPanel.prototype.isStopChildMouseUp = function(){
	return 	this._isStopChildMouseUp;
};
TouchScrollPanel.prototype.isDragging = function(){
	return 	this._isDragging;
};

TouchScrollPanel.prototype.getScrollY = function(){
	return this._y;
}
TouchScrollPanel.prototype.setScrollY = function(y){
	this._y = y;
	this.updateDomScrollPosition();
};

TouchScrollPanel.prototype.getScrollX = function(){
	return this._x;
}
TouchScrollPanel.prototype.setScrollX = function(x){
	this._x = x;
	this.updateDomScrollPosition();
};
/*
TouchScrollPanel.prototype.scrollToPos = function(){
	
};
*/
TouchScrollPanel.prototype.getScrollMinY = function(){
	return 0;
};
TouchScrollPanel.prototype.getScrollMinX = function(){
	return 0;
};

TouchScrollPanel.prototype.getFrameWidth = function(){
	return this._frameElement.clientWidth;
};

TouchScrollPanel.prototype.getFrameHeight = function(){
	return this._frameElement.clientHeight;
};

TouchScrollPanel.prototype.updateThumb = function(){
	this.onFadeInThumb();
	this._fadeThumbTimeout = setTimeout(this.onFadeOutThumb.context(this),2000);
	this.setScrollThumbDimension();
	this.updateScrollThumbPosition();
};