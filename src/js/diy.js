;(function(window, angular, undefined) {
angular.module('ng-self-service-directives', [])
/**
*图片放大滑动预览指令集
*缓存模板：ng-img-slide-large.html
*指令：imgSlideLarge ，实现图片的预览
*指令：imgShow，实现图片放大功能
*依赖的css: img.enable.show.css
*/

/**
*缓存模板
*<div class="bar bar-footer img-bar-footer">可以自定义
*
*/
.run(['$templateCache', function($templateCache) {
    $templateCache.put('ng-img-slide-large.html',
      '<div class="action-img-backdrop active" ng-click="imgClose()">'+
          '<div class="img-sheet-wrapper large-img-group">'+
              '<ion-slide-box class="img-slide-box" show-pager="false" active-slide="imgActiveSlide" delegate-handle="slide-imgs-large" on-slide-changed="slideImgChange($index)">'+
              '<ion-slide class="img-slide" img-show ng-repeat="largeImg in larImgs">'+
              '</ion-slide>'+ 
              '</ion-slide-box>'+
          '</div>'+
          '<div class="bar bar-footer img-bar-footer">'+
              '<div class="row">'+
                '<div class="col" style="color:#ffffff">{{currentLargeImg}}/{{imgsNum}}</div>'+
                '<div class="col"></div>'+
                '<div class="col"></div>'+
                '<div class="col" style="color:#ffffff">保存图片</div>'+
              '</div>'+
          '</div>'+             
      '</div>'
    );           
}])

/**
*imgSlideLarge指令
*指令获取从控制器传过来的参数。
*acope的参数：
*larImgs：要轮播的图片的数组数据
*currentImg：当前点击的图片的第几个数
*imgClose：绑定至控制器的关闭函数
*/
.directive('imgSlideLarge', ['$rootScope','$timeout', function($rootScope, $timeout) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      scope: {
        larImgs: '=',
        currentImg: '@',
        imgClose: '&',
      },
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'ng-img-slide-large.html';
      },
      controller: ['$scope', '$attrs','$timeout','$ionicPlatform', function($scope, $attrs, $timeout, $ionicPlatform) {
        if($scope.currentImg != undefined)  {
          $scope.imgActiveSlide = $scope.currentImg;
          $scope.currentLargeImg = parseInt($scope.currentImg) + 1; 
        }

        // slide的总个数
        $scope.imgsNum = $scope.larImgs.length;

        $scope.slideImgChange = function($index) {
          $scope.currentLargeImg = $index+1;
        }

      }],
    };
}])

