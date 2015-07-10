/**
 * Created by Mr_hu on 2015/5/26.
 */
/**
 * Created by wanli on 2015/4/24.
 */
//DOME加载完毕
$(document.body).ready(function(){
    InitControl();//控件初始化
    LoadDataRefreshTreeMap();
});
var startDate="2015-02-25",endDate="2015-05-21",vytype="能耗_月",vydimension="单元";
var groupcolors=[{name:"裂解",color:"#247ba5"},{name:"急冷",color:"#daa03e"},{name:"压缩",color:"#c84957"},
    {name:"分离",color:"#3eb3a9"},{name:"蒸汽",color:"#b0469a"},{name:"水",color:"#368d43"},
    {name:"燃料气",color:"#675caf"},{name:"电",color:"#4ea392"}]
//1.控件初始化
function InitControl(){
    //时间范围筛选
    var ranges=[];
    var _starttimenumber=TimeConvert(startDate);
    var _endtimenumber=TimeConvert(endDate);
    var _step=(_endtimenumber-_starttimenumber)/10;
    for(var i=0;i<10;i++){
        ranges.push(_starttimenumber+parseInt(i*_step));
    }
    var tempstarttime=ranges[0];
    var tempendtime=ranges[ranges.length-1];
    //var picker = $("#slideryear").range_picker({
    //    //是否显示分割线
    //    show_seperator:false,
    //    //是否启用动画
    //    animate:false,
    //    //初始化开始区间值
    //    from:tempstarttime,
    //    //初始化结束区间值
    //    to:tempendtime,
    //    axis_width:200,
    //    //选取块宽度
    //    picker_width:14,
    //    //各区间值
    //    ranges:ranges,
    //    onChange:function(from_to){
    //        startDate=new Date(from_to[0]).dateformat("yyyy-MM-dd");
    //        endDate=new Date(from_to[1]).dateformat("yyyy-MM-dd");
    //        $(".sliderlabelpanel>.label_left").html(new Date(from_to[0]).dateformat("yyyy-MM-dd"));
    //        $(".sliderlabelpanel>.label_right").html(new Date(from_to[1]).dateformat("yyyy-MM-dd"));
    //    },
    //    onSelect:function(index,from_to){
    //        //RefreshTreeMap(vytype,vydimension);
    //        LoadDataRefreshTreeMap();
    //    },
    //    afterInit:function(){
    //        var picker = this;
    //        var ranges = picker.options.ranges;
    //        $(".sliderlabelpanel>.label_left").html(new Date(ranges[0]).dateformat("yyyy-MM-dd"));
    //        $(".sliderlabelpanel>.label_right").html(new Date(ranges[ranges.length-1]).dateformat("yyyy-MM-dd"));
    //    }
    //});



    $("#vydimensiontype").change(function(ev){
        vydimension=$(this).val();
        LoadDataRefreshTreeMap()
        RefreshTreeMap(vytype,vydimension);
        UpdatedimensionItems(vydimension);//更新显示项
    })
    $("#timesizetype").change(function(ev){
        var tempvalue=$(this).val();
        switch(tempvalue){
            case "M":
                vytype="能耗_月";
                break;
                break;
            case "Y":
                vytype="能耗_年";
                break;
            default :
                break;
        }
        LoadDataRefreshTreeMap();
        RefreshTreeMap(vytype,vydimension);
    });
    UpdatedimensionItems(vydimension);
}


function UpdatedimensionItems(_type){
    var Items="";
    var allitems=null;
    if(_type==""){
        allitems=["裂解","急冷","压缩","分离","水","燃料气","电"];
    }else{
        if(_type=="单元"){
            allitems=["裂解","急冷","压缩","分离"];
        }else{
            allitems=["蒸汽","水","燃料气","电"];
        }
    }
    for(var i=0;i<allitems.length;i++){
        Items+="<div class='cheitems_item'><div class='item_ico' style='background-color: "+GetColorBygname(allitems[i])+"'></div>"+allitems[i]+"</div>";
    }
    $("#checkitems").html(Items);
}

