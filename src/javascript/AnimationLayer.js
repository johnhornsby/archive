var AnimationLayer = function(element){
	EventDispatcher.call(this);
	
	this._animationLayer = element;
	this._animationObjectArray = [];
	
};
AnimationLayer.prototype = new EventDispatcher();




//PUBLIC
//_______________________________________________________________________________________
AnimationLayer.prototype.openArtefactFromGridAnimation = function(data,imageBounds){
	var animationObject = {};
	this._animationLayer.style.display = 'block';
	animationObject.elementBack = document.createElement("div");
	attr(animationObject.elementBack,"class","backingTile");
	append(this._animationLayer,animationObject.elementBack);
	animationObject.element = document.createElement("div");
	attr(animationObject.element,"class","animationTile");
	append(this._animationLayer,animationObject.element);
	
	var isLandscape = data.o===0;
	var fullscreenBounds = calculateFullscreenBounds(isLandscape);	
	if(isLandscape){
		animationObject.destinationScale = fullscreenBounds.height / imageBounds.height;
	}else{
		animationObject.destinationScale = fullscreenBounds.width / imageBounds.width;
	}
	
	//determin image size
	var imageSize = String(imageBounds.width / Globals.TILE_WIDTH) + String(imageBounds.height / Globals.TILE_HEIGHT);
	animationObject.element.style.backgroundImage = 'url(' + Globals.ARTEFACT_IMAGES_FOLDER + data.id + '_' + imageSize + '.jpg)';
	animationObject.element.style.width = animationObject.elementBack.style.width = imageBounds.width + 'px';
	animationObject.element.style.height = animationObject.elementBack.style.height = imageBounds.height + 'px';
	animationObject.origin = new Point(imageBounds.left, imageBounds.top);
	animationObject.destination = new Point(imageBounds.left, imageBounds.top);
	animationObject.originScale = 1;
	//animationObject.destinationScale = 4;
	animationObject.scaleChange = animationObject.destinationScale - animationObject.originScale;
	animationObject.backScaleX = Globals.windowWidth / imageBounds.width;
	animationObject.backScaleY = Globals.windowHeight / imageBounds.height;
	animationObject.backScaleChangeX = animationObject.backScaleX - animationObject.originScale;
	animationObject.backScaleChangeY = animationObject.backScaleY - animationObject.originScale;
	animationObject.backX = 0;
	animationObject.backY = 0;
	animationObject.elementX = (Globals.windowWidth / 2) - ((imageBounds.width * animationObject.destinationScale)/2);
	animationObject.elementY = (Globals.windowHeight / 2) - ((imageBounds.height * animationObject.destinationScale)/2);
	animationObject.elementChangeX = animationObject.elementX - animationObject.origin.x;
	animationObject.elementChangeY = animationObject.elementY - animationObject.origin.y;
	animationObject.imageBounds = imageBounds;
	
	animationObject.location = 0;
	
	//this.setTransformOrigin(animationObject.elementBack, 0, 0);
	this.setTransformOrigin(animationObject.element, 0, 0);
	this.setTransform(animationObject.element, animationObject.origin.x, animationObject.origin.y, animationObject.originScale, animationObject.originScale);
	//this.setTransform(animationObject.elementBack, animationObject.origin.x, animationObject.origin.y, animationObject.originScale, animationObject.originScale);
	
	animationObject.elementBack.style.left = imageBounds.left + "px";
	animationObject.elementBack.style.top = imageBounds.top + "px";
	
	var location = 1;
	var point;
	var scale;
	var opacity;
	var scaleX;
	var scaleY;
	var backX;
	var backY;
	var backWidth;
	var backHeight;
	var elementX;
	var elementY;
	var inversePercentage;
	var percentage;
	var opacityPercentage;
	var self = this;
	var renderCompleteStatus = false;
	var imageLoadedStatus = false;

	function calculateFullscreenBounds(isLandscape){
		var imageWidth;
		var imageHeight;
		var frameWidth;
		var frameHeight;
		var frameRatio;
		var imageRatio;
		var imageScaledWidth;
		var imageScaledHeight;
		var bounds = new Rectangle();
		if(isLandscape){
			imageWidth = 1024;
			imageHeight = 682;
		}else{
			imageWidth = 682;
			imageHeight = 1024;
		}
		imageRatio = imageWidth / imageHeight; 	// 2/1 = 0.5
		frameWidth = Globals.windowWidth;		
		frameHeight = Globals.windowHeight;
		frameRatio = frameWidth / frameHeight;	// 2/0.75 = 1

		if(imageRatio > frameRatio){	//calculate using width
			imageScaledWidth = frameWidth;
			imageScaledHeight = Math.round(imageHeight * (frameWidth / imageWidth))
			bounds.width = imageScaledWidth;
			bounds.height = imageScaledHeight;
			bounds.left = 0;
			bounds.top = Math.round((frameHeight - imageScaledHeight)/2); 
		}else{							//calculate using height
			imageScaledWidth = Math.round(imageWidth * (frameHeight / imageHeight));
			imageScaledHeight = frameHeight;
			bounds.height = imageScaledHeight;
			bounds.width = imageScaledWidth;
			bounds.left = Math.round((frameWidth - imageScaledWidth)/2); 
			bounds.top = 0;
		}
		return bounds;
	}

	function render(){
		percentage = AnimationLayer.easingFunctions.easeInQuad(animationObject.location,0,1,1);
		//opacityPercentage = AnimationLayer.easingFunctions.easeInQuad(animationObject.location,0,1,1);
		scale = animationObject.originScale + (percentage * animationObject.scaleChange)
		//opacity = 1 - opacityPercentage;
		inversePercentage = 1 - percentage;
				
		elementX = animationObject.origin.x + (percentage * animationObject.elementChangeX);
		elementY = animationObject.origin.y + (percentage * animationObject.elementChangeY);
		
		backX = animationObject.origin.x * inversePercentage;
		backY = animationObject.origin.y * inversePercentage;
		backWidth = animationObject.imageBounds.width + ((Globals.windowWidth - animationObject.imageBounds.width) * percentage);
		backHeight = animationObject.imageBounds.height + ((Globals.windowHeight - animationObject.imageBounds.height) * percentage);
		//scaleX = animationObject.originScale + (percentage * animationObject.backScaleChangeX);
		//scaleY = animationObject.originScale + (percentage * animationObject.backScaleChangeY);
		
		self.setTransform(animationObject.element, elementX, elementY, scale, scale);
		//self.setTransform(animationObject.elementBack, backX, backY, scaleX, scaleY);
		
		animationObject.elementBack.style.left = backX + "px";
		animationObject.elementBack.style.top = backY + "px";
		animationObject.elementBack.style.width = backWidth + "px";
		animationObject.elementBack.style.height = backHeight + "px";
	
		//animationObject.element.style.opacity = opacity;
	}
	function renderComplete(){
		renderCompleteStatus = true;
		var result = fullComplete.call(this);
		if(!result){
			var self = this;
			setTimeout(function(){
				Globals.viewController.showAppVeilLoader();
				//Preload image
				var src = Globals.ARTEFACT_IMAGES_FOLDER+data.id+'.jpg';
				var id = Globals.imageLoadManager.requestImageIdentifier()+"_"+data.id;
				Globals.imageLoadManager.requestImageLoad(id,src,imageLoadedComplete.context(self), undefined);
				//--
			},0);
		}
		
	}
	function imageLoadedComplete(){
		imageLoadedStatus = true;
		fullComplete.call(this);
	}
	function fullComplete(){
		if(imageLoadedStatus && renderCompleteStatus){
			Globals.viewController.hideAppVeilLoader();
			this.dispatchEvent(new AnimationLayerEvent(AnimationLayerEvent.OPEN_ARTEFACT_FROM_GRID_COMPLETE,data));
			var self = this;
			setTimeout(function(){
				self._animationLayer.style.display = 'none';
				$(animationObject.elementBack).remove();
				$(animationObject.element).remove();
				animationObject = undefined;
			},0);
			return true;
		}
		return false;
	}
	
	Animator.addTween(animationObject,{location:1,time:0.3,transition:"linear",onUpdate:render.context(this),onComplete:renderComplete.context(this)});
};

