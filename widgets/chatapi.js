/**
 * THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE 
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
 
// ChatFactory implements a Factory methodology to create the necessary chat implementation class
// based on the Genesys Chat API type being requested.
var ChatFactory = function(config) {

	var apiObj = Chat.createAPIv2();
	apiObj.init(config);

	// Create an instance of a wrapper class that encapsulates the chat API implementation
	var chatObj = {
		_chatapi: apiObj,
		
		startChat: function(formchat) {
			this._chatapi.startChat(formchat);
		},
		
		endChat: function() {
			this._chatapi.endChat();
		},
		
		sendMessage: function(message) {
			this._chatapi.sendMessage(message);
		},
		
		downloadfileChat: function(fileId,fileName) {
			this._chatapi.downloadfileChat(fileId,fileName);
		},
		
		getlimitfileChat: function() {
			this._chatapi.getlimitfileChat();
		},
		
		uploadfileChat: function(fileup) {
			this._chatapi.uploadfileChat(fileup);
		}
	}
	
	// Return the wrapper class to the caller
	return chatObj;
}

// IE doesn't support Object.create() so implement a version of it that will work for our needs
if (!Object.create) {  
    Object.create = function (o) {
        if (arguments.length > 1) {
            throw new Error('Object.create implementation only accepts the first parameter.');
        }
        function F() {}
        F.prototype = o;
        return new F();
    };
}

// This merges the properties of two classes together to allow for object inheritance 
var fromPrototype = function(prototype, object) {  
    var newObject = Object.create(prototype);
    for (var prop in object) {
        if (object.hasOwnProperty(prop)) {
            newObject[prop] = object[prop];
        }
    }
  	return newObject;
};

// Our base Chat class implementation to be overridden by the implementation classes
var Chat = { 
	init: function(config) {}, 
    startChat: function(formchat) {},
    endChat: function() {},
    sendMessage: function(message) {}
};

// An implementation of the Genesys Chat API v2
//
// Genesys Chat API v2 is the API implemented and used by Genesys Web Engagement
// It previously used to be exposed by a component known at Genesys WebAPI Server,
// but is now hosted by GMS.
//
// It differs from Chat API v1 in that no Orchestration session is created, and it
// DOES NOT offer a CometD event channel.
//
// Note, this class does not implement the entire API, but just enough to show the
// basics of how the API works.
//
Chat.createAPIv2 = function(config) {  
    
    return fromPrototype(Chat, {
    	_config: {},
    	_chatId: null,
    	_userId: null,
    	_secureKey: null,
    	_alias: null,
    	_transcriptPosition: 1,
    	_chatRefreshIntervalId: null,
    	
    	// Initialize the Chat API v2 Class
    	init: function(config) {
    		var me = this;
			
			// Save off the config object for later use
			me._config = config;
			
			// Modify the config.baseURL to reflect the API v2 URI
			me._config.baseURL = me._config.baseURL + '/genesys/2';
    	},
    	
    	// Start the Chat with the formchat values
        startChat: function(formchat) {
        
        	var me = this;
        	
        	var url = me._config.baseURL + '/chat/' + me._config.chatServiceName;
			const request = new XMLHttpRequest();
			request.responseType = "json";
			request.open("POST", url);
			request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			request.onreadystatechange = function() {
				if(request.readyState == 4 && request.status == 200) {
					if ( me._config.debug === true ) {
						console.log("startChat response -> "+JSON.stringify(request.response));
					}
					me._chatId = request.response.chatId;
					me._userId = request.response.userId;
					me._secureKey = request.response.secureKey;
					me._alias = request.response.alias;
					
					// Save off the transcript position
					me._transcriptPosition = 1;
					
					// Let listeners know that the chat session started successfully
					me._config.onStarted();
					
					// Start the interval polling for transcript updates
					me._startChatRefresh();
					me._refreshChat();
				}
			}
			request.send(formchat);
        },
        
        // End the chat session
        endChat: function() {
        
        	var me = this;
        
        	// Populate the parameters and URL
			var params = 'userId=' + me._userId + '&secureKey=' + me._secureKey + '&alias=' + me._alias;
			var url = me._config.baseURL + '/chat/' + me._config.chatServiceName + '/' + me._chatId + '/disconnect';
			const request = new XMLHttpRequest();
			request.responseType = "json";
			request.open("POST", url);
			request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			request.onreadystatechange = function() {
				if(request.readyState == 4 && request.status == 200){ 
					if ( me._config.debug === true ) {
						console.log("endChat response -> "+JSON.stringify(request.response));
					}
					// Stop the interval polling for transcript updates
					me._stopChatRefresh();
					
					// Clear out the session values
					me._chatId = request.response.chatId;
					me._userId = request.response.userId;
					me._secureKey = request.response.secureKey;
					me._alias = request.response.alias;
					me._transcriptPosition = 1;
					
					// Let the listeners know that the chat has ended
					me._config.onEnded();
				}
			}
			request.send(params);
        },
        
        // Send a message
        sendMessage: function(message) {
        
        	var me = this;
        
        	// Populate the parameters and URL
			var params = 'message=' + message + '&userId=' + me._userId + '&secureKey=' + me._secureKey + '&alias=' + me._alias;
			var url = me._config.baseURL + '/chat/' + me._config.chatServiceName + '/' + me._chatId + '/send';
			const request = new XMLHttpRequest();
			request.responseType = "json";
			request.open("POST", url);
			request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			request.onreadystatechange = function() {
				if(request.readyState == 4 && request.status == 200){ 
					if ( me._config.debug === true ) {
						console.log("sendMessage response -> "+JSON.stringify(request.response));
					}
				}
			}
			request.send(params);
        },
        
		// Start an interval object to make 'refresh' requests at 5 second intervals
		_startChatRefresh: function() {
			
			var me = this;
			
			me._chatRefreshIntervalId = setInterval( function() {
				me._refreshChat();
			}, 2000);
		},
		
		// Stop the interval object from making 'refresh' requests		
		_stopChatRefresh: function() {
			
			var me = this;
			
			clearInterval(me._chatRefreshIntervalId);
		},
		
		// Refresh the Chat transcript by making a 'refresh' request
		_refreshChat: function() {
		
			var me = this;
			
			var params = 'userId=' + me._userId + '&secureKey=' + me._secureKey + '&alias=' + me._alias + '&transcriptPosition=' + me._transcriptPosition;
			var url = me._config.baseURL + '/chat/' + me._config.chatServiceName + '/' + me._chatId + '/refresh';
			const request = new XMLHttpRequest();
			request.responseType = "json";
			request.open("POST", url);
			request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			request.onreadystatechange = function() {
				if(request.readyState == 4 && request.status == 200){ 
					if ( me._config.debug === true ) {
						console.log("_refreshChat response -> "+JSON.stringify(request.response));
					}
					// Update the transcript position
					me._transcriptPosition = request.response.nextPosition;
					// For each item in the transcript...
					$.each(request.response.messages, function(index, message) {
						console.log("message : "+JSON.stringify(message));	
						if(message.type === "FileUploaded"){
							me._config.onFileReceived(message.from.type, message.from.nickname,message.userData);
						} else{
							me._config.onMessageReceived(message.from.type,message.type, message.from.nickname, message.text);
						}
					});
					
					// If the chat has ended, perhaps by the agent ending the chat, then
					// stop the interval object from polling for transcript updates
					if ( request.response.chatEnded == true ) {
						me._stopChatRefresh();
						me._config.onEnded()
					}
				}
			}
			request.send(params);
			
		},
		
		downloadfileChat: function(fileId,fileName){
			var me = this;
			var params = 'userId=' + me._userId + '&secureKey=' + me._secureKey + '&alias=' + me._alias;
			var url = me._config.baseURL + '/chat/' + me._config.chatServiceName + '/' + me._chatId + '/file/'+fileId+'/download';
			const request = new XMLHttpRequest();
			request.responseType = "blob";
			request.open("POST", url);
			request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			request.onreadystatechange = function() {
				if(request.readyState == 4 && request.status == 200){ 
					if ( me._config.debug === true ) {
						console.log("downloadfileChat response -> "+JSON.stringify(request.response));
					}
					
					me._config.onDownloadFile(request.response,fileName);
				}
			}
			request.send(params);
		},
		
		// getlimitfileChat: function() {
        
        	// var me = this;
        
        	// // Populate the parameters and URL
			// var params = 'userId=' + me._userId + '&secureKey=' + me._secureKey + '&alias=' + me._alias;
			// var url = me._config.baseURL + '/chat/' + me._config.chatServiceName + '/' + me._chatId + '/file/limits';
	
			// $.ajax({
					// type: 'POST',
					// url: url,
					// contentType: 'application/x-www-form-urlencoded',
					// data: params
			// }).done(function(response, status, xhr) {
				// if ( me._config.debug === true ) {
					// console.log("getlimitfileChat response: ");
					// console.log(response);
				// }
				// console.log(response);
				// console.log(JSON.stringify(response));
		
			// }).fail(function(xhr, status, err) {
				// me._config.onError('Unable to send getlimitfile');
			// });
        // },
		
		// uploadfileChat: function(fileup){
			// var me = this;
			
			// var params = 'userId=' + me._userId + '&secureKey=' + me._secureKey + '&alias=' + me._alias + '&file=' + fileup;
			// var url = me._config.baseURL + '/chat/' + me._config.chatServiceName + '/' + me._chatId + '/file';
			
			// $.ajax({
					// type: 'POST',
					// url: url,
					// contentType: 'application/x-www-form-urlencoded',
					// data: params
			// }).done(function(response, status, xhr) {
				// if ( me._config.debug === true ) {
					// console.log("uploadfile response: ");
					// console.log(response);
				// }
				// console.log(response);
				// console.log(JSON.stringify(response));

			// }).fail(function(xhr, status, err) {
				// me._config.onError('Unable to upload file');
			// });
			
		// }
    });
};
