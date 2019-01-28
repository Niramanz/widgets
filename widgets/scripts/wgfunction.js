
var wgDateMessage;
var oAction = {
	MsgTemplate: function(message) {}
}

function createMessage(msgFrom,msgText){
	wgDateMessage = createWgDateMessage();
	var listChat  = wgAction.createElement(tagList);
	listChat.id   = tagList + wgAction.getElementById(wgUlChatId).childNodes.length;;
	
	var template = "<div class='"+msgFrom["headclass"]+"'>";
	if(msgFrom["position"] == "right"){
		template+= "	<span class='"+msgFrom["timeclass"]+"'>"+wgDateMessage+"</span>"
				+  "	<span class='"+msgFrom["headnameclass"]+"'>"+msgFrom["name"]+"</span>"
				;
	} else{
		template+= "	<img src='"+msgFrom["img"]+"'>"
				+  "	<span class='"+msgFrom["headnameclass"]+"'>"+msgFrom["name"]+"</span>"
				+  "	<span class='"+msgFrom["timeclass"]+"'>"+wgDateMessage+"</span>"
				;
	}
	
	template += "</div>"
			 + "<div class='"+msgFrom["bodyclass"]+"'>"+msgText+"</div>"
			 ;
			 
	listChat.innerHTML = template;				   
	wgAction.getElementById(wgUlChatId).appendChild(listChat);
	focusScrollwgChatbox();
}

function displayUserIntention(msgFrom,msgText){
	wgDateMessage = createWgDateMessage();
	var listChat  = wgAction.createElement(tagList);
	listChat.id   = tagList + wgAction.getElementById(wgUlChatId).childNodes.length;;
	
	var template = "<div class='"+msgFrom["headclass"]+"'>";
	if(msgFrom["position"] == "right"){
		template+= "	<span class='"+msgFrom["timeclass"]+"'>"+wgDateMessage+"</span>"
				+  "	<span class='"+msgFrom["headnameclass"]+"'>"+msgFrom["name"]+"</span>"
				;
	} else{
		template+= "	<img src='"+msgFrom["img"]+"'>"
				+  "	<span class='"+msgFrom["headnameclass"]+"'>"+msgFrom["name"]+"</span>"
				+  "	<span class='"+msgFrom["timeclass"]+"'>"+wgDateMessage+"</span>"
				;
	}
	
	template += msgText;
			 
	listChat.innerHTML = template;				   
	wgAction.getElementById(wgUlChatId).appendChild(listChat);
	focusScrollwgChatbox();
}

function createWgDateMessage(){
	var returnDate;
	var today  = new Date();
	returnDate = today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear()+" "+ today.getHours()+":"+(today.getMinutes()<10?'0':'')+today.getMinutes();
	//returnDate = ((today.getHours() < 12) ? today.getHours() : (today.getHours() - 12))+ ":" +(today.getMinutes()+" "+((today.getHours() < 12) ? "AM" : "PM"));
	return returnDate;
}

function createBtnInChat(btnObj){ 
	var listChat  = wgAction.createElement(tagList);
	listChat.id   = tagList+"-btn"+btnObj["id"];
	
	var template = "<center>"
				 + "<button type='button' class='btn-in-chat' "
				 + "id='"+btnObj["id"]+"' "
				 + "value='"+btnObj["v"]+"' " 
				 + "onclick='"+btnObj["oc"]+"' "
				 + ">"+btnObj["t"]+"</button>"
				 + "</center>"
				 ;
	listChat.innerHTML = template;
	wgAction.getElementById(wgUlChatId).appendChild(listChat);     
	focusScrollwgChatbox();
}

function removeBtnInChat(id){
	if(wgAction.getElementById(id)){
		wgAction.getElementById(id).parentNode.removeChild(wgAction.getElementById(id));
	}
}

function focusScrollwgChatbox(){
		$("#"+wgDivChatId).animate({
			scrollTop: $("#"+wgDivChatId).prop("scrollHeight")
		}, 'slow');
}

function readWgMessageClient(lang,what){
	wgLanguage = lang;
	$.ajax({
		type: "GET",  
		url: wgConfigPath+"/"+wgSystem[lang][what],
		dataType: "text",       
		success: function(response){ 
			if(response){
				if(what == "userintention"){
					processUserIntention(response.split(/\r\n|\n/));
				} else{
					processData(response.split(/\r\n|\n/));
				}
			}
		}   
	});
}

function processData(dataArr){
	dataArr.forEach(function(element) {
		var temp = element.split(",");
		dataMessage[temp[0]] = temp[1]; 
	});
}
	
function processUserIntention(dataArr){
	prodIntention = [];
	var keyParam = dataArr[0].split(",");
	var i=0;
	dataArr.forEach(function(e) {
		var temp = e.split(",");
		var obj = {};
		for(var j=0;j<keyParam.length;j++){
			obj[keyParam[j]] = temp[j];
		}
		if(i!=0){
			prodIntention.push(obj);
		}
		i++;
	});
	// console.log(prodIntention);
}

function createUserIntention(pi){
	var styleProdIntention  = "<div class='dv-generic-carousel'>"
							+ "	<div id='prev' class='sd sd-left'>"
							+ "		<i class='fa fa-angle-left fa-lg'></i>"
							+ "	</div>"	
							+ "	<div id='next'  class='sd sd-right'>"
							+ "		<i class='fa fa-angle-right fa-lg'></i>"
							+ "	</div>"
							+ " <ul class='ul-gc'>"
							;
			
							var listIntent = "";
							for(var i=0;i<pi.length;i++){
								listIntent += "<li>"
											+ "	<div class='dv-thumb'> "
											+ "		<img src='"+wgImagePath+"/"+pi[i]["picture"]+"'> "
											+ " </div> "
											+ "<div class='dv-title'>"	
											+ "	<p class='p-title'>"+pi[i]["titletext"]+"</p>";
											+ "	<p class='p-subtitle'></p>"
											+ "</div>"
											;
								for(var j=0;j<3;j++){
									listIntent += "<div id='"+pi[i]["titlevalue"]+"-"+pi[i]["choicevalue"+(j+1)]+"' class='dv-button'>"
												+ pi[i]["choicetext"+(j+1)]
												+ "</div>"
								}
								listIntent += "</li>";
							}
							styleProdIntention += listIntent
												+ "</ul>"
												+ "</div>"
												;
	return styleProdIntention;
}

 function createMessageAgentTyping(msgFrom){
	createDateMsg();
	var liObj = document.createElement('li');
	liObj.id = "liAgentTyping";
	liObj.innerHTML = "<div class='message-data'><img src='img/mari.png'><span class='message-data-name'>Agent</span>&nbsp;&nbsp;<span class='message-data-time'>"+dateMsg+"</span></div><div class='message my-message'>"+dataMessage["agentTyping"]+"</div>";
	document.getElementById("ul-history").appendChild(liObj);     
	focusScroll();
}
  
function removeMessageAgentTyping(){
	if(document.getElementById('liAgentTyping')){
		document.getElementById('liAgentTyping').parentNode.removeChild(document.getElementById('liAgentTyping'));
	}  
	focusScroll();
}

$(document).on('click touchstart','#prev',     function() { $('.ul-gc').animate({scrollLeft: "-="+$('.ul-gc').width()}, 500, 'swing');});
$(document).on('click touchstart','#next',     function() { $('.ul-gc').animate({scrollLeft: "+="+$('.ul-gc').width()}, 500, 'swing');});
$(document).on('click touchstart','.dv-button',function() { selectProductService(this.id,$(this).text()); });







