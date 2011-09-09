var VimeoView = function(data,container){
	
	this._data = data;
	this._containerElement = container;
	this._iframeElement;
	this._isVideoReady = false;
	
	this.init();
};







//PRIVATE
//__________________________________________________________________
VimeoView.prototype.init = function(){
	this._containerElement = $(this._containerElement).get(0);
	this.build();
};

VimeoView.prototype.build = function(){
	var html = '<iframe id="player_1" class="VimeoViewImage" src="http://player.vimeo.com/video/22301021?title=0&amp;byline=0&amp;portrait=0&api=1&amp;player_id=player_1" width="448" height="336" frameborder="0"></iframe>';
	$(this._containerElement).html(html);
	
	this._iframeElement = document.getElementById("player_1")
	this._froogaloop = $f(this._iframeElement);
	this._froogaloop.addEvent('ready', this.ready.context(this));

};

VimeoView.prototype.ready = function(){
	this._isVideoReady = true;
	this._froogaloop.api('setColor', 'cc0033');
};






//PUBLIC
//_________________________________________________________________________________
VimeoView.prototype.update = function(){
	//this.onUpdate();
};

VimeoView.prototype.destroy = function(){
	//console.log("Vimeo destroy");
	if(this._isVideoReady === true){
		//console.log("Vimeo Ready so pause");
		this._froogaloop.api('pause');
	}
	//$(this._iframeElement).remove();
	$(this._containerElement).empty();
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