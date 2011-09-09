var ArtefactsSelectionConfiguration = function(){
	this.category = ArtefactDataManager.CATEGORY_NONE;
	this.filters = [];
	this.keywordsArray = [];
	this.isFavourite = false;
}

ArtefactsSelectionConfiguration.prototype.clone = function(){
	var asc =  new	ArtefactsSelectionConfiguration();
	asc.category = this.category;
	asc.filters = this.filters.clone();
	asc.keywordsArray = this.keywordsArray.clone();
	asc.isFavourite = this.isFavourite;
	return asc;
}
