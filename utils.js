module.exports={
    isUndefinedOrNull:function(value){
        if(typeof value === 'undefined' || value==null) {
            return true;
        }
        return false;
    },

    getParamForLikeQuery:function (value) {
        return '%' + value + '%';
    }
}



