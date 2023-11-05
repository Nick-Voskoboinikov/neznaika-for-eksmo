 const URL = '/api/neznaika';  // 🤌❓

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognitionPaused=0;
ListeniningInitiated=0;
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
        console.log('ListeniningInitiated=', ListeniningInitiated);
        console.log('recognitionPaused=', recognitionPaused);
        ListeniningInitiated=1;
        if ((text.includes("Скажи незнайка")) || (text.includes("Незнайка скажи")) || (text.includes("скажи незнайка")) || (text.includes("незнайка скажи")) || (text.includes("скажи Незнайка")) || (text.includes("Незнайка скажи"))  || (text.includes("Не знай cкажи")) || (text.includes("Не знай ка скажи")) || (text.includes("Не знаю ка скажи")) || (text.includes("Незнайка, у меня вопрос")) || (text.includes("У меня вопрос незнайка")) ) {
        shortcut.remove("space");
        startListening(URL);
      } else if (text.includes("Улетай незнайка") || (text.includes("Улетай не знай ка")) || (text.includes("Не знай ка улетай")) || (text.includes("Незнайка улетай")) || (text.includes("Незнайка, улетай")) || (text.includes("Улетай, Незнайка"))) {
        goodbye();
      } else {

        got_text=debounceAudioMess(text);
        if((got_text) && (ListeniningInitiated == 1)){
            recognitionPaused=1;
            ListeniningInitiated=0;
            recognition.stop();
            userquestion = document.createElement('p');
            userquestion.classList.add('question');
            texts.appendChild(userquestion);
            userquestion.innerText = got_text;
            
            setTimeout(function(){
                document.body.setAttribute('data-state', 'wondering');
                startAnswering(URL,got_text)
                recognitionPaused=0;
                ListeniningInitiated=1;
                recognition.start();
            },2000);

        }
      }
    }
  });
  
  recognition.addEventListener("end", () => {
    if(recognitionPaused == 0){
        recognition.start();
    }
  });

  
  
  
function recordAndSend(URL){
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

        let fd = new FormData();
        fd.append('voice', audioBlob);
        sendVoice(fd);
        audioChunks = [];
    });

    setTimeout(()=>{
        mediaRecorder.stop();
    }, 20000);
    // document.querySelector('#stop').addEventListener('click', function(){
    //     mediaRecorder.stop();
    // });
});
}

function debounceAudioMess(text){
if ((text.slice(-1) == '.') || (text.slice(-1) == '!') || (text.slice(-1) == '?') ){
    text=text.slice(0,(text.length-1)) + '?';
    return text;
 } else {
    return false;
 }
}

async function sendVoice(form, URL) {
    let promise = await fetch(URL, {
        method: 'POST',
        body: form});
    if (promise.ok) {
        let response =  await promise.json();
        console.log(response.data);
        let audio = document.createElement('audio');
        audio.src = response.data;
        audio.controls = true;
        audio.autoplay = true;
        document.querySelector('#messages').appendChild(audio);
    }
}

function startListening(URL){
    audioPlay('./assets/img/listening.mp3');
    document.body.setAttribute('data-state', 'answering');
    setTimeout(function(){
        document.body.setAttribute('data-state', 'listening');
    },1250);
// recordAndSend(URL);
    // shortcut.add("enter",function() {
    //     startAnswering();
    //     },{
    //         'type':'keydown',
    //         'propagate':false,
    //         'target':document.body
    //         });
    shortcut.add("space",function(URL) {
        ListeniningInitiated=1;
        startListening(URL);
        shortcut.remove("space");
        },{
            'type':'keydown',
            'propagate':false,
            'target':document
            });
}

function startAnswering(URL,got_text){
    // shortcut.remove("enter");
    document.body.setAttribute('data-state', 'answering');
    //document.querySelector('#answer').focus();

    let texts = document.querySelector('.book');
    let answer = document.createElement('p');
    answer.classList.add('answer');
    texts.appendChild(answer);
    answer.innerText = `Я люблю придумывать разные приключения и путешествовать! Мечтаю полететь ещё раз на Луну и даже на Марс! Хочу увидеть космос и другие планеты. Это так интересно!`;
    audioPlay('./assets/img/lyublyu_predumyvat.mp3');
    setTimeout(function(URL){
        // document.querySelector('.answer').innerText='';
        // document.querySelector('.answer').value=''; // 🤔

        setTimeout(function(){
            document.body.setAttribute('data-state', 'idle');
        },13500);
        shortcut.add("space",function() {
            startListening(URL);
            shortcut.remove("space");
            },{
                'type':'keydown',
                'propagate':false,
                'target':document
                });

        },20000);
}

function goodbye(){
    clearInterval(fishki);
    shortcut.remove("esc");
    shortcut.remove("space");
    document.body.setAttribute('data-state', 'goodbye');

    setTimeout(function(){
        document.querySelector('#city').style.backgroundImage='url("./assets/img/bg1.png")';
        document.querySelector('#city>.neznaika').style.transform='translateX(0) scale(1)';
        setTimeout(function(){
            document.body.setAttribute('data-state', 'loader');
            document.querySelector('#city').style.backgroundImage='';
            document.querySelector('#city>.neznaika').style.transform='translateX(-18vw) scale(0.75)';
            },5000);
        },3500);

}

function fishechki(){
// console.log('Креатив и фишечки)');
    // if((((document.querySelector('section#listening')).style).display != 'flex') && (((document.querySelector('section#answering')).style).display != 'flex') && (((document.querySelector('section#goodbye')).style).display != 'flex') && (((document.querySelector('section#loader')).style).display != 'flex')){
        
    // if(! document.querySelector('section#idles>img.neznaika')){
    //     let neznaikaCaster = document.createElement('img');
    //     neznaikaCaster.alt = 'Незнайка';
    //     neznaikaCaster.title = 'Незнайка';
    //     neznaikaCaster.classList.add('neznaika');
    //     neznaikaCaster.src = './assets/img/cake_magician.gif';
    //     (document.querySelector('section#idles')).append(neznaikaCaster);
    //     let happybirthday = document.createElement('img');
    //     happybirthday.alt = 'С днём рожения, Николай Носов!';
    //     happybirthday.title = 'С днём рожения, Николай Носов!';
    //     happybirthday.id = 'happy_birthday';
    //     happybirthday.classList.add('hb');
    //     happybirthday.src = './assets/img/hb.svg';
    //     (document.querySelector('section#idles')).append(happybirthday);
    // } else {
    //     document.querySelector('#idles > img.neznaika').src = './assets/img/cake_magician.gif';
    //     document.querySelector('#happy_birthday').classList.add('hb');        
    // }

    //     hideAllSections();
    //     document.querySelector('section#idles').style.display='flex';

    //     window.setTimeout(function(){
    //         hideAllSections();
    //         document.querySelector('#idles > img.neznaika').src = '';
    //         document.querySelector('#happy_birthday').classList.remove('hb');  
    //         (document.querySelector('section#idle')).style.display='flex';
    //     },5000);
    // }
}

document.addEventListener('DOMContentLoaded',function(URL){
    setTimeout(function(){
        document.body.setAttribute('data-state', 'welcome');
        setTimeout(function(){
            document.body.setAttribute('data-state', 'idle');
        },3750);
        recognition.start();
        fishki = setInterval(fishechki,65000); // todo!!!
    },1500);
  
        setTimeout(function(URL){


            shortcut.add("space",function(URL) {
                ListeniningInitiated=1;
                startListening(URL);
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
        },5000);
});
