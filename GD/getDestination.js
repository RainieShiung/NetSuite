/**
 * getDestination.js
 * @NApiVersion 2.x
 */
define(['N/search'],

function(search) {
	
	// current record需用insertSelectOption;其他需用addSelectOption
	function getDestination_Promise(rType,cid,select_destination)
	{
		var cityArr = [];
		search.create.promise({
			type: "customrecord_destination_mapping",
			filters: [
				["custrecord_company","is",cid]
			],
			columns:
			[
				search.createColumn({name: "name"}),
				search.createColumn({name: "custrecord_address", label: "Address"})
			]
		})
		.then(function(searchObj) {

			searchObj.run().each(function(result){
				
				var city = result.getValue(result.columns[0]);
				var address = result.getValue(result.columns[1]);
				
				var cArr = new Array();
				cArr[0] = city;
				cArr[1] = address;
				cityArr.push(cArr);
				
				return true;
			});
			
			if( select_destination )
			{
				//若為fieldChange，需先清空下拉選單
				if( rType == "insert" )
				{
					select_destination.removeSelectOption({value: null}); 
				}
				
				eval("select_destination."+rType+"SelectOption({value: '', text: '===== Select ====='});");
				cityArr.forEach(function(c) {
					eval("select_destination."+rType+"SelectOption({value: c[1], text: c[0]});");
				});
			}
			
		})
		.catch(function(reason) {
			log.debug({
				details: "Load Destination Mapping Failed: " + reason
			});
		});
		
		// search.create.promise({
			// type: "customer",
			// filters: [
				// ["internalid","is",cid], "AND", 
				// ["address.city","isnotempty",""]
			// ],
			// columns: [
				// search.createColumn({ name: "city", join: "Address" }),
				// search.createColumn({ name: "addressinternalid" }),
				// search.createColumn({ name: "address", label: "Address" })
			// ]
		// })
		// .then(function(searchObj) {

			// searchObj.run().each(function(result){
				
				// var city = result.getValue(result.columns[0]);
				// var city_id = result.getValue(result.columns[1]);
				// var address = result.getValue(result.columns[2]);
				
				// if( address.indexOf(city) != -1 ) //地址包含CITY名
				// {
					// var cArr = new Array();
					// cArr[0] = city;
					// cArr[1] = city_id;
					// cityArr.push(cArr);
				// }
				
				// return true;
			// });
			
			// if( select_destination )
			// {
				// //若為fieldChange，需先清空下拉選單
				// if( rType == "insert" )
				// {
					// select_destination.removeSelectOption({value: null}); 
				// }
				
				// eval("select_destination."+rType+"SelectOption({value: '', text: '===== Select ====='});");
				// cityArr.forEach(function(c) {
					// eval("select_destination."+rType+"SelectOption({value: c[1], text: c[0]});");
				// });
			// }
			
		// })
		// .catch(function(reason) {
			// log.debug({
				// details: "Load Destination Mapping Failed: " + reason
			// });
		// });
		
	}
	
	function getDestination(rType,cid,select_destination)
	{
		var cityArr = [];
		var customerSearchObj = search.create({
			type: "customrecord_destination_mapping",
			filters: [
				["custrecord_company","is",cid]
			],
			columns:
			[
				search.createColumn({name: "name"}),
				search.createColumn({name: "custrecord_address", label: "Address"})
			]
		});

		customerSearchObj.run().each(function(result){
			var city = result.getValue(result.columns[0]);
			var address = result.getValue(result.columns[1]);
			
			var cArr = new Array();
			cArr[0] = city;
			cArr[1] = address;
			cityArr.push(cArr);
			
			return true;
		});
		
		// 有傳select物件，才需進行以下組合select動作
		if( select_destination )
		{
			//若為fieldChange，需先清空下拉選單
			if( rType == "insert" )
			{
				select_destination.removeSelectOption({value: null}); 
			}
			
			eval("select_destination."+rType+"SelectOption({value: '', text: '===== Select ====='});");
			cityArr.forEach(function(c) {
				eval("select_destination."+rType+"SelectOption({value: c[1], text: c[0]});");
			});
		}
		
		
		// var customerSearchObj = search.create({
			// type: "customer",
			// filters: [
				// ["internalid","is",cid], "AND", 
				// ["address.city","isnotempty",""]
			// ],
			// columns: [
				// search.createColumn({ name: "city", join: "Address" }),
				// search.createColumn({ name: "addressinternalid" }),
				// search.createColumn({ name: "address", label: "Address" })
			// ]
		// });

		// customerSearchObj.run().each(function(result){
			// var city = result.getValue(result.columns[0]);
			// var city_id = result.getValue(result.columns[1]);
			// var address = result.getValue(result.columns[2]);
			
			// if( address.indexOf(city) != -1 ) //地址包含CITY名
			// {
				// var cArr = new Array();
				// cArr[0] = city;
				// cArr[1] = city_id;
				// cityArr.push(cArr);
			// }
			
			// return true;
		// });
		
		// // 有傳select物件，才需進行以下組合select動作
		// if( select_destination )
		// {
			// //若為fieldChange，需先清空下拉選單
			// if( rType == "insert" )
			// {
				// select_destination.removeSelectOption({value: null}); 
			// }
			
			// eval("select_destination."+rType+"SelectOption({value: '', text: '===== Select ====='});");
			// cityArr.forEach(function(c) {
				// eval("select_destination."+rType+"SelectOption({value: c[1], text: c[0]});");
			// });
		// }
	}
	
	// current record需用insertSelectOption;其他需用addSelectOption
	function getAddress_Promise(rType,cid,select_address)
	{
		var addrArr = [];
		search.create.promise({
			type: "customer",
			filters: [
				["internalid","is",cid]
			],
			columns:
			[
				search.createColumn({
					name: "address1",
					join: "Address"
				}),
				search.createColumn({
					name: "addressinternalid",
					join: "Address"
				})
			]
		})
		.then(function(searchObj) {

			searchObj.run().each(function(result){
				
				var address = result.getValue(result.columns[0]);
				var address_id = result.getValue(result.columns[1]);
				
				var cArr = new Array();
				cArr[0] = address;
				cArr[1] = address_id;
				addrArr.push(cArr);
				
				return true;
			});
			
			if( select_address )
			{
				//若為fieldChange，需先清空下拉選單
				select_address.removeSelectOption({value: null}); 
				select_address.insertSelectOption({value: "X", text: "===== Select ====="});
				addrArr.forEach(function(c) {
					select_address.insertSelectOption({value: c[1], text: c[0]});
				});
			}
			
		})
		.catch(function(reason) {
			log.debug({
				title: "getAddress_Promise",
				details: reason
			});
		});
		
	}
	
	function getAddress(rType,cid,select_Address)
	{
		var addrArr = [];
		var customerSearchObj = search.create({
			type: "customer",
			filters: [
				["internalid","is",cid]
			],
			columns:
			[
				search.createColumn({
					name: "address1",
					join: "Address"
				}),
				search.createColumn({
					name: "addressinternalid",
					join: "Address"
				})
			]
		});

		customerSearchObj.run().each(function(result){
			var address = result.getValue(result.columns[0]);
			var address_id = result.getValue(result.columns[1]);
			
			var cArr = new Array();
			cArr[0] = address;
			cArr[1] = address_id;
			addrArr.push(cArr);
			
			return true;
		});
		
		// 有傳select物件，才需進行以下組合select動作
		if( select_Address )
		{
			//若為fieldChange，需先清空下拉選單
			if( rType == "insert" )
			{
				select_Address.removeSelectOption({value: null}); 
			}
			
			eval("select_Address."+rType+"SelectOption({value: '', text: '===== Select ====='});");
			addrArr.forEach(function(c) {
				eval("select_Address."+rType+"SelectOption({value: c[1], text: c[0]});");
			});
		}
	}
	
    return {
		getDestination:  getDestination,
		getDestination_Promise: getDestination_Promise,
		getAddress:  getAddress,
		getAddress_Promise: getAddress_Promise
    };
    
});