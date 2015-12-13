var cMenu = (function(){
"use strict";

var th = this,
countSub = 0; //Brukes kun for Ã¥ navngi id'er med number sub_1

	var UtilityLib = {
	
		/*
		*	addListener
		*/
		addListener: function(elmnt, evt, callback) {
			if(!!window.addEventListener) {
				elmnt.addEventListener(evt, callback, false);			
			} else {//IE
				elmnt.attachEvent('on'+evt, callback);
			}	
		}
	}

	//KonstruktÃ¸r av subMenu, genererer ny html i angitt objekt
	var SubMenu = function(name, elmnt) {
		countSub++;
		//Generer LI
		var li = document.createElement('tr'),
		ul = elmnt.getElementsByTagName('table'),
		hoverTime;
		
		li.innerHTML = '<td class="space"></td><td class="text"><a href="" tabindex="-1">'+name+'</a></td>';
		li.className = 'subTitle';
		li.setAttribute('tabindex', '1');
		if(ul[0]) {
			ul[0].appendChild(li);
		} else {
			elmnt.appendChild(li);	
		}
				
		//Generer UL
		var newul = document.createElement('table');
		li.appendChild(newul);		
		newul.className='submenu';
		newul.id = 'sub_'+countSub;
		newul.setAttribute('cellspacing', '0');
		// someObject.addListener('click', elmnt, callback); or someObject.show(elmnt, {event: 'hover', effect: 'fade', hoverintent:})
		//Show/hide hÃ¸rer til SubMenu objektet, men eventlisteners bÃ¸r flyttes til egen wrapper	
		UtilityLib.addListener(li, 'mouseover', function() {
			clearTimeout(hoverTime);
			hoverTime = setTimeout(function() {
				newul.style.display="block";			
			}, 300);			
		}, false);
		
		UtilityLib.addListener(li, 'click', function(e) { 
			e.stopPropagation();
		});
		/*li.addEventListener('mouseover', function() {
			
			clearTimeout(hoverTime);
			hoverTime = setTimeout(function() {
				newul.style.display="block";			
			}, 300);			
		}, false);*/
				
		UtilityLib.addListener(li, 'focus', function() {
			clearTimeout(hoverTime);
			hoverTime = setTimeout(function() {
				newul.style.display="block";			
			}, 300);	
		});
		
		UtilityLib.addListener(li, 'mouseout', function() {
				clearTimeout(hoverTime);
				hoverTime = setTimeout(function() {
					newul.style.display="none";
				}, 300);
			});
			
			
		return {
			element: newul	
		}
	};
	
	/*
	*	Returns a childobject. Should perhaps take a settings-object instead of just callback
	*	newSettings - should consist of callback, symbolurl, disabled
	*/
	var Child = function(name, elmnt, callback/*newSettings*/) {
		var li = document.createElement('tr'),
			ul = elmnt.getElementsByTagName('table'), disabled = false,
			symbol = '';
			
			//Not in use yet
			var settings = {
				disabled: false,
				symbolUrl: null,
				callback: null,
				extend: function(extObj) { //Extend funksjon som endrer default-innstillingene til brukerens Ã¸nsker
					if (arguments.length > 2) {
							for (var a = 1; a < arguments.length; a++) {
								extend(settings, arguments[a]);
							}
						} else {
							for (var i in extObj) {
								settings[i] = extObj[i];
							}
						}
						return settings;
				}
			}
			//settings.extend(newSettings);
			
			if(settings.symbolUrl) {
				symbol = '<img src="'+settings.symbolUrl+'" alt="">';
			}
				
			li.setAttribute('tabindex', '1');
			li.innerHTML = '<td class="space">'+symbol+'</td><td class="text"><a href="" tabindex="-1">'+name+'</a></td>';
			
			if(ul[0]) {
				ul[0].appendChild(li);
			} else {
				elmnt.appendChild(li);	
			}		
						
			UtilityLib.addListener(li, 'click', addCallback);
			
		//add callback
		function addCallback(evt) {
			if(!evt) {
    			evt = window.event;
			}
			
			if(disabled) {
				evt.preventDefault(); 
				evt.stopPropagation();
				
			} else {
				callback();
				evt.preventDefault();
			}
		}
		
		/*
		*	Metode for Ã¥ disable menyelementet - addes med protoype i stedet(?) eller vil dette medfÃ¸re endring for alle objekter(neppe)?
		*/
		this.setDisabled = function(bool) {
			if(bool != undefined) {
				disabled = !!bool;
			} else {
				return false;	
			}
		}
		
		return {
			disabled: this.setDisabled
		}
	};
	
	//KonstruktÃ¸r av ContextMenu
	var ContextMenu = function(elmnt) {
			
			//Variables
			var elmntName = elmnt ? elmnt : 'body',
			elmnt = elmnt ? document.getElementById(elmnt) : window,
			htmlString, cMenu;
			
			//Generer basic html for meny
			htmlString = '<table cellspacing="0">'+					 
						 '</table>';
		
			//Build menu-div
			var menuElement = document.createElement('div');
			menuElement.id ='cMenu_'+elmntName;
			menuElement.setAttribute('class', 'cMenuWrap');
			menuElement.innerHTML = htmlString;
			
			cMenu = document.body.appendChild(menuElement); 
			
			
			//cMenu = document.getElementById('cMenu_'+elmntName);
			//Attach events and disable standard contextmenu
			UtilityLib.addListener(elmnt, 'contextmenu', function(evt) {
				//Get current ContextMenuItem
				//cMenu = document.getElementById('cMenu_'+elmntName);
				
				cMenu.style.display='block';
				
				//Get mouse position
				var x = evt.clientX,
					y = evt.clientY;
				
				//Place menu at mouse
				cMenu.style.left = x+'px';
				cMenu.style.top  = y+'px';	
				
				evt.stopPropagation();
				evt.preventDefault();
			});
			
			UtilityLib.addListener(window, 'click', function() {
				if(cMenu) {
						cMenu.style.display="none";
				}
			}, false);
			
		
			// For Ã¥ kunne referere til rett dom-element
				return {
					element: cMenu
				}					
	};

	return {
			
			init: function(elmnt) {
				return new ContextMenu(elmnt);	
			},
			
			/* Legger til et nytt element i context-menyen */
			//mulig denne kan skrives som et eget objekt, altsÃ¥ bare bruke new Child
			addChild: function(name, context, callback) {
				//return context.addChild(name, callback); //returns the newChild object
				return new Child(name, context.element, callback); //Slik bÃ¸r det vÃ¦re
			},
			
			//Legger til en ny subMenu i riktig context
			addSubMenu: function(name, context) {
				//return context.appendSubMenu(name);
				//return new SubMenu(name, context.getParent()); //Returns the newChild Object
				return new SubMenu(name, context.element);	
			}
	}
	//return facade;

}());