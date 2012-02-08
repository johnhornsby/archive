(function() {
  var animate, modules;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  modules = SEQ.utils.namespace('SEQ.modules');
  animate = SEQ.effects.Animate;
  modules.Accordion = (function() {
    Accordion.settings = {};
    function Accordion(container, options) {
      var section, _i, _len, _ref;
      this.container = container;
      this.applySettings = __bind(this.applySettings, this);
      this.applySettings(options);
      this.sections = [];
      _ref = this.container.find(this.settings.selectors.main);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        section = _ref[_i];
        this.sections.push(new modules.AccordionSection(section, this.settings));
      }
    }
    Accordion.prototype.applySettings = function(options) {
      this.settings = {
        openDuration: 300,
        closeDuration: 300,
        selectors: {
          main: ".section",
          header: "header",
          inner: ".inner"
        }
      };
      return $.extend(true, this.settings, options);
    };
    return Accordion;
  })();
  modules.AccordionSection = (function() {
    function AccordionSection(container, settings) {
      var $container;
      this.container = container;
      this.settings = settings;
      this.open = __bind(this.open, this);
      this.close = __bind(this.close, this);
      this.isOpen = false;
      $container = $(this.container);
      this.inner = $container.find(this.settings.selectors.inner);
      this.inner.css({
        overflow: "hidden"
      });
      this.openHeight = this.inner.outerHeight();
      this.header = $container.find(this.settings.selectors.header);
      this.header.css({
        cursor: "pointer"
      });
      this.header.on("click", __bind(function() {
        if (this.isOpen) {
          return this.close(200);
        } else {
          return this.open(200);
        }
      }, this));
      this.close(0);
    }
    AccordionSection.prototype.close = function(duration) {
      console.log("close");
      this.isOpen = false;
      this.inner.css({
        height: this.inner.outerHeight()
      });
      return setTimeout(__bind(function() {
        return animate.To({
          target: this.inner,
          duration: duration,
          props: {
            height: "0px"
          }
        });
      }, this), 1);
    };
    AccordionSection.prototype.open = function(duration) {
      console.log("open");
      this.isOpen = true;
      return animate.To({
        target: this.inner,
        duration: duration,
        props: {
          height: "" + this.openHeight + "px"
        },
        complete: __bind(function() {
          return this.inner.css({
            height: "auto"
          });
        }, this)
      });
    };
    return AccordionSection;
  })();
}).call(this);
