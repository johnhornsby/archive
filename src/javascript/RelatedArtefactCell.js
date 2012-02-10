var RelatedArtefactCell = function(options){
	ScrollableCell.call(this,options);
	
	this._anchor;
	this._image;
	
};
RelatedArtefactCell.prototype = new ScrollableCell();
RelatedArtefactCell.prototype.constructor = RelatedArtefactCell;
RelatedArtefactCell.prototype.supr = ScrollableCell.prototype;

//OVERRIDE 
//___________________________________________________________________________________
//build
RelatedArtefactCell.prototype.build = function(){
	RelatedArtefactCell.__super__.build();
	
	this._image = new Image();
	this._anchor = document.createElement("a");
	$(this._containerElement).append(this._image);
	$(this._containerElement).append(this._anchor);
	$(this._anchor).bind('click',this.onClick.context(this));
};

//destroy
RelatedArtefactCell.prototype.destroy = function(){
	this._$anchor.unbind('click');
	RelatedArtefactCell.__super__.destroy();
};

//setData
RelatedArtefactCell.prototype.setData = function(data,restoreStateObject){
	RelatedArtefactCell.__super__.setData(data,restoreStateObject);
	this._image.src = Globals.ARTEFACT_IMAGES_FOLDER+this._data.id+"_11.jpg";
}



//PRIVATE
//_________________________________________________________________________________
RelatedArtefactCell.prototype.onClick = function(){
	Globals.viewController.onRelatedArtefactClick(this._data);
};
