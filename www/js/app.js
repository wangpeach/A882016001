// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a< body >attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, Sort, $rootScope, Home) {
       $ionicPlatform.ready(function() {
              // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
              // for form inputs)
              if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                     cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                     cordova.plugins.Keyboard.disableScroll(true);
              }
              if (window.StatusBar) {
                     // org.apache.cordova.statusbar required
                     StatusBar.styleDefault();
              }
       });
       //app 启动请求分类
       Sort.requestClassify();
       Home.getMaybeLike();
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
       $ionicConfigProvider.tabs.position("bottom");
       $ionicConfigProvider.tabs.style("standard");
       $ionicConfigProvider.backButton.previousTitleText(false).text('');
       $ionicConfigProvider.backButton.icon("ion-ios-arrow-back");
       $ionicConfigProvider.navBar.alignTitle('center');

       // Ionic uses AngularUI Router which uses the concept of states
       // Learn more here: https://github.com/angular-ui/ui-router
       // Set up the various states which the app can be in.
       // Each state's controller can be found in controllers.js
       $stateProvider

       // setup an abstract state for the tabs directive
       .state('tab', {
              url: '/tab',
              abstract: true,
              templateUrl: 'templates/tabs.html',
              controller: "RootCtrl"
       })
       .state("tab.home", {
              url: '/home',
              views: {
                     'tab-home': {
                            templateUrl: "templates/tab-home.html",
                            controller: 'HomeCtrl'
                     }
              }
       })
       // Each tab has its own nav history stack:
       .state('tab.sort', {
              url: '/sort',
              views: {
                     'tab-sort': {
                            templateUrl: 'templates/tab-sort.html',
                            controller: 'SortCtrl'
                     }
              }
       })

       .state('tab.cart', {
              url: '/cart',
              views: {
                     'tab-cart': {
                            templateUrl: 'templates/tab-cart.html',
                            controller: 'CartCtrl'
                     }
              }
       })
       .state('tab.cart-detail', {
              url: '/cart/:cartId',
              views: {
                     'tab-cart': {
                            templateUrl: 'templates/cart-detail.html',
                            controller: 'CartDetailCtrl'
                     }
              }
       })
       //账户主页
       .state('tab.account', {
              url: '/account?where',
              cache:true,
              views: {
                     'tab-account': {
                            templateUrl: 'templates/tab-account.html',
                            controller: 'AccountCtrl'
                     }
              }
       })
       //系统设置
       .state('tab.setting', {
              url: '/account/setting',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/setting.html',
                            controller: 'settingCtrl'
                     }
              }
       })
       //个人资料
       .state('tab.personal', {
              url: '/account/setting/personal',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/personal.html',
                            controller: 'personalCtrl'
                     }
              }
       })
       //收货地址列表
       .state('tab.setting-address', {
              url: '/account/setting/address',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/address.html',
                            controller: 'addrCtrl'
                     }
              }
       })
       //收货地址编辑
       .state('tab.setting-addrconfig', {
              url: '/account/setting/addrconfig/:action/:addr',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/addrconfig.html',
                            controller: 'nowAddrCtrl'
                     }
              }
       })
       //账户管理
       .state('tab.account-upgrade', {
              url: '/account/upgrade',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/upgrade.html',
                            controller: 'upgradeCtrl'
                     }
              }
       })
       //提现 类型选择
       .state('tab.account-apply-choose', {
              url: '/account/apply.choose', 
              views: {
                     'tab-account': {
                            templateUrl: 'templates/apply.choose.html',
                            controller: 'chooseCtrl'
                     }
              }
       })
       //银行卡提现
       .state("tab.account-apply-bank", {
              url: '/account/apply.bank',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/apply.bank.html',
                            controller: 'bankCtrl'
                     }
              }
       })
       //支付宝提现
       .state("tab.account-apply-alipay", {
              url: '/account/apply.alipay',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/apply.alipay.html',
                            controller: 'alipayCtrl'
                     }
              }
       })
       //提现成功
       .state("tab.account-apply-res", {
              url: '/account/apply.res',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/apply.res.html'
                     }
              }
       })
       //体现说明
       .state("tab.account-apply-explain", {
              url: '/account/apply.explain',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/apply.explain.html'
                     }
              }
       })
       //白积分明细
       .state("tab.point-white-list", {
              url: '/point/white.list/:refresh',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/point.white.list.html',
                            controller: 'whiteListCtrl'
                     }
              }
       })
       //白积分提现
       .state("tab.point-white-recharge", {
              url: '/point/white.recharge',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/point.white.recharge.html',
                            controller: 'whiteRechargeCtrl'
                     }
              }
       })
       //白积分体现成功
       .state("tab.proint-white-resuc", {
              url: '/point/white.resuc',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/point.white.success.html',
                            controller: 'whiteResucCtrl'
                     }
              }
       })
       //红积分列表
       .state("tab.point-red-list", {
              url: '/point/red.list/:refresh',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/point.red.list.html',
                            controller: 'redListCtrl'
                     }
              }
       })
       //红积分兑换
       .state("tab.point-red-exchange", {
              url: '/point/red.exchange',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/point.red.exchange.html',
                            controller: 'redExchangeCtrl'
                     }
              }
       })
       //红积分兑换成功
       .state("tab.point-red-resuc", {
              url: '/point/red.resuc',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/point.red.success.html'
                     }
              }
       })
       //资金明细列表
       .state("tab.assets-list", {
              url: '/account/assets.list',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/assets.list.html',
                            controller: 'assetsCtrl'
                     }
              }
       })
       //我的推荐人
       .state("tab.mychilds-list", {
              url: '/account/mychilds.list',
              cache: false,
              views: {
                     'tab-account': {
                            templateUrl: 'templates/mychilds.list.html',
                            controller: 'childCtrl'
                     }
              }
       })
       //我的二维码
       .state("tab.mycode", {
              url: '/account/mycode',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/mycode.html',
                            controller: 'codeCtrl'
                     }
              }
       })
       .state('tab.home-products-list', {
              url: '/home/products/:backWhere/:searchType/:key',
              views: {
                     'tab-home': {
                            templateUrl: 'templates/products.list.html',
                            controller: 'pdlCtrl'
                     }
              }
       })
       .state('tab.sort-products-list', {
              url: '/sort/products/:backWhere/:searchType/:key',
              views: {
                     'tab-sort': {
                            templateUrl: 'templates/products.list.html',
                            controller: 'pdlCtrl'
                     }
              }
       })
       .state('tab.home-product-details', {
              url: '/home/productDetails/:where/:id',
              views: {
                     'tab-home': {
                            templateUrl: 'templates/product.details.html',
                            controller: 'pdatildCtrl'
                     }
              }
       })
       .state('tab.sort-product-details', {
              url: '/sort/productDetails/:where/:id',
              views: {
                     'tab-sort': {
                            templateUrl: 'templates/product.details.html',
                            controller: 'pdatildCtrl'
                     }
              }
       })
       .state('tab.cart-product-details', {
              url: '/cart/productDetails/:where/:id',
              views: {
                     'tab-cart': {
                            templateUrl: 'templates/product.details.html',
                            controller: 'pdatildCtrl'
                     }
              }
       })
       .state('tab.home-pd-cart', {
              url: '/home/pdcart/:where/:hastabs',
              views: {
                     'tab-home': {
                            templateUrl: 'templates/tab-cart.html',
                            controller: 'CartCtrl'
                     }
              }
       }).state('tab.sort-pd-cart', {
              url: '/sort/pdcart/:where/:hastabs', 
              views: {
                     'tab-sort': {
                            templateUrl: 'templates/tab-cart.html',
                            controller: 'CartCtrl'
                     }
              }
       })
       .state('tab.myorder', {
              url: '/order/all',
              views: {
                     'tab-account': {
                            templateUrl: 'templates/myorder.html',
                            controller: 'myorderCtrl'
                     }
              }
       });

       // if none of the above states are matched, use this as the fallback
       $urlRouterProvider.otherwise('/tab/home');
});
