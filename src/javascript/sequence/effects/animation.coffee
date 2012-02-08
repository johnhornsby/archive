effects = SEQ.utils.namespace "effects"
getProp = SEQ.utils.browser.CSS3Detection.GetProp

class effects.Animate
      
  @To: (@options) =>
    if getProp("Transition")?
      @css3Animate()
    else
      @jqAnimate()
    
  @jqAnimate: () =>
    
    @options.target.animate(
      @options.props
    , 
      duration : @options.duration
      complete : @options.complete
    )
   
  @css3Animate:() =>

    transitionEndNames =
      WebkitTransition : 'webkitTransitionEnd'
      MozTransition : 'transitionend'
      OTransition : 'oTransitionEnd'
      msTransition : 'msTransitionEnd'
      transition : 'transitionEnd'
           
    target = @options.target.get(0)

    target.addEventListener(transitionEndNames[getProp('Transition')], @onTransitionComplete, false);
   
    for prop, value of @options.props
      target.style["#{getProp('TransitionProperty')}"] = prop
      target.style[prop] = "#{value+@pxMap(prop)}"
      
    target.style["#{getProp('TransitionDuration')}"] = "#{@options.duration / 1000}s"
    target.style["#{getProp('TransitionTimingFunction')}"] = "ease-in-out"
  
  @onTransitionComplete: (e) =>
    target = @options.target.get(0)

    target.style["#{getProp('TransitionProperty')}"] = ""
    target.style["#{getProp('TransitionDuration')}"] = ""
    target.style["#{getProp('TransitionTimingFunction')}"] = "" 
    
    if @options.complete?
      @options.complete.call()
  
  # utility function, returns "px" if obj matches array
  @pxMap: (obj) ->
    for prop in ["left", "right", "top", "bottom", "width", "height"]
      if obj is prop
          return "px"
        else
          return ""