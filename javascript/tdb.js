/// <reference path="jquery-1.4.2.js" />
/// <reference path="jquery.tmpl.js" />
/// <reference path="fotowebClient.js" />
/// <reference path="jquery-ui-1.8.5.custom.min.js" />
/// <reference path="jsTree/jquery.jstree.js" />


var KeepAliveTimer = null;

//////////////////////////////////////////////////////////////////////////////////////////////////
//
// PAGE VARIABLES
//
var CurrentArchive = 5000;
var currentArchiveName = 'Reuters';
var currentArchiveInformation;



var CurrentSearch = '';
var currentSearchTreeExpression = '';
var FilesPerPage = 15;

var searchRefreshTimer;
var refreshTime = 3 * 60 * 1000;

//SearchTree
var currentSearchTreeNode = '';


//These fields should be calculated;
var ElementSizeX = 262;
var ElementSizeY = 332;

var AutoLoad = false;
var AutoLoadMaxHits = 2000;

var CurrentQuery = '';

var previewSizes = [220, 400];
var currentUserFullName = '';
var thumbFileNameLength = 25;
var metadataLength = 30;


//////////////////////////////////////////////////////////////////////////////////////////////////
//
// PAGE LOGIC
//

//Click event handling and filling if drop downs
function attachMenuEvents() {
    $('#archivesImage').click(function (event) {
        event.stopPropagation();

        var elem = $('#archiveList')[0];
        if (elem.style.display == 'none' || elem.style.display == '')
            $(elem).show();
        else {
            $(elem).hide();
        }

        $('#searchTreeList').hide();
    });
    $('#searchTreeImage').click(function (event) {
        event.stopPropagation();
        var elem = $('#searchTreeList')[0];
        if (elem.style.display == 'none' || elem.style.display == '')
            $(elem).show();
        else {
            $(elem).hide();
        }
        $('#archiveList').hide();
    });
    $('#archiveList').click(function (event) {
        event.stopPropagation();
        preventDefault(event);
        if (event.target.nodeName == 'A') {
            CurrentArchive = $(event.target).parent().attr("archiveId");
            getArchiveInformation(CurrentArchive, function (data) {
                currentArchiveInformation = data;
            });

            currentArchiveName = $(event.target).text();
            currentSearchTreeExpression = '';
            currentSearchTreeNode = '';
            fillSearchTree();

            executeSearch();
            $('#archiveList').hide();
        }
    });
    $('#searchTreeList').click(function (event) {
        event.stopPropagation();
        //preventDefault(event);
        if (event.target.nodeName == 'A') {
            //TODO: run some method to change the search and get new searchtree

            currentSearchTreeExpression = $(event.target).parent().attr("search");
            currentSearchTreeNode = $(event.target).text();

            executeSearch();
        }
    });
    $('body').click(function () {
        $('#archiveList').hide(); //.slideUp();
        $('#searchTreeList').hide(); //.slideUp();
    });

}

//search button events
function attachButtonEvents() {
    $('#executeQuery').click(function (e) { executeSearch(); });
    $('#query').keyup(function (e) { if (e.keyCode == 13) { executeSearch(); } });

    $('#todayImage').click(function () {

        $(this).toggleClass('green');
        $(this).toggleClass('checked');
        executeSearch();
    });
}

