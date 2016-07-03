/**
 * products Module
 *
 * Description
 */
angular.module('products.controller', ['ionic'])
	.controller('pdlCtrl', ["$scope", "$rootScope", "$state", "$stateParams", "$timeout", "$ionicHistory", "$ionicTabsDelegate", "$ionicLoading", "$ionicScrollDelegate", "Products",
		function($scope, $rootScope, $state, $stateParams, $timeout, $ionicHistory, $ionicTabsDelegate, $ionicLoading, $ionicScrollDelegate, Products) {


			//商品页配置
			$scope.prosen = {
				//需要显示的搜索条件,以分类筛选不需要显示
				key: null,
				//搜索条件
				paramsKey: $stateParams.key,
				//搜索类型 key||classify
				searchType: $stateParams.searchType,
				placeholder: '搜索商品',
				//搜索框后取消按钮是否显示
				cancel: false,
				//商品列表搜索框是否显示, ws-sort-search是样式名, 其作用是占据一定高度, 设置成空字符串后搜索框占据得高度将消失
				hasSearchHeader: "ws-sort-search",
				//商品是否已全部加载
				hasLoadMore: true,
				curpage: 0,
				products: [],
				//排版模式
				typesetting: {
					mode: true,
					iconFlower: 'icon-sort-flower-outline',
					iconList: 'icon-sort-line'
				},
				showBar: true
			};

			/**
			 * 搜索商品
			 * @param  {[type]} arg       [description]
			 * @param  {[type]} keysearch [description]
			 * @return {[type]}           [description]
			 */
			$scope.search = function(arg, keysearch) {
				$scope.prosen.curpage = 0;
				$scope.prosen.hasLoadMore = true;
				// $ionicLoading.show({
				// 	template: '<ion-spinner  class="spinner-energized" icon="spiral"></ion-spinner>',
				// 	noBackdrop: true,
				// 	hideOnStateChange: true
				// });
				if (keysearch) {
					if (arg.key) {
						$scope.prosen.paramsKey = arg.key;
						console.log(1);
					} else {
						$scope.prosen.paramsKey = arg.key = arg.placeholder;
						console.log(2);
					}
					$scope.prosen.searchType = "key";
					arg.cancel = false;
					$scope.prosen.products = [];
					$ionicScrollDelegate.scrollTop(0);
				} else {
					if ($scope.prosen.searchType == "key") {
						$scope.prosen.paramsKey = $scope.prosen.key = $stateParams.key;
						console.log(3);
					} else {
						$scope.prosen.paramsKey = $stateParams.key;
						console.log(4);
					}
				}

				$scope.searchParams = {
					key: $scope.prosen.paramsKey,
					searchtype: $scope.prosen.searchType,
					curPage: $scope.prosen.curpage
				}

				$scope.loadProducts();
			}

			$scope.loadProducts = function() {
				$scope.searchParams.curPage++;
				Products.getProducts($scope.searchParams).then(function(data) {
					if (data && data.length < 20) {
						$scope.prosen.hasLoadMore = false;
					}
					$scope.prosen.products = $scope.prosen.products.concat(data);
					// $ionicLoading.hide();
				}, function(resp) {
					$rootScope.prompt("error");
				}).finally(function() {
					$scope.$broadcast('scroll.infiniteScrollComplete');
				});

			}

			$scope.swipeMode = function() {
				$scope.prosen.typesetting.mode = $scope.prosen.typesetting.mode ? false : true;
				$ionicScrollDelegate.resize();
			}

			/**
			 * 清空搜索条件
			 * @param  {[type]} arg [description]
			 * @return {[type]}     [description]
			 */
			$scope.clearKey = function(arg) {
				$scope.prosen.key = null;
				$timeout(function() {
					$scope.prosen.cancel = arg;
				}, 5);
				return false;
			}

			/**
			 * 计算好评度
			 * @param  {[type]} arg [description]
			 * @return {[type]}     [description]
			 */
			$scope.goodDegree = function(arg) {
				if (parseInt(arg.productgood) == 0) {
					return 0;
				} else {
					var comment = parseInt(arg.productgood) + parseInt(arg.productwell) + parseInt(arg.productbad);
					var degree = parseFloat(arg.productgood) / parseFloat(comment)
					return Math.round(degree * Math.pow(10, 4)) / Math.pow(10, 2);
				}
			}

			$scope.goDetails = function(pid) {
				$scope.prosen.showBar = false;
				if ($stateParams.backWhere == "tab.home") {
					$state.go("tab.home-product-details", {
						where: 'home',
						id: pid
					});
				} else {
					$state.go("tab.sort-product-details", {
						where: 'sort',
						id: pid
					});
				}
			}

			$scope.back = function() {
				$state.go($stateParams.backWhere);
			}

			$scope.searchSwipe = function(arg) {
				$scope.prosen.cancel = arg;
			}

			$scope.swipeUp = function() {
				$scope.prosen.hasSearchHeader = '';
				$scope.hideClass = 'animate-leave';
			}

			$scope.swipeDown = function() {
				$scope.prosen.hasSearchHeader = "ws-sort-search";
				$scope.hideClass = 'animate-enter';
			}

			$scope.search(null, false);

			$scope.$on("$ionicView.beforeEnter", function() {
				$scope.prosen.showBar = true;
				$ionicTabsDelegate.showBar(false);
			});

			$scope.$on('$ionicView.afterLeave', function() {
				if ($scope.prosen.showBar) {
					$ionicTabsDelegate.showBar(true);
				}
			})
		}
	])
	.controller("pdatildCtrl", ["$scope", "$rootScope", "$state", "$ionicHistory", "$stateParams", "$ionicTabsDelegate", "$ionicLoading", "$ionicSlideBoxDelegate", "$sce", "$timeout", "Products", "Cart", "Setting",
		function($scope, $rootScope, $state, $ionicHistory, $stateParams, $ionicTabsDelegate, $ionicLoading, $ionicSlideBoxDelegate, $sce, $timeout, Products, Cart, Setting) {

			//弹出层背景动画
			$scope.propChooseBack = "ws-choose-back-leave";
			//弹出层动画
			$scope.propChoose = "ws-pdchoose-leave";
			//弹出层后 商品内容动画
			$scope.contentChoose = "pd-content-enter";
			//当前选择的操作， 加入购物车还是购买
			$scope.action = "";
			//已选择的属性
			$scope.choosed = "";
			//
			$scope.cartCount = Cart.count();

			$scope.readyBuy = {
				num: 1,
				product: null,
				chooseProps: [{
					pid: null,
					pname: null,
					pval: {
						vid: null,
			 			vname: null,
			 			price: null
					}
				}]
			}


			$ionicLoading.show({
				template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
				noBackdrop: true,
				hideOnStateChange: true
			});

			Products.getProductDetails($stateParams.id).then(function(data) {
				if (data) {
					$scope.readyBuy.chooseProps = [];
					$scope.readyBuy.product = data;
					$scope.readyBuy.product.detail =  $sce.trustAsHtml($scope.readyBuy.product.productremark.toString());
					for (var i = 0; i < $scope.readyBuy.product.props.length; i++) {
						var _tempProp = $scope.readyBuy.product.props[i];
					 	_tempProp.propvals[0].checked = true;
					 	var chooseprop = {
					 		pid: _tempProp.shuxingid,
					 		pname: _tempProp.shuxingname,
					 		pval: {
					 			vid: _tempProp.propvals[0].shuxinginfoid,
					 			vname: _tempProp.propvals[0].shuangxinginfovalue,
					 			price: _tempProp.propvals[0].price
					 		}	
					 	};
					 	$scope.readyBuy.chooseProps.push(chooseprop);
					 	$scope.choosed  += _tempProp.propvals[0].shuangxinginfovalue;
					 	if(i < $scope.readyBuy.product.props.length - 1) {
					 		$scope.choosed  +=  ",";
					 	}
					 } 
					$ionicSlideBoxDelegate.update();
				} else {
					$rootScope.prompt("error");
				}
			}, function(resp) {
				$rootScope.prompt("error");
			}).finally(function() {
				$ionicLoading.hide();
			});

			$scope.wait = function() {
				Setting.prompt("敬请期待...");
			}

			$scope.goCart = function() {
				if($stateParams.where == "home" || $stateParams.where == "direct") {
					$state.go("tab.home-pd-cart", {where: $stateParams.where, hastabs: false});	
				} else if($stateParams.where == "sort") {
					$state.go("tab.sort-pd-cart", {where: $stateParams.where, hastabs: false});
				} else {
					$ionicHistory.goBack();
				}
			}

			$scope.checkProp = function(prop, item) {
				$scope.readyBuy.chooseProps = [];
				for (var i = 0; i < prop.propvals.length; i++) {
					prop.propvals[i].checked = false;
				}
				item.checked = true;
				$scope.choosed = "";
				for (var i = 0; i < $scope.readyBuy.product.props.length; i++) {
					var _tempProp =  $scope.readyBuy.product.props[i];
					for (var j = 0; j < _tempProp.propvals.length; j++) {
						if(_tempProp.propvals[j].checked) {
							var chooseprop = {
						 		pid: _tempProp.shuxingid,
						 		pname: _tempProp.shuxingname,
						 		pval: {
						 			vid: _tempProp.propvals[j].shuxinginfoid,
						 			vname: _tempProp.propvals[j].shuangxinginfovalue,
						 			price: _tempProp.propvals[j].price
						 		}	
						 	};
						 	$scope.readyBuy.chooseProps.push(chooseprop);

							$scope.choosed  += _tempProp.propvals[j].shuangxinginfovalue;
						 	if(i < $scope.readyBuy.product.props.length - 1) {
						 		$scope.choosed  +=  ",";
						 	}
						 	break;
						}
					}
				 	
				 } 
				 console.log($scope.choosed)
			}

			$scope.popup = function() {
				$scope.propChooseBack = "ws-choose-back-enter";
				$scope.propChoose = "ws-pdchoose-enter";
				$scope.contentChoose = "pd-content-leave";
			}

			/**
			 * 关闭商品属性选择框后执行相应操作
			 * @param  {[type]} arg [description]
			 * @return {[type]}     [description]
			 */
			$scope.close = function(arg){
				$scope.propChoose = 'ws-pdchoose-leave'; 
				$scope.propChooseBack = 'ws-choose-back-leave';
				$scope.contentChoose = "pd-content-enter";
				$scope.contentSize = "pd-content-size-enter";
				switch(arg) {
					case 'addCart':
						Cart.add($scope.readyBuy);
						$scope.cartCount = Cart.count();
					break;
					case 'nowBuy':
						// Setting.prompt("暂不支持");
						Cart.readyBuy($scope, 'mbop_checkAliPayment').then(function() {
							var other = Cart.handleDirectBuy($scope, $scope.readyBuy);
							$scope.buy(other._data, other.total);
						});
					break;
				}
			}

			$scope.toFloat = function(arg) {
                        return parseFloat(arg);
                    }

			$scope.addCart = function() {
				$scope.popup();
				$scope.action = "addCart";
			}
			$scope.nowBuy = function() {
				$scope.popup();
				$scope.action = "nowBuy";
			}
			$scope.blurry = function() {
				$scope.popup();
				$scope.action = 'blurry';
			}

			$scope.buyLess = function() {
				if($scope.readyBuy.num > 1) {
					$scope.readyBuy.num--;
				} else {
					$rootScope.prompt("大人，不能在少了");
				}
			}
			$scope.buyAdd = function() {
				$scope.readyBuy.num++;
			}
			

			$scope.goback = function() {
				$ionicHistory.goBack();
			}

			$scope.$on("$ionicView.beforeEnter", function() {
				$ionicTabsDelegate.showBar(false);
			});

			$scope.$on("$ionicView.afterEnter", function () {
				$scope.cartCount = Cart.count();
			});
		}
	]);