/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * 銷項折讓資訊-欄位檢核
 */
define(['N/record', 'N/search', 'N/ui/message', './Common_ColumnCheck'],

    function (record, search, message, common) {
        debugger
        showMessage("訊息", "銷項折讓資訊：2019-01-28更新");
        
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
         * @description 2.1.2 銷項折讓資訊→欄位檢核
         * @param {any} context 
         */
        function validateField(context) {
            debugger
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
            //#region 欄位檢核
            //#region 補充
            //#region 當課稅別為「應稅」時，折讓稅額 = 折讓金額 * 0.05
            if (sublistFieldName === "custrecord_3_tax_code"
                || sublistFieldName === "custrecord_3_sales_amt") {
                if ($txtAllowanceAmount
                    && $ddlTaxCode) {
                    var vTaxation = getLookupCode($ddlTaxCode);
                    if (vTaxation == "1") {
                        currentRecord.setValue({
                            fieldId: 'custrecord_3_vat_io',
                            value: $txtAllowanceAmount * 0.05,
                            ignoreFieldChange: true
                        });
                    }
                }
            }
            //#endregion
            //#endregion

            //#region 2.1.2.1 折讓簿冊別/折讓日期
            //折讓日期不在折讓簿冊別的生/失效日期限中
            if (sublistFieldName === 'custrecord_3_registration_number'
                || sublistFieldName === 'custrecord_3_gui_book_id'
                || sublistFieldName === 'custrecord_3_gui_date') {

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
                    log.debug("customrecord_ev_gui_books_allSearchObj result count", searchResultCount);
                    customrecord_ev_gui_books_allSearchObj.run().each(function (result) {
                        return true;
                    });
                    //#endregion
                    if (searchResultCount == 0) {
                        showMessage("訊息", "此折讓日期未在折讓簿使用期間內");
                    }
                }
            }
            //#endregion

            //#region 2.1.2.2 稅籍編號/所屬年月
            //確認該稅籍編號及所屬年月在開關帳設定中的狀態
            if (sublistFieldName === "custrecord_3_registration_number"
                || sublistFieldName === "custrecord_3_occured_year"
                || sublistFieldName === "custrecord_3_occured_month") {
                debugger
                if ($ddlTaxNumber
                    && $txtOwnYear
                    && $txtOwnMonth) {
                    var vYear = isNaN($txtOwnYear) == true ? $txtOwnYear : $txtOwnYear.toString();
                    var vMonth = isNaN($txtOwnMonth) == true ? $txtOwnMonth : $txtOwnMonth.toString();
                    common.DateCheck(vYear, vMonth, $ddlTaxNumberVal);
                }
            }
            //#endregion

            //#region 2.1.2.3 廠商統一編號
            if (sublistFieldName === "custrecord_3_buyer_no") {
                if ($txtCustomerUniform) {
                    if (isValidGUI($txtCustomerUniform) == false) {
                        showMessage("訊息", "此統一編號不符合邏輯");
                    }
                }
            }
            //#endregion

            //#region 2.1.2.4 格式別/廠商統一編號
            if (sublistFieldName === "custrecord_3_format_type"
                || sublistFieldName === "custrecord_3_buyer_no") {
                var vFormat = getLookupCode($ddlFormatType);
                if (vFormat == "33"
                    && !$txtCustomerUniform) {
                    showMessage("訊息", "格式代碼為33，請輸入統一編號");
                }
            }
            //#endregion

            //#region 2.1.2.5 課稅別/折讓稅額
            if (sublistFieldName === "custrecord_3_tax_code"
                || sublistFieldName === "custrecord_3_vat_io") {
                //1:應稅、2:零稅率、3:免稅
                var vTaxation = getLookupCode($ddlTaxCode);
                if (vTaxation && vTaxation != "1" && $txtAllowanceTax != "0") {
                    showMessage("訊息", "折讓稅額一定要為0");
                }
            }
            //#endregion

            //#endregion

            return true;
        }

        return {
            validateField: validateField
        };

    });
