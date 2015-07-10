/**
 * Created by Mr_hu on 2015/5/26.
 */
var serviceurl="http://localhost/DataBaseManager/Service1.asmx";
var QueryData=function(_sql,_callfun){
    var parobj={
        sql:_sql
    }
    parobj=JSON.stringify(parobj);
    $.post(
        serviceurl+"/" +"GetDataBySQL",
        { "jsonData": parobj},
        function (_result) {
            _callfun(JSON.parse(_result));
        },
        "json");
}