<div id="workflow">
    <div destinationid="{{= id}}" id="wf{{= id}}" class="workflowButton large awesome {{if !isValid }}disabled{{/if}}">
        {{= name}}</div>
    <div id="wfmd{{= id}}" class="wfmdWin" style="display: none">
        <ul id="workflowMD">
            {{each(i,field) fields}} 
            <li iptc="{{= field.iptc}}">
            {{if field.edit }}
                <label class="textLabel">{{= field.name}}</label>
                {{if !field.isMultipleInstanceField}}
                    <textarea rows="{{if field.isMultiline }}3{{else}}1{{/if}}" class="editable textField wfField {{if field.required }}required{{/if}} {{if field.isMultiline }}multiline{{/if}}" type="text" iptc="{{= field.iptc}}" >{{= field.values[0]}}</textarea>
                {{else}}
                    <div>
                        {{if !field.isCVField}}
                            <input type="text" id="wfBagAddTxt{{= id}}{{= field.iptc}}" iptc="{{= field.iptc}}" class="editable textField" />
                        {{/if}}
    	                <div id="wfBagAddBtn{{= id}}{{= field.iptc}}" destinationid="{{= id}}" iptc="{{= field.iptc}}" class="medium awesome wfbagaddbtn" isCVField="{{if field.isCVField}}true{{/if}}">
                            <span>+</span>
                        </div>
                        <div id="wfBagRemBtn{{= id}}{{= field.iptc}}" destinationid="{{= id}}" iptc="{{= field.iptc}}" class="medium awesome wfbagrembtn">
                            <span>-</span>
                        </div>
        	            <select multiple="multiple" id="wfBagField{{= id}}{{= field.iptc}}" iptc="{{= field.iptc}}" class="editable textField {{if field.required }}required{{/if}} wfBagField" >
                            {{each(i,value) field.values}}
                                <option value="{{= value}}" label="{{= value}}" /> 
                            {{/each}}
                        </select>
                     </div>
                     {{if field.isCVField}}
                        <div id="cvWindow{{= id}}{{= field.iptc}}" iptc="{{= field.iptc}}" class="cvWindow">
                            <div id="cvTree{{= id}}{{= field.iptc}}" destinationid="{{= id}}" class="cvTree" iptc="{{= field.iptc}}"></div>
                        </div>
                     {{/if}}
                {{/if}}

            {{else}}
                {{each(i,value) field.values}}
                    <input class="wfField" type="hidden" iptc="{{= field.iptc}}" value="{{= value}}" />
                {{/each}}
            {{/if}} 
            </li>
            {{/each}}
        </ul>
        <div destinationid="{{= id}}" id="sendImage" class="sendToWorkflowButton medium awesome">
            Send to workflow&nbsp&nbsp<img src="images/bullet_go.png" />
        </div>
    </div>
</div>
