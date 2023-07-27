
//Import icons from assets
import bot from './assets/bot.svg'   //for bot
import user from './assets/user.svg' //for user


//Target out html element manually by document.querySelector
const form = document.querySelector('form')
//Id selector #chat_container(previous use in html container)
const chatContainer = document.querySelector('#chat_container')

let loadInterval

//A functionn which going to lode my massages
function loader(element) {  //it take an element and return something
    element.textContent = '' //Ensure it is empty at the start

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);//Every 300mili seconds Ihave to do something(repet every 300 miliseconds)
}

//Typing functionalaty
function typeText(element, text) {     //Except the elements and text parameter
    let index = 0

    let interval = setInterval(() => {    //Set an interval
        if (index < text.length) {        //If still typing
            element.innerHTML += text.charAt(index)
            index++
        } else {   //If we reacthed the end of the text
            clearInterval(interval)  //Simply clear the interval
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();     //For unique id I use current time and date
    const randomNumber = Math.random(); //For more ramdom
    const hexadecimalString = randomNumber.toString(16); //Even more random I use hexadecimal string.(16 charecters)

    return `id-${timestamp}-${hexadecimalString}`; //Return id with template string
}

//Get coupe of parameter
function chatStripe(isAi, value, uniqueId) { //Is it ai speaking or us
    return (   //Return a template string(not a regular string because I cannot create spaces and enters)
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                     <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault()  //Prevent the default behaviour of loding of the browser

    const data = new FormData(form)  //Get the date typed into the form

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt')) //I passes false because it is not ai it's us

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId() //Generate a unique id for its massage
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId) //Its true because ai is typing

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."   (Turn on the loader)
    loader(messageDiv)
//Fetch the data from the server -> bot's responce
    const response = await fetch('https://dr-debayanai.onrender.com', {
        method: 'POST',        //Object containing all of the objects
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({      //Pass out valuable body
            prompt: data.get('prompt') //This the data of our massage comming from our text area element on the screen
        })
    })
//After getting the responce I want clear the interval
    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json(); //This is giving the actual responce comming from the backend
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData)
    } else {   //If I have an error
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}

form.addEventListener('submit', handleSubmit) //A lisntner for submit event
form.addEventListener('keyup', (e) => {       //Submit simple using the enter key
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})