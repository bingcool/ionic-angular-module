;(function(window, angular, undefined) {
angular.module('ng-self-directives', [])

/**
*hideTabs指令
*隐藏底部的tabs标签栏，可以实现屏幕更大
*用法：
首先
<ion-tabs class="tabs-icon-top tabs-color-active-positive" ng-class="{'tabs-item-hide': $root.hideTabs}">
在<ion-tabs>中要设置ng-class="{'tabs-item-hide': $root.hideTabs}"
tabs-item-hide这个类是原本存在ionic.app.css文件中的，现在只是控制让这个类是否有效，$root.hideTabs这个值决定

然后再一个需要隐藏tabs标签的目标视图设置hide-tabs="true"即可，这个值将会通过$rootScope.hideTabs传递给$root.hideTabs这个变量。

<ion-view view-title="slidings" hide-tabs="true" hide-nav-bar='true'>
*/
.directive('hideTabs', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
        	//在进入目标视图前，获取目标视图的hideTabs的值并赋值给$rootScope.hideTabs
            scope.$on('$ionicView.beforeEnter', function() {
                var watch = scope.$watch(attributes.hideTabs, function(value){
                    	$rootScope.hideTabs = value;
                    	watch();
                });

            });

            //目标视图离开是，$rootScope.hideTabs设置为false
            scope.$on('$ionicView.beforeLeave', function() {
                $rootScope.hideTabs = false;
            });
        }
    };
})

/**
*keyboardshows指令
*用于监听键盘是否活动，解决覆盖输入框问题
*需要依赖键盘插件，所以需要安装键盘插件
*用法：
*<ion-footer-bar keyboardshow  class="bar item-input-inset">
	<span>评论</span>
	<label class="item-input-wrapper ">
	<textarea placeholder="说点什么"></textarea>
	</label>
	<button class="button button-positive">发送</button>  
</ion-footer-bar>
*在底部是一个评论框，一般键盘会把评论框挡住，这个指令可以解决，同时还解决了点击物理返回键时，键盘收回，同时不会返回上一页历史视图的问题。
*注册一个优先级为101的物理返回键事件。
$ionicPlatform.registerBackButtonAction(function (e) {
      e.preventDefault();
      if($ionicHistory.backView()) {
          if($cordovaKeyboard.isVisible()) {
            $cordovaKeyboard.close();
          }else {
            $ionicHistory.goBack();
          }
      }  
  }, 101);
*/
.directive('keyboardshow', function($timeout, $cordovaKeyboard) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            window.addEventListener('native.keyboardshow',function (e){  
           	
           	});
            window.addEventListener('native.keyboardhide',function (e){
                cordova.plugins.Keyboard.isVisible = true;
                //延迟改变键盘状态
                $timeout(function() {
                  cordova.plugins.Keyboard.isVisible = false;
                }, 100);
              
            });

        }
    };
})

/**
*rjHoldActive指令
*定义列表按下产生一种数据动态涟漪效果
可以用在<ion-item>
*/
.directive('rjHoldActive', ['$ionicGesture', '$timeout',function($ionicGesture, $timeout, $ionicBackdrop) {
        return {
            restrict: 'A',
            replace: false,
            link: function(scope, element, iAttrs, controller) {
                $ionicGesture.on("hold", function() {
                    element.addClass('item-dark');
                    //300ms后恢复
                    $timeout(function() {
                        element.removeClass('item-dark');
                    }, 500);
                }, element);

                $ionicGesture.on("click", function() {
                    element.addClass('item-stable');
                    //300ms后恢复
                    $timeout(function() {
                        element.removeClass('item-stable');
                    }, 300);
                }, element);


            }
        };
    }
])

/**
*itemClickRipple指令
*实现列表中的item点击产生波浪涟漪效果
*用法：
<ion-list>
  <ion-item item-click-ripple>
    <img src="../img/mike.png" badge="12">
    <h2>{{item.id}}</h2><p>Nine Inch Nails</p>
    <span class="item-ripple"></span>
  </ion-item>
</ion-list>
*在ion-item中添加item-click-ripple指令，同时设置<span class="item-ripple"></span>
*css样式对应着css文件夹的ripple.css文件
*/

.directive('itemClickRipple',['$ionicGesture','$timeout',function($ionicGesture,$timeout) {
    return {
      scope : false,
      restrict: 'A',
      replace: false,
      link : function(scope, element, attrs, controller) {
        $ionicGesture.on("click", function(e) {
            var itemripple = angular.element(element[0].querySelector("span.item-ripple"));
            // 判断是否存在<span class='item-ripple'></span>
            if(!angular.isDefined(itemripple) || itemripple.length == 0 ) {
                    itemripple = angular.element("<span class='item-ripple'></span>");
                    element.append(itemripple);
              }

            itemripple.removeClass("animate");

            var d = Math.max(element[0].offsetHeight, element[0].offsetWidth);
            // 先设置width和height，不要混合top和left一起设置
            itemripple.css({
              width: d +'px',
              height: d +'px',
            });

            // 获取中心点位置
            var x = e.offsetX - itemripple[0].offsetWidth / 2;
            var y = e.offsetY - itemripple[0].offsetHeight / 2;
            // 设置相对item的绝对位置
            itemripple.css({
              top : y +'px',
              left : x +'px'
            }).addClass('animate');

            // 500秒后移除该类
            $timeout(function() {
              itemripple.removeClass("animate");
            },500)

        }, element);
      }
    };
}]) 