//region 2.加载数据与筛选处理
var alldata=null;
function LoadDataRefreshTreeMap(){

    //var strDaySQL="select t1.*,'裂解' as 维度项,'单元' as 维度 from (select TO_CHAR(t.DDATE,'yyyy-mm-dd') as DDATE,DTAG,ROUND((sum(t.DVALUE)/count(t.DVALUE))*2000,2) as DValue from "+
    //" DEVICEMAPDATA t group by TO_CHAR(t.DDATE,'yyyy-mm-dd'),DTAG)t1 where t1.DDATE>='"+startDate+"' and t1.DDATE<='"+endDate+"' and t1.DTAG in "+
    //" ('ECBA105','ECBA106','ECBA107','ECBA108','ECBA109','ECBA1110','ECBA111','ECBA112','ECBA113','ECBA114','ECBA115','ECBA1101','ECBA1102','ECBA1103','ECBA1104') "+
    //" union all "+
    //" select t1.*,'压缩' as 维度项,'单元' as 维度 from "+
    //" (select TO_CHAR(t.DDATE,'yyyy-mm-dd') as DDATE,'GB1201' as DTAG, "+
    //" ROUND((sum(t.DVALUE)/count(t.DVALUE))*2000*0.23,2) as DValue "+
    //" from DEVICEMAPDATA t  where t.DTAG='WGT1201' and TO_CHAR(t.DDATE,'yyyy-mm-dd')>='"+startDate+"' and TO_CHAR(t.DDATE,'yyyy-mm-dd')<='"+endDate+"' group by TO_CHAR(t.DDATE,'yyyy-mm-dd'),'GB1201' )t1 "+
    //" union all "+
    //" select t1.*,'压缩' as 维度项,'单元' as 维度 from "+
    //" (select TO_CHAR(t.DDATE,'yyyy-mm-dd') as DDATE,'GB201' as DTAG, "+
    //" ROUND((sum(t.DVALUE)/count(t.DVALUE))*2000*0.23,2) as DValue "+
    //" from DEVICEMAPDATA t  where t.DTAG='WGT201' and TO_CHAR(t.DDATE,'yyyy-mm-dd')>='"+startDate+"' and TO_CHAR(t.DDATE,'yyyy-mm-dd')<='"+endDate+"' group by TO_CHAR(t.DDATE,'yyyy-mm-dd'),'GB201' )t1 "+
    //" union all "+
    //" select t1.*,'分离' as 维度项,'单元' as 维度 from (select TO_CHAR(t.DDATE,'yyyy-mm-dd') as DDATE,DTAG,ROUND((sum(t.DVALUE)/count(t.DVALUE))*2000,2) as DValue from "+
    //" DEVICEMAPDATA t where TO_CHAR(t.DDATE,'yyyy-mm-dd')>='"+startDate+"' and TO_CHAR(t.DDATE,'yyyy-mm-dd')<='"+endDate+"' group by TO_CHAR(t.DDATE,'yyyy-mm-dd'),DTAG)t1 where t1.DTAG in "+
    //" ('WGT501','WGT551','WGT351','WGT601') "+
    //" union all "+
    //" select t1.*,'压缩' as 维度项,'单元' as 维度 from "+
    //" (select TO_CHAR(t.DDATE,'yyyy-mm-dd') as DDATE,'GB1201' as DTAG, "+
    //" ROUND((sum(t.DVALUE)/count(t.DVALUE))*2000*0.23,2) as DValue "+
    //" from DEVICEMAPDATA t  where t.DTAG='WGT1201' and TO_CHAR(t.DDATE,'yyyy-mm-dd')>='"+startDate+"' and TO_CHAR(t.DDATE,'yyyy-mm-dd')<='"+endDate+"' group by TO_CHAR(t.DDATE,'yyyy-mm-dd'),'GB1201' )t1 "+
    //" union all "+
    //" select TO_CHAR(t.DDATE,'yyyy-mm-dd') as DDATE,to_char('急冷') as DTAG,t.JL as DValue,'急冷' as 维度项,'单元' as 维度 from DEVICEMAPDATA2 t where TO_CHAR(t.DDATE,'yyyy-mm-dd')>='"+startDate+"' and TO_CHAR(t.DDATE,'yyyy-mm-dd')<='"+endDate+"'";
    //if(vytype=="能耗_月"){
    var strDaySQL=null;
    if($("#vydimensiontype").val()=="单元"){
        if($("#timesizetype").val()=="M"){
            startDate="2015-02-25";
            endDate="2015-05-21";
            strDaySQL="select t1.*,'裂解' as 维度项,'单元' as 维度 from (select TO_CHAR(t.DDATE,'yyyy-mm') as DDATE,DTAG,ROUND((sum(t.DVALUE)/count(t.DVALUE))*2000,2) as DValue from "+
            " DEVICEMAPDATA t group by TO_CHAR(t.DDATE,'yyyy-mm'),DTAG)t1 where t1.DDATE>='"+startDate+"' and t1.DDATE<='"+endDate+"' and t1.DTAG in "+
            " ('ECBA105','ECBA106','ECBA107','ECBA108','ECBA109','ECBA1110','ECBA111','ECBA112','ECBA113','ECBA114','ECBA115','ECBA1101','ECBA1102','ECBA1103','ECBA1104') "+
            " union all "+
            " select t1.*,'压缩' as 维度项,'单元' as 维度 from "+
            " (select TO_CHAR(t.DDATE,'yyyy-mm') as DDATE,'GB1201' as DTAG, "+
            " ROUND((sum(t.DVALUE)/count(t.DVALUE))*2000*0.23,2) as DValue "+
            " from DEVICEMAPDATA t  where t.DTAG='WGT1201' and TO_CHAR(t.DDATE,'yyyy-mm-dd')>='"+startDate+"' and TO_CHAR(t.DDATE,'yyyy-mm-dd')<='"+endDate+"' group by TO_CHAR(t.DDATE,'yyyy-mm'),'GB1201' )t1 "+
            " union all "+
            " select t1.*,'压缩' as 维度项,'单元' as 维度 from "+
            " (select TO_CHAR(t.DDATE,'yyyy-mm') as DDATE,'GB201' as DTAG, "+
            " ROUND((sum(t.DVALUE)/count(t.DVALUE))*2000*0.23,2) as DValue "+
            " from DEVICEMAPDATA t  where t.DTAG='WGT201' and TO_CHAR(t.DDATE,'yyyy-mm-dd')>='"+startDate+"' and TO_CHAR(t.DDATE,'yyyy-mm-dd')<='"+endDate+"' group by TO_CHAR(t.DDATE,'yyyy-mm'),'GB201' )t1 "+
            " union all "+
            " select t1.*,'分离' as 维度项,'单元' as 维度 from (select TO_CHAR(t.DDATE,'yyyy-mm') as DDATE,DTAG,ROUND((sum(t.DVALUE)/count(t.DVALUE))*2000,2) as DValue from "+
            " DEVICEMAPDATA t where TO_CHAR(t.DDATE,'yyyy-mm-dd')>='"+startDate+"' and TO_CHAR(t.DDATE,'yyyy-mm-dd')<='"+endDate+"' group by TO_CHAR(t.DDATE,'yyyy-mm'),DTAG)t1 where t1.DTAG in "+
            " ('WGT501','WGT551','WGT351','WGT601') "+
            " union all "+
            "  select t1.*, '急冷' as 维度项, '单元' as 维度 from("+
            " select TO_CHAR(t.DDATE, 'yyyy-mm') as DDATE, '急冷' as DTAG,sum(t.JL) as DValue"+
            " from DEVICEMAPDATA2 t"+
            " where  TO_CHAR(t.DDATE, 'yyyy-mm-dd') >='"+startDate+"'  and TO_CHAR(t.DDATE, 'yyyy-mm-dd') <='"+endDate+"'"+
            " group by TO_CHAR(t.DDATE, 'yyyy-mm'),'急冷')t1";
        }else{
            startDate="2015-02-25";
            endDate="2015-05-21";
            strDaySQL="select t1.*,'裂解' as 维度项,'单元' as 维度 from (select TO_CHAR(t.DDATE,'yyyy') as DDATE,DTAG,ROUND((sum(t.DVALUE)/count(t.DVALUE))*2000,2) as DValue from "+
            " DEVICEMAPDATA t group by TO_CHAR(t.DDATE,'yyyy'),DTAG)t1 where t1.DDATE>='"+startDate+"' and t1.DDATE<='"+endDate+"' and t1.DTAG in "+
            " ('ECBA105','ECBA106','ECBA107','ECBA108','ECBA109','ECBA1110','ECBA111','ECBA112','ECBA113','ECBA114','ECBA115','ECBA1101','ECBA1102','ECBA1103','ECBA1104') "+
            " union all "+
            " select t1.*,'压缩' as 维度项,'单元' as 维度 from "+
            " (select TO_CHAR(t.DDATE,'yyyy') as DDATE,'GB1201' as DTAG, "+
            " ROUND((sum(t.DVALUE)/count(t.DVALUE))*2000*0.23,2) as DValue "+
            " from DEVICEMAPDATA t  where t.DTAG='WGT1201' and TO_CHAR(t.DDATE,'yyyy-mm-dd')>='"+startDate+"' and TO_CHAR(t.DDATE,'yyyy-mm-dd')<='"+endDate+"' group by TO_CHAR(t.DDATE,'yyyy'),'GB1201' )t1 "+
            " union all "+
            " select t1.*,'压缩' as 维度项,'单元' as 维度 from "+
            " (select TO_CHAR(t.DDATE,'yyyy') as DDATE,'GB201' as DTAG, "+
            " ROUND((sum(t.DVALUE)/count(t.DVALUE))*2000*0.23,2) as DValue "+
            " from DEVICEMAPDATA t  where t.DTAG='WGT201' and TO_CHAR(t.DDATE,'yyyy-mm-dd')>='"+startDate+"' and TO_CHAR(t.DDATE,'yyyy-mm-dd')<='"+endDate+"' group by TO_CHAR(t.DDATE,'yyyy'),'GB201' )t1 "+
            " union all "+
            " select t1.*,'分离' as 维度项,'单元' as 维度 from (select TO_CHAR(t.DDATE,'yyyy') as DDATE,DTAG,ROUND((sum(t.DVALUE)/count(t.DVALUE))*2000,2) as DValue from "+
            " DEVICEMAPDATA t where TO_CHAR(t.DDATE,'yyyy-mm-dd')>='"+startDate+"' and TO_CHAR(t.DDATE,'yyyy-mm-dd')<='"+endDate+"' group by TO_CHAR(t.DDATE,'yyyy'),DTAG)t1 where t1.DTAG in "+
            " ('WGT501','WGT551','WGT351','WGT601') "+
            " union all "+
            "  select t1.*, '急冷' as 维度项, '单元' as 维度 from("+
            " select TO_CHAR(t.DDATE, 'yyyy') as DDATE, '急冷' as DTAG,sum(t.JL) as DValue"+
            " from DEVICEMAPDATA2 t"+
            " where  TO_CHAR(t.DDATE, 'yyyy-mm-dd') >='"+startDate+"'  and TO_CHAR(t.DDATE, 'yyyy-mm-dd') <='"+endDate+"'"+
            " group by TO_CHAR(t.DDATE, 'yyyy'),'急冷')t1";
            //   startDate="2015";endDate="2015"
        }

    }else{
        if($("#timesizetype").val()=="M"){
            startDate="2015-02-25";
            endDate="2015-05-21";
            strDaySQL=" select t1.*, '水' as 维度项, '介质' as 维度 from (select TO_CHAR(t.DDATE, 'yyyy-mm') as DDATE,'水' as DTAG,sum(t.ECCW) as DValue from DEVICEMAPDATA2 t where TO_CHAR(t.DDATE, 'yyyy-mm-dd') >= '"+startDate+"'and TO_CHAR(t.DDATE, 'yyyy-mm-dd') <= '"+endDate+"'group by TO_CHAR(t.DDATE, 'yyyy-mm'), '水') t1"+
            " union all"+
            " select t1.*, '燃料气' as 维度项, '介质' as 维度 from (select TO_CHAR(t.DDATE, 'yyyy-mm') as DDATE,'燃料气' as DTAG,sum(t.Ecgas) as DValue from DEVICEMAPDATA2 t where TO_CHAR(t.DDATE, 'yyyy-mm-dd') >= '"+startDate+"'and TO_CHAR(t.DDATE, 'yyyy-mm-dd') <= '"+endDate+"'group by TO_CHAR(t.DDATE, 'yyyy-mm'), '燃料气') t1"+
            " union all"+
            " select t1.*, '蒸汽' as 维度项, '介质' as 维度 from (select TO_CHAR(t.DDATE, 'yyyy-mm') as DDATE,'蒸汽' as DTAG,sum(t.Ecsteam) as DValue from DEVICEMAPDATA2 t where TO_CHAR(t.DDATE, 'yyyy-mm-dd') >= '"+startDate+"'and TO_CHAR(t.DDATE, 'yyyy-mm-dd') <= '"+endDate+"'group by TO_CHAR(t.DDATE, 'yyyy-mm'), '蒸汽') t1"+
            " union all"+
            " select t1.*, '电' as 维度项, '介质' as 维度 from (select TO_CHAR(t.DDATE, 'yyyy-mm') as DDATE,'电' as DTAG,sum(t.ECE) as DValue from DEVICEMAPDATA2 t where TO_CHAR(t.DDATE, 'yyyy-mm-dd') >= '"+startDate+"'and TO_CHAR(t.DDATE, 'yyyy-mm-dd') <= '"+endDate+"'group by TO_CHAR(t.DDATE, 'yyyy-mm'), '电') t1"
        }else{
            startDate="2015-02-25";
            endDate="2015-05-21";
            strDaySQL=" select t1.*, '水' as 维度项, '介质' as 维度 from (select TO_CHAR(t.DDATE, 'yyyy') as DDATE,'水' as DTAG,sum(t.ECCW) as DValue from DEVICEMAPDATA2 t where TO_CHAR(t.DDATE, 'yyyy-mm-dd') >= '"+startDate+"'and TO_CHAR(t.DDATE, 'yyyy-mm-dd') <= '"+endDate+"'group by TO_CHAR(t.DDATE, 'yyyy'), '水') t1"+
            " union all"+
            " select t1.*, '燃料气' as 维度项, '介质' as 维度 from (select TO_CHAR(t.DDATE, 'yyyy') as DDATE,'燃料气' as DTAG,sum(t.Ecgas) as DValue from DEVICEMAPDATA2 t where TO_CHAR(t.DDATE, 'yyyy-mm-dd') >= '"+startDate+"'and TO_CHAR(t.DDATE, 'yyyy-mm-dd') <= '"+endDate+"'group by TO_CHAR(t.DDATE, 'yyyy'), '燃料气') t1"+
            " union all"+
            " select t1.*, '蒸汽' as 维度项, '介质' as 维度 from (select TO_CHAR(t.DDATE, 'yyyy') as DDATE,'蒸汽' as DTAG,sum(t.Ecsteam) as DValue from DEVICEMAPDATA2 t where TO_CHAR(t.DDATE, 'yyyy-mm-dd') >= '"+startDate+"'and TO_CHAR(t.DDATE, 'yyyy-mm-dd') <= '"+endDate+"'group by TO_CHAR(t.DDATE, 'yyyy'), '蒸汽') t1"+
            " union all"+
            " select t1.*, '电' as 维度项, '介质' as 维度 from (select TO_CHAR(t.DDATE, 'yyyy') as DDATE,'电' as DTAG,sum(t.ECE) as DValue from DEVICEMAPDATA2 t where TO_CHAR(t.DDATE, 'yyyy-mm-dd') >= '"+startDate+"'and TO_CHAR(t.DDATE, 'yyyy-mm-dd') <= '"+endDate+"'group by TO_CHAR(t.DDATE, 'yyyy'), '电') t1"

        }

    }

    //}

    QueryData(strDaySQL,function(_result){
        alldata=_result.data;
        RefreshTreeMap(vytype,vydimension);
    });
    //d3.csv("../data/vinyldevicetreemap.csv", function(csv) {
    //    alldata=csv;
    //
    //    RefreshTreeMap(vytype,vydimension);
    //});

}
//数据筛选处理
function DataFilterByCondition(_type,_dimension){
    var filterdata=[];//{year:2001,items:[{name:'',children:[{name:'',size:11}]}]}}
    var yearstritems=[];

    //先按年度分组
    var tempyear="",tempindex=-1;
    if(_type=="能耗_月"){
        startDate="2015-02-25";
        endDate="2015-05-21"
    }else{
        startDate="2015";
        endDate="2015"
    }
    for(var i=0;i<alldata.length;i++){
        if(alldata[i]["DDATE"]>=startDate && alldata[i]["DDATE"]<=endDate){
            if(_type=="能耗_月"){
                tempyear=alldata[i]["DDATE"].substr(0,7);
            }else{
                tempyear=alldata[i]["DDATE"].substr(0,4);
            }
            tempindex=yearstritems.indexOf(tempyear);
            if(_dimension==""){
                if(tempindex>-1){
                    filterdata[tempindex].items.push({name:alldata[i]["维度项"],childrenname:alldata[i]["DTAG"],size:parseInt(alldata[i]["DVALUE"])});
                }else{
                    yearstritems.push(tempyear);
                    filterdata.push({year:tempyear,items:[{name:alldata[i]["维度项"],childrenname:alldata[i]["DTAG"],size:parseInt(alldata[i]["DVALUE"])}]});
                }
            }else{
                if(_dimension==alldata[i]["维度"]){
                    if(tempindex>-1){
                        filterdata[tempindex].items.push({name:alldata[i]["维度项"],childrenname:alldata[i]["DTAG"],size:parseInt(alldata[i]["DVALUE"])});
                    }else{
                        yearstritems.push(tempyear);
                        filterdata.push({year:tempyear,items:[{name:alldata[i]["维度项"],childrenname:alldata[i]["DTAG"],size:parseInt(alldata[i]["DVALUE"])}]});
                    }
                }
            }
        }
    }
    //按维度项分组
    for(var i=0;i<filterdata.length;i++){
        filterdata[i].items=YearDataGroupManager(filterdata[i].items);
    }
    filterdata.sort(function(a,b){
        return a.year> b.year?1:-1
    })
    return filterdata;
}
//年度数据分组处理
function YearDataGroupManager(_yearData){
    //item:{name,childrenname,size}
    var items=[];//{name:'',children:[{name:'',size:11}]}
    var groupnames=[];

    var tempindex=-1;
    for(var i=0;i<_yearData.length;i++){
        tempindex=groupnames.indexOf(_yearData[i]["name"]);
        if(tempindex>-1){
            items[tempindex].children.push({name:_yearData[i]["childrenname"],size:_yearData[i]["size"],groupname:_yearData[i]["name"]});
        }else{
            items.push({name:_yearData[i]["name"],children:[{name:_yearData[i]["childrenname"],size:_yearData[i]["size"],groupname:_yearData[i]["name"]}]});
            groupnames.push(_yearData[i]["name"]);
        }
    }
    return items;
}
function GetColorBygname(_name){
    var color="#ffffff";
    for(var i=0;i<groupcolors.length;i++){
        if(groupcolors[i].name==_name){
            color=groupcolors[i].color;
            break;
        }
    }
    return color;
}
//endregion