//previewDialog (and text editor)
function attachPreviewWindowEvents() {
    $('div#previewWindow').dialog(
        	{
        	    autoOpen: false,
        	    minWidth: 1040,
        	    resizable: false,
        	    modal: true
        	});

    $('.thbnail').live('click', function (event) {
        var item = getItemFromId($(event.currentTarget).attr('id').substring(3));
        showPreview(item);
    });

    $('#editImage').live('click', function () {

        $('.mdSet .textField').each(function () {
            $(this).removeAttr('disabled').addClass('editable').removeClass('locked');
        });
        $('.mdSet .awesome').each(function () {
            $(this).removeClass('disabled');
        });

        //validation:
        validateContainer('div#previewPage div#metadata');

        $('#editImage').hide();
        $('#editImages').show();

    });

    $('#acceptImage').live('click', function () {
        if (validateContainerData('div#previewPage div#metadata')) {

            //Update metadata fields
            var metaData = [];
            //text fields
            $('.mdSet .mdTextField').each(function () {
                metaData.push({ iptc: $(this).attr('iptc'), values: [$(this).val()] });
            });
            //Hidden fields
            $('.mdSet .mdHiddenField').each(function () {
                metaData.push({ iptc: $(this).attr('iptc'), values: [$(this).val()] });
            });
            //bag fields
            $('.mdSet .mdBagField').each(function () {
                var mdItem = { iptc: $(this).attr('iptc'), values: [] };

                $(this).find('Option').each(function () {
                    mdItem.values.push($(this).val());
                });

                metaData.push(mdItem);
            });


            var item = getItemFromId($('div#previewPage').attr('itemNo'));

            updateMetadata($('div#previewPage').attr('foxToken'), metaData);
            updateUIMetadata(item, metaData);

            showPreview(item);
        }


    });

    $('#cancelImage').live('click', function () {

        $('.mdSet input, .mdSet textarea, .mdset select').each(function () {
            $(this).attr('disabled', 'true').addClass('locked').removeClass('editable');
        });

        var item = getItemFromId($('div#previewPage').attr('itemNo'));
        showPreview(item);

    });

    //Reserve image buttons
    //using fields 210 = 'ret' and 218 = 'user' for reservatiopn
    //itemno="{{= ItemNo}}" foxtoken="{{= File.foxToken}}"
    $('#reserveButton').live('click', function (event) {
        var itemNo = $('div#previewPage').attr('itemno');
        var foxToken = $('div#previewPage').attr('foxtoken');
        var item = SEARCHRESULTS.HitList[itemNo];

		var $field = $('#reserveField');
		if($field.val() == ''){
			$field.addClass('invalid');
			$('#unreserveField').removeClass('invalid');
		}
		else{
			$field.removeClass('invalid');
			$('#unreserveField').removeClass('invalid');
			item.File.metaData.text['210'].values[0] = 'ret';
        	item.File.metaData.text['218'].values[0] = $field.val();
			updateMetadata(foxToken, item.File.metaData.text);
			
			//update preview to show the correct markers
			item.markers = getMarkersForFile(item.File);
			showPreview(item);
			
			//the following lines puts markers shown in preview in the correct thumbnail
			var thumbnailMarkers = $('div#previewImage .previewMarkerContainer').html();
			var $thumbItem = $('#thb'+$('#previewPage').attr('itemno'));
			$thumbItem.find('.markerContainer').children().remove().end().append(thumbnailMarkers);
		}
    });
    $('#unreserveButton').live('click', function (event) {
        var itemNo = $('div#previewPage').attr('itemno');
        var foxToken = $('div#previewPage').attr('foxtoken');
        var item = SEARCHRESULTS.HitList[itemNo];
		
		var $field = $('#unreserveField');
		if($field.val() == ''){
			$field.addClass('invalid');
			$('#reserveField').removeClass('invalid');
		}
		else{
			$field.removeClass('invalid');
			$('#reserveField').removeClass('invalid');
			item.File.metaData.text['210'].values[0] = '';
			item.File.metaData.text['218'].values[0] = $field.val();
	
			updateMetadata(foxToken, item.File.metaData.text);
			
			//update preview to show the correct markers
			item.markers = getMarkersForFile(item.File);
			showPreview(item);
			
			//the following lines puts markers shown in preview in the correct thumbnail
			var thumbnailMarkers = $('div#previewImage .previewMarkerContainer').html();
			var $thumbItem = $('#thb'+$('#previewPage').attr('itemno'));
			$thumbItem.find('.markerContainer').children().remove().end().append(thumbnailMarkers);
		}
    });

    $('div#previewImage div#cropImageBtn').live('click', function (event) {
        var foxtoken = $('div#previewPage').attr('foxtoken');
        var url = '/fotoweb/cmdrequest/ext/CoolCrop.fwx?f=' + foxtoken;

        createCookie('cropFile', foxtoken, 0);
        createCookie('cropFileHandled', false, 0);

        window.open('crop.fwx');
    });


    //handle validation
    $('input,textarea').live('keyup', function (event) {
        var field = event.currentTarget;
        validateField(field);
    });


    //Bag field buttons
    $('.bagaddbtn').live('click', function (event) {
        var btn = event.currentTarget;
        if (buttonIsEnabled(btn)) {
            var iptc = $(btn).attr("iptc");
            var newValue = $('#mdBagAddTxt' + iptc).val();

            var fieldName = "#mdField" + iptc;
            $(fieldName).append($("<option></option>").attr("value", newValue).text(newValue));
            validateField(fieldName);

            $('#mdBagAddTxt' + iptc).val('');
        }
    });
    $('.bagrembtn').live('click', function (event) {
        var btn = event.currentTarget;
        if (buttonIsEnabled(btn)) {
            var iptc = $(btn).attr("iptc");
            var fieldName = "#mdField" + iptc;

            $(fieldName + " option:selected").each(function () {
                $(this).remove();
            });

            validateField(fieldName);
        }
    });

}

