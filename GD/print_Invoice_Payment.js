/**
 * print_Invoice.js
 * @NApiVersion 2.x
 * @NModuleScope public
 */
define(['N/file', 'N/encode', 'N/record', 'N/search', 'N/runtime', 'N/format','./load_ExportFormXML'],

function( file, encode, record, search, runtime, format, loadxml ) {
	
	var invoice_no = "";
	function getInvoiceNo()
	{
		return invoice_no;
	}
	
	function doWord(formRec)
	{
		var notation = "***";
		var poArr = formRec.getValue({ fieldId: "custrecord_buyer_no" }).split("/");
		var xmlStr = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
		var fileObj = file.load({ id: 'SuiteScripts/xml/invoice/payment.xml' }); //[xml] : word版面
		
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
				var fv = "";
				
				var addrStr = "";
				if( cid == "custrecord_bill_address_1" )
				{
					fv = formRec.getValue({ fieldId: "custrecord_bill_address" });
					var addrArr = fv.split("\r");
					fv = addrArr[0];
				}
				else if( cid == "custrecord_bill_address_2" )
				{
					fv = formRec.getValue({ fieldId: "custrecord_bill_address" });
					var addrArr = fv.split("\r");
					for( var i=1 ; i<addrArr.length ; i++ )
					{
						addrStr += addrArr[i] + "\r" ;
					}
					fv = addrStr;
				}
				else if( cid == "custrecord_ship_address_1" )
				{
					fv = formRec.getValue({ fieldId: "custrecord_ship_address" });
					var addrArr = fv.split("\r");
					fv = addrArr[0];
				}
				else if( cid == "custrecord_ship_address_2" )
				{
					fv = formRec.getValue({ fieldId: "custrecord_ship_address" });
					var addrArr = fv.split("\r");
					for( var i=1 ; i<addrArr.length ; i++ )
					{
						addrStr += addrArr[i] + "\r" ;
					}
					fv = addrStr;
				}
				else
				{
					fv = formRec.getValue({ fieldId: cid });
					
					if( cid == "custrecord_incoterms" )
						fv = formRec.getText({ fieldId: cid }) + " " + formRec.getValue({ fieldId: "custrecord_exp_port" });

					if( cid == "custrecord_form_date" ) //日期格式:YYYY/MM/DD
						fv = format.format({ value: fv, type: format.Type.DATE });
					
					if( cid == "altname" )
						invoice_no = formRec.getValue({ fieldId: "altname" });
				}
				
				str = str.replace(/([*])/g,"").replace(cid,fv)
			}
			
			xmlStr += str;
			return true;
		});
		
		return xmlStr;
	}
	
    return {
		doWord: doWord,
		getInvoiceNo: getInvoiceNo
    };
    
});