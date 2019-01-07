/**
 * colorteam_CommonUtil.js
 * @NApiVersion 2.x
 * @NModuleScope public
 */
define(['N/record','N/ui/dialog','N/search','N/url','N/ui/message'],

function(record,dialog,search,url,message) {
	
	/**
	 * type | type_content
	 * URL  | 開啟視窗網址
	 * MSG  | 顯示訊息內容
	 */
	function dialogObj(type,t,m,c)
	{
		this.type = type;
		this.title = t;
		this.msg = m;
		this.content = c;
	}
	
	dialogObj.prototype.showDialog = function()
	{
		if( this.type == "URL" )
		{
			var url = this.content;
			dialog.confirm({
				title:	 this.title,
				message: this.msg
			}).then(function(){ window.open(url); }).catch(function(){ }); 
		}
		
		if( this.type == "MSG" )
		{
			dialog.confirm({
				title:	 this.title,
				message: this.msg
			}).then(function(){ }).catch(function(){ }); 
		}
		
	}
	
	function showButtonMsg(t,m,type)
	{
		var msg = message.create({
			title:   t, 
			message: m, 
			type: ( type=="CONFIRMATION" ? message.Type.CONFIRMATION : ( type=="WARNING" ? message.Type.WARNING : message.Type.ERROR ) )
		});
		msg.show();
		
		return msg;
	}
		
	/**
	 * 傳入item name，回傳
	 * (1)id 
	 * (2)製程部門
	 * (3)item display name
	 */
	function searchItem(item_name)
	{
		var itemInfo = {};
		if( item_name != "" )
		{
			search.create({
				type: "item",
				columns: [
					'custitem_process', //製程部門 (委外=11)
					'displayname',
					search.createColumn({ //採購單價(for委外使用)
						name: "cost",
						join: "memberItem"
					}),
					search.createColumn({ //kit item裡所含項目(for委外使用)
						name: "internalid",
						join: "memberItem"
					}),
					'baseprice'  //基礎價格
				],
				filters:
				[
					["type","anyof","Group","Kit"], 
					"AND", 
					["nameinternal","is",item_name] //傳入料號
				]
			})
			.run().each(function(result) {
				itemInfo[0] = result.id;
				itemInfo[1] = result.getValue({"name":"custitem_process"});
				itemInfo[2] = result.getValue({"name":"displayname"});
				itemInfo[3] = result.getValue(result.columns[2]); //委外
				itemInfo[4] = result.getValue({"name":"baseprice"});
				itemInfo[5] = result.getValue(result.columns[3]); //委外
				return false;
			});
		}
		else
		{
			itemInfo[0] = "";
			itemInfo[1] = "";
			itemInfo[2] = "";
			itemInfo[3] = "";
			itemInfo[4] = "";
			itemInfo[5] = "";
		}
		return itemInfo;
	}
	
	function getUrl()
	{
		var scheme = 'https://';
		var host = url.resolveDomain({
			hostType: url.HostType.APPLICATION
		});
		return scheme+host;
	}
	
	function delayPromise(ms) {
		return function(result) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(result)
				}, ms)
			})
		}
	}
	
	function ProjectTask(title, companyId, parent_quantity, kit_unit, item_code, dept, base_price, ori_parent_quantity, chcekItem)
	{
		this.title = title;
		this.companyId = companyId;
		this.parent_quantity = parent_quantity;
		this.kit_unit = kit_unit;
		this.item_code = item_code;
		this.dept = dept;
		this.base_price = base_price;
		this.ori_parent_quantity = ori_parent_quantity;
		this.chcekItem = chcekItem; //是否檢查料號是否符合ITEM
	}

	ProjectTask.prototype.createProjectTask = function(parent)
	{
		var taskRecord = record.create({
		    type: record.Type.PROJECT_TASK, 
		    isDynamic: true,
		});
		
		taskRecord.setValue({
            fieldId: 'title',
            value: this.title
        });
		
		taskRecord.setValue({
            fieldId: 'custevent_unit',
            value: this.kit_unit
        });
		
		//料號文字欄位，在dashboard可貼上文字
		taskRecord.setValue({
            fieldId: 'custevent_process',
            value: this.title
        });
		
		taskRecord.setValue({
			fieldId: 'custevent_item', //項目代碼
			value: this.item_code
		});
		
		taskRecord.setValue({
			fieldId: 'custevent_assignee', //指派人員
			value: ""
		});
		
		taskRecord.setValue({
			fieldId: 'custevent_assign_default', //指派預設
			value: 1
		});

		taskRecord.setValue({
			fieldId: 'custevent_assign_department', //指派部門
			value: this.dept
		});
		
		taskRecord.setValue({
            fieldId: 'company',
            value: this.companyId
        });
		
		taskRecord.setValue({
            fieldId: 'parent',
            value: parent
        });
		
		taskRecord.setValue({
            fieldId: 'custevent_parent_quantity',
            value: this.parent_quantity
        });
		
		taskRecord.setValue({
            fieldId: 'custevent_ori_parent_quantity',
            value: this.ori_parent_quantity
        });
		
		taskRecord.setValue({
            fieldId: 'custevent_price',
            value: this.base_price
        });
		
		taskRecord.setValue({
            fieldId: 'priority',
            value: "MEDIUM"
        });
		
		taskRecord.setValue({
            fieldId: 'status',
            value: "NOTSTART"
        });
		var teaskId = "";
		try{
		// var teaskId = taskRecord.save();
		teaskId = taskRecord.save();
		}catch(e)
		{console.log("error:"+e.message);}
		
		return teaskId;
    }
	
	// 千分位
	function formatPrice(p)
	{
		return p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	
	// 四捨五入小數點
	function round(value, decimals) {
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}
	
    return {
		dialogObj: dialogObj,
		searchItem: searchItem,
		getUrl: getUrl,
		delayPromise: delayPromise,
		showButtonMsg: showButtonMsg,
		ProjectTask: ProjectTask,
		formatPrice: formatPrice,
		round: round
    };
    
});