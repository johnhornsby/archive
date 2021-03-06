var RelatedArtefactCell = function(options){
	ScrollableCell.call(this,options);
	
	this._anchor;
	this._image;
	this._icon;
	this._border;
	this._loaded = false;
	this._imageRequestIndentifier;
	
};
RelatedArtefactCell.prototype = new ScrollableCell();
RelatedArtefactCell.prototype.constructor = RelatedArtefactCell;
RelatedArtefactCell.prototype.supr = ScrollableCell.prototype;

//OVERRIDE 
//___________________________________________________________________________________
//build
RelatedArtefactCell.prototype.build = function(){
	this.supr.build.call(this);
	this._image = new Image();
	$(this._image).css("opacity",0);
	this._icon = document.createElement("div");
	$(this._icon).addClass("tileIcon");
	this._border = document.createElement("div");
	$(this._border).addClass("tileBorder");
	this._anchor = document.createElement("a");
	$(this._containerElement).addClass("tile");
	
	$(this._containerElement).addClass("relatedArtefactCell");
	$(this._containerElement).append(this._image);
	$(this._containerElement).append(this._icon);
	$(this._containerElement).append(this._border);
	$(this._containerElement).append(this._anchor);
	$(this._anchor).bind('click',this.onClick.context(this));
};

//destroy
RelatedArtefactCell.prototype.destroy = function(){
	$(this._anchor).unbind('click');
	this.supr.destroy.call(this);
};

RelatedArtefactCell.prototype.clear = function(){
	if(this._loaded === false){
		Globals.imageLoadManager.cancelRequestedImageLoad(this._imageRequestIndentifier);	
	}
	this._imageRequestIndentifier = undefined;
	this._image.src = '';
	if(Globals.isDesktop){
		this._image.style.webkitTransition = "opacity 0s";
	}
	if(Globals.browser === "Explorer"){
		$(this._image).css({'opacity':0});
	}else{
		this._image.style.opacity = 0;
	}
};

//setData
RelatedArtefactCell.prototype.setData = function(data,restoreStateObject){
	this.supr.setData.call(this,data,restoreStateObject);
	this._image.src = '';
	
	this._icon.style.backgroundImage = "url(images/mediaType_"+this._data.m+".gif)";
	if(Globals.isDesktop){
		if(Globals.browser === "Explorer"){
			$(this._image).css('opacity',0);
		}else{
			this._image.style.webkitTransition = "opacity 0s";
			this._image.style.opacity = 0;
		}
	}else{
		this._image.style.opacity = 0;
	}
	this._loaded = false;
	var src = Globals.ARTEFACT_IMAGES_FOLDER+this._data.id+"_11.jpg";
	this._imageRequestIndentifier = Globals.imageLoadManager.requestImageIdentifier()+"_"+this._data.id;
	Globals.imageLoadManager.requestImageLoad(this._imageRequestIndentifier,src, this.loadImageTileComplete.context(this), undefined);
}



//PRIVATE
//_________________________________________________________________________________
RelatedArtefactCell.prototype.onClick = function(){
	this.dispatchEvent(new ScrollableCellEvent(ScrollableCellEvent.CLICK,this._data));
};

RelatedArtefactCell.prototype.loadImageTileComplete = function(e){
	var self = this;
	this._loaded = true;
	this._image.src = Globals.ARTEFACT_IMAGES_FOLDER+this._data.id+"_11.jpg";
	if(Globals.isDesktop){
		if(Globals.browser === "Explorer"){
			$(this._image).css('opacity',1);
		}else{
			this._image.style.opacity = 0;
			this._image.style.webkitTransition = "opacity 0.3s linear";
			setTimeout(function(){
				self._image.style.opacity = 1;
			},0);
		}
	}else{
		this._image.style.opacity = 1;
	}
	
};