function validateContainer(containerElement) {
    var isValid = true;

    $(containerElement).find('input,textarea,select').each(function () {
        if (!validateFieldData(this))
        	$(this).addClass('invalid');
        else
        	$(this).removeClass('invalid');        
    });
    

    return isValid;
}

function validateField(field) {
    if (!validateFieldData(field))
    	$(field).addClass('invalid');   	
    else
        $(field).removeClass('invalid');    
       
}


function updateUIMetadata(item, metaData) {
    $(metaData).each(function () {
        item.File.metaData.text[this.iptc].values = this.values;
    });
}

function buttonIsEnabled(button) {
    return !($(button).hasClass('disabled'));
}

//Validation
function validateContainerData(containerElement) {
    var isValid = true;

    $(containerElement).find('input,textarea,select').each(function () {
        if (!validateFieldData(this)) {
            isValid = false;
            return false;
        }
    });

    return isValid;
}

function validateFieldData(field) {
    if ($(field).hasClass('required') && $(field).hasClass('editable')) {

        if ($(field)[0].nodeName == 'SELECT' && $(field).children().length == 0)
            return false;

        if ($(field).val() == '')
            return false;
    }
    return true;
}
function validateDestinationFields(fields) {
    var isValid = true;
    $(fields).each(function () {
        if (this.required && !this.edit && this.values.toString() == '') {
            isValid = false;
            return false;
        }
    });

    return isValid;
}

//Login window and toolbar
function attachLoginWindowEvents() {
    $('#titleBarLogin').live('click', function (event) {
        event.preventDefault();
        $('div#login').dialog('open');
    });

    $('#LoginSubmit').click(function (event) {

        event.preventDefault();
        var response = $.post("/fotoweb/cmdrequest/Login.fwx", $("#loginForm").serialize(), function (data, success) {
            location.reload();

        });
    });

    $('#titleBarLogout').live('click', function (event) {

        event.preventDefault();
        $.get('/fotoweb/cmdrequest/Logout.fwx', function () {
            window.location.reload();
        });
    });

    $('.log').ajaxError(function (e, xhr, settings, exception) {
        if (settings.url == '/fotoweb/cmdrequest/Login.fwx')
            $(this).text('Login failed');
    });
}

