/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * 銷項折讓明細-欄位檢核
 */

define(['N/record', 'N/search', 'N/ui/message'],
    function (record, search, message) {

        debugger
        showMessage("訊息", "銷項折讓明細-欄位檢核：2019-02-01更新");

        //#region 銷項折讓明細-資料表 | 欄位名稱
        /** @description  銷項折讓明細*/ var $tbSalesDiscountDetails = "recmachcustrecord_4_gui_id";
        /** @description  憑證類別*/ var $colGuiType = "custrecord_4_prev_gui_type";
        /** @description  憑證號碼*/ var $colGuiId = "custrecord_4_prev_gui_id";
        /** @description  憑證日期*/ var $colGuiDate = "custrecord_4_gui_date_x";
        /** @description  憑證金額*/ var $colGuiSalesAmt = "custrecord_4_gui_sales_amt_x";
        /** @description  憑證稅額*/ var $colGuiVatIo = "custrecord_4_gui_vat_io_x";
        /** @description  已折讓金額*/ var $colGuiLineAmt = "custrecord_4_cm_gui_line_amount_x";
        /** @description  已折讓稅額*/ var $colGuiTaxAmt = "custrecord_4_cm_gui_tax_amount_x";
        /** @description  折讓金額*/ var $colLineNtdAmt = "custrecord_4_line_ntd_amount";
        /** @description  折讓稅額*/ var $colTaxNtdAmt = "custrecord_4_tax_ntd_amount";
        //#endregion

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

            /** @description 格式別(下拉)； @returns Text */
            var $ddlFormatType = currentRecord.getText({ fieldId: 'custrecord_3_format_type' });

            /**@description 折讓日期(日期格式) */
            var $txtAllowanceDate = currentRecord.getValue({ fieldId: 'custrecord_3_gui_date' });

            //銷項折讓明細
            if (sublistName === $tbSalesDiscountDetails) {
                var FieldValue = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: sublistFieldName,
                    line: line
                });

                //console.log(sublistFieldName);
                //#region 2.2.2.1 憑證號碼
                if (sublistFieldName === $colGuiId) {
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
                            /** @description  憑證類別*/
                            var vGuiType = currentRecord.getCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: $colGuiType,
                                line: line
                            });
                            if (vGuiType && vGuiType == "零稅率") {
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
                        var vInvoiceDate = currentRecord.getValue($colGuiDate);
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
                if (sublistFieldName === $colLineNtdAmt) {
                    //#region 2.2.2.2.1 折讓金額為0
                    if (FieldValue == 0) {
                        showMessage("系統訊息", "折讓金額不得為0");
                        return true;
                    }
                    //#endregion
                    //#region 2.2.2.2.2 折讓金額 + 已折讓金額於金額
                    //已折讓金額
                    //var Discounted_amt = currentRecord.getValue("custrecord_13_cm_gui_line_amount");                       
                    var vGuiLineAmt = toNum(currentRecord.getCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: $colGuiLineAmt,
                        line: line
                    }));

                    //憑證金額
                    var vGuiSalesAmt = toNum(currentRecord.getValue($colGuiSalesAmt));

                    if ((toNum(FieldValue) + vGuiLineAmt) > vGuiSalesAmt) {
                        showMessage("系統訊息", "折讓金額已超折");
                    }
                    //#endregion
                }
                //#endregion

                //#region 2.2.2.3 折讓稅額
                if (sublistFieldName === $colTaxNtdAmt) {
                    //已折讓稅額
                    var vGuiTaxAmt = toNum(currentRecord.getValue($colGuiTaxAmt));
                    //憑證稅額  
                    var vGuiVatIo = toNum(currentRecord.getValue($colGuiVatIo));

                    if ((toNum(FieldValue) + vGuiTaxAmt) > vGuiVatIo) {
                        showMessage("系統訊息", currentRecord.getValue($colGuiId) + "折讓稅額已超折");
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
