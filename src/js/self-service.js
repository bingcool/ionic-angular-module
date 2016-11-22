;(function(window, angular, undefined) {
angular.module('ng-self-services', [])

/**
*actionImgShow服务
*实现完成图片的放大轮播预览功能。
*依赖于图片放大指令
*用法：
*  
var allimgs = [
      {
        imgsrc: '/img/mike.png'
      },
      {
        imgsrc: '/img/ben.png'
      },
      {
        imgsrc: '/img/adam.jpg'
      },
      {
        imgsrc: '/img/perry.png'
      }

    ];

    $scope.imgs = allimgs;
	
	图片预加载
    var arr = new Array();
    for(var i=0; i<allimgs.length; i++) {

      var img = new Image();

      img.src = allimgs[i].imgsrc;

      img.onload = function(i) {
        arr[i] = img;
      }(i);
      
    }

	//使用该服务
    $scope.onDoubleTap = function($index) {
      actionImgShow.show({
        "larImgs":arr,
        //"larImgs":allimgs 也可以这样子实现没有预加载的图片数组
        "currentImg":$index,
        imgClose : function() {
            actionImgShow.close();
        }
      });
    }

配置项opts
larImgs: 数组arr
currentImg: int
imgClose: fn函数类型
*/

.factory('actionImgShow', ['$ionicLoading','$rootScope','$compile','$ionicBody','$ionicPlatform','$ionicHistory','$timeout',function($ionicLoading,$rootScope,$compile,$ionicBody,$ionicPlatform, $ionicHistory, $timeout) {
	var obj = {
		element: null,
		backbuttonRegistration: null
	};
	var fns = {
		showLargeImg: function(opts) {
			var scope = $rootScope.$new(true);
			angular.extend(scope, {
		      larImgs: null,
		      currentImg: null,
		      imgClose: null
		    },opts ||　{});
				
			var	element = scope.element = $compile('<img-slide-large lar-imgs="larImgs" current-img="{{currentImg}}" img-close="imgClose()"></img-slide-large>')(scope);

			$ionicBody.append(element);

    		actionImgShow.imgIsShow = true;

    		obj.element = element;
			// 返回一个注销该后退按钮动作的函数
			obj.backbuttonRegistration = $ionicPlatform.registerBackButtonAction(function(e) {
		        e.preventDefault();
		        if(actionImgShow.imgIsShow) {
			          actionImgShow.close(); 
			        }else { 
			          if($ionicHistory.backView()) {
			            $ionicHistory.goBack();
			        }
			      }  
		      },102);
		},

		closeLargeImg: function() {
			this.imgIsShow = false;
			obj.element.remove();
			// 执行该注销该后退按钮动作的函数
			if(obj.backbuttonRegistration) {
				obj.backbuttonRegistration();	
			}	
		},
		
	};

	var actionImgShow = {
		imgIsShow: false,
		show: fns.showLargeImg,
		close: fns.closeLargeImg
	};

	return actionImgShow;	
}])

/**
*actionScrollTop服务
*实现浮层按钮的不同的多功能
*用法：
*（1）回到顶部按钮功能
*$scope.doscroll = function() {
    actionScrollTop.showScrollButton({
      'targetView':"#User",
      'getByHandle':"myUserContent"
    });
  }
可配置项opts
position: 'br',string,按钮位置，tl代表顶部左边，tr代表顶部右边，bl代表底部左边，br代表底部右边，默认br
effect:'slidein',string,动画效果，默认slidein
restingIcon:'ion-arrow-up-c',string,按钮初始化图标，根据功能不同修改
activeIcon:'ion-close-round',string,按钮弹出子菜单后的主图标,默认ion-close-round（这里不用改）
togglingMethod:'click',string,'click'|| 'hover'
scrollTop:'true',string,代表是回到顶部功能标志，默认true(不用改)
distance:100,int,滚动条滑动至顶部多少距离开始显示回到顶部图标
targetView:null,string，string,目标视图，在<ion-view>设置一个class或者id
getByHandle:null,string ,<ion-content>的delete-handle句柄

*（2）弹出modal功能
*
*用法：
actionScrollTop.showModal({
    'modalUrl':'my-modal.html',
    'targetView':"#User",
  });
配置项opts
position: 'tr',string,按钮位置，tl代表顶部左边，tr代表顶部右边，bl代表底部左边，br代表底部右边，一般br
effect:'slidein',string,动画效果，默认slidein
activeIcon:'ion-close-round',string,按钮弹出子菜单后的主图标,默认ion-close-round（这里不用改）
restingIcon:'ion-ios-compose',string,按钮初始化图标，根据功能不同修改
togglingMethod:'click',string,'click'|| 'hover'
modalUrl:'my-modal.html',缓存模板的id，eg在模板中<script id="my-modal.html" type="text/ng-template">
targetView:null,string,目标视图，在<ion-view>设置一个class或者id
getByHandle:'modal-'+ Math.random(100,999) 不用改，任意一个值


*（3）状态改变跳转至其他页面
*
*用法：
actionScrollTop.goView({
    'routerStatus':'tab.dash',
    'targetView':"#User",
  });

配置项opts
position: 'tr',string,按钮位置，tl代表顶部左边，tr代表顶部右边，bl代表底部左边，br代表底部右边，一般br
effect:'slidein',string,动画效果，默认slidein
activeIcon:'ion-close-round',string,按钮弹出子菜单后的主图标,默认ion-close-round（这里不用改）
restingIcon:'ion-ios-compose',string,按钮初始化图标，根据功能不同修改
togglingMethod:'click',string,'click'|| 'hover'
routerStatus:'my-modal.html',缓存模板的id，eg在模板中<script id="my-modal.html" type="text/ng-template">
targetView:null,string,目标视图，在<ion-view>设置一个class或者id
getByHandle:'view-'+ Math.random(100,999) 不用改，任意一个值

*
*/

.factory('actionScrollTop', ['$rootScope','$compile','$ionicScrollDelegate', function($rootScope,$compile,$ionicScrollDelegate){
		
		var globle = {
			element: null,
		};
		var fns = {
			//回到顶部按钮功能
			show: function(opts) {
				var tpl = '<nav mfb-menu position="{{position}}" effect="{{effect}}" active-icon="{{activeIcon}}" resting-icon="{{restingIcon}}" toggling-method="{{togglingMethod}}" scroll-top="{{scrollTop}}" target-button={{getByHandle}}>';

				var scope = $rootScope.$new(true);
					angular.extend(scope, {
				      position: 'br',
				      effect:'slidein',
				      activeIcon:'ion-close-round',
				      restingIcon:'ion-arrow-up-c',
				      togglingMethod:'click',
				      scrollTop:'true',
				      distance:100,
				      targetView:null,
				      getByHandle:null
				    },opts ||　{});

				scope.element = $compile(tpl)(scope);

				/*
				*getByHandle代表唯一ion-content的句柄
				*顶部按钮的html元素可以定义一个唯一类
				*在关闭时可以移除该按钮
				*/
				globle.element = 'ul.mfb-'+scope.getByHandle;
		
				/**
				*targetView和getByHandle为两个必设参数。
				*/
				if(!scope.targetView) {
					throw new Error("targetView请设置为一个ion-view的id或者类名");
				};

				if(!scope.getByHandle) {
					throw new Error("getByHandle请设置为一个ion-content的句柄");
				};

				/**
				*获取滚动的top和left位置数据
				*/
				var position = $ionicScrollDelegate.$getByHandle(scope.getByHandle).getScrollPosition();
				
				if(position['top'] > parseInt(scope.distance, 10)) {
					if(!actionScrollTop.isShowScrollButton) {
						angular.element(document.querySelector(scope.targetView)).append(scope.element);
						actionScrollTop.isShowScrollButton = true;
					}	
				}else {
					if(actionScrollTop.isShowScrollButton) {
						actionScrollTop.close();
					}
					
				}

			},
			//弹出modal框页面功能
			showModal: function(opts) {
				var tpl = '<nav mfb-menu position="{{position}}" effect="{{effect}}" active-icon="{{activeIcon}}" resting-icon="{{restingIcon}}" toggling-method="{{togglingMethod}}" modal-url="{{modalUrl}}" target-button={{getByHandle}}>';

				var scope = $rootScope.$new(true);
					angular.extend(scope, {
				      position: 'tr',
				      effect:'slidein',
				      activeIcon:'ion-close-round',
				      restingIcon:'ion-ios-compose',
				      togglingMethod:'click',
				      modalUrl:null,
				      targetView:null,
				      getByHandle:'modal-'+ Math.random(100,999)
				    },opts ||　{});

				scope.element = $compile(tpl)(scope);


				if(!scope.modalUrl) {
					throw new Error("modalUrl请设置modal的模板文件id");
				};

				if(!scope.targetView) {
					throw new Error("targetView请设置为一个ion-view的id或者类名");
				};

				angular.element(document.querySelector(scope.targetView)).append(scope.element);

			},
			//状态改变跳转至另外页面功能
			goView: function(opts) {
				var tpl = '<nav mfb-menu position="{{position}}" effect="{{effect}}" active-icon="{{activeIcon}}" resting-icon="{{restingIcon}}" toggling-method="{{togglingMethod}}" router-status="{{routerStatus}}" target-button={{getByHandle}}>';

				var scope = $rootScope.$new(true);
					angular.extend(scope, {
				      position: 'tl',
				      effect:'slidein',
				      activeIcon:'ion-close-round',
				      restingIcon:'ion-ios-compose',
				      togglingMethod:'click',
				      routerStatus:null,
				      targetView:null,
				      getByHandle:'view-'+ Math.random(100,999)
				    },opts ||　{});

				scope.element = $compile(tpl)(scope);

				if(!scope.routerStatus) {
					throw new Error("routerStatus请设置为一个ui-router的状态");
				};

				if(!scope.targetView) {
					throw new Error("targetView请设置为一个ion-view的id或者类名");
				};

				angular.element(document.querySelector(scope.targetView)).append(scope.element);


			},

			//回到顶部按钮的移除
			close: function() {
				/**
				*移除回到顶部按钮
				*/
				actionScrollTop.isShowScrollButton = false;
				angular.element(document.querySelector(globle.element)).remove();
			}
		};
		/**
		*返回的对象函数
		*/
		var actionScrollTop = {
			'showScrollButton':fns.show,
			'showModal':fns.showModal,
			'goView':fns.goView,
			'close':fns.close,
			'isShowScrollButton':false,
		};

		return actionScrollTop;
}]);


})(window, angular);