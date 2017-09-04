function createButtons(config) {
     
    var container   = this.nodeType && this.nodeType === 1 ? this : config.container;
    var data        = config.data;
    var type        = config.type        || 'div';
    var onClick     = config.onClick     || null;
    var onHover     = config.onHover     || null;
    var className   = config.className   || 'button';
    var activeClass = config.activeClass || 'active';
    var hoverClass  = config.hoverClass  || 'hover';
        
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
            setActive: function (btn) { setState(btn, activeClass); }
        };
    };
    return main();


    function createButton(nr, data) {
        
        var text = data[nr].text || '';
        var css  = data[nr].css  || {};
        var attr = data[nr].attr || {};

        var btn = document.createElement(type);
        btn.innerText = text;
        btn.className = className;
        btn.setAttribute('data-nr', nr);
        
        for (var rule in css) {
            btn.style[rule] = css[rule];
        }
        for (var a in attr) {
            
            if (a === 'class') {
                btn.classList.add(attr[a]);
                break;
            }
            
            if (a === 'id') {
                attr[a] += '_' + nr;
            }
            
            btn.setAttribute(a, attr[a]);
        }
             
        return btn;
    }
    
    function installHandler() {

        container.addEventListener('click',     onButtonClick);
        container.addEventListener('mouseover', onButtonHover);
        container.addEventListener('mouseout',  onButtonOut);

    }

    function onButtonClick (evt) {

        var btn = evt.target;
        
        setState(btn, activeClass);
        
        if (!isFunction(onClick)) { return; }
        callCB(onClick, btn, btn.getAttribute('data-nr'));
    }
    
    function onButtonHover (evt) {

        var btn = evt.target;
        
        setState(btn, hoverClass);
        
        if (!isFunction(onHover)) { return; }
        callCB(onHover, btn, btn.getAttribute('data-nr'));
    }
    
    function onButtonOut (evt) {
        var btn = evt.target;
        removeState(btn, hoverClass);
    }
        
    function setState (btn, state, toggle) {
        changeState(btn, state, toggle, true);
    }
    
    function removeState (btn, state) {
        changeState(btn, state, false, false);
    }
    
    function changeState (btn, state, toggle, add) {
        
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

}