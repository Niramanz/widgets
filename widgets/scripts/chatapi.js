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

			$.ajax({
					type: 'POST',
					url: url,
					contentType: 'application/x-www-form-urlencoded',
					data: formchat
			}).done(function(response, status, xhr) {
				if ( me._config.debug === true ) {
					console.log("startChat response: ");
					console.log(response);
				}
				
				// The four values are required for subsequent requests
				me._chatId = response.chatId;
				me._userId = response.userId;
				me._secureKey = response.secureKey;
				me._alias = response.alias;
				
				// Save off the transcript position
				me._transcriptPosition = 1;
				
				// Let listeners know that the chat session started successfully
				me._config.onStarted();
				
				// Start the interval polling for transcript updates
				me._startChatRefresh();
				me._refreshChat();
			}).fail(function(xhr, status, err) {
				me._config.onError('Unable to create chat session: ' + xhr.responseJSON.errors[0].advice);
			});
        },
        
        // End the chat session
        endChat: function() {
        
        	var me = this;
        
        	// Populate the parameters and URL
			var params = 'userId=' + me._userId + '&secureKey=' + me._secureKey + '&alias=' + me._alias;
			var url = me._config.baseURL + '/chat/' + me._config.chatServiceName + '/' + me._chatId + '/disconnect';

			$.ajax({
					type: 'POST',
					url: url,
					contentType: 'application/x-www-form-urlencoded',
					data: params
			}).done(function(response, status, xhr) {
				if ( me._config.debug === true ) {
					console.log( "endChat response: ");
					console.log(response);
				}
				
				// Stop the interval polling for transcript updates
				me._stopChatRefresh();
				
				// Clear out the session values
				me._chatId = response.chatId;
				me._userId = response.userId;
				me._secureKey = response.secureKey;
				me._alias = response.alias;
				me._transcriptPosition = 1;
				
				// Let the listeners know that the chat has ended
				me._config.onEnded();
			}).fail(function(xhr, status, err) {
				me._config.onError('Unable to end chat session');
			});
        },
        
        // Send a message
        sendMessage: function(message) {
        
        	var me = this;
        
        	// Populate the parameters and URL
			var params = 'message=' + message + '&userId=' + me._userId + '&secureKey=' + me._secureKey + '&alias=' + me._alias;
			var url = me._config.baseURL + '/chat/' + me._config.chatServiceName + '/' + me._chatId + '/send';

			$.ajax({
					type: 'POST',
					url: url,
					contentType: 'application/x-www-form-urlencoded',
					data: params
			}).done(function(response, status, xhr) {
				if ( me._config.debug === true ) {
					console.log("sendMessage response: ");
					console.log(response);
				}
				
				// Let listeners know that the message was sent successfully
				//me._config.onMessageSent(message);
			}).fail(function(xhr, status, err) {
				me._config.onError('Unable to send message');
			});
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

			$.ajax({
					type: 'POST',
					url: url,
					contentType: 'application/x-www-form-urlencoded',
					data: params
			}).done(function(response, status, xhr) {
				if ( me._config.debug === true ) {
					console.log("refreshChat response: ");
					console.log(response);
				}

				// Update the transcript position
				me._transcriptPosition = response.nextPosition;
			
				// For each item in the transcript...
				$.each(response.messages, function(index, message) {

					console.log("message : "+JSON.stringify(message));	
                    if(message.type === "FileUploaded"){
                        me._config.onFileReceived(message.from.type, message.from.nickname,message.userData);
                    } else{
                        me._config.onMessageReceived(message.from.type,message.type, message.from.nickname, message.text);
                    }
				});
				
				// If the chat has ended, perhaps by the agent ending the chat, then
				// stop the interval object from polling for transcript updates
				if ( response.chatEnded == true ) {
					me._stopChatRefresh();
					me._config.onEnded()
				}
			}).fail(function(xhr, status, err) {
				me._config.onError('Unable to refresh chat session');
			});
		},
		
		downloadfileChat: function(fileId,fileName){
			var me = this;
			var params = 'userId=' + me._userId + '&secureKey=' + me._secureKey + '&alias=' + me._alias;
			var url = me._config.baseURL + '/chat/' + me._config.chatServiceName + '/' + me._chatId + '/file/'+fileId+'/download';
			$.ajax({
					type: 'POST',
					url: url,
					contentType: 'application/x-www-form-urlencoded',
					data: params,
					xhrFields:{
						responseType: 'blob'
					}
			}).done(function(response, status, xhr) {
				if ( me._config.debug === true ) {
					console.log("downloadfile response: ");
					console.log(response);
				}
				
				me._config.onDownloadFile(response,fileName);
				
			}).fail(function(xhr, status, err) {
				me._config.onError('downloadfile error');
			});
		}
    });
};