/**
*closePupBackDrop指令
*触摸屏幕弹出框popup
*用法:
*可以用在<ion-content>和<ion-view这些视图大标签。
*<ion-content close-pup-back-drop>
*/
.directive('closePupBackDrop', ['$ionicGesture',function($ionicGesture) {
    return {
        scope: false,//共享父scope
        restrict: 'A',
        replace: false,
        link: function(scope, element, attrs, controller) {
            //要在html上添加触摸事件!
            var  $htmlEl= angular.element(document.querySelector('html'));
            $ionicGesture.on("touch", function(event) {
                if (event.target.nodeName === "HTML" && scope.myPopup.isPopup) {
                    scope.optionsPopup.close();
                    scope.myPopup.isPopup = false;
                }
            },$htmlEl);
        }
    };
}])

/**
*closePopoverBackDrop指令
*触摸屏幕关闭浮层popover
*用法：
<script id="my-popover.html" type="text/ng-template">
      <ion-popover-view close-popover-back-drop>
        <ion-header-bar>
        </ion-header-bar>  
      
        <ion-content>
          <button class="button button-positive outline" ui-sref="tab.dash-slidings">sliding</button>
        </ion-content>
      </ion-popover-view>
    </script>
建议直接绑定在<ion-popover-view close-popover-back-drop>
*/
.directive('closePopoverBackDrop', ['$ionicGesture','$timeout',function($ionicGesture,$timeout) {
        return {
            scope: false,//共享父scope
            restrict: 'A',
            replace: false,
            link: function(scope, element, attrs, controller) {
                //要在html上添加点击事件, 试了很久- -!
                var  $htmlEl= angular.element(document.querySelector('html'));
                $ionicGesture.on("touch", function(event) {
                    if(!scope.popover.isShown()){
                      return false;
                    }else {
                      	$timeout(function() {
                        	scope.popover.hide();
                      		return ;
                   		},50)  
                    }
                  
                },$htmlEl);
            }
        };
}])
/*
*resizeFootBar指令
*自动适应textarea输入框的高度，监听taResize事件
*依赖同文件夹下的elastic.js文件
*在头部要引入elastic.js文件即可，里面是monospaced.elastic模块，但不需要在app的angular.module('starter', ['ionic',...])引入;

用法：
<ion-footer-bar keyboardshow  resize-foot-bar class="bar item-input-inset">
  		<span>评论</span>
  		<label class="item-input-wrapper ">
        	<textarea placeholder="说点什么" style="width:100%;background:#eee;resize:none;" rows='2' msd-elastic ng-model="foo"></textarea>
        </label>
        
    	<button class="button button-positive">发送</button>  
  	</ion-footer-bar>

可以参考https://github.com/bingcool/angular-elastic
resize-foot-bar 是定义的指令，rows='2' msd-elastic ng-model="foo"设置
*/
.directive('resizeFootBar', function(){
   // Runs during compile
   return {
      scope: false,
      restrict: 'A',
      replace: false,
      link: function(scope, element, attrs, controller) {
           //绑定taResize事件
           scope.$on("taResize", function(e,ta) {
               if (!ta) return;
               var taHeight = ta[0].offsetHeight;
               var newFooterHeight = taHeight + 10;
               newFooterHeight = (newFooterHeight > 44 ) ? newFooterHeight : 44;

               //调整ion-footer-bar高度
               element[0].style.height = newFooterHeight + 'px';
           
           });
       }
   };
})

/**
*tabRedPoint指令
*应用于tabs图标的红点信息提醒
*
需要在css文件中设置
.tabs-red-point {
  position: absolute;
  top: 4%;
  right: calc(50% - 16px);
  height: 6px;
  width: 6px;
  border-radius: 3px;
  background-color: red
}
用法：
（1）在tab的标签中使用
<ion-tab class="tab-red-point-account" title="Chats" icon-off="ion-ios-chatboxes-outline" icon-on="ion-ios-chatboxes" ui-sref="tab.chats" tab-red-point='isShowRedPoint'>
说明：设置class="tab-red-point-account"是一个唯一的类，使用时设置成不同于其他tab的类
tab-red-point='isShowRedPoint'中isShowRedPoint是一个变量（可以自己定义，在控制器中对应赋值即可），由控制器的$scope.isShowRedPoint = true,或者false赋值决定是否显示红点
*/
.directive('tabRedPoint', function($compile, $timeout){
   // Runs during compile
   return {
      restrict: 'A', 
      replace: false,
      link: function(scope, element, attrs, controller) {
          var isActive = attrs.tabRedPoint || false;
          var template ="<span ng-class={true:'tabs-red-point',false:''}["+isActive+"]></span>";
          var $class = 'a.'+attrs.class;
          var html = $compile(template)(scope);
          $timeout(function() {
          		//tab标签使用时需要设置css
              	angular.element(document.querySelector($class)).css({
                  	"position":'relative',
            	}).append(html);
          
          },100);
                     
       }
   };
})