AnimationLayer.prototype.addToArchiveFromGridAnimation = function(data,imageBounds,archiveButtonBounds){
	var animationObject = {};
	this._animationLayer.style.display = 'block';
	animationObject.element = document.createElement("div");
	attr(animationObject.element,"class","animationTile");
	append(this._animationLayer,animationObject.element);
	
	//determin image size
	var imageSize = String(imageBounds.width / Globals.TILE_WIDTH) + String(imageBounds.height / Globals.TILE_HEIGHT);
	animationObject.element.style.backgroundImage = 'url(' + Globals.ARTEFACT_IMAGES_FOLDER + data.id + '_' + imageSize + '.jpg)';
	animationObject.element.style.width = imageBounds.width + 'px';
	animationObject.element.style.height = imageBounds.height + 'px';
	animationObject.origin = new Point(imageBounds.left, imageBounds.top);
	animationObject.destination = new Point(archiveButtonBounds.left, archiveButtonBounds.top);
	animationObject.originScale = 1;
	animationObject.destinationScale = archiveButtonBounds.width / imageBounds.width; //scale to get the item to be the width of button 
	animationObject.curve = [{x:animationObject.origin.x, y:animationObject.origin.y},{x:animationObject.destination.x, y:animationObject.origin.y-200},{x:animationObject.destination.x, y:animationObject.destination.y}];
	animationObject.scaleCurve = [{x:1, y:0},{x:1.5 ,y:0},{x:animationObject.destinationScale, y:0}];
	
	this.setTransformOrigin(animationObject.element, 0, 0);
	this.setTransform(animationObject.element, animationObject.origin.x, animationObject.origin.y, animationObject.originScale, animationObject.originScale);
	
	var location = 1;
	var totalFrames = 60;
	var frameDecrement = totalFrames;
	var point;
	var scale;
	var scalePercentage;
	var self = this;
	
	function initRendering(){
		window.requestAnimFrame(render,animationObject.element);
	}
	
	function render(){
		frameDecrement--;
		if(frameDecrement>-1){
			//location = frameDecrement / totalFrames;
			location = AnimationLayer.easingFunctions.easeOutQuart(frameDecrement,0,1,totalFrames);
			scaleLocation = AnimationLayer.easingFunctions.easeOutQuart(frameDecrement,0,1,totalFrames);
			
			scale = jsBezier.pointOnCurve(animationObject.scaleCurve,scaleLocation);
			point = jsBezier.pointOnCurve(animationObject.curve,location);
			self.setTransform(animationObject.element, point.x, point.y, scale.x, scale.x);
			
			window.requestAnimFrame(render,animationObject.element);
		}else{
			
			self._animationLayer.style.display = 'none';
			$(animationObject.element).remove();
			animationObject = undefined;
			Globals.viewController.closeVeil({time:0.15});
			self.dispatchEvent(new AnimationLayerEvent(AnimationLayerEvent.ADD_ARTEFACT_TO_DOCK_COMPLETE));
		}
	};
	Globals.viewController.openVeil({time:0.15, callback:initRendering});
};

