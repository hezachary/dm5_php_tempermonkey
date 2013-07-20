// ==UserScript==
// @name Zac 99M Load
// @namespace http://hezachary.au/
// @version 0.1
// @description 99manga
// @match http://99770.cc/*
// @match http://99comic.com/*
// @match http://99manga.com/*
// @match http://99mh.com/*
// @match http://cococomic.com/*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js
// @run-at document-start
// ==/UserScript==
var dm5_key;
var win = unsafeWindow;
var w_document = win.document;
var blnFindKey = false;
var blnReOpen = false;

var dm5_tools = new function(){
	var c_title, c_charpter, c_next_url, c_key, c_list, auto_loading_flag = '#auto_loading', body, jq;
    var chapter_btn;
	this.ini = function(_jq){
        jq = _jq;
        body = jq(w_document.body);
        chapter_btn = body.find('#all > div.b a:first');
		addBtn();
	}

	function addBtn(){
        var flag = win.location.hash.split("||");
        var title_name = jq('<input/>');
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
			'text-align':'center',
            'cursor':'pointer'
		});
        title_name.attr('type', 'text');
		title_name.css({
			'background-color':'black',
			'color':'red',
			'display':'block',
			'position':'absolute',
			'right':'220px',
			'top':'10px',
			'width':'200px',
			'padding':'5px',
			'text-align':'center'
		});
        title_name.val(flag.length > 1 ? flag[1] : chapter_btn.text());
		body.append(btn);
		body.append(title_name);
		btn.click(function(){
			startDownload(title_name.val());
		});

		if(flag.length > 0 && flag[0] == auto_loading_flag) btn.trigger('click');
	}

	function startDownload(title){
        blnReOpen = true;
		//1. get info
        getInfo(title, function(){
            //2. Empty Body
            body.empty();
            body.css({'background':'white none'});
            //3. load image
            loadImage(1, '');
        });
	}

	function getInfo(title, callback){
		c_title = jq.trim(title);

		var iframe = jq('<iframe/>');
		iframe.attr('src', chapter_btn[0].href + '?t=' + (new Date()).getTime());
		body.append(iframe);
		var iWin = iframe[0].contentWindow;
        
        iframe.load(function(){
            var iBody = jq(iframe[0].contentDocument.body);
            var next_chapter_btn = iBody.find('a[href*="' + win.location.pathname + '"]').closest('li').prev('li').find('a:first');
            if(next_chapter_btn.length > 0) c_next_url = next_chapter_btn[0].href;
            c_charpter = jq.trim(chapter_btn.text());
            c_charpter = jq.trim(c_charpter.substring(0, c_title.length)) == c_title ? jq.trim(c_charpter.substring(c_title.length)) : c_charpter;
            
            c_list = win.PicListUrl.split('|');
            
            callback();
        });
	}

	function loadImage(no, key){
		
			var GM_data = {
				'title' : c_title,
				'charpter' : c_charpter,
				'src' : win.ServerList[getParameterByName('s', win.location.search) - 1] + c_list[no - 1],
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
					if(no < c_list.length){
						//load next image
						setTimeout(function(){
							loadImage(no+1, key);
						}, 100);
					}else if(typeof c_next_url != 'undefined' && c_next_url != ''){
						//load next chapter
						win.location = c_next_url + '#auto_loading||' + c_title;
					}else{
						body.append('<div>All Chapter Done</div>');
					}
				}
			});
	}
    
    function getParameterByName(name, search) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}

function loadJquery(){
    if(win.top!=win.self) return;
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

