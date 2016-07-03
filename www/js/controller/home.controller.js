angular.module("home.controller", ["ionic"])
	.controller('HomeCtrl', ["$scope", "$state", "$ionicScrollDelegate", "$timeout", "$window", "$ionicTabsDelegate", "$ionicLoading", "Setting", "Home",
		function($scope, $state, $ionicScrollDelegate, $timeout, $window, $ionicTabsDelegate, $ionicLoading, Setting, Home) {

		$scope.searchSender = {
			key: null,
			placeholder: '搜索商品'
		}

		$scope.search = function(arg) {
			if(!arg.key) {
				arg.key = $scope.searchSender.placeholder;
			}
			$state.go('tab.home-products-list', {backWhere: 'tab.home', searchType: 'key', key: arg.key});
		}

		$scope.doRefresh = function() {
			$scope.bullentin = [{
				name: '公告',
				brief: '悦诗风'
			}, {
				name: '公告',
				brief: '悦诗风'
			}, {
				name: '公告',
				brief: '悦诗风'
			}, {
				name: '公告',
				brief: '悦诗风'
			}, {
				name: '公告',
				brief: '悦诗风'
			}, {
				name: '公告',
				brief: '悦诗风'
			}, {
				name: '公告',
				brief: '悦诗风'
			}];

			$timeout(function() {
				var swiper = new Swiper('.slide-txt', {
					autoplay: 3000,
					autoplayDisableOnInteraction: true,
					direction: 'vertical'
				});
			}, 500);
		};

		$scope.loadMaybeLike = function() {
			Home.maybeLike().then(function(data) {
				$scope.products = data;
			});
		}

		$scope.varificationModel = function(open, arg) {
			if (open) {
				$state.go(arg, arg);
			} else {
				Setting.prompt(arg);
			}
		}

		$scope.doRefresh();
		$scope.loadMaybeLike();

		$scope.$on("$ionicView.enter", function () {
			var adh = $window.innerWidth * 0.35 + 'px'; 
			$scope.ad_height = {
				height: adh
			};
			$ionicTabsDelegate.showBar(true);
		});


	}])
