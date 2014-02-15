nfcRing.ui = {
  addActions: function(){
    // Load each action icon and text
    $.each(nfcRing.actions, function (key, action) {
      console.log("action", action);
      if (!action.image) {
        action.image = key.toLowerCase() + ".png";
      }
      action.title = html10n.get('actions.'+key+'.name');
      action.descriptionI18n = html10n.get('actions.'+key+'.description');
      if(!typeof action.descriptionI18n == 'object'){ // If it's an object the string value was missing so we return nada
         action.description = action.descriptionI18n;
      }
      $('#ringActions').append('<li><a data-key="'+action.title+'" class="action icon icon-'+ action.label.toLowerCase() +'">' + action.label + '<span>' + action.description + '</span></a></li>');
    });

  }, // Note this will be a PITA to do i18n
  showNeedHelp: function(){}, // Shows the need help button
  domListenersInit: function(){

    jQuery(document).ready(function($) {
      if (window.history && window.history.pushState) {
        $(window).on('popstate', function() {
          var hashLocation = location.hash
          var hashSplit = hashLocation.split("#!/");
          var hashName = hashSplit[1];
          if (hashName !== '') {
            var hash = window.location.hash;
            if (hash !== "#index"){
              if(hash){
                console.log("going back from ", hash);
                // nfcRing.ui.handleBack();
              }
            }
            if (hash === '') {
              alert('Back button was pressed.');
            }
          }
        });
        window.history.pushState('forward', null, './#forward');
      }
    });

    nfcRing.ui.history = []; // Create blank history stack

    $('body').on('click', '#actionBtn', function(){
      nfcRing.ui.displayPage("action");
      nfcRing.ui.addActions();
    });

    $('body').on('click', '#readBtn', function(){
      nfcRing.ui.displayPage("writeRing"); // Read uses the same UI as writeRing just with different event listeners
    });

    $('body').on('click', '#settingsBtn', function(){
      nfcRing.ui.displayPage("settings");
    });

    Handlebars.registerHelper('html10n', function(str,a){
      return (html10n != undefined ? html10n.get(str) : str);
    });

    var language = document.cookie.match(/language=((\w{2,3})(-\w+)?)/);
    if(language) language = language[1];
    html10n.bind('indexed', function() {
      html10n.localize([language, navigator.language, navigator.userLanguage, 'en'])
    })
    html10n.bind('localized', function() {
      console.log("Localized");
      document.documentElement.lang = html10n.getLanguage()
      document.documentElement.dir = html10n.getDirection()
      nfcRing.ui.displayPage("index");
    });

    FastClick.attach(document.body); // What does this do?

    $('#helpLink').on('click', function (e) {
      e.preventDefault();
      $.magnificPopup.open({
        items: {
          src: '#helpContents'
        },
        type: 'inline',
        mainClass: 'mfp-fade',
        showCloseBtn: false,
        closeOnBgClick: false,
        callbacks: {
          close: function () {
            setTimeout($('#message').fadeOut('slow'), 5000);
          }
        }
      }, 0);
    });

    $('body').on('click', '#helpClose', function () {
      $.magnificPopup.close();
    });  

    // click action for previously historical actions
    $('body').on('click', '.ringActions > li > .historical', function(){ 
      nfcRing.heatmapInit();
      console.log("Setting location to option");
      nfcRing.location = "writing";
      var action = $(this).data("action");
      var key = $(this).data("key");
      console.log("Key ", key);
      console.log("Submitting a write value to the nfcRing object");
      nfcRing.submitted(action, key);
    });

    // click listener for each action from actions.js
    $('body').on('click', '#ringActions > li > .action', function(){
      // Begin heatmap stuff, this pre-loads the data for us :)
      nfcRing.heatmap.init();
      console.log("Setting location to option");
      var key = $(this).data("key");
      nfcRing.action = $(this).data("key");
      nfcRing.ui.displayPage("option");
      var labelI18n = html10n.get('actions.'+key.toLowerCase()+'.optionText');
      if(!typeof labelI18n == 'object'){ // If it's an object the string value was missing so we return nada
         var label = action.labelI18n;
      }else{
         var label = nfcRing.actions[key.toLowerCase()].optionText;
      }
      $('.optionName').html('<h2>' + label + '</h2>');
      /*
      // $('#optionInput').attr("placeholder", actions[key].placeHolder);
      // $('form > label').text(actions[key].optionText);
      
      */
    });

    $('body').on('submit', '#optionForm', function(e){
      e.preventDefault();
      nfcRing.userValues.toWrite = $('#optionInput').val(); // gets the value to write
   
      nfcRing.userValues.history.set(); // saves it to history
      console.log("Submitting a write value to the nfcRing object");
      nfcRing.ui.displayPage("writeRing");
      return false;
    });

    $('body').on('click', '#clearSweetSpot', function(){
      if(confirm(html10n.get("sweetSpot.areYouSureSS"), false, html10n.get("sweetSpot.areYouSure"))){
        console.log("clearing sweet spot history");
        localStorage.setItem("dontAskSweetSpotAgain", false);
        localStorage.setItem("sweetSpotLocation", false);
      }
    });

    $('body').on('click', '#clearPreviousActions', function(){
      if(confirm(html10n.get("sweetSpot.areYouSureActions"), html10n.get("sweetSpot.areYouSure"))){
        console.log("Clearing previous actions");
        localStorage.setItem("actionHistory", "{}");
      }
    });

    $('body').on('click', '#viewHistory', function(e) {
      console.log("Showing history");
      e.preventDefault();
      $('body').toggleClass('show-history');
      $('#trigger').append('<div id="back-btn" class="icon icon-back close-sub"></div>');
    });

    $('body').on('click', '#sweetSpotBtn', function(){
      console.log("Showing sweet spot location page");
      nfcRing.ui.displayPage("sweetSpot");
    });

    $('body').on('click', '#sweetSpotOverlay', function(e){
      console.log("Click event for sweet spot overlay", e);
      nfcRing.heatmap.sweetSpot.send(e);
    });

    $('body').on('click', '#nav-btn', function() {
      $('body').toggleClass('context-open');
    });

    // click action for previously historical actions
    $('body').on('click', '#history li > .historical', function(){
      $('#action').hide();
      $('body').toggleClass('show-history').toggleClass('context-open');
      $('#back-btn').remove();
      console.log("beginning init");
      nfcRing.heatmapInit();
      console.log("Setting location to option");
      nfcRing.location = "writing";
      var action = $(this).data("action");
      var key = $(this).data("key");
      console.log("Key ", key);
      console.log("Submitting a write value to the nfcRing object");
      nfcRing.submitted(action, key);
    });

    $('body').on('click', '#finish', function(){
      nfcRing.ui.displayPage("index");
    });

  },
  updateVersion: function(){ // show Version number on the page
    if(device.platform === "browser"){
      $('#versionNumber').text("N/A");
    }else{
      cordova.getAppVersion().then(function (version) { $('#versionNumber').text(version); });
    }
    $('#modelName').text(device.model);
  },
  displayPage: function(page){ // Display a page
    window.location.hash = '#'+page;
    console.log("Displaying page", page);
    nfcRing.ui.history.push(page); // Write the this page to the history stack
    nfcRing.location = page;
    var source = $('#'+page).html();
    // var context = $('#contextContent').html(); // always include context nav on every page :)
    var template = Handlebars.compile(source);
    // var context = Handlebars.compile(context);
    $("#mainContents").html(template());
    // $("#context").html(context()); // TODO fix me at the moment taking up most of the UI
    // console.log("Writing ", source, " to #container");
    nfcRing.ui.updateVersion();
    nfcRing.userValues.history.get(); // always update the history on each page view so context is always updated
    $(".timeago").timeago(); // show " time ago " strings
  }, 
  handleBack: function(){  // Init the Back Button event handlers
    if (nfcRing.location == "index") {
      // Clear history so back button on home page always leaves the app
      console.log("Cleared app history");
      history.go(-(history.length - 9999));
      document.addEventListener("backbutton", nfcRing.handleBack, true);
      // navigator.app.clearHistory(); // This doesn't even exist in WP -- does it actually exist on Android?
    } else {
      document.addEventListener("backbutton", nfcRing.handleBack, false);
      nfcRing.ui.history.pop(); // drop the last item from the history array
      nfcRing.ui.displayPage(nfcRing.ui.history[nfcRing.ui.history.length-1]); // display the previous page
    }

    // NOTE this is a bit more tricky in a single page app because you have to remember an array of what page you were on..

  },
  paramFromURL: function(name){
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null ) return "";
    else return results[1];
  }
}
