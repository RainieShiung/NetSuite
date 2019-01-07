/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/record','N/search','N/ui/dialog','N/runtime','./commonUtil','./getDestination'],
function(record,search,dialog,runtime,util,g) {

    function fieldChanged(scriptContext) {

    	var cr = scriptContext.currentRecord;
    	var fieldId = scriptContext.fieldId;
		
		//連動目的地
		if( fieldId == "entity" )
		{
			var cid = cr.getValue({ "fieldId": "entity" });
			var destination_select = cr.getField({ fieldId: "custpage_destination" });
			g.getDestination_Promise("insert",cid,destination_select);
		}
		
		//地址
		if( fieldId == 'custpage_destination' )
		{
			var destination_id = cr.getValue({ fieldId: 'custpage_destination' });
			console.log("destination_id:"+destination_id);
			cr.setValue("shipaddresslist", destination_id);
		}
		
		//採購價+GP+GP%
		if( fieldId == 'item' || fieldId == 'povendor' )
		{
			var item_id = cr.getCurrentSublistValue({
				sublistId: 'item',
				fieldId: 'item'
	        });
			var povendor = cr.getCurrentSublistValue({
				sublistId: 'item',
				fieldId: 'povendor'
	        });
			
			if( item_id && povendor )
			{
				search.create.promise({
					type: "item",
					filters:
					[
						["internalid","is",item_id], "AND", 
						["vendor.internalid","is",povendor]
					],
					columns:
					[
						search.createColumn({name: "vendorcost", label: "Vendor Price"})
					]
				})
				.then(function(searchObj) {

					searchObj.run().each(function(result){
						
						var vendorcost = result.getValue({ name: "vendorcost" });
						cr.setCurrentSublistValue({
							sublistId: "item",
							fieldId: "custcol_purchase_prices",
							value: vendorcost
						});
						
					});
					
				})
				.catch(function(reason) {
					log.debug({
						details: "Load Vendor Purchase Price Failed: " + reason
					});
				});
				
			}
		}
		
		if( fieldId == 'rate' )
		{
			var rate = cr.getCurrentSublistValue({
				sublistId: 'item',
				fieldId: 'rate'
	        });
			var purchase_prices = cr.getCurrentSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_purchase_prices'
	        });
			
			var gp = parseFloat(rate)-parseFloat(purchase_prices);
			var gp_percent = gp / rate * 100;
			
			var ttl_rate = cr.getValue({ "fieldId": "custbody_ttl_rate" });
			var ttl_gp = cr.getValue({ "fieldId": "custbody_ttl_gp" });
			var ttl_gp_percent = cr.getValue({ "fieldId": "custbody_ttl_gp_percent" });

			if( rate )
			{
				cr.setCurrentSublistValue({
					sublistId: "item",
					fieldId: "custcol_gp",
					value: gp
				});
				
				cr.setCurrentSublistValue({
					sublistId: "item",
					fieldId: "custcol_gp_percent",
					value: gp_percent
				});
				
				ttl_rate += rate; 
				ttl_gp += gp; 
				
				cr.setValue({
					fieldId: "custbody_ttl_rate",
					value: ttl_rate
				});
				
				cr.setValue({
					fieldId: "custbody_ttl_gp",
					value: ttl_gp
				});
				
				cr.setValue({
					fieldId: "custbody_ttl_gp_percent",
					value: ttl_gp / ttl_rate * 100
				});
			}
		}

		//單位轉換
    	if ( fieldId == 'custcolgd_so_l_total_pcs' || 
		     fieldId == 'units' )
		{	
			var unitDesc = cr.getCurrentSublistText({
				sublistId: 'item',
				fieldId: 'units'
	        });
			
			var mainCategory = cr.getCurrentSublistText({
				sublistId: 'item',
				fieldId: 'custcolgd_so_l_mcategory'
	        });
			
			if( mainCategory == "MIDDLE EAST" ||
  			    mainCategory == "DOORSKIN" ||
				mainCategory == "US 2 sides" ) {
					
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
				
				if( widthValue!=null && lengthValue!=null && ttlPcsValue!=null )
				{
					cr.setCurrentSublistValue({
						sublistId: "item",
						fieldId: "custcolgd_so_l_total_msf",
						value: util.round(parseFloat(widthValue)*parseFloat(lengthValue)/144*parseFloat(ttlPcsValue)/1000,3)
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
				if( unitDesc == 'Pcs' )
				{
					quantityValue = ttlPcsValue;
				}
				else if( unitDesc == 'MSF' )
				{
					quantityValue = cr.getCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcolgd_so_l_total_msf'
					});
				}
				else if( unitDesc == 'M2' )
				{
					quantityValue = cr.getCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcolgd_so_l_total_m2'
					});
				}
				else if( unitDesc == 'M3' )
				{
					quantityValue = cr.getCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcolgd_so_l_total_m3'
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
	
	function saveRecord(context)
	{
		var cr = context.currentRecord;
		var destination = cr.getText({ "fieldId": "custpage_destination" });
		cr.setValue({
			fieldId: "custbody_destination",
			value: destination
		});
		return true;
	}
	
	
    return {
    	fieldChanged: fieldChanged,
		pageInit: pageInit,
		saveRecord: saveRecord
    };

});