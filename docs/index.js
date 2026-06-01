var DEFAULT_STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var DEFAULT_COLOR = "burlywood";
var DEFAULT_SIZE = 3;
var DEFAULT_LEVEL = 1;
var DEFAULT_SUC_MAX = 20;
var DEFAULT_ERR_MAX = 10;
var SIZE = DEFAULT_SIZE;
var STR = DEFAULT_STR;
var LEVEL = DEFAULT_LEVEL;
var TIME = 300;
var T = null;
var TPOP = null;
var IS_START = false;
var MAX_HEIGHT;
var SUC = 0;
var ERR = 0;
var COMBO = 0;
var KEYS = [];
var POPS = [];
var POP_VISIBLE = false;
var POPID = 0;
var COLOR = DEFAULT_COLOR;
var SUC_MAX = DEFAULT_SUC_MAX;
var ERR_MAX = DEFAULT_ERR_MAX;

function run(){
    var html = "";
    for(var i=0; i < KEYS.length; i++){
        var o = KEYS[i];
        o.top = o.top+2;
        if(o.top>MAX_HEIGHT){
            removeOne(i, 0, 1);
        } else {
            html += getSpan(o);
        }
    }
    $("#b").html(html);
}

function pop(){
    if(POPS.length == 0){
        if(POP_VISIBLE){
            $("#c").html("");
            POP_VISIBLE = false;
        }
        return;
    }
    var tmp = POPS;
    POPS = [];
    var html = "";
    for(var i=0; i < tmp.length; i++){
        var o = tmp[i];
        html += getPopSpan(o);
    }
    $("#c").html(html);
    POP_VISIBLE = true;
}

function getSpan(c){
    return "<span class='sp' style='background-color:"+COLOR+";left:"+c.left+"px; top:"+c.top+"px;'>"+c.key+"</span>";
}

function getPopSpan(c){
    POPID = (POPID+1)%5;
    var player = document.getElementById("popSing"+POPID);
    if(player){
        var playTask = player.play();
        if(playTask && playTask.catch){
            playTask.catch(function(){});
        }
    }
    return "<span class='sp' style='left:"+c.left+"px; top:"+c.top+"px;'><img src='./bz.png' class='spimg' /></span>";
}

function getLeft(){
    var width = window.innerWidth || document.documentElement.clientWidth || 800;
    var minLeft = width > 700 ? 200 : 10;
    var maxLeft = Math.max(minLeft, width - 50);
    return minLeft + getRandom(maxLeft - minLeft);
}

function getRandom(i){
    return Math.round(Math.random()*i);
}

function applyLevelConfig(){
    SIZE = Math.min(DEFAULT_SIZE + Math.floor((LEVEL - 1) / 2), 8);
    SUC_MAX = DEFAULT_SUC_MAX + (LEVEL - 1) * 10;
    ERR_MAX = DEFAULT_ERR_MAX + Math.floor((LEVEL - 1) * 2);
}

function getLevelTime(){
    return Math.max(36, 180 - (LEVEL - 1) * 14);
}

function setStatus(text){
    $("#status").text(text).toggle(!!text);
}

function updateScore(){
    $("#err").text(ERR);
    $("#suc").text(SUC);
    $("#combo").text(COMBO);
}

function getHitJudge(o){
    var topLine = MAX_HEIGHT / 3;
    var middleLine = topLine * 2;
    if(o.top <= topLine){
        return {text: "PERFECT", type: "perfect"};
    }
    if(o.top <= middleLine){
        return {text: "GREAT", type: "great"};
    }
    return {text: "COOL", type: "cool"};
}

function showJudge(text, type){
    var target = $("#judge");
    target.removeClass("perfect great cool miss show").addClass(type).text(text);
    target[0].offsetWidth;
    target.addClass("show");
}

function updateComboFx(){
    var target = $("#comboFx");
    if(COMBO <= 0){
        target.removeClass("show").empty();
        return;
    }
    target.removeClass("show").html("<span>"+COMBO+"</span><small>COMBO</small>");
    target[0].offsetWidth;
    target.addClass("show");
}

function start(){
    if(IS_START){ return; }
    setStatus("");
    var html = $("#b").html();
    for(var i=KEYS.length; i<SIZE; i++){
        var obj = getObj();
        html += getSpan(obj);
    }
    $("#b").html(html);
    TIME = getLevelTime();
    T = setInterval(run, TIME);
    TPOP = setInterval(pop, 300);
    IS_START = true;
}

function nextLevel(t){
    if(t){
        LEVEL++;
        applyLevelConfig();
        renderConf();
    }
    over();
    start();
}

function getObj(){
    var obj =  {"key": getKey(), "left":getLeft(), "top": 36, "suc": 0};
    KEYS.push(obj);
    return obj;
}

function getKey(){
    var usedKeys = {};
    var tmp = "";
    KEYS.forEach(function(item){
        usedKeys[item.key] = true;
    });
    for(var i = 0; i < STR.length; i++){
        var key = STR.charAt(i);
        if(!usedKeys[key]){
            tmp += key;
        }
    }
    if(tmp.length == 0){
        tmp = STR;
    }
    var len = tmp.length-1;
    return tmp.charAt(getRandom(len));
}

function stop(){
    clearInterval(T);
    clearInterval(TPOP);
    T = null;
    TPOP = null;
    $("#c").html("");
    IS_START = false;
    setStatus("已暂停，按空格继续");
}

function removeOne(i, suc, err){
    ERR += err;
    SUC += suc;
    if(suc){
        COMBO++;
    } else {
        COMBO = 0;
    }
    updateScore();
    updateComboFx();
    var judge = suc ? getHitJudge(KEYS[i]) : {text: "MISS", type: "miss"};
    showJudge(judge.text, judge.type);
    var isFinished = false;
    if(suc){
        POPS.push(KEYS[i]);
        if(SUC >= SUC_MAX){
            win();
            isFinished = true;
        }
    } else {
        if(ERR >= ERR_MAX){
            loser();
            isFinished = true;
        }
    }
    KEYS.splice(i, 1);
    if(!isFinished){
        getObj();
    }
}

function win(){
    stop();
    setStatus("本关完成，可以进入下一级");
    $("#win").show();
}

function loser(){
    stop();
    setStatus("挑战失败，再练一次吧");
    $("#loser").show();
}

function over(){
    stop();
    $("#win").hide();
    $("#loser").hide();
    KEYS = [];
    POPS = [];
    POP_VISIBLE = false;
    ERR = 0;
    SUC = 0;
    COMBO = 0;
    updateScore();
    updateComboFx();
    $("#judge").removeClass("show perfect great cool miss").empty();
    $("#b").html("");
    $("#c").html("");
    setStatus("按空格或点击开始");
}

function keyupHandel(e){
    var k = e.key.toUpperCase();
    if(k == " "){
        if(IS_START){
            stop();
        } else {
            start();
        }
        return;
    }
    if(IS_START){
        for(var i = 0; i < KEYS.length; i++){
            if(KEYS[i].key == k){
                removeOne(i, 1, 0);
                break;
            }
        }
    }
}

function setConf(){
    setStatus("");
    $("#studentKey").val(STR);
    $("#level").val(LEVEL);
    $("#num").val(SIZE);
    $("#color").val(COLOR);
    $("#sucMax").val(SUC_MAX);
    $("#errMax").val(ERR_MAX);
    $("#set").show();
}

function normalizeKeys(value){
    var result = "";
    var keys = $.trim(value || "").toUpperCase().replace(/[^A-Z]/g, "");
    for(var i = 0; i < keys.length; i++){
        if(result.indexOf(keys.charAt(i)) < 0){
            result += keys.charAt(i);
        }
    }
    return result || DEFAULT_STR;
}

function getNumberValue(value, fallback, min, max){
    var num = parseInt(value, 10);
    if(isNaN(num)){
        return fallback;
    }
    num = Math.max(min, num);
    if(max !== undefined){
        num = Math.min(max, num);
    }
    return num;
}

function normalizeColor(value){
    var color = $.trim(value || "");
    var el = document.createElement("div");
    el.style.backgroundColor = "";
    el.style.backgroundColor = color;
    return el.style.backgroundColor || DEFAULT_COLOR;
}

function renderConf(){
    $("#studentKeyTxt").text(STR);
    $("#levelTxt").text(LEVEL);
    $("#numTxt").text(SIZE);
    $("#colorTxt").text(COLOR);
    $("#sucMaxTxt").text(SUC_MAX);
    $("#errMaxTxt").text(ERR_MAX);
}

function save(){
    STR = normalizeKeys($("#studentKey").val());
    LEVEL = getNumberValue($("#level").val(), DEFAULT_LEVEL, 1, 100);
    SIZE = getNumberValue($("#num").val(), DEFAULT_SIZE, 1, 50);
    COLOR = normalizeColor($("#color").val());
    SUC_MAX = getNumberValue($("#sucMax").val(), DEFAULT_SUC_MAX, 1, 10000);
    ERR_MAX = getNumberValue($("#errMax").val(), DEFAULT_ERR_MAX, 1, 10000);
    over();
    renderConf();
    $("body").css("background", COLOR);
    $("#set").hide();
}

function updateMaxHeight(){
    MAX_HEIGHT = window.innerHeight-10;
}

$(document).ready(function(){
    updateMaxHeight();
    renderConf();
    updateScore();
    setStatus("按空格或点击开始");
    $(document).keyup(function(e){
        keyupHandel(e);
    });
    $(window).resize(function(){
        updateMaxHeight();
    });
});
