/**
 * print_Packing.js
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
		var fileObj = file.load({ id: 'SuiteScripts/xml/packing/columns_mapping.xml' }); //[xml] : word版面
		
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
				if( cid == "custrecord_ship_address_1" )
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
					
					if( cid == "altname" )
						invoice_no = formRec.getValue({ fieldId: "altname" });
					
					
									
					if( cid == "custrecord_form_date" || cid == "custrecord_sailing_date" ) //日期格式:YYYY/MM/DD
					{
						try
						{
							fv = format.format({ value: fv, type: format.Type.DATE });
						}
						catch(e)
						{
							log.debug("date format error : "+cid);
						}
					}
				}
				str = str.replace(/([*])/g,"").replace(cid,fv)
			}
			
			//內容
			var s = str.indexOf("** CONTENT **");
			if( s != -1 )
			{
				var formObj = search.create({
					type: "customrecord_packing",
					columns:
					[
						search.createColumn({name: "custrecord_desc", label: "DESCRIPTION"}),
						search.createColumn({name: "custrecord_packing_unit", label: "UNIT"}),
						search.createColumn({name: "custrecord_pcs_unit", label: "PCS/UNIT"}),
						search.createColumn({name: "custrecord_msf", label: "MSF"}),
						search.createColumn({name: "custrecord_pcs", label: "PCS"}),
						search.createColumn({name: "custrecord_packing_marks", label: "MARKS"}),
						search.createColumn({name: "custrecord_m3", label: "M3"}),
						search.createColumn({
							name: "custrecord_packing_itemfulfill",
							sort: search.Sort.ASC,
							label: "Item Fulfillment"
						}),
						search.createColumn({
							name: "custrecord_seq_packing",
							sort: search.Sort.ASC,
							label: "Order Seq"
						}),
						search.createColumn({
							name: "custrecord_cut_packing",
							sort: search.Sort.ASC,
							label: "CUT"
						}),
						search.createColumn({
							name: "custrecord_species_packing",
							sort: search.Sort.ASC,
							label: "SPECIES"
						}),
						search.createColumn({
							name: "custrecord_grade_packing",
							sort: search.Sort.ASC,
							label: "GRADE"
						})
					],
					filters: [['custrecord_packing_form_no', 'is', formRec.id]]
				});
				
				var contentStr = "";
				
				var fulfillment_seperate = ""; //item fulfillment分段
				var species_seperate = ""; //樹種分段
				
				var newFulfillment = true; //item fulfillment分段
				// var newSpecies = true; //樹種分段

				var sum_UNIT = 0;	//custrecord_packing_unit
				var sum_PCS = 0;	//custrecord_pcs
				var sum_MSF = 0;	//custrecord_msf
				var sum_M3 = 0;		//custrecord_m3
				
				var sum_grand_UNIT = 0;	//custrecord_packing_unit
				var sum_grand_PCS = 0;	//custrecord_pcs
				var sum_grand_MSF = 0;	//custrecord_msf
				var sum_grand_M3 = 0;		//custrecord_m3
				
				var cntrCnt = 1;
				var fulfillmentCnt = 0;
				
				var lastMarks = ""; //用於subtotal marks
						
				formObj.run().each(function(result){ //line資料行
				
					var fulfillment_id = result.getValue({ name: "custrecord_packing_itemfulfill" });
					
					var unit  = result.getValue({ name: "custrecord_packing_unit" });
					var pcs   = result.getValue({ name: "custrecord_pcs" });
					var msf   = result.getValue({ name: "custrecord_msf" });
					var m3    = result.getValue({ name: "custrecord_m3" });
					
					// 不同item fulfillment : subtotal + seperate line
					var seperateStr = "";
					var subtotalStr = "";
					var cntrStr = "";
					if( fulfillment_seperate != "" && fulfillment_seperate != fulfillment_id)
					{
						//seperate line
						// seperateStr = loadxml.runSeperate();
						
						//replace subtotal xml
						subtotalStr = loadxml.runSubTotal("packing","SUB",sum_UNIT,sum_PCS,sum_MSF,sum_M3) + loadxml.runBlank();
						
						//replace container info.
						cntrStr = loadxml.runCntr(cntrCnt,formRec,lastMarks) + loadxml.runBlank();
						
						//reset
						fulfillment_seperate == "";
						sum_UNIT = 0;	
						sum_PCS = 0;	
						sum_MSF = 0;	
						sum_M3 = 0;		
						
						cntrCnt++;
						fulfillmentCnt++;
						
						newFulfillment = true;
					}
					
					// 不同item fulfillment : PO NO.
					var poStr = "";
					if( newFulfillment )
					{
						poStr = loadxml.runPo(poArr[fulfillmentCnt]);
						
						newFulfillment = false;
					}
					
					// 不同樹種 : species
					// var species = result.getValue({ name: "custrecord_species_packing" }) + " " + result.getValue({ name: "custrecord_cut_packing" });
					
					var cut = result.getValue({ name: "custrecord_cut_packing" });
					var species = result.getValue({ name: "custrecord_species_packing" });
					var grade = result.getValue({ name: "custrecord_grade_packing" }); //客人等級
					var groupStr = cut + " " + species + " " + grade;
					
					var speciesText = result.getText({ name: "custrecord_species_packing" });
					var cutText = result.getText({ name: "custrecord_cut_packing" });
					var gradeText = result.getText({ name: "custrecord_grade_packing" });
					
					var speciesStr = "";
					// if( fulfillment_seperate != fulfillment_id || ( species_seperate != "" && species_seperate != species ) )
					if( fulfillment_seperate != fulfillment_id || ( species_seperate != "" && species_seperate != groupStr ) )
					{
						// speciesStr = loadxml.runSpecies(cutText+" "+speciesText);
						speciesStr = loadxml.runSpecies(cutText+" "+speciesText+" , "+gradeText+" GRADE");
					}
					
					// loop line
					var lineStr = seperateStr + subtotalStr + cntrStr + poStr + speciesStr + '<w:tbl>';// + '<w:p w:rsidR="00541847" w:rsidRPr="0027760E" w:rsidRDefault="00541847" w:rsidP="00541847">';
					var lineObj = file.load({ id: 'SuiteScripts/xml/packing/content.xml' }); //[xml] : item fulfillment line內容
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
							
							if( c_cid == "custrecord_packing_unit" || c_cid == "custrecord_pcs_unit" || c_cid == "custrecord_pcs" )
								c_fv = util.round(c_fv,0);
							
							c_str = c_str.replace(/([*])/g,"").replace(c_cid,c_fv);
						}
						
						lineStr += c_str;
						return true;
					});
					
					sum_UNIT += parseFloat(unit);
					sum_PCS += parseFloat(pcs);
					sum_MSF += parseFloat(msf);
					sum_M3 += parseFloat(m3);
					
					sum_grand_UNIT += parseFloat(unit);
					sum_grand_PCS += parseFloat(pcs);
					sum_grand_MSF += parseFloat(msf);
					sum_grand_M3 += parseFloat(m3);
					
					contentStr += lineStr;
					
					fulfillment_seperate = fulfillment_id;
					// species_seperate = species;
					species_seperate = groupStr;
					
					lastMarks = result.getValue({ name: "custrecord_packing_marks" });
					
					return true;
				});
				
				// var seperateStr = loadxml.runSeperate();
				var subtotalStr = loadxml.runSubTotal("packing","SUB",sum_UNIT,sum_PCS,sum_MSF,sum_M3);
				var cntrStr = loadxml.runCntr(cntrCnt,formRec,lastMarks);
				
				var grandtotalStr = loadxml.runSubTotal("packing","GRAND",sum_grand_UNIT,sum_grand_PCS,sum_grand_MSF,sum_grand_M3) + loadxml.runBlank();
				
				// contentStr += seperateStr;
				contentStr += subtotalStr;
				contentStr += cntrStr;
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