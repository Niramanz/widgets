//var domainName = "https://survey.truecorp.co.th/webgenesys/"
var wgServer 	 = "http://localhost:8012/widgets";
var wgImagePath  = "img";
var wgConfigPath = "config";
var wgScriptPath = "scripts";
var wgStylePath = "styles";
var wgLanguage = "th";
var wgScript = [
	{type:"script",	id:"chatapi",		path:wgServer+"/"+wgScriptPath+"/chatapi.js"},
	//{type:"script",	id:"jquery-3-3-1",	path:wgServer+"/jquery-3.3.1.min.js"},
	{type:"script",	id:"wgfunction",	path:wgServer+"/"+wgScriptPath+"/wgfunction.js"},
	{type:"link",	id:"widgetstrue" ,	path:wgServer+"/"+wgStylePath+"/truewebchat_widget1.css"}	
];
  
var wgBtnEng = {id:"btn-eng",t:"english",v:"eng",oc:"clearTimeEng();readConfig(this.value);afterSelectLanguage();" };
var wgBtnRequestChat = {id:"btn-reqchat",t:"Request Chat",v:"",oc:"requestChat();" };
var wgImage = {agent:"agent.png",customer:"",external:"",mari:"mari.png"}
var wgAction = document;
var wgChatboxId = "wgChatbox";
var wgDivChatId = "chat-history";
var wgUlChatId = "ul-history";
var wgSystem = {
	th:	{
		agent:"Agent",customer:"You",external:"System",mari:"MARI",messageresponse:"Message-th.txt",userintention:"UserIntention-th.txt"
	},
	eng: {
		agent:"Agent",customer:"You",external:"System",mari:"MARI",messageresponse:"Message-eng.txt",userintention:"UserIntention-eng.txt"
	}
};
var wgMsgMari = {
	position : "",
	headclass : "message-data",
	img : wgImagePath +"/"+ wgImage["mari"],
	name : wgSystem[wgLanguage]["mari"],
	headnameclass : "message-data-name",
	timeclass : "message-data-time",
	bodyclass : "message my-message"
};
var wgMsgAgent = {
	position : "",
	headclass : "message-data",
	img : wgImagePath +"/"+ wgImage["agent"],
	name : wgSystem[wgLanguage]["agent"],
	headnameclass : "message-data-name",
	timeclass : "message-data-time",
	bodyclass : "message my-message"
};
var wgMsgCustomer = {
	position : "right",
	headclass : "message-data  align-right",
	img : wgImagePath +"/"+ wgImage["customer"],
	name : wgSystem[wgLanguage]["customer"],
	headnameclass : "message-data-name",
	timeclass : "message-data-time",
	bodyclass : "message other-message float-right" 
};
var tagList = "li",tagDiv = "div",tagImg = "img",tagSpan = "span";
var timeoutEng  = 4500;
var timeReadCsv = 500;
var prodIntention = [];



