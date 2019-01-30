/**
 * @NApiVersion 2.x
 */

define(['N/record','N/search','N/ui/message','N/error'],
function(record,search,message,error) {
    //稅籍編號 所屬年 所屬月要符合開關帳設定
    function DateCheck(yearValue,monthValue,registrationValue){

        //var startmonth = monthValue;
        //var endmonth = monthValue;
        var IsError = false;
        var IsAllCheck = true;  //是否年月都有填
        if(yearValue=="" || yearValue==null || isNaN(yearValue)){
            //yearValue = "%";    //如果還沒設定條件的話，年就設萬用字元
            IsAllCheck = false;
        }

        if(monthValue=="" || monthValue==null || isNaN(monthValue)){
            //startmonth=1;   //如果還沒設定條件的話，就是1~12月
            //endmonth=12;
            IsAllCheck = false;
        }

        if(registrationValue=="" || registrationValue==null || registrationValue.trim()==""){
            IsAllCheck = false;
        }
        if(IsAllCheck){
            var customrecord_ev_apply_status_allSearchObj = search.create({
                type: "customrecord_ev_apply_status_all",
                filters:
                [
                    ["custrecord_22_occured_year","is",yearValue], 
                    "AND", 
                    ["custrecord_22_occured_month","equalto",monthValue], 
                    "AND", 
                    ["custrecord_22_registration_number","anyof",registrationValue]
                ],
                columns:
                [
                    search.createColumn({
                        name: "custrecord_22_registration_number",
                        sort: search.Sort.ASC,
                        label: "稅籍編號"
                    }),
                    search.createColumn({
                        name: "custrecord_22_occured_year",
                        sort: search.Sort.ASC,
                        label: "年"
                    }),
                    search.createColumn({
                        name: "custrecord_22_occured_month",
                        sort: search.Sort.ASC,
                        label: "月"
                    }),
                    search.createColumn({name: "custrecord_22_pay_apply_status", label: "進項"}),
                    search.createColumn({name: "custrecord_22_rec_apply_status", label: "銷項"}),
                    search.createColumn({name: "custrecord_22_declaration_flag", label: "已申報"})
                ]
            });
            var searchResultCount = customrecord_ev_apply_status_allSearchObj.runPaged().count;
            if(searchResultCount > 0){
                log.debug("customrecord_ev_apply_status_allSearchObj result count",searchResultCount);
                customrecord_ev_apply_status_allSearchObj.run().each(function(result){
                    
                    var declaration_flag = result.getText({
                        name: 'custrecord_22_declaration_flag'
                    });
                    var pay_apply_status = result.getText({
                        name: 'custrecord_22_pay_apply_status'
                    });

                    if(declaration_flag == "Yes"){
                        showMessage("系統訊息","該月份已申報");
                        IsError = true;
                        //return false;
                    }
                    if(pay_apply_status == "CLOSE"){
                        showMessage("系統訊息","該月份已關帳");
                        IsError = true;
                        //return false;
                    }
                    return false;
                });
            }else if(searchResultCount == 0){
                //showMessage("系統訊息","找不到此年月");
                return false;
                //找不到此設定資料
            }
        }else{
            return false;
        }
        return !IsError;
    }

    function OtherDescCheck(otherDescValue){
        if(otherDescValue=="")
            return false;
        if(otherDescValue.length != 10){
            showMessage("系統訊息","其他憑證號碼必須為10碼");
            return false;
        }else{
            var customrecord_ev_pay_invoices_allSearchObj = search.create({
                type: "customrecord_ev_pay_invoices_all",
                filters:
                [
                   ["custrecord_10_other_desc","is",otherDescValue]
                ],
                columns:
                [
                   search.createColumn({name: "custrecord_10_other_desc", label: "OTHER_DESC"})
                ]
            });
            var searchResultCount = customrecord_ev_pay_invoices_allSearchObj.runPaged().count;
            if(searchResultCount > 0){
                showMessage("系統訊息","其他憑證號碼不可重複");
                return false;
            }
            return true;
        }
    }

    function invoiceCheck(invoiceValue,year,month){
        if(invoiceValue == "")
            return false;
        if(invoiceValue.length >= 10){
            /*
            if(invoiceValue.length == 12){
                if(invoiceValue.substring(10,11)!= '-' ){
                    showMessage("系統訊息","第11位字元應為 -");
                }
                if(isNaN(invoiceValue.substring(11,12)) ){
                    showMessage("系統訊息","第12位字元應為數字");
                }
            }*/
            for(var i = 2 ; i < 10 ; i++){
                if(isNaN(invoiceValue.substring(i,i+1))){
                    showMessage("系統訊息","3至10為字元應為數字");
                    return false;
                }
            }

            var customrecord_ev_gui_words_allSearchObj = search.create({
                type: "customrecord_ev_gui_words_all",
                filters:
                [
                    ["custrecord_17_gui_word","is",invoiceValue.substring(0,2)], 
                    "AND", 
                    ["custrecord_17_gui_beg_month","lessthanorequalto",month],
                    "AND", 
                    ["custrecord_17_gui_end_month","greaterthanorequalto",month],
                    "AND", 
                    ["custrecord_17_gui_year","equalto",year]
                ],
                columns:
                [
                    search.createColumn({
                        name: "custrecord_17_gui_word",
                        sort: search.Sort.ASC,
                        label: "字軌"
                    }),
                    search.createColumn({
                        name: "custrecord_17_gui_year",
                        sort: search.Sort.ASC,
                        label: "年度"
                    }),
                    search.createColumn({
                        name: "custrecord_17_gui_beg_month",
                        sort: search.Sort.ASC,
                        label: "起月"
                    }),
                    search.createColumn({
                        name: "custrecord_17_gui_beg_month",
                        sort: search.Sort.ASC,
                        label: "起月"
                    }),
                    search.createColumn({name: "custrecord_17_gui_end_month", label: "迄月"}),
                    search.createColumn({name: "custrecord_17_format_type_3", label: "手開三聯式"}),
                    search.createColumn({name: "custrecord_17_format_type_2", label: "手開二聯式"}),
                    search.createColumn({name: "custrecord_17_format_type_5", label: "收銀機三聯式"}),
                    search.createColumn({name: "custrecord_17_format_type_4", label: "收銀機二聯式"}),
                    search.createColumn({name: "custrecord_17_format_type_e", label: "電子式"}),
                    search.createColumn({name: "custrecord_17_einvoice_flag", label: "電子發票"})
                ]
            });
            var searchResultCount = customrecord_ev_gui_words_allSearchObj.runPaged().count;
            if(searchResultCount == 0){
                showMessage("系統訊息","發票字軌設定檢核失敗");
                return false;
            }
            
            //重複判斷
            var customrecord_ev_pay_invoices_allSearchObj = search.create({
                type: "customrecord_ev_pay_invoices_all",
                filters:
                [
                    ["custrecord_10_gui_no","contains",invoiceValue.substring(0,10)]
                ],
                columns:
                [
                    search.createColumn({
                        name: "custrecord_10_gui_no",
                        sort: search.Sort.ASC,
                        label: "發票號碼"
                    }),
                    search.createColumn({name: "custrecord_10_gui_date"})
                ]
            }); 
            var gui_nosearchResultCount = customrecord_ev_pay_invoices_allSearchObj.runPaged().count;
            if(gui_nosearchResultCount > 0){
                var IsError = false;
                customrecord_ev_pay_invoices_allSearchObj.run().each(function(result){
                    var gui_date = result.getValue({
                        name: 'custrecord_10_gui_date'
                    });
                    var gui_date_format = gui_date.split("/");
                    var gui_date_year = parseInt(gui_date_format[2]);

                    var gui_no = result.getValue({
                        name: 'custrecord_10_gui_no'
                    });

                    if(gui_date_year == year && gui_no == invoiceValue){
                        IsError = true;
                        return false;
                    }
                    return true;
                });
                if(IsError){
                    showMessage("系統訊息","發票號碼不可重複。");
                    return false;
                }else{
                    showMessage("系統訊息","發票號碼重複，但可存檔。");
                }
                return true;
            }
        }else{
            showMessage("系統訊息","字串總數錯誤需為10位數或12位數");
            return false;
        }
        return true;
    }

    function PublicVehicleCheck(FieldValue){
        if(FieldValue == "")
            return false;
        if(FieldValue.length == 10){
            //前二位為BB
            if(FieldValue.substring(0,2)!= "BB"){
                showMessage("系統訊息","公用事業載具證號碼有誤");
                return false;    
            }
            //後8為大寫英文或數字
            for(var i=2;i<10;i++){
                if(FieldValue.substring(i,i+1).match(/[0-9A-Z]+/g) == null){
                    showMessage("系統訊息","公用事業載具證號碼有誤");
                    return false;
                }
            }
            return true;
        }else{
            showMessage("系統訊息","公用事業載具證號碼長度有誤");
            return false;
        }
    }

    function TaxCollCheck(FieldValue){
        if(FieldValue == "")
            return false;
        if(FieldValue.length == 14){
            //前三位為大寫英文
            for(var i=0;i<3;i++){
                if(FieldValue.substring(i,i+1).match(/^.*[^A-Z]+.*$/) == null){
                    showMessage("系統訊息","海關代徵營業稅繳納證號碼有誤");
                    return false;
                }
            }
            //後11為數字
            for(var i=3;i<14;i++){
                if(isNaN(FieldValue.substring(i,i+1))){
                    showMessage("系統訊息","海關代徵營業稅繳納證號碼有誤");
                    return false;
                }
            }

            var customrecord_ev_pay_invoices_allSearchObj = search.create({
                type: "customrecord_ev_pay_invoices_all",
                filters:
                [
                   ["custrecord_10_customs_tax_coll","is",FieldValue]
                ],
                columns:
                [
                   search.createColumn({name: "custrecord_10_customs_tax_coll", label: "海關代徵稅單號碼(28)"})
                ]
            });
            var searchResultCount = customrecord_ev_pay_invoices_allSearchObj.runPaged().count;
            if(searchResultCount > 0){
                showMessage("系統訊息","海關代徵營業稅繳納證號碼不可重複");
                return false;
            }
            return true;
        }else{
            showMessage("系統訊息","海關代徵營業稅繳納證號碼有誤");
            return false;
        }
    }

    function SetValueSalesNo(FieldValue){
        var vatregnumber="";
        var vendorSearchObj = search.create({
            type: "vendor",
            filters:
            [
                ["entityid","is",FieldValue]
            ],
            columns:
            [
                search.createColumn({
                    name: "entityid",
                    sort: search.Sort.ASC,
                    label: "ID"
                }),
                search.createColumn({name: "vatregnumber", label: "Tax Number"})
            ]
        });
        var vendorsearchResultCount = vendorSearchObj.runPaged().count;
        if(vendorsearchResultCount == 1){
            vendorSearchObj.run().each(function(result){
                //統一編號(TAX REG.
                vatregnumber = result.getValue({
                    name: 'vatregnumber'
                });
                if(vatregnumber == null){
                    vatregnumber = result.getText({
                        name: 'vatregnumber'
                    });
                }
                return false;
            });
        }
        if(vatregnumber == null){
            vatregnumber ="";
        }
        return vatregnumber;
    }

    function SetValueByVandor(vandor,subsidiary){

        var taxcode = "";
        var type = "vendorsubsidiaryrelationship";  //record type
        var search_Name =  "taxitem";       //tax code
        var filter_1_Name = "entity";       //filter條件!的欄位名稱
        var filter_1_Operation = "anyof";   //filter條件1的運算式
        var filter_1_Value = vandor;        //filter條件1的VALUE
        var filter_2_Name = "subsidiary";   //我相信你看得懂這是filter條件2的欄位名稱
        var filter_2_Operation = "anyof";   //filter條件2的運算式
        var filter_2_Value = subsidiary;    //filter條件2的VALUE

        //如果不是OneWorld的話 要用另一張表抓tax code
        if(subsidiary == "NotOneWorld"){
            type = "entity";
            search_Name =  "custentitycustentity_ap_taxcode";
            filter_1_Name = "type";
            filter_1_Operation = "anyof";
            filter_1_Value = "Vendor";
            filter_2_Name = "entityid";
            filter_2_Operation = "is";
            filter_2_Value = vandor; 
        }

        var vendorsubsidiaryrelationshipSearchObj = search.create({
            type: type,
            filters:
            [
                [filter_1_Name,filter_1_Operation,filter_1_Value], 
                "AND", 
                [filter_2_Name,filter_2_Operation,filter_2_Value]
            ],
            columns:
            [
                search.createColumn({name: search_Name})
            ]
        });
        var subsidiarysearchResultCount = vendorsubsidiaryrelationshipSearchObj.runPaged().count;
        if(subsidiarysearchResultCount == 1){
            vendorsubsidiaryrelationshipSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results
                taxcode = result.getValue({name: search_Name}); 
                return false;
            });
        }else{
            return null;
            //return true;
        }
        
        return GetValueByTaxCode(taxcode);
    }

    function GetTaxCodeByVandor(vandor,subsidiary){
        
        var taxcode = "";
        var type = "vendorsubsidiaryrelationship";  //record type
        var search_Name =  "taxitem";       //tax code
        var filter_1_Name = "entity";       //filter條件!的欄位名稱
        var filter_1_Operation = "anyof";   //filter條件1的運算式
        var filter_1_Value = vandor;        //filter條件1的VALUE
        var filter_2_Name = "subsidiary";   //我相信你看得懂這是filter條件2的欄位名稱
        var filter_2_Operation = "anyof";   //filter條件2的運算式
        var filter_2_Value = subsidiary;    //filter條件2的VALUE

        //如果不是OneWorld的話 要用另一張表抓tax code
        if(subsidiary == "NotOneWorld"){
            type = "entity";
            search_Name =  "custentitycustentity_ap_taxcode";
            filter_1_Name = "type";
            filter_1_Operation = "anyof";
            filter_1_Value = "Vendor";
            filter_2_Name = "entityid";
            filter_2_Operation = "is";
            filter_2_Value = vandor; 
        }

        var vendorsubsidiaryrelationshipSearchObj = search.create({
            type: type,
            filters:
            [
                [filter_1_Name,filter_1_Operation,filter_1_Value], 
                "AND", 
                [filter_2_Name,filter_2_Operation,filter_2_Value]
            ],
            columns:
            [
                search.createColumn({name: search_Name})
            ]
        });
        var subsidiarysearchResultCount = vendorsubsidiaryrelationshipSearchObj.runPaged().count;
        if(subsidiarysearchResultCount == 1){
            vendorsubsidiaryrelationshipSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results
                taxcode = result.getValue({name: search_Name}); 
                return false;
            });
        }else{
            return "";
        }
        
        return taxcode;
    }

    function GetTaxTypeByTaxCode(taxcode){
        var taxtype ="";
        var customrecord_ev_tax_code_mappingSearchObj = search.create({
            type: "customrecord_ev_tax_code_mapping",
            filters:
            [
                ["custrecord_m_tax_code","anyof",taxcode]
            ],
            columns:
            [
                search.createColumn({name: "name",label: "Name"}),  //跟taxtype一樣
                search.createColumn({name: "custrecord_m_setup_tax_type", label: "Tax Type"}),
                search.createColumn({name: "internalid"}),  //該name的key值value
            ]
        });
        var searchResultCount = customrecord_ev_tax_code_mappingSearchObj.runPaged().count;
        if(searchResultCount > 0){
            customrecord_ev_tax_code_mappingSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 result
                taxtype = result.getValue({name: 'internalid' }); 
                return false;
            });
        }
        return taxtype;
    }

    function GetTaxTypeByVandor(vandor,subsidiary){
        var taxcode = GetTaxCodeByVandor(vandor,subsidiary);
        var taxtype = GetTaxTypeByTaxCode(taxcode);
        return taxtype;
    }

    //format_type gv_tax_type tax_cacl_type
    function GetValueByTaxCode(taxcode){
        if(taxcode == "" || taxcode == null || taxcode == "undefined"){
            return null;
            //return false;
        }

        var customrecord_ev_tax_code_mappingSearchObj = search.create({
            type: "customrecord_ev_tax_code_mapping",
            filters:
            [
                ["custrecord_m_tax_code","anyof",taxcode]
            ],
            columns:
            [
                search.createColumn({
                    name: "custrecord_m_tax_code",
                    sort: search.Sort.ASC,
                    label: "TAX_CODE"
                }),
                search.createColumn({name: "custrecord_m_format_type", label: "FORMAT_TYPE"}),
                search.createColumn({name: "custrecord_m_twgv_tax_type", label: "TWGV_GUI_TYPE"}),
                search.createColumn({name: "custrecord_m_tax_cacl_type", label: "TWGV_TAX_CALC_TYPE"})
            ]
        });
        var mappingsearchResultCount = customrecord_ev_tax_code_mappingSearchObj.runPaged().count;
        if(mappingsearchResultCount == 1){
            var format_type = "";
            var gv_tax_type = "";
            var tax_cacl_type = "";
            customrecord_ev_tax_code_mappingSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results
                format_type = result.getValue({name: 'custrecord_m_format_type'}); 
                gv_tax_type = result.getValue({name: 'custrecord_m_twgv_tax_type'}); 
                tax_cacl_type = result.getValue({name: 'custrecord_m_tax_cacl_type'}); 
                return false;
            });
            return [format_type, gv_tax_type, tax_cacl_type];
        }
        return null;
    }
    //format_type gv_tax_type tax_cacl_type
    function GetValueByTaxType(internalID){
        if(internalID == "" || internalID == null || internalID == "undefined"){
            return null;
            //return false;
        }

        var customrecord_ev_tax_code_mappingSearchObj = search.create({
            type: "customrecord_ev_tax_code_mapping",
            filters:
            [
                ["internalid","is",internalID]
            ],
            columns:
            [
                search.createColumn({name: "custrecord_m_tax_code",label: "TAX_CODE"}),
                search.createColumn({name: "custrecord_m_format_type", label: "FORMAT_TYPE"}),
                search.createColumn({name: "custrecord_m_twgv_tax_code"}),
                search.createColumn({name: "custrecord_m_tax_cacl_type", label: "TWGV_TAX_CALC_TYPE"})
            ]
        });
        var mappingsearchResultCount = customrecord_ev_tax_code_mappingSearchObj.runPaged().count;
        if(mappingsearchResultCount == 1){
            var format_type = "";
            var gv_tax_code = "";
            var tax_cacl_type = "";
            customrecord_ev_tax_code_mappingSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results
                format_type = result.getValue({name: 'custrecord_m_format_type'}); 
                gv_tax_code = result.getValue({name: 'custrecord_m_twgv_tax_code'}); 
                tax_cacl_type = result.getValue({name: 'custrecord_m_tax_cacl_type'}); 
                
                return false;
            });

            return [format_type, gv_tax_code, tax_cacl_type];
        }
        return null;
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
        DateCheck: DateCheck,
        OtherDescCheck: OtherDescCheck,
        invoiceCheck: invoiceCheck,
        PublicVehicleCheck:PublicVehicleCheck,
        TaxCollCheck: TaxCollCheck,
        SetValueSalesNo:SetValueSalesNo,
        SetValueByVandor:SetValueByVandor,
        GetTaxCodeByVandor: GetTaxCodeByVandor,
        GetTaxTypeByTaxCode: GetTaxTypeByTaxCode,
        GetTaxTypeByVandor : GetTaxTypeByVandor,
        GetValueByTaxType : GetValueByTaxType,
        GetValueByTaxCode: GetValueByTaxCode
    };
});
