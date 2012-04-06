'use strict';

var ImagePicker = function(element) {
  var $element = this.$element = $(element);  
  element = this.element = $element[0];
  
  var imagePicker = element.imagePicker;
  if (imagePicker) return imagePicker;
  
  var self = element.imagePicker = this;
  var viewStack = $element.parent()[0].viewStack;
  
  // Set up the master view.
  var $scrollContentElement = $element.children('.sk-scroll-content');
  var $masterListElement = this.$masterListElement = $('<ul/>').appendTo($scrollContentElement);
  var $masterFooterElement = this.$masterFooterElement = $('<p/>').appendTo($scrollContentElement);
  
  // Set up the detail view.
  var detailViewId = 'ip-detail-view-' + (!!Date['now'] ? Date.now() : +new Date());
  var $detailScrollViewElement = $('<div class="pp-view sk-scroll-view ip-detail-view" data-paging-enabled="true" data-shows-horizontal-scroll-indicator="false" id="' + detailViewId + '"/>').appendTo(viewStack.$element);
  
  var detailScrollView = new SKScrollView($detailScrollViewElement);
  var detailView = new Pushpop.View($detailScrollViewElement);
  
  var $detailListElement = this.$detailListElement = $('<ul class="sk-page-container-horizontal"/>').appendTo(detailScrollView.content.$element);
  //var $detailImageElement = $('<img class="ip-detail-image"/>').appendTo(detailScrollView.content.$element);
  
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
      
      // $detailImageElement.attr('src', data.imageUrl);
      //  $detailImageElement.attr('title', data.title);
      
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
  $masterListElement: null,
  $masterFooterElement: null,
  $detailListElement: null,
  imagePickerDetailView: null,
  setDataSource: function(dataSource) {
    this._dataSource = dataSource;
    
    var masterListHtml = '';
    var detailListHtml = '';
    
    for (var i = 0, length = dataSource.length; i < length; i++) {
      masterListHtml += '<li><a class="ip-push" href="#" data-image-id="' + dataSource[i].id + '"><img alt="" src="' + dataSource[i].thumbnailUrl + '"/></a></li>';
      detailListHtml += '<li><img class="ip-detail-image" data-image-id="' + dataSource[i].id + '" src="' + dataSource[i].thumbnailUrl + '"/></li>';
    }
    
    this.$masterListElement.html(masterListHtml);
    this.$masterFooterElement.html((dataSource.length) + ' Photos');
    
    this.$detailListElement.html(detailListHtml);
  }
};

$(function() {
  $('.ip-image-picker').each(function(index, element) { new ImagePicker(element); });
});
