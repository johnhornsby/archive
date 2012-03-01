var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var CSSSpriteEngine = (function() {
  CSSSpriteEngine.prototype.$container = {};
  CSSSpriteEngine.prototype.frameWidth = 0;
  CSSSpriteEngine.prototype.frameHeight = 0;
  CSSSpriteEngine.prototype.totalFrames = 0;
  CSSSpriteEngine.prototype.loop = false;
  CSSSpriteEngine.prototype.autoPlay = true;
  CSSSpriteEngine.prototype.$spriteSheetImage = {};
  CSSSpriteEngine.prototype.url = "";
  CSSSpriteEngine.prototype.isloaded = false;
  CSSSpriteEngine.prototype.imageWidth = 0;
  CSSSpriteEngine.prototype.imageHeight = 0;
  CSSSpriteEngine.prototype.image = {};
  CSSSpriteEngine.prototype.currentFrame = 1;
  CSSSpriteEngine.prototype.updateTimer = {};
  CSSSpriteEngine.prototype.isPlaying = false;
  /*
        @param {jQuery}  container  The main container
        @param {Object}  options    User-defined options
      */
  function CSSSpriteEngine(container, options) {
    this.$container = container;
    this.url = options.url;
    this.frameWidth = options.frameWidth;
    this.frameHeight = options.frameHeight;
    this.totalFrames = options.totalFrames;
    this.loop = options.loop;
    this.autoPlay = options.autoPlay;
    this.onReadyCallback = options.onReady;
    this.init();
  }
  CSSSpriteEngine.prototype.init = function() {
    this.build();
    return this.load();
  };
  CSSSpriteEngine.prototype.build = function() {
    this.$container.css("position", "relative");
    this.$container.css("width", this.frameWidth);
    return this.$container.css("height", this.frameHeight);
  };
  CSSSpriteEngine.prototype.load = function() {
    this.image = new Image();
    this.$spriteSheetImage = $(this.image);
    this.$spriteSheetImage.bind("load", __bind(function(e) {
      return this.loadComplete();
    }, this));
    return this.$spriteSheetImage.attr("src", this.url);
  };
  CSSSpriteEngine.prototype.loadComplete = function(e) {
    this.isloaded = true;
    this.imageWidth = this.image.width;
    this.imageHeight = this.image.height;
    this.$container.css("backgroundImage", "url(" + this.url + " )");
    this.positionSpriteSheet(this.currentFrame);
    if (this.autoPlay === true) {
      this.play(this.currentFrame);
    }
    return this.onReadyCallback();
  };
  CSSSpriteEngine.prototype.positionSpriteSheet = function(frame) {
    var col, maxCols, row, x, y;
    maxCols = this.imageWidth / this.frameWidth;
    row = Math.ceil(frame / maxCols) - 1;
    col = (frame - (row * maxCols)) - 1;
    x = -(col * this.frameWidth);
    y = -(row * this.frameHeight);
    return this.$container.css("backgroundPosition", "" + x + "px " + y + "px");
  };
  CSSSpriteEngine.prototype.update = function() {
    this.currentFrame++;
    this.validateCurrentFrame();
    this.positionSpriteSheet(this.currentFrame);
    if (this.currentFrame === this.totalFrames && this.loop === false) {} else {
      return this.updateTimer = setTimeout((__bind(function() {
        return this.update();
      }, this)), 33);
    }
  };
  CSSSpriteEngine.prototype.validateCurrentFrame = function() {
    if (this.currentFrame < 1) {
      this.currentFrame = this.totalFrames;
    }
    if (this.currentFrame > this.totalFrames) {
      return this.currentFrame = 1;
    }
  };
  CSSSpriteEngine.prototype.onReadyCallback = function() {};
  /* PUBLIC
  _________________________________________________________________________________*/
  CSSSpriteEngine.prototype.play = function(frame) {
    if (frame == null) {
      frame = 1;
    }
    if (this.isLoaded === false) {
      return false;
    }
    if (this.isPlaying === false) {
      this.isPlaying = true;
    } else {
      clearTimeout(this.updateTimer);
    }
    this.currentFrame = frame - 1;
    return this.update();
  };
  CSSSpriteEngine.prototype.pause = function() {
    if (this.isPlaying === true) {
      this.isPlaying = false;
      return clearTimeout(this.updateTimer);
    }
  };
  CSSSpriteEngine.prototype.stop = function() {
    this.pause();
    return this.currentFrame = 1;
  };
  return CSSSpriteEngine;
})();
