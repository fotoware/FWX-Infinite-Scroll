/// <reference path="jquery-1.4.2.js" />
/// <reference path="jquery.tmpl.js" />

/***Global vars ***/
var metadataFields = [];
var controlledVocabulary = [];
var destinations = [];
var destinationsControlledVocabulary = [];
var markers = [];

/*Metadata configuration*/
$(document).ready(function () {
    $.ajaxSetup({ cache: false });
});

function initialize(callback){
	    //Load mdc
    var url = '/fotoweb/cmdrequest/rest/metadataconfiguration.fwx';

    $.get(url, function (data) {


        $(data).find('FotoWebRest > MetadataConfiguration > Field').each(function () {
            var id = $(this).attr('Id');
            var field = {
                'name': $(this).attr('Name'),
                'isMultipleInstanceField': $(this).attr('IsMultipleInstanceField') == "TRUE",
                'isMultiline': id == 120 ? true : false,
                'values': [],
                'iptc': id
            };

            metadataFields[id] = field;
            
        });

        listControlledVocabulary(function (data) {
            controlledVocabulary = data;

            determineCVFields(metadataFields, controlledVocabulary);
        });
        
        callback.call(this);

    });


    //Load destinations
    listDestinations(function (data) {
        destinations = data;

        listDestinationsControlledVocabulary(function (data) {
            destinationsControlledVocabulary = data;

            $(destinations).each(function (key, value) {
                if (destinationsControlledVocabulary[value.id])
                    determineCVFields(value.fields, destinationsControlledVocabulary[value.id].cvNodes);
            });
        });


    });



    //load markers
    getMarkers(function (data) {
        markers = data;
    });
}

function getMetadataFieldsClone() {
    var retval = [];

    $.each(metadataFields, function (index, value) {
        retval[index] = $.extend(true, {}, value);
    });

    return retval;
}


/***Data classes ***/

/***Workflow and Destinations ***/
function listDestinations(callback) {
    var url = '/fotoweb/cmdrequest/rest/DestinationList.fwx';

    $.get(url, function (data) {
        var destinationList = [];
        var i = 0;
        $(data).find('FotoWebRest > Destinations > Destination').each(function () {
            var destination = {
                id: $(this).attr('Id'),
                name: $(this).attr('Name'),
                description: $(this).attr('Description')
            };

            var j = 0;
            destination.fields = [];
            $(this).find('MetaDataFields > Field').each(function () {
                destination.fields[j++] = {
                    iptc: $(this).attr('id'),
                    group: $(this).attr('group'),
                    position: $(this).attr('position'),
                    required: $(this).attr('required') == "true",
                    edit: $(this).attr('edit') == "true",
                    clear: $(this).attr('clear') == "true"
                };
            });
            destinationList[i++] = destination;
        });
        callback.call(this, destinationList);
    });
}
function sendToWorkflow(id, foxToken, metaData) {

    var url = '/fotoweb/cmdrequest/AddToOutbox.fwx'
    $.post(url, { f: foxToken }, function (data) {
        var url = '/fotoweb/Workflow.fwx';

        var data = [
            { name: 'isPostBack', value: 1 },
            { name: 'Repost', value: 'Yes' },
            { name: 'DestinationID', value: id }
        ];

        $(metaData).each(function () {
            var iptc = this.iptc;
            $(this.values).each(function () {
                data.push({ name: 'TF' + iptc, value: this });
            });

        });



        $.post(url, data);
    });

}

function updateMetadata(foxToken, metaData) {
    var url = '/fotoweb/cmdrequest/TextEditor.fwx';
    var data = [
        { name: 'f', value: foxToken },
        { name: 'r', value: '/fotoweb/?Information' },
        { name: 'tbs_crtb', value: 0 },
        { name: 'pbType', value: 1}];

    $(metaData).each(function () {
        var mdItem = this;
        $(mdItem.values).each(function () {
            data.push({ name: 'txtedt_' + mdItem.iptc, value: this });
        });
    });

    $.post(url, data);
}


/***Archive list ***/
function listArchives(callback) {
    var url = '/fotoweb/cmdrequest/rest/archivelist.fwx';

    $.get(url, function (data) {
        var archives = new Array();
        var i = 0;
        $(data).find('Archives > Archive').each(function () {
            if ($(this).attr('IsIndexed') == 'TRUE') {
                var id = $(this).attr('Id');
                archives[i++] = {
                    'name': $(this).attr('Name'),
                    'id': id,
                    'parentId': $(this).attr('ParentId')

                };
            }
        });

        callback.call(this, archives);
    });
}

