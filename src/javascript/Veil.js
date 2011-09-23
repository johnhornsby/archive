var Veil = function(element){
	EventDispatcher.call(this);
	this._element = element;
	this._animationStatus = 0;
	this._opacity = 0;
	this._callback;
	this._isTweenCanceled = false;
	this.init();
};
Veil.prototype = new EventDispatcher();

Veil.STATE_OPEN = 0;
Veil.STATE_OPENING = 1;
Veil.STATE_CLOSING = 2;
Veil.STATE_CLOSED = 3;





//PRIVATE
//__________________________________________________________________
/**
 *@private
 **/
Veil.prototype.init = function(){
	
};


//PUBLIC
//___________________________________________________________________
Veil.prototype.open = function(options){
	//console.log('Veil open');
	var self = this;
	var time = 0.5;
	var opacity = 0.5;
	var callback = function(){};
	
	
	if(options !== undefined){
		time = options.time || time;
		opacity = options.opacity || opacity;
		callback = options.callback || callback;
	}
	
	this._callback = callback;
	/*
	$(this._element).css('display','block');
	$(this._element).css('opacity',String(this._opacity));
	*/
	/*
	var destinationOpacity = options.destinationOpacity || 0.5;
	var animationObject = {};
	var self = this;
	function render(){
		
	}
	window.requestAnimFrame(render,self.element);
	*/
	
	
	/*
	function onComplete(){
		console.log('Veil open onComplete');
		callback();
	}
	function onUpdate(){
		$(self._element).css('opacity',self._opacity);
	}
	*/
	//this._element.style.top = '0px';
	this._element.style.display = 'block';
	//jTweener.removeTween(this);
	//jTweener.addTween(this,{_opacity:opacity,time:time,transition:'linear',onComplete:this.onOpenTweenComplete.rEvtContext(this),onUpdate:this.onUpdateTween.rEvtContext(this)});
	Animator.removeTween(this);
	Animator.addTween(this,{_opacity:opacity,time:time,transition:'linear',onComplete:this.onOpenTweenComplete.rEvtContext(this),onUpdate:this.onUpdateTween.rEvtContext(this)});
	
	
	
	//this._element.style.transition = '';
	/*
	this._element.style.top = '0px';
	this._element.style.opacity = 0;
	this._element.style.webkitTransition = 'opacity 1s linear';
	this._element.style.MozTransition = 'opacity 1s linear';
	this._element.style.msTransition = 'opacity 1s linear';
    this._element.style.opacity = opacity;
	*/
};



Veil.prototype.close = function(options){
	//console.log('Veil close');
	var self = this;
	var time = 0.5;
	var opacity = 0.5;
	var callback = function(){};
	
	
	if(options !== undefined){
		time = options.time || time;
		opacity = options.opacity || opacity;
		callback = options.callback || callback;
	}
	
	this._callback = callback;
	
	/*
	this._element.style.top = '0px';
	this._element.style.opacity = 0;
	this._element.style.webkitTransition = 'opacity 1s linear';
	this._element.style.MozTransition = 'opacity 1s linear';
	this._element.style.msTransition = 'opacity 1s linear';
	var self = this;
	setTimeout(function(){
		self._element.style.top = '9999px';	
	},1200);
	*/
	/*
	function onComplete(){
		console.log('Veil close onComplete');
		self._element.style.display = 'none';
	}
	function onUpdate(){
		$(self._element).css('opacity',self._opacity);
	}
	*/
	
	//jTweener.removeTween(this);
	//jTweener.addTween(this,{_opacity:0,time:time,transition:'linear',onComplete:this.onCloseTweenComplete.rEvtContext(this),onUpdate:this.onUpdateTween.rEvtContext(this)});
	Animator.removeTween(this);
	Animator.addTween(this,{_opacity:0,time:time,transition:'linear',onComplete:this.onCloseTweenComplete.rEvtContext(this),onUpdate:this.onUpdateTween.rEvtContext(this)});
};

Veil.prototype.onUpdateTween = function(){
	$(this._element).css('opacity',this._opacity);
};

Veil.prototype.onCloseTweenComplete = function(){
	//console.log('Veil close onComplete');
	this._element.style.display = 'none';
};

Veil.prototype.onOpenTweenComplete = function(){
	//console.log('Veil open onComplete');
	this._callback();
};

