<div id="previewPage" itemno="{{= ItemNo}}" foxtoken="{{= File.foxToken}}" fileid="{{= File.id}}">
    <div id="previewImage">
        <!--<img src="{{= File.previewLinks[1].url }}" />-->
        <img id="previewActualImage" src="/fotoweb/cmdrequest/rest/preview.fwx?f={{= File.foxToken }}&sz=400" />
        <div class="previewMarkerContainer">
			{{each(i,marker) markers}}
			<img src="{{= marker.icon}}" title="{{= marker.desc}}" alt="{{= marker.desc}}" markername="{{= marker.name}}"/>
			{{/each}}
		</div>
        <div id="reservation">
        	<div id="reserveContainer"><div id="reserveButton" class="medium awesome">Reserve</div><input type="text" id="reserveField" class="mdTextField editable" /></div>
           	<div id="unreserveContainer"><div id="unreserveButton" class="medium awesome">Unreserve</div><input type="text" id="unreserveField" class="mdTextField editable" /></div>
        </div>
  
        {{if archiveHasCropAccess()}}<div id="cropImageBtnWrapper"><div id="cropImageBtn" class="awesome">Crop</div></div>{{/if}}
        
    </div>
    <div id="metadata">
        <table>
            <tr>
                <td class="textLabel">Taille fichier</td>
                <td class="valueLabel">{{= File.fileInfo.fileSize}}</td>
                <td class="textLabel">Talle decompressée</td>
                <td class="valueLabel">${getUncompressedSize(File.metaData.pixelWidth, File.metaData.pixelHeight, File.metaData.colorSpace)}</td>
            </tr>
            <tr>
                <td class="textLabel">Dimensions (pixels)</td>
                <td class="valueLabel">{{= File.metaData.pixelWidth}}x{{= File.metaData.pixelHeight}}</td>
                <td class="textLabel">Dimensions</td>
                <td class="valueLabel">${getDimensions(File.metaData.pixelWidth, File.metaData.pixelHeight, getPPC(File.metaData.resolution))} cm <br />${getDimensions(File.metaData.pixelWidth, File.metaData.pixelHeight, File.metaData.resolution)} inch</td>
            </tr>
            <tr>
                <td class="textLabel">Type fichier</td>
                <td class="valueLabel">{{= File.fileInfo.mimeType}}</td>
                <td class="textLabel">Résolution</td>
                <td class="valueLabel">${getPPC(File.metaData.resolution)} ppc <br />{{= File.metaData.resolution}} ppi</td>
            </tr>
            <tr>
                <td class="textLabel">Derniére modification</td>
                <td class="valueLabel">{{= File.fileInfo.lastModified}}</td>
                <td class="textLabel">Espace couleur</td>
                <td class="valueLabel">{{= File.metaData.colorSpace}}</td>
            </tr>
        
        </table>
        <div id="editImages">
            <div id="acceptImage" class="medium awesome">
                <img src="images/accept.png" />
            </div>
            <div id="cancelImage" class="medium awesome">
                <img src="images/cancel.png" />
            </div>
        </div>
        {{if archiveHasEditTextAccess()}}
        <div id="editImage" class="medium awesome">
            <img src="images/pencil.png" />
        </div>
        {{/if}}
        <div class="mdSet">
            <label class="textLabel">
                {{= File.metaData.text['120'].name}}</label>
            <textarea rows="3" id="mdField{{= File.metaData.text['120'].iptc}}" class="multiline locked textField mdTextField"
                disabled="true" iptc="{{= File.metaData.text['120'].iptc}}">{{= File.metaData.text['120'].values[0]}}</textarea>
        </div>
        <div class="mdSet">
            <label class="textLabel">
                {{= File.metaData.text['5'].name}}</label>
            <input type="text" id="mdField{{= File.metaData.text['5'].iptc}}" iptc="{{= File.metaData.text['5'].iptc}}"
                class="locked textField mdTextField" disabled="disabled" value="{{= File.metaData.text['5'].values[0]}}" />
        </div>
        <div class="mdSet small">
            <label class="textLabel">
                {{= File.metaData.text['15'].name}}</label>
            <input type="text" id="mdField{{= File.metaData.text['15'].iptc}}" iptc="{{= File.metaData.text['15'].iptc}}"
                class="locked textField mdTextField" disabled="disabled" value="{{= File.metaData.text['15'].values[0]}}" />
        </div>
        <div class="mdSet small right">
            <label class="textLabel">
                {{= File.metaData.text['80'].name}}</label>
            <input type="text" id="mdField{{= File.metaData.text['80'].iptc}}" iptc="{{= File.metaData.text['80'].iptc}}"
                class="locked textField mdTextField" disabled="disabled" value="{{= File.metaData.text['80'].values[0]}}" />
        </div>
        
        <div class="mdSet small">
            <label class="textLabel">
                {{= File.metaData.text['20'].name}}</label>
            <input type="text" id="mdBagAddTxt{{= File.metaData.text['20'].iptc}}" iptc="{{= File.metaData.text['20'].iptc}}"
                class="locked textField" disabled="disabled" />
            <div id="bagAddBtn{{= File.metaData.text['20'].iptc}}" iptc="{{= File.metaData.text['20'].iptc}}"
                class="medium awesome bagaddbtn disabled">
                <span>+</span>
            </div>
            <div id="bagRemBtn{{= File.metaData.text['20'].iptc}}" iptc="{{= File.metaData.text['20'].iptc}}"
                class="medium awesome bagrembtn disabled">
                <span>-</span>
            </div>
            <select multiple="multiple" id="mdField{{= File.metaData.text['20'].iptc}}" iptc="{{= File.metaData.text['20'].iptc}}"
                class="locked textField mdBagField" disabled="true">
                {{each(i,value) File.metaData.text['20'].values}}
                <option value="{{= value}}" label="{{= value}}" />
                {{/each}}
            </select>
        </div>
        
        
        <div class="mdSet small right">
            <label class="textLabel">
                {{= File.metaData.text['122'].name}}</label>
            <input type="text" id="mdField{{= File.metaData.text['122'].iptc}}" iptc="{{= File.metaData.text['122'].iptc}}"
                class="locked textField mdTextField" disabled="disabled" value="{{= File.metaData.text['122'].values[0]}}" />
        </div>
        <div class="mdSet small right">
            <label class="textLabel">
                {{= File.metaData.text['103'].name}}</label>
            <input type="text" id="mdField{{= File.metaData.text['103'].iptc}}" iptc="{{= File.metaData.text['103'].iptc}}"
                class="locked textField mdTextField" disabled="disabled" value="{{= File.metaData.text['103'].values[0]}}" />
        </div>
        <div class="mdSet small right">
            <label class="textLabel">
                {{= File.metaData.text['214'].name}}</label>
            <input type="text" id="mdField{{= File.metaData.text['214'].iptc}}" iptc="{{= File.metaData.text['214'].iptc}}"
                class="locked textField mdTextField" disabled="disabled" value="{{= File.metaData.text['214'].values[0]}}" />
        </div>
        <div class="mdSet">
            <label class="textLabel">
                {{= File.metaData.text['105'].name}}</label>
            <input type="text" id="mdField{{= File.metaData.text['105'].iptc}}" iptc="{{= File.metaData.text['105'].iptc}}"
                class="locked textField mdTextField" disabled="disabled" value="{{= File.metaData.text['105'].values[0]}}" />
        </div>
        
        <!--<div class="mdSet">
            <label class="textLabel">
                {{= File.metaData.text['100'].name}}</label>
            <label id="cvlbl{{= File.metaData.text['100'].iptc}}">
                {{= File.metaData.text['100'].values[0]}}</label>
            <label class="textLabel">
                {{= File.metaData.text['90'].name}}</label>
            <label id="cvlbl{{= File.metaData.text['90'].iptc}}">
                {{= File.metaData.text['90'].values[0]}}</label>
            <div id="cvbtn{{= File.metaData.text['100'].iptc}}" iptc="{{= File.metaData.text['100'].iptc}}"
                class="medium awesome cvselectbtn disabled">
                <span>Pick</span>
            </div>
            <div id="cvWindow{{= File.metaData.text['100'].iptc}}" iptc="{{= File.metaData.text['100'].iptc}}"
                class="cvWindow">
                <div id="cvTree{{= File.metaData.text['100'].iptc}}" class="cvTree" iptc="{{= File.metaData.text['100'].iptc}}">
                </div>
            </div>
            <input id="cvinput{{= File.metaData.text['90'].iptc}}" type="hidden" iptc="{{= File.metaData.text['90'].iptc}}"
                value="{{= File.metaData.text['90'].values[0]}}" class="mdHiddenField" />
            <input id="cvinput{{= File.metaData.text['100'].iptc}}" type="hidden" iptc="{{= File.metaData.text['100'].iptc}}"
                value="{{= File.metaData.text['100'].values[0]}}" class="mdHiddenField" />
        </div>-->
        
    </div>
    <div id="workflowContainer">
    </div>
</div>
