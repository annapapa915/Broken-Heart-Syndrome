// Function that handles submission button of forms
document.getElementById('btn-submit').addEventListener("click", function() {
    var nick_txt = document.getElementById('default').value;
    var story_txt = document.getElementById('textarea').value;
    var warning_text =  document.getElementById('warning');

    // Displays warnings in case the character limits are not followed by the user
    // Makes sure the nickname is correct first and then displays subsequent warnings for stories
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

    // Handles captcha received after pressing the submission button 
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
                    if (res.status==406)
                        warning_text.appendChild(document.createTextNode('⚠️Slurs are not tolerated here!'));
                    console.error(res)
                    return;
                }

                // Redirects to index page
                window.location.href = "/";
            })
            .catch(err => console.error(err))
        });
    });
}); 

// Functions that handle button returning to homepage
const btn = document.getElementById("btn-homepage");

btn.addEventListener("mouseover", function() {
    btn.style.backgroundImage = "url(../assets/message_animation.gif)";
});

btn.addEventListener("mouseout", function() {
    btn.style.backgroundImage = "url(../assets/message.png)";
});