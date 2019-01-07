/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/record', 'N/search', 'N/runtime','./commonUtil','./getDestination'],
	function (record, search, runtime, util, g) {

	function fieldChanged(scriptContext) {

		var cr = scriptContext.currentRecord;
		var fieldId = scriptContext.fieldId;
		
		//挑選客戶，連動目的地
		if( fieldId == "entity" )
		{
			var cid = cr.getValue({ "fieldId": "entity" });
			var destination_select = cr.getField({ fieldId: "custpage_destination" });
			g.getDestination_Promise("insert",cid,destination_select);
		}
		
		//挑選目的地，連動地址
		if( fieldId == 'custpage_destination' )
		{
			var destination_id = cr.getValue({ fieldId: 'custpage_destination' });
			cr.setValue("shipaddresslist", destination_id);
		}

		if (fieldId == 'custcolgd_so_l_total_pcs' ||
			fieldId == 'units') {
			
			var currIndex = cr.getCurrentSublistIndex({
				sublistId: 'item'
			});
			
			var unitDesc = cr.getSublistValue({ //none dynamic mode:getCurrentSublistText無效，需指定currIndex
				sublistId: "item",
				fieldId: "unitsdisplay",
				line: currIndex
			});

			var mainCategory = cr.getCurrentSublistText({
				sublistId: 'item',
				fieldId: 'custcolgd_so_l_mcategory'
			});

			var thicknessmmValue = cr.getCurrentSublistText({
				sublistId: 'item',
				fieldId: 'custcolgd_so_l_thickness_mm'
			});

			if (mainCategory == "MIDDLE EAST" ||
				mainCategory == "DOORSKIN" ||
				mainCategory == "US 2 sides") {

				var widthValue = cr.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcolgd_so_l_width_inch'
				});
				var lengthValue = cr.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcolgd_so_l_length_inch'
				});
				var ttlPcsValue = cr.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcolgd_so_l_total_pcs'
				});
				var thicknessmmValue = cr.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcolgd_so_l_thickness_mm'
				});

				if (widthValue != null && lengthValue != null && ttlPcsValue != null) {
					cr.setCurrentSublistValue({
						sublistId: "item",
						fieldId: "custcolgd_so_l_total_msf",
						value: util.round(parseFloat(widthValue) * parseFloat(lengthValue) / 144 * parseFloat(ttlPcsValue) / 1000, 3)
					});
					
					if (thicknessmmValue != null) {
						cr.setCurrentSublistValue({
							sublistId: "item",
							fieldId: "custcolgd_so_l_total_m3",
							value: util.round(parseFloat(widthValue) * 25.4 / 1000 * parseFloat(lengthValue) * 25.4 / 1000 * parseFloat(thicknessmmValue) / 1000 * parseFloat(ttlPcsValue), 3)
						});
					}
				}

				var quantityValue = "";
				if (unitDesc == 'Pcs')
				{
					quantityValue = ttlPcsValue;
				}
				else if (unitDesc == 'MSF')
				{
					quantityValue = cr.getCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcolgd_so_l_total_msf'
					});
				}
				else if (unitDesc == 'M3')
				{
					quantityValue = cr.getCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcolgd_so_l_total_m3'
					});
				}
				else if( unitDesc == 'M2' )
				{
					quantityValue = cr.getCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcolgd_so_l_total_m2'
					});
				}

				cr.setCurrentSublistValue({
					sublistId: "item",
					fieldId: "quantity",
					value: quantityValue
				});
			}
		}

		return true;
	}
	
	function pageInit(context)
	{
		var cr = context.currentRecord;
		cr.getField({ fieldId: "custbody_destination" }).isDisplay = false;	
	}

	return {
		fieldChanged: fieldChanged,
		pageInit: pageInit
	};

});
