function createButtons(config) {
            
    var container       = this.nodeType && this.nodeType === 1 ? this : config.container;
    var data        = config.data;
    
    var elementType   = config.type        || 'div';
    
    var callbacks     = {};
    callbacks.click = config.onClick     || null;
    callbacks.hover = config.onHover     || null;
    callbacks.focus = config.onFocus     || null;
    
    var classes       = {};
    classes.name      = config.className   || 'button';
    classes.active    = config.activeClass || 'active';
    classes.hover     = config.hoverClass  || 'hover';
    classes.focus     = config.hoverClass  || 'focus';
    
    var globals       = {};
    globals.css       = config.css         || {};
    globals.attr      = config.attr        || {};
    
    var buttons = [];    
    var currentState = {};
    
    function main () {
        
        for (var i = 0; i < data.length; i++) {
            buttons.push(createButton(i, data));
            container.appendChild(buttons[i]);
        }
        
        installHandler();
        
        return {
            buttons: buttons,
            setActive: function (btn) { setClass(btn, classes.active); }
        };
    };
    return main();


    function createButton(nr, data) {
        
        var text = data[nr].text || '';
        var html = data[nr].html || '';
        var css  = mergeObjs({}, globals.css,  data[nr].css);
        var attr = mergeObjs({ tabindex: 1 }, globals.attr, data[nr].attr);
        
        var btn = document.createElement(elementType);
        btn.className = classes.name;
        btn.setAttribute('data-nr', nr);
        btn.tabindex = 1;
                
        if (html) {
            btn.innerHTML = html;
        } else if (text) {
            btn.innerText = text;
        }
                
        for (var rule in css) {
            btn.style[rule] = css[rule];
        }
        for (var a in attr) {
            
            if (a === 'class') {
                btn.classList.add(attr[a]);
                break;
            }
            if (a === 'id') {
                attr[a] += '_' + (+nr - 1);
            }
            
            btn.setAttribute(a, attr[a]);
        }
        
        btn.addEventListener('focus', onFocus);
        btn.addEventListener('blur',  onBlur);
       
        return btn;
    }
    
    function installHandler() {
        container.addEventListener('click',     onClick);
        container.addEventListener('mouseover', onMouseOver);
        container.addEventListener('mouseout',  onMouseOut);
    }

    function onClick (evt) {
        addState(evt, classes.active, callbacks.click);
    }
    
    function onMouseOver (evt) {
        addState(evt, classes.hover, callbacks.hover);
    }
    
    function onFocus (evt) {
        addState(evt, classes.focus, callbacks.focus);
    }
    
    function onMouseOut (evt) {
        removeClass(evt.target, classes.hover);
    }   
    
    function onBlur (evt) {
        removeClass(evt.target, classes.focus);
    }   
    
    function addState (evt, className, cb) {
        
        var btn = evt.target;
                        
        if (buttons.indexOf(btn) < 0) {
            btn = findParentBtn(btn);  
            
            if (btn === null) {
                return;
            }
        }

        setClass(btn, className);     
        
        if (!isFunction(cb)) { return; }
        callCB(cb, btn, btn.getAttribute('data-nr'));
        
    } 
        
    function setClass (btn, state, toggle) {
        changeClass(btn, state, toggle, true);
    }
    
    function removeClass (btn, state) {
        changeClass(btn, state, false, false);
    }
    
    function changeClass (btn, state, toggle, add) {
        
        if (btn === container) {
            return;
        }
                
        if (isNumber(btn)) {
            btn = buttons[btn % buttons.length];
        }

        if (currentState[state]) {
            currentState[state].classList.remove(state);
        }
        
        if (!add || toggle && btn === currentState[state]) {
            currentState[state].classList.remove(state);
            currentState[state] = null;
        } else {
            btn.classList.add(state);
            currentState[state] = btn;
        }
        
    }
    
    function callCB (fn, btn, nr) {
        fn.call(btn, data[nr], data, nr);
    }
    
    /*
     * HELPERS
     */
    function isFunction (fn) {
        return typeof fn === 'function';
    }
    function isNumber (nr) {
        return typeof nr === 'number' && nr === nr;
    }
    function findParentBtn (elm) {
        
        if (elm === container) {
            return null;
        }
        if (buttons.indexOf(elm) >= 0) {
            return elm;
        }
        return findParentBtn(elm.parentNode);       
    }
    function isEmptyObj (obj) {
        return !obj || Object.getOwnPropertyNames(obj).length <= 0;
    }
    
    function mergeObjs () {
        
        function merge(target, source) {
            
            if (isEmptyObj(source)) { return target; }

            for (var prop in source) {
                target[prop] = source[prop];
            }
            return target;
        }
        
        var all = {};
        
        for (var i = arguments.length - 1; i > 0; i--) {
            
            var obj = arguments[i];
            if (!isEmptyObj(obj)) {
                merge(all, obj);            
            }
        } 
                
        return merge(arguments[0], all);
    }

}