/**
* Created with JetBrains WebStorm.   
* User: markeluo
* Date: 12-8-1
* Time: 下午2:30
* To change this template use File | Settings | File Templates.
* 提供基础操作类、方法，包括：
* =============================================================
* 1.类创建、继承
* 2.判断是否为函数
* 3.对象克隆
* 4.数据管理类
* 5.同步加载文件，js,css,less
* 6.控件基类
* =============================================================
*/
//命名空间管理
// 声明一个全局对象Namespace，用来注册命名空间
var Namespace = new Object();
// 全局对象仅仅存在register函数，参数为名称空间全路径，如"Grandsoft.GEA"
Namespace.register = function (fullNS) {
    // 将命名空间切成N部分, 比如Grandsoft、GEA等
    var nsArray = fullNS.split('.');
    var sEval = "";
    var sNS = "";
    for (var i = 0; i < nsArray.length; i++) {
        if (i != 0) sNS += ".";
        sNS += nsArray[i];
        // 依次创建构造命名空间对象（假如不存在的话）的语句
        // 比如先创建Grandsoft，然后创建Grandsoft.GEA，依次下去
        sEval += "if (typeof(" + sNS + ") == 'undefined') " + sNS + " = new Object();"
    }
    if (sEval != "") eval(sEval);
}

/*
* 1.类创建，可继承
* Parent，父类
*newparams，当前新创建类的参数集合，包括属性和方法
*IsCreatAccessor:是否应用属性管理器
*/
window["Agi"] = {};
Namespace.register("Agi.OOP");
Agi.OOP.Class = {
    Create: function (parent, newparams, IsCreatAccessor) {
        var NewFun = function () {
            if (typeof this.initialize != 'undefined') {
                this.initialize.apply(this, arguments);
            }
        }
        if (IsCreatAccessor) {
            NewFun.prototype = new Agi.Attribute.Agi_AttributeManager(Array.prototype.slice.apply(arguments, [1]));
            NewFun.prototype.constructor = NewFun;
        }
        if (parent != null) {
            if (typeof parent == 'function') {
                NewFun.prototype = new parent();
                NewFun.prototype.constructor = NewFun;
            }
            else {
                /*继承出错*/
            }
        }
        /* 合并属性和方法 */
        if (typeof newparams == 'object') {
            for (var param in newparams) {
                NewFun.AddMethod(param, newparams[param]);
            }
        }
        return NewFun;
    }
}

/*1.1.属性管理*/
Namespace.register("Agi.Attribute"); /*添加 Agi.Attribute 命名空间*/
Agi.Attribute.Agi_AttributeManager = function () {
    this.Set = function (key, value) {
        if (!this.Isexist(key)) {
            this.Add(key, value);
        }
        else {
            this.Update(key, value);
        }
        //监听事件
        try {
            //        eval(this.AttributeChangeName)(this, key, value);
            //        eval(key + "ChangeEvent")(this,key, value);
            if (this.ControlAttributeChangeEvent !== null) {
                this.ControlAttributeChangeEvent(this, key, value);
            }
        }
        catch (e) { }
    },
        this.Get = function (key) {
            var ThisProKey = this.GetItemObject(key);
            if (ThisProKey != null) {
                return ThisProKey.Value;
            } else {
                return ThisProKey;
            }
        },
        this.Add = function (key, value) {
            var _temp = new Agi.Attribute.Agi_AttributeItem();
            _temp.Key = key, _temp.Value = value;
            this.AttributeList.push(_temp);
        },
        this.Update = function (key, value) {
            if (this.Isexist(key)) {
                this.GetItemObject(key).Value = value;
            }
        },
        this.Isexist = function (key) {
            var _state = false;
            for (var i = 0; i < this.AttributeList.length; i++) {
                if (this.AttributeList[i].Key == key) {
                    _state = true;
                    break;
                }
            }
            return _state;
        },
        this.GetItemObject = function (key) {
            for (var i = 0; i < this.AttributeList.length; i++) {
                if (this.AttributeList[i].Key == key) {
                    return this.AttributeList[i];
                }
            }
            return null;
        },
        this.GetAllAttribute = function () {
            return this.AttributeList;
        },
        this.addAttr = function (key, value) {
            if (this.Isexist(key)) {
                this.GetItemObject(key).Value = value;
            } else {
                this.Add(key, value);
            }
        },
        this.addAttrs = function (ArrayList) {
            for (var item in ArrayList) {
                if (this.Isexist(item)) {
                    this.GetItemObject(item).Value = ArrayList[item];
                } else {
                    this.Add(item, ArrayList[item]);
                }
            }
        },
        this.AttributeList = [];  //属性集合
}
Agi.Attribute.Agi_AttributeItem = function () {
    this.Key = null;
    this.Value = null;
}

