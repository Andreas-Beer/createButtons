function createButtons(config, off) {
                   
    var container     = this.nodeType && this.nodeType === 1 ? this : config.container;
    var data          = config.data;
    
    var buttons       = [];    
    var currentState  = {};
    off               = off          || [];
    var elementType   = config.type  || 'div';
    var wrap          = config.wrap  || null;
    var callbacks     = {
        active  : config.onClick     || null,
        hover   : config.onHover     || null,
        focus   : config.onFocus     || null
    };
    var globals       = {
        css     : config.css         || {},
        attr    : config.attr        || {}
    };
    var classes       = {
        name    : config.className   || 'button',
        active  : config.classActive || 'active',
        hover   : config.classHover  || 'hover',
        focus   : config.classFocus  || 'focus'
    };
    var defaults      = {
        css     : {
            outline: 'none'
        },
        attr    : {
            tabindex: 1
        }
    };
    
    function main () {
        
        for (var i = 0; i < data.length; i++) {
            var btn = createButton(data[i], i);
            buttons.push(btn);
        }
        
        for (var j = 0; j < buttons.length; j++) {
            container.appendChild(buttons[j]);
        }
        
        installHandler();
        
        return {
            curr  : curr,
            next  : next,
            prev  : prev,
            walk  : walk,
            set   : set,
            first : first,
            last  : last,
            add   : add
        };
    };
    return main();

    function createButton(data, nr) {
        
        var mergedData  = mergeObjs({}, data);
        mergedData.css  = mergeObjs({}, defaults.css,  globals.css,  data.css);
        mergedData.attr = mergeObjs({}, defaults.attr, globals.attr, data.attr);
            
        var btn = initElement(document.createElement(elementType), mergedData, nr);     
        btn.setAttribute('data-nr', nr);
        btn.className = classes.name;
                    
        if (!~off.indexOf(classes.focus)) {
            btn.addEventListener('focus', onFocus);
            btn.addEventListener('blur',  onBlur);
        }
        
        if (wrap) {
            var w = typeof wrap === 'object' ? createWrapper(wrap, nr) : document.createElement(wrap);            
            w.appendChild(btn);
            btn = w;
        }
        
        return btn;
    }
    
    function createWrapper (data, nr) {
        
        if (typeof data === 'string') {
            return document.createElement(data);
        }
                        
        var wrapper = initElement(document.createElement(data.type), data, nr);
        wrapper.className = data.className || '';
        
        return wrapper;
    }
    
    function initElement (elm, data, nr) {
        
        var text = data.text || '';
        var html = data.html || '';
        var css  = data.css;
        var attr = data.attr;
        
        if (html) {
            elm.innerHTML = html;
        } else if (text) {
            elm.innerText = text;
        }
                
        for (var rule in css) {
            elm.style[rule] = css[rule];
        }
        for (var a in attr) {
            
            if (a === 'class') {
                elm.classList.add(attr[a]);
                continue;
            }
            if (a === 'id') {
                attr[a] += '_' + (+nr + 1);
            }
            
            elm.setAttribute(a, attr[a]);
        } 
        
        return elm;
    }
    
    function installHandler() {
                
        if (!~off.indexOf(classes.active)) {
            container.addEventListener('click',     onActive);
        }
        if (!~off.indexOf(classes.hover)) {
            container.addEventListener('mouseover', onMouseOver);
            container.addEventListener('mouseout',  onMouseOut);
        }
        if (!~off.indexOf(classes.focus)) {
            container.addEventListener('keypress', onKeyDown);
        }
    }
    
    function onKeyDown (evt) {
        if (evt.keyCode === 32 || evt.keyCode === 13) {
            onActive(evt);
        }
    }

    function onActive (evt) {
        addState(evt, classes.active, callbacks.active);
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
            if (currentState[state].classList.length === 0) {
               currentState[state].removeAttribute('class'); 
            }
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
    
    function walk(steps) {     
        return buttons[(buttons.length + currIndex() + steps) % buttons.length];
    }
    function currIndex () {
        var index = buttons.indexOf(currentState[classes.active]);
        return !~index ? 0 : index;
    }
    
    /*
     * Interface
     */
    function first () {      
        onActive({ target: set(0) });     
        return currentState[classes.active];
    }
    function last () {      
        onActive({ target: set(buttons.length - 1) });     
        return currentState[classes.active];
    }
    function next () {      
        onActive({ target: walk(1) });     
        return currentState[classes.active];
    }
    function prev () {      
        onActive({ target: walk(-1) });     
        return currentState[classes.active];
    }
    function curr () {
        onActive({ target: walk(0) }); 
        return currentState[classes.active];
    }
    function set (index) {
        onActive({ target: buttons[index % buttons.length] }); 
        return currentState[classes.active];
    }
    
    function add (newData) {
        
        if (isObject(newData)) {
            newData = [newData];
        }
        for (var i = 0; i < newData.length; i++) {
            var btn = createButton(newData[i], buttons.length);
            buttons.push(btn);
            data.push(newData[i]);
            container.appendChild(btn); 
        }
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
    function isObject (obj) {
        return Boolean(typeof obj === 'object' && !obj.length && obj.constructor === Object);
    }
    function isArray (obj) {
        return Boolean(typeof obj === 'object' && obj.length && obj.constructor === Array);
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
        
        for (var i = 1; i < arguments.length; i++) {
            
            var obj = arguments[i];
            if (!isEmptyObj(obj)) {
                merge(all, obj);            
            }
        } 
                
        return merge(arguments[0], all);
    }
    
}