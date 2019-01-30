//var domainName = "https://survey.truecorp.co.th/webgenesys/"
var wgServer 	 = "http://localhost:8012/widgets";
var wgImagePath  = "img";
var wgConfigPath = "config";
var wgScriptPath = "scripts";
var wgStylePath = "styles";
var wgLanguage = "TH";
var wgScript = [
	{type:"script",	id:"chatapi",		path:wgServer+"/"+wgScriptPath+"/chatapi.js"},
	//{type:"script",	id:"jquery-3-3-1",	path:wgServer+"/jquery-3.3.1.min.js"},
	{type:"script",	id:"wgfunction",	path:wgServer+"/"+wgScriptPath+"/wgfunction.js"},
	{type:"link",	id:"widgetstrue" ,	path:wgServer+"/"+wgStylePath+"/truewebchat_widget1.css"}	
];
  
var wgBtnEng = {id:"btn-eng",t:"english",v:"EN",oc:"clearTimeEng();readConfig(this.value);afterSelectLanguage();" };
var wgBtnRequestChat = {id:"btn-reqchat",t:"Request Chat",v:"",oc:"requestChat();" };
var wgImage = {agent:"agent.png",customer:"",external:"",mari:"mari.png"}
var wgAction = document;
var wgChatboxId = "wgChatbox";
var wgDivChatId = "chat-history";
var wgUlChatId = "ul-history";
var wgSystem = {
	TH:	{
		agent:"Agent",customer:"You",external:"System",mari:"MARI",messageresponse:"Message-TH.txt",userintention:"UserIntention-TH.txt"
	},
	EN: {
		agent:"Agent",customer:"You",external:"System",mari:"MARI",messageresponse:"Message-EN.txt",userintention:"UserIntention-EN.txt"
	}
};
var wgMimeType = {
	txt:"text/plain",htm:"text/html",html:"text/html",js:"text/javascript",css:"text/css",csv:"text/csv",
	jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",gif:"image/gif",bmp:"text/bmp",ico:"image/vnd.microsoft.icon",svg:"image/svg+xml",
	mp3:"audio/mpeg",wav:"audio/wav",acc:"audio/aac",mid:"audio/midi",midi:"audio/x-midi",mpeg:"audio/mpeg",
	mp4:"video/mp4",avi:"video/x-msvideo",avi:"video/x-msvideo",
	bin:"application/octet-stream",pptx:"application/vnd.openxmlformats-officedocument.presentationml.presentation",xls:"application/vnd.ms-excel",
	doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",pdf:"application/pdf",
	jar:"application/java-archive",json:"application/json",ppt:"application/vnd.ms-powerpoint",
	rar:"application/x-rar-compressed",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	xml:"application/xml",zip:"application/zip",z7:"application/x-7z-compressed"
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



