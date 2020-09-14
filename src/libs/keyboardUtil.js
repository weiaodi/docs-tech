let createIncludeCodeFn = function(key){
    return function(e){
        return e.code.indexOf(key)>-1
    }
};
var obj = {};

export default {
    isEnter: createIncludeCodeFn('Enter'),
    isShift:  createIncludeCodeFn('Shift'),
    isBackspace:  createIncludeCodeFn('Backspace'),
    isMetaLeft:createIncludeCodeFn('MetaLeft'),
    isMeta:createIncludeCodeFn('Meta'),
    isArrowUp:createIncludeCodeFn('ArrowUp'),
    isArrowDown:createIncludeCodeFn('ArrowDown'),
    isArrowLeft:createIncludeCodeFn('ArrowLeft'),
    isArrowRight:createIncludeCodeFn('ArrowRight'),


}