//region 3.更新TreeMAP显示
function RefreshTreeMap(_type,_dimension){
    var filterdata=DataFilterByCondition(_type,_dimension);
    var treedata=null;

    var mappenel=$("#content_left").html("");
    var tempid="";
    var tempsubpanel=null;
    var stepheight=parseInt(mappenel.height()/filterdata.length-10);
    for(var i=0;i<filterdata.length;i++){
        tempid="lefttreemap_sub"+(i+1);

        treedata={"name": "root","children":filterdata[i].items};
        tempsubpanel=$("<div style='height: "+stepheight+"px'><div class='subleft' style='line-height: "+stepheight+"px'>"+filterdata[i].year+"</div><div class='submap' id='"+tempid+"' style='height:"+stepheight+"px'></div></div>");
        mappenel.append(tempsubpanel);
        mappenel.append("<div class='spacerow'></div>");
        var sortnumber=[0,1,2,3]
        var sortdata={
            name:"root",
            children:[]
        }
        for(var k=0;k<treedata.children.length;k++){
            if(k==2){
                sortdata.children.push(treedata.children[k])
            }
        }
        for(var l=0;l<treedata.children.length;l++){
            if(l==1){
                sortdata.children.push(treedata.children[l])
            }
        }
        for(var n=0;n<treedata.children.length;n++){
            if(n==3){
                sortdata.children.push(treedata.children[n])
            }
        }
        for(var m=0;m<treedata.children.length;m++){
            if(m==0){
                sortdata.children.push(treedata.children[m])
                //sortdata.push({name:"root",children:treedata.children[m]})
            }
        }
        LoadTreeMap(sortdata,tempid);
    }
}
var margin,width,height=null;
var treemap=null;
var div=null;
function LoadTreeMap(_treedata,_targetid){
    margin = {top: 40, right: 10, bottom: 10, left: 10};
    width =$("#"+_targetid).width();
    height =$("#"+_targetid).height();
    var w = 1280 - 80,
        h = 800 - 180,
        x = d3.scale.linear().range([0, w]),
        y = d3.scale.linear().range([0, h]),
        color = d3.scale.category20c();

    treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(true)
        .value(function(d) {
            return d.size;
        }).sort(function(a,b){
            return a.value- b.value;
        });



    div = d3.select("#"+_targetid);
    var node,root;
      node=root=treemap.nodes;
    var TreeMapNode= div.datum(_treedata).selectAll(".node")
        .data(treemap.nodes)
        .enter().append("div")
        .attr("class", "node")
        .style("width", w + "px")
        .style("height", h + "px")
        //.append("svg:svg")
        .attr("width", w)
        .attr("height", h)
       // .append("svg:g")
        .attr("transform", "translate(.5,.5)")
        .call(position)
        .on("click", function(d) { return zoom(node == d.parent ? root : d.parent); })
        .style("background", function(d) {
            //return d.children ? color(d.name) : null;
            return GetColorBygname(d.groupname);
        })
        .html(function(d) {
            //return d.children ? null : d.name;
            return d.name;
        }).attr("title",function(d){
            if(d.children==null){
                return d.name+" ("+ d.size+")";
            }
        });
    function zoom(d) {
        var kx = w / d.dx, ky = h / d.dy;
        x.domain([d.x, d.x + d.dx]);
        y.domain([d.y, d.y + d.dy]);

        var t = TreeMapNode.selectAll("g.cell").transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

        t.select("rect")
            .attr("width", function(d) { return kx * d.dx - 1; })
            .attr("height", function(d) { return ky * d.dy - 1; })

        t.select("text")
            .attr("x", function(d) { return kx * d.dx / 2; })
            .attr("y", function(d) { return ky * d.dy / 2; })
            .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });

        node = d;
        d3.event.stopPropagation();
    }
}

function position() {
this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return d.dx - 1 + "px"; })
        .style("height", function(d) { return d.dy - 1 + "px"; });
}
//将"yyyy-MM-dd hh:mm:ss" 字符串转换为DateTime类型返回，主要兼容Safari浏览器
function TimeConvert(_oldtimestr) {
    if (_oldtimestr.indexOf("-") > 0) {
        _oldtimestr = _oldtimestr.replace("-", "/").replace("-", "/");
    }
    if(_oldtimestr.indexOf(".")>-1){
        _oldtimestr=_oldtimestr.substr(0,_oldtimestr.indexOf("."));
    }
    return Date.parse(_oldtimestr);
}
Date.prototype.dateformat = function(format) {
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
//endregion