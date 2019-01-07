/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/record','N/log'],

function(search,record,log) {
	
	var myMap = {};
	function checkDuplicate(rType,nameValue,checkStr)
	{
		var v = myMap[checkStr];
		log.debug({title:'checkDuplicate',details:nameValue+" => "+checkStr});
		if( !v )
		{
			//myMap[nameValue] = processValue+itemValue+sizeValue+weightValue+materialsValue+colorValue+typeValue;
			myMap[checkStr] = nameValue;
			return 'NO_DUP'
		}
		return 'DUP';
	}
	
	function deleteAll(rType)
	{
    	search.create({
            "type": 'customrecord_6_'+rType
        })
        .run().each(
		
			function(result, index){
				try{
					var delRecord = record.delete({
						type: 'customrecord_6_'+rType,
						id: result.id,
					});
					log.debug({title:'delete',details:result.id+"("+index+")"});
					return true;
				}catch(e){
					log.debug({title:'delete error',details:result.id+"("+index+")"});
					return true;
				}
				
			}
		);
		return false;
	}
	
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
	 
	// 製程代碼七項目
	var dropArr = [
			"process",         //製程
			"print_item",      //項目
			"print_size",      //尺寸
			"paper_weight",    //紙張磅數
			"paper_materials", //紙張材質
			"print_color",     //印色
			"print_type"       //印法
	];
	
	// 製程代碼七項目 (縮寫)
	var dropArr_s = [
			"p",    //製程
			"t",    //項目
			"z",    //尺寸
			"w",    //紙張磅數
			"m",    //紙張材質
			"c"//,  //印色
			//"print_type"       //印法
	];
	
    function execute(scriptContext)
	{
    	var savedSearch = search.load({
            id: 'customsearch_dynamic_dropdown' //填入saved search ID
        });
		
		savedSearch.columns = [
			{ name: 'custitem_process' },         //製程
			{ name: 'custitem_print_item' },      //項目
			{ name: 'custitem_print_size' },      //尺寸
			{ name: 'custitem_paper_weight' },    //紙張磅數
			{ name: 'custitem_paper_materials' }, //紙張材質
			{ name: 'custitem_print_color' },     //印色
			{ name: 'custitem_print_type' }       //印法
		];
		
    	savedSearch.run().each(function(result)
		{
			//for(var i=2;i<dropArr.length;i++)
			
			for(var i=3;i<dropArr.length;i++)
			// for(var i=dropArr.length-1;i>2;i--)
			{
				//deleteAll(dropArr[3]);
				 
				var nameValue      = result.getText({name: 'custitem_'+dropArr[i]});
				
				var checkStr = "";
				for(var j=0;j<=i;j++)
				{
					checkStr = checkStr + result.getText({name: 'custitem_'+dropArr[j]});
				}
				
				var isDup = checkDuplicate(dropArr[i], nameValue, checkStr);
				
				log.debug({title:'isDup',details:isDup+" ["+dropArr[i]+" , "+nameValue+" , "+checkStr+"]"});

				if( 'NO_DUP' == isDup )
				{
					// log.debug({title:'save',details:nameValue+' , '+processValue});
					
					log.debug({title:'start',details:dropArr[i]});
					
					var createRecord = record.create({
						type: 'customrecord_6_'+dropArr[i],
						isDynamic: true
					});
					
					createRecord.setValue({
						fieldId: 'name',
						value: nameValue
					});
					
					
					// 只跑此ARRAY ITEM以上的項目
					for(var j=0;j<i;j++)
					{
						var r = result.getValue(result.columns[j]);
						if( j>0 ) //製程需抓取getText
						{
							var sValue = result.getText(result.columns[j]);
							
							log.debug({title:'sValue',details:">"+sValue+"<"});
							
							search.create({
								"type": "customrecord_6_"+dropArr[j],
								"filters": [['name', 'is', sValue]]
							})
							.run().each(function(result) {
								r = result.id
								log.debug({title:'get internal id',details:r});
								return false;
							});
						}

						log.debug({title:'save loop : '+dropArr[j],details:'custrecord_'+dropArr[i]+'_'+dropArr_s[j]+' = '+r+" ("+result.getText(result.columns[j])+")"});
						
						try {
							createRecord.setValue({
								fieldId: 'custrecord_'+dropArr[i]+'_'+dropArr_s[j], //custrecord_paper_materials_p
								value: r
							});
						}catch(err){
							log.debug({title:'save error',details:err});
						}
						
					}
					
					createRecord.save();
					
				}
				
			}

    		return true;
		});

    }

    return {
        execute: execute
    };
    
});
