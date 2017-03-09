$(document).ready(function(){
	var socket = io.connect();
	var from = $.cookie('user');
	var to = 'all';
	socket.emit('online', {user: from});
	socket.on('online', function(data){
		if(data.user != from){
			var sys = '<div style="color:#f00">系统(' + now() + '):' + '用户' + data.user + '上线了！</div>';
		} else {
			var sys = '<div style="color:#f00">系统(' + now() + '): 你进入了聊天室!</div>';
		}
		$("#contents").append(sys + "<br/>");
		flushUsers(data.users);
		showSayTo();
	});

	socket.on('say', function(data){
		if(data.to == 'all'){
			$("#contents").append('<div>'+ data.from + '(' + now() + ')对所有人说: <br/>' + data.msg + '</div><br/>');
		} else if(data.to == from){
			$("#contents").append('<div>' + data.from + '(' + now() + ')对你说: <br/>' + data.msg + '</div><br/>');
		}

	})

	socket.on('offline', function(data){
		var sys = '<div style="color:#f00">系统(' + now() + '):' + '用户' + data.user + '下线了!</div>';
		$("#contents").append(sys + "<br/>");
		flushUsers(data.users)
		if(data.user == to){
			to = "all"
		}
		showSayTo();
	})

	socket.on('disconnect', function(){
		var sys = '<div style="color:#f00">系统：连接服务器失败!</div>';
		$("#contents").append(sys + "<br/>");
		$("#list").empty();
	});

	socket.on('reconnect', function(){
		var sys = '<div style="color:#f00">系统：重新连接服务器!</div>';
		$("#contents").append(sys + "<br/>");
		socket.emit("online", {user: from});
	});

	function flushUsers(users){
		$("#list").empty().append('<li title="双击聊天" alt="all" class="sayingto" onselectstart="return false">所有人</li>');
		for (var i in users){
			$("#list").append('<li alt="' + users[i] + '" title="双击聊天" onselectstart="return false">' + users[i] + '</li>');
		}

		$("#list > li").dblclick(function(){
			if($(this).attr('alt') != from){
				to = $(this).attr('alt');
				$("#list > li").removeClass('sayingto');
				$(this).addClass('sayingto');
				showSayTo();
			}
		})
	}

	function showSayTo(){
		$("#from").html(from);
		$("#to").html(to == "all"?"所有人": to);
	}

	function now(){
		var date = new Date()
		var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate()) + '-' + (date.getHours()) + ':' + (date.getMinutes()< 10? ('0' + date.getMinutes()): date.getMinutes()) + ':' + (date.getSeconds()< 10? ('0' + date.getSeconds()): date.getSeconds());
		return time;
	}

	$("#say").click(function(){
		var $msg = $("#input_content").html();
		if($msg == "") return;
		if(to == "all"){
			$("#contents").append('<div>你(' + now() + ')对所有人说: <br/>' + $msg + '</div><br/>');
		} else{
			$("#contents").append('<div>你(' + now() + ')对' + to + "说：<br/> " + $msg + '</div><br/>');
		}
		socket.emit('say', {from:from, to:to, msg:$msg})
		$("#input_content").html("").focus();
	});


})