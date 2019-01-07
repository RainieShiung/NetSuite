/**
 * print_Invoice.js
 * @NApiVersion 2.x
 * @NModuleScope public
 */
define(['N/file', 'N/encode', 'N/record', 'N/search', 'N/runtime', 'N/format','./load_ExportFormXML','./commonUtil'],

function( file, encode, record, search, runtime, format, loadxml, util ) {
	
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
		var fileObj = file.load({ id: 'SuiteScripts/xml/invoice/columns_mapping.xml' }); //[xml] : word版面
		
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
			
			//detail line內容
			var s = str.indexOf("** CONTENT **");
			if( s != -1 )
			{
				var formObj = search.create({
					type: "customrecord_invoice",
					columns:
					[
						search.createColumn({name: "custrecord_desc_invoice", label: "DESCRIPTION"}),
						search.createColumn({name: "custrecord_pcs_invoice", label: "PCS"}),
						search.createColumn({name: "custrecord_msf_invoice", label: "MSF"}),
						search.createColumn({name: "custrecord_usd_pcs", label: "USD PCS"}),
						search.createColumn({name: "custrecord_usd_msf", label: "USD MSF"}),
						search.createColumn({name: "custrecord_ttl_amount", label: "AMOUNT"}),
						search.createColumn({
							name: "custrecord_cut_invoice", 
							sort: search.Sort.ASC,
							label: "CUT"
						}),
						search.createColumn({
							name: "custrecord_species_invoice", 
							sort: search.Sort.ASC,
							label: "SPECIES"
						}),
						search.createColumn({
							name: "custrecord_grade_invoice", 
							sort: search.Sort.ASC,
							label: "GRADE"
						}),
						search.createColumn({
							name: "custrecord_seq_invoice",
							sort: search.Sort.ASC,
							label: "Order Seq"
						})
					],
					filters: [['custrecord_invoice_form_no', 'is', formRec.id]]
				});
				
				var contentStr = "";
				
				var species_seperate = ""; //樹種分段

				var sum_grand_PCS = 0;	//custrecord_pcs
				var sum_grand_MSF = 0;	//custrecord_msf
				var sum_grand_AMOUNT = 0;		//custrecord_ttl_amount
				
				var fulfillmentCnt = 0;
				
				formObj.run().each(function(result){ //line資料行
				
					var pcs = result.getValue({ name: "custrecord_pcs_invoice" });
					var msf = result.getValue({ name: "custrecord_msf_invoice" });
					var ttl_amount = result.getValue({ name: "custrecord_ttl_amount" });
					
					var cut = result.getValue({ name: "custrecord_cut_invoice" });
					var species = result.getValue({ name: "custrecord_species_invoice" });
					var grade = result.getValue({ name: "custrecord_grade_invoice" }); //客人等級
					var groupStr = cut + " " + species + " " + grade;
					
					// var species = result.getValue({ name: "custrecord_species_invoice" }) + " " + result.getValue({ name: "custrecord_cut_invoice" });
					var cutText = result.getText({ name: "custrecord_cut_invoice" });
					var speciesText = result.getText({ name: "custrecord_species_invoice" });
					var gradeText = result.getText({ name: "custrecord_grade_invoice" });
					
					var speciesStr = "";
					// if( species_seperate != species )
					if( species_seperate != groupStr )
					{
						speciesStr = loadxml.runSpecies(cutText+" "+speciesText+" , "+gradeText+" GRADE");
					}
					
					// loop line
					var lineStr = speciesStr + "<w:tbl>";
					var lineObj = file.load({ id: 'SuiteScripts/xml/invoice/content.xml' }); //[xml] : item fulfillment line內容
					var c_iterator = lineObj.lines.iterator();
					c_iterator.each(function () {return false;});
					c_iterator.each(function (line){ //replace content xml
						
						var c_str = line.value;
						
						var c_s1 = c_str.indexOf(notation);
						var c_s2 = c_str.lastIndexOf(notation);
						if( c_s1 != c_s2 )
						{
							var c_cid = c_str.substring(c_s1+notation.length,c_s2);
							var c_fv = result.getValue({ name: c_cid });
							
							if( c_cid == "custrecord_pcs_invoice" )
								c_fv = util.round(c_fv,0);
							
							c_str = c_str.replace(/([*])/g,"").replace(c_cid,c_fv);
						}
						
						lineStr += c_str;
						return true;
					});
					
					sum_grand_PCS += parseFloat(pcs);
					sum_grand_MSF += parseFloat(msf);
					sum_grand_AMOUNT += parseFloat(ttl_amount);
					
					contentStr += lineStr;
					
					// species_seperate = species;
					species_seperate = groupStr;
					
					return true;
				});
				
				var grandtotalStr = loadxml.runSubTotal("invoice","GRAND","",sum_grand_PCS,sum_grand_MSF,sum_grand_AMOUNT) + loadxml.runBlank();
				contentStr += grandtotalStr;
				str = contentStr;
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