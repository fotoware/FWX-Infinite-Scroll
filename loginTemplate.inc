<div id="login">
	<form name="LoginForm" id="loginForm" method="post" action="/fotoweb/cmdrequest/Login.fwx">
          <div id="divUserName">
            <label>User name:</label> <input name="u" type="text">
          </div>
          <div id="divPassword">
            <label>Password:</label> <input name="p" type="password">
          </div>
		<p class="clear"></p>
          <input name="s" type="hidden" value="/fotoweb/Grid.fwx">
          <input id="LoginSubmit" class="medium awesome" type="submit" name="lo" value="Log in">

          <%$ if Site.AllowPersistentLogins %>
	          <div id="Remembering">
	            <input id="chkRemember" type="checkbox" name="persistentLogin" value="1">
	            <label id="chkRememberLabel" for="chkRemember">Remember me</label>
	          </div>
          <%$ endif %> <!--  if Site.AllowPersistentLogins  -->
	</form>
	<div class="log"></div>
	</body>
</div>