AnimationLayer.prototype.setTransform = function(element,x,y,sx,sy){
	element.style.msTransform = element.style.webkitTransform = element.style.transform = 'matrix('+sx+',0,0,'+sy+','+x+','+y+')';
	element.style.MozTransform = 'matrix('+sx+',0,0,'+sy+','+x+'px,'+y+'px)';
};



AnimationLayer.prototype.setTransformOrigin = function(element,x,y){
	element.style.msTransformOrigin = element.style.webkitTransformOrigin = element.style.MozTransformOrigin = element.style.transformOrigin = x +'px '+y+'px';
};




AnimationLayer.prototype.removeFromMyArchiveInGridAnimation = function(data,imageBounds){
	var animationObject = {};
	this._animationLayer.style.display = 'block';
	animationObject.elementBack = document.createElement("div");
	attr(animationObject.elementBack,"class","backingTile");
	append(this._animationLayer,animationObject.elementBack);
	animationObject.element = document.createElement("div");
	attr(animationObject.element,"class","animationTile");
	append(this._animationLayer,animationObject.element);
	
	//determin image size
	var imageSize = String(imageBounds.width / Globals.TILE_WIDTH) + String(imageBounds.height / Globals.TILE_HEIGHT);
	animationObject.element.style.backgroundImage = 'url(' + Globals.ARTEFACT_IMAGES_FOLDER + data.id + '_' + imageSize + '.jpg)';
	animationObject.element.style.width = animationObject.elementBack.style.width = imageBounds.width + 'px';
	animationObject.element.style.height = animationObject.elementBack.style.height = imageBounds.height + 'px';
	animationObject.origin = new Point(imageBounds.left, imageBounds.top);
	animationObject.destination = new Point(imageBounds.left, imageBounds.top);
	
	animationObject.originScale = 1;
	animationObject.destinationScale = 1; //scale to get the item to be the width of button 

	animationObject.scaleCurve = [{x:1, y:0},{x:0.5 ,y:0},{x:1.2 ,y:0},{x:1, y:0}];
	
	this.setTransform(animationObject.element, animationObject.origin.x, animationObject.origin.y, animationObject.originScale);
	this.setTransform(animationObject.elementBack, animationObject.origin.x, animationObject.origin.y, animationObject.originScale);
	
	var location = 1;
	var totalFrames = 30;
	var frameDecrement = totalFrames;
	var point;
	var scale;
	var scalePercentage;
	var self = this;
	
	function initRendering(){
		window.requestAnimFrame(render,animationObject.element);
	}
	
	function render(){
		frameDecrement--;
		if(frameDecrement>-1){
			scaleLocation = AnimationLayer.easingFunctions.easeOutQuad(frameDecrement,0,1,totalFrames);
			scale = jsBezier.pointOnCurve(animationObject.scaleCurve,scaleLocation);
			self.setTransform(animationObject.element, animationObject.origin.x, animationObject.origin.y, scale.x);
			window.requestAnimFrame(render,animationObject.element);
		}else{
			self._animationLayer.style.display = 'none';
			$(animationObject.elementBack).remove();
			$(animationObject.element).remove();
			animationObject = undefined;
			self.dispatchEvent(new AnimationLayerEvent(AnimationLayerEvent.REMOVE_ARTEFACT_FROM_DOCK_COMPLETE));
		}
	};
	initRendering();
}


