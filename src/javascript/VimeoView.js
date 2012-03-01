var VimeoView = function(data,container){
	//Inheritance
	EventDispatcher.call(this);
	
	this._data = data;
	this._containerElement = container;
	this._iframeElement;
	this._iframeHidderElement;
	this._isVideoReady = false;
	this._width = 768;
	this._height = 432;
	this._destroyCallback;
	
	//this.init();
};
//Inheritance
VimeoView.prototype = new EventDispatcher();






//PRIVATE
//__________________________________________________________________
VimeoView.prototype.init = function(){
	this._containerElement = $(this._containerElement).get(0);
	this.build();
	this.updatePosition();
	$(window).bind("resize",this.onResize.rEvtContext(this));
};

VimeoView.prototype.build = function(){
	//var html = '<iframe id="player_1" class="VimeoViewImage" src="http://player.vimeo.com/video/22301021?title=0&amp;byline=0&amp;portrait=0&api=1&amp;player_id=player_1" width="448" height="336" frameborder="0"></iframe>';
	var html = '';
	html += '<iframe id="player_1" class="VimeoViewImage" src="http://player.vimeo.com/video/22301021?title=0&amp;byline=0&amp;portrait=0&api=1&amp;player_id=player_1" width="'+this._width+'" height="'+this._height+'" frameborder="0"></iframe>';
	html += '<div class="vimeo-view-player-hidder" style="width:100%; height:100%; display:block; position:absolute; background-color:#000; left:0px; top:0px;"></div>';
	$(this._containerElement).prepend(html);
	this._iframeElement = document.getElementById("player_1");
	this._iframeHidderElement = $(this._containerElement).find(".vimeo-view-player-hidder").get(0);
	this._froogaloop = $f(this._iframeElement);
	this._froogaloop.addEvent('ready', this.ready.context(this));
};

VimeoView.prototype.ready = function(){
	this._isVideoReady = true;
	this._froogaloop.api('setColor', 'cc0033');
	$(this._iframeHidderElement).hide();
	
	var self = this;
	setTimeout(function(){
		self.dispatchEvent(new VimeoViewEvent(VimeoViewEvent.VIMEO_READY));
	},0);
};

VimeoView.prototype.removeFromDOM = function(){
	$(this._iframeElement).remove();
	$(this._iframeHidderElement).remove();
	//$(this._containerElement).empty();
};

VimeoView.prototype.updatePosition = function(e){
	var containerWidth = $(this._containerElement).width();
	var containerHeight = $(this._containerElement).height();
	var left = (containerWidth - this._width) / 2;
	var top = (containerHeight - this._height) / 2;
	this._iframeElement.style["margin-left"] = left+"px";
	this._iframeElement.style["margin-top"] = top+"px";
};

VimeoView.prototype.onResize = function(e){
	this.updatePosition();
};


//PUBLIC
//_________________________________________________________________________________
VimeoView.prototype.update = function(){
	//this.onUpdate();
};

VimeoView.prototype.destroy = function(){
	console.log("Vimeo destroy");
	if(this._isVideoReady === true){
		//console.log("Vimeo Ready so pause");
		this._froogaloop.api('pause');
	}
	//$(this._iframeElement).remove();
	
	/*
	HACK
	
	Remove from the dom a split second after calling pause, 
	I beleive the froogaloop.api instigates a call from a remote js 
	file that references elements in the dom, if those element are not 
	present then you get a script error in IE 9, hence the delayed call to remove from the DOM
	*/	
	var self = this;
	setTimeout(function(){
		self.removeFromDOM.call(self);
		self.dispatchEvent(new VimeoViewEvent(VimeoViewEvent.VIMEO_DESTROYED));
	},0);
};

VimeoView.prototype.unsafeDestroy = function(){
	if(this._isVideoReady === true){
		this._froogaloop.api('pause');
	}
	this.removeFromDOM();
}

/**
* destroy vimeo and allow time before remove after pause, callback used to provide integrity to other class executing destroy, especially when adding another vimeo view straight after 
*/
VimeoView.prototype.destroyWithCallback = function(callback){
	this._destroyCallback = callback;
	if(this._isVideoReady === true){
		this._froogaloop.api('pause');
	}
	/*
	HACK
	Remove from the dom a split second after calling pause, 
	I beleive the froogaloop.api instigates a call from a remote js 
	file that references elements in the dom, if those element are not 
	present then you get a script error in IE 9, hence the delayed call to remove from the DOM
	*/
	var self = this;
	setTimeout(function(){
		self.removeFromDOM.call(self);
		self.dispatchEvent(new VimeoViewEvent(VimeoViewEvent.VIMEO_DESTROYED));
		self._destroyCallback();
	},0);
};

VimeoView.prototype.play = function(){
	if(this._isVideoReady===true)this._froogaloop.api('play');
};

VimeoView.prototype.pause = function(){
	if(this._isVideoReady===true)this._froogaloop.api('pause');
};

VimeoView.prototype.unload = function(){
	if(this._isVideoReady===true)this._froogaloop.api('unload');
};

VimeoView.prototype.load = function(){
	this.init();
};




//EVENT CLASS
//_________________________________________________________________________________________	
var VimeoViewEvent = function(eventType,data){
	this.eventType = eventType;
	this.data = data;
};
VimeoViewEvent.VIMEO_READY = "vimeoReady";
VimeoViewEvent.VIMEO_DESTROYED = "vimeoDestroyed";