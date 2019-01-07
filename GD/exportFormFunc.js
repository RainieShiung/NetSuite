/**
 * transferToInvoice.js
 * @NApiVersion 2.x
 */
define(['N/record','N/search','N/ui/message','N/url'],
function(record, search, message, url) {
	
	function showButtonMsg(t,m,type)
	{
		var msg = message.create({
			title:   t, 
			message: m, 
			type: ( type=="CONFIRMATION" ? message.Type.CONFIRMATION : ( type=="WARNING" ? message.Type.WARNING : message.Type.ERROR ) )
		});
		msg.show();
		
		return msg;
	}
	
	function getUrl()
	{
		var scheme = 'https://';
		var host = url.resolveDomain({
			hostType: url.HostType.APPLICATION
		});
		return scheme+host;
	}
	
	function delayPromise(ms) {
		return function(result) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(result)
				}, ms)
			})
		}
	}
	
    function transferToInvoice(eid)
	{
		var formRec = record.load({
			type: "customrecord_export_forms",
			id: eid 
		});
		
		var confirm_invoice = formRec.getValue({ fieldId: "custrecord_confirm_invoice"});
		var customer = formRec.getValue({ fieldId: "custrecord_customer"});
		var inv_no = formRec.getValue({ fieldId: "altname"});
		var fulfill_list = formRec.getValue({ fieldId: "custrecord_itemfulfill" });
		
		if( !confirm_invoice )
		{
			showButtonMsg("Are you sure to make invoices?","Please tick the column of [ALREADY CONFIRMED INVOICE]","WARNING");
		}
		else if( !customer )
		{
			showButtonMsg("Please choose a customer","[CUSTOMER] can not be empty","WARNING");
		}
		else
		{
			var invArr = [];
			var startMsg = showButtonMsg("Transfering","Please wait<img src='/images/setup/loading.gif' border='0' alt=''>","WARNING");
			delayPromise(800)("").then(function(result) {
			
				try
				{
					// 產生INVOICE
					fulfill_list.forEach(function(v,index){
						
						var fulfillRec = record.load({
							type: record.Type.ITEM_FULFILLMENT,
							id: v
						});
						
						var so_id = fulfillRec.getValue({ fieldId: "createdfrom" });
						
						var invRec = record.transform({
							fromType: record.Type.SALES_ORDER,
							fromId: so_id,
							toType: record.Type.INVOICE,
							isDynamic: true
						});
						
						// var invRec = record.create({ type: record.Type.INVOICE });
						invRec.setValue({
							fieldId: "custbody_cseg1",
							value: "3"
						});
						
						invRec.setValue({
							fieldId: 'custbody_inv_no',
							value: inv_no
						});
							
						var recordId = invRec.save();

						invArr.push(recordId);

					});
					
					var msgStr = "";
					for( var i=0 ; i<invArr.length ; i++ )
					{
						msgStr += "<a href='"+getUrl()+"/app/accounting/transactions/custinvc.nl?id="+invArr[i]+"' target='_blank'>View Invoice - "+(i+1)+"</a><br>";
					}
			
					startMsg.hide();
					showButtonMsg("Transfer Sucessfully",msgStr,"CONFIRMATION");
				}
				catch(e)
				{
					startMsg.hide();
					showButtonMsg("Transfer Failed",e.message,"ERROR");
				}
			});
			
		}
    }
	
	function openUrl(url,rid)
	{
		if( rid )
		{
			var formRec = record.load({
				type: "customrecord_export_forms",
				id: rid 
			});
			
			var ship_ctry = formRec.getValue({ fieldId: "custrecord_ship_ctry"});
			if( ship_ctry == "US" || ship_ctry == "CA" ) // US和CA才秀出10+2和LACEY按鈕
			{
				window.open(url);
			}
			else
			{
				showButtonMsg("Shipping country is "+ship_ctry,"Only [US] or [CA] need to tranfer [10+2] and [Lacey]","WARNING");
			}
		}
		else
		{
			window.open(url);
		}
	}
	
    return {
        transferToInvoice: transferToInvoice,
		openUrl: openUrl
    };
    
});
