// 全局变量
var SIZE=6; //字母数量
var STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // 按键列表
var LEVEL = 2; // 级别
var TIME = 300; // 根据级别计算速度使用
var T ; // 定时任务，下落使用
var TPOP ; // 定时任务，爆炸使用
var IS_START = false; // 判断游戏是否开始
var MAX_HEIGHT; // 定义最大高度（超过算失败）
var SUC = 0; // 成功的个数
var ERR = 0; // 失败的个数
var KEYS = [];
var POPS = [];
var POPID = 0;// 保存播放爆炸的声音id(防止按的快时，播放不及时)
var COLOR = "burlywood";// 背景色
var SUC_MAX = 100;// 过关的数量
var ERR_MAX = 50;// 失败的数量

//字母下落
function run(){
    var html = "";
    for(i=0; i < KEYS.length; i++){
        var o = KEYS[i];
        o.top = o.top+2; 
        // 判断是否是击中的要渲染爆炸
        if(o.top>MAX_HEIGHT){
            // 到底则删除
            removeOne(i, 0, 1);
        } else {
            html += getSpan(o);
        }
    }
    $("#b").html(html);
}
// 处理爆炸
function pop(){
    var tmp = POPS;
    POPS = [];
    var html = "";
    for(i=0; i < tmp.length; i++){
        var o = tmp[i];
        html += getPopSpan(o);
    }
    $("#c").html(html);
}

// 获取 字母span
function getSpan(c){
    return "<span class='sp' style='background-color:"+COLOR+";left:"+c.left+"px; top:"+c.top+"px;'>"+c.key+"</span>";
}

// 获取爆炸span
function getPopSpan(c){
    // 爆炸声
    POPID = (POPID+1)%5
    document.getElementById("popSing"+POPID).play();
    return "<span class='sp' style='left:"+c.left+"px; top:"+c.top+"px;'><img src='./bz.png' class='spimg' /></span>";
}
// 随机位置
function getLeft(){
    return 200+Math.round(Math.random()*600);  
}
function getRandom(i){
    return Math.round(Math.random()*i);
}
// 开始游戏
function start(){
    if(IS_START){ return }
    // 初始字母
    var html = $("#b").html();
    for(i=KEYS.length; i<SIZE; i++){
        var obj = getObj();
        html += getSpan(obj);
    }
    $("#b").html(html);
    TIME = 300/LEVEL/2
    T = setInterval(run, TIME);
    TP = setInterval(pop, 300);
    IS_START = true;
}
// 下一关或者继续本关
function nextLevel(t){
    if(t){
        LEVEL++;
    }
    over();
    start();
}
// 获取字母对象
function getObj(){
    var obj =  {"key": getKey(), "left":getLeft(), "top": 36, "suc": 0};
    KEYS.push(obj);
    return obj;
}

// 获取键
function getKey(){
    var len = STR.length-1;
    var key = STR.charAt(getRandom(len));
    return key;
}

// 停止游戏
function stop(){
    clearInterval(T);
    clearInterval(TP);
    IS_START = false;
}

// 删除一个击中或者到底，再添加一个
function removeOne(i, suc, err){
    // 删除一个
    ERR += err;
    SUC += suc;
    $("#err").html(ERR);
    $("#suc").html(SUC);
    // 如果击中添加爆炸效果
    if(suc){
        POPS.push(KEYS[i]);
        if(SUC >= SUC_MAX){
            // 本关结束
            win();
        }
    } else {
        if(ERR >= ERR_MAX){
            // 本关结束
            loser();
        }
    }
    KEYS.splice(i, 1);
    // 再添加一个
    getObj();
}

// 胜利弹框
function win(){
    stop();
    $("#win").show();
}
// 失败弹窗
function loser(){
    stop();
    $("#loser").show();
}
// 结束游戏 清空数据
function over(){
    $("#win").hide();
    $("#loser").hide();
    KEYS = [];
    POPS = [];
    ERR = 0;
    SUC = 0;
    $("#err").html(ERR);
    $("#suc").html(SUC);
    $("#b").html("");
}

// 按键判断
function keyupHandel(e){
    if(IS_START){
        var k = e.key.toUpperCase();
        for(i = 0; i < KEYS.length; i++){
            if(KEYS[i].key == k){
                removeOne(i, 1, 0);
                break;
            }
        }
    }
}
function setConf(){
    $("#studentKey").val(STR);
    $("#level").val(LEVEL);
    $("#num").val(SIZE);
    $("#color").val(COLOR);
    $("#sucMax").val(SUC_MAX);
    $("#errMax").val(ERR_MAX);
    $("#set").show();
}
function save(){
    STR = $("#studentKey").val();
    LEVEL = $("#level").val();
    if(LEVEL == 0){ LEVEL = 1 } 
    SIZE = $("#num").val();
    COLOR = $("#color").val();
    SUC_MAX = $("#sucMax").val();
    ERR_MAX = $("#errMax").val();
    $("body").css("background", COLOR);
    $("#set").hide();
}

$(document).ready(function(){
    MAX_HEIGHT = window.innerHeight-10;
    $(document).keyup(function(e){
        keyupHandel(e);
    });
});