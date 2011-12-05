<div id="thb{{= ItemNo}}" class="thbnail">
	<ul class="thbContent">
		<li class="imageContainer">
			 <img id="thumbImage{{= ItemNo}}" src="/fotoweb/cmdrequest/rest/preview.fwx?f={{= File.foxToken }}&sz=220" />
		</li>
		<li>
			<div class="markerContainer">
				{{each(i,marker) markers}}
				<img src="{{= marker.icon}}" title="{{= marker.desc}}" alt="{{= marker.desc}}" markername="{{= marker.name}}"/>
				{{/each}}
			</div>
		</li>
		<li>
            <div class="imageInfoContainer" >{{= compactMetadataField(File.metaData.text[103].values[0])}}</div>
        </li>
        <li >
            <div class="imageInfoContainer" >{{= compactMetadataField(File.metaData.text[110].values[0])}}</div>
        </li>
        <li >
            <div class="imageInfoContainer">{{= compactMetadataField(File.metaData.text[5].values[0])}}</div>
        </li>
        <li>
            <div class="fileNameContainer">{{= compactFileName}}</div>
		</li>
	</ul>
</div>