/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(["N/log", "N/redirect", "N/runtime", "N/ui/serverWidget", "N/url", "N/search", "N/record"], 
function (log, redirect, runtime, ui, url, search, record)
{
	function showItemChooseForm(context)
	{
        var form = ui.createForm({
            title: 'Item Choosen'
        });
        var req = context.request;
		
		// 接收母頁面傳的參數
		var so_id = req.parameters.so_id;
		var po_id = req.parameters.po_id;
		var currIndex = req.parameters.currIndex;
		
		// log.error('first params', po_id+" , "+so_id+" , "+currIndex);
		
		// 建立下拉選單，資料來自Saved Search
		var select = form.addField({
            id: "fisatest",
            label: "ITEM LIST",
            type: ui.FieldType.MULTISELECT
        });
		
		var poId = form.addField({
            id: "fisatest_poid",
            label: "Purchase Order ID",
            type: ui.FieldType.TEXT
        });
		poId.defaultValue = po_id;
		
		var currIndexField = form.addField({
            id: "fisatest_idx",
            label: "Sublist Current Index",
            type: ui.FieldType.TEXT
        });
		currIndexField.defaultValue = currIndex;
		
		// 開始執行Saved Search
		var itemSearch = search.load({
            id: 'customsearch_edx_so_item'
        });
		
		// 加入SO單號為篩選條件
		var filters = itemSearch.filters;
		var mySearchFilter = search.createFilter({
			name: 'internalid',
			operator: search.Operator.IS,
			values: [so_id] 
		});
		filters.push(mySearchFilter);
		itemSearch.filters = filters;
		
		itemSearch.run().each(function(result)
		{
    		var itemName  = result.getValue(result.columns[0]);
			var itemDesc  = result.getValue(result.columns[1]);
			var expectedDate  = result.getValue(result.columns[3]);
			var quantity  = result.getValue(result.columns[2]);
			
    		select.addSelectOption({
	            value: itemName,
	            text: "Item: "+itemName +" ("+itemDesc+") | Expected Ship Date: "+expectedDate+" | Quantity:"+quantity
	        });
    		return true;
		});
		
        form.addSubmitButton({
			label: 'Choose Item'
        });

        context.response.writePage(form);
    }

	/**
	 * PO Line挑選SO單號，跳出Suitelet視窗
	 * 列出該張SO之Item供User挑選
	 */
	function onRequest(context) {
		
		/**
		 * User選擇完後，點選Submit，將資料回傳PO視窗
		 * 用context.response.write(s);回傳
		 */
        if (context.request.method === 'POST')
		{
			var so_line = "";
			var po_id = "";
			var currIndex = "";
			
			var params = {};
			for (var k in context.request.parameters) // 擷取參數
			{
                if (k.indexOf('fisatest') >= 0)
				{
                    params[k] = context.request.parameters[k];
					// log.error('params['+k+']', params[k]);
                }
				
				if(k == 'fisatest') so_line = context.request.parameters[k];
				if(k == 'fisatest_poid') po_id = context.request.parameters[k];
				if(k == 'fisatest_idx') currIndex = context.request.parameters[k];
            }
			
			// 將選取的Item資料回寫PO頁面
			var s = '<script>';
			s +=       'self.close();'; // 關閉挑選視窗
			s +=       'var cellLength=window.opener.document.getElementById("item_row_'+(parseInt(currIndex)+1)+'").cells.length;';
			s +=       'window.opener.document.getElementById("item_row_1").cells[cellLength-1].innerHTML = "'+so_line+'";';
			s +=       'window.opener.document.item_form.custcol42.value = "'+so_line+'";';
			s +=    '</script>';
			context.response.write(s);

            return false;
        }
		
		// 開啟Item挑選頁面
        showItemChooseForm(context);
    }
	
	return {
        onRequest: onRequest
    };
});