'use strict';

var ImagePicker = function(element) {
  var $element = this.$element = $(element);  
  element = this.element = $element[0];
  
  var imagePicker = element.imagePicker;
  if (imagePicker) return imagePicker;
  
  var $scrollContentElement = $element.children('.sk-scroll-content');
  var $listElement = this.$listElement = $('<ul/>').appendTo($scrollContentElement);
  var $footerElement = this.$footerElement = $('<p/>').appendTo($scrollContentElement);
  
  var self = element.imagePicker = this;
  
  var viewStack = $element.parent()[0].viewStack;
  
  // Set up the detail view.
  var detailViewId = 'ip-detail-view-' + (!!Date['now'] ? Date.now() : +new Date());
  var $detailViewElement = $('<div class="pp-view ip-detail-view" id="' + detailViewId + '"/>').appendTo(viewStack.$element);
  var $detailImageElement = $('<img class="ip-detail-image"/>').appendTo($detailViewElement);
  var detailView = new Pushpop.View($detailViewElement);
  
  // Override default click behavior.
  var didClickThumbnail = false;
  $element.delegate('a', 'click', function(evt) { evt.preventDefault(); });
  $element.delegate('a', 'mousedown touchstart', function(evt) { didClickThumbnail = true; });
  $element.delegate('a', 'mousemove touchmove', function(evt) { didClickThumbnail = false; });
  $element.delegate('a', 'mouseup touchend', function(evt) {
    if (didClickThumbnail) {
      var id = $(this).attr('data-image-id');
      var dataSource = self._dataSource;
      var data;
      
      for (var i = 0, length = dataSource.length; i < length; i++) {
        if (dataSource[i].id == id) {
          data = dataSource[i];
          break;
        }
      }
      
      if (!data) return;
      
      $detailImageElement.attr('src', data.imageUrl);
      $detailImageElement.attr('title', data.title);
      
      viewStack.push(detailView);
    }
  });
  
  // Prevent accidental dragging of links in WebKit.
  $element.find('a').each(function(index, element) { element.draggable = false; });
};

ImagePicker.prototype = {
  _dataSource: [],
  element: null,
  $element: null,
  $listElement: null,
  $footerElement: null,
  imagePickerDetailView: null,
  setDataSource: function(dataSource) {
    this._dataSource = dataSource;
    
    var html = '';
    
    for (var x = 0; x < 10; x++) {
      for (var i = 0, length = dataSource.length; i < length; i++) {
        html += '<li><a class="ip-push" href="#" data-image-id="' + dataSource[i].id + '"><img alt="" src="' + dataSource[i].thumbnailUrl + '"/></a></li>';
      }
    }
    
    this.$listElement.html(html);
    this.$footerElement.html((dataSource.length * 10) + ' Photos');
  }
};

$(function() {
  $('.ip-image-picker').each(function(index, element) { new ImagePicker(element); });
});
