
/*
*	modal组件的封装
*/

var setAlterModal = function(id,link,description){
	$('#alter_id').data('id',id);
	$('#alter_url').val(link);
	$('#alter_description').val(description);
}

var setDeleteModal = function(id){
	$('#delete_id').data('id',id);
}

var alter_submit = function(){
	var id=$('#alter_id').data("id");
	var urls=$('#alter_url').val().trim();
	var description=$('#alter_description').val().trim();
	console.log(id+urls+description);
	$.ajax({
         type: "POST",
         url: rootpath+"/update",
         data: {id:id, urls:urls, description:description},
         dataType: "json",
         success: function(data){
         	if(data.state>=0){
				location.reload(true);
             }else if(data.message.name=="SequelizeUniqueConstraintError"){
             	$('#alter_tips').html('保存失败，您修改的RSS已存在！');
             }else{
             	$('#alter_tips').html('保存失败，请重新尝试。');
             }
          }
     });
}

var delete_submit = function(){
	var id = $('#delete_id').data('id');
	$.ajax({
         type: "POST",
         url: rootpath+"/delete",
         data: {id:id},
         dataType: "json",
         success: function(data){
         	if(data.state>=0){
             	location.reload(true);
             }else{
             	$('#delete_tips').html('删除失败，请重新尝试。');
             }
          }
     });
}

//对地址栏的内容进行限制，不允许地址为空
$('#alter_url').bind('keyup',function(){
	var urls = $('#alter_url').val().trim();
	if(urls==""){
		$('#alter_tips').html('网址为空！');
		$('#alter_save').attr("disabled","disabled");
	}else{
		$('#alter_tips').html('');
		$('#alter_save').removeAttr("disabled");
	}
});

//对描述的内容进行限制，不允许超过20字且不为空
$('#alter_description').bind('keyup',function(){
	var description=$('#alter_description').val().trim();
	if(description.length>20||description.length<1){
		$('#alter_tips').html('描述不能超过20个字，且必须填写！');
		$('#alter_save').attr("disabled","disabled");
	}else{
		$('#alter_tips').html('');
		$('#alter_save').removeAttr("disabled");
	}
});

$('#alter_cancel').bind('click',function(){
	$('#alter_url').val("");
	$('#alter_description').val("");
	$('#alter_tips').html("");
});

$('#alter_save').bind('click',alter_submit);
$('#delete_save').bind('click',delete_submit);




/*
* rss/index.html页面文件
* rss源信息修改的相关按钮事件
*/

//点击后，显示input框，修改相关内容
$('#single_alter').bind('click',function(){
	var id = $(this).data('id');
	var src_url=$('#src_url').html();
	var src_description=$('#src_description').html();
	setAlterModal(id,src_url.split("：")[1].trim(),src_description.split("：")[1].trim());
});

$('#single_delete').bind('click',function(){
	var id = $(this).data('id');
	setDeleteModal(id);
});


/*
* rss/list.html 修改和删除操作
*/
$('.list_alter').bind('click',function(){
	var id = $(this).data('id');
	var src_url = $(this).parent().parent().find('.rss-summary').find('.hooklink').html().trim();
	var src_description = $(this).siblings('span').html().trim();
	setAlterModal(id,src_url,src_description);
});

$('.list_delete').bind('click',function(){
	var id = $(this).data('id');
	setDeleteModal(id);
});


/*
* rss/add.html页面文件
* rss源信息修改的相关按钮事件
*/

//对添加的网址进行限制，不允许为空
$('#add_url').bind('keyup',function(){
	var urls=$('#add_url').val();
	if(urls==""){
		$('#url_tips').html('网址为空！');
		$('#add_btn').attr("disabled","disabled");
	}else{
		$('#url_tips').html('');
		$('#add_btn').attr("disabled",false);
	}
});

//对添加的描述进行限制，不允许超过50字
$('#add_description').bind('keyup',function(){
	var description=$('#add_description').val();
	if(description.length>20||description.length<1){
		$('#description_tips').html('描述不能超过20个字，且必须填写！');
		$('#add_btn').attr("disabled","disabled");
	}else{
		$('#description_tips').html('');
		$('#add_btn').attr("disabled",false);
	}
});


//上传按钮
$('#add_btn').bind('click',function(){
	var urls=$('#add_url').val().trim();
	var description=$('#add_description').val().trim();
	$.ajax({
         type: "POST",
         url: rootpath+"/upload",
         data: {link:urls, description:description},
         dataType: "json",
         success: function(data){   
         	//console.log(data);     	
             if(data.state>=0){
             	$('#submit_tips').html('上传成功，请过一段时间查看您的RSS源');
             	$('#add_url').val('');
             	$('#add_description').val('');
             }else if(data.message.has('name')&&data.message.name!=undefined&&data.message.name=="SequelizeUniqueConstraintError"){
             	$('#submit_tips').html('上传失败，您上传的RSS已存在！');
             }else if(data.message==404){
             	$('#submit_tips').html('上传失败，您上传的地址错误！');
             }else if(data.message==0){
             	$('#submit_tips').html('上传失败，您上传的地址不是一个RSS源！');
             }else{
             	$('#submit_tips').html('上传失败，请重新尝试。');
             }
          },
          error: function(err){
          	console.log(err.message);
          }
     });
});

/*
* rss/search.html页面文件
* 搜索事件
*/
//提交搜索
var searchSubmit = function(){
	var keyword=$('#keyword').val().trim();
	if(keyword.indexOf('\/') != -1){
		$('#g_tips').html("您输入的是非法字符！");
		$("#g_tips").show();
			setTimeout(
				function(){
					$("#g_tips").hide();
				}
				,1000);
	}else{
		location.href = rootpath+"/search?s="+keyword+"&page=1";
	}
};

//Enter提交
$('#keyword').bind('keydown',function(event){
	if(event.which == 13){
		event.preventDefault();
		searchSubmit();
	}
});

//按钮提交
$('#search_btn').bind('click',searchSubmit);

/*
*	显示和收起相关文字的功能
 */
//显示全部文字，收起文字的功能按钮

$('.showsummary').bind('click',function(){
	$(this).siblings().removeClass("rss-overflow");
	$(this).hide();
})
$('.hidesummary').bind('click',function(){
	$(this).parent().addClass("rss-overflow");
	$(this).parent().siblings('a').show();
})

/*
*	状态码修改
*/


$('.get_error').bind('mousemove',function(){
	$(this).hide();
	$(this).siblings().show();
});
$('.error_tips').bind('mouseleave',function(){
	$(this).hide();
	$(this).siblings().show();
});
$('.error_tips').bind('click',function(){
	var id = $(this).data('id');
	var link = $(this).data('link');
	$.ajax({
         type: "POST",
         url: rootpath+"/singleget",
         data: {xid:id,link:link},
         dataType: "json",
         success: function(data){   
         	//console.log(data);     	
             if(data.state>=0){
             	$('#g_tips').html('更新成功!');
             }else if(data.message==404){
             	$('#g_tips').html('更新失败，地址错误！');
             }else if(data.message==0){
             	$('#g_tips').html('更新失败，地址不是一个RSS源！');
             }else{
             	$('#g_tips').html('更新失败，请重新尝试。');
             }
			 $("#g_tips").show();
			setTimeout(
				function(){
					location.reload(true);
				}
				,1000);
          },
          error: function(err){
          	//console.log(err.message);
          }
     });
	
});