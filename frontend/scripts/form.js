document.getElementById('btn-submit').addEventListener("click", function() {
    var nick_txt = document.getElementById('default').value;
    var story_txt = document.getElementById('textarea').value;
    var warning_text =  document.getElementById('warning');

    if (warning_text.childNodes.length>0)
        warning_text.removeChild(warning_text.childNodes[0]);

    if (nick_txt.length>15 || nick_txt.length<4){
        warning_text.appendChild(document.createTextNode('⚠️Warning! Nickname should be between 4 to 15 characters!'));
        return;
    }

    if (story_txt.length>800 || story_txt.length<40){
        warning_text.appendChild(document.createTextNode('⚠️Warning! Story text should be between 40 to 800 characters!'));
        return;
    }


    grecaptcha.ready(function() {
        grecaptcha.execute('6Le5hjEeAAAAABoD-nVFZUMomZJGTGVtQs_WPB1v', {action: 'submit'}).then(function(token) {
            const body = JSON.stringify({
                nickname: nick_txt,
                story: story_txt,
                recaptchaToken: token
            })

            fetch("form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: body
            })
            .then(res => {
                if(!res.ok) {
                    console.error(res)
                    return;
                }
                window.location.href = "/";
            })
            .catch(err => console.error(err))
        });
    });
}); 


var btn = document.getElementById("btn-homepage");

btn.addEventListener("mouseover", function() {
    document.getElementById("btn-homepage").style.backgroundImage = "url(../assets/message_animation.gif)";
});

btn.addEventListener("mouseout", function() {
    document.getElementById("btn-homepage").style.backgroundImage = "url(../assets/message.png)";
});



