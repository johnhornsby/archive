class RelatedArtefactCell extends ScrollableCell
  
  _anchor:{}
  _image:{}
  
  constructor: ->
    
    build: ->
      super
      @_image = new Image()
      @_anchor = document.createElement("a")
      $(@_containerElement).append(@_image)
      $(@_containerElement).append(@_anchor)
    
    destroy: ->
      super
    
    setData: (data, restoreStateObject) ->
      super data,restoreStateObject
      @_image.src = Globals.ARTEFACT_IMAGES_FOLDER+@_data.id+"_11.jpg"