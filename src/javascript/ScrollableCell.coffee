class ScrollableCell extends EventDispatcher
  _data:{}
  _x:0
  _y:0
  _parentTableContainer:{}
  _containerElement:{}
  _index:-1
  
  constructor: (options) ->
    @_index = options.index
    @_parentTableContainer = options.containerElement
    @init()
    
  init:->
    @build()
    
  build: ->
    @_containerElement = document.createElement("div")
    $(@_parentTableContainer).append(@_containerElement)
    
  setData: (data,restoreStateObject) ->
    @_data = data
    
  destroy: ->
    @clear
    $(@_containerElement).remove()
    
  clear: ->
    $(@_containerElement).empty()
  
  getX: ->
    @_x
  
  setX: (x) ->
    @_x = x
    @_containerElement.style.left = @_x + "px"
  
  getY: ->
    @_y
  
  setY: (y) ->
    @_y = y
    @_containerElement.style.top = @_y + "px"
    
  setVisible: (dx,dy,x,y) ->
    if b is true
      @_containerElement.style.display = "block"
    else
      @_containerElement.style.display = "none"