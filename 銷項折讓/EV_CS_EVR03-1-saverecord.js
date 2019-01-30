/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * 
 */

define(['N/record', 'N/search', 'N/ui/message', './Common_ColumnCheck', './commonUtil', 'N/currentRecord', 'N/error'],
    function (record, search, message, common, Util, cRecord, error) {
        debugger
        showMessage("訊息", "銷項折讓資訊-存檔前檢核：2019-01-28更新");

        /**@description 錯誤訊息 */ var vErrMsg = "";

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
         * @description 欄位檢核：銷項折讓資訊
         * @param {any} context 
         */
        function validateInfo(context) {
            var vErrMsg = "";
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;
            var line = context.line;
            var searchResultCount = -1;
            //#region 取得：欄位資料[基本資料]
            /**@description 稅籍編號(下拉) @returns Text */
            var $ddlTaxNumber = currentRecord.getText({
                fieldId: 'custrecord_3_registration_number'
            });
            /**@description 稅籍編號(下拉) @returns Value */
            var $ddlTaxNumberVal = currentRecord.getValue({
                fieldId: 'custrecord_3_registration_number'
            });
            /** @description 折讓簿冊別(下拉) @returns Text */
            var $ddlAllowanceBookId = currentRecord.getText({
                fieldId: 'custrecord_3_gui_book_id'
            });
            /**@description 折讓單號 */
            var $txtAllowanceNumber = currentRecord.getValue({
                fieldId: 'custrecord_3_other_desc'
            });
            /** @description 格式別(下拉)；
             *  @summary 
             *  33：
             *  34：
             *  @returns Text */
            var $ddlFormatType = currentRecord.getText({
                fieldId: 'custrecord_3_format_type'
            });
            /** @description 課稅別(下拉)；
             *  @summary 1：應稅 2：零稅率 3：免稅
             *  @returns Text */
            var $ddlTaxCode = currentRecord.getText({
                fieldId: 'custrecord_3_tax_code'
            });
            //-------------------------------------------------------
            /**@description 折讓日期(日期格式) */
            var $txtAllowanceDate = currentRecord.getValue({
                fieldId: 'custrecord_3_gui_date'
            });
            /**@description 所屬年 */
            var $txtOwnYear = currentRecord.getValue({
                fieldId: 'custrecord_3_occured_year'
            });
            /**@description 所屬月 */
            var $txtOwnMonth = currentRecord.getValue({
                fieldId: 'custrecord_3_occured_month'
            });
            /**@description 折讓金額 */
            var $txtAllowanceAmount = currentRecord.getValue({
                fieldId: 'custrecord_3_sales_amt'
            });
            /**@description 折讓稅額 */
            var $txtAllowanceTax = currentRecord.getValue({
                fieldId: 'custrecord_3_vat_io'
            });
            //-------------------------------------------------------
            /**@description 備註 */
            var $txtRemarks = currentRecord.getValue({
                fieldId: 'custrecord_3_remarks_columns'
            });
            /**@description 狀態 */
            var $txtStatus = currentRecord.getValue({
                fieldId: 'custrecord_3_approved_flag'
            });
            /**@description APPROVED_BY */
            var $txtApprovedBy = currentRecord.getValue({
                fieldId: 'custrecord_3_approved_by'
            });
            /**@description 開立人員 */
            var $txtOpenStaff = currentRecord.getValue({
                fieldId: 'custrecord_3_created_by'
            });
            //#endregion
            //#region 取得：欄位資料[客戶資訊]
            /** @description 客戶名稱(下拉) @returns Text */
            var $ddlCustomerName = currentRecord.getText({
                fieldId: 'custrecord_3_customer_name'
            });
            /**@description 客戶統編 */
            var $txtCustomerUniform = currentRecord.getValue({
                fieldId: 'custrecord_3_buyer_no'
            });
            //#endregion
            //#region 銷項折讓資訊-欄位檢核
            //#region 2.1.2.1 折讓簿冊別/折讓日期
            //折讓日期不在折讓簿冊別的生/失效日期限中
            if ($ddlTaxNumber
                && $ddlAllowanceBookId
                && $txtAllowanceDate) {
                //折讓日期-年
                var vYear = parseInt($txtAllowanceDate.getFullYear(), 10);
                //折讓日期-月
                var vMonth = parseInt($txtAllowanceDate.getMonth(), 10) + 1;
                //#region 取得：發票簿/折讓簿設定
                var customrecord_ev_gui_books_allSearchObj = search.create({
                    type: "customrecord_ev_gui_books_all",
                    filters:
                        [
                            ["custrecord_19_registration_number", "anyof", $ddlTaxNumberVal],
                            "AND", ["name", "is", $ddlAllowanceBookId],
                            "AND", ["custrecord_19_gui_year", "equalto", vYear],
                            "AND", ["custrecord_19_gui_start_month", "lessthanorequalto", vMonth],
                            "AND", ["custrecord_19_gui_end_month", "greaterthanorequalto", vMonth]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({ name: "scriptid", label: "Script ID" }),
                            search.createColumn({ name: "custrecord_19_registration_number", label: "稅籍編號" }),
                            search.createColumn({ name: "custrecord_19_gui_type", label: "發票簿類別" }),
                            search.createColumn({ name: "custrecord_19_gui_year", label: "年度" }),
                            search.createColumn({ name: "custrecord_19_gui_start_month", label: "起月" }),
                            search.createColumn({ name: "custrecord_19_gui_end_month", label: "迄月" }),
                            search.createColumn({ name: "custrecord_19_gui_book_no", label: "冊別" })
                        ]
                });
                var searchResultCount = customrecord_ev_gui_books_allSearchObj.runPaged().count;
                //#endregion
                if (searchResultCount == 0) {
                    vErrMsg += "此折讓日期未在折讓簿使用期間內\n";
                }
            }
            //#endregion
            //#region 2.1.2.2 稅籍編號/所屬年月
            //確認該稅籍編號及所屬年月在開關帳設定中的狀態
            if ($ddlTaxNumber
                && $txtOwnYear
                && $txtOwnMonth) {
                var vYear = isNaN($txtOwnYear) == true ? $txtOwnYear : $txtOwnYear.toString();
                var vMonth = isNaN($txtOwnMonth) == true ? $txtOwnMonth : $txtOwnMonth.toString();
                vErrMsg += common.DateCheck(vYear, vMonth, $ddlTaxNumberVal) + "\n";
            }
            //#endregion
            //#region 2.1.2.3 廠商統一編號
            if ($txtCustomerUniform) {
                if (isValidGUI($txtCustomerUniform) == false) {
                    vErrMsg += "此統一編號不符合邏輯\n";
                }
            }
            //#endregion
            //#region 2.1.2.4 格式別/廠商統一編號
            if ($ddlFormatType) {
                var vFormat = getLookupCode($ddlFormatType);
                if (vFormat == "33"
                    && !$txtCustomerUniform) {
                    vErrMsg += "格式代碼為33，請輸入統一編號\n";
                }
            }
            //#endregion
            //#region 2.1.2.5 課稅別/折讓稅額
            if ($ddlTaxCode) {
                //1:應稅、2:零稅率、3:免稅
                var vTaxation = getLookupCode($ddlTaxCode);
                if (vTaxation && vTaxation != "1" && $txtAllowanceTax != "0") {
                    vErrMsg += "折讓稅額一定要為0\n";
                }
            }
            //#endregion
            //#endregion
            return vErrMsg;
        }

        /**
         * @description 欄位檢核：銷項折讓明細
         * @param {any} context 
         */
        function validateSublist(context) {
            var vErrMsg = "";
            var currentRecord = context.currentRecord;
            //var sublistName = context.sublistId;
            //var sublistFieldName = context.fieldId;
            //var line = context.line;


            //#region 取得：欄位資料[基本資料]
            /** @description 格式別(下拉)；
             *  @returns Text */
            var $ddlFormatType = currentRecord.getText({
                fieldId: 'custrecord_3_format_type'
            });

            /**@description 折讓日期(日期格式) */
            var $txtAllowanceDate = currentRecord.getValue({
                fieldId: 'custrecord_3_gui_date'
            });
            //#endregion
            //#region 取得：銷項折讓明細欄位資料
            /** @description  銷項折讓明細*/
            var $銷項折讓明細 = "recmachcustrecord_4_gui_id";
            /** @description  憑證類別*/
            var $憑證類別 = "custrecord_4_prev_gui_type";
            /** @description  憑證號碼*/
            var $憑證號碼 = "custrecord_4_prev_gui_id";
            /** @description  憑證日期*/
            var $憑證日期 = "custrecord_4_gui_date_x";
            /** @description  憑證金額*/
            var $憑證金額 = "custrecord_4_gui_sales_amt_x";
            /** @description  憑證稅額*/
            var $憑證稅額 = "custrecord_4_gui_vat_io_x";
            /** @description  已折讓金額*/
            var $已折讓金額 = "custrecord_4_cm_gui_line_amount_x";
            /** @description  已折讓稅額*/
            var $已折讓稅額 = "custrecord_4_cm_gui_tax_amount_x";
            /** @description  折讓金額*/
            var $折讓金額 = "custrecord_4_line_ntd_amount";
            /** @description  折讓稅額*/
            var $折讓稅額 = "custrecord_4_tax_ntd_amount";
            //#endregion
            //進項發票資訊的sublist數
            var LineCount = currentRecord.getLineCount({ "sublistId": $銷項折讓明細 });
            for (var i = 0; i < LineCount; i++) {
                var orgRecord = null; //原本的的資料
                var id = currentRecord.getSublistValue({
                    sublistId: $銷項折讓明細,
                    fieldId: "id",
                    line: i
                });
                if (id != "") {
                    orgRecord = record.load({
                        type: "customrecord_ev_pay_invoices_all",
                        id: id,
                        isDynamic: true,
                    });
                };

                var sales_no = currentRecord.getSublistValue({   //統一編號
                    sublistId: trxn_noID,
                    fieldId: sales_noID,
                    line: i
                });

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
                    var vDiscounted_amt = currentRecord.getCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: $已折讓金額,
                        line: line
                    });

                    //憑證金額
                    var vSales_amt = currentRecord.getValue($憑證金額);
                    vDiscounted_amt = vDiscounted_amt && isNaN(vDiscounted_amt) == false ? vDiscounted_amt : 0;
                    vSales_amt = vSales_amt && isNaN(vSales_amt) == false ? vSales_amt : 0;

                    if ((FieldValue + vDiscounted_amt) > vSales_amt) {
                        showMessage("系統訊息", "折讓金額已超折");
                    }
                    //#endregion
                }
                //#endregion
                //#region 2.2.2.3 折讓稅額
                //已折讓稅額
                var tax_amt = currentRecord.getValue($已折讓稅額);
                //憑證稅額  
                var vat_io = currentRecord.getValue($憑證稅額);
                if (isNaN(tax_amt))
                    tax_amt = 0;
                if (isNaN(vat_io))
                    vat_io = 0;
                if ((FieldValue + tax_amt) > vat_io) {
                    showMessage("系統訊息", currentRecord.getValue($憑證號碼) + "折讓稅額已超折");
                }
                //#endregion



            }

            




            return vErrMsg;
        }

        /**
         * @description 存檔前檢核
         * @param {any} context 
         */
        function saveRecord(context) {
            var currentRecord = context.currentRecord;
            vErrMsg = validateInfo(context) + validateSublist(context);
            if (vErrMsg) {
                var err = error.create({
                    name: '系統訊息',
                    message: vErrMsg + '資料檢核有誤，無法儲存'
                });
                throw err.message;
            }
            else {
                //go save
                return true;
            }
        }



        return {
            //validateField: validateField,
            saveRecord: saveRecord//,
            //lineInit: lineInit
        };
    });