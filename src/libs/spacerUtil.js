export default {
     insertStr(soure, start, newStr){   
        return soure.slice(0, start) + newStr + soure.slice(start);
     }
}