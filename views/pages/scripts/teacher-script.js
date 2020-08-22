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
            let postCount = 0;
            data.forEach((post) => {
                //create a spacer
                spacer = document.createElement("div")
                $(spacer).addClass("postSpacer");
                //create card
                div = document.createElement('div');
                //create delete button
                $("#postDiv").append(div);
                $("#postDiv").append(spacer);
                $(div).addClass(`uk-card uk-card-default post${postCount}`).html(`<h3 class="uk-heading-bullet" id="postTitle">${post.title}</h3>`);
                $(div).append(`<button type="submit" class="btn btn-danger" name="${post.link}">Delete</button>`)
                //create larger div to hold grid
                $(div).append(`<div id="bigGroup${postCount}" class="uk-grid uk-child-width-expand uk-grid-match" uk-grid></div>`);
                $(`#bigGroup${postCount}`).appendTo(`.post${postCount}`);
                //create two child divs that will hold content
                $(div).append(`<div id="grouper${postCount}" class="left-grid"><div>`);
                $(div).append(`<div id="grouper2${postCount}" class="right-grid"><div>`);
                $(`#grouper${postCount}`).appendTo(`#bigGroup${postCount}`);
                $(`#grouper2${postCount}`).appendTo(`#bigGroup${postCount}`);
                //add individual components and then add each to the parent div
                $(div).append(`<h4 id="grid1${postCount}">Description of Music</h4>`);
                $(`#grid1${postCount}`).appendTo(`#grouper${postCount}`)
                $(div).append(`<h5 class="postDescription" id="grid2${postCount}">${post.description}</h5>`);
                $(`#grid2${postCount}`).appendTo(`#grouper${postCount}`)
                $(div).append(`<h5 class="link-to-music" id="grid3${postCount}">Link to music:</h5>`);
                $(`#grid3${postCount}`).appendTo(`#grouper${postCount}`)
                $(div).append(`<a class="postLink grid-unit" id="grid4${postCount}" target="_black" href="${post.link}">${post.link}</a>`);
                $(`#grid4${postCount}`).appendTo(`#grouper${postCount}`)

                $(div).append(`<div id="preview${postCount}" class="preview"><a class="normal" href="${post.link}"><img src="${post.link}" width="100%" height="100%" alt="Preview not available, please follow link"></a></div>`);
                $(`#preview${postCount}`).appendTo(`#grouper2${postCount}`)
                //
                postCount++;
            })
        } else console.log("no posts");
        //add delete btn events
        addBtnEvent();
    });

})


function addBtnEvent() {
    const deleteBtns = document.querySelectorAll(".btn");
    deleteBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            let link = $(btn).attr("name");
            alert(link);
            let ajaxReq; //sometimes declaring and initializing has issues
            ajaxReq = $.ajax({
                url: "/deletePost?link=" + link, //name of the route
                type: 'GET',
                datatype: "json",
                data: "" //we're not sending
            });

            ajaxReq.done(function (data) {
                if (data === "yes") {
                    location.reload();
                    return false;
                } else if (data === "no") {
                    console.log("nothing was deleted")
                }
            })

        })

    })
}