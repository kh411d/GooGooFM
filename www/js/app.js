angular.module('googoofm', ['ionic','ngCordova','ngSanitize','ngTwitter', 'googoofm.controllers'])

.filter('hrefToJS', function ($sce, $sanitize) {
    return function (text) {
        var regex = /href="([\S]+)"/g;
        var newString = $sanitize(text).replace(regex, "class=\"button button-small button-positive\" onClick=\"window.open('$1', '_system', 'location=yes')\"");
        return $sce.trustAsHtml(newString);
    }
})

.filter('tweetURLtoJS', function ($sce, $sanitize) {
    return function (text) {
        var regex = /((https?:\/\/|www.)([-\w.]+)+(:\d+)?(\/([\w\/_.]*(\?\S+)?)?)?)/;
        var newString = $sanitize(text).replace(regex, "<a onClick=\"window.open('$1', '_system', 'location=yes')\">$1</a> ");
        return $sce.trustAsHtml(newString);
    }
})

.run(function($ionicPlatform) {
 
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

    var push = PushNotification.init({
            "android": {
                "senderID": "736765599911"
            },
            "ios": {"alert": "true", "badge": "true", "sound": "true"}, 
            "windows": {} 
        });
        
        push.on('registration', function(data) {
            console.log("registration event");
            //document.getElementById("regId").innerHTML = data.registrationId;
            console.log(JSON.stringify(data));
        });

        push.on('notification', function(data) {
          console.log("notification event");
            console.log(JSON.stringify(data));
            /*var cards = document.getElementById("cards");
            var card = '<div class="row">' +
            '<div class="col s12 m6">' +
          '  <div class="card darken-1">' +
          '    <div class="card-content black-text">' +
          '      <span class="card-title black-text">' + data.title + '</span>' +
          '      <p>' + data.message + '</p>' +
          '    </div>' +
          '  </div>' +
          ' </div>' +
          '</div>';
            cards.innerHTML += card;*/
            
            push.finish(function () {
                console.log('finish successfully called');
            });
        });

        push.on('error', function(e) {
            console.log("push error");
        });
    
    //Set Analytic
    /*if(window.cordova.plugins.analytics){
            cordova.plugins.analytics.startTrackerWithId("UA-68157599-1");
    }*/

/*    if(typeof analytics !== undefined) {
        analytics.startTrackerWithId("UA-68157599-1");
        console.log("Google Analytics OK");
    } else {
        console.log("Google Analytics Unavailable");
    }
*/    
    
  });
})



.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider,$httpProvider) {

  $ionicConfigProvider.tabs.position('bottom'); // other values: top

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'TwitterCtrl'
        }
      }
  })

  .state('tab.crowd',{
    url:'/crowd',
    views:{
      'tab-crowd':{
        templateUrl:'templates/tab-crowd.html',
        controller: 'CrowdCtrl'
      }
    }
  })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
