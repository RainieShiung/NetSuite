/**
 * load_ExportFormXML.js
 * @NApiVersion 2.x
 * @NModuleScope public
 */
define(['N/file', 'N/encode', 'N/record', 'N/search', 'N/runtime','./commonUtil'],

function( file, encode, record, search, runtime, util) {
	
	var notation = "***";

	function runBlank()
	{
		var lineStr = "";
		var blankObj = file.load({ id: 'SuiteScripts/xml/blank.xml' });
		var s_iterator = blankObj.lines.iterator();
		s_iterator.each(function (line){
			
			var s_str = line.value;
			lineStr += s_str;
			
			return true;
		});
		return lineStr;
	}
	
	function runSubTotal(form_type,TOTAL_TYPE,sum_UNIT,sum_PCS,sum_MSF,sum_M3)
	{
		var lineStr = "";
		var subtotalObj = file.load({ id: 'SuiteScripts/xml/'+form_type+'/subtotal.xml' });
		var t_iterator = subtotalObj.lines.iterator();
		t_iterator.each(function (line){
			
			var t_str = line.value;
			
			var t_s1 = t_str.indexOf(notation);
			var t_s2 = t_str.lastIndexOf(notation);
			if( t_s1 != t_s2 )
			{
				var t_cid = t_str.substring(t_s1+notation.length,t_s2);
				if( t_cid == "TOTAL_TYPE" ) 
					t_str = t_str.replace(/([*])/g,"").replace(t_cid,TOTAL_TYPE);
				else
				{
					var t_fv = eval(t_cid);
					t_str = t_str.replace(/([*])/g,"").replace(t_cid,util.round(t_fv,3));
				}
			}
			lineStr += t_str;
			return true;
		});
		
		return lineStr;
	}
	
	function runCntr(seq,formRec,lastMarks)
	{
		var lineStr = "";
		if( lastMarks.indexOf("-") != -1 ) lastMarks = lastMarks.split("-")[1];
		
		var cntrObj = file.load({ id: 'SuiteScripts/xml/cntr.xml' });
		var t_iterator = cntrObj.lines.iterator();
		
		var ori_cid = "";
		t_iterator.each(function (line){
			
			var t_str = line.value;
			
			var t_s1 = t_str.indexOf(notation);
			var t_s2 = t_str.lastIndexOf(notation);
			
			
			if( t_s1 != t_s2 )
			{
				var t_cid = t_str.substring(t_s1+notation.length,t_s2);
				ori_cid = t_cid;
				
				if( t_cid.indexOf("[seq]") != -1 )
				{
					t_cid = t_cid.replace("[seq]", seq);
				}
				var t_fv = formRec.getValue({ fieldId: t_cid });
				

				if( t_cid == "custrecord_marks" )
				{
					var marksStr = "";
					var marksArr = t_fv.split("\r");
					for( var i=0 ; i<marksArr.length ; i++ )
					{
						var marksContent = marksArr[i];
						// log.debug("marksContent:"+marksContent);
						
						if( marksContent.indexOf("*ORDER NO.*") != -1 )
						{
							var buyer_no = formRec.getValue({ fieldId: "custrecord_buyer_no" }).split("/")[seq-1];
							marksContent = marksContent.replace("*ORDER NO.*", buyer_no);
						}
						
						if( marksContent.indexOf("*VENDOR COUNTRY*") != -1 )
						{
							var v_ctry = formRec.getValue({ fieldId: "custrecord_vendor_country" });
							marksContent = marksContent.replace("*VENDOR COUNTRY*", v_ctry);
						}
						
						if( marksContent.indexOf("*TOTAL CRATES*") != -1 )
						{
							marksContent = marksContent.replace("*TOTAL CRATES*", lastMarks);
						}

						var marksObj = file.load({ id: 'SuiteScripts/xml/cntr_marks.xml' });
						var m_iterator = marksObj.lines.iterator();
						m_iterator.each(function (marks_line){
							var m_str = marks_line.value;
							marksStr += m_str.replace(/([*])/g,"").replace("MARKS_LINE",marksContent);
							
							return true;
						});
					}
					t_str = marksStr;
				}
				else
				{
					t_str = t_str.replace(/([*])/g,"").replace(ori_cid,t_fv);
				}
			}
			lineStr += t_str;
			return true;
		});
		
		return lineStr;
	}
	
	function runSpecies(species)
	{
		var lineStr = "";
		var speciesObj = file.load({ id: 'SuiteScripts/xml/species_header.xml' });
		var t_iterator = speciesObj.lines.iterator();
		
		t_iterator.each(function (line){
			
			var t_str = line.value;
			
			var t_s1 = t_str.indexOf(notation);
			var t_s2 = t_str.lastIndexOf(notation);
			
			if( t_s1 != t_s2 )
			{
				var t_cid = t_str.substring(t_s1+notation.length,t_s2);
				// var t_fv = formRec.getValue({ fieldId: t_cid });
				t_str = t_str.replace(/([*])/g,"").replace(t_cid,species);
			}
			lineStr += t_str;
			return true;
		});
		
		return lineStr;
	}
	
	function runPo(po)
	{
		var lineStr = "";
		var poObj = file.load({ id: 'SuiteScripts/xml/po_header.xml' });
		var t_iterator = poObj.lines.iterator();
		
		t_iterator.each(function (line){
			
			var t_str = line.value;
			
			var t_s1 = t_str.indexOf(notation);
			var t_s2 = t_str.lastIndexOf(notation);
			
			if( t_s1 != t_s2 )
			{
				var t_cid = t_str.substring(t_s1+notation.length,t_s2);
				t_str = t_str.replace(/([*])/g,"").replace(t_cid,po);
			}
			lineStr += t_str;
			return true;
		});
		
		return lineStr;
	}
	
    return {
		runBlank: runBlank,
		runSubTotal: runSubTotal,
		runCntr: runCntr,
		runSpecies: runSpecies,
		runPo: runPo
    };
    
});