function getArchiveSearchTreeName(archiveid) {
    var url = '/fotoweb/cmdrequest/rest/searchTreeList.fwx?ar=' + archiveid;
    var data = getXmlFile(url);
    var result;

    $(data).find('FotoWebRest > SearchTreeList > SearchTree').each(function () {
        //Return only the first;
        result = $(this).attr('Name');
        return false;
    });

    return result;
}

function getArchiveInformation(archiveId, callback) {
    var url = '/fotoweb/fwbin/fotoweb_isapi.dll/ArchiveAgent/%ArchiveID/Information';
    url = url.replace('%ArchiveID', archiveId);

    $.get(url, function (data) {

        var serverInformation = $(data).find('PortalAgentInformation > ServerInformation');

        var permissions = [];
        $(serverInformation).find('X-FotoWeb-Permissions').each(function () {
            $.each(this.attributes, function (i, attrib) {
                permissions[attrib.name] = attrib.value == 'true';
            });
        });

        var retval = {
            'ServerInformation': {
                'Permissions': permissions
            }
        };

        callback.call(this, retval);
    });
}


/***Search Tree ***/
function getSearchTree(archiveId, callback) {
    var searchTreeName = getArchiveSearchTreeName(archiveId);
    if (searchTreeName) {
        var url = '/fotoweb/cmdrequest/rest/searchtreeContent.fwx?ar=%ArchiveID&nm=%SearchTree&r=99';
        url = url.replace('%ArchiveID', archiveId);
        url = url.replace('%SearchTree', searchTreeName);

        $.get(url, function (data) {
            var searchNodes = new getSearchTreeChildren($(data).find('SearchTreeContent'));
            callback.call(this, searchNodes);
        });
    }


}

function getSearchTreeChildren(rootXml) {
    var children = new Array();
    var i = 0;
    $(rootXml).children().each(function () {
        children[i++] = {
            'name': $(this).attr("Name"),
            'search': $(this).attr("Search"),
            'children': getSearchTreeChildren(this)
        };
    });
    return children;
}

/***Archive Agent ***/
function searchArchive(archiveId, searchString, skip, take, previewSizes, callback) {
    var url = '/fotoweb/fwbin/fotoweb_isapi.dll/ArchiveAgent/%ArchiveID/Search?Search=%currentSearch&MaxHits=%MaxHits&FileInfo=1&MetaData=1&Skip=%skipCount';

    url = url.replace('%ArchiveID', archiveId);
    url = url.replace('%MaxHits', take);
    url = url.replace('%currentSearch', escape(searchString));
    url = url.replace('%skipCount', skip);

    $(previewSizes).each(function () {
        url += '&PreviewSize=' + this;
    });

    $.get(url, function (data) {
        var searchResult = {
            'totalHits': $(data).find('FileList').attr('TotalHits'),
            'files': new Array()
        };
        var i = 0;

        $(data).find('FileList > File').each(function () {
            file = {
                'name': $(this).attr('Name'),
                'id': $(this).attr('Id'),
                'foxToken': $(this).attr('X-FoxToken')
            };

            var j = 0;
            file.previewLinks = new Array();
            $(this).find('PreviewLinks > PreviewUrl').each(function () {

                file.previewLinks[j++] = {
                    "id": $(this).attr('Id'),
                    "size": $(this).attr('Size'),
                    "url": $(this).text()
                };

            });

            file.fileInfo = {
                'created': $(this).find('FileInfo > Created').text(),
                'lastModified': $(this).find('FileInfo > LastModified').text(),
                'fileSize': formatFileSize($(this).find('FileInfo > FileSize').text()),
                'mimeType': $(this).find('FileInfo > MimeType').text()
            };

            file.metaData = {
                'pixelWidth': $(this).find('MetaData > PixelWidth').text(),
                'pixelHeight': $(this).find('MetaData > PixelHeight').text(),
                'resolution': $(this).find('MetaData > Resolution').text(),
                'colorSpace': $(this).find('MetaData > ColorSpace').text(),
                'text': getMetadataFieldsClone()
            };
            $(this).find('MetaData > Text > Field').each(function () {
				
                var field = file.metaData.text[$(this).attr('Id').substring(6)];
				
                field.name = $(this).attr('Name');
                field.iptc = $(this).attr('Id').substring(6);

                field.values.push($(this).text());

            });

            searchResult.files[i++] = file;

        });

        callback.call(this, searchResult);
    });
}



