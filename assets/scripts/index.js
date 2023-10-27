 const URL = '/api/neznaika';  // 🤌❓
                               // + re: line 93
    
    function recordAndSend(URL){
    navigator.mediaDevices.getUserMedia({ audio: true})
    .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);

        document.querySelector('#start').addEventListener('click', function(){
            mediaRecorder.start();
        });
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


function hideAllSections(){
    let allSections = document.querySelectorAll('section');
    for (let index=0, max=allSections.length; index < max; index++) {
        allSections[index].style.display='none';
        }
}

function checkBg(){
    switch (true) {
        case (document.querySelector('section#idle').style.display=='flex'):
            document.body.style.backgroundImage = "url('./assets/img/bg.png')";
            break;
        case (document.querySelector('section#idles').style.display=='flex'):
            document.body.style.backgroundImage = "url('./assets/img/bg.png')";
            break;
        case (document.querySelector('section#listening').style.display=='flex'):
            document.body.style.backgroundImage = "url('./assets/img/bg.png')";
            break;
        case (document.querySelector('section#answering').style.display=='flex'):
            document.body.style.backgroundImage = "url('./assets/img/bg.png')";
            break;
        case (document.querySelector('section#loader').style.display=='flex'):
            document.body.style.backgroundImage = "url('./assets/img/bg1.png')";
            break;
        case (document.querySelector('section#goodbye').style.display=='flex'):
            document.body.style.backgroundImage = "url('./assets/img/bg1.png')";
            break;
      }
    }
    
function startListening(URL){
    shortcut.remove("space");
    hideAllSections();
    document.querySelector('section#listening').style.display='flex';
    checkBg();
    document.querySelector('#question').disabled=false;
    document.querySelector('#question').innerText='';
    document.querySelector('#question').value=''; // 🤔
    document.querySelector('#question').focus();
    // recordAndSend(URL);
    shortcut.add("enter",function() {
        startAnswering();
        },{
            'type':'keydown',
            'propagate':false,
            'target':document.querySelector('#question')
            });
}

function startAnswering(URL){
    shortcut.remove("enter");
    document.querySelector('#listening > img').src='./assets/img/answering.gif';
    document.querySelector('#answer').focus();
    
    document.querySelector('#question').disabled=true;
    document.querySelector('#answer').innerText='Вот тебе и раз! Я просто люблю приключения!';
    setTimeout(function(URL){
        hideAllSections();
        document.querySelector('section#idle').style.display='flex';
        checkBg();
        document.querySelector('#listening > img').src='./assets/img/listening.gif';
        document.querySelector('#answer').innerText='';
        document.querySelector('#answer').value=''; // 🤔

        shortcut.add("space",function() {
            startListening(URL);
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
    const farewellneznaika = document.createElement('img');
    farewellneznaika.alt = 'Незнайка';
    farewellneznaika.title = 'Незнайка';
    farewellneznaika.classList.add('neznaika');
    farewellneznaika.src = './assets/img/goodbye.gif';
    (document.querySelector('section#goodbye')).append(farewellneznaika);
    hideAllSections();
    document.querySelector('section#goodbye').style.display='flex';
    checkBg();
    setTimeout(function(){
        setTimeout(function(){
            hideAllSections();
            document.querySelector('section#loader').style.display='flex';
            },3500);
        },3500);

}

function fishechki(){
    // console.log('Креатив и фишечки)');
    if((((document.querySelector('section#listening')).style).display != 'flex') && (((document.querySelector('section#answering')).style).display != 'flex') && (((document.querySelector('section#goodbye')).style).display != 'flex') && (((document.querySelector('section#loader')).style).display != 'flex')){
        
    if(! document.querySelector('section#idles>img.neznaika')){
        let neznaikaCaster = document.createElement('img');
        neznaikaCaster.alt = 'Незнайка';
        neznaikaCaster.title = 'Незнайка';
        neznaikaCaster.classList.add('neznaika');
        neznaikaCaster.src = './assets/img/cake_magician.gif';
        (document.querySelector('section#idles')).append(neznaikaCaster);
        let happybirthday = document.createElement('img');
        happybirthday.alt = 'С днём рожения, Николай Носов!';
        happybirthday.title = 'С днём рожения, Николай Носов!';
        happybirthday.id = 'happy_birthday';
        happybirthday.classList.add('hb');
        happybirthday.src = './assets/img/hb.svg';
        (document.querySelector('section#idles')).append(happybirthday);
    } else {
        document.querySelector('#idles > img.neznaika').src = './assets/img/cake_magician.gif';
        document.querySelector('#happy_birthday').classList.add('hb');        
    }

        hideAllSections();
        document.querySelector('section#idles').style.display='flex';

        window.setTimeout(function(){
            hideAllSections();
            document.querySelector('#idles > img.neznaika').src = '';
            document.querySelector('#happy_birthday').classList.remove('hb');  
            (document.querySelector('section#idle')).style.display='flex';
        },5000);
    }
}

document.addEventListener('DOMContentLoaded',function(URL){
    window.setTimeout(function(){
        const loader=document.querySelector('#loader');
        const start=document.querySelector('#start');
        hideAllSections();
        start.style.display='flex';
    },2500);
    const startbtn=document.querySelector('button#go');
    
    startbtn.addEventListener('click', function(URL){
        const startsection = document.querySelector('section#start');
        const neznaika = document.querySelector('section#start');
        const welcomesection = document.querySelector('section#welcome');
        const idlesection = document.querySelector('section#idle');

        hideAllSections();
        welcomesection.style.display='flex';
        startsection.remove();
        
        setTimeout(function(URL){
            hideAllSections();
            idlesection.style.display='flex';
            welcomesection.remove();
            fishki = setInterval(fishechki,65000);

            shortcut.add("space",function(URL) {
                startListening(URL);
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
});
