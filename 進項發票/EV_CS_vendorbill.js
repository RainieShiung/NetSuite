/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

define(['N/record','N/search','N/ui/message','./Common_ColumnCheck','./commonUtil','N/currentRecord','N/error'],
function(record,search,message,common,Util,cRecord,error) {
    function validateField(context) {

        var currentRecord = cRecord.get();
        var sublistName = context.sublistId;
        var sublistFieldName = context.fieldId;
        var line = context.line;
        var trxn_noID ="recmachcustrecord_10_trxn_no";
        var LineCount = currentRecord.getLineCount({"sublistId": trxn_noID});
        
        console.log("fieldId:"+context.fieldId+" ,sublistId:"+context.sublistId + " ,Record:"+context.currentRecord + " ,line:"+context.line+" ,LineCount:"+LineCount);
        if(sublistName === "recmachcustrecord_10_trxn_no"){
            //getCurrentSublistValue    現在畫面的資料
            //getSublistValue   只能用在已儲存的資料
            var FieldValue = currentRecord.getCurrentSublistValue({
                sublistId: sublistName,
                fieldId: sublistFieldName,
                line: line
            });
            if(FieldValue=="" && sublistFieldName != "custrecord_10_format_type")
                return true;

            console.log("FieldValue:"+FieldValue);
            var FieldText = currentRecord.getCurrentSublistText({
                sublistId: sublistName,
                fieldId: sublistFieldName,
                line: line
            });
            var formatType_text = currentRecord.getCurrentSublistText({
                sublistId: sublistName,
                fieldId: "custrecord_10_format_type",
                line: line
            });
            
            if(sublistFieldName === "custrecord_10_sales_no")/*銷售人統一編號*/{
                if(FieldValue=="")
                    return true;
                if(!Util.isValidGUI(FieldValue) ){
                    showMessage("系統訊息","此統一編號不符合邏輯");
                }
            }else if(sublistFieldName === "custrecord_10_format_type")/*憑證格式別*/{   
                if(FieldText.toString().length > 2 ){
                    var gui_noID = "custrecord_10_gui_no"; //發票號碼
                    var other_descID = "custrecord_10_other_desc";   //其他憑證號碼
                    var public_vehicleID = "custrecord_10_public_vehicle";  //公用事業載具(25)
                    var tax_collID = "custrecord_10_customs_tax_coll";//海關代徵營業稅繳納證號碼
    
                    switch(FieldText.toString().substring(0,2)){
                        case "22" :
                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: gui_noID,line: line}).isDisabled = false;    //發票號碼檢核
                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: other_descID,line: line}).isDisabled = false;    //其他憑證號碼
                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: public_vehicleID,line: line}).isDisabled = true; //公用事業載具(25)
                            currentRecord.setCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: public_vehicleID,
                                line: line,
                                value: ""
                            });
                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: tax_collID,line: line}).isDisabled = true;   //海關代徵營業稅繳納證號碼
                            currentRecord.setCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: tax_collID,
                                line: line,
                                value: ""
                            });
                            break;
                        case "25" :
                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: gui_noID,line: line}).isDisabled = false;    //發票號碼檢核
                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: other_descID,line: line}).isDisabled = true;    //其他憑證號碼
                            currentRecord.setCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: other_descID,
                                line: line,
                                value: ""
                            });
                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: public_vehicleID,line: line}).isDisabled = false;    //公用事業載具(25)

                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: tax_collID,line: line}).isDisabled = true;    //海關代徵營業稅繳納證號碼
                            currentRecord.setCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: tax_collID,
                                line: line,
                                value: ""
                            });
                        case "28" :
                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: gui_noID,line: line}).isDisabled = true;    //發票號碼檢核
                            currentRecord.setCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: gui_noID,
                                line: line,
                                value: ""
                            });
                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: other_descID,line: line}).isDisabled = true;    //其他憑證號碼
                            currentRecord.setCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: other_descID,
                                line: line,
                                value: ""
                            });
                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: public_vehicleID,line: line}).isDisabled = true; //公用事業載具(25)
                            currentRecord.setCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: public_vehicleID,
                                line: line,
                                value: ""
                            });
                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: tax_collID,line: line}).isDisabled = false;    //海關代徵營業稅繳納證號碼
                            break;
                        default:
                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: gui_noID,line: line}).isDisabled = true;    //發票號碼檢核
                            currentRecord.setCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: gui_noID,
                                line: line,
                                value: ""
                            });
                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: other_descID,line: line}).isDisabled = true;    //其他憑證號碼
                            currentRecord.setCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: other_descID,
                                line: line,
                                value: ""
                            });

                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: public_vehicleID,line: line}).isDisabled = true; //公用事業載具(25)
                            currentRecord.setCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: public_vehicleID,
                                line: line,
                                value: ""
                            });

                            //currentRecord.getSublistField({sublistId: sublistName,fieldId: tax_collID,line: line}).isDisabled = true;    //海關代徵營業稅繳納證號碼
                            currentRecord.setCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: tax_collID,
                                line: line,
                                value: ""
                            });  
                            break;
                    }
                }
            }else if(sublistFieldName === "custrecord_10_other_desc")/*其他憑證號碼*/{
                if(formatType_text.toString().length > 2 && formatType_text.toString().substring(0,2)=='22'){
                    common.OtherDescCheck(FieldValue);
                }else if(FieldValue!=""){
                    showMessage('系統訊息','格式別不為22，其他憑證號碼需為空值');
                    return false;
                }
            }else if(sublistFieldName === "custrecord_vendor_tax_code")/*廠商稅碼*/{
                if(FieldValue=="")
                    return true;

                var format_typeID="custrecord_10_format_type";
                var gv_tax_code="custrecord_10_tax_code";
                var tax_cacl_typeID="custrecord_10_tax_calc_type";

                var arrayValue = common.GetValueByTaxType(FieldValue);
                if(arrayValue!=null){
                    currentRecord.setCurrentSublistValue({
                        sublistId: trxn_noID,
                        fieldId: format_typeID,
                        line: line,
                        value: arrayValue[0]
                    });
                    currentRecord.setCurrentSublistValue({
                        sublistId: trxn_noID,
                        fieldId: gv_tax_code,
                        line: line,
                        value: arrayValue[1]
                    });
                    currentRecord.setCurrentSublistValue({
                        sublistId: trxn_noID,
                        fieldId: tax_cacl_typeID,
                        line: line,
                        value: arrayValue[2]
                    });
                }

                var salesamt= currentRecord.getCurrentSublistText({
                    sublistId: sublistName,
                    fieldId: "custrecord_10_sales_total_amt",
                    line: line
                });
                if(salesamt!=""){
                    SetTaxAmout(salesamt,FieldText,line);
                }
            }else if(sublistFieldName === "custrecord_10_tax_code")/*課稅類別 課稅別*/{
    
            }else if(sublistFieldName === "custrecord_10_gui_no")/*發票號碼檢核 custrecord_10_gui_no*/{
                if(formatType_text.toString().length > 2 && (formatType_text.toString().substring(0,2)=='22' || formatType_text.toString().substring(0,2)=='25')){
                    
                }else if(FieldValue!=""){
                    showMessage('系統訊息','格式別不為22,25，發票號碼需為空值');
                    return false;
                }

                if(IsUnModified(context))
                    return true;
                var date = currentRecord.getCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: "custrecord_10_gui_date",
                        line: line
                });
                var year = 0;
                var month = 0;
                if(date!=null && date!=""){
                    year = date.getFullYear();  //憑證日期 年
                    month = date.getMonth()+1;  //憑證日期 月
                    common.invoiceCheck(FieldValue,year,month);
                }
            }else if(sublistFieldName === "custrecord_10_public_vehicle")/*公用事業載具(25)*/{
                if(formatType_text.toString().length > 2 && formatType_text.toString().substring(0,2)=='25'){
                    if(IsUnModified(context))
                        return true;
                    common.PublicVehicleCheck(FieldValue);
                }else if(FieldValue!=""){
                    showMessage('系統訊息','格式別不為25，公用事業載具需為空值');
                    return false;
                }
            }else if(sublistFieldName === "custrecord_10_customs_tax_coll")/*海關代徵營業稅繳納證號碼*/{
                if(formatType_text.toString().length > 2 && formatType_text.toString().substring(0,2)=='28'){
                    if(IsUnModified(context))
                        return true;
                    common.TaxCollCheck(FieldValue);
                }else if(FieldValue!=""){
                    showMessage('系統訊息','格式別不為28，海關代徵營業稅繳納證號碼需為空值');
                    return false;
                }
            }else if(sublistFieldName === "custrecord_10_gui_date")/*憑證日期*/{
                if(FieldValue!=null && FieldValue!=""){
                    var year = parseInt(FieldValue.getFullYear());    //憑證日期 年
                    var month = parseInt(FieldValue.getMonth())+1;    //憑證日期 月
                    
                    currentRecord.setCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: 'custrecord_10_occured_year',
                        line: line,
                        value: year
                    });
                    currentRecord.setCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: 'custrecord_10_occured_month',
                        line: line,
                        value: month
                    });
                    return true;
                }
            }else if(sublistFieldName === "custrecord_10_sales_total_amt")/*銷售金額*/{
                var taxtype= currentRecord.getCurrentSublistText({
                    sublistId: sublistName,
                    fieldId: "custrecord_vendor_tax_code",
                    line: line
                });

                if(FieldValue=="" || taxtype==""){
                    return true;
                }
                SetTaxAmout(FieldValue,taxtype,line);   
            }else if(sublistFieldName === "custrecord_10_occured_year" 
                || sublistFieldName==="custrecord_10_occured_month" 
                || sublistFieldName==="custrecord_10_registration_number")/*所屬年 所屬月 稅籍編號*/{
                var year = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custrecord_10_occured_year',
                    line: line
                });
                var month = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custrecord_10_occured_month',
                    line: line
                });
                var registration_number = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custrecord_10_registration_number',
                    line: line
                });
                common.DateCheck(year,month,registration_number);
                return true;
            }
        }
        if(sublistFieldName === "entity"){
            var vendor_name = currentRecord.getText("entity");
            
            if(vendor_name != ""){
                //統編預設
                currentRecord.setCurrentSublistValue({
                    sublistId: trxn_noID,
                    fieldId: "custrecord_10_sales_no",
                    line: LineCount,
                    value: common.SetValueSalesNo(vendor_name)
                });
            }else{
                return true;
            }
            // var isOneWorld = Util.fun_IsOneWorld(currentRecord);
            // var subsidiary;
            // var taxtype = "";

            // if (isOneWorld)
            // {
            //     subsidiary = currentRecord.getText("subsidiary");
            //     if(subsidiary==null || subsidiary=="" ){
            //         return;
            //     }
            //     taxtype = common.GetTaxTypeByVandor(vendor_name,subsidiary);
            // } else {
            //     subsidiary = "Parent Company";
            //     taxtype = common.GetTaxTypeByVandor(vendor_name,"NotOneWorld");
            // }
            // if(taxtype != ""){
            //     currentRecord.setCurrentSublistValue({
            //         sublistId: trxn_noID,
            //         fieldId: "custrecord_vendor_tax_code",
            //         line: LineCount,
            //         value: taxtype
            //     });
            // }
            
        }
        /*else if(sublistFieldName == "usertotal" || sublistFieldName == "taxtotal"){
            var sales_total_amt = currentRecord.getCurrentSublistValue({
                sublistId: trxn_noID,
                fieldId: "custrecord_10_sales_total_amt"
            });
            var vat_io = currentRecord.getCurrentSublistValue({
                sublistId: trxn_noID,
                fieldId: "custrecord_10_vat_io"
            });
            var sales_amt = currentRecord.getCurrentSublistValue({
                sublistId: trxn_noID,
                fieldId: "custrecord_10_sales_amt"
            });
            var AMOUNT = currentRecord.getValue("usertotal");
            var TAX = currentRecord.getValue("taxtotal");
    
            if(AMOUNT!=0 && 
            TAX!=0 && 
            sales_total_amt=="" && 
            vat_io=="" &&
            sales_amt=="")
            {
                var exchangeRate = currentRecord.getValue("exchangerate");
                currentRecord.setCurrentSublistValue({
                    sublistId: trxn_noID,
                    fieldId: "custrecord_10_sales_total_amt",
                    value: AMOUNT*exchangeRate + TAX*exchangeRate
                });
    
                var tax_type =currentRecord.getCurrentSublistValue({
                    sublistId: trxn_noID,
                    fieldId: "custrecord_vendor_tax_code"
                });
                
                if(tax_type == ""){
                    currentRecord.setCurrentSublistValue({
                        sublistId: trxn_noID,
                        fieldId: "custrecord_10_vat_io",
                        value: TAX*exchangeRate
                    });
                    currentRecord.setCurrentSublistValue({
                        sublistId: trxn_noID,
                        fieldId: "custrecord_10_sales_amt",
                        value: AMOUNT*exchangeRate
                    });
                }
            }
        }*/

        return true;
    }

    function saveRecord(context) {
        var currentRecord = context.currentRecord;
        //var IsError = false;
        var ErrorMessage = "";  //錯誤訊息
        var trxn_noID = "recmachcustrecord_10_trxn_no";
        var LineCount = currentRecord.getLineCount({"sublistId": trxn_noID}); //進項發票資訊的sublist數
        var gui_noID = "custrecord_10_gui_no" //發票號碼
        var other_descID = "custrecord_10_other_desc"   //其他憑證號碼
        var public_vehicleID = "custrecord_10_public_vehicle";  //公用事業載具(25)
        var tax_collID = "custrecord_10_customs_tax_coll"
        var sales_noID = "custrecord_10_sales_no"
        var Total_vatIo = 0;    //憑證稅額加總
        var Total_totalAmt = 0; //憑證含稅總額加總

        for(var i =0;i<LineCount;i++){
            var orgRecord=null; //原本的的資料
            var id = currentRecord.getSublistValue({
                sublistId: trxn_noID,
                fieldId: "id",
                line: i
            });
            if(id!=""){
                orgRecord = record.load({
                    type: "customrecord_ev_pay_invoices_all", 
                    id: id,
                    isDynamic: true,
                });
            };

            var gui_date_year = parseInt(currentRecord.getSublistValue({ //憑證日期 年
                sublistId: trxn_noID,
                fieldId: "custrecord_10_gui_date",
                line: i
            }).getFullYear());
            var gui_date_month = parseInt(currentRecord.getSublistValue({    //憑證日期 月
                sublistId: trxn_noID,
                fieldId: "custrecord_10_gui_date",
                line: i
            }).getMonth())+1;
            var sales_no = currentRecord.getSublistValue({   //統一編號
                sublistId: trxn_noID,
                fieldId: sales_noID,
                line: i
            });
            var guiNo = currentRecord.getSublistValue({  //發票號碼
                sublistId: trxn_noID,
                fieldId: gui_noID,
                line: i
            });
            var formatType = currentRecord.getSublistText({ //格式別
                sublistId: trxn_noID,
                fieldId: "custrecord_10_format_type",
                line: i
            });
            //銷售人統一編號
            if( !Util.isValidGUI( sales_no )){
                ErrorMessage += "進項發票資訊第"+(i+1).toString()+"筆資料，此統一編號不符合邏輯\n";
            }

            //憑證格式別
            if(formatType.toString().length > 2 ){
                switch(formatType.toString().substring(0,2)){
                    case "22" :
                        var otherDesc = currentRecord.getCurrentSublistValue({
                            sublistId: trxn_noID,
                            fieldId: other_descID,
                            line: i
                        });
                        if(orgRecord!=null){    //edit
                            var Isgui_noCheck = true;
                            var Isother_descCheck = true;

                            if(orgRecord.getValue(gui_noID) != guiNo && guiNo!=""){
                                Isgui_noCheck = common.invoiceCheck( guiNo,gui_date_year,gui_date_month);
                                console.log("gui_noID:"+guiNo);
                            }
                            if(orgRecord.getValue(other_descID) != otherDesc && otherDesc!=""){
                                Isother_descCheck = common.OtherDescCheck(otherDesc);
                                console.log("other_descID:"+other_descID);
                            }
                            if( !(Isgui_noCheck && Isother_descCheck)){
                                ErrorMessage += "進項發票資訊第"+(i+1).toString()+"筆資料，發票號碼檢核，其他憑證號碼檢驗失敗\n";
                            }
                        }else{  //create
                            //發票號碼檢核
                            if(!common.invoiceCheck( guiNo ,gui_date_year,gui_date_month) && 
                                !common.OtherDescCheck(otherDesc)){
                                ErrorMessage += "進項發票資訊第"+(i+1).toString()+"筆資料，發票號碼檢核，其他憑證號碼檢驗失敗\n";
                            }
                        }
                        break;
                    case "25" :
                        //發票號碼檢核      如果(是edit，且資料有改過，且不是空值的時候) 或著 是create 的情況下
                        if((orgRecord!=null && orgRecord.getValue(gui_noID) != guiNo && guiNo!="") || orgRecord==null){
                            if(!common.invoiceCheck( guiNo ,gui_date_year,gui_date_month)){
                                ErrorMessage += "進項發票資訊第"+(i+1).toString()+"筆資料，發票號碼檢核檢驗失敗\n";
                            } 
                        }

                        var publicVehicle = currentRecord.getCurrentSublistValue({
                            sublistId: trxn_noID,
                            fieldId: public_vehicleID,
                            line: i
                        });
                        //如果 不回空值 且 ( (是edit，且資料有改過) 或 (是create) )
                        if(publicVehicle!="" && ((orgRecord!=null && orgRecord.getValue(public_vehicleID) != publicVehicle) || orgRecord==null)){
                            if(!common.PublicVehicleCheck(publicVehicle)) //公用事業載具(25)
                                ErrorMessage += "進項發票資訊第"+(i+1).toString()+"筆資料，公用事業載具檢驗失敗\n";
                        }
                        break;
                    case "28" :
                        var taxColl = currentRecord.getCurrentSublistValue({
                            sublistId: trxn_noID,
                            fieldId: tax_collID,
                            line: i
                        });
                        if((orgRecord!=null && orgRecord.getValue(tax_collID) != taxColl) || orgRecord==null){
                            if(!common.TaxCollCheck(taxColl))   //海關代徵營業稅繳納證號碼
                                ErrorMessage += "進項發票資訊第"+(i+1).toString()+"筆資料，e號碼檢驗失敗\n";
                        }
                        break;
                    default:
                        break;
                }
            }else{
                ErrorMessage += "進項發票資訊第"+(i+1).toString()+"筆資料，格式別未選擇\n";
            }

            if(i< Math.round(LineCount/2)){

                for(var j=i+1;j<LineCount;j++){
                    var display_J = currentRecord.getSublistValue({
                        sublistId: trxn_noID,
                        fieldId: gui_noID,
                        line: j
                        });
                        if(display_J == guiNo){
                        ErrorMessage += "[進項發票資訊] 發票號碼第"+(i+1).toString()+"筆資料與第"+(j+1).toString()+"筆資料重複\n";
                    }
                }
            }
            
            Total_vatIo +=currentRecord.getSublistValue({  //憑證稅額
                sublistId: trxn_noID,
                fieldId: "custrecord_10_vat_io",
                line: i
            });
            
            Total_totalAmt +=currentRecord.getSublistValue({  //憑證含稅總額
                sublistId: trxn_noID,
                fieldId: "custrecord_10_sales_total_amt",
                line: i
            });
        }
        var exchangeRate = currentRecord.getValue("exchangerate");
        var TAX = currentRecord.getValue("taxtotal");
        var AMOUNT = currentRecord.getValue("usertotal");
        
        if((TAX*exchangeRate - Total_vatIo) > 1){
            ErrorMessage += "Bill [TAX]*Bill[Exchange Rate] - 明細行發票稅額加總 必須<=1";
        }
        if((AMOUNT*exchangeRate - Total_totalAmt) > 1){ 
            ErrorMessage += "Bill [Amount]*Bill[Exchange Rate] - 明細行發票含稅總額加總 必須<=1";
        }

        if(ErrorMessage!=""){
            var err = error.create({
                name: '系統訊息', 
                message: ErrorMessage+'資料檢核有誤，無法儲存'
            });
            throw err.message;
        }else{
            //go save
            return true;
        }
    }

    function lineInit(context) {
        var currentRecord = context.currentRecord;
        var sublistName = context.sublistId;
        //var sublistFieldName = context.fieldId;
        var line = context.line;
        var LineCount = currentRecord.getLineCount({"sublistId": "recmachcustrecord_10_trxn_no"});
        var trxn_noID ="recmachcustrecord_10_trxn_no";
        //console.log("fieldId:"+context.fieldId+" ,sublistId:"+context.sublistId + " ,Record:"+context.currentRecord + " ,line:"+context.line+" ,LineCount:"+LineCount);
        if(sublistName === trxn_noID){
            // var vendor_name = currentRecord.getText("entity");
            // if(vendor_name != ""){
            //     //統編預設
            //     currentRecord.setCurrentSublistValue({
            //         sublistId: trxn_noID,
            //         fieldId: "custrecord_10_sales_no",
            //         line: LineCount,
            //         value: common.SetValueSalesNo(vendor_name)
            //     });
            // }else{
            //     return true;
            // }
            // var isOneWorld = Util.fun_IsOneWorld(currentRecord);
            // var subsidiary;
            // var taxtype = "";

            // if (isOneWorld)
            // {
            //     subsidiary = currentRecord.getText("subsidiary");
            //     if(subsidiary==null || subsidiary=="" ){
            //         return;
            //     }
            //     taxtype = common.GetTaxTypeByVandor(vendor_name,subsidiary);
            // } else {
            //     subsidiary = "Parent Company";
            //     taxtype = common.GetTaxTypeByVandor(vendor_name,"NotOneWorld");
            // }
            // if(taxtype != ""){
            //     currentRecord.setCurrentSublistValue({
            //         sublistId: trxn_noID,
            //         fieldId: "custrecord_vendor_tax_code",
            //         line: LineCount,
            //         value: taxtype
            //     });
            // }
            var sales_total_amt = currentRecord.getCurrentSublistValue({
                sublistId: trxn_noID,
                fieldId: "custrecord_10_sales_total_amt"
            });
            var vat_io = currentRecord.getCurrentSublistValue({
                sublistId: trxn_noID,
                fieldId: "custrecord_10_vat_io"
            });
            var sales_amt = currentRecord.getCurrentSublistValue({
                sublistId: trxn_noID,
                fieldId: "custrecord_10_sales_amt"
            });
            var AMOUNT = currentRecord.getValue("usertotal");
            var TAX = currentRecord.getValue("taxtotal");
    
            if(AMOUNT!=0 && 
            TAX!=0 && 
            sales_total_amt=="" && 
            vat_io=="" &&
            sales_amt=="")
            {
                var exchangeRate = currentRecord.getValue("exchangerate");
                currentRecord.setCurrentSublistValue({
                    sublistId: trxn_noID,
                    fieldId: "custrecord_10_sales_total_amt",
                    value: AMOUNT*exchangeRate + TAX*exchangeRate
                });
    
                var tax_type =currentRecord.getCurrentSublistValue({
                    sublistId: trxn_noID,
                    fieldId: "custrecord_vendor_tax_code"
                });
                
                if(tax_type == ""){
                    currentRecord.setCurrentSublistValue({
                        sublistId: trxn_noID,
                        fieldId: "custrecord_10_vat_io",
                        value: TAX*exchangeRate
                    });
                    currentRecord.setCurrentSublistValue({
                        sublistId: trxn_noID,
                        fieldId: "custrecord_10_sales_amt",
                        value: AMOUNT*exchangeRate
                    });
                }
            }
        }else if (sublistName === "expense"){
            var sales_total_amt = currentRecord.getCurrentSublistValue({
                sublistId: trxn_noID,
                fieldId: "custrecord_10_sales_total_amt"
            });
            var vat_io = currentRecord.getCurrentSublistValue({
                sublistId: trxn_noID,
                fieldId: "custrecord_10_vat_io"
            });
            var sales_amt = currentRecord.getCurrentSublistValue({
                sublistId: trxn_noID,
                fieldId: "custrecord_10_sales_amt"
            });
            var AMOUNT = currentRecord.getValue("usertotal");
            var TAX = currentRecord.getValue("taxtotal");
    
            if(AMOUNT!=0 && 
            TAX!=0 && 
            sales_total_amt=="" && 
            vat_io=="" &&
            sales_amt=="")
            {
                var exchangeRate = currentRecord.getValue("exchangerate");
                currentRecord.setCurrentSublistValue({
                    sublistId: trxn_noID,
                    fieldId: "custrecord_10_sales_total_amt",
                    value: AMOUNT*exchangeRate + TAX*exchangeRate
                });
    
                var tax_type =currentRecord.getCurrentSublistValue({
                    sublistId: trxn_noID,
                    fieldId: "custrecord_vendor_tax_code"
                });
                
                if(tax_type == ""){
                    currentRecord.setCurrentSublistValue({
                        sublistId: trxn_noID,
                        fieldId: "custrecord_10_vat_io",
                        value: TAX*exchangeRate
                    });
                    currentRecord.setCurrentSublistValue({
                        sublistId: trxn_noID,
                        fieldId: "custrecord_10_sales_amt",
                        value: AMOUNT*exchangeRate
                    });
                }
            }
        }
        return true;
    }

    function showMessage(title,context){
        var myMsg = message.create({
            title: title, 
            message: context, 
            type: message.Type.WARNING
        });
        // will disappear after 5s
        myMsg.show({
            duration: 5000
        });
    }

    function SetTaxAmout(amt,taxtype,line){
        var taxRate = Util.GetTaxRate(taxtype);
        
        if(taxRate!=0 && taxRate!="" && taxRate!=null){
            var currentRecord = cRecord.get();
            taxRate = parseFloat(taxRate.replace('%', ''))/100;
            //console.log(taxRate);

            currentRecord.setCurrentSublistValue({
                sublistId: "recmachcustrecord_10_trxn_no",
                fieldId: 'custrecord_10_vat_io',
                line: line,
                value: amt - Math.round(amt / (taxRate+1))
            });
            currentRecord.setCurrentSublistValue({
                sublistId: "recmachcustrecord_10_trxn_no",
                fieldId: 'custrecord_10_sales_amt',              
                line: line,
                value: Math.round(amt / (taxRate+1))
            });
        }
    }

    //是edit且沒有異動的話 直接return不需做檢核
    function IsUnModified(context){
        var currentRecord = context.currentRecord;
        var sublistName = context.sublistId;
        var sublistFieldName = context.fieldId;
        var line = context.line;
        var id = currentRecord.getCurrentSublistValue({
            sublistId: sublistName,
            fieldId: "id",
            line: line
        });
        if(id!=""){;
            var orgRecord = record.load({
                type: "customrecord_ev_pay_invoices_all", 
                id: id,
                isDynamic: true,
            });
            var FieldValue = currentRecord.getCurrentSublistValue({
                sublistId: sublistName,
                fieldId: sublistFieldName,
                line: line
            });
            var orgValue =orgRecord.getValue(sublistFieldName);
            console.log("FieldValue:"+FieldValue + " ,orgValue:"+orgValue);
            if(orgValue == FieldValue){
                console.log("資料"+sublistFieldName+"沒修改不須檢核");
                return true;
            }
        }
        return false;
    }

    return {
        validateField: validateField,
        saveRecord: saveRecord//,
        //lineInit: lineInit
    };
});
