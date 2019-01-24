/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

define(['N/record', 'N/search', 'N/ui/message'],
    function (record, search, message) {

        debugger
        showMessage("訊息", "2019-01-22更新");

        //訊息顯示
        /**
         * @description 訊息顯示
         * @param {string} title 提示
         * @param {string} context 顯示的訊息
         */
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

        //取得：下拉List選單(格式別 | 課稅別 | 扣抵代號)的value
        /**
         * @description 取得：下拉List選單(格式別 | 課稅別 | 扣抵代號)的value
         * @param {string} options 下拉選單值
         * @return {string} 回傳LookupCode
         */
        function getLookupCode(options) {
            var vLookupCode = "";
            if (options) {
                var customrecord_ev_lookupsSearchObj = new search.create({
                    type: "customrecord_ev_lookups",
                    filters:
                        [
                            ["name", "is", options]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "custrecord_lookups_code", label: "LOOKUP CODE" })
                        ]
                });
                var searchResultCount = customrecord_ev_lookupsSearchObj.runPaged().count;
                log.debug("customrecord_ev_lookupsSearchObj result count", searchResultCount);
                customrecord_ev_lookupsSearchObj.run().each(function (result) {
                    vLookupCode = result.getValue(result.columns[0]);
                    return false;
                });
            }
            return vLookupCode;
        }

        /**
         * @description 2.2.2 銷項折讓明細→欄位檢核
         * @param {any} context 
         */
        function validateField(context) {
            //console.log("fieldId:"+context.fieldId+" ,sublistId:"+context.sublistId + " ,Record:"+context.currentRecord + " ,line:"+context.line + " ,FieldValue:"+FieldValue);
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;
            var line = context.line;

            /** @description 格式別(下拉)；
             *  @summary 
             *  33：
             *  34：
             *  @returns Text */
            var $ddlFormatType = currentRecord.getText({
                fieldId: 'custrecord_3_format_type'
            });

            /**@description 折讓日期(日期格式) */
            var $txtAllowanceDate = currentRecord.getValue({
                fieldId: 'custrecord_3_gui_date'
            });

            //銷項折讓明細
            if (sublistName == "recmachcustrecord_4_gui_id") {
                var FieldValue = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: sublistFieldName,
                    line: line
                });

                //console.log(sublistFieldName);
                //#region 2.2.2.1 憑證號碼
                if (sublistFieldName === "custrecord_13_gui_number(待補)") {

                    //取得：格式別
                    var vFormat = "";
                    if ($ddlFormatType) {
                        vFormat = getLookupCode($ddlFormatType);
                    }

                    if (!FieldValue) {
                        // 2.2.2.1.3 若銷項資訊格式別為33，且憑號碼為空時
                        if (vFormat == "33") {
                            showMessage("訊息", "格式33必須有折讓對象");
                        }
                        return true;
                    }

                    //TODO:2.2.2.1.2 若銷項資訊格為別為33，且憑類別為零稅率時(待確認)
                    //Lori回覆看不懂

                    //2.2.2.1.4 長度<>10碼
                    if (FieldValue.length == 10) {
                        //前2位為大寫英文
                        for (var i = 0; i < 2; i++) {
                            if (FieldValue.substring(i, i + 1).match(/^.*[^A-Z]+.*$/) == null) {
                                //2.2.2.1.5 前2碼須為大寫英文
                                showMessage("系統訊息", "字軌錯誤");
                                return true;
                            }
                        }
                        //後8為數字
                        for (var i = 2; i < 10; i++) {
                            if (isNaN(FieldValue.substring(i, i + 1))) {
                                //2.2.2.1.6 後8碼應為數字
                                showMessage("系統訊息", "發票號碼數字部份錯誤");
                                return true;
                            }
                        }

                        //#region 2.2.2.1.1 若憑證號碼不存在
                        var customrecord_ev_pay_invoices_allSearchObj = search.create({
                            type: "customrecord_ev_pay_invoices_all",
                            filters:
                                [
                                    ["name", "is", FieldValue]
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
                        if (searchResultCount == 0) {
                            showMessage("系統訊息", "此憑證號碼不存在");
                            return true;
                        }
                        else {
                            //#region 2.2.2.1.7 憑證的憑證日期 > 銷項折讓日期
                            //憑證日期；可能需要轉日期格式
                            var vInvoiceDate = currentRecord.getValue("custrecord_13_gui_sales_amt(待補)");
                            if (vInvoiceDate && $txtAllowanceDate) {
                                if (vInvoiceDate > $txtAllowanceDate) {
                                    showMessage("系統訊息", "此發票號碼之發票日期不能大於折讓日期，請檢核");
                                    return true;
                                }
                            }
                            //#endregion
                        }
                        //#endregion

                    } else {
                        showMessage("系統訊息", "發票號碼長度有誤(10碼)");
                    }
                }
                //#endregion
                //#region 2.2.2.2 折讓金額
                if (sublistFieldName === "custrecord_13_line_ntd_amount(待補)") {

                    //#region 2.2.2.2.1 折讓金額為0
                    if (FieldValue == 0) {
                        showMessage("系統訊息", "折讓金額不得為0");
                        return true;
                    }
                    //#endregion

                    //#region 2.2.2.2.2 折讓金額 + 已折讓金額於金額
                    //var Discounted_amt = currentRecord.getValue("custrecord_13_cm_gui_line_amount");   //已折讓金額
                    var Discounted_amt = currentRecord.getCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: "custrecord_13_cm_gui_line_amount(待補)",
                        line: line
                    });

                    var sales_amt = currentRecord.getValue("custrecord_13_gui_sales_amt(待補)");  //憑證金額

                    if (isNaN(Discounted_amt))
                        Discounted_amt = 0;
                    if (isNaN(sales_amt))
                        sales_amt = 0;

                    if ((FieldValue + Discounted_amt) > sales_amt) {
                        showMessage("系統訊息", "折讓金額已超折");
                    }
                    //#endregion
                }
                //#endregion
                //#region 2.2.2.3 折讓稅額
                if (sublistFieldName === "custrecord_13_tax_ntd_amount(待補)") {
                    var tax_amt = currentRecord.getValue("custrecord_13_cm_gui_tax_amount(待補)");   //已折讓稅額
                    var vat_io = currentRecord.getValue("custrecord_13_gui_vat_io(待補)");  //憑證稅額
                    if (isNaN(tax_amt))
                        tax_amt = 0;
                    if (isNaN(vat_io))
                        vat_io = 0;
                    if ((FieldValue + tax_amt) > vat_io) {
                        showMessage("系統訊息", currentRecord.getValue("custrecord_13_gui_number(待補)") + "折讓稅額已超折");
                    }
                }
                //#endregion
            }
            return true;
        }

        return {
            validateField: validateField
        };
    });