//Workflow dialog
function attachWorkflowWindowEvents() {
    $('.workflowButton').live('click', function (event) {
        var btn = event.currentTarget;
        if (buttonIsEnabled(btn))
            openWorkflowWindow($(btn).attr('destinationId'),$(btn).text());
    });

    $('.sendToWorkflowButton').live('click', function (event) {
        var destinationId = $(event.currentTarget).attr('destinationId');
        var foxToken = $('div#previewPage').attr('foxToken');

        var mdFields = [];
        $('#wfmd' + destinationId + ' .wfField').each(function () {
            mdFields.push({
                iptc: $(this).attr('iptc'),
                values: [$(this).val()],
                edit: false,
                required: $(this).hasClass('required')
            });

        });

        // Bag fields
        $('#wfmd' + destinationId + ' .wfBagField').each(function () {
            var mdItem = {
                iptc: $(this).attr('iptc'),
                values: [],
                edit: false,
                required: $(this).hasClass('required')
            }

            $(this).find('Option').each(function () {
                mdItem.values.push($(this).val());
            });

            mdFields.push(mdItem);
        });


        if (validateDestinationFields(mdFields)) {
            sendToWorkflow(destinationId, foxToken, mdFields);
            closeWorkflowWindow(destinationId);
        }
    });

    //Bag fields in WF
    $('.wfbagaddbtn').live('click', function (event) {
        var btn = event.currentTarget;
        var destinationId = $(btn).attr('destinationid');
        var iptc = $(btn).attr('iptc');

        if ($(btn).attr('isCVField')) {
            //this is a cv field
            $('#cvWindow' + destinationId + iptc).dialog('open');
        }
        else {
            var newValue = $('#wfBagAddTxt' + destinationId + iptc).val();

            var fieldName = "#wfBagField" + destinationId + iptc;
            $(fieldName).append($("<option></option>").attr("value", newValue).text(newValue));
            validateField(fieldName);

            $('#wfBagAddTxt' + destinationId + iptc).val('');
        }
    });
    $('.wfbagrembtn').live('click', function (event) {
        var btn = event.currentTarget;
        var destinationId = $(btn).attr("destinationid");
        var iptc = $(btn).attr("iptc");

        var fieldName = "#wfBagField" + destinationId + iptc;
        $(fieldName + " option:selected").each(function () {
            $(this).remove();
        });
        validateField(fieldName);
    });
}

function openWorkflowWindow(destinationId, name) {
    var element = '#wfmd' + destinationId;
    $(element).dialog({
        autoOpen: false,
        minWidth: 1100,
        resizable: false,
        modal: true,
        title:name
    });

    $(element).dialog('open');
    //Validate fields
    validateContainer(element);

}
function closeWorkflowWindow(destinationId) {
    var element = '#wfmd' + destinationId;

    $(element).dialog('close');
}

function fillArchiveTree() {
    getArchiveTreeData(function (data) {
        filljsTree('#archiveList', data, 'folder');
        fillSearchTree();
    });
}
function fillSearchTree() {
    $('#searchTreeList').hide();
    $('#searchTreeList').empty();
    $('#searchTreeImage').addClass('disabled');
    getSearchTreeData(function (data) {
        filljsTree('#searchTreeList', data, 'funnel');
        $('#searchTreeImage').removeClass('disabled');
    });
}

//Close dialog
function openCloseDialog(dlg) {
    if (dlg.dialog("isOpen"))
        dlg.dialog("close");
    else
        dlg.dialog("open");
}

//Show search in status bar
function displaySearch(search, today) {
    //the target: Audi A3 in SearchTree in Automobiles - Today : 5 hits
    var searchExpr = (search == '') ? '' : '\'' + search + '\' in ';
    var searchTreeExpr = (currentSearchTreeExpression == '') ? '' : trim(currentSearchTreeNode) + ' in ';
    var archiveExpr = trim(currentArchiveName);
    var todayExpr = today ? ' - Today' : '';

    $('#currentSearch').text(searchExpr + searchTreeExpr + archiveExpr + todayExpr);
    $('#currentHits').text('');
}

function displayCurrentHits(hits) {
    //: 5 hits
    var hitString = (hits == 1) ? ' : 1 hit' : ' : ' + hits + ' hits';
    $('#currentHits').text(hitString);
}


