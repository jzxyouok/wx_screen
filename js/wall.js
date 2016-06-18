/**
 * Created by sunhongjian on 16-6-15.
 */
var GETURL = "http://10.6.28.135:10519/business-service-activity/activity/tgh/participators",
    GETPERSONURL = "http://10.6.28.135:10501/business-service-core/traffic/info";
//url参数获取
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = location.search.substr(1).match(reg);
    if (r != null) return unescape(decodeURI(r[2])); return null;
}
(function() {
    var viewFullScreen = document.getElementById("view-fullscreen");
    if (viewFullScreen) {
        viewFullScreen.addEventListener("click", function () {
            var docElm = document.documentElement;
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            }
            else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen();
            }
            else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            }
            else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            }
        }, false);
    }

    var cancelFullScreen = document.getElementById("cancel-fullscreen");
    if (cancelFullScreen) {
        cancelFullScreen.addEventListener("click", function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }, false);
    }
})();
var SingletonTester = (function () {
    //单例实例
    var instance;
    //单例方法
    function SignWall(opts) {
        var opts = opts || {};
        this.opts ={
            ACTIVITY_NAME: "activityId",
            MAX_COUNT: 1000, //最大展示人数
            SPEED: 1000,   //滚动速度(ms)
            normalPic: "img/avatar/a1.jpg"
        };
        for(var i in opts){
            this.opts[i] = opts[i];
        }
        this.init();
    }
    //构造函数
    SignWall.prototype = {
        per: 0, //请求接口次数
        personNum: 0,
        perLength: 0,
        listData:null,
        init: function(){
            var self = this;
            var timer = setInterval(function(){
                self.getPersonData();
            },self.opts.SPEED);
        },
        getPersonData: function(){
            console.log(this.per);
            //获取当前活动id用作请求参数
            var self = this;
            var actId = getQueryString(this.opts.ACTIVITY_NAME);
            //获取用户成员具体信息
            var getPersonDate = function(id){
                $.ajax({
                    type: "GET",
                    url: GETPERSONURL,
                    data: {id:id},
                    success: function(data){
                        self.per++;
                        if(data.traffic){
                            self.personNum++;
                            var name = data.traffic.nickname ? data.traffic.nickname : "游客",
                                avatar = data.traffic.avatar ? data.traffic.avatar : self.opts.normalPic;
                            if(self.per < self.perLength) {
                                self._personAdd(avatar, name);
                            }
                        }
                    },
                    error: function(){

                    }
                });
            };
            $.ajax({
                type: "GET",
                url: GETURL,
                data: {activityId:actId,prized:5,type:2},
                success: function(data){
                    if(data.participators[self.per]){
                        var _id = data.participators[self.per].trafficId;
                    }
                    self.perLength = data.participators.length;
                    getPersonDate(_id);
                },
                error: function(){

                }
            });
        },
        //添加签到成员*头像,昵称
        _personAdd: function(avatar,name){
            var $sign = $(".heads-list");
            var $messageTotal = $("#messageTotal");
            var _per = this.personNum;
            var _html = '<li class="animated swing">'+
                '<a href="javascript:void(0);">'+
                '<img class="checkin-avatar checkinAvatar" src="'+avatar+'">' +
                '</a>'+
                '<span class="checkin-name checkinName">'+name+'</span>'+
                '</li>';
            $sign.append(_html);
            $messageTotal.text(_per);
        }
    };
    //返回对象
    return {
        getInstance: function (opts) {
            if (instance === undefined) {
                instance = new SignWall(opts);
            }
            return instance;
        }
    };
})(); //直接执行该方法
