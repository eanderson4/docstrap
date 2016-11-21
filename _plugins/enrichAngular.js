const fs = require('fs');

function getTagValue(tags,name){
    if(!tags) return null;
    var value = null;
    tags.forEach(function(tag){
	console.log(tag);
	if(tag.title==name){
	    value= tag.value;
	    console.log("Found Name,Value:",name,value);
	}
    });
    return value;
}


function enrichTemplate(item){
    if (item.kind=="member"){
	console.log("Member: ",item.longname);
	var name = getTagValue(item.tags,"template");
	if(name){
	    var path = item.meta.path + '/'+name;
	    console.log("Have Path",path);
	    var info=fs.readFileSync(path).toString();
	    console.log(info);
	    item.template = info;
	}
	
    }    
    return item;
}
function enrichNgType(item){
    if (item.kind=="member" || item.kind=="function"){
	console.log(item.kind,":",item.longname);
	var ngType = getTagValue(item.tags,"ngtype");
	if(ngType){
	    console.log("Have NG Type",ngType);
	    item.ngtype = ngType;
	    item.ngwrap = '<span class="type-signature">&lt;'+ngType+'&gt; </span>'
	}
    }
    return item;
}

exports.handlers = {
    newDoclet: function(e) {
	e.doclet = enrichTemplate(e.doclet);
	e.doclet = enrichNgType(e.doclet);
        // Do something when we see a new doclet
    }
};
