var VeilLoader = function(hostContainer,backgroundColour,backgroundOpacity){
	EventDispatcher.call(this);
	this._hostContainer = hostContainer;
	this._animationStatus = 0;
	this._opacity = 0;
	this._callback;
	this._isTweenCanceled = false;
	this._state = 3;
	this._backgroundColour = backgroundColour || "#000";
	this._backgroundOpacity = backgroundOpacity || 0.5;
	
	this._$backgroundElement;
	this._$animatedElement;
	this._$containerElement;
	
	this.init();
};
VeilLoader.prototype = new EventDispatcher();

VeilLoader.STATE_OPEN = 0;
VeilLoader.STATE_OPENING = 1;
VeilLoader.STATE_CLOSING = 2;
VeilLoader.STATE_CLOSED = 3;





//PRIVATE
//__________________________________________________________________
/**
 *@private
 **/
VeilLoader.prototype.init = function(){
	this.build();
};

VeilLoader.prototype.build = function(){
	var lastElement = $(this._hostContainer).children().last();
	this._$containerElement = lastElement;
	var veilLoaderHtml;
	if ($(lastElement).hasClass("veil-loader") === false){
		veilLoaderHtml = '<div class="veil-loader"><div class="veil-loader-background"></div><div class="veil-loader-animated"></div></div>';
		$(this._hostContainer).append(veilLoaderHtml);
		this._$containerElement = $(this._hostContainer).children().last();
	}
	
	this._$backgroundElement = $(this._hostContainer).find(".veil-loader-background");
	this._$backgroundElement.css({"background-color":this._backgroundColour,"opacity":this._backgroundOpacity});
};

VeilLoader.prototype.destroy = function(){
	this._$backgroundElement.remove();
}

VeilLoader.prototype.onUpdateTween = function(){
	this._$containerElement.css('opacity',this._opacity);
};

VeilLoader.prototype.onCloseTweenComplete = function(){
	//console.log('VeilLoader close onComplete');
	//this._element.style.display = 'none';
	this._$containerElement.hide();
	this._state = VeilLoader.STATE_CLOSED;
	var self = this;
	setTimeout(function(){
		self.dispatchEvent(new VeilLoaderEvent(VeilLoaderEvent.CLOSED));
	},0);
};

VeilLoader.prototype.onOpenTweenComplete = function(){
	//console.log('VeilLoader open onComplete');
	this._state = VeilLoader.STATE_OPEN;
	this._callback();
	var self = this;
	setTimeout(function(){
		self.dispatchEvent(new VeilLoaderEvent(VeilLoaderEvent.OPENED));
	},0);
};



//PUBLIC
//___________________________________________________________________
VeilLoader.prototype.open = function(options){
	if(this._state === VeilLoader.STATE_OPEN) return false;
	this._state = VeilLoader.STATE_OPENING;
	//console.log('VeilLoader open');
	var self = this;
	var time = 0.5;
	//var opacity = 0.5;
	var callback = function(){};
	
	if(options !== undefined){
		time = options.time || time;
		//opacity = options.opacity || opacity;
		callback = options.callback || callback;
	}
	this._callback = callback;

	this.build();
	this._$containerElement.show();
	Animator.removeTween(this);
	Animator.addTween(this,{_opacity:1,time:time,transition:'linear',onComplete:this.onOpenTweenComplete.rEvtContext(this),onUpdate:this.onUpdateTween.rEvtContext(this)});
	return true;
};



VeilLoader.prototype.close = function(options){
	if(this._state === VeilLoader.STATE_CLOSED) return false;
	this._state = VeilLoader.STATE_CLOSING;
	//console.log('VeilLoader close');
	var self = this;
	var time = 0.5;
	//var opacity = 0.5;
	var callback = function(){};
	
	
	if(options !== undefined){
		time = options.time || time;
		//opacity = options.opacity || opacity;
		callback = options.callback || callback;
	}
	
	this._callback = callback;
	Animator.removeTween(this);
	Animator.addTween(this,{_opacity:0,time:time,transition:'linear',onComplete:this.onCloseTweenComplete.rEvtContext(this),onUpdate:this.onUpdateTween.rEvtContext(this)});
	return true;
};





//EVENT CLASS
//_________________________________________________________________________________________	
var VeilLoaderEvent = function(eventType,data){
	this.eventType = eventType;
	this.data = data;
};
VeilLoaderEvent.CLOSED = "closed";
VeilLoaderEvent.OPENED = "opened";