/**
*imgShow指令
*实现双指捏放的放大和缩小功能。
*
*/
.directive('imgShow',['$compile','$timeout',function($compile, $timeout) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: false,
      scope:false,
      link:function($scope,$element,$attrs) {
        if($scope.largeImg.imgsrc != undefined) {
       	 	//图片的数组，没有预加载。 
          angular.element($element).append('<img src='+$scope.largeImg.imgsrc+'>').css({
            "background-color":"rgba(5, 5, 5, 5.96)"
          });
        }else {
        	//预加载图片数据
          angular.element($element).append($scope.largeImg).css({
            "background-color":"rgba(5, 5, 5, 5.96)"
          });
        }

        angular.element(document.querySelector('div.img-bar-footer')).css({
          'height':"20%",
          'background-color':"rgb(5, 5, 5)",
          "background-size":'100% 0'
        });
        /**
        *每一个slider的宽度、高度(即图片宽度、高度)
        */
        var slideWidth = $element[0].offsetWidth;
        var slideHeight = $element[0].offsetHeight;
        /**
        *slide-box的宽度、高度
        */
        // var slideBoxWidth = $('.slider-slides').width();
        // var slideBoxHeight = $('.slider-slides').height();
        var slideBoxWidth = document.querySelector('.slider-slides').style.width;
        var slideBoxHeight = document.querySelector('.slider-slides').style.width;
        /**
        *创建一个hammer对象
        */
        var hammer = new Hammer(angular.element($element)[0]);
            hammer.get('pinch').set({ enable: true });
            hammer.add(new Hammer.Pinch());

        /**
        *捏开点监听
        */
        hammer.on("pinchout", function (e) {
            var scale = 2;
            //捏开点
            var pinchX = e.center.x;
            var pinchY = e.center.y;

            var translateX = (pinchX / scale) * -1 + 20;
            var translateY = (pinchY / scale) * -1 + 20;
 
            //为slide-box的宽度添加一个slideWith宽度，防止溢出，因为放大一倍
            if(!angular.element(document.querySelector('.slider-slides')).hasClass('slide-change-width')) {
              angular.element(document.querySelector('.slider-slides')).css({
                "width":slideBoxWidth + slideWidth * (scale - 1)+'px'
              });
              angular.element(document.querySelector('.slider-slides')).addClass('slide-change-width');
            }

            /**
            *放大动画
            */
            $timeout(function() {
              angular.element($element).css({
                "transformOrigin":"0% 0%",
                "-webkit-transform":"scale("+scale+","+scale+") translate("+translateX+"px, "+translateY+"px)",
                "transform":"scale("+scale+","+scale+") translate("+translateX+"px, "+translateY+"px)",
                "transition": "all 200ms ease-out",
              });
            },100);

            // 设置footer透明度等于0.2
            angular.element(document.querySelector('div.img-bar-footer')).css({
              "opacity":"0.2",
            });
        });
        
        /**
        *捏合缩小，回弹原来大小
        */
        hammer.on("pinchin", function (e) {
            angular.element($element).css({
              "transformOrigin":"50% 50%",
              "transform":"scale(0.8,0.8) translate(0,0)",
              "width":slideWidth+'px',
              "transition": "all 200ms ease-in",
            });
            // 设置footer不透明
            angular.element(document.querySelector('div.img-bar-footer')).css({
              "opacity":"1",
            });
        });

      }
    }
}])

/**
*基于material design的多功能浮动按钮服务指令集
*缓存模板：ng-mfb-menu-default.tpl.html
*指令：mfbButtonClose
*指令：mfbMenu
*指令：mfbButton
*依赖的css: mfb.css
*/

/**
*
*
*
*
*/
.run(['$templateCache', function($templateCache) {
    $templateCache.put('ng-mfb-menu-default.tpl.html',
      '<ul class="mfb-component--{{position}} mfb-{{targetButton}} mfb-{{effect}}"' +
      '    data-mfb-toggle="{{togglingMethod}}" data-mfb-state="{{menuState}}" data-mfb-single="{{single}}">' +
      '  <li class="mfb-component__wrap">' +
      '    <a ng-click="clicked()" ng-mouseenter="hovered()" ng-mouseleave="hovered()"' +
      '       ng-attr-data-mfb-label="{{label}}" class="mfb-component__button--main">' +
      '     <i class="mfb-component__main-icon--resting {{resting}}"></i>' +
      '     <i class="mfb-component__main-icon--active {{active}}"></i>' +
      '    </a>' +
      '    <ul class="mfb-component__list" ng-transclude>' +
      '    </ul>' +
      '</li>' +
      '</ul>'
    );

    $templateCache.put('ng-mfb-button-default.tpl.html',
      '<li>' +
      '  <a data-mfb-label="{{label}}" class="mfb-component__button--child">' +
      '    <i class="mfb-component__child-icon {{icon}}">' +
      '    </i>' +
      '  </a>' +
      '</li>'
    );

}])

.directive('mfbButtonClose', [function() {
    return {
      restrict: 'A',
      require: '^mfbMenu',
      link: function($scope, $element, $attrs, mfbMenuController) {
        $element.bind('click', function() {
          /**
          *mfbMenuController是指令mfbMenu的控制器作用域
          *close()函数是来自于mfbMenuController中的this.close = fns.close;
          */
          mfbMenuController.close();
        });
      },
    };

}])

