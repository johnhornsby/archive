var LocalStorageManager = function(){
	
	//properties
	this._favoursitesLSString;
	this._showInfoOnEnterLSString;
	
	this._alertIncrement = 0;
	
	this.init();
};






//PRIVATE
//__________________________________________________________________________________
LocalStorageManager.prototype.init = function(){
	if(this.hasHTML5LocalStorage()){
		
		this._favoursitesLSString = localStorage.getItem("favourites");
		if(!this._favoursitesLSString){ //in safari no favourites = null
			this._favoursitesLSString = "";
			localStorage.setItem("favourites",this._favoursitesLSString);
		}
		
		this._showInfoOnEnterLSString = localStorage.getItem("showInfoOnEnter");
		if(!this._showInfoOnEnterLSString){ //in safari no favourites = null
			this._showInfoOnEnterLSString = "true";
			localStorage.setItem("showInfoOnEnter",this._showInfoOnEnterLSString);
		}
	}else{
		if(this._alertIncrement === 0){
			alert("Please upgrade your browser, this website uses HTML5 Local Storage");
			this._alertIncrement++;
		}
	}
};

LocalStorageManager.prototype.addArefactFavourite = function(data){
	var idElement = "_"+data.id+"_";
	var id = data.id;
	data.f = 1;
	var idElementIndex = this._favoursitesLSString.indexOf(idElement);
	if(idElementIndex === -1){
		this._favoursitesLSString += idElement;
		localStorage.setItem("favourites",this._favoursitesLSString);
	}else{
		console.log("Failed addArefactFavourite():id already in local storage");
	}
};

LocalStorageManager.prototype.removeArefactFavourite = function(data){
	var idElement = "_"+data.id+"_";
	var length = idElement.length;
	data.f = 0;
	var idElementIndex = this._favoursitesLSString.indexOf(idElement);
	if(idElementIndex > -1){
		this._favoursitesLSString = this._favoursitesLSString.replace(idElement,"");
		localStorage.setItem("favourites",this._favoursitesLSString);
	}else{
		console.log("Failed removeArefactFavourite():can't find favourite id in local storage");
	}
};






//PUBLIC
//__________________________________________________________________________________
LocalStorageManager.prototype.isArtefactSavedAsFavourite = function(data){
	if(this._favoursitesLSString.indexOf("_"+data.id+"_") !== -1){
		return 1;
	}else{
		return 0;
	}
};

LocalStorageManager.prototype.setArtefactFavourite = function(data, b){
	if(b===true){
		this.addArefactFavourite(data);
	}else{
		this.removeArefactFavourite(data);
	}
};

LocalStorageManager.prototype.hasHTML5LocalStorage = function(){
	try{
		return 'localStorage' in window && window['localStorage'] !== null;
	}catch(e){
		return false;	
	}
};

LocalStorageManager.prototype.isShowInfoOnEnter = function(){
	if(this.hasHTML5LocalStorage()){
		if(this._showInfoOnEnterLSString === "true"){
			return true;
		}
	}
	return false;
};

LocalStorageManager.prototype.setShowInforOnEnter = function(b){
	if(this.hasHTML5LocalStorage()){
		if(b === true){
			this._showInfoOnEnterLSString = "true";
		}else{
			this._showInfoOnEnterLSString = "false";
		}
		localStorage.setItem("showInfoOnEnter",this._showInfoOnEnterLSString);
	}
};