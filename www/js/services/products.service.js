/**
* products.service Module
*
* Description
*/
angular.module('products.service', [])
.factory('Products', ["$http", "$q", "Setting", function($http, $q, Setting) {
	var s = Setting;
	var products = {
		getProducts: function(arg) {
			var defer = $q.defer();
			$http.jsonp(s.getUrl('mbpt_getProducts'), s.handleParams(arg))
			.then(function(resp) {
				defer.resolve(resp.data);
			}, function(resp) {
				defer.reject(resp);
			})
			return defer.promise;
		},

		getProductDetails: function(pid) {
			var defer = $q.defer(), _this = this;
			var params = {
				pid: pid
			}
			$http.jsonp(s.getUrl("mbpt_productDetails"), s.handleParams(params))
			.then(function(resp) {
				var data = resp.data;
				var result = {};
				if(data && data.state == "ok") {
					result = data.data;
					result.gallery = _this.handleGallery(result);
					defer.resolve(result);
				} else {
					defer.reject("error");
				}
			}, function(resp) {
				defer.reject(resp)
			});
			return defer.promise;
		},

		handleGallery: function(arg) {
			var gallery = new Array();
			if(arg.productphoto) {
				var galls = arg.productphoto.split("-");
				for (var i = 0; i < galls.length; i++) {
					gallery.push(galls[i].split("|")[0]);
				}
			} else {
				gallery.push(arg.productimgurl);
			}
			return gallery;
		}
	};
	return products;
}]);