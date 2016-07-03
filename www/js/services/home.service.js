;
angular.module('home.service', [])
	.factory("Home", ["$q", "$http", "Setting", function($q, $http, Setting) {
		var s = Setting;

		return {
			getCarousel: function() {
				return $http.jsonp("", {
					params: {

					}
				});
			},

			maybeLike: function() {
				var defer = $q.defer();
				if(localStorage.getItem("maybeLike")) {
					defer.resolve(JSON.parse(localStorage.getItem("maybeLike")));
				} else {
					this.getMaybeLike().then(function(data) {
						defer.resolve(data);
					}, function(resp) {
						defer.reject(resp);
					});
				}

				return defer.promise;
			},

			getMaybeLike: function() {
				var defer = $q.defer();
				// $http.jsonp(s.getUrl("mbpt_maybeLike"), s.handleParams({}))
				s.sendRequest("mbpt_maybeLike", {}, {}).then(function(resp) {
					if(resp.data) {
						localStorage.setItem("maybeLike", JSON.stringify(resp.data));
						defer.resolve(resp.data);
					}
				}, function(resp) {
					s.prompt('获取商品出错');
					defer.reject(resp);
				});
				return defer.promise;
			}
		};
	}]);
