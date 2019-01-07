/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * 
 * [Estimate] 從[專案]:[備註]帶入估價單之[專案備註]
 *
 * 
 */
define(['N/record', 'N/search', './colorteam_CommonUtil'],

    function (record, search, util) {

        ///訊息顯示
        function showMessage(title, context) {
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

        //2.2.2 進項折讓明細→欄位檢核
        function validateField(context) {

            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;
            var line = context.line;
            var searchResultCount = -1;

            //#region 取得：欄位資料
            //憑證號碼(下拉)
            var $ddlGuiNumber = currentRecord.getText({
                fieldId: 'custrecord_13_gui_number'
            });
            //廠商名稱(下拉)
            var $ddlVendorId = currentRecord.getText({
                fieldId: 'custrecord_13_vendor_id'
            });
            //已折讓金額
            var $lblLineAmount = currentRecord.getText({
                fieldId: 'custrecord_13_cm_gui_line_amount'
            });
            //-------------------------------------------------------
            //憑證日期
            var $lblGuiDate = currentRecord.getText({
                fieldId: 'custrecord_13_gui_date'
            });
            //憑證金額
            var $lblGuiSalesAmt = currentRecord.getText({
                fieldId: 'custrecord_13_gui_sales_amt'
            });
            //憑證稅額
            var $lblGuiVatIo = currentRecord.getText({
                fieldId: 'custrecord_13_gui_vat_io'
            });
            //已折讓稅額
            var $lblGuiTaxAmount = currentRecord.getValue({
                fieldId: 'custrecord_13_cm_gui_tax_amount'
            });
            //#endregion
            //#region 欄位檢核
            //#region 2.2.2.1 憑證號碼            
            //TODO:待補
            //2.2.2.1.1 若憑證號碼不存在
            //TODO:不存在的依據是什麼？
            //TODO:共用，待補
            //2.2.2.1.2 若進項資訊格式別為23，則憑證號碼為空值
            //2.2.2.1.3 長度<>10碼
            //2.2.2.1.4 前2碼須為大寫英文(A-Z)
            //2.2.2.1.5	後8碼應為數字
            //#endregion
            //#region 2.2.2.2 折讓金額
            //TODO:待補
            //2.2.2.2.1 折讓金額為0
            //2.2.2.2.2 折讓金額+已折讓金額大於憑證金額
            //#endregion
            //#region 2.2.2.3 折讓稅額
            //TODO:待補
            //2.2.2.3.1 折讓稅額+已折讓稅額大於憑證稅額
            //#endregion
            //#endregion

            return true;
        }

        return {
            validateField: validateField
        };

    });