.directive('mfbMenu', ['$rootScope','$timeout','$ionicModal','$ionicScrollDelegate','$window', function($rootScope, $timeout, $ionicModal,$ionicScrollDelegate, $window) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      scope: {
        position: '@',
        effect: '@',
        label: '@',
        resting: '@restingIcon',
        active: '@activeIcon',
        mainAction: '&',
        menuState: '=?',
        togglingMethod: '@',
        targetButton:'@',
        modalUrl: '@',
        routerStatus:'@',
        scrollTop: '@'
      },
      templateUrl: function(elem, attrs) {
        return attrs.templateUrl || 'ng-mfb-menu-default.tpl.html';
      },
      controller: ['$scope', '$attrs','$state', function($scope, $attrs,$state) {
        if($scope.modalUrl === undefined && $scope.scrollTop === undefined && $scope.routerStatus === undefined) {
            // 定义函数对象
            var fns = {
                  clicked: function clicked() {
                            if($scope.mainAction) {
                                $scope.mainAction();
                              }
                              if(!fns.isHoverActive()) {
                                fns.toggle();
                              }
                          },

                  hovered: function hovered() {
                            if(fns.isHoverActive()) {
                                  //toggle();
                              }
                          },

                  /**
                  * 根据当前菜单的状态切换按钮
                  */
                  toggle: function toggle() {
                            if($scope.menuState === openState) {
                              fns.close();
                              // $ionicBackdrop.release();
                            }else {
                              fns.open();
                              // $ionicBackdrop.retain();
                            }
                          },

                  open: function open() {
                            $scope.menuState = openState;
                          },

                  close: function close() {
                            $scope.menuState = closedState;
                          },

                  /**
                  * Check if we're on a touch-enabled device.
                  * Requires Modernizr to run, otherwise simply returns false
                  */
                  isTouchDevice: function _isTouchDevice() {
                            return window.Modernizr && Modernizr.touch;
                          },

                  isHoverActive: function _isHoverActive() {
                            return $scope.togglingMethod === 'hover';
                          },

                  /**
                  * Convert the toggling method to 'click'.
                  * This is used when 'hover' is selected by the user
                  * but a touch device is enabled.
                  */
                  useClick: function useClick() {
                              $scope.$apply(function() {
                                $scope.togglingMethod = 'click';
                              });
                          }

            };

            var openState = 'open',closedState = 'closed';
            /**将当前的函数绑在this中，即该作用域控制器将对外暴露的函数，
            *可以在其他的作用域使用该函数
            */
            this.toggle = fns.toggle;
            this.close = fns.close;
            this.open = fns.open;

            $scope.clicked = fns.clicked;
            $scope.hovered = fns.hovered;

            /**
            * 判定当前状态
            */
            if(!$scope.menuState) {
              $scope.menuState = closedState;
            }

            /**
            * If on touch device AND 'hover' method is selected:
            * wait for the digest to perform and then change hover to click.
            */
            if(fns.isTouchDevice() && fns.isHoverActive()) {
              $timeout(fns.useClick);
            }

            $attrs.$observe('menuState', function() {
              $scope.currentState = $scope.menuState;
            });

            //监听，转态改变时，关闭弹出菜单。
            $rootScope.$on('$stateChangeSuccess', function() { 
                fns.close();
            });

          }else if($scope.modalUrl) {
              this.template = $scope.modalUrl;
              $ionicModal.fromTemplateUrl(this.template, {
                scope: $scope,
                focusFirstInput:true,
                animation: 'slide-in-up'
              }).then(function(modal) {
                $scope.modal = modal;
              });

              $scope.clicked = function() {
                $scope.modal.show(); 
              };
          }else if($scope.scrollTop) {
              $scope.clicked = function() {
                $ionicScrollDelegate.scrollTop(true);
              };
          }else if($scope.routerStatus) {
            
            $scope.clicked = function() {
              $state.go($scope.routerStatus);
            };
          }

        }]
    };
}])

.directive('mfbButton', [function() {
    return {
      require: '^mfbMenu',
      restrict: 'EA',
      transclude: true,
      replace: true,
      scope: {
        icon: '@',
        label: '@',
        menuState: '='
      },
      templateUrl: function(elem, attrs) {
        return attrs.templateUrl || 'ng-mfb-button-default.tpl.html';
      }
    };
}]);

})(window, angular);