///JStree
function filljsTree(id, data, icon) {
    $(id).jstree({
        core: {
    },
    'themes': {
        'theme': icon == 'folder' ? 'classic' : 'funnel',
        'dots': true,
        'icons': true
    },
    'json_data': {
        'data': data,
        'progressive_render': false
    },

    'plugins': ['themes', 'json_data']
});
}

//Format search tree data to fit jstree
function getSearchTreeData(callback) {
    getSearchTree(CurrentArchive, function (data) {
        var rootNode = {
            'name': 'All',
            'search': '',
            'children': data
        };

        //displaySearchTreeName("");

        prepareSearchNodes(rootNode);

        callback.call(this, rootNode);
    });
}
function prepareSearchNodes(searchNodes) {
    $(searchNodes).each(function () {
        this.data = { 'title': this.name };
        this.icon = 'folder';
        this.state = 'open';
        this.attr = { 'search': this.search };
        prepareSearchNodes(this.children);
    });
}

///Format archive list to fit jstree
function getArchiveTreeData(callback) {
    var archives = new Array();
    var i = 0;
    listArchives(function (data) {
        $(data).each(function () {
            if (this.id == CurrentArchive)
                currentArchiveName = this.name;

            archives[i] = this;
            archives[i].data = { 'title': this.name };
            archives[i].attr = {
                'id': 'archive' + this.id,
                'archiveId': this.id
                
            };
            archives[i].icon = 'folder';
            archives[i].state = 'open';
            i++;

        });

        var rootArchives = new Array();
        var j = 0;

        $(archives).each(function () {
            if (this.parentId == 0) {
                rootArchives[j++] = getArchiveChildren(this, archives);
            }else{
				var current = this;
				var hasParent = true;
				$(archives).each(function() {
					if(current.parentId == this.attr.archiveId){
						hasParent = false;
					}
				});
				
				if(hasParent){
					rootArchives[j++] = getArchiveChildren(this, archives);
				}
			}
        });

        callback.call(this, rootArchives);
    });

}
function getArchiveChildren(parent, all) {
    parent.children = new Array();
    var i = 0;
    $(all).each(function () {
        if (this.parentId == parent.id) {
            parent.children[i++] = getArchiveChildren(this, all);
        }
    });
    return parent;
}

//Format CV tree data to fit jstree
function getCVTree(iptc, destinationid) {
    var rootItems = [];

    source = controlledVocabulary;
    if (destinationid)
        source = destinationsControlledVocabulary[destinationid].cvNodes;

    $(source).each(function (i, cvNode) {
        if (cvNodeHasChild(cvNode, iptc))
            rootItems.push(cvNode);
    });

    prepareCVNodes(rootItems, destinationid);

    return rootItems;
}

function prepareCVNodes(searchNodes, destinationid) {
    $(searchNodes).each(function () {
        this.data = { 'title': this.label };
        this.icon = 'folder';
        this.state = 'open';
        this.attr = { 'fieldvalue': this.value, 'iptc': this.iptc, 'destinationid': destinationid };
        prepareCVNodes(this.children, destinationid);
    });
}

function cvNodeHasChild(cvNode, childiptc) {
    var retval = false;
    if (cvNode.iptc == childiptc)
        return true;

    $(cvNode.children).each(function (i, childNode) {
        if (childNode.iptc == childiptc)
            retval = true;
        else
            retval = cvNodeHasChild(childNode, childiptc);
    });
    return retval;
}





function setupScrollHandler() {
    $(window).scroll(function () {
        var m = ($(document).height() - $(window).height()) - $(window).scrollTop();
        if ((($(document).height() - $(window).height()) - $(window).scrollTop()) < (ElementSizeY * 2)) {
            doLoadMoreHits();
        }
    });
}



