angular.module("cart.controller", ["ionic"])
    .controller('CartCtrl', ['$scope', '$timeout', '$stateParams', '$ionicTabsDelegate', '$rootScope', '$ionicLoading', '$ionicPopup', 'Cart', 'Account', 'Setting',
        function($scope, $timeout, $stateParams, $ionicTabsDelegate, $rootScope, $ionicLoading, $ionicPopup, Cart, Account, Setting) {



            $scope.getUrl = function(pid) {
                if ($stateParams.where) {
                    if ($stateParams.where == "home") {
                        return "#/tab/home/productDetails/home/" + pid;
                    } else {
                        return "#/tab/sort/productDetails/sort/" + pid;
                    }
                } else {
                    return "#/tab/cart/productDetails/cart/" + pid;
                }
            }

            $scope.remove = function(shop, pd) {
                if (pd.checked) {
                    $scope.config.checkNum--;
                    $scope.compute(pd, false);
                }
                Cart.remove(shop, pd);
            };

            $scope.mulRemove = function() {
                Cart.mulRemove();
                $scope.config.checkNum = 0;
                $scope.config.total = 0;
                $scope.check.all = false;
                $scope.checkAllClass = '';
            }

            $scope.check = function(shop, sp) {
                if (sp.checked) {
                    //商铺商品
                    shop.checkAll = false;
                    shop.checkClass = '';
                    //单个商品
                    sp.checked = false;
                    sp.checkClass = '';
                    //当前选中购物车商品总数
                    $scope.config.checkNum--;
                    $scope.compute(sp, false);
                    $scope.check.all = false;
                    $scope.checkAllClass = '';
                } else {
                    sp.checked = true;
                    sp.checkClass = $scope.config.checkClass;
                    //当前选中购物车商品总数
                    $scope.config.checkNum++;
                    if ($scope.config.checkNum == $scope.config.cartPdNum) {
                        $scope.check.all = true;
                        $scope.checkAllClass = $scope.config.checkClass;
                    }
                    var byInx = -1;
                    angular.forEach(shop.products, function(obj, inx) {
                        if (obj != sp && !obj.checked) {
                            byInx = inx;
                            return false;
                        }
                    });
                    if (byInx == -1) {
                        shop.checkAll = true;
                        shop.checkClass = $scope.config.checkClass;
                    }
                    $scope.compute(sp, true);
                }
                Cart.store();
            }

            /**
             * 选中或取消某店铺已加入购物车得商品
             * @param  {[type]} arg [购物车商铺商品集合对象]
             * @return {[type]}     [description]
             */
            $scope.checkShopAll = function(arg) {
                var check = arg.checkAll ? false : true;
                angular.forEach(arg.products, function(o, i) {
                    if (o.checked != check) {
                        $scope.compute(o, check);
                    }
                    o.checked = check;
                    o.checkClass = check ? $scope.config.checkClass : '';
                });
                if (check) {
                    arg.checkAll = true;
                    arg.checkClass = $scope.config.checkClass;
                    $scope.check.all = true;
                    $scope.checkAllClass = $scope.config.checkClass;
                } else {
                    arg.checkAll = false;
                    arg.checkClass = '';
                    $scope.check.all = false;
                    $scope.checkAllClass = '';
                }
                $scope.detect();
                Cart.store();
            }

            $scope.checkAll = function() {
                $scope.config.checkNum = 0;
                var check = false;
                if ($scope.check.all) {
                    $scope.check.all = false;
                    $scope.checkAllClass = '';
                } else {
                    check = true;
                    $scope.check.all = true;
                    $scope.checkAllClass = $scope.config.checkClass;
                }
                angular.forEach($scope.carts, function(obj, inx) {
                    if (check) {
                        obj.checkAll = true;
                        obj.checkClass = $scope.config.checkClass;
                        $scope.config.checkNum += obj.products.length;
                    } else {
                        obj.checkAll = false;
                        obj.checkClass = '';
                    }
                    angular.forEach(obj.products, function(_o, _i) {
                        _o.checked = check;
                        _o.checkClass = check ? $scope.config.checkClass : '';
                        $scope.compute(_o, check);
                    })
                });
                Cart.store();
            }

            /**
             * 重新计算购物车已选中商品
             * @return {[type]} [description]
             */
            $scope.detect = function() {
                $scope.config.checkNum = 0;
                $scope.config.total = 0;
                $scope.config.cartPdNum = Cart.count();
                angular.forEach($scope.carts, function(obj, inx) {
                    angular.forEach(obj.products, function(_o, _i) {
                        if (_o.checked) {
                            $scope.config.checkNum++;
                            $scope.compute(_o, true);
                            if ($scope.config.checkNum == $scope.config.cartPdNum) {
                                $scope.check.all = true;
                                $scope.checkAllClass = $scope.config.checkClass;
                                $scope.checkShopAllClass = $scope.config.checkClass;
                            }
                        }
                    })
                })
                Cart.store();
            }


            /**
             * 
             * @param  {[type]} price [单价]
             * @param  {[type]} way   [计算方法 true ||  false = + || -]
             * @return {[type]}       [description]
             */
            $scope.compute = function(pd, way) {
                var temptotal = Math.round(parseFloat($scope.config.total) * Math.pow(10, 2));
                var tempic = Math.round(parseFloat(pd.product.productprice * pd.num) * Math.pow(10, 2));
                if (way) {
                    temptotal += tempic;
                } else {
                    temptotal -= tempic;
                }
                $scope.config.total = (temptotal / Math.pow(10, 2)).toFixed(2);
            }

            $scope.compiler = function() {
                if ($scope.config.compiler) {
                    $scope.config.compiler = false;
                    $scope.config.compilerName = '编辑';
                } else {
                    $scope.config.compiler = true;
                    $scope.config.compilerName = '完成';
                }
                $scope.config.animate = '';
                $timeout(function() {
                    $scope.config.animate = 'animate-button-13';
                }, 100)
            }

            $scope.sortOutProps = function(propObj) {
                return Cart.sortOutProps(propObj);
            }

            $scope.buyLess = function(obj) {
                if (obj.num > 1) {
                    obj.num--;
                    $scope.detect();
                } else {
                    $rootScope.prompt("不能在少了哦");
                }
            }

            $scope.buyAdd = function(obj) {
                obj.num++;
                $scope.detect();
            }

            $scope.readyBuy = function(){
                //初始化
                Cart.readyBuy($scope, 'mbop_checkAliPayment').then(function() {
                    //处理购物车订单数据
                    var other = Cart.handleCartsPd($scope.carts);
                    console.log(other);
                    $scope.buy(other._data, other.total);
                });
            }

            $scope.$on("$ionicView.enter", function() {
                $scope.config = {
                    compiler: false,
                    compilerName: '编辑',
                    animate: '',
                    checkClass: "checkbox-assertive",
                    hastabs: true,
                    checkNum: 0,
                    cartPdNum: Cart.count(),
                    total: '0.00'
                }
                $scope.carts = Cart.all();
                console.log(angular.toJson($scope.carts));
            });

            $scope.$on("$ionicView.enter", function() {
                
            });

            $scope.$on("$ionicView.afterEnter", function() {
                //从商品详情进来不需要显示tabs
                if ($stateParams.hastabs != undefined) {
                    $scope.config.hastabs = $stateParams.hastabs == "false" ? false : true;
                } else {
                    $scope.config.hastabs = true;
                    $ionicTabsDelegate.showBar(true);
                }
                $scope.detect();
            });
        }
    ])
    .controller('CartDetailCtrl', ['$scope', '$stateParams', 'Cart', function($scope, $stateParams, Cart) {
        $scope.cart = Cart.get($stateParams.cartId);
    }])
