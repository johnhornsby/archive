
var TileEngineConfiguration = function(){
	this.fillMode = 0;
	this.fillPattern = 3;
	this.fillConstraintRect = "0,auto,3,0";
	this.fillConstraintRadius = "auto";
	this.fillConstraintType = 1;
	this.fillContainer;
	this.fillFirstCell = false;
}

TileEngineConfiguration.FILL_MODE_SCREEN = 0;
TileEngineConfiguration.FILL_MODE_FLOOD = 1;

TileEngineConfiguration.FILL_PATTERN_AUTO = 0;
TileEngineConfiguration.FILL_PATTERN_SPIRAL = 1;
TileEngineConfiguration.FILL_PATTERN_LEFT_TO_RIGHT = 2;
TileEngineConfiguration.FILL_PATTERN_TOP_TO_BOTTOM = 3;

TileEngineConfiguration.FILL_CONSTRAINT_TYPE_RECT = 0;
TileEngineConfiguration.FILL_CONSTRAINT_TYPE_RADIUS = 1;