function getArchiveHits(archiveId,searchString,skip,take,previewSizes,callback){
	var myurl = '/fotoweb/fwbin/fotoweb_isapi.dll/ArchiveAgent/%ArchiveID/Search?Search=%currentSearch&MaxHits=%MaxHits&Skip=%skipCount';
	
	myurl = myurl.replace('%ArchiveID', archiveId);
    myurl = myurl.replace('%MaxHits', take);
    myurl = myurl.replace('%skipCount', skip);
	myurl = myurl.replace('%currentSearch', escape(searchString));
	
	$(previewSizes).each(function () {
        myurl += '&PreviewSize=' + this;
    });
	
	var numberOfHits = 0;
	
	$.get(myurl, function (data) {
        numberOfHits =  $(data).find('FileList').attr('TotalHits');
		
		callback.call(this, numberOfHits);
    });
}


/*** Markers ***/
function getMarkers(callback) {
    var url = 'configuration/markers.xml';

    $.get(url, function (data) {
        var markers = [];

        $(data).find('Markers > Marker').each(function () {
            markers.push({

                'name': $(this).attr('name'),
                'desc': $(this).attr('desc'),
                'icon': $(this).attr('icon'),
                'field': $(this).attr('field'),
                'regex': $(this).attr('regex')
            });
        });

        callback.call(this, markers);
    });
}



/*** Controlled Vocabulary ***/
function listControlledVocabulary(callback) {
    var url = 'configuration/controlledvocabulary.xml';

    $.get(url, function (data) {
        var cvNodes = new getCVNodeChildren($(data).find('ControlledVocabulary'));
        callback.call(this, cvNodes);
    });
}

function listDestinationsControlledVocabulary(callback) {
    var url = 'configuration/controlledvocabulary.xml';

    $.get(url, function (data) {
        var rootXml = $(data).find('ControlledVocabulary');
        var destinationList = [];

        $(rootXml).children('CVDestination').each(function () {
            var id = $(this).attr('id');
            destinationList[id] = {
                'destinationId': id,
                'cvNodes': getCVNodeChildren($(this))
            };
        });

        callback.call(this, destinationList);
    });
}

function getCVNodeChildren(rootXml) {
    var children = [];
    $(rootXml).children('CVNode').each(function () {
        children.push({
            'iptc': $(this).attr("field"),
            'label': $(this).attr("label"),
            'value': $(this).attr("value"),
            'children': getCVNodeChildren(this)
        });
    });
    return children;
}

function determineCVFields(fields, cvFields) {

    $.each(fields, function (i, value) {
        if (value) {
            value.isCVField = isCVField(value, cvFields, true);
            value.isCVRoot = isCVField(value, cvFields, false);
        }
    });
}
//determine if the field is in the CV list, recursive will check all children
function isCVField(mdField, cvFields, recursive) {
    var result = false;
    $(cvFields).each(function () {
        if (this.iptc == mdField.iptc) {
            result = true;
            return false;
        }
        if (recursive) {
            if (isCVField(mdField, this.children, true)) {
                result = true;
                return false;
            }
        }
    });
    return result;
}

//Syncronous get file (SJAX)
function getXmlFile(url, async, callback) {
    var result;

    if (async == undefined)
        async = false;

    $.ajax({
        dataType: "xml",
        url: url,
        success: function (data) {
            if (data) {
                result = data;
                if (callback)
                    callback.call(this, result);
            }

        },
        async: async,
        complete: function (xhr, status) {
            if (status == 'parsererror') {
                xmlDoc = null;

                // Create the xml document from the responseText string.
                // This uses the w3schools method.
                // see also
                if (window.DOMParser) {
                    parser = new DOMParser();
                    xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                }
                else // Internet Explorer
                {
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = "false";
                    xmlDoc.loadXML(xhr.responseText);
                }

                //processXMLDoc(xmlDoc);
                result = xmlDoc;
                if (callback)
                    callback.call(this, result);
            }
        }
    });
    return result;
}

//Format file size
function formatFileSize(filesize) {
    if (filesize == '' || !filesize) return null;
    if (filesize >= 1073741824) {
        filesize = number_format(filesize / 1073741824, 2, '.', '') + ' Gb';
    } else {
        if (filesize >= 1048576) {
            filesize = number_format(filesize / 1048576, 2, '.', '') + ' Mb';
        } else {
            if (filesize >= 1024) {
                filesize = number_format(filesize / 1024, 0) + ' Kb';
            } else {
                filesize = number_format(filesize, 0) + ' bytes';
            };
        };
    };
    return filesize;
};
function number_format(number, decimals, dec_point, thousands_sep) {
    var n = number, c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
    var d = dec_point == undefined ? "," : dec_point;
    var t = thousands_sep == undefined ? "." : thousands_sep, s = n < 0 ? "-" : "";
    var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;

    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}



