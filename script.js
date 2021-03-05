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
//this function is taken from:
//https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_event_mouse_screenxy_clientxy
function showCoords(event) {
    var coordinates = {
        x: event.clientX,
        y: event.clientY
    }
    console.log("X: " + coordinates.x + ", Y: " + coordinates.y);
    //return coordinates;
}

//cheeky little dubugging tool ;)
debugMode = true;
let debug = string => { if(debugMode) console.log(string) };

////////object constructors\\\\\\\\\\\\\\

//takes in a date as a string in the format of "MM/DD/YYYY"
var Date = function(date) {
    this.month = parseInt(date.split("/")[0]);
    this.day = parseInt(date.split("/")[1]);
    this.year = parseInt(date.split("/")[2]);
};


var Census = function(censusID, date, location, sealCount) {
    this.censusID = censusID;
    this.date = date;
    this.location = location;
    this.seals = [sealCount];
    this.addSealCount = (sealCount) => this.seals.push(sealCount);
}

//to be added to a Census object - specifies how many of an ESeal type was observed
var SealCount = function(category, amount){
    this.category = category;
    this.amount = amount;
}

//////////////data structures\\\\\\\\\\\\\\\\\\

//sealCensus organizes Censuses by Year/month
var sealCensus = {}; //year => month => Census

//add year/month objects as properties to sealCensus
for(let year = 1968; year < 2018; year++) {
    sealCensus[year] = {};
    for(let month = 1; month <= 12; month++)  {
        sealCensus[year][month] = undefined;
    }
}

//check up to make sure the sealCensus is correctly structured
debug("Empty seal census: ");
debug(sealCensus);

var regions = []; //an array used to find how many censuses were recorded at each area

var row = 1;
var dataLength = 15096;

//note to self regarding the data load - in function(data), the data argument is a single row, not the entire file
d3.csv("./data/Elephant Seal Census Data_ANML_.csv", function(data, index) {

    //populate regions[]
    debug(data.Location + " is already in array: ");
    debug(regions.some(element => element.Location == data.Location));
    if(!regions.some(element => element.Location == data.Location)) { //if region is nout found, add region to the array
        debug("Adding " + data.Location + " to array");
        regions.push({Location: data.Location, count: 1});
    }
    else {
        debug("increasing " + data.Location + "\'s count in array");
        let index = regions.findIndex(element => element.Location == data.Location);
        debug(index);
        debug(regions);
        debug(regions[index]);
        regions[index].count ++;
    }

    //populate sealCensus{}
    let date = new Date(data.date);
    let sealCount = new SealCount(data.category, data.N);

    //if there is no census entry for this month yet, start an array for this month
    if( typeof sealCensus[date.year][date.month] == (undefined || "undefined") ) 
        sealCensus[date.year][date.month] = [new Census(data.CensusID, date, data.Location, sealCount)];
    
    //if censusID is already in sealCensus, add new sealCount
    else if( sealCensus[date.year][date.month].some(census => census.censusID == data.CensusID) ) {
        sealCensus[date.year][date.month]
            .find(census => census.censusID == data.CensusID)
            .addSealCount(sealCount);
    }
    //add new census to the empty month array
    else 
        sealCensus[date.year][date.month].push(new Census(data.CensusID, date, data.region, sealCount));

    //keep track of data loading process, and when the last row is read, call whenDataLoadea() 
    row++;
    console.log(row);
    /*
    if(row == dataLength-1) {
        whenDataLoaded()
    }
    */
});
function whenDataLoaded() {  
    debug("end of data file reached!");
    console.log("Seal census: ");
    console.log(sealCensus);

    //addSVG();
} 



var pickColor = (category) => {

};

//Add circles where the seals are!
// Create SVG element
let width = 1000;
let height = 500;

let addSVG = function() {
    let row = -1;

    //create svg element
    var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0,0)");

    //get census data acoording to the slider's value/date
    var sliderValue = document.getElementById("myRange").value;
    //let dataYear = d3.select("#year").value;
    var dataYear = sliderValue;
    var dataMonth = ((Math.Random()*12)|0) + 1;

    //just pick the first census in that month 
    var data = sealCensus[dataYear][dataMonth];
    

    //Create and append circle elements element
    var circles = svg.selectAll(".seal")
    .data(data)
    .enter().append("circle")
    .attr("class", "seal")
    .attr("cx", (d, i) => (i%11) * xPadding)
    .attr("cy", (d, i) => (((i/11)|0) + 1) * yPadding)
    .attr("r", 10)
    //.attr("fill", (sliderValue % 2 == 0) ? "blue" : "green");
    .attr("fill", "#7a7a52");
    
    //actions for when the slider is updated
    //help from http://bl.ocks.org/kbroman/2044064e9517985f2f25
    d3.select("input[type=range]#myRange").on("input", function() {
             let year = this.value;
             data = sealsByYear[year];
             debug(data);
             d3.select("output#year")
               .text(year);

            //update circles with the changes
            //help from http://bl.ocks.org/alansmithy/e984477a741bc56db5a5
            //let circles = d3.selectAll("circle.seal").data(data);
            circles.data(data)
            circles.exit() //remove unneeded circles
            circles.enter().append("circle")
                .attr("r", 10)
                .attr("cx", width/2)
                .attr("cy", height/2)
                .attr("fill", "#7a7a52")
                .attr("stroke", "white")
                .attr("stoke-width", 10)
                .attr("stroke-opacity", 1)
                .attr("id", "new")
                .merge(circles);

            debug("Slider changed to " + year);
            //console.log(this);


            simulation
                .alphaTarget(0.5)
                .restart();

            simulation.nodes(data).on("tick", ticked);


    });

    //add text labels
    //top left text
    svg.append("text")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + width/3 + ", " + height/12 + ")") 
        .text("North Point");

    //top right text
    svg.append("text")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + width*2/3 + ", " + height/12 + ")")
        .text("Bight Beach North");    
    
    //bottom left text
    svg.append("text")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + width/3 + ", " + height/2 + ")")
        .text("Mid Bight Beach");

    //bottom right text
    svg.append("text")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + width*2/3 + ", " + height/2 + ")")
        .text("Other");



    //the simulation is a collection of forces
    //about where we want our circles to go 
    //and how we want our circles to interact
    simulation.nodes(data).on("tick", ticked);

    function ticked() {
        circles
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
    }
}

//bubble cluster physics
//help from https://youtu.be/NTS7uXOxQeM
var forceX = d3.forceX( d => {
        if(d.data[0].long < medianLong) { //longitude is less than (maxLongitude - minLongitude)/2
            return width/3;
        }
        
        else {//d.data[0].long > medianLong //longitude is greater than (maxLongitude - minLongitude)/2
            return width*2/3;
        }     
    })
    .strength(0.1);
    
var forceY = d3.forceY( d => {
        if(d.data[0].lat < medianLat) {
            return height/4;
        }
        else {//d.data[0].long > medianLong
            return height*3/4;
        }
    })
    .strength(0.1);

var simulation = d3.forceSimulation() 
    .force("x", forceX)
    .force("y", forceY)
    .force("collide", d3.forceCollide(13));
