$(document).ready(() => {

    let ajaxReq; //sometimes declaring and initializing has issues
    ajaxReq = $.ajax({
        url: "/getPosts", //name of the route
        type: 'GET',
        datatype: "json",
        data: "" //we're not sending
    });

    ajaxReq.done(function (data) {
        //change car color in front end with the data
        if (data) {
            console.log("got the posts in the front end")
            data.forEach((post) => {
                //create a spacer
                spacer = document.createElement("div")
                $(spacer).addClass("postSpacer");
                div = document.createElement('div');
                $(div).addClass("uk-card uk-card-default").html(`<h3 class="uk-heading-bullet" id="postTitle">${post.title}</h3>`);
                $(div).append(`<h5 class="postDescription">${post.description}</h5>`);
                $(div).append(`<a class="postLink" target="_black" href="${post.link}">${post.link}</a>`);
                $(div).append(`<div class="preview"><object class="thumbnail" type="text/html" data="${post.link}" 
                width="700px" height="250px" style="overflow:auto"></object></div>`); 
                $("#postDiv").append(div);
                $("#postDiv").append(spacer);
            })
        } else console.log("no posts");
    });
})