function calculateNumberOfFiles() {
    // We'll load twice as many rows as fits on screen to
    // allow smooth scrolling of the search result

    var columns = Math.ceil($('#hits').width() / ElementSizeX);
    var rows = Math.ceil(($(document).height() / ElementSizeY));

    return columns * rows;
}



function getUserQuery() {
    var searchStr = $('#query').attr('value');
    var today = $('#todayImage').hasClass('checked');
    var regex = new RegExp('(\\sand\\s)|(\\sor\\s)', 'i');

    if (searchStr.match(' ') && !searchStr.match(regex))
        searchStr = searchStr.split(' ').join(' AND ');

    displaySearch(searchStr, today);

    if (currentSearchTreeExpression != '') {
        if (searchStr == '')
            searchStr = currentSearchTreeExpression;
        else
            searchStr += ' AND ' + currentSearchTreeExpression;
    }

    if (today) {
        var currentTime = new Date();
        var month = currentTime.getMonth() + 1;
        if (month < 10)
            month = '0' + month;

        var day = currentTime.getDate();
        if (day < 10)
            day = '0' + day;
        
        var year = currentTime.getFullYear();

        var todayExpr = '(FQYFD contains (' + year + month + day + '))';
        if (searchStr == '')
            searchStr = todayExpr;
        else
            searchStr += ' AND ' + todayExpr;
    }
	
	

    return searchStr;
}




function browseArchive(calls, hits, skip, take, callback){
	setProcessingState(true);
	if (hits <= 2000 && calls < 4) {
		var currentTime = new Date();
   
		var month = currentTime.getMonth() + 1; 
		if (month < 10){
			month = '0' + month;
		}
			
		var day = currentTime.getDate();
		if (day < 10){
			day = '0' + day;
		}
				
		var year = currentTime.getFullYear();
		
		var searchExpr = '';
		switch(calls){
				case 0:
					searchExpr = '(FQYFD contains ('+year + month +'01~~' + year + month + day + '))';
					break;
				case 1:
					searchExpr = '(FQYFD contains ('+year + '01' + day +'~~' + year + month + day + '))';
					break;
				case 2:
					searchExpr = '(FQYFD contains ('+(year-1) + month + day +'~~' + year + month + day + '))';
					break;
				default:
					searchExpr = 'xlastword';
			}
			CurrentSearch = searchExpr;
			getArchiveHits(CurrentArchive,searchExpr,skip,take,previewSizes,
				function (numberOfHits) {
					browseArchive(calls+1, numberOfHits, skip, take, callback);
				}
			);
	} else {
		searchArchive(CurrentArchive, CurrentSearch, skip, take, previewSizes, callback);
	}

}




function showPreview(item) {

    //generate metadata container for destinations
    var destinationsData = [];
    $.each(destinations, function (index, value) {
        var destination = $.extend(true, {}, value);

        $.each(destination.fields, function (index, value) {

            value.name = item.File.metaData.text[value.iptc] != null ? item.File.metaData.text[value.iptc].name : '';
            value.isMultipleInstanceField = item.File.metaData.text[value.iptc].isMultipleInstanceField;
            value.isMultiline = item.File.metaData.text[value.iptc].isMultiline;

            if (value.clear)
                value.values = [];
            else
                value.values = item.File.metaData.text[value.iptc] != null ? item.File.metaData.text[value.iptc].values : [];
        });

        destination.isValid = validateDestinationFields(destination.fields);

        destinationsData.push(destination);
    });

    $('div#previewWindow').dialog('open');
    $('div#previewWindow').dialog({ title: 'Preview of ' + item.File.name });
    $("div#previewWindow").empty();

    $('#previewTemplate').render(item).appendTo('div#previewWindow');






    //HACK: Remove previous workflow window items
    $('.wfmdWin').remove();
    $('#workflowTemplate').render(destinationsData).appendTo('div#workflowContainer');
  


    //CV
    $('.cvTree').each(function () {
        var destinationid = $(this).attr('destinationid');
        var iptc = $(this).attr('iptc');
        var treeData = getCVTree(iptc, destinationid);

        filljsTree('#' + $(this).attr('id'), treeData, 'folder');
    });

    $('.cvTree').unbind('click');
    $('.cvTree').click(function (event) {
        preventDefault(event);
        event.stopPropagation();
        var node = event.target;

        while (!$(node).hasClass('cvTree')) {
            if (node.nodeName == 'LI') {

                var destinationId = $(node).attr('destinationid');
                var newValue = $(node).attr('fieldvalue');
                var iptc = $(node).attr('iptc');

                var fieldName = "#wfBagField" + destinationId + iptc;
                $(fieldName).append($("<option></option>").attr("value", newValue).text(newValue));
                validateField(fieldName);

            }
            node = node.parentNode;
        }

        $(event.currentTarget.parentNode).dialog('close');
    });

    $('.cvWindow').dialog({
        autoOpen: false,
        resizable: false,
        modal: true
    });
}

