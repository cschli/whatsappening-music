$(document).ready(function () {

    $("#addArtist").on("click", function searchArtist() {
        console.log("Hi");

        event.preventDefault()

        $("#article-table").empty();

        var q = $("#artist-input").val();

        if(q == 0){

            return;false
        }

        console.log(q);

        var url = 'https://newsapi.org/v2/everything?sources=mtv-news,buzzfeed,entertainment-weekly,mashable,the-lad-bible,the-huffington-post,mirror&language=en&q=' + q + '&sortBy=publishedAt&apiKey=f585602033364272b3a51389129301fc';

        var response = new Request(url);

        $.ajax({ url: url, method: "GET" })

            .done(function (response) {

                console.log(response);

                var limitTo = 0

                for (var i = 0; i < response.articles.length; i++) {

                    var linkTo = Object.values(response.articles[i])[4];

                    var headline = $("<th>");

                    console.log(linkTo);

                    console.log(response.articles[i].title);

                    var describe = $("<td>");

                    describe.text(response.articles[i].description);

                    console.log(response.articles[i].description);

                    var imgUrl = Object.values(response.articles[i])[5];

                    console.log(imgUrl);

                    var articleImg = $("<img>");

                    articleImg.attr("src", imgUrl);

                    var articleDiv = $("<div>");


                    console.log(typeof(response.articles[i].title));

                    var title = response.articles[i].title;
                    console.log(q);
                    console.log(title);
                    console.log(title.toLowerCase().includes(q));
                    
                    if(title.toLowerCase().includes(q) && limitTo < 5){
                    
                    

                    articleDiv.append(headline);
                    articleImg.appendTo(articleDiv);
                    articleDiv.append(articleImg);
                    

                    $("#article-table").append("<tr><th>" + "<a target='_blank' href='" + linkTo + "'>" + response.articles[i].title + "</a>" + "</th></tr>" + "<tr><td>" + "<img src=" + Object.values(response.articles[i])[5] + "></img>" + "</td></tr>" + "<tr><td>" + response.articles[i].description + "</td></tr>")

                    limitTo++


                    }
                    $("form").trigger("reset");
                   
                    
                }
            });
    });

}); 