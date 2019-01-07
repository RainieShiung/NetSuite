/**
 * projectCustomFunc.js
 * @NApiVersion 2.x
 */
define(['N/record','N/search','./colorteam_CommonUtil','./getContactInfo','N/url'],

function(record, search, util, g, url) {
	
	// 全選or全不選專案工作
	clickAll = function(t)
	{
		var chk = document.getElementsByName("cb");
		for( var i=0 ; i <chk.length ; i++ )
		{
			if( !chk[i].disabled )
			{
				if( t.checked )
					chk[i].checked = true;
				else
					chk[i].checked = false;
			}			
		}
	}
	
	var chooseMsg = ""; //一開始詢問要拋轉的專案工作勾選視窗
	
	//拋轉訂單主邏輯
	transferToSalesOrder = function(t)
	{
		document.getElementById('cButton').disabled = true;
		
		// 抓出project task
		var group = document.getElementsByName("cb");
		var transfer_q = document.getElementsByName("transfer_q");
		var groupArr = []; //item group id
		var qArr = []; //要拋轉的份數

		for( var i=0 ; i <group.length ; i++ )
		{
			var transferCount = transfer_q[i].value;
			//有勾選且份數>0才拋轉
			if( group[i].checked && transferCount > 0 )
			{
				// chkArr.push(chk[i].value);
				groupArr.push(group[i].value);
				qArr.push(transferCount);
			}
		}

		// 隱藏挑選專案工作視窗
		chooseMsg.hide();
		
		if(qArr.length == 0)
		{
			util.showButtonMsg("拋轉錯誤","請至少挑選一項專案工作，或是至少一項專案工作的[拋轉份數]大於0，以進行後續拋轉銷售訂單作業","ERROR");
		}
		else
		{
			// 取得project id
			var pid = document.testForm.pidValue.value;
			
			var projectRecord = record.load({
				type: record.Type.JOB,
				id: pid 
			});
			
			var entity  = projectRecord.getValue({ fieldId: 'custentity_customer_name' });
			var company = projectRecord.getValue({ fieldId: 'custentity_company' });
			var shippingMethod = projectRecord.getValue({ fieldId: 'custentity_delivery_method' });
			var shipTo = projectRecord.getValue({ fieldId: 'custentity_ship_address' });
			
			if( shippingMethod.length > 1 )
			{
				util.showButtonMsg("拋轉錯誤","只能選擇一種[運送方式]，請重新選擇","ERROR");
			}
			// else if( shipTo.length > 1 )
			// {
				// util.showButtonMsg("拋轉錯誤","只能選擇一個[送貨地址]，請重新選擇","ERROR");
			// }
			else
			{
				var toSalesOrderUrl = url.resolveScript({
					scriptId: 'customscript_to_so_suitelet',
					deploymentId: 'customdeploy_to_so_suitelet'
				});
				
				openUrl(toSalesOrderUrl+"&pid="+pid+"&groupArr="+groupArr+"&qArr="+qArr);
			}
		}
		
		document.getElementById('cButton').disabled = false;
	}
	
	function projectToSalesOrder(pid)
	{		
		var projectRecord = record.load({
			type: record.Type.JOB,
			id: pid 
		});
		
		var approve_to_so  = projectRecord.getValue({ fieldId: 'custentity_approve_to_so' });
		if( !approve_to_so ) //若還沒有Project Task已完成，則不能點選[拋轉銷售訂單]按鈕
		{
			util.showButtonMsg("無法拋轉銷售訂單","專案工作必須至少一項狀態為[已完成]，始能拋轉銷售訂單","WARNING");
		}
		else
		{
			chooseMsg = util.showButtonMsg("請選擇要拋轉的專案工作","<div id='chkDiv'>Loading<img src='/images/setup/loading.gif' border='0' alt=''></div>","WARNING");
			
			util.delayPromise(800)('').then(function(result) {
				var h = 
					"<form name='testForm' action='javascript:transferToSalesOrder(this)'>"+
						"<input type='hidden' name='pidValue' value='"+pid+"'>"+
						"<table border='1' style='border-collapse:collapse;margin-bottom:5px;'>";
						
				var cnt = 0;
				var parentCnt = 0;
				var priceArr = [];
				search.create({
					type: "projecttask",
					columns: [
						'title',
						'status',
						'custevent_parent_quantity',
						'custevent_fulfillment_quantity',
						'custevent_item_group',
						'custevent_subtotal', //數量小計
						'custevent_price', //基礎價格
						'parent'
					],	
					filters: [
						['company', 'is', pid]/* ,
						'AND',
						["parent","anyof","@NONE@"] */
					]
				})
				.run().each(function(result) {
					
					if( cnt == 0 )
					{
						h += 
						"<tr>"+
							"<th><input type='checkbox' onclick='clickAll(this);'></th>"+
							"<th>拋轉份數</th>"+
							"<th>名稱</th>"+
							"<th>狀態</th>"+
							// "<th>基礎價格</th>"+
							"<th>份數</th>"+
							"<th>已出貨份數</th>"+
							// "<th>父階專案工作</th>"+
						"</tr>";
					}
					
					var taskId = result.id;
					var status = result.getValue(result.columns[1]);
					var q = result.getValue(result.columns[2]); //parent quantity
					var fq = result.getValue(result.columns[3]); //fulfillment quantity
					var groupId = result.getValue(result.columns[4]); //item group id
					var subtotal = result.getValue(result.columns[5]); //數量小計
					var price = result.getValue(result.columns[6]); //基礎價格
					var parent = result.getValue(result.columns[7]); //父階專案工作
					var transfer_q = q - ( fq == null ? "0" : fq );

					var chkDisabled = "disabled";
					if( status == 'COMPLETE' ) chkDisabled = "";
					
					if( !parent ) //父階才顯示
					{
						priceArr = [];
						
						h += 
							"<tr>"+
								"<td>"+
									"<input type='checkbox' name='cb' value='"+groupId+"' "+chkDisabled+">"+
									"<input type='hidden' name='subtotal' value='"+subtotal+"'>"+
									"<input type='hidden' id='priceArr_"+parentCnt+"'>"+ //每個父階都有PRICE ARRAY
								"</td>"+
								"<td><input type='text' name='transfer_q' value='"+transfer_q+"' "+chkDisabled+"></td>"+
								"<td>"+result.getValue(result.columns[0])+"</td>"+
								"<td>"+status+"</td>"+
								// "<td>"+price+"</td>"+
								"<td align='center'>"+q+"</td>"+
								"<td align='center'>"+fq+"</td>"+
								// "<td align='center'>"+parent+"</td>"+
							"</tr>";
							
						parentCnt++;
					// }
					// else //子階時，組裝PRICE ARRAY
					// {
						// priceArr.push(price);
					}
					
					cnt++;
					return true;
				});
				h += "</table><input type='submit' id='cButton' value='拋轉'> 只能挑選[已完成]的專案工作<br></form>";
				document.getElementById("chkDiv").innerHTML = h;
			});
		}
	}

	//產生專案工作主邏輯
	doGenerate = function(t)
	{
		document.getElementById('sButton').disabled = true;
		
		var pid = document.testForm.pidValue.value;
		console.log("pid:"+pid);

		var bookName       = document.getElementsByName("bookName");
		var parentQuantity = document.getElementsByName("parentQuantity");
		console.log("start 1 :"+bookName+" , "+parentQuantity);
		var tn 	  		   = document.getElementsByName("taskName");
		var deptId 		   = document.getElementsByName("taskId");
		console.log("start 2 :"+tn+" , "+deptId);
		var startMsg = util.showButtonMsg("開始產生專案工作","請稍候<img src='/images/setup/loading.gif' border='0' alt=''>","WARNING");
		var bookArr = [];
		
		util.delayPromise(800)('').then(function(result) {
			
			for( var i=0 ; i<bookName.length ; i++ )
			{
				var book = bookName[i].value;
				var q = parentQuantity[i].value;
				
				var ptObj = new util.ProjectTask(book, pid, q, "", "", "", "", q, false);
				var pjid = ptObj.createProjectTask();
				var tc = document.getElementsByName("taskCount_"+i);
				
				for( var j=0 ; j<tn.length ; j++ )
				{
					for( var k=0 ; k<tc[j].value ; k++ )
					{
						// var ptObj_sub = new util.ProjectTask(tn[j].value, pid, q, "", "", deptId[j].value, "");
						var ptObj_sub = new util.ProjectTask(tn[j].value, pid, "", "", "", deptId[j].value, ""); //2018.9.25子階份數為空
						ptObj_sub.createProjectTask(pjid);
					}
				}
				bookArr.push(book);
			}
			
			ShowTab("schedule",true);
			
			startMsg.hide();
			util.showButtonMsg("所有書本已產生完成",bookArr.join()+"皆已產生成功","CONFIRMATION");
			document.getElementById('sButton').disabled = false;
		});
	}
	
	bookCount = function(t)
	{
		var bookName = document.getElementById("bookValue").value;
		var pid = document.getElementById("pidValue").value;
		
		var html = 
				"<form name='testForm' action='javascript:doGenerate(this)' style='height: 100%; overflow: hidden;'>"+
				"<input type='submit' id='sButton' value='產生專案工作'><br>"+
					"<input type='hidden' name='pidValue' value='"+pid+"'>"+
					"<input type='hidden' name='taskName' value='數位印刷'>"+
					"<input type='hidden' name='taskName' value='裝訂'>"+
					"<input type='hidden' name='taskName' value='資料處理'>"+
					"<input type='hidden' name='taskName' value='名片'>"+
					"<input type='hidden' name='taskName' value='大圖'>"+
					"<input type='hidden' name='taskName' value='合板印刷'>"+
					"<input type='hidden' name='taskName' value='傳統印刷'>"+
					"<input type='hidden' name='taskName' value='委外'>"+
					"<input type='hidden' name='taskName' value='運送'>"+
					"<input type='hidden' name='taskName' value='材料'>"+
					"<input type='hidden' name='taskName' value='PROJECT'>"+
					"<input type='hidden' name='taskId' value='1'>"+
					"<input type='hidden' name='taskId' value='3'>"+
					"<input type='hidden' name='taskId' value='14'>"+
					"<input type='hidden' name='taskId' value='17'>"+
					"<input type='hidden' name='taskId' value='10'>"+
					"<input type='hidden' name='taskId' value='2'>"+
					"<input type='hidden' name='taskId' value='12'>"+
					"<input type='hidden' name='taskId' value='11'>"+
					"<input type='hidden' name='taskId' value='13'>"+
					"<input type='hidden' name='taskId' value='15'>"+
					"<input type='hidden' name='taskId' value='18'>";
					
		for( var i=0 ; i<document.getElementById("bookText").value ; i++ )
		{
			var h = "<table border='1' style='border-collapse:collapse;margin-top:5px;margin-bottom:5px;float: left;margin-right:5px;'>";
			
			h += 
				"<tr>"+
					"<td>子階名稱</td>"+
					"<td><input type='text' style='width:220px;' name='bookName' value='"+bookName+"'></td>"+
				"</tr>"+
				"<tr>"+
					"<td>份數</td>"+
					"<td><input type='text' style='width:220px;' name='parentQuantity' value='1'></td>"+
				"</tr>"+
				"<tr>"+
					"<td>數位印刷</td>"+
					"<td><input name='taskCount_"+i+"' type='text' style='width:220px;' value='0'></td>"+
				"</tr>"+
				"<tr>"+
					"<td>裝訂</td>"+
					"<td><input name='taskCount_"+i+"' type='text' style='width:220px;' value='0'></td>"+
				"</tr>"+
				"<tr>"+
					"<td>資料處理</td>"+
					"<td><input name='taskCount_"+i+"' type='text' style='width:220px;' value='0'></td>"+
				"</tr>"+
				"<tr>"+
					"<td>名片</td>"+
					"<td><input name='taskCount_"+i+"' type='text' style='width:220px;' value='0'></td>"+
				"</tr>"+
				"<tr>"+
					"<td>大圖</td>"+
					"<td><input name='taskCount_"+i+"' type='text' style='width:220px;' value='0'></td>"+
				"</tr>"+
				"<tr>"+
					"<td>合板印刷</td>"+
					"<td><input name='taskCount_"+i+"' type='text' style='width:220px;' value='0'></td>"+
				"</tr>"+
				"<tr>"+
					"<td>傳統印刷</td>"+
					"<td><input name='taskCount_"+i+"' type='text' style='width:220px;' value='0'></td>"+
				"</tr>"+
				"<tr>"+
					"<td>委外</td>"+
					"<td><input name='taskCount_"+i+"' type='text' style='width:220px;' value='0'></td>"+
				"</tr>"+
				"<tr>"+
					"<td>運送</td>"+
					"<td><input name='taskCount_"+i+"' type='text' style='width:220px;' value='0'></td>"+
				"</tr>"+
				"<tr>"+
					"<td>材料</td>"+
					"<td><input name='taskCount_"+i+"' type='text' style='width:220px;' value='0'></td>"+
				"</tr>"+
				"<tr>"+
					"<td>PROJECT</td>"+
					"<td><input name='taskCount_"+i+"' type='text' style='width:220px;' value='0'></td>"+
				"</tr>"+
				"</table>";
				
			html = html + h ;
		}
		document.getElementById("chkDiv").innerHTML = html;
	}
	
	function generateTask(pid,bookName)
	{
		chooseMsg = util.showButtonMsg("請輸入子階名稱與各製程部門的個數","<div id='chkDiv'>Loading<img src='/images/setup/loading.gif' border='0' alt=''></div>","WARNING");
		
		util.delayPromise(800)('').then(function(result) {
			
			var html = 
				"請輸入要產生的父階數量 <input type='text' id='bookText'>&nbsp&nbsp<input type='button' value='產生' onclick='javascript:bookCount(this);'><br>"+
				"<input type='hidden' id='pidValue'  value='"+pid+"'>"+
				"<input type='hidden' id='bookValue' value='"+bookName+"'>";

			document.getElementById("chkDiv").innerHTML = html;
			
		});
	}
	
	function openUrl(url)
	{
		window.open(url);
	}
	
    return {
		projectToSalesOrder: projectToSalesOrder,
		generateTask: generateTask,
		openUrl : openUrl
    };
    
});