/**
 * Easing equation function for a simple linear tweening, with no easing.
 *
 * @param t		Current time (in frames or seconds).
 * @param b		Starting value.
 * @param c		Change needed in value.
 * @param d		Expected easing duration (in frames or seconds).
 * @return		The correct value.
 */
AnimationLayer.easingFunctions = {
    easeNone: function(t, b, c, d) {
        return c*t/d + b;
    },
    easeInQuad: function(t, b, c, d) {
        return c*(t/=d)*t + b;
    },
    easeOutQuad: function(t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    },
    easeInOutQuad: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t + b;
        return -c/2 *((--t)*(t-2) - 1) + b;
    },
    easeInCubic: function(t, b, c, d) {
        return c*(t/=d)*t*t + b;
    },
    easeOutCubic: function(t, b, c, d) {
        return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInOutCubic: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    },
    easeOutInCubic: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutCubic(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInCubic((t*2)-d, b+c/2, c/2, d);
    },
    easeInQuart: function(t, b, c, d) {
        return c*(t/=d)*t*t*t + b;
    },
    easeOutQuart: function(t, b, c, d) {
        return -c *((t=t/d-1)*t*t*t - 1) + b;
    },
    easeInOutQuart: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 *((t-=2)*t*t*t - 2) + b;
    },
    easeOutInQuart: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutQuart(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInQuart((t*2)-d, b+c/2, c/2, d);
    },
    easeInQuint: function(t, b, c, d) {
        return c*(t/=d)*t*t*t*t + b;
    },
    easeOutQuint: function(t, b, c, d) {
        return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },
    easeInOutQuint: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
        return c/2*((t-=2)*t*t*t*t + 2) + b;
    },
    easeOutInQuint: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutQuint(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInQuint((t*2)-d, b+c/2, c/2, d);
    },
    easeInSine: function(t, b, c, d) {
        return -c * Math.cos(t/d *(Math.PI/2)) + c + b;
    },
    easeOutSine: function(t, b, c, d) {
        return c * Math.sin(t/d *(Math.PI/2)) + b;
    },
    easeInOutSine: function(t, b, c, d) {
        return -c/2 *(Math.cos(Math.PI*t/d) - 1) + b;
    },
    easeOutInSine: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutSine(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInSine((t*2)-d, b+c/2, c/2, d);
    },
    easeInExpo: function(t, b, c, d) {
        return(t==0) ? b : c * Math.pow(2, 10 *(t/d - 1)) + b - c * 0.001;
    },
    easeOutExpo: function(t, b, c, d) {
        return(t==d) ? b+c : c * 1.001 *(-Math.pow(2, -10 * t/d) + 1) + b;
    },
    easeInOutExpo: function(t, b, c, d) {
        if(t==0) return b;
        if(t==d) return b+c;
        if((t/=d/2) < 1) return c/2 * Math.pow(2, 10 *(t - 1)) + b - c * 0.0005;
        return c/2 * 1.0005 *(-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeOutInExpo: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutExpo(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInExpo((t*2)-d, b+c/2, c/2, d);
    },
    easeInCirc: function(t, b, c, d) {
        return -c *(Math.sqrt(1 -(t/=d)*t) - 1) + b;
    },
    easeOutCirc: function(t, b, c, d) {
        return c * Math.sqrt(1 -(t=t/d-1)*t) + b;
    },
    easeInOutCirc: function(t, b, c, d) {
        if((t/=d/2) < 1) return -c/2 *(Math.sqrt(1 - t*t) - 1) + b;
        return c/2 *(Math.sqrt(1 -(t-=2)*t) + 1) + b;
    },
    easeOutInCirc: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutCirc(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInCirc((t*2)-d, b+c/2, c/2, d);
    },
    easeInElastic: function(t, b, c, d, a, p) {
        var s;
        if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
        if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
    },
    easeOutElastic: function(t, b, c, d, a, p) {
        var s;
        if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
        if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
        return(a*Math.pow(2,-10*t) * Math.sin((t*d-s)*(2*Math.PI)/p ) + c + b);
    },
    easeInOutElastic: function(t, b, c, d, a, p) {
        var s;
        if(t==0) return b;  if((t/=d/2)==2) return b+c;  if(!p) p=d*(.3*1.5);
        if(!a || a < Math.abs(c)) { a=c; s=p/4; }       else s = p/(2*Math.PI) * Math.asin(c/a);
        if(t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
        return a*Math.pow(2,-10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },
    easeOutInElastic: function(t, b, c, d, a, p) {
        if(t < d/2) return jTweener.easingFunctions.easeOutElastic(t*2, b, c/2, d, a, p);
        return jTweener.easingFunctions.easeInElastic((t*2)-d, b+c/2, c/2, d, a, p);
    },
    easeInBack: function(t, b, c, d, s) {
        if(s == undefined) s = 1.70158;
        return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    easeOutBack: function(t, b, c, d, s) {
        if(s == undefined) s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    easeInOutBack: function(t, b, c, d, s) {
        if(s == undefined) s = 1.70158;
        if((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },
    easeOutInBack: function(t, b, c, d, s) {
        if(t < d/2) return jTweener.easingFunctions.easeOutBack(t*2, b, c/2, d, s);
        return jTweener.easingFunctions.easeInBack((t*2)-d, b+c/2, c/2, d, s);
    },
    easeInBounce: function(t, b, c, d) {
        return c - jTweener.easingFunctions.easeOutBounce(d-t, 0, c, d) + b;
    },
    easeOutBounce: function(t, b, c, d) {
        if((t/=d) <(1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if(t <(2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if(t <(2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    },
    easeInOutBounce: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeInBounce(t*2, 0, c, d) * .5 + b;
        else return jTweener.easingFunctions.easeOutBounce(t*2-d, 0, c, d) * .5 + c*.5 + b;
    },
    easeOutInBounce: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutBounce(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInBounce((t*2)-d, b+c/2, c/2, d);
    }
};
AnimationLayer.easingFunctions.linear = AnimationLayer.easingFunctions.easeNone;






//Event Classes
//_________________________________________________________________________________________	
var AnimationLayerEvent = function(eventType,data){
	this.eventType = eventType;
	this.data = data;
};
AnimationLayerEvent.ADD_ARTEFACT_TO_DOCK_COMPLETE = "addArtefactToDockComplete";
AnimationLayerEvent.OPEN_ARTEFACT_FROM_GRID_COMPLETE = "openArtefactFromGridComplete";