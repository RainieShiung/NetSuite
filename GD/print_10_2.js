/**
 * print_Invoice.js
 * @NApiVersion 2.x
 * @NModuleScope public
 */
define(['N/file', 'N/encode', 'N/record', 'N/search', 'N/runtime', 'N/format','./load_ExportFormXML'],

function( file, encode, record, search, runtime, format, loadxml ) {
	
	// var invoice_no = "";
	// function getInvoiceNo()
	// {
		// return invoice_no;
	// }
	
	function doWord(formRec)
	{
		var notation = "***";
		// var poArr = formRec.getValue({ fieldId: "custrecord_buyer_no" }).split("/");
		var xmlStr = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
		var fileObj = file.load({ id: 'SuiteScripts/xml/102report_layout.xml' }); //[xml] : word版面
		
		var iterator = fileObj.lines.iterator();
		iterator.each(function () {return false;});
		iterator.each(function (line){
			var str = line.value;
			
			//將XML中的***欄位ID***取代成實際值
			var s1 = str.indexOf(notation);
			var s2 = str.lastIndexOf(notation);
			if( s1 != s2 )
			{
				var cid = str.substring(s1+notation.length,s2);
				var fv = formRec.getValue({ fieldId: cid });
				
				if( cid == "custrecord_cntr_no" )
				{
					for( var i=1 ; i<=6 ; i++ )
					{
						fv = eval("formRec.getValue({ fieldId: 'custrecord_cntr_no_"+i+"' })");	
					}
				}
				
				if( cid == "custrecord_bill_address" )
				{
					var imp_name = formRec.getValue({ fieldId: "custrecord_bill_name" });
					fv = formRec.getValue({ fieldId: "custrecord_bill_address" }).replace(imp_name, "");
				}
				
				if( cid == "custrecord_ship_address" )
				{
					var imp_name = formRec.getValue({ fieldId: "custrecord_ship_name" });
					fv = formRec.getValue({ fieldId: "custrecord_ship_address" }).replace(imp_name, "");
				}
				
				if( cid == "custrecord_vendor_address" )
				{
					var imp_name = formRec.getValue({ fieldId: "custrecord_vendor_name" });
					fv = formRec.getValue({ fieldId: "custrecord_vendor_address" }).replace(imp_name, "");
				}
				log.debug(cid+"    fv:"+fv);				
				
				str = str.replace(/([*])/g,"").replace(cid,fv)
			}
			
			xmlStr += str;
			return true;
		});
		
		return xmlStr;
	}
	
    return {
		doWord: doWord/* ,
		getInvoiceNo: getInvoiceNo */
    };
    
});