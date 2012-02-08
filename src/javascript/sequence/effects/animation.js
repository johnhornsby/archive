(function() {
  var effects, getProp;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  effects = SEQ.utils.namespace("effects");
  getProp = SEQ.utils.browser.CSS3Detection.GetProp;
  effects.Animate = (function() {
    function Animate() {
      this.Animate = __bind(this.Animate, this);
      this.Animate = __bind(this.Animate, this);
      this.Animate = __bind(this.Animate, this);
      this.Animate = __bind(this.Animate, this);
    }
    Animate.To = function(options) {
      this.options = options;
      if (getProp("Transition") != null) {
        return this.css3Animate();
      } else {
        return this.jqAnimate();
      }
    };
    Animate.jqAnimate = function() {
      return this.options.target.animate(this.options.props, {
        duration: this.options.duration,
        complete: this.options.complete
      });
    };
    Animate.css3Animate = function() {
      var prop, target, transitionEndNames, value, _ref;
      transitionEndNames = {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        OTransition: 'oTransitionEnd',
        msTransition: 'msTransitionEnd',
        transition: 'transitionEnd'
      };
      target = this.options.target.get(0);
      target.addEventListener(transitionEndNames[getProp('Transition')], this.onTransitionComplete, false);
      _ref = this.options.props;
      for (prop in _ref) {
        value = _ref[prop];
        target.style["" + (getProp('TransitionProperty'))] = prop;
        target.style[prop] = "" + (value + this.pxMap(prop));
      }
      target.style["" + (getProp('TransitionDuration'))] = "" + (this.options.duration / 1000) + "s";
      return target.style["" + (getProp('TransitionTimingFunction'))] = "ease-in-out";
    };
    Animate.onTransitionComplete = function(e) {
      var target;
      target = this.options.target.get(0);
      target.style["" + (getProp('TransitionProperty'))] = "";
      target.style["" + (getProp('TransitionDuration'))] = "";
      target.style["" + (getProp('TransitionTimingFunction'))] = "";
      if (this.options.complete != null) {
        return this.options.complete.call();
      }
    };
    Animate.pxMap = function(obj) {
      var prop, _i, _len, _ref;
      _ref = ["left", "right", "top", "bottom", "width", "height"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        prop = _ref[_i];
        if (obj === prop) {
          return "px";
        } else {
          return "";
        }
      }
    };
    return Animate;
  })();
}).call(this);
