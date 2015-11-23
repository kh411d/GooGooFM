angular.module('googoofm.controllers', ['ngCordova'])

.controller('DashCtrl',['$ionicPlatform','$scope','$cordovaMedia','$http','$ionicLoading','$window', function($ionicPlatform,$scope, $cordovaMedia,$http,$ionicLoading,$window) {

var nowplaying = 'STORAGE.NOWPLAYING.KEY';
$scope.artist_info = null;


$scope.GotoLink = function (url) {
    $window.open(url,'_system');
  }

$scope.getArtistinfo = function(artist){
    //get personal info
    $http.get("http://ws.audioscrobbler.com/2.0/?method=artist.getInfo&artist="+encodeURIComponent(artist)+"&format=json&api_key=57ee3318536b23ee81d6b27e36997cde").
          then(function(response) {
            if(response.data.artist !== undefined){
              var imgsrc = $.map(response.data.artist.image[4], function(value, index) {
                                return [value];
                            });

              $scope.artist_info = {
                'mbid' : response.data.artist.mbid,
                'name' : response.data.artist.name,
                'summary' : response.data.artist.bio.summary,
                'imgsrc' :imgsrc[0]
              }
              $scope.getConcertInfo(response.data.artist.mbid);
            }
          }, function(response) {
           console.log(response);
          });  
  }

  $scope.getConcertInfo = function(mbid) {
     $http.get("http://api.songkick.com/api/3.0/artists/mbid:" + mbid + "/calendar.json?apikey=svuaQvwMb8wOLuYZ").
          then(function(response) {
            if(response.data.resultsPage){
              var obj = response.data.resultsPage.results;
              artist_concert = [];
              var count = 0;
              if(obj.hasOwnProperty('event')){
                  for (var i in obj.event){
                    var c = {};
                    count++;
                    c.name = obj.event[i].displayName;
                    c.date = obj.event[i].start.date;
                    c.status = obj.event[i].status;
                    c.uri = obj.event[i].uri;
                    artist_concert.push(c);
                    if(count >= 2)break;
                  }
              }

              if(artist_concert.length > 0){
                $scope.artist_info.concerts = artist_concert; 
              }
              
              
            }
          }, function(response) {
           console.log(response);
          }); 
  }
  
  $scope.selectTabWithIndex = function(index) {
    $ionicTabsDelegate.select(index);
  }

  //var src = "http://streaming.mramedia.com:8001/hardrock";
  //var xspf_src = "http://streaming.mramedia.com:8001/hardrock.xspf";
   var src = "http://66.228.51.170:8000/mount";
   var xspf_src = "http://66.228.51.170:8000/mount.xspf";
  var token_basic_auth = btoa('kambing:gunung');
  

    var width = $('.ticker-text').width(),
        containerwidth = $('.ticker-container').width(),
        left = containerwidth;
      function tick() {
          if(--left < -width){
              left = containerwidth;
          }
          $(".ticker-text").css("margin-left", left + "px");
          setTimeout(tick, 16);
        }
        tick();
  
  $scope.playing = false;
  $scope.title = "Tap the turntable to listen";
  window.localStorage.setItem(nowplaying, '');

      
  $scope.getXspf = function(){
        $http.get(xspf_src).
          then(function(response) {
            var xspf_data = response.data;
            if(response.data){
              var xmlDoc = jQuery.parseXML( response.data ),
                  $xml = $( xmlDoc ),
                  $title = $xml.find( "title" );

                  if($title.length > 0){
                    $scope.title = $title.text();
                    if($title.text() !== window.localStorage.getItem(nowplaying)){
                      window.localStorage.setItem(nowplaying, $title.text());
                      var arrstrings = $title.text().split('-');
                      $scope.getArtistinfo(arrstrings[0].trim());
                    }
                    
                  }else{
                      $scope.title = "Cannot get Metadata ...";
                  }
                  
            }
          }, function(response) {
           // $scope.title = "OFF AIR";    
          });   
  };

  // Run function every second
  $scope.intervalID = '';

 //$scope.getArtistinfo("def leppard");

  $scope.mood = function(id) {
     $ionicLoading.show({
      template: 'Sending Mood...'
    });
    
    var time = moment.utc().format('x'); //Unix Timestamp milliseconds
  
    $http({
      url: "http://gooapi.think.web.id/api/mood",
      method: "POST",
      headers: { 'Content-Type':'application/x-www-form-urlencoded','Authorization':'Basic '+ token_basic_auth },
      data: $.param({'m':id,'t':time})
    }).
    then(
      function(response) {
        //console.log(response);
        $ionicLoading.hide();
      }, 
      function(response) {
         $ionicLoading.hide(); 
        $ionicLoading.show({
          template: 'Cannot connect...',
          duration:2000
        });    
      }
    );
  };


  $scope.play = function() {
     $scope.playing = true;
    $scope.intervalID = setInterval($scope.getXspf, 1000);
                  return $ionicPlatform.ready(function(){})
                        .then(function(){
                           media = $cordovaMedia.newMedia(src);

                           var promise = media.play();
                           
                           return promise.then(
                              null,
                              null,
                              function(result){
                                //if(result.status == 1) { $scope.title = 'ON AIR LOADING...'; };
                                if(result.status == 2)  { $scope.playing = true; }
                              }
                            );
                  });
  };



  $scope.stop = function(){
      if(media){
        $scope.playing = false;
        clearInterval($scope.intervalID);
        $scope.title = "Tap the turntable to listen";
        return media.stop();
      }
  } 

}])

.controller('CrowdCtrl',function($scope,$ionicPlatform,$ionicLoading,$http){

  var token_basic_auth = btoa('kambing:gunung');

   var shuffle = function(array) {
      var currentIndex = array.length, temporaryValue, randomIndex ;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }

 $scope.getMoods = function() {
    $ionicLoading.show({
        template: 'Getting Moods...'
    });
  
  var dateNow = moment.utc();
  var time = dateNow.format('x'); //Unix Timestamp milliseconds
  var time_last30 = dateNow.subtract(30,'minutes').format('x');//Unix Timestamp milliseconds
  var tt = time - 30*60*1000;
    
$http.get("http://gooapi.think.web.id/api/mood?f="+time_last30+"&t="+time+"&x="+tt,{headers:{ 'Authorization':'Basic '+ token_basic_auth }}).
then(
      function(response) {
         $('#crowd-mood').empty();
          //console.log(response);
        if(response.data.data.length > 0){
          var moods = response.data.data;

          if (moods.length < 12) {
            var pad = 12 - moods.length;
            for (i = moods.length + 1; i <= 12; i++) {
              moods.push({'m':17});
            };
          }
          shuffle(moods);
        }else{
          var moods = [{'m':17},{'m':9},{'m':9},{'m':17},{'m':17},{'m':9},{'m':17},{'m':17},{'m':17},{'m':17},{'m':17},{'m':17},{'m':9}];
          shuffle(moods);
        }
        $scope.makeDiv(moods);
        $ionicLoading.hide(); 
      }, 
      function(response) {
        $ionicLoading.hide(); 
        $ionicLoading.show({
          template: 'Cannot connect...',
          duration:2000
        });    
      }
    );
 }

$scope.$on('$ionicView.enter', function() {
   // Code you want executed every time view is opened
   $('#crowd-mood').empty();
   $scope.getMoods();
});

$scope.makeDiv = function(moods) {
        var mood = moods.pop();
        var numRand = Math.floor(Math.random() * 501);
        var divsize = 100;
        var posx = (Math.random() * ($('#crowd-mood').width() - divsize)).toFixed();
        var posy = (Math.random() * ($('#crowd-mood').height() - divsize)).toFixed();
        $newdiv = $("<div class='exploding'><img class='smiley shake-even' src='assets/smiley/"+mood.m+".png' /></div>").css({
            'left': posx + 'px',
                'top': posy + 'px'
        });
        $newdiv.appendTo('#crowd-mood').delay(1000).fadeIn(100, function () {
            //$(this).remove();
            if(moods.length > 0){
              $scope.makeDiv(moods);
            }
            
        });
    }
})

.controller('TwitterCtrl', function($scope, $ionicPlatform, $twitterApi, $cordovaOauth,$ionicLoading,$window) {
  var twitterKey = 'STORAGE.TWITTER.KEY';
  var clientId = '0XLd79MZTj6kZ23Iv4vA4Vzej';
  var clientSecret = 'XlOTMKNnjCSSPTpHhr9ubYygyZ3f03VSvIjXWaUdB46wpbEN6J';
  var myToken = '';

 $scope.GotoLink = function (url) {
    $window.open(url,'_system');
  }
   
  $scope.tweet = {};
 // $scopet.tweet_pattern = "/^\W*(\w+\b\W*){2,}$/";
  

  myToken = JSON.parse(window.localStorage.getItem(twitterKey));

  $scope.$on('$ionicView.enter', function() {
     
      if (myToken === '' || myToken === null) {
        $scope.logged = false;
      }else{
        $scope.showHomeTimeline();
      }
  });
  
  if (myToken === '' || myToken === null) {
    $scope.logged = false;
  }else{
    $scope.logged = true;
    $ionicPlatform.ready(function() {              
          $scope.logged = true;
          $twitterApi.configure(clientId, clientSecret, myToken);
          $twitterApi.searchTweets(encodeURIComponent("FROM:googooradio OR @googooradio")).then(function(data) {
            $scope.home_timeline = data;
          });      
    });
  }

  $scope.signin = function(){
    return $ionicPlatform.ready(function() {       
        if (myToken === '' || myToken === null) {
          var options = { 'redirect_uri' : 'http://10.0.2.2/callback'}
          $cordovaOauth.twitter(clientId, clientSecret,options).then(function (succ) {
            myToken = succ;
            window.localStorage.setItem(twitterKey, JSON.stringify(succ));
            $twitterApi.configure(clientId, clientSecret, succ);
            $scope.showHomeTimeline();
            $scope.logged = true;
          }, function(error) {
            console.log(error);
          });
        } else {
          $scope.logged = true;
          $twitterApi.configure(clientId, clientSecret, myToken);
          $twitterApi.searchTweets(encodeURIComponent("FROM:googooradio OR @googooradio")).then(function(data) {
            $scope.home_timeline = data;
          });
        }
    });
  }

  $scope.showHomeTimeline = function() {
    $ionicLoading.show({
      template: 'Getting Tweets...'
    });
    $twitterApi.searchTweets(encodeURIComponent("FROM:googooradio OR @googooradio")).then(function(data) {
      //console.log(data);
      $scope.home_timeline = data;
      $ionicLoading.hide();
    },function(){
      $ionicLoading.hide();
    });
  };
   
  $scope.submitTweet = function() {
    $ionicLoading.show({
      template: 'Sending Tweet...'
    });
    $twitterApi.postStatusUpdate("@GooGooRadio " + $scope.tweet.message).then(function(result) {
      $scope.showHomeTimeline();
      $scope.tweet.message = '';
      $ionicLoading.hide();
    },function(){
      $ionicLoading.hide();
    });
  }
   
  $scope.doRefresh = function() {
    if (myToken === '' || myToken === null) {
        $scope.logged = false;
      }else{
        $scope.showHomeTimeline();
        $scope.$broadcast('scroll.refreshComplete');
      }
  };
   
  $scope.correctTimestring = function(string) {
    return new Date(Date.parse(string));
  };

});
