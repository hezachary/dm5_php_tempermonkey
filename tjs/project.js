// ==UserScript==
// @name Zac DM5 Load
// @namespace http://hezachary.au/
// @version 0.1
// @description Load Test 
// @match http://www.dm5.com/m*
// @run-at document-start
// ==/UserScript==
var dm5_key;
var win = unsafeWindow;
var w_document = win.document;
var blnFindKey = false;
var blnReOpen = false;
(function(open) {
	unsafeWindow.XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
		if(!blnFindKey && url.toString().indexOf("chapterimagefun.ashx") > -1){
			dm5_key = unsafeWindow.document.getElementById("dm5_key").value;
			blnFindKey = true;
		}
		if(!blnFindKey || blnReOpen){
			open.call(this, method, url, async, user, pass);
		}
	};
})(unsafeWindow.XMLHttpRequest.prototype.open);


var dm5_tools = new function(){
	var c_title, c_charpter, c_next_url, c_key, c_list, auto_loading_flag = '#auto_loading', body, jq;
	this.ini = function(_jq){
		jq = _jq;
		body = jq(w_document.body);
		addBtn();
	}

	function addBtn(){
		var btn = jq('<a/>');
		btn.text('Start Download ALL');
		btn.css({
			'background-color':'black',
			'color':'red',
			'display':'block',
			'position':'absolute',
			'right':'10px',
			'top':'10px',
			'width':'200px',
			'padding':'5px',
			'text-align':'center'
		});
		body.append(btn);
		btn.click(function(){
			startDownload();
		});

		if(win.location.hash == auto_loading_flag) btn.trigger('click');
	}

	function startDownload(){
		blnReOpen = true;
		//1. get info
		getInfo();
		//2. Empty Body
		body.empty();
		body.css({'background':'white none'});
		//3. load image

		getKeyAndDonwload(1);
	}

	function getInfo(){
		var c_title_node = body.find('#index_right .lan_kk2 div:eq(0) dl dt:eq(0) a');
		c_title = c_title_node.attr('title');

		var c_charptere_node_list =  body.find('#index_right .lan_kk2 div:eq(1) a');
		c_charpter = c_charptere_node_list.eq(0).text();
		c_charpter = jq.trim(c_charpter.substring(c_title.length));

		if(c_charptere_node_list.length > 1) c_next_url = c_charptere_node_list[1].href;

		c_list = body.find('select#pagelist option').length;

		//console.log([c_title, c_charpter, c_next_url]);
	}

	function getKeyAndDonwload(no){
		if(typeof dm5_key != 'undefined'){
			loadImage(no, dm5_key);
			return;
		}

		var iframe = jq('<iframe/>');
		iframe.attr('src', win.location.toString().replace(auto_loading_flag, '?t=' + (new Date()).getTime()));
		body.append(iframe);
		var iWin = iframe[0].contentWindow;

		(function(open) {
			iWin.XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
				var iBody = jq(iframe[0].contentDocument.body);
				loadImage(no, iBody.find('#dm5_key').val());
				iframe.remove();
			};
		})(iWin.XMLHttpRequest.prototype.open);
	}

	function loadImage(no, key){
		var data = {
			cid : win.DM5_CID,
			page : no,
			language : 1,
			time : (new Date()).getTime(),
			key : ''
		};
		if(typeof key != 'undefined') data.key = key;

		jq.get('chapterimagefun.ashx', data, function(msg){
			if(typeof msg == 'undefined' || msg.length < 1) {
				console.log('error : ' + jq.param(data));
				getKeyAndDonwload(no);
				return;
			}
			eval(msg);
			if(typeof d == 'undefined'){
				alert('no d : ' + msg + "\n" + jq.param(data));
				return;
			}
			var src = d.shift();

			var GM_data = {
				'title' : c_title,
			'charpter' : c_charpter,
			'src' : src,
			'referer' : win.location.toString(),
			'no' : no
			};

			GM_xmlhttpRequest({
				method: "POST",
				url: "http://dev.localhost/dm5/ajax.php?" + jq.param(GM_data),
				//data: ,
				onload: function(response) {
					body.append('<div>' + response.responseText + '</div><hr/>');
					if(response.responseText.indexOf('error') > -1) return;
					if(no < c_list){
						//load next image
						setTimeout(function(){
							loadImage(no+1, key);
						}, 1000);
					}else if(typeof c_next_url != 'undefined' && c_next_url != ''){
						//load next chapter
						win.location = c_next_url + '#auto_loading';
					}else{
						body.append('<div>All Chapter Done</div>');
					}
				}
			});

		});
	}
}

function loadJquery(){
	if(typeof jQuery == 'undefined'){
		setTimeout(function(){
			loadJquery();
		}, 100);
	}else{
		jQuery(w_document).ready(function(){
			dm5_tools.ini(jQuery);
		});
	}
}
loadJquery();

