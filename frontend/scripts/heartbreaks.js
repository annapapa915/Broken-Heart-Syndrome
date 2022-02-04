window.onload = main;
let pageNumber = 0;
let sort = "new";

function main() {
    document.getElementById('prev').style.visibility ='hidden';
    getStories(pageNumber);
}

function onSortClick(btn) {
    if(btn.id === sort) return;

    document.getElementById(sort).classList.remove("pressed");
    btn.classList.add("pressed");
    sort = btn.id;

    getStories(pageNumber, sort)
}

function nextPage(){
    pageNumber = pageNumber + 1;
    getStories(pageNumber, sort);
    document.getElementById('prev').style.visibility ='visible';
}

function previousPage(){
    if (pageNumber==1)
    {
        document.getElementById('prev').style.visibility ='hidden';
    }
    
    pageNumber = pageNumber - 1;
    getStories(pageNumber, sort);
}

function getStories(number, orderBy) {
    if(orderBy == null) orderBy = "new";

    fetch(`/heartbreaks?pageNum=${number}&sortBy=${orderBy}`)
        .then(res => res.json())
        .then(data => {
            const storiesContainer = document.getElementById("stories") 
            if (data.isLast) {
                document.getElementById('next').style.visibility ='hidden';
            }
            else{
                document.getElementById('next').style.visibility ='visible';
            }

            var paragraph = document.getElementById("current");
            paragraph.innerText=pageNumber+1;

            while (storiesContainer.firstChild) {
                storiesContainer.removeChild(storiesContainer.lastChild);
            }

            for (i=0; i<data.stories.length; i++)
                addStory(storiesContainer, data.stories[i]);
        })
        .catch(err => console.error(err))
}

function addStory(storiesContainer, story) {
    if(storiesContainer.lastChild == null || storiesContainer.lastChild.lastChild.childNodes.length === 4) {
        // Create row div
        const rowContainer = document.createElement("div")
        rowContainer.classList.add("row");

        // Add column to row div
        appendStory(rowContainer, story);

        // Create container
        const container = document.createElement("div")
        container.classList.add("container","mt-2");
        
        // Add row div to div
        container.appendChild(rowContainer);
        
        // Add container
        storiesContainer.appendChild(container);
    } else {
        appendStory(storiesContainer.lastChild.lastChild, story);
    }
}

var btn = document.getElementById("btn-homepage");

btn.addEventListener("mouseover", function() {
    document.getElementById("btn-homepage").style.backgroundImage = "url(../assets/message_animation.gif)";
});

btn.addEventListener("mouseout", function() {
    document.getElementById("btn-homepage").style.backgroundImage = "url(../assets/message.png)";
});



function appendStory(container, story) {

    const date = document.createElement('p');
    const storyDate = story.date;
    date.appendChild(document.createTextNode(storyDate.substring(0, 10)));

    const elem = document.createElement('p');
    elem.appendChild(document.createTextNode(story.story));

    const nickname = document.createElement('p');
    nickname.appendChild(document.createTextNode('-' + story.nickname));
    nickname.style.color = "rgb(94,94,94)";

    var img = document.createElement("img");
    img.style.width = '50px';
    img.style.height = '40px';
    img.classList.add('emoji');

    let heart_emoji = "/assets/filled_heart_emoji.png"
    if (localStorage.getItem(story.id) === null) {
        heart_emoji = "assets/empty_heart_emoji.png";

        img.addEventListener("click", function(e) {
            fetch("/likes?id=" + story.id, { method: "POST" })
                .then(res => {
                    if (!res.ok) throw new Error(res);

                    localStorage.setItem(story.id, 'true');

                    story.likes++;
                    numoflikes.replaceChild(document.createTextNode(story.likes + ' hearts'), numoflikes.childNodes[0])
                    
                    e.target.src = "/assets/filled_heart_emoji.png";
                    e.target.removeEventListener('click', arguments.callee)

                })
                .catch(err => console.error(err))
        });
    }

    img.src = heart_emoji;
    const like_emoji = document.createElement('div');
    like_emoji.appendChild(img);

    const statistics = document.createElement('div');
    const numoflikes = document.createElement('p');
    numoflikes.appendChild(document.createTextNode(story.likes + ' hearts'));
    numoflikes.classList.add('counter');

    statistics.classList.add('d-flex','justify-content-between');
    statistics.appendChild(like_emoji);
    statistics.appendChild(numoflikes);
  
    const nested = document.createElement("div");
    nested.classList.add('card-text','story');
    nested.appendChild(date);
    nested.appendChild(elem);
    nested.appendChild(nickname);
    nested.appendChild(statistics);

    const nested2 = document.createElement("div");
    nested2.classList.add('card', 'bg-transparent', 'border-0');
    nested2.style="width: 18rem;";
    nested2.appendChild(nested);

    const nested3 = document.createElement("div");
    nested3.classList.add('d-flex', 'justify-content-start');
    nested3.appendChild(nested2);

    const nested4 = document.createElement("div");
    nested4.classList.add('col-sm', "mt-4");
    nested4.appendChild(nested3);

    container.appendChild(nested4);
}

