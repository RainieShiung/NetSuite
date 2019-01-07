/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/record', 'N/search', 'N/runtime', 'N/ui/dialog','./commonUtil'],
function (record, search, runtime, dialog, util) {

	function pageInit(scriptContext)
	{
    	var cr = scriptContext.currentRecord;
		cr.getField({ fieldId: "custrecord_itemfulfill"}).isDisplay = false;
		
		var fulfill_list = cr.getValue({ fieldId: 'custrecord_itemfulfill' });
		for( var i=1 ; i<=fulfill_list.length ; i++ )
		{
			//打開櫃號總重淨重輸入
			cr.getField({ fieldId: 'custrecord_cntr_no_'+i }).isDisabled = false;
			cr.getField({ fieldId: 'custrecord_cntr_type_'+i }).isDisabled = false;
			cr.getField({ fieldId: 'custrecord_bl_no_'+i }).isDisabled = false;
			cr.getField({ fieldId: 'custrecord_ttl_weight_'+i }).isDisabled = false;
			cr.getField({ fieldId: 'custrecord_net_weight_'+i }).isDisabled = false;
		}
		
		var altname = cr.getValue({ fieldId: 'altname' });
		{
			if( altname == "" )
			{
				cr.setValue("altname", getInvoiceNo());
			}
		}
    }
	
	doFulfillmentSelect = function(cr)
	{
		var select = cr.getField({ fieldId: 'custpage_fulfillment' });
		select.removeSelectOption({ value: null });
		
		// 產生FULFILLMENT LIST
		var customer = cr.getValue({ fieldId: 'custrecord_customer' });
		var crid = cr.id;
		
		search.create.promise({
			type: "itemfulfillment",
			filters:
			[
				["type","anyof","ItemShip"], "AND", 
				[
					["custbody_export_form_no","is", (crid ? crid : "XXX")], "OR", //防止cr.id為null時造成error
					["custbody_export_form_no","anyof","@NONE@"]
				], "AND", 
				["mainline","is","T"], "AND", 
				["customer.internalid","anyof",customer]
			],
			columns:
			[
				search.createColumn({name: "transactionnumber", label: "Transaction Number", sort: search.Sort.ASC}),
				search.createColumn({name: "custbody_buyer_no", label: "Buyer No"})
			]
		})
		.then(function(searchObj) {

			searchObj.run().each(function(result){
				
				var transactionnumber = result.getValue({ name: "transactionnumber" });
				var buyer_no = result.getValue({ name: "custbody_buyer_no" });

				select.insertSelectOption({
					value: result.id,
					text: "#"+transactionnumber+"  ("+buyer_no+")"
				});
				return true;
			});
			
		})
		.catch(function(reason) {
			log.debug({
				details: "[doFulfillmentSelect] Failed: " + reason
			});
		});
		
	}
	
	function getInvoiceNo()
	{
		var returnCode = "";
		var todayYear = "" + new Date().getFullYear();
		todayYear = todayYear.substring(2);
		
		var newInvoiceObj = search.create({
			type: "customrecord_export_forms",
			filters:
			[
				["name","startswith",todayYear+"-"]
			],
			columns:
			[
				search.createColumn({name: "altname", label: "INVOICE NO"}),
				search.createColumn({
					name: "created",
					sort: search.Sort.DESC,
					label: "Date Created"
				})
			]
		});
		
		newInvoiceObj.run().each(function(result){
			//只抓第一筆
			var invoice_no = result.getValue({ name: "altname"});
			returnCode = todayYear+"-"+util.padDigits((parseInt(invoice_no.split("-")[1])+1),4)
		});
		
		if( returnCode == "" )
			returnCode = todayYear+"-001";
		
		return returnCode;
	}
	
	function loadVendor(cr,objRecord)
	{
		var vendor_id = "";
		var po_id = objRecord.getSublistValue({
			sublistId: 'item',
			fieldId: 'podoc',
			line: 0
		});
		
		// load PO : get vendor id
		var load_PO_Promise = record.load.promise({
			type: record.Type.PURCHASE_ORDER,
			id: po_id
		});

		load_PO_Promise.then(function(pRecord) {
			vendor_id = pRecord.getValue({fieldId: 'entity'});
		}, function(e) {
			log.debug({
				title: 'Unable to load PO record', 
				details: e.name
			});
		})
		.then(function(result) {
			
			// load VENDOR : get vendor columns
			var load_VENDOR_Promise = record.load.promise({
				type: record.Type.VENDOR,
				id: vendor_id
			});
			
			var v_epa = "";
			var v_name = "";
			var v_addr = "";
			var v_ctry = "";
			var v_mid = "";
			
			load_VENDOR_Promise.then(function(vRecord) {
				
				v_epa = vRecord.getValue({fieldId: "custentity_epa"});
				v_name = vRecord.getValue({fieldId: "companyname"});
				v_addr = vRecord.getValue({fieldId: "defaultaddress"});
				v_mid = vRecord.getValue({fieldId: "custentity_mid"});
				
				var addrSplit = vRecord.getValue({fieldId: "defaultaddress"}).split("\n"); //取得國家全名
				v_ctry = addrSplit[addrSplit.length-1];
				
			}, function(e) {
				log.debug({
					title: 'Unable to load VENDOR record '+vendor_id, 
					details: e.name
				});
			})
			.then(function(result) {
					
				cr.setValue("custrecord_vendor_epa", v_epa);
				cr.setValue("custrecord_vendor_name", v_name);
				cr.setValue("custrecord_vendor_address", v_addr);
				cr.setValue("custrecord_vendor_country", v_ctry);
				cr.setValue("custrecord_mid", v_mid);
			});
		});
	}

	function fieldChanged(scriptContext)
	{
    	var cr = scriptContext.currentRecord;
    	var fieldId = scriptContext.fieldId;
		
		if (fieldId == "custrecord_confirm_invoice")
		{
			var confirm_invoice = cr.getValue({ fieldId: 'custrecord_confirm_invoice' });
			if( confirm_invoice )
			{
				var doc_1 = cr.getValue({ fieldId: 'custrecord_doc_1' });
				var doc_2 = cr.getValue({ fieldId: 'custrecord_doc_2' });
				var doc_3 = cr.getValue({ fieldId: 'custrecord_doc_3' });
				var doc_4 = cr.getValue({ fieldId: 'custrecord_doc_4' });
				
				if( !( doc_1 && doc_2 && doc_3 && doc_4 ) )
				{
					dialog.alert({
						title: 'Alert',
						message: 'Please be doced all of the export forms before you tick [ALREADY CONFIRMED INVOICE]' 
					});
					cr.setValue("custrecord_confirm_invoice", false);
				}
			}
		}
		
		if( fieldId == "custrecord_customer" )
		{
			doFulfillmentSelect(cr);
		}

		if (fieldId == "custpage_fulfillment")
		{
			var buyno_Str = "";
			var po_no_Str = "";
			
			var billcompany = "";
			var billaddr = "";
			var shipcompany = "";
			var shipaddr = "";
			var shipcountry = "";
			
			var fulfill_list = cr.getValue({ fieldId: 'custpage_fulfillment' });
			
			// 列出各張item fulfillment
			fulfill_list.forEach(function(v,index){
				
				var fulfill_cnt = index + 1;
				
				//打開櫃號總重淨重輸入
				cr.getField({ fieldId: 'custrecord_cntr_no_'+fulfill_cnt }).isDisabled = false;
				cr.getField({ fieldId: 'custrecord_cntr_type_'+fulfill_cnt }).isDisabled = false;
				cr.getField({ fieldId: 'custrecord_bl_no_'+fulfill_cnt }).isDisabled = false;
				cr.getField({ fieldId: 'custrecord_ttl_weight_'+fulfill_cnt }).isDisabled = false;
				cr.getField({ fieldId: 'custrecord_net_weight_'+fulfill_cnt }).isDisabled = false;
				
				if( v != "" )
				{
					var loadRecordPromise = record.load.promise({
						type: record.Type.ITEM_FULFILLMENT,
						id: v
					});
					
					loadRecordPromise.then(function(objRecord) {
						
						// 供應商 ITEM_FULFILLMENT->PURCHASE_ORDER->VENDOR
						if( fulfill_cnt == 1 ) //抓一次就好
						{
							loadVendor(cr,objRecord);
						}
						
						shipcountry = objRecord.getValue({fieldId: 'shipcountry'});
						
						if( shipaddr == "" )
						{
							var shipaddress_full = objRecord.getValue({fieldId: 'shipaddress'});
							var shipArr = shipaddress_full.split("\n");
							shipcompany = shipArr[0];
							
							for( var i=1 ; i<shipArr.length ; i++ )
								shipaddr += shipArr[i] + "\n";
							
							shipaddr = shipcompany + "\n" + shipaddr;
						}
						
						// load SO : 客戶訂單號碼 buyer no
						var so_id = objRecord.getValue({ fieldId: "createdfrom" });
						var load_SO_Promise = record.load.promise({
							type: record.Type.SALES_ORDER,
							id: so_id
						});
						
						load_SO_Promise.then(function(soRecord) {
							var buyerno = soRecord.getValue({fieldId: 'custbody_buyer_no'});
							buyno_Str = buyno_Str + (buyno_Str == "" ? "" : "/" ) + buyerno;
							
							if( billaddr == "" )
							{
								var billaddress_full = soRecord.getValue({fieldId: 'billaddress'});
								var billArr = billaddress_full.split("\n");
								billcompany = ( billArr.length == 4 ? billArr[1] : billArr[0] );
								
								for( var i=( billArr.length == 4 ? 2 : 1 ) ; i<billArr.length ; i++ )
									billaddr += billArr[i] + "\n";
								
								billaddr = billcompany + "\n" + billaddr;
							}
							
						}, function(e) {
							log.debug({
								title: 'Unable to load SO record', 
								details: e.name
							});
						})
						.then(function(result) {
							cr.setValue("custrecord_buyer_no", buyno_Str);
							cr.setValue("custrecord_bill_name", billcompany);
							cr.setValue("custrecord_bill_address", billaddr);
						});
						
						// PO號碼
						var po = objRecord.getSublistText({
							sublistId: 'item',
							fieldId: 'createpo',
							line: 0
						});
						po_no_Str = po_no_Str + (po_no_Str == "" ? "" : "/" ) + po;
						
					}, function(e) {
						log.debug({
							title: 'Unable to load record', 
							details: e.name
						});
					})
					.then(function(result) {
						cr.setValue("custrecord_po_no", po_no_Str);
						cr.setValue("custrecord_ship_name", shipcompany);
						cr.setValue("custrecord_ship_address", shipaddr);
						cr.setValue("custrecord_ship_ctry", shipcountry);
					});
				}	
			});
        }
        return true;

    }
	
	function saveRecord(scriptContext)
	{
		var cr = scriptContext.currentRecord;
		
		// 1.清空現有所有FULFILLMENT的[EXPORT FORM NO]包含此張EXPORT FORM ID
		var ifSearchObj = search.create({
			type: "itemfulfillment",
			filters:
			[
			  ["type","anyof","ItemShip"], "AND", 
			  ["mainline","is","T"], "AND", 
			  ["custbody_export_form_no","is", cr.id]
			]
		});
		
		var searchResultCount = ifSearchObj.runPaged().count;
		console.log("itemfulfillmentSearchObj result count",searchResultCount);
		
		ifSearchObj.run().each(function(result){
			var ifRec = record.load({ type: record.Type.ITEM_FULFILLMENT, id: result.id });
			ifRec.setValue({ fieldId: "custbody_export_form_no", value: "" });
			ifRec.save();
			
			return true;
		});
		
		// 2.將所選每張FULFILLMENT回填FULFILLMENT的[EXPORT FORM NO]欄位
		var fulfill_list = cr.getValue({ fieldId: "custpage_fulfillment" }); //目前USER所選FULFILLMENT LIST
		cr.setValue({ fieldId: "custrecord_itemfulfill", value: fulfill_list });
		
		fulfill_list.forEach(function(v,index){
			
			var ifRec = record.load({ type: record.Type.ITEM_FULFILLMENT, id: v });
			ifRec.setValue({ fieldId: "custbody_export_form_no", value: cr.id });
			ifRec.save();
			
			return true;
		});
		return true;
	}
	
	return {
		fieldChanged: fieldChanged,
		pageInit: pageInit,
		saveRecord: saveRecord
	};

});
