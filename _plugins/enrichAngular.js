const fs = require('fs');
var pjson = require('../../../package.json');
var pversion=pjson.version;
var pname=pjson.name;
var output_path = './docs/'+pname+'/'+pversion+'/';
var stub_path = output_path+'root.blank.js.html';
var out_base_path = __dirname.substring(0,__dirname.indexOf("node_modules"));
var out_remove_path = out_base_path+"src/app";
var out_path = out_base_path+"docs/"+pname+'/'+pversion+'/';

if (!String.prototype.encodeHTML) {
  String.prototype.encodeHTML = function () {
    return this.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
  };
}
function encodeHTML(string){
	return string.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
}

try{
	fs.statSync(stub_path)
}
catch (e){
	fs.closeSync(fs.openSync(stub_path, 'w'));
}
var stub = fs.readFileSync(output_path+'root.blank.js.html').toString();
console.log(stub);
var splitItem="/** @fileOverview  */"
var index = stub.indexOf(splitItem)

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
	    console.log("Place here",pname,pversion);
		if(index>-1){
			var new_stub = stub;
			var replace_string = encodeHTML(info);
			console.log("HEY THERE",index);
			new_stub = new_stub.replace(splitItem,replace_string);
			new_stub = new_stub.replace("sunlight-highlight-javascript","sunlight-highlight-xml");
			new_stub = new_stub.replace("sunlight-highlighted","");
			new_stub = new_stub.replace(/root\.blank\.js/g,name);
			var relative_path = item.meta.path.replace(out_remove_path,"").replace(/^\//,"").replace('/','_').replace(/^_/,"");
			console.log('rel',relative_path);
			var use_path = out_path+relative_path+"_"+name+".html";
			if(name=="root.html"){
				use_path = out_path+relative_path+name+".html";
			}
			console.log(use_path);
			fs.writeFileSync(use_path,new_stub);
		}
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