/*
* 2.向类中添加方法或属性
* @param string name	函数名
* @param function func		函数主体
* @return function
*/
Function.prototype.AddMethod = function (_name, func) {
    if (Agi.Script.isFunction(func)) {
        this.prototype[_name] = func;
    } else {
        //this.prototype[_name] = func;
        if (this.prototype != null && this.prototype.addAttr != null) {
            this.prototype.addAttr(_name, func);
        }
    }
    return this;
}

Namespace.register("Agi.Script"); /*添加 Agi.Script 命名空间*/
Agi.Script.isFunction = function (fn) {
    return !!fn && !fn.nodeName && fn.constructor != String &&
        fn.constructor != RegExp && fn.constructor != Array &&
        /function/i.test(fn + "");
}

/*3.克隆
*_DataObj:需要克隆的对象  */
/*克隆对象*/
Agi.Script.CloneObj = function (_DataObj) {
    var objClone;
    if (_DataObj.constructor == Object) objClone = new _DataObj.constructor();
    else objClone = new _DataObj.constructor(_DataObj.valueOf());
    for (var key in _DataObj) {
        if (objClone[key] != _DataObj[key]) {
            if (typeof (_DataObj[key]) == 'object') {
                objClone[key] = Agi.Script.CloneObj(_DataObj[key]);
            }
            else {
                objClone[key] = _DataObj[key];
            }
        }
    }
    return objClone;
}
/*3.属性克隆
*clone:克隆方法，未实现
*cloneObject:克隆对象 o:需要克隆的对象  */
Agi.Script.CCloneable = Agi.OOP.Class.Create(null, {
    /*
    * 复制类
    * @return object
    */
    clone: function () {
        return null;
    },
    cloneObject: function (o) {
        if (o instanceof CCloneable) {
            // 如果继承自CCloneable则执行自身的考虑操作
            return o.clone();
        }
        var type = typeof (o);
        switch (type) {
            case 'undefined':
            case 'boolean':
            case 'string':
            case 'number': return o;
            case 'function': return o;
            case 'object':
                if (o == null) {
                    return null;
                }
                if (o instanceof Date) {
                    return new Date(o.getTime());
                }
                if (o instanceof Number) {
                    return new Number(o.valueOf());
                }
                if (o instanceof Boolean) {
                    return new Boolean(o.valueOf());
                }
                if (o instanceof Error) {
                    return new Error(o.number, o.message);
                }
                if (o instanceof Array) {
                    return o.concat([]);
                }
                if (o instanceof Object) {
                    var oo = {};
                    for (var k in o) {
                        oo[k] = o[k];
                    }
                    return oo;
                }
            default: break;
        }
        return null;
    }
});
/*4.数组操作，包括：
*1.初始化 initialize()
*2.输出数组，toArray()
*3.获得元素所处的位置，indexOf(o)
*4.获得元素在数组中最后的位置，lastIndexOf(o)
*5.添加元素,add
*6.添加多个元素,addAll
*7.移除元素，removeAt(i),i：需要移除的元素索引值
*8.移除元素，remove(o),o:需要移除的元素值
*9.判断元素是否存在，contains(o)
*10.清除链表,clear
*11.当前数组元素个数，size
*12.根据索引获得相应元素，get(i)
*13.对相应索引位置的元素进行赋值，set(i,o)
*14.复制当前数组对象并返回，clone
* */
Agi.Script.CArrayList = Agi.OOP.Class.Create(Agi.Script.CCloneable, {
    /* 内置数组 */
    array: [],

    /*
    * 构造函数
    */
    initialize: function () {
        this.array = [];
    },

    /*
    * 输出数组
    * @return Array
    */
    toArray: function () {
        return this.array;
    },

    /*
    * 从前面获得对象所在数组位置
    * @param object o	要寻找的对象
    * @return int
    */
    indexOf: function (o) {
        var len = this.array.length;
        for (var i = 0; i < len; i++) {
            if (this.array[i] == o) {
                return i;
            }
        }
        return -1;
    },

    /*
    * 从后面获得对象所在数组位置
    * @param object o 要寻找的对象
    * @rerturn int
    */
    lastIndexOf: function (o) {
        var len = this.array.length;
        for (var i = len; i >= 0; i--) {
            if (this.array[i] == o) {
                return i;
            }
        }
        return -1;
    },

    /*
    * 添加元素
    * @param object arg1 被插入的对象
    * @param object arg2	插入的对象
    */
    add: function (arg1, arg2) {
        if (arguments.length == 1) {
            // 如果参数为1则直接在链表末尾插入对象
            var len = this.array.length;
            this.array[len] = arg1;
        } else {
            // 插入对象
            var len1 = this.array.length;
            var a1 = this.array.slice(0, arg1);
            var a2 = this.array.slice(arg1, len);
            var len2 = a1.length;
            a1[len2] = arg2;
            this.array = a1.concat(a2);
        }
    },

    /*
    * 添加多个元素
    * @param Array a	元素数组
    */
    addAll: function (a) {
        if (a instanceof Array) {
            // 添加的元素是数组
            this.array = this.array.concat(a);
        } else if (typeof (a.toArray) == 'function'
            && ((a = a.toArray()) instanceof Array)) {
            // 添加的元素是链表
            this.array = this.array.concat(a);
        } else {
            throw new CException('参数错误', '添加链表的时候参数出错');
        }
    },

    /*
    * 移除元素
    * @param int i	索引值
    */
    removeAt: function (i) {
        var len = this.array.length;
        if (i < 0 || i >= len) {
            return null;
        }
        var o = this.array[i];
        this.array = this.array.slice(0, i).concat(this.array.slice(i + 1, len));
        return o;
    },

    /*
    * 移除元素
    * @param object o	元素
    */
    remove: function (o) {
        var i = this.indexOf(o);
        if (i == -1) {
            return this;
        }
        return this.removeAt(i);
    },

    /*
    * 验证元素是否存在
    * @return boolean
    */
    contains: function (o) {
        return this.indexOf(o) != -1;
    },

    /*
    * 清除链表
    */
    clear: function () {
        this.array.length = 0;
    },

    /*
    * 获得链表大小
    * @return int
    */
    size: function () {
        return this.array.length;
    },

    /*
    * 获得元素
    * @param int i		索引值
    * @return object
    */
    get: function (i) {
        var size = this.size();
        if (i >= 0 && i < size) {
            return this.array[i];
        } else {
            return null;
        }
    },

    /*
    * 设置元素
    * @param int i		索引值
    * @param ojbect	元素
    */
    set: function (i, o) {
        var size = this.size();
        if (i >= 0 && i < size) {
            this.array[i] = o;
        }
    },

    /*
    * 复制链表(重构)
    */
    clone: function () {
        var o = new CArrayList();
        o.addAll(this.array);
        return o;
    }
});
/*5.导入文件管理*/
/* 已加载文件缓存列表*/
var classcodes = new Agi.Script.CArrayList();

