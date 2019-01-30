/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * 銷項折讓明細-欄位檢核
 */

define(['N/record', 'N/search', 'N/ui/message'],
    function (record, search, message) {

        debugger
        showMessage("訊息", "銷項折讓明細：2019-01-28更新");

        //#region 共用Function
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
         * @returns {string} 回傳LookupCode
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
         * @description 檢查：是否為數字(是：回傳原值；否：回傳0)
         * @param {stirng} value 欲檢查值
         * @returns {any} 
         */
        function toNum(value) {
            return isNaN(value) == false ? value : 0;
        }

        //#endregion

        /**
         * @description 2.2.2 銷項折讓明細→欄位檢核
         * @param {any} context 
         */
        function validateField(context) {
            debugger
            //console.log("fieldId:"+context.fieldId+" ,sublistId:"+context.sublistId + " ,Record:"+context.currentRecord + " ,line:"+context.line + " ,FieldValue:"+FieldValue);
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;
            var line = context.line;

            /** @description 格式別(下拉)；
             *  @returns Text */
            var $ddlFormatType = currentRecord.getText({ fieldId: 'custrecord_3_format_type' });

            /**@description 折讓日期(日期格式) */
            var $txtAllowanceDate = currentRecord.getValue({ fieldId: 'custrecord_3_gui_date' });

            /** @description  銷項折讓明細*/ var $銷項折讓明細 = "recmachcustrecord_4_gui_id";
            /** @description  憑證類別*/ var $憑證類別 = "custrecord_4_prev_gui_type";
            /** @description  憑證號碼*/ var $憑證號碼 = "custrecord_4_prev_gui_id";
            /** @description  憑證日期*/ var $憑證日期 = "custrecord_4_gui_date_x";
            /** @description  憑證金額*/ var $憑證金額 = "custrecord_4_gui_sales_amt_x";
            /** @description  憑證稅額*/ var $憑證稅額 = "custrecord_4_gui_vat_io_x";
            /** @description  已折讓金額*/ var $已折讓金額 = "custrecord_4_cm_gui_line_amount_x";
            /** @description  已折讓稅額*/ var $已折讓稅額 = "custrecord_4_cm_gui_tax_amount_x";
            /** @description  折讓金額*/ var $折讓金額 = "custrecord_4_line_ntd_amount";
            /** @description  折讓稅額*/ var $折讓稅額 = "custrecord_4_tax_ntd_amount";

            //銷項折讓明細
            if (sublistName === $銷項折讓明細) {
                var FieldValue = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: sublistFieldName,
                    line: line
                });

                //#region 測試欄位對應
                // var vDate = new Date();
                // currentRecord.setCurrentSublistValue({
                //     sublistId: sublistName,
                //     fieldId: $憑證日期,
                //     line: line,
                //     value: vDate//憑證日期
                // });

                // currentRecord.setCurrentSublistValue({
                //     sublistId: sublistName,
                //     fieldId: $已折讓金額,
                //     line: line,
                //     value: 100//"已折讓金額"
                // });

                // currentRecord.setCurrentSublistValue({
                //     sublistId: sublistName,
                //     fieldId: $已折讓稅額,
                //     line: line,
                //     value: 200//"已折讓稅額"
                // });

                // currentRecord.setCurrentSublistValue({
                //     sublistId: sublistName,
                //     fieldId: $憑證金額,
                //     line: line,
                //     value: 300//"憑證金額"
                // });

                // currentRecord.setCurrentSublistValue({
                //     sublistId: sublistName,
                //     fieldId: $憑證號碼,
                //     line: line,
                //     value: "2"//"憑證號碼"
                // });

                // currentRecord.setCurrentSublistValue({
                //     sublistId: sublistName,
                //     fieldId: $折讓金額,
                //     line: line,
                //     value: 400//"折讓金額"
                // });

                // currentRecord.setCurrentSublistValue({
                //     sublistId: sublistName,
                //     fieldId: $憑證稅額,
                //     line: line,
                //     value: 500//"憑證稅額"
                // });

                // currentRecord.setCurrentSublistValue({
                //     sublistId: sublistName,
                //     fieldId: $折讓稅額,
                //     line: line,
                //     value: 123//"折讓稅額"
                // });
                //#endregion
                //console.log(sublistFieldName);
                //#region 2.2.2.1 憑證號碼
                if (sublistFieldName === $憑證號碼) {
                    if (FieldValue == "") { return true; }
                    //#region 取得：銷項發票明細資料
                    var salesInvoiceSearchObj = search.create({
                        type: "customrecord_ev_rec_invoice_lines_all",
                        filters:
                            [
                                ["id", "equalto", FieldValue]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "id",
                                    sort: search.Sort.ASC,
                                    label: "ID"
                                })
                            ]
                    });
                    var searchResultCount = salesInvoiceSearchObj.runPaged().count;
                    log.debug("customrecord_ev_rec_invoice_lines_allSearchObj result count", searchResultCount);
                    salesInvoiceSearchObj.run().each(function (result) {
                        // .run().each has a limit of 4,000 results
                        return true;
                    });
                    //#endregion
                    //#region 2.2.2.1.1 若憑證號碼不存在
                    if (searchResultCount == 0) {
                        showMessage("系統訊息", "此憑證號碼不存在");
                        return true;
                    }
                    //#endregion
                    else {
                        //取得：格式別
                        var vFormat = "";
                        if ($ddlFormatType) {
                            vFormat = getLookupCode($ddlFormatType);
                        }

                        if (vFormat == "33") {
                            //#region 2.2.2.1.2 若銷項資訊格為別為33，且憑類別為零稅率時(待確認)
                            //Lori回覆看不懂
                            var v憑證類別 = currentRecord.getCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: $憑證類別,
                                line: line
                            });
                            if (v憑證類別 && v憑證類別 == "零稅率") {
                                showMessage("訊息", "格式33其折讓對象必須為統一發票");
                                return true;
                            }
                            //#endregion
                            //#region 2.2.2.1.3 若銷項資訊格式別為33，且憑號碼為空時
                            if (!FieldValue) {
                                showMessage("訊息", "格式33必須有折讓對象");
                                return true;
                            }
                            //#endregion
                        }

                        if (FieldValue.length != 10) {
                            //#region 2.2.2.1.4 長度<>10碼
                            showMessage("系統訊息", "發票號碼長度有誤(10碼)");
                            return true;
                            //#endregion 
                        }
                        else {
                            //#region 2.2.2.1.5 前2碼須為大寫英文
                            for (var i = 0; i < 2; i++) {
                                if (FieldValue.substring(i, i + 1).match(/^.*[^A-Z]+.*$/) == null) {

                                    showMessage("系統訊息", "字軌錯誤");
                                    return true;
                                }
                            }
                            //#endregion
                            //#region 2.2.2.1.6 後8碼應為數字
                            for (var i = 2; i < 10; i++) {
                                if (isNaN(FieldValue.substring(i, i + 1))) {

                                    showMessage("系統訊息", "發票號碼數字部份錯誤");
                                    return true;
                                }
                            }
                            //#endregion
                        }

                        //#region 2.2.2.1.7 憑證的憑證日期 > 銷項折讓日期
                        //憑證日期；可能需要轉日期格式
                        var vInvoiceDate = currentRecord.getValue($憑證日期);
                        if (vInvoiceDate && $txtAllowanceDate) {
                            if (vInvoiceDate > $txtAllowanceDate) {
                                showMessage("系統訊息", "此發票號碼之發票日期不能大於折讓日期，請檢核");
                                return true;
                            }
                        }
                        //#endregion
                    }
                }
                //#endregion

                //#region 2.2.2.2 折讓金額
                if (sublistFieldName === $折讓金額) {
                    //#region 2.2.2.2.1 折讓金額為0
                    if (FieldValue == 0) {
                        showMessage("系統訊息", "折讓金額不得為0");
                        return true;
                    }
                    //#endregion
                    //#region 2.2.2.2.2 折讓金額 + 已折讓金額於金額
                    //已折讓金額
                    //var Discounted_amt = currentRecord.getValue("custrecord_13_cm_gui_line_amount");                       
                    var v已折讓金額 = toNum(currentRecord.getCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: $已折讓金額,
                        line: line
                    }));

                    //憑證金額
                    var v憑證金額 = toNum(currentRecord.getValue($憑證金額));

                    if ((toNum(FieldValue) + v已折讓金額) > v憑證金額) {
                        showMessage("系統訊息", "折讓金額已超折");
                    }
                    //#endregion
                }
                //#endregion

                //#region 2.2.2.3 折讓稅額
                if (sublistFieldName === $折讓稅額) {
                    //已折讓稅額
                    var v已折讓稅額 = toNum(currentRecord.getValue($已折讓稅額));
                    //憑證稅額  
                    var v憑證稅額 = toNum(currentRecord.getValue($憑證稅額));
                    
                    if ((toNum(FieldValue) + v已折讓稅額) > v憑證稅額) {
                        showMessage("系統訊息", currentRecord.getValue($憑證號碼) + "折讓稅額已超折");
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
