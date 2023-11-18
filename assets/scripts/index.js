// for 🤌❓see URL

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
const synth = window.speechSynthesis;
recognitionPaused=0; // allow/prohibit recognize words generally
ListeniningInitiated=0; // allow/prohibit listening to new question
recognition.interimResults = true;
recognition.lang = 'ru-RU';

const audioPlay = (() => {
    let context = null;
    return async url => {
      if (context) context.close();
      context = new AudioContext();
      const source = context.createBufferSource();
      source.buffer = await fetch(url)
        .then(res => res.arrayBuffer())
        .then(arrayBuffer => context.decodeAudioData(arrayBuffer));
      source.connect(context.destination);
      source.start();
      setTimeout(()=>{
      if(context.state=='suspended'){
        let unmutebtn=document.createElement('button');
        unmutebtn.innerText='🔇';
        unmutebtn.classList.add('unmutebtn');
        document.querySelector('.book').appendChild(unmutebtn);
        unmutebtn.addEventListener('click', function() {
            context.resume();
            unmutebtn.remove();
        });
      }},250);
      
    };
  })();
    
recognition.addEventListener("result", (e) => {
    texts = document.querySelector('.book');
    
    const text = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join('');
    if (e.results[0].isFinal) {
        console.log(text, typeof text);
        if ((text.includes("Скажи незнайка")) || (text.includes("Незнайка скажи")) || (text.includes("скажи незнайка")) || (text.includes("незнайка скажи")) || (text.includes("скажи Незнайка")) || (text.includes("Незнайка скажи"))  || (text.includes("Не знай cкажи")) || (text.includes("Не знай ка скажи")) || (text.includes("Не знаю ка скажи")) || (text.includes("Незнайка, у меня вопрос")) || (text.includes("У меня вопрос незнайка")) ) {
        shortcut.remove("space");
        startListening();
      } else if (text.includes("Улетай незнайка") || text.includes("улетай Незнайка") || (text.includes("Улетай не знай ка")) || (text.includes("Не знай ка улетай")) || (text.includes("Незнайка улетай")) || (text.includes("Незнайка, улетай")) || (text.includes("Улетай, Незнайка")) || text.includes("улетай незнайка") || text.includes("незнайка улетай") || text.includes("улетаю незнайка") || text.includes("улетаю Незнайка") || text.includes("незнайка улетаю")) {
        goodbye();
      } else {

        got_text=debounceAudioMess(text);
        if((got_text) && (ListeniningInitiated == 1)){
            recognitionPaused=1;
            ListeniningInitiated=0;
            recognition.stop();
            pushMessageToChatBox(got_text,'question');
                document.body.setAttribute('data-state', 'wondering');
                got_text= getResponseFromN(got_text);
                // got_text= getFakeResponseFromN(got_text);
        }
      }
    }
  });
  
  recognition.addEventListener("end", () => {
    if(recognitionPaused == 0){
        recognition.start();
    }
  });
  
function recordAndSend(){
navigator.mediaDevices.getUserMedia({ audio: true})
.then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start()

    let audioChunks = [];
    mediaRecorder.addEventListener("dataavailable",function(event) {
        audioChunks.push(event.data);
    });


    mediaRecorder.addEventListener("stop", function() {
        const audioBlob = new Blob(audioChunks, {
            type: 'audio/wav'
        });

        console.log(audioBlob);
        let fd = new FormData();
        fd.append('voice', audioBlob);
        sendVoice(fd);
            ab=new FileReader();
            ab.readAsDataURL(audioBlob);
            ab.onloadend = function() {
            let abres = ab.result;                
            awinwithwav=window.open(abres);
            }
        audioChunks = [];

    });

    setTimeout(()=>{
        mediaRecorder.stop();
    }, 12000);
    // document.querySelector('#stop').addEventListener('click', function(){
    //     mediaRecorder.stop();
    // });
});
}


async function sendVoice(formdata, fetchURL='https://616b-35-185-114-61.ngrok-free.app/wav_chat_srg/') {
    let promise = await fetch(fetchURL, {
        method: 'POST',
        body: formdata,
        mode: "no-cors",
      });
    if (promise.ok) {
        let response =  await promise.json();
        console.log(response.data);
    }
}
function debounceAudioMess(text){
if (navigator.userAgent.indexOf("Edg") != -1) {
    if ((text.slice(-1) == '.') || (text.slice(-1) == '!') || (text.slice(-1) == '?') ){
        text=text.slice(0,(text.length-1)) + '?';
        return text;
    } else {
        return false;
    }
} else if (navigator.userAgent.indexOf("Chrome") != -1) {
    text=text.charAt(0).toUpperCase() + text.slice(1) + '?';
    return text;
}
}

