window.onload = main;
let pageNumber = 0;

function main() {
    document.getElementById('prev').style.visibility ='hidden';
    getStories(pageNumber);
}

function nextPage(){
    pageNumber = pageNumber + 1;
    getStories(pageNumber);
    document.getElementById('prev').style.visibility ='visible';
}

function previousPage(){
    if (pageNumber==1)
    {
        document.getElementById('prev').style.visibility ='hidden';
    }
    
    pageNumber = pageNumber - 1;
    getStories(pageNumber);
}

function getStories(number) {
    fetch("/heartbreaks?pageNum=" + number)
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


function appendStory(container, story) {

    const elem = document.createElement('p');
    elem.appendChild(document.createTextNode(story.story));

    const nickname = document.createElement('p');
    nickname.appendChild(document.createTextNode('-' + story.nickname));
    nickname.style.color = "rgb(94,94,94)";

    const nested = document.createElement("div");
    nested.classList.add('card-text','story');
    nested.appendChild(elem);
    nested.appendChild(nickname);

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