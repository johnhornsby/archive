var RelatedArtefactCell = function(options){
	ScrollableCell.call(this,options);
	
	this._anchor;
	this._image;
	this._icon;
	this._border;
	
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
	//$(this._image).bind("load",this.onLoadComplete.context(this));
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
	//$(this._image).unbind("load");
	this.supr.destroy.call(this);
};

RelatedArtefactCell.prototype.clear = function(){
	this._image.src = '';
	
	if(Globals.isDesktop){
		this._image.style.webkitTransition = "opacity 0s";
	}
	if(Globals.browser === "Explorer"){
		//$(el).css({'display':'none'});
		$(this._image).css({'opacity':0});
	}else{
		//el.childNodes[0].style.display = 'none';
		this._image.style.opacity = 0;
		//el.style.display = 'none';
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
	var src = Globals.ARTEFACT_IMAGES_FOLDER+this._data.id+"_11.jpg";
	var id = Globals.imageLoadManager.requestImageIdentifier()+"_"+this._data.id;
	Globals.imageLoadManager.requestImageLoad(id,src, this.loadImageTileComplete.context(this), undefined);
}



//PRIVATE
//_________________________________________________________________________________
RelatedArtefactCell.prototype.onClick = function(){
	//Globals.viewController.onRelatedArtefactClick(this._data);
	this.dispatchEvent(new ScrollableCellEvent(ScrollableCellEvent.CLICK,this._data));
};

RelatedArtefactCell.prototype.loadImageTileComplete = function(e){
	var self = this;
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





