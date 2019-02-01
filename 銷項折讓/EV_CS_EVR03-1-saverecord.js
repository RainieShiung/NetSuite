/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * 銷項折讓資訊-存檔前檢核
 */

define(['N/record', 'N/search', 'N/ui/message', './commonAPI/Common_ColumnCheck', './commonAPI/commonUtil', 'N/currentRecord', 'N/error'],
    function (record, search, message, common, Util, cRecord, error) {
        debugger
        showMessage("訊息", "銷項折讓資訊-存檔前檢核：2019-02-01更新");
       //#region 資料表 | 欄位名稱
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
        /** @description  折讓單號*/ var $colDiscountNum = "custrecord_3_other_desc";
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

        //檢核：統一編號
        /**
         * @description 檢核：統一編號
         * @param {stirng} taxId 統一編號
         * @returns {boolean} true:檢核成功；false:檢核失敗
         */
        function isValidGUI(taxId) {
            var invalidList = "00000000,11111111";
            if (/^\d{8}$/.test(taxId) == false || invalidList.indexOf(taxId) != -1) {
                return false;
            }

            var validateOperator = [1, 2, 1, 2, 1, 2, 4, 1],
                sum = 0,
                calculate = function (product) { // 個位數 + 十位數
                    var ones = product % 10,
                        tens = (product - ones) / 10;
                    return ones + tens;
                };
            for (var i = 0; i < validateOperator.length; i++) {
                sum += calculate(taxId[i] * validateOperator[i]);
            }

            return sum % 10 == 0 || (taxId[6] == "7" && (sum + 1) % 10 == 0);
        };

        /**
         * @description 檢查：字軌；前2碼為英文大寫
         * @param {stirng} value 統一發票
         * @returns {boolean} true:檢核成功；false:檢核失敗
         */
        function checkWordTrack(value) {
            var isCheck = true;
            for (var i = 0; i < 2; i++) {
                if (!isCheck) break;
                else {
                    if (value.substring(i, i + 1).match(/^.*[^A-Z]+.*$/) == null) {
                        isCheck = false;
                    }
                }
            }
            return isCheck;
        }

        /**
         * @description 檢查：發票號碼數字
         * @param {stirng} value 統一發票
         * @returns {boolean} true:檢核成功；false:檢核失敗
         */
        function checkInvoiceNum(value) {
            var isCheck = true;
            for (var i = 2; i < 10; i++) {
                if (!isCheck) break;
                else {
                    if (isNaN(FieldValue.substring(i, i + 1))) {
                        isCheck = false;
                    }
                }
            }
            return isCheck;
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

        //#region 欄位檢核
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
            /**@description 稅籍編號(下拉) */
            var $ddlTaxNumber = currentRecord.getText({ fieldId: 'custrecord_3_registration_number' });
            /**@description 稅籍編號(下拉) */
            var $ddlTaxNumberVal = currentRecord.getValue({ fieldId: 'custrecord_3_registration_number' });
            /** @description 折讓簿冊別(下拉) */
            var $ddlAllowanceBookId = currentRecord.getText({ fieldId: 'custrecord_3_gui_book_id' });
            /**@description 折讓單號 */
            var $txtAllowanceNumber = currentRecord.getValue({ fieldId: 'custrecord_3_other_desc' });
            /** @description 格式別(下拉) */
            var $ddlFormatType = currentRecord.getText({ fieldId: 'custrecord_3_format_type' });
            /** @description 課稅別(下拉) */
            var $ddlTaxCode = currentRecord.getText({ fieldId: 'custrecord_3_tax_code' });
            //-------------------------------------------------------
            /**@description 折讓日期(日期格式) */
            var $txtAllowanceDate = currentRecord.getValue({ fieldId: 'custrecord_3_gui_date' });
            /**@description 所屬年 */
            var $txtOwnYear = currentRecord.getValue({ fieldId: 'custrecord_3_occured_year' });
            /**@description 所屬月 */
            var $txtOwnMonth = currentRecord.getValue({ fieldId: 'custrecord_3_occured_month' });
            /**@description 折讓金額 */
            var $txtAllowanceAmount = currentRecord.getValue({ fieldId: 'custrecord_3_sales_amt' });
            /**@description 折讓稅額 */
            var $txtAllowanceTax = currentRecord.getValue({ fieldId: 'custrecord_3_vat_io' });
            //-------------------------------------------------------
            /**@description 備註 */
            var $txtRemarks = currentRecord.getValue({ fieldId: 'custrecord_3_remarks_columns' });
            /**@description 狀態 */
            var $txtStatus = currentRecord.getValue({ fieldId: 'custrecord_3_approved_flag' });
            /**@description APPROVED_BY */
            var $txtApprovedBy = currentRecord.getValue({ fieldId: 'custrecord_3_approved_by' });
            /**@description 開立人員 */
            var $txtOpenStaff = currentRecord.getValue({ fieldId: 'custrecord_3_created_by' });
            //#endregion
            //#region 取得：欄位資料[客戶資訊]
            /** @description 客戶名稱(下拉) */
            var $ddlCustomerName = currentRecord.getText({ fieldId: 'custrecord_3_customer_name' });
            /**@description 客戶統編 */
            var $txtCustomerUniform = currentRecord.getValue({ fieldId: 'custrecord_3_buyer_no' });
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
            /** @description 錯誤訊息 */ var vErrMsg = "";
            var currentRecord = context.currentRecord;
            //var sublistName = context.sublistId;
            //var sublistFieldName = context.fieldId;
            //var line = context.line;


            //#region 取得：欄位資料[基本資料]
            /** @description 格式別(下拉) */
            var $ddlFormatType = currentRecord.getText({ fieldId: 'custrecord_3_format_type' });
            /** @description 折讓日期(日期格式) */
            var $txtAllowanceDate = currentRecord.getValue({ fieldId: 'custrecord_3_gui_date' });
            //#endregion
            /** @description  進項發票資訊的sublist數*/
            var vLineCount = currentRecord.getLineCount({ "sublistId": $tbSalesDiscountDetails });
            for (var i = 0; i < vLineCount; i++) {
                /** @description  原本的的資料*/var orgRecord = null;
                var id = currentRecord.getSublistValue({
                    sublistId: $tbSalesDiscountDetails,
                    fieldId: "id",
                    line: i
                });
                if (id) {
                    orgRecord = record.load({
                        type: "customrecord_ev_pay_invoices_all(待補)",
                        id: id,
                        isDynamic: true,
                    });
                };

                //#region 2.2.2.1 憑證號碼
                /** @description  憑證號碼*/
                var vGuiId = currentRecord.getSublistValue({
                    sublistId: $tbSalesDiscountDetails,
                    fieldId: $colGuiId,
                    line: i
                });
                if (vGuiId) {
                    //#region 取得：銷項發票明細資料
                    var salesInvoiceSearchObj = search.create({
                        type: "customrecord_ev_rec_invoice_lines_all",
                        filters:
                            [
                                ["id", "equalto", vGuiId]
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
                    //#endregion

                    if (searchResultCount == 0) {
                        //#region 2.2.2.1.1 若憑證號碼不存在
                        vErrMsg += "銷項折讓明細第" + (i + 1).toString() + "筆資料，此憑證號碼不存在\n";
                        //#endregion
                    }
                    else {//憑證號碼存在
                        /** @description  格式別*/ var vFormat = "";
                        if ($ddlFormatType) {
                            vFormat = getLookupCode($ddlFormatType);
                        }
                        if (vFormat == "33") {
                            //#region 2.2.2.1.2 若銷項資訊格為別為33，且憑類別為零稅率時(待確認)
                            //Lori回覆看不懂
                            /** @description  憑證類別*/
                            var vGuiType = currentRecord.getSublistValue({
                                sublistId: $tbSalesDiscountDetails,
                                fieldId: $colGuiType,
                                line: i
                            });
                            if (vGuiType && vGuiType == "零稅率") {
                                vErrMsg += "銷項折讓明細第" + (i + 1).toString() + "筆資料，格式33其折讓對象必須為統一發票\n";
                            }
                            //#endregion
                            //#region 2.2.2.1.3 若銷項資訊格式別為33，且憑號碼為空時
                            if (!vGuiId) {
                                vErrMsg += "銷項折讓明細第" + (i + 1).toString() + "筆資料，格式33必須有折讓對象\n";
                            }
                            //#endregion
                        }

                        if (vGuiId.length != 10) {
                            //#region 2.2.2.1.4 長度<>10碼
                            vErrMsg += "銷項折讓明細第" + (i + 1).toString() + "筆資料，發票號碼長度有誤(10碼)\n";
                            //#endregion 
                        }
                        else {
                            //#region 2.2.2.1.5 前2碼須為大寫英文
                            if (checkWordTrack(vGuiId) == false) {
                                vErrMsg += "銷項折讓明細第" + (i + 1).toString() + "筆資料，字軌錯誤\n";
                            }
                            //#endregion
                            //#region 2.2.2.1.6 後8碼應為數字
                            if (checkInvoiceNum(vGuiId) == false) {
                                vErrMsg += "銷項折讓明細第" + (i + 1).toString() + "筆資料，發票號碼數字部份錯誤\n";
                            }
                            //#endregion                            
                        }
                        //#region 2.2.2.1.7 憑證的憑證日期 > 銷項折讓日期
                        /** @description  憑證日期；日期格式*/
                        var vInvoiceDate = currentRecord.getSublistValue({
                            sublistId: $tbSalesDiscountDetails,
                            fieldId: $colGuiDate,
                            line: i
                        });
                        if (vInvoiceDate && $txtAllowanceDate) {
                            if (vInvoiceDate > $txtAllowanceDate) {
                                vErrMsg += "銷項折讓明細第" + (i + 1).toString() + "筆資料，此發票號碼之發票日期不能大於折讓日期，請檢核\n";
                            }
                        }
                        //#endregion

                    }
                }
                //#endregion

                //#region 2.2.2.2 折讓金額
                /** @description  折讓金額*/
                var vLineNtdAmt = toNum(currentRecord.getSublistValue({
                    sublistId: $tbSalesDiscountDetails,
                    fieldId: $colLineNtdAmt,
                    line: i
                }));

                if (vLineNtdAmt) {
                    //#region 2.2.2.2.1 折讓金額為0
                    if (vLineNtdAmt == 0) {
                        vErrMsg += "銷項折讓明細第" + (i + 1).toString() + "筆資料，折讓金額不得為0\n";
                    }
                    //#endregion
                    //#region 2.2.2.2.2 折讓金額 + 已折讓金額於金額
                    /** @description  已折讓金額*/
                    var vGuiLineAmt = toNum(currentRecord.getSublistValue({
                        sublistId: $tbSalesDiscountDetails,
                        fieldId: $colGuiLineAmt,
                        line: i
                    }));

                    /** @description  憑證金額*/
                    var vGuiSalesAmt = toNum(currentRecord.getSublistValue({
                        sublistId: $tbSalesDiscountDetails,
                        fieldId: $colGuiSalesAmt,
                        line: i
                    }));

                    if ((vLineNtdAmt + vGuiLineAmt) > vGuiSalesAmt) {
                        vErrMsg += "銷項折讓明細第" + (i + 1).toString() + "筆資料，折讓金額已超折\n";
                    }
                    //#endregion
                }
                //#endregion

                //#region 2.2.2.3 折讓稅額
                /** @description  折讓稅額*/
                var vTaxNtdAmt = toNum(currentRecord.getSublistValue({
                    sublistId: $tbSalesDiscountDetails,
                    fieldId: $colTaxNtdAmt,
                    line: i
                }));

                if (vTaxNtdAmt) {
                    /** @description  已折讓稅額*/
                    var vGuiTaxAmt = toNum(currentRecord.getSublistValue({
                        sublistId: $tbSalesDiscountDetails,
                        fieldId: $colGuiTaxAmt,
                        line: i
                    }));

                    /** @description  憑證稅額*/
                    var vGuiVatIo = toNum(currentRecord.getSublistValue({
                        sublistId: $tbSalesDiscountDetails,
                        fieldId: $colGuiVatIo,
                        line: i
                    }));

                    if ((vTaxNtdAmt + vGuiTaxAmt) > vGuiVatIo) {
                        vErrMsg += "銷項折讓明細第" + (i + 1).toString() + "筆資料，折讓稅額已超折\n";
                    }
                }
                //#endregion

            }//For End

            return vErrMsg;
        }

        /**
         * @description 2-3 存檔前檢核
         * @param {any} context 
         */
        function validate(context) {
            /** @description 錯誤訊息 */ var vErrMsg = "";
            /** @description 原Record */var oldRecord = context.oldRecord;
			/** @description 新Record */var newRecord = context.newRecord;
			/** @description 目前Record */var currentRecord = newRecord;
			/** @description 是否有錯誤 */var isError = false;

            //其他憑證(折讓單號)
            newRecord.setValue({
                fieldId: $colDiscountNum,
                value: "other_desc"
            });

            if (newRecord) {
                // How many lines are on the Items sublist?
                /** @description 銷項折讓明細的sublist數 */
                var vLineCount = newRecord.getLineCount({ "sublistId": $tbSalesDiscountDetails });
                /** @description 明細折讓金額總額 */ var vTotalLineAmount = 0;
                /** @description 明細折讓稅額總額 */ var vTotalTaxAmount = 0;
                /** @description 所有目前的憑證號碼 */
                var vAllGuiNos = "";
                /** @description 所有(目前的憑證號碼，目前的折讓金額，目前的折讓稅額) */
                var vAllInfos = "";

                if (vLineCount > 0) {
                    for (var i = 0; i < vLineCount; i++) {
                        //#region 銷項折讓明細的憑證號碼，有兩筆以上相同的話 秀錯誤訊息
                        if (i < Math.round(vLineCount / 2)) {
                            var display_I = currentRecord.getSublistValue({
                                sublistId: $tbSalesDiscountDetails,
                                fieldId: $colGuiId,
                                line: i
                            });
                            for (var j = i + 1; j < vLineCount; j++) {
                                var display_J = currentRecord.getSublistValue({
                                    sublistId: $tbSalesDiscountDetails,
                                    fieldId: $colGuiId,
                                    line: j
                                });
                                if (display_J == display_I) {
                                    // var err = error.create({
                                    //     name: '無法修改',
                                    //     message: '憑證號碼重複'
                                    // });
                                    // throw err.message;
                                    vErrMsg += "憑證號碼重複\n";
                                }
                            }
                        }
                        //#endregion
                        /** @description 目前的憑證號碼 */
                        var vCurrentGuiNo = currentRecord.getSublistValue({
                            sublistId: $tbSalesDiscountDetails,
                            fieldId: $colGuiId,
                            line: i
                        });

                        /** @description 目前的折讓金額 */
                        var vCurrentLineNtdAmt = currentRecord.getSublistValue({
                            sublistId: $tbSalesDiscountDetails,
                            fieldId: $colLineNtdAmt,
                            line: i
                        });

                        /** @description 目前的折讓稅額 */
                        var vCurrentTaxNtdAmt = currentRecord.getSublistValue({
                            sublistId: $tbSalesDiscountDetails,
                            fieldId: $colTaxNtdAmt,
                            line: i
                        });

                        vTotalLineAmount += vCurrentLineNtdAmt;
                        vTotalTaxAmount += vCurrentTaxNtdAmt;
                        vAllGuiNos += vCurrentGuiNo + "#";
                        vAllInfos += vCurrentGuiNo + "," + vCurrentLineNtdAmt + "," + vCurrentTaxNtdAmt + "#";
                    }//For End

                    if (vTotalLineAmount == 0) {
                        // var err = error.create({
                        //     name: '系統訊息',
                        //     message: '折讓明細累計總額不得為0'
                        // });
                        // throw err.message;
                        vErrMsg += "折讓明細累計總額不得為0\n";
                    }

                    /** @description 新的折讓金額 */
                    var vNewSalesAmt = newRecord.getValue($colLineNtdAmt);
                    if (vTotalLineAmount != vNewSalesAmt) {
                        // var err = error.create({
                        //     name: '系統訊息',
                        //     message: '折讓金額與折讓明細累計金額不符'
                        // });
                        // throw err.message;
                        vErrMsg += "折讓金額與折讓明細累計金額不符\n";
                    }

                    /** @description 新的折讓稅額 */
                    var vNewVatIo = newRecord.getValue($colTaxNtdAmt);
                    if (vTotalTaxAmount != vNewVatIo) {
                        // var err = error.create({
                        //     name: '系統訊息',
                        //     message: '折讓稅額與折讓明細累計稅額不符'
                        // });
                        // throw err.message;
                        vErrMsg += "折讓稅額與折讓明細累計稅額不符\n";
                    }

                    // vAllGuiNos = vAllGuiNos.length > 1 ? vAllGuiNos.substring(0, vAllGuiNos.length - 1) : "";
                    // vAllInfos = vAllInfos.length > 1 ? vAllInfos.substring(0, vAllInfos.length - 1) : "";                    
                }

                // //依憑證號碼回寫至銷項發票資訊的已折讓金額及已折讓稅額
                // /** @description 欲回寫的憑證號碼 */
                // var vGuiNos = vAllGuiNos.length > 1 ? vAllGuiNos.split("#") : "";
                // /** @description 欲回寫的發票資訊 */	
                // var vInfos = vAllInfos.length > 1 ? vAllInfos.split("#") : "";

            }
            return vErrMsg;
        }
        //#endregion

        /**
         * @description 存檔前檢核
         * @param {any} context 
         */
        function saveRecord(context) {
            // var currentRecord = context.currentRecord;
            /** @description 2-1 銷項折讓資訊-檢核錯誤訊息 */
            var vInfoErrMsg = validateInfo(context);
            /** @description 2-2 銷項折讓明細-檢核錯誤訊息 */
            var vSublistErrMsg = validateSublist(context);
            /** @description 2-3 存檔前檢核-檢核錯誤訊息 */
            var vBeforSubmitErrMsg = validate(context);
            if (vInfoErrMsg || vSublistErrMsg || vBeforSubmitErrMsg) {
                var err = null;
                if (vInfoErrMsg) {
                    err = error.create({
                        name: '系統訊息',
                        message: '銷項折讓資訊，資料檢核有誤，無法儲存：\n' + vInfoErrMsg
                    });
                    throw err.message;
                }

                if (vSublistErrMsg) {
                    err = error.create({
                        name: '系統訊息',
                        message: '銷項折讓明細，資料檢核有誤，無法儲存：\n' + vSublistErrMsg
                    });
                    throw err.message;
                }

                if (vBeforSubmitErrMsg) {
                    err = error.create({
                        name: '系統訊息',
                        message: '存檔前檢核，資料檢核有誤，無法儲存：\n' + vBeforSubmitErrMsg
                    });
                    throw err.message;
                }
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