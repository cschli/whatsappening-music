$(document).ready(function () {
    //global variables
    var OAuthToken;
    var album_id;
    var track_url;
    var artist;
    var artist_picture;

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyC4Lopxflier0eeNKxefS9lRT14Cidv92E",
        authDomain: "chlauper-52373.firebaseapp.com",
        databaseURL: "https://chlauper-52373.firebaseio.com",
        projectId: "chlauper-52373",
        storageBucket: "",
        messagingSenderId: "254415066304"
    };
    firebase.initializeApp(config);

    var database = firebase.database();

    //on added entry, set local variable to a div element containing the artist, with a common class artist-entry
    database.ref().on("child_added", function (snapshot) {
        var artist_history_entry = $("<div>").text(snapshot.val().artist).addClass("artist-entry");
        $(".artist-history").append(artist_history_entry);
    })

    //on click of the history button, toggle visibility to history section of artists searched
    $(".history-button").on("click", function (response) {
        response.preventDefault();
        $(".artist-history").toggle();
    })

    //on click of the clear history button, reset firebase database to blank, and remove artists from history section
    //in the DOM
    $(".clear-history-button").on("click", function (response) {
        response.preventDefault();
        database.ref().set({
            artist: null
        })
        $(".artist-history").empty();
    })

    //on artist search button, do a whole bunch of things like...
    $(".artist-search-button").on("click", function (response) {
        response.preventDefault();
        //empty the artist profile to reset content inside it
        $(".artist-profile").empty();
        //set a slider variable that is appended to the artist profile
        var slider = $("<div>").addClass("slider");
        $(".artist-profile").append(slider);
        //assign the global variable artist the value of the search input
        artist = $(".artist-search-input").val();
        //create a database object for firebase to take in the artist string
        var databaseVal = {
            artist: artist
        }
        //push it up to firebase
        database.ref().push(databaseVal);
        //run the ajaxToken() method, which will eventually give the artist album preview from spotify,
        //the artist album art and profile picture from spotify
        ajaxToken();
        //run the newsApi() method, which will get a list of 20 articles that mention the artist in either the title
        //or the body, but then actually display up to 5 articles with the artist's name in the title;
        //also, the title is a link to the news source
        newsApi();

    })

    //news api function detail below...
    function newsApi() {
        //reset section, remove content
        $("#article-table").empty();
        //this local variable contains the uri for the API to hit, and will use the value from the artist variable
        var url = 'https://newsapi.org/v2/everything?sources=mtv-news,buzzfeed,entertainment-weekly,mashable,the-lad-bible,the-huffington-post,mirror&language=en&q='
         + artist + '&sortBy=publishedAt&apiKey=f585602033364272b3a51389129301fc';

        //sets local response variable as a new Request object, with the url variable from above...
        //not sure if this code is needed for anything.
        // var response = new Request(url);

        //ajax call using the url variable
        $.ajax({ url: url, method: "GET" }).done(function (response) {

            //local variable to track and cap output news results to 5
            var limitTo = 0;

            //the for loop gets all the info from each news articles
            for (var i = 0; i < response.articles.length; i++) {
                //gets the link to the news source
                var linkTo = Object.values(response.articles[i])[4];
                //creates a table element to store the short description of news article
                var describe = $("<td>");
                var description_text = response.articles[i].description;
                describe.text(description_text);
                //attach news article image url to a new img element
                var imgUrl = Object.values(response.articles[i])[5];
                //create local variable for title of article
                var title = response.articles[i].title;

                //if title (lower case everything) contains the string from global variable artist, and if limitTo is still
                //less than 5
                if (title.toLowerCase().includes(artist) && limitTo < 5) {

                    //append everything in this neat long row append
                    $("#article-table").append("<tr><th>" + "<a target='_blank' href='" + linkTo + "'>" + title + 
                    "</a>" + "</th></tr>" + "<tr><td>" + "<img src=" + imgUrl + 
                    "></img>" + "</td></tr>" + "<tr><td>" + description_text + "</td></tr>");
                    //increase limitTo by 1
                    limitTo++;
                }
                // empty form input content?
                $("form").trigger("reset");

                $(".card-body").attr("style", "background-color: black;");
            };
        })
    }

    //ajaxToken method in detail...
    function ajaxToken() {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://cors-anywhere.herokuapp.com/https://accounts.spotify.com/api/token",
            "method": "POST",
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic MjNmZWQ0ZDk5M2M4NDNkZGJmODUwMDYyNTc1NWEzYTc6N2M4ZTE1NmNhMGJhNGUzNjliYTQwM2ZiNDVlNjBmNjI="
            },
            "data": {
                "grant_type": "client_credentials"
            }
        }

        //make an ajax POST call to spotify, and get the OAuthToken, storing it in the global variable
        $.ajax(settings).then(function (response) {
            OAuthToken = response.access_token;
            //then run the ajaxSearchAlbum() method...
            ajaxSearchAlbum(OAuthToken, artist);
        });
    }

    //ajaxSearchAlbum method in detail...
    function ajaxSearchAlbum(token, artist) {
        //setting contains references to the artist variable, as well as the token received from the ajaxToken() output
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/search?query=" + 
            artist + "&offset=0&limit=20&type=artist",
            "method": "GET",
            "headers": {
                "Authorization": "Bearer " + token
            }
        }

        //the ajax GET call here here adds in the artist profile pic from spotify, then runs...
        //ajaxAlbumList() method and ajaxTopTrack() method...
        $.ajax(settings).then(function (response) {
            artist_id = response.artists.items[0].id;
            artist_picture = response.artists.items[0].images[0].url;
            var image_element = $("<img>");
            image_element.attr("src", artist_picture);
            image_element.attr("height", "400");
            var nested_img_element = $("<div>").append(image_element);
            $(".slider").append(nested_img_element);
            ajaxAlbumList(OAuthToken, artist_id);
            ajaxTopTrack(OAuthToken, artist_id);
        });

    }

    //ajaxAlbumList method in detail...
    function ajaxAlbumList(token, artist) {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/artists/" + artist + "/albums?market=US",
            "method": "GET",
            "headers": {
                "Authorization": "Bearer " + token
            }
        }
        //inserting each album image into profile BxSlider image section 
        //and enable the BxSlider library to create the proper image carousel 
        $.ajax(settings).done(function (response) {
            var albumNameArr = [];
            for (var i = 0; i < response.items.length; i++) {
                //this if statement helps to grab unique images by checking that the item pushed up into local array
                //set above filters out any additional images of the same name
                if (!albumNameArr.includes(response.items[i].name)) {
                    var album_img = response.items[i].images[0].url;
                    insert_album(album_img);
                    albumNameArr.push(response.items[i].name);
                }
            }
            //initiates BxSlider...
            initiateBxSlider();
        })
    }

    //ajaxTopTack method in detail...
    function ajaxTopTrack(token, artistId) {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/artists/" + 
            artistId + "/top-tracks?country=US",
            "method": "GET",
            "headers": {
                "Authorization": "Bearer " + token
            }
        }

        //grab the first album that is actually an album type of "album" (instead of singles), and open in album preview player
        $.ajax(settings).done(function (response) {
            for (var i = 0; i < response.tracks.length; i++) {
                if (response.tracks[i].album.album_type === "album") {
                    album_id = response.tracks[i].album.id;
                    var album_img = response.tracks[i].album.images[0].url;
                    break
                }
            }
            album_url = "https://open.spotify.com/embed/album/" + album_id;
            $("#iframe-play").attr("src", album_url);
        });
    }

    //inserts album pictuer into the BxSlider element
    function insert_album(album_img) {
        var image_element = $("<img>");
        image_element.attr("src", album_img);
        image_element.attr("height", "400");
        var nested_img_element = $("<div>").append(image_element);
        $(".slider").append(nested_img_element);
    }

    //initiates BxSlider with specific settings, including autoplay and specific width to maintain the square image
    //dimensions of most spotify pictures (except like...The Offspring, cos they're mean!)
    function initiateBxSlider() {
        $('.slider').bxSlider({
            auto: true,
            autoStart: true,
            mode: "horizontal",
            slideWidth: 420,
            adaptiveHeight: true
        });
    }

})





