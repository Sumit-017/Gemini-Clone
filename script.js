const typingForm = document.querySelector(".typing-form");
const ChatList = document.querySelector(".chat-list");
const ToggleThemeButton = document.querySelector("#toggle-theme-button");
const DeleteChatButton = document.querySelector("#delete-chat-button");
const Suggestions = document.querySelectorAll(".suggestion-list  .suggestions")

let UserMessage = null;
let isResponseGenerating = false;

const API_KEY = "";
const Api_url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const loadlocalStoragedata = ()=>{
  const savedChats = localStorage.getItem("savedChats");
  const isLightMode = (localStorage.getItem("themeColor") === "light_mode"); 
  document.body.classList.toggle("light_mode", isLightMode);
  ToggleThemeButton.innerText = isLightMode? "dark_mode" : "light_mode";
  ChatList.innerHTML = savedChats || "";
  document.body.classList.toggle("hide-header", savedChats);
  ChatList.scrollTo(0, ChatList.scrollHeight);
}
loadlocalStoragedata();

const createMessageElement =(content, ...classes)=>{
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const showTypingEffect=(text, textElement, incomingMessageDiv)=>{
  const word = text.split(' ');
  let currentWordIndex = 0;

  const typingInterval = setInterval(()=>{
    textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + word[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");
    if (currentWordIndex === word.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("savedChats", ChatList.innerHTML);
      ChatList.scrollTo(0, ChatList.scrollHeight);
    }
    ChatList.scrollTo(0, ChatList.scrollHeight);
  },80) 
}

const GenerateApiResponse = async (incomingMessageDiv)=>{
  const textElement = incomingMessageDiv.querySelector(".text")
  try{
    const response = await fetch(Api_url, {
      method: "POST",
      headers:{'Content-Type' : 'application/json'},
      body:JSON.stringify({
        contents: [{
          "role": "user",
              "parts":[{"text": UserMessage}]
        }]
      })
    });

    const data = await response.json();
    if(!response.ok) throw new Error(data.error.message)
    const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);
    
  }catch{
    isResponseGenerating = false;
    textElement.innerText = error.message ;
    textElement.classList.add("error");
    
  }finally{
    incomingMessageDiv.classList.remove("loading");
  }
}


const ShowLoadingAnimation =()=>{
  const html = `<div class="message-content">
                <img src="images/gemini.svg" alt="User Image" class="avatar">
                <p class="text">
                 
                </p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
            </div>
            <span onclick="CopyMessage(this)" class="icon material-symbols-rounded" >content_copy</span>`;
  const incomingMessageDiv =  createMessageElement(html, "incoming", "loading");
  ChatList.appendChild(incomingMessageDiv);
  ChatList.scrollTo(0, ChatList.scrollHeight);
  GenerateApiResponse(incomingMessageDiv);
}


const handelOutgoingChat = () => {
  UserMessage = typingForm.querySelector(".typing-input").value.trim() || UserMessage;
  if (!UserMessage || isResponseGenerating) return;
  isResponseGenerating = true;
  const html = `<div class="message-content">
                <img src="images/user.jpg" alt="User Image" class="avatar">
                <p class="text">
                </p>
            </div>`;
  const OutgoingMessageDiv =  createMessageElement(html, "outgoing");
  OutgoingMessageDiv.querySelector(".text").innerText = UserMessage;
  ChatList.appendChild(OutgoingMessageDiv);

  typingForm.reset();
  ChatList.scrollTo(0, ChatList.scrollHeight);
  document.body.classList.add("hide-header");
  setTimeout(ShowLoadingAnimation, 500)
};

typingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handelOutgoingChat();
});

const CopyMessage =(copyIcon)=>{
  const messageText = copyIcon.parentElement.querySelector('.text').innerText;
  navigator.clipboard.writeText(messageText);
  copyIcon.innerText = "done";
  setTimeout(()=> copyIcon.innerText = "content_copy",1000)
}

ToggleThemeButton.addEventListener("click", ()=>{
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode? "light_mode" : "dark_mode" );
  ToggleThemeButton.innerText = isLightMode? "dark_mode" : "light_mode";
})

DeleteChatButton.addEventListener("click", ()=>{
  if(confirm("Are you sure want to delete this chat ?"))
  localStorage.removeItem('savedChats');
  loadlocalStoragedata();
})

Suggestions.forEach(suggestion  =>{
  suggestion.addEventListener("click", ()=>{ 
    UserMessage = suggestion.querySelector(".text").innerText;
    handelOutgoingChat();
   })
});
  