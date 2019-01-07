/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

define(['N/record','N/search','N/ui/message'],
function(record,search,message) {
    function validateField(context) {
        //console.log("fieldId:"+context.fieldId+" ,sublistId:"+context.sublistId + " ,Record:"+context.currentRecord + " ,line:"+context.line + " ,FieldValue:"+FieldValue);

        var currentRecord = context.currentRecord;
        var sublistName = context.sublistId;
        var sublistFieldName = context.fieldId;
        var line = context.line;

        

        //進項折讓明細
        /* sublistName取得：
            1、複製網址+&xml=T
            2、找machine開頭的標籤*/
        if(sublistName == "recmachcustrecord_13_parent_id"){
            var FieldValue = currentRecord.getCurrentSublistValue({
                sublistId: sublistName,
                fieldId: sublistFieldName,
                line: line
            });

            //console.log(sublistFieldName);
            /* 取得sublistFieldName：
                1、alert(sublistFieldName);A欄位移到B欄位的時候，會Alert(A欄位名稱) */
            if(sublistFieldName ==="custrecord_13_gui_number")/*憑證號碼*/{
                if(FieldValue=="")
                    return true;
                
                if(FieldValue.length == 10){
                    //前2位為大寫英文
                    for(var i=0;i<2;i++){
                        if(FieldValue.substring(i,i+1).match(/^.*[^A-Z]+.*$/) == null){
                            showMessage("系統訊息","字軌錯誤");
                            return true;
                        }
                    }
                    //後8為數字
                    for(var i=2;i<10;i++){
                        if(isNaN(FieldValue.substring(i,i+1))){
                            showMessage("系統訊息","發票號碼數字部份錯誤");
                            return true;
                        }
                    }

                    var customrecord_ev_pay_invoices_allSearchObj = search.create({
                        type: "customrecord_ev_pay_invoices_all",
                        filters:
                        [
                           ["name","is",FieldValue]
                        ],
                        columns:
                        [
                           search.createColumn({
                              name: "name",
                              sort: search.Sort.ASC,
                              label: "Name"
                           })
                        ]
                    });
                    var searchResultCount = customrecord_ev_pay_invoices_allSearchObj.runPaged().count;
                    if(searchResultCount == 0){
                        showMessage("系統訊息","此憑證號碼不存在");
                        return true;
                    }
                }else{
                    showMessage("系統訊息","發票號碼長度有誤(10碼)");
                }
            }else if(sublistFieldName === "custrecord_13_line_ntd_amount")/*折讓金額*/{

                if(FieldValue == 0){
                    showMessage("系統訊息","折讓金額不得為0");
                    return true;
                }
                //var Discounted_amt = currentRecord.getValue("custrecord_13_cm_gui_line_amount");   //已折讓金額
                var Discounted_amt = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: "custrecord_13_cm_gui_line_amount",
                    line: line
                });

                var sales_amt = currentRecord.getValue("custrecord_13_gui_sales_amt");  //憑證金額
    
                if(isNaN(Discounted_amt))
                    Discounted_amt = 0;
                if(isNaN(sales_amt))
                    sales_amt = 0;
    
                if( (FieldValue + Discounted_amt) > sales_amt){
                    showMessage("系統訊息","折讓金額已超折");
                }
            }else if(sublistFieldName === "custrecord_13_tax_ntd_amount")/*折讓稅額*/{
                var tax_amt = currentRecord.getValue("custrecord_13_cm_gui_tax_amount");   //已折讓稅額
                var vat_io = currentRecord.getValue("custrecord_13_gui_vat_io");  //憑證稅額
                if(isNaN(tax_amt))
                    tax_amt = 0;
                if(isNaN(vat_io))
                    vat_io = 0;
                if( (FieldValue + tax_amt) > vat_io){
                    showMessage("系統訊息",currentRecord.getValue("custrecord_13_gui_number")+"折讓稅額已超折");
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

    return {
        validateField: validateField
    };
});