/**
*headRedPoint指令
*在顶部导航栏的按钮图标中使用
*用法：
（1）在顶部导航栏按钮图标
<button class="button button-icon" ng-click="popovershow()" head-red-point='isShowRedPoint' ><i class="icon ion-android-notifications"></i></button>
说明：tab-red-point='isShowRedPoint'中isShowRedPoint是一个变量(可以自己定义，在控制器中对应赋值即可)，由控制器的$scope.isShowRedPoint = true,或者false赋值决定是否显示红点
*/
.directive('headRedPoint', function($compile, $timeout){
   // Runs during compile
   return {
      restrict: 'A', 
      replace: false,
      link: function(scope, element, attrs, controller) {
          var isActive = attrs.headRedPoint || false;
          var template ="<span ng-class={true:'tabs-red-point',false:''}["+isActive+"]></span>";
          var html = $compile(template)(scope);
          
          $timeout(function() {
            var test = angular.element(element).parent().append(html)
          },100)
                     
       }
   };
})

/**
*hideShowNavBar指令
*可以用于头部的导航条，当向上滑动屏幕时，头部导航条将会隐藏，向下滑动屏幕时，头部导航条将会显示
*用法：
（1）在ion-view中使用，继承原来的父级头部导航条
<ion-view title="User" hide-back-button="false" hide-nav-bar='false' hide-show-nav-bar>
hide-nav-bar这个指令设置值为false,表示不隐藏父级导航条，直接使用。
然后直接写hide-show-nav-bar指令即可。

（2）隐藏父级原来的导航条，重新定义<ion-head-bar>
<ion-view title="User" hide-back-button="false" hide-nav-bar='true' hide-show-nav-bar>
		<ion-header-bar align-title="center" no-tap-scroll='true' class="bar-positive">
		  	<div class="buttons">
		    	<button class="button button-icon icon ion-android-arrow-back"></button>
		    </div>
		  	<h1 class="title">Title</h1>
		  	<div class="buttons">
		    	<button class="button button-icon icon ion-navicon"></button>
		  	</div>
		</ion-header-bar>
	........
*hide-nav-bar='true'设置为true，在<ion-view>下面重新定义<ion-header-bar>标签内容即可
*
*/
.directive('hideShowNavBar', function($compile, $timeout,$ionicGesture){
   // Runs during compile
   return {
      restrict: 'A', 
      replace: false,
      link: function(scope, element, attrs, controller) {
          // 隐藏原来的导航条，重新定义
          var isHide = attrs.hideNavBar;
          var ionContent = angular.element(angular.element(element).find('ion-content')[0]);
          if(isHide === 'true') {
            var headNavBar = angular.element(angular.element(element).find('ion-header-bar')[0]);
          }else {
            var headNavBar = angular.element(document.querySelectorAll("div.nav-bar-block ion-header-bar"));
            var headItem = angular.element(document.querySelectorAll('ion-header-bar')).find('div');
          }

          var cssUpStyle = {
            '-webkit-transform': "translateY(-100%)",   
            'transform': "translateY(-100%)",
            '-webkit-transition':"500ms all ease",
            'transition':"500ms all ease",
          };

          var cssDownStyle = {
            '-webkit-transform': "translateY(0%)",   
            'transform': "translateY(0%)",
            '-webkit-transition':"500ms all ease",
            'transition':"500ms all ease",
          };

          var css = {
            '-webkit-transform': "",   
            'transform': "",
            '-webkit-transition':"",
            'transition':"",
          };

          $ionicGesture.on('dragup',function(event) {
            if(isHide === 'false') {
              headItem.css(cssUpStyle);
            }
            
            headNavBar.css(cssUpStyle);
            ionContent.css({
              'top':0
            });
          },ionContent);

          $ionicGesture.on('dragdown',function(event) {
            headNavBar.css(cssDownStyle);
            if(isHide === 'false') {
              headItem.css(cssDownStyle);
            }
            ionContent.css({
              'top':'44px'
            });     
          },ionContent);

          scope.$on('$ionicView.beforeLeave', function() {
            headNavBar.css(css);
            if(isHide === 'false') {
              headItem.css(css);
            }
            ionContent.css({
              'top':'44px'
            });
          }); 
                     
       }
   };
});




})(window, angular);