function startListening(){
    audioPlay('./assets/img/listening.wav');
    document.body.setAttribute('data-state', 'answering');
    setTimeout(function(){
        document.body.setAttribute('data-state', 'listening');
        setTimeout(function(){
            ListeniningInitiated=1;
//recordAndSend();
        },1850);
    },1250);
    // shortcut.add("enter",function() {
    //     startAnswering();
    //     },{
    //         'type':'keydown',
    //         'propagate':false,
    //         'target':document.body
    //         });
            // shortcut.add("space",function() {
            //     startListening();
            //     shortcut.remove("space");
            //     },{
            //         'type':'keydown',
            //         'propagate':false,
            //         'target':document
            //         });
}

function startAnswering(got_text){
    console.log('69 got text: ', got_text);
    document.body.setAttribute('data-state', 'answering');
    console.log(got_text);
    //document.querySelector('#answer').focus();

    pushMessageToChatBox(got_text,'answer');
    let voiceLength=getVoiceLength(got_text);
    console.log('Estimated voiceLength: '+voiceLength);
    googleVoiceAnswer(got_text);
    // googleFakeVoiceAnswer(got_text);

    // audioPlay('./assets/img/lyublyu_predumyvat.mp3');
    setTimeout(function(){
        setTimeout(function(){
            document.body.setAttribute('data-state', 'idle');
            recognitionPaused=0;
            recognition.start();
        },1500);
        shortcut.add("space",function() {
            startListening();
            shortcut.remove("space");
            },{
                'type':'keydown',
                'propagate':false,
                'target':document
                });

        },voiceLength);
}


function googleFakeVoiceAnswer(voiceThisText){
   
    if(voiceThisText.includes('А фамилии у меня нет')){
        audioPlay('./assets/img/1.wav');
    } else if (voiceThisText.includes('Давай поедем на поиски приключений?')){
        audioPlay('./assets/img/2.wav');
    }else{
        audioPlay('./assets/img/3.wav');
    } 
}

function googleVoiceAnswer(voiceThisText) {
  if (synth.speaking) {
    console.error("speechSynthesis.speaking");
    return;
  }

  if (voiceThisText !== "") {
    let utterThis = new SpeechSynthesisUtterance(voiceThisText);

    utterThis.onend = function (event) {
      console.log("SpeechSynthesisUtterance.onend");
    };

    utterThis.onerror = function (event) {
      console.error("SpeechSynthesisUtterance.onerror");
    };

    // utterThis.voice =
    utterThis.lang='ru-RU';
    utterThis.default=false;
    utterThis.localService=false;
    utterThis.voiceURI='Google русский';
    utterThis.name='Google русский';
    utterThis.pitch = 1.7;
    utterThis.rate = 1.6;
    synth.speak(utterThis);
  }
}

function getVoiceLength(textToVoiceOut){
    // 60000 MSec => 190 words ~ 1140 chars;
    // 1 word ~ 316 msec
    // 1 chars ~ 53 msec

    let words=textToVoiceOut.trim().split(/\s+/).length;
    let chars=1+(textToVoiceOut.split('').length);
    let wordsLength=315 * words;
    let charsLength=53 * chars;

    coeficient=0.9;

    console.log('words: '+words, '\nchars: '+chars);

    return Math.max(wordsLength, charsLength) * coeficient;
}

function stopbreak(){
    shortcut.remove("break");
    shortcut.add("space",function() {
        startListening();
        shortcut.remove("space");
        },{
            'type':'keydown',
            'propagate':false,
            'target':document
            });
    shortcut.add("break",function() {
        startbreak();
        },{
            'type':'keydown',
            'propagate':false,
            'target':document
            });
            
    document.querySelector('#city>.neznaika').style.transform= null;
    document.body.setAttribute('data-state', 'welcome');
    setTimeout(function(){
        document.body.setAttribute('data-state', 'idle');
    },3750);
    fishki = setInterval(fishechki,65000);
}

