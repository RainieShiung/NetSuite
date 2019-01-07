/**
 * getContactInfo.js
 * @NApiVersion 2.x
 */
define(['N/search'],

function(search) {
	
	function getPrimaryContact(cid,contact_name)
	{
		var customerSearchObj = search.create({
			type: "customer",
			filters:
			[
				// ["entityid","is",c_name]
				["internalid","is",cid]
			],
			columns:
			[
				search.createColumn({
					name: "internalid",
					join: "contact",
					label: "Internal ID"
				}),
				search.createColumn({
					name: "entityid",
					join: "contact",
					label: "Name"
				}),
				search.createColumn({
					name: "title",
					join: "contact",
					label: "Job Title"
				}),
				search.createColumn({
					name: "phone",
					join: "contact",
					label: "Phone"
				}),
				search.createColumn({
					name: "fax",
					join: "contact",
					label: "Fax"
				}),
				search.createColumn({
					name: "email",
					join: "contact",
					label: "Email"
				}),
				search.createColumn({
					name: "salutation",
					join: "contact"
				})
			]
		});
		
		if( contact_name )
		{
			var filters = customerSearchObj.filters;
			var mySearchFilter = search.createFilter({
				name: "entityid",
				operator: search.Operator.IS,
				join: 'contact',
				values: contact_name
			});
			filters.push(mySearchFilter);
			customerSearchObj.filters = filters;
			
			console.log("add filters : "+contact_name);
		}

		var customer_id, job_title, phone, fax, email, salutation;
		
		customerSearchObj.run().each(function(result){

			customer_id = result.getText(result.columns[0]);
			job_title = result.getValue(result.columns[2]);
			phone = result.getValue(result.columns[3]);
			fax = result.getValue(result.columns[4]);
			email = result.getValue(result.columns[5]);
			salutation = result.getValue(result.columns[6]);
			
			return true;
		});
		
		return [customer_id, job_title, phone, fax, email, salutation]
	}
	
	// current record需用insertSelectOption;其他需用addSelectOption
	function getProjectSelect(rType,cid,select_contact,select_bill,select_ship)
	{
		var addressArr = [];
		var contactArr = [];
		var default_bill = "";
		var default_ship = "";
		var default_contact = "";
		
		var customerSearchObj = search.create({
			type: "customer",
			filters:
			[
				["internalid","is",cid]
			],
			columns:
			[
				search.createColumn({name: "address1"}),
				// search.createColumn({name: "contact", label: "Primary Contact"}),
				search.createColumn({
					name: "internalid",
					join: "contactPrimary"
				}),
				search.createColumn({
					name: "entityid",
					join: "contact",
					label: "Name"
				}),
				search.createColumn({name: "isdefaultbilling"}),
				search.createColumn({name: "isdefaultshipping"}),
				search.createColumn({
					name: "internalid",
					join: "contact",
					label: "Internal ID"
				}),
				search.createColumn({
					name: "title",
					join: "contact",
					label: "Job Title"
				}) ,
				search.createColumn({
					name: "salutation",
					join: "contact"
				}),/* ,
				search.createColumn({
					name: "phone",
					join: "contact",
					label: "Phone"
				}),
				search.createColumn({
					name: "fax",
					join: "contact",
					label: "Fax"
				}),
				search.createColumn({
					name: "email",
					join: "contact",
					label: "Email"
				}) */
			]
		});

		var addressArr = [];
		var contactArr = [];
		var contactIdArr = [];
		var default_bill = "";
		var default_ship = "";
		var default_contact = "";
		
		customerSearchObj.run().each(function(result){
			
			var addr = result.getValue(result.columns[0]);
			// var primary_contact = result.getText(result.columns[1]);
			var primary_contact_id = result.getText(result.columns[1]);
			var contact = result.getValue(result.columns[2]);
			var is_bill = result.getValue(result.columns[3]);
			var is_ship = result.getValue(result.columns[4]);
			var cid = result.getValue(result.columns[5]);
			var job_title = result.getValue(result.columns[6]);
			var salutation = result.getValue(result.columns[7]);
			
			if( is_bill ) default_bill = addr;
			if( is_ship ) default_ship = addr;
			default_contact = primary_contact_id;
			
			//檢查地址與聯絡人是否重複
			if( addressArr.indexOf(addr) == -1 )
			{
				if( addr != "") addressArr.push(addr);
			}
			
			if( contactIdArr.indexOf(cid) == -1 )
			{
				contactIdArr.push(cid);
				
				var cArr = new Array();
				cArr[0] = contact+ (salutation ? " ("+salutation+")" : "" ) + (job_title ? " ("+job_title+")" : "" );
				cArr[1] = cid;
				if( contact != "") contactArr.push(cArr);
			}
			return true;
		});
		
		//有傳select物件，才需進行以下組合select動作
		if( select_contact )
		{
			//若為fieldChange，需先清空下拉選單
			if( rType == "insert" )
			{
				select_contact.removeSelectOption({value: null}); 
			}
			
			contactArr.forEach(function(c) {
				eval("select_contact."+rType+"SelectOption({value: c[1],text: c[0]});");
			});
		}
		
		if( select_bill )
		{
			//若為fieldChange，需先清空下拉選單
			if( rType == "insert" )
			{
				select_bill.removeSelectOption({value: null}); 
			}
			
			addressArr.forEach(function(b) {
				eval("select_bill."+rType+"SelectOption({value: b ,text: b});");
			});
		}
		
		if( select_ship )
		{
			//若為fieldChange，需先清空下拉選單
			if( rType == "insert" )
			{
				select_ship.removeSelectOption({value: null}); 
			}
			
			addressArr.forEach(function(b) {
				eval("select_ship."+rType+"SelectOption({value: b ,text: b});");
			});
		}
		
		return [default_bill,default_ship,default_contact]
	}
	
    return {
		getProjectSelect:  getProjectSelect,
		getPrimaryContact: getPrimaryContact
    };
    
});