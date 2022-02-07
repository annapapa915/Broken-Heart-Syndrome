window.onload = main;
// Current page number
let pageNumber = 0;
// Can be new/old/likes
let sort = "new";

function main() {
    document.getElementById('prev').style.visibility ='hidden';
    getStories(pageNumber);
}

// Function for sorting buttons on top left corner of page
function onSortClick(btn) {
    // If button is already pressed, then do nothing
    if(btn.id === sort) return;

    // Handles css for sorting buttons
    document.getElementById(sort).classList.remove("pressed");
    btn.classList.add("pressed");
    // Change global sort to the id of the new button pressed
    sort = btn.id;

    // Return stories according to button pressed by user
    getStories(pageNumber, sort)
}

// Function for next page button in pagination
function nextPage(){
    pageNumber = pageNumber + 1;
    getStories(pageNumber, sort);
    document.getElementById('prev').style.visibility ='visible';
}

// Function for previous page button in pagination
function previousPage(){
    if (pageNumber==1) document.getElementById('prev').style.visibility ='hidden';
    pageNumber = pageNumber - 1;
    getStories(pageNumber, sort);
}

// Function that receives the stories from the backend and displays them 
function getStories(number, orderBy) {
    // By default, orders by latest
    if(orderBy == null) orderBy = "new";

    fetch(`/heartbreaks?pageNum=${number}&sortBy=${orderBy}`)
        .then(res => res.json())
        .then(data => {
            const storiesContainer = document.getElementById("stories") 
            // When it reaches the last story, make next button hidden
            if (data.isLast)
                document.getElementById('next').style.visibility ='hidden';
            else
                document.getElementById('next').style.visibility ='visible';

            // Displays current page the user is on
            var paragraph = document.getElementById("current");
            // First page need to be page 1
            paragraph.innerText=pageNumber+1;

            // Clear storiesContainer
            while (storiesContainer.firstChild) {
                storiesContainer.removeChild(storiesContainer.lastChild);
            }

            // Add stories to page
            for (i=0; i<data.stories.length; i++)
                addStory(storiesContainer, data.stories[i]);
        })
        .catch(err => console.error(err))
}

// Creates a grid layout for stories and adds them there
function addStory(storiesContainer, story) {
    // Creates 4 columns in each row 
    // Meaning a maximum of four stories per row
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
    } 
    // Append stories to the container created
    else {
        appendStory(storiesContainer.lastChild.lastChild, story);
    }
}

// Function that writes html code in javascript to show the stories we got from the database
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
    // Stores the ids of the stories the user has liked in his local storage
    // If the local storage does not contain the story liked, then it saves it there
    if (localStorage.getItem(story.id) === null) {
        heart_emoji = "assets/empty_heart_emoji.png";

        img.addEventListener("click", function(e) {
            fetch("/likes?id=" + story.id, { method: "POST" })
                .then(res => {
                    if (!res.ok) throw new Error(res);

                    // works like a hashtable ;)
                    localStorage.setItem(story.id, 'true');

                    story.likes++;
                    // shows the number of likes each story has
                    numoflikes.replaceChild(document.createTextNode(story.likes + ' hearts'), numoflikes.childNodes[0])
                    
                    e.target.src = "/assets/filled_heart_emoji.png";
                    // disables the button once the user has pressed like
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


// Functions that handle button returning to homepage
const btn = document.getElementById("btn-homepage");

btn.addEventListener("mouseover", function() {
    btn.style.backgroundImage = "url(../assets/message_animation.gif)";
});

btn.addEventListener("mouseout", function() {
    btn.style.backgroundImage = "url(../assets/message.png)";
});