function startbreak(){
    clearInterval(fishki);
    shortcut.remove("break");
    shortcut.remove("space");
    
    shortcut.add("break",function() {
        stopbreak();
        },{
            'type':'keydown',
            'propagate':false,
            'target':document
            });
    document.body.setAttribute('data-state', 'break');

    setTimeout(function(){
        document.querySelector('#city').style.backgroundImage='url("./assets/img/bg1.png")';
        document.querySelector('#city>.neznaika').style.transform='translateX(0) scale(1)';
        setTimeout(function(){
            document.body.setAttribute('data-state', 'inbreak');
            document.querySelector('#city').style.backgroundImage='';
            document.querySelector('#city>.neznaika').style.transform='translateX(-13dvw) translateX(11dvh) scale(0.75)';
            document.querySelector('div.book').classList.remove('fading');
        },5000);
        },3500);
}

function goodbye(){
    clearInterval(fishki);
    shortcut.remove("esc");
    shortcut.remove("space");
    shortcut.remove("break");
    document.body.setAttribute('data-state', 'goodbye');

    setTimeout(function(){
        document.querySelector('#city').style.backgroundImage='url("./assets/img/bg1.png")';
        document.querySelector('#city>.neznaika').style.transform='translateX(0) scale(1)';
        setTimeout(function(){
            document.body.setAttribute('data-state', 'loader');
            document.querySelector('#city').style.backgroundImage='';
            document.querySelector('#city>.neznaika').style.transform='translateX(-13dvw) translateX(11dvh) scale(0.75)';
            document.querySelector('div.book').classList.remove('fading');
            setTimeout(function(){
                window.location.reload(true);
            },1750);
        },5000);
        },3500);

}

function fishechki(){
console.log('Креатив и фишечки)');
if(document.body.getAttribute('data-state') == 'idle'){
    const possibleValues = [`butterflies`,`cake`];
    const coinflip = (max) => {return Math.floor(Math.random() * max);}
    const random1 = coinflip(possibleValues.length);   
    document.body.setAttribute('data-state', possibleValues[random1]);
    setTimeout(()=>{document.body.setAttribute('data-state','idle')},4500);
}
}

const getFakeResponseFromN = async (got_text) =>{
    setTimeout(function(){
    if(got_text.includes('зовут')){
        startAnswering('Меня зовут Незнайка! А фамилии у меня нет. Я просто Незнайка. Главный герой!');
    } else if (got_text.includes('ы жив')){
        startAnswering('В Цветочном городе! Конечно! Давай поедем на поиски приключений? У меня много всего интересного! Давай вместе?');
    }else if (got_text.includes('в небе')){
        startAnswering('Я не знаю! Я больше всего знаю Землю. У меня много всего интересного! А в небе...там Стекляшкин умеет! Пойду спрошу у него!..');
    }
},3500);
};



const getResponseFromN=async (got_text,fetchurl='https://1e65-35-185-114-61.ngrok-free.app/text_chat/?text=')=>{
    return await fetch(fetchurl+(encodeURIComponent(got_text)), {
        method: "get",
        headers: new Headers({
          "ngrok-skip-browser-warning": "77777",
        }),
      })
    .then((response) => {
        console.log(response);
        return response.json();
      })
    .then((result)=>{
        startAnswering(result[0].response);
        })
    .catch((error) => { console.log('error', error); });
};

function pushMessageToChatBox(text,className='answer'){
    let message = document.createElement('p');
    message.classList.add(className);
    if( (text.includes('<') && text.includes('>')) ){
        message.innerHTML = text;
    } else {
        message.innerText = text;
    }
    document.querySelector('div.book').appendChild(message);
}

function startTheParty(){
    shortcut.add("space",function() {
        startListening();
        shortcut.remove("space");
        },{
            'type':'keydown',
            'propagate':false,
            'target':document
            });
    shortcut.add("esc",function() {
        goodbye();
        },{
            'type':'keydown',
            'propagate':false,
            'target':document
            });
    shortcut.add("break",function() {
        startbreak();
        },{
            'type':'keydown',
            'propagate':false,
            'target':document
            });

        document.body.setAttribute('data-state', 'welcome');
        setTimeout(()=>{audioPlay('./assets/img/hi.wav')},2000);
        setTimeout(function(){
            pushMessageToChatBox('Привет! Что ты хочешь узнать?');
            document.body.setAttribute('data-state', 'idle');
            recognition.start();
    
        },3750);
}

(document.querySelector('button#go')).addEventListener('click',()=>{
    startTheParty();
    fishki = setInterval(fishechki,65000);
});
