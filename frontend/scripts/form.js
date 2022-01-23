document.getElementById('btn-submit').addEventListener("click", function() {
    var nick_txt = document.getElementById('default').value;
    var story_txt = document.getElementById('textarea').value;

    const body = JSON.stringify({
        nickname: nick_txt,
        story: story_txt
    })

    fetch("form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body
    })
    .then(res => {
        if(!res.ok) {
            console.error("Error uploading form")
        }
        window.location.href = "/";
    })
    .catch(err => console.error(err))
}); 


var btn = document.getElementById("btn-homepage");

btn.addEventListener("mouseover", function() {
    document.getElementById("btn-homepage").style.backgroundImage = "url(../assets/message_animation.gif)";
});

btn.addEventListener("mouseout", function() {
    document.getElementById("btn-homepage").style.backgroundImage = "url(../assets/message.png)";
});



