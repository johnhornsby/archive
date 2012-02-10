var RelatedArtefactCell = function(options){
	ScrollableCell.call(this,options);
	
};
RelatedArtefactCell.prototype = new ScrollableCell();
RelatedArtefactCell.prototype.constructor = RelatedArtefactCell;
RelatedArtefactCell.prototype.supr = ScrollableCell.prototype;