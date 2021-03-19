//https://stackoverflow.com/questions/49971575/chrome-fetch-api-cannot-load-file-how-to-workaround
//stole this code from stack overflow to solve an error in Google Chrome
if (/^file:\/\/\//.test(location.href)) {
    let path = '../';
    let orig = fetch;
    window.fetch = (resource) => ((/^[^/:]*:/.test(resource)) ?
        orig(resource) :
        new Promise(function(resolve, reject) {
            let request = new XMLHttpRequest();

            let fail = (error) => {reject(error)};
            ['error', 'abort'].forEach((event) => { request.addEventListener(event, fail); });

            let pull = (expected) => (new Promise((resolve, reject) => {
                if (
                    request.responseType == expected ||
                    (expected == 'text' && !request.responseType)
                )
                    resolve(request.response);
                else
                    reject(request.responseType);
            }));

            request.addEventListener('load', () => (resolve({
                arrayBuffer : () => (pull('arraybuffer')),
                blob        : () => (pull('blob')),
                text        : () => (pull('text')),
                json        : () => (pull('json'))
            })));
            request.open('GET', resource.replace(/^\//, path));
            request.send();
        })
    );
}

//this function prints screen coordinates to console
//https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_event_mouse_screenxy_clientxy
var showCoords = function(event) {
    var coordinates = {
        x: event.clientX,
        y: event.clientY
    }
    console.log("X: " + coordinates.x + ", Y: " + coordinates.y);
    //return coordinates;
}

//cheeky little dubugging tool ;)
var debugMode = true;
var debug = string => { if(debugMode) console.log(string) };

var stepClicked = function(event) {
    let slider = document.getElementsByClassName("slider")[0];
    if(parseInt(slider.value) < parseInt(slider.max)) {
        slider.value = parseInt(slider.value) + 1; //WE USE PARSEINT BC "1" + 1 = 11
        //also update output here in addition to d3
        document.getElementById("year").innerHTML = convertSliderValue(slider.value);

        //trigger d3 force simulation reset()
        slider.dispatchEvent(event2);
    }
}

var autoSlider;
//when the button next to the slider is clicked
var playPauseClicked = function(event) {
    //is play button?
    let icon = document.getElementById("icon");
    
    let interval = 1500; //ms

    if(iconURL() == "/media/icons/play-solid.svg") { //play button was clicked
        icon.src = "/media/icons/pause-solid.svg"; //change to pause icon
        autoSlider = setInterval(autoShiftSlider, interval); //shift slider every interval 
        console.log("play button clicked");
    }
    else if(iconURL() == "/media/icons/pause-solid.svg") {//pause button was clicked
        icon.src = "/media/icons/play-solid.svg"; //change to play icon
        clearInterval(autoSlider ); //stop slider shift
        console.log("pause button clicked");
    }
    else if(iconURL() == "/media/icons/undo-solid.svg") {
        icon.src = "/media/icons/pause-solid.svg"; //change to play icon
        
        let slider = document.getElementsByClassName("slider")[0];
        slider.value = slider.min; //reset slider to beginning
        document.getElementById("year").innerHTML = slider.value;//update output

        clearInterval(autoSlider);

        //comment this out bc we never used clearInterval when max was reached
        //setInterval(autoShiftSlider, interval); //shift slider every interval 
        console.log('replay clicked');
    }
    else {
        console.log("Neither play or pause recognized. Url is : " + icon.src);
        console.log(iconURL());
    }

}
//had to create this functon because absolute file paths were being returned in playPauseClicked
//instead of relative file paths
let iconURL = () => {
    let url = document.getElementById("icon").src;
    let split = url.split("/");
    let relativeFilePath = "";
    for(let i=split.length -3; i < split.length; i++) {
        relativeFilePath+= "/" + split[i];
    }
    return relativeFilePath;
}

//call this in setInterval() to have the slider continuously shift after pressing play
let autoShiftSlider = () => {
    let slider = document.getElementsByClassName("slider")[0];
    
    //auto shift slider until max is reached, then swap button to replay button    
    if(parseInt(slider.value) < parseInt(slider.max)) {
        slider.value = parseInt(slider.value) + 1; //WE USE PARSEINT BC "1" + 1 = 11
        //temporarily update output here instead of d3
        document.getElementById("year").innerHTML = convertSliderValue(slider.value);

        //trigger d3 force simulation reset()
        slider.dispatchEvent(event);
    }
    else {
        //swap button to replay button - max has been reached
        document.getElementById("icon").src = "/media/icons/undo-solid.svg";

    }
}

var convertSliderValue = (value) => {
    let monthVal = value%12;
    let monthString;
    let year = 1976 + Math.floor(value/12);
    if(monthVal == 1) 
        monthString = "JAN";
    else if(monthVal == 2)
        monthString = "FEB";
    else if(monthVal == 3)
        monthString = "MAR";
    else if(monthVal == 4)
        monthString = "APR";
    else if(monthVal == 5)
        monthString = "MAY";
    else if(monthVal == 6)
        monthString = "JUN";
    else if(monthVal == 7)
        monthString = "JUL";
    else if(monthVal == 8)
        monthString = "AUG";
    else if(monthVal == 9)
        monthString = "SEP";
    else if(monthVal == 10)
        monthString = "OCT";
    else if(monthVal == 11)
        monthString = "NOV";
    else if(monthVal == 0)
        monthString = "DEC";
    
    else 
        monthString = "???"

    return monthString + " " + year;
}

//manually trigger an oninput event for the slider to trigger d3 force simulation reset
// var event = document.createEvent('Event');
// event.initEvent('input', true, true);
//elem.dispatchEvent(event)
var event = new Event('input', {
    bubbles: true,
    cancelable: true,
});

var event2 = new Event('input', {
    bubbles: true,
    cancelable: true,
});

var combineArrays = (a1, a2) => {
    a2.foreach(x => a1.push(x));
    return a1;
}