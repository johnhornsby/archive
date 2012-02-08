modules = SEQ.utils.namespace('SEQ.modules')
animate = SEQ.effects.Animate

class modules.Accordion
  
   # initial settings
  @settings = {}
  
  constructor: (@container, options) ->
    
    @applySettings(options)
    @sections = []
    
    for section in @container.find(@settings.selectors.main)
      @sections.push(new modules.AccordionSection(section, @settings))
    
  applySettings: (options) =>
    
    # merge defaults with options
    @settings =
      openDuration: 300
      closeDuration: 300
      selectors:
        main: ".section"
        header: "header"
        inner: ".inner"
        
    $.extend true, @settings, options
    
class modules.AccordionSection
  
  constructor: (@container, @settings) ->
    
    @isOpen = false
    
    $container = $(@container)
    
    @inner = $container.find(@settings.selectors.inner)
    @inner.css
      overflow: "hidden"
    @openHeight = @inner.outerHeight()
      
    @header = $container.find(@settings.selectors.header)
    @header.css
        cursor: "pointer"
    @header.on("click", =>
      if @isOpen 
        @close(200)
      else 
        @open(200)
    )
    
    @close 0
    
  close:(duration) =>
    console.log "close"
    @isOpen = false;
    @inner.css
      height: @inner.outerHeight()       
    setTimeout =>
      animate.To
       target: @inner,
       duration: duration,
       props:
         height: "0px"
    , 1
 
  open: (duration) =>
    console.log "open"    
    @isOpen = true
 
    animate.To
     target: @inner,
     duration: duration,
     props:
       height: "#{@openHeight}px",    
     complete: =>
       @inner.css
        height: "auto" 
        
  