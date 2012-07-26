'use strict';

var ImagePicker = function(element) {
  var $element = this.$element = $(element);  
  element = this.element = $element[0];
  
  var imagePicker = element.imagePicker;
  if (imagePicker) return imagePicker;
  
  var self = element.imagePicker = this;
  
  var viewStack = Pushpop.getViewStackForElement(element);
  
  var $window = $(window['addEventListener'] ? window : document.body);
  
  // Set up the master view.
  var $scrollContentElement = $element.children('.sk-scroll-content');
  var $masterListElement = this.$masterListElement = $('<ul/>').appendTo($scrollContentElement);
  var $masterFooterElement = this.$masterFooterElement = $('<p/>').appendTo($scrollContentElement);
  
  // Set up the detail view.
  var detailViewId = 'ip-detail-view-' + (!!Date['now'] ? Date.now() : +new Date());
  var $detailScrollViewElement = $('<div class="pp-view sk-scroll-view ip-detail-view" data-paging-enabled="true" data-shows-horizontal-scroll-indicator="false" id="' + detailViewId + '"/>').appendTo(viewStack.$element);
  
  var detailScrollView = new ScrollKit.ScrollView($detailScrollViewElement);
  var detailView = this.detailView = new Pushpop.View($detailScrollViewElement);
  
  var viewStack = detailView.getViewStack();
  
  var $detailListElement = this.$detailListElement = $('<ul class="sk-page-container-horizontal"/>').appendTo(detailScrollView.getScrollContent().$element);
  
  // Load the actual high resolution image when the page changes.
  $detailScrollViewElement.bind(ScrollKit.ScrollView.EventType.PageChanged, function(evt) {
    var currentPage = detailScrollView.getCurrentPageIndex();
    var dataSource = self._dataSource;
    
    if (currentPage > dataSource.length - 1) return;
    
    loadImage(dataSource[currentPage]);
    detailView.setTitle((currentPage + 1) + ' of ' + dataSource.length);
  });
  
  // Override default click behavior.
  var didClickThumbnail = false;
  $element.delegate('a', 'click', function(evt) { evt.preventDefault(); });
  $element.delegate('a', 'mousedown touchstart', function(evt) { didClickThumbnail = true; });
  $element.delegate('a', 'mousemove touchmove', function(evt) { didClickThumbnail = false; });
  $element.delegate('a', 'mouseup touchend', function(evt) {
    if (didClickThumbnail) {
      var id = $(this).attr('data-image-id');
      var dataSource = self._dataSource;
      var index = 0;
      var imageData;
      
      for (var i = 0, length = dataSource.length; i < length; i++) {
        if (dataSource[i].id == id) {
          index = i;
          imageData = dataSource[i];
          break;
        }
      }
      
      if (!imageData) return;
      
      loadImage(imageData);
      
      detailScrollView.setCurrentPageIndex(index);
      
      viewStack.push(detailView);
      detailView.setTitle((index + 1) + ' of ' + dataSource.length);
    }
  });
  
  var loadImage = function(imageData) {
    if (!imageData || imageData.isLoaded) return;
    
    var image = new Image();
    var imageUrl = imageData.imageUrl;
    
    image.onload = function(evt) {
      var $detailImageElement = $detailListElement.find('img[data-image-id="' + imageData.id + '"]').first();
      $detailImageElement.attr('src', imageUrl);
      
      imageData.isLoaded = true;
    };
    
    image.src = imageUrl;
  };
};

ImagePicker.prototype = {
  _dataSource: [],
  element: null,
  $element: null,
  $masterListElement: null,
  $masterFooterElement: null,
  $detailListElement: null,
  detailView: null,
  setDataSource: function(dataSource) {
    this._dataSource = dataSource;
    
    var masterListHtml = '';
    var detailListHtml = '';
    
    for (var i = 0, length = dataSource.length; i < length; i++) {
      masterListHtml += '<li><a class="ip-push" href="#" data-image-id="' + dataSource[i].id + '"><img alt="" src="' + dataSource[i].thumbnailUrl + '"/></a></li>';
      detailListHtml += '<li><img class="ip-detail-image" data-image-id="' + dataSource[i].id + '" alt="' + (dataSource[i].title || '') + '" title="' + (dataSource[i].title || '') + '" src="' + dataSource[i].thumbnailUrl + '"/></li>';
    }
    
    this.$masterListElement.html(masterListHtml);
    this.$masterFooterElement.html((dataSource.length) + ' Photos');
    
    this.$detailListElement.html(detailListHtml);
  }
};

$(function() {
  $('.ip-image-picker').each(function(index, element) { new ImagePicker(element); });
});