function refreshPreviewImage() {
	var itemno = $('#previewPage').attr('itemno');
	var $thumbItem = $('#thumbImage'+itemno);
	
	$thumbItem.attr('src', $thumbItem.attr('src') + '&' + Math.random());
	$('#previewActualImage').attr('src', $('#previewActualImage').attr('src') + '&' + Math.random());
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//
// BINDING MARKUP
//
function getPPC(ppi) {
    return number_format(ppi / 2.54, 2, '.', ' ');
}
function getDimensions(width, height, resolution) {
    return number_format(width / resolution, 2, '.', ' ') + ' x ' + number_format(height / resolution, 2, '.', ' ');
}
function getUncompressedSize(width, height, colorspace) {
    var colorspaceMultiplier;
    switch (colorspace.toLowerCase()) {
        case 'rgb':
        case 'lab':
            colorspaceMultiplier = 3;
        case 'cmyk':
            colorspaceMultiplier = 4;
        default:
            colorspaceMultiplier = 1;

    }
    return formatFileSize(width * height * colorspaceMultiplier);
}
function archiveHasCropAccess() {
    return currentArchiveInformation.ServerInformation.Permissions['RotateCrop'];
}
function archiveHasEditTextAccess() {
    return currentArchiveInformation.ServerInformation.Permissions['EditText'];
}


//////////////////////////////////////////////////////////////////////////////////////////////////
//
// SEARCH LOGIC
//

var SEARCHRESULTS =
		{
		    TotalHits: 0,
		    HitList: []
		}

var isProcessingQuery = false;




function executeSearch() {
	if(!$('div#previewWindow').dialog('isOpen')){ //Do not resfresh page if preview window is open
		$('#allHitsLoaded').hide();
		$('#query').select();
	
	   
		CurrentQuery = getUserQuery();
	
		$('#hits').empty();
		
		if(getUserQuery() == ''){
			browseArchive(0, 0, 0, FilesPerPage, initialQueryCallback);
		}
		else{
			doServerQuery(getUserQuery(), 0, FilesPerPage, initialQueryCallback);
		}
	}
	//Automatically refresh search after timeout
	
	triggerRefreshSearchTimer();

}



function doServerQuery(query, skip, take, callback) {
    setProcessingState(true);
	if (query == '')
		query = CurrentSearch;
	searchArchive(CurrentArchive, query, skip, take, previewSizes, callback);
	
}




function triggerRefreshSearchTimer() {
	
    clearTimeout(searchRefreshTimer);
    searchRefreshTimer = setTimeout(executeSearch, refreshTime);
}

function doLoadMoreHits() {
    if (SEARCHRESULTS.TotalHits > 0 && !isProcessingQuery) {

        if (SEARCHRESULTS.TotalHits > SEARCHRESULTS.HitList.length) {

            setProcessingState(true);
            doServerQuery(CurrentQuery, SEARCHRESULTS.HitList.length, FilesPerPage, loadMoreHitsCallback);
        }
        else {
            if ($('#allHitsLoaded').is(":hidden")) {
                $('#allHitsLoaded').show();
            }
        }
    }


    // If user is near the three last pages, load more hits


    if (AutoLoad && SEARCHRESULTS.HitList.length < AutoLoadMaxHits)
        setTimeout(doLoadMoreHits, 500);
    else if ($(window).scrollTop() > $(document).height() - ($(window).height()))
        setTimeout(doLoadMoreHits, 500);

    //Automatically refresh search after timeout
    triggerRefreshSearchTimer();
}



function initialQueryCallback(data) {

    // We've got results, process it

    var numberOfHits = data.totalHits; 
    SEARCHRESULTS.TotalHits = numberOfHits;

    displayCurrentHits(numberOfHits);

    SEARCHRESULTS.HitList = createHitList(data.files);

    if (SEARCHRESULTS.TotalHits > 0)
        insertHitItemsInView(SEARCHRESULTS.HitList, false);
    else
        insertNoHitsHints();

    setProcessingState(false);

}



function loadMoreHitsCallback(data) {
    var moreHits = createHitList(data.files);

    var j = SEARCHRESULTS.HitList.length;
    for (var i = 0; i < moreHits.length; i++) {
        SEARCHRESULTS.HitList[j] = moreHits[i];
        SEARCHRESULTS.HitList[j].ItemNo = j;
        j++;
    }
    insertHitItemsInView(moreHits, true);

    setProcessingState(false);
}



function createHitList(data) {
    var hitList = [];
    var index = 0;

    $(data).each(
  	    function () {
  	        var HitInfo = {
  	            'File': this,
  	            'ItemNo': index,
  	            'markers': getMarkersForFile(this),
  	            'compactFileName': compactFileName(this.name)
  	        };

  	        hitList[index++] = HitInfo;
  	    }
  	);

    return hitList;
}

function compactFileName(filename) {
    var extension = '.' + (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
    var n = thumbFileNameLength;
    filename = filename.replace(extension, '');
    filename = filename.substr(0, n - 1) + (filename.length > n ? '...' : '');

    return filename + extension;
}


function compactMetadataField(field){
	if(field){
		var n = metadataLength;
    	field = field.substr(0, n - 1) + (field.length > n ? '...' : '');
	}
	
	return field;
}


function getMarkersForFile(file) {
    var fileMarkers = [];
    $(markers).each(function () {
        if (file.metaData.text[this.field].values)
            if (file.metaData.text[this.field].values.toString().match(this.regex)) {
                fileMarkers.push($.extend(true, {}, this));
            }
    });
    return fileMarkers;
}

function getIndexFromItem(item) {
    return item.ItemNo;
}



function setProcessingState(isProcessing) {
    isProcessingQuery = isProcessing;

    if (isProcessingQuery) {
        $('#loader').show();
    }
    else {
        $('#loader').hide();
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////
//
// RENDERING LOGIC
//



function insertHitItemsInView(itemList, append) {
    if (!append)
        $('#hits').empty();

    $("#thumbTemplate").render(itemList).appendTo("#hits");
}

function insertSearchHints() {
    var template = $('#searchHintsTemplate').attr('innerHTML');
    template = template.replace('templateId', 'searchHints');
    $('#hits').empty();
    $('#hits').append(template);
}

function insertNoHitsHints() {
    var template = $('#noHitsHintsTemplate').attr('innerHTML');
    template = template.replace('templateId', 'noHitsHints');
    $('#hits').empty();
    $('#hits').append(template);
}


//////////////////////////////////////////////////////////////////////////////////////////////////
//
// APPLICATION LOGIC
//



function trim(s) {
    return s.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function enableKeepAliveTimer() {
    
    //KeepAliveTimer = window.setInterval("keepSessionAlive()", 1000 * 60 * 5);
}

function keepSessionAlive() {
    listArchives(function () { });
}

function getItemFromId(id) {

    return SEARCHRESULTS.HitList[id];
}

function preventDefault(event) {
    if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
}

function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}