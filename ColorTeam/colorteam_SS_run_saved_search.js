/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/record','N/log'],

function(search,record,log) {
	
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext)
	{
    	var savedSearch = search.load({
            id: 'customsearch58' //填入saved search ID
        });
		
    	savedSearch.run().each(function(result)
		{
			var internal_id = result.getValue(result.columns[0]); // 將Contact的internal_id排在第一欄

			var objContactRecord = record.load({
				type: record.Type.CONTACT,
				id: internal_id
			});
			
			objContactRecord.setValue({
				fieldId: 'contactrole',
				value: -10 // -10=Primary Contact
			});
			
			var recordId = objContactRecord.save({
				enableSourcing: true,
				ignoreMandatoryFields: true
			});
			
    		return true;
		});

    }

    return {
        execute: execute
    };
    
});