Agi.Script.Import = {
    /*加载一批文件，_files:文件路径数组,可包括js,css,less文件,succes:加载成功回调函数*/
    LoadFileList: function (_files, succes) {
        var FileArray = [];
        if (typeof _files === "object") {
            FileArray = _files;
        } else {
            /*如果文件列表是字符串，则用,切分成数组*/
            if (typeof _files === "string") {
                FileArray = _files.split(",");
            }
        }
        if (FileArray != null && FileArray.length > 0) {
            var LoadedCount = 0;
            for (var i = 0; i < FileArray.length; i++) {
                //alert(FileArray[i].toString());
                loadFile(FileArray[i], function () {
                    LoadedCount++;
                    if (LoadedCount == FileArray.length) {
                        succes();
                    }
                })
            }
        }
        /*加载JS文件,url:文件路径,success:加载成功回调函数*/
        function loadFile(url, success) {

            var Sys = {};
            var ua = navigator.userAgent.toLowerCase();
            var s;
            (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
                (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
                    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
                        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
                            (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
            //以下进行测试
            //                if (Sys.ie) document.write('IE: ' + Sys.ie);
            //                if (Sys.firefox) document.write('Firefox: ' + Sys.firefox);
            //                if (Sys.chrome) document.write('Chrome: ' + Sys.chrome);
            //                if (Sys.opera) document.write('Opera: ' + Sys.opera);
            //                if (Sys.safari) document.write('Safari: ' + Sys.safari);

            if (!classcodes.contains(url)) {
                var ThisType = GetFileType(FileArray[i]);
                var fileObj = null;
                var BolIsSafaricss=false;
                if (ThisType == ".js") {
                    fileObj = document.createElement('script');
                    fileObj.type = "text/javascript";
                    fileObj.src = url;
                } else if (ThisType == ".css") {
                    fileObj = document.createElement('link');
                    fileObj.href = url;
                    fileObj.type = "text/css";
                    fileObj.rel = "stylesheet";
                    if (Sys.safari) {
                        BolIsSafaricss=true;
                        document.getElementsByTagName('head')[0].appendChild(fileObj);
                        classcodes.add(url)
                        success();
                    }
                } else if (ThisType == ".less") {
                    fileObj = document.createElement('link');
                    fileObj.href = url;
                    fileObj.type = "text/css";
                    fileObj.rel = "stylesheet/less";
                }

                success = success || function () { };
                if(BolIsSafaricss){}else{
                    fileObj.onload = fileObj.onreadystatechange = function () {
                        if (!this.readyState || 'loaded' === this.readyState || 'complete' === this.readyState) {
                            success();
                            classcodes.add(url)
                        }
                    }
                    document.getElementsByTagName('head')[0].appendChild(fileObj);
                }
            } else {
                success();
            }
        }
        /*获取文件类型,后缀名，小写*/
        function GetFileType(url) {
            if (url != null && url.length > 0) {
                return url.substr(url.lastIndexOf(".")).toLowerCase();
            }
            return "";
        }
    }
}

/*7.生成新的控件ID*/
var ControlIdList = new Agi.Script.CArrayList();
Agi.Script.CreateControlGUID = function () {
    var ThisRandomValue = parseInt(1000 * Math.random());
    var ID = new Date().getMilliseconds().toString() + ThisRandomValue;
    if (ControlIdList.contains(ID)) {
        return Agi.Script.CreateControlGUID();
    } else {
        ControlIdList.add(ID);
        return ID;
    }
}

/*8.字符串拼接方法*/
/*1.append 方法：用户向对象中添加子元素*/
/*2.toString 方法:将数组对象转换为字符串*/
Agi.Script.StringBuilder = function () {
    this._strings_ = new Array;
}
Agi.Script.StringBuilder.prototype.append = function (str) {
    this._strings_.push(str);
}
Agi.Script.StringBuilder.prototype.toString = function () {
    return this._strings_.join("");
};

/*9.Date类型转换为字符串*/
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

/*9.获得一个随机区间值 (最小值、最大值)*/
Agi.Script.GetRandomValue = function (Minvalue, Maxvalue) {
    var ThisRandomValue = Minvalue + parseInt((Maxvalue - Minvalue) * Math.random());
    return ThisRandomValue;
}

/*10.实体数据二次筛选--------------------------------------------------------------------*/
//10.1.控件数据源实体条件
Agi.Script.ControlEntityData=function(_DataControls) {
    var Me = this;
    //控件数据源的筛选条件集合,数组
    Me.EntityData = _DataControls;
    /*添加实体筛选条件 _EntityCondition: Agi.Script.EntityCondition对象*/
    Me.AddEntityCondition = function (_EntityCondition) {
        if(_EntityCondition!=null){
            if (_EntityCondition.Name != null && _EntityCondition.Conditions != null && _EntityCondition.Conditions.length>0) {
                if (Me.EntityData == null) {
                    Me.EntityData = [];
                }
                var _EntityName=_EntityCondition.Name;
                var ThisEntitydata = Agi.Script.ControlEntityDataGetEntity(_EntityName);
                if (ThisEntitydata != null) {
                    if (ThisEntitydata.Conditions == null) {
                        ThisEntitydata.Conditions =_EntityCondition.Conditions;
                    } else
                    {
                        for(var i=0;i<_EntityCondition.Conditions.length;i++){
                            if(!Agi.Script.ControlEntityDataMeragContion(ThisEntitydata.Conditions,_EntityCondition.Conditions[i])){
                                ThisEntitydata.Conditions.push(_EntityCondition.Conditions[i]);
                            }
                        }
                    }
                } else {
                    Me.EntityData.push(new Agi.Script.EntityCondition(_EntityName,_EntityCondition.Conditions));
                }
            }
        }
    }
    /*移除实体的筛选条件*/
    Me.RemoveEntity = function (_EntityName) {
        if (Me.EntityData != null && Me.EntityData.length > 0) {
            var RemoveEntityIndex = -1;
            for (var i = 0; i < Me.EntityData.length; i++) {
                if (Me.EntityData[i].Name == _EntityName) {
                    RemoveEntityIndex = i;
                    break;
                }
            }
            if (RemoveEntityIndex >= 0) {
                Me.EntityData.splice(RemoveEntityIndex, 1);
            }
        }
    }
    /*获取配置字符串*/
    Me.GetConfigXML = function () {
        return JSON.stringify(Me.EntityData);
    }
    //获取实体相应列表的筛选条件，应用于Chart(_Columns：数组，元素个数>=2)
    Me.GetFilterControlCondition = function (_EntityName, _Columns) {
        var Enditydata = Agi.Script.ControlEntityDataGetEntity(_EntityName);
        var GetControlObj = [];
        if (Enditydata != null && Enditydata.length > 0) {
            var FilterConditions = [];
            if (Enditydata.Conditions != null && Enditydata.Conditions.length > 0) {
                for (var j = 0; j < _Columns.length; j++) {
                    var BolConditonExt = false;
                    for (var i = 0; i < Enditydata.Conditions.length; i++) {
                        if (Enditydata.Conditions[i].FilterColumn == _Columns[j]) {
                            FilterConditions.push(Enditydata.Conditions[i]);
                            BolConditonExt = true;
                            break;
                        }
                    }
                    if (!BolConditonExt) {
                        FilterConditions.push(new Agi.Script.ColumnFilterCondition(_Columns[j], "", ""));
                    }
                }
            } else {
                for (var j = 0; j < _Columns.length; j++) {
                    FilterConditions.push(new Agi.Script.ColumnFilterCondition(_Columns[j], "", ""));
                }
            }
            return GetControlObj.push(new Agi.Script.EntityCondition(_EntityName,FilterConditions));
        } else {
            return GetControlObj.push(new Agi.Script.EntityCondition(_EntityName,null));
        }
    }
}
/*10.2.实体数据二次筛选条件信息*/
Agi.Script.EntityCondition=function(_EntityName,_EntityConditions){
    this.Name=_EntityName;//实体名称
    this.Conditions=_EntityConditions;//条件列表,数组,元素为(Agi.Script.ColumnFilterCondition)
}
//10.3.栏位筛选条件
Agi.Script.ColumnFilterCondition=function(_Column, _OperatEnum, _Condition) {
    this.FilterColumn = _Column;//栏位
    this.OperatEnum = _OperatEnum;//筛选符，“=” 单值等于,"and" 在两个范围之间筛选,"in" 查找对应的所有符合条件的数据
    this.Condition = _Condition;//筛选条件值
}
//10.4 根据实体名称从控件的实体筛选条件列表中得到对应实体的筛选条件、
Agi.Script.ControlEntityDataGetEntity=function(_ControlEntityData,_Name) {
    if (_ControlEntityData != null && _ControlEntityData.length > 0) {
        for (var i = 0; i < _ControlEntityData.length; i++) {
            if (_Name == _ControlEntityData[i].Name) {
                return _ControlEntityData[i];
            }
        }
    }
    return null;
}
//10.5 控件实体信息筛选时，筛选条件合并
Agi.Script.ControlEntityDataMeragContion=function(_Contions,_EntityContion){
    var BolIsMerage=false;
    if(_EntityContion!=null && _Contions!=null && _Contions.length>0){
        for(var j=0;j<_Contions.length;j++){
            if(_Contions[j].FilterColumn==_EntityContion.FilterColumn){
                if(_Contions[j].OperatEnum==_EntityContion.OperatEnum=="in"){
                    var OldArray=[];
                    var NewArray=[];
                    if(_EntityContion.Condition!=null && _EntityContion.Condition!=""){
                        if(_EntityContion.Condition.indexOf(",")>-1){
                            NewArray=_EntityContion.Condition.split(",");
                        }else{
                            NewArray.push(_EntityContion.Condition);
                        }
                    }
                    if(_Contions[j].Condition!=null && _Contions[j].Condition!=""){
                        if(_Contions[j].Condition.indexOf(",")>-1){
                            OldArray=_Contions[j].Condition.split(",");
                        }else{
                            OldArray.push(_Contions[j].Condition);
                        }
                    }
                    for(var i=0;i<NewArray.length;i++){
                        if(!Agi.Script.ControlEntityDataConditionIsExt(OldArray,NewArray[i])){
                            OldArray.push(NewArray[i]);
                        }
                    }
                    _Contions[j].Condition=OldArray.toString();
                    BolIsMerage=true;
                }
            }
        }
    }
    return BolIsMerage;
}
//10.6.判断控件实体条件中是否已存在相应的筛选栏位项
Agi.Script.ControlEntityDataConditionIsExt=function(_Items,_NewItem){
    var bolIsExt=false;
    if(_Items!=null && _Items.length>0 && _NewItem!=null){
        for(var i=0;i<_Items.length;i++){
            if(_Items[i]==_NewItem){
                bolIsExt=true;
                break;
            }
        }
    }
    return bolIsExt;
}
/*10.7.获取筛选数据 _EneityObj:实体数据,EntityControlData:控件的实体条件集合*/
Agi.Script.EntityDataFilterGetData=function(_EneityObj, EntityControlData) {
    if (_EneityObj != null && _EneityObj.Key != "") {
        var ConformEntityConditions = null;
        if (EntityControlData != null && EntityControlData.length > 0) {
            for (var i = 0; i < EntityControlData.length; i++) {
                if (EntityControlData[i].Name == _EneityObj.Key) {
                    ConformEntityConditions = EntityControlData[i].Conditions;
                    break;
                }
            }
        }
        var FilertDataObj = [];

        if (ConformEntityConditions != null && ConformEntityConditions.length > 0) {
            for (var j = 0; j < _EneityObj.Data.length; j++) {
                var bolIsSucced = Agi.Script.EntityDataFilterIsSucced(ConformEntityConditions, _EneityObj.Data[j]);
                if (bolIsSucced) {
                    FilertDataObj.push(Agi.Script.CloneObj(_EneityObj.Data[j]));
                }
            }
            return FilertDataObj;
        } else {
            if(_EneityObj.Data!=null && _EneityObj.Data.length>0){
                for(var i=0;i< _EneityObj.Data.length;i++){
                    FilertDataObj.push(Agi.Script.CloneObj(_EneityObj.Data[i]));
                }
            }
            return FilertDataObj;
        }
    }
}
//10.8.判断数据是否符合筛选条件
Agi.Script.EntityDataFilterIsSucced=function(_Configs, _datas) {
    var BolSucced = true;
    for (var i = 0; i < _Configs.length; i++) {
        if (_Configs[i].OperatEnum == "=") {/*单值筛选*/
            if (eval("_datas." + _Configs[i].FilterColumn) != _Configs[i].Condition) {
                BolSucced = false;
                break;
            }
        } else if (_Configs[i].OperatEnum == "and") {/*两个值区间判断*/
            var DataArrayValues = _Configs[i].Condition.split(",");
            var StartValue = DataArrayValues[0], EndValue = DataArrayValues[1];
            var ThisData = eval("_datas." + _Configs[i].FilterColumn);
            if (typeof (ThisData) == "number") {
                StartValue = parseInt(StartValue);
                EndValue = parseInt(EndValue);
            } else {
                ThisData = Agi.Script.EntityDataFilterDateConvert(ThisData);
                StartValue = Agi.Script.EntityDataFilterDateConvert(StartValue);
                EndValue = Agi.Script.EntityDataFilterDateConvert(EndValue);
            }
            if (ThisData >= StartValue && ThisData <= EndValue) {
            } else {
                BolSucced = false;
                break;
            }
        } else if (_Configs[i].OperatEnum == "in") {
            var DataArrayValues = _Configs[i].Condition.split(",");
            var ThisData = eval("_datas." + _Configs[i].FilterColumn);
            var IsSucced = false;
            for (var j =0; j < DataArrayValues.length; j++) {
                if (ThisData == DataArrayValues[j]) {
                    IsSucced = true;
                    break;
                }
            }
            if (!IsSucced) {
                BolSucced = false;
                break;
            }
        }
    }
    return BolSucced;
}
//10.9.时间类型转换
Agi.Script.EntityDataFilterDateConvert=function(_TimeValue){
    if(typeof(_TimeValue)=="string" && (((_TimeValue.split('-')).length-1)==2 || ((_TimeValue.split('/')).length-1)==2)){
        if (_TimeValue.indexOf("-") > 0) {
            _TimeValue = _TimeValue.replace("-", "/").replace("-", "/");
        }
        _TimeValue= Date.parse(_TimeValue);
    }
    return _TimeValue;
}
/*---------------------------二次筛选结束---------------------------*/

/*11.添加去除字符串左右两边空格功能*/
Agi.Script.StringTrim=function(_StrItem){
    return _StrItem.replace(/(^\s*)|(\s*$)/g,"");
}