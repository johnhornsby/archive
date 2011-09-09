// JavaScript Document
var Main = function(){
	this._artefactDataManager;
	this._dataManager;
	this._localStorageManager;
	this._viewController;
	//this._planeController;
	
	this._loadedDecrement = 1;
	
	this.init();
};



//PRIVATE
//____________________________________________________________________________________________________
Main.prototype.init = function(){
	this._localStorageManager = new LocalStorageManager();
	Globals.localStorageManager = this._localStorageManager;
	this.load();
};

Main.prototype.load = function(){
	this._dataManager = new DataManager();
	Globals.dataManager = this._dataManager;
	this._artefactDataManager = new ArtefactDataManager();
	Globals.artefactDataManager = this._artefactDataManager;
	this._artefactDataManager.addEventListener("dataLoadComplete",this.onArtefactsLoadDataComplete.context(this));
	this._artefactDataManager.load();
};

Main.prototype.build = function(){
	//var categoryTable = new CategoryTable();
	this._viewController = new ViewController();
	Globals.viewController = this._viewController;
	//this._planeController = new PlaneController(this);
	//this._viewController.setData(window.layout.getArtefactDataManager().getYearCategorisedData());
	//this._viewController.update();
	//this._planeController.activate();
};

Main.prototype.checkLoadedAndReadyToBuild = function(){
	if(this._loadedDecrement>0) return;
	this.build();
};

Main.prototype.onArtefactsLoadDataComplete = function(e){
	this._loadedDecrement--;
	
	
	this.checkLoadedAndReadyToBuild();
	//TODO load keyword array, for now we will process all the data manually, do this before build at the moment, so autocomplete can get array on init
	this._dataManager.gleenKeywords();
	
};





//PUBLIC
//____________________________________________________________________________________________________
Main.prototype.getArtefactDataManager = function(){
	return this._artefactDataManager;
}
/*
Main.prototype.getDataManager = function(){
	return this._dataManager;
};
*/
Main.prototype.getViewController = function(){
	return this._viewController;
}
/*
Main.prototype.getPlaneController = function(){
	return this._planeController;
}
*/