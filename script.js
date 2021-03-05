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
//all slider code is directly inspired from https://www.w3schools.com/howto/howto_js_rangeslider.asp
// var slider = document.getElementById("myRange");
// var output = document.getElementById("demo");
// output.innerHTML = slider.value;

// slider.oninput = function() {
//   output.innerHTML = this.value;
// }

//cheeky little dubugging tool ;)
debugMode = true;
let debug = string => { if(debugMode) console.log(string) };

//given an array, iterate through it and return the element with the lowest value
function findMin(array) {
    let min = array[0];
    array.forEach(value => min = min < value ? min : value);
    return min;
};

//given an array, iterate through it and return the element with the highest value
function findMax(array) {
    let max = array[0];
    array.forEach(value => max = max > value ? max : value);
    return max;
}

var latitudes = [];
var longitudes = [];
var visibleCoordinates = [];

let row = 0; 
let dataLength = 150197; //this data file has 150,197 entries 

//the following objects are approximations of areas on the Ano Nuevo reserve
//the area approximations are squares where
//(x1,y1) is the top left point of the rectangle
//(x2,y2) is the bottom right point of the rectangle
//and the values are map coordinates
//ALSO WTF IS UP WITH (Latitude, Longitude) = (y, x) ?!?!?!

//Ano Point 
var AP  = {
    y1: 37.112953,   //Latitude1
    x1: -122.329849, //longitude1
    y2: 37.111965,   //latitude2
    x2: -122.328293  //longitude2
};
//North Point Coves
var NPC = {
    y1: 37.117839,   //latitude1
    x1: -122.338020, //longitude1
    y2: 37.116992,   //latitude2
    x2: -122.336679  //longitude2
}
//California (the entire state coast)
var CA = {
    y1: 41.983623,   //latitude1
    x1: -125.391499, //longitude1
    y2: 32.570946,   //latitude2
    x2: -117.194057  //longitude2
};

//latitude at the California-Oregon border
var CA_OR = 42;

//latitude at the Oregon-Washington coastal border
var OR_WA = 46.2;

//latitude at the US-Canada coastal border
var US_CAN = 48.5; 

var CA_Count = 0;
var OR_Count = 0;
var WA_Count = 0;
var CAN_Count = 0;

let counter = function(lat) {
    if(lat < CA_OR) {
        CA_Count ++;
    }
    else if(lat < OR_WA) {
        OR_Count ++;
    }
    else if(lat < US_CAN) {
        WA_Count ++;
    }
    else {
        CAN_Count ++;
    }
}
//ok well checking if these seals were in different states/countries was stupid, bc they're all in CA

//check if coordinate falls within a given area
function isInArea(area, coordinateX, coordinateY) {
    if (coordinateX <= area.x2 &&
        coordinateX >= area.x1 &&
        coordinateY <= area.y1 &&
        coordinateY >= area.y2
    )
        return true;
    else 
        return false;
}

//chooses a random map coordinate from the data set
function randomCoordinate() {
    let randIndex = Math.floor(Math.random() * dataLength);
    let randomCoordinate = {
        lat: latitudes[randIndex], //latitude
        long: longitudes[randIndex] //longitude
    };
    return randomCoordinate;
}

let splitDate = (date) => {
    let split = date.split("/");
    let splitDate = {
        month: parseInt(split[0]),
        day: parseInt(split[1]),
        year: parseInt(split[2])
    };
    return splitDate;
}

let earlierDate = function (date1, date2) {
    let split1 = splitDate(date1);
    let split2 = splitDate(date2);
    let earlier;

    if(split1.year < split2.year)
        earlier = date1;
    else {
        if(split1.year > split2.year)
            earlier = date2;
        else {
            //OK, if we've made it this far, then the dates share a year
            if(split1.month < split2.month) 
                earlier = date1;
            else if(split1.month > split2.month) 
                earlier = date2;
            else {
                //they share the same month, in which case, it doesn't matter which we return
                //console.log(date1 + " and " + date2 + " are the same month!");
                earlier = date1;
            }
            
        }
    }
    return earlier;
}
//today's date! This is meant to be changed
let earliestDate = "02/28/2020";

//this funciton will print to the console how many seals have been recorded each year
let WHEN = () => {

    let earliestYear = splitDate(earliestDate).year;

    let yearCounts = [];
    for(let i=0; i< (2021 - earliestYear); i++) {
        yearCounts.push(0);
    }

    sealArray.forEach(seal => {

        //fill uniqueDates with all the different years the seal was recorded
        let uniqueDates = [];
        seal.data.forEach(dataPoint => {
            let dataYear = splitDate(dataPoint.date).year;
            if(!uniqueDates.includes(dataYear)) 
                uniqueDates.push(dataYear);
        })

        //update yearCounts with the dates in uniqueDates
        uniqueDates.forEach(year => yearCounts[year - earliestYear]++);
    })
    let total = 0;
    let currentYear = earliestYear;
    while(currentYear < 2021) {
        let numSeals = yearCounts[currentYear - earliestYear];
        console.log(numSeals + " were recorded in " + currentYear);

        total += numSeals;
        currentYear++;
    }
    //console.log(yearCounts);
    //console.log(total);

}




//these data structures for the most recent data table (1968-2020)
var sealArray = [];

//pickedSeals is the subset of seals we will be working with, based on the criteria
var pickedSeals = [];
var criteria = (seal) => seal.data.some(dataPoint => splitDate(dataPoint.date).year == 2001); //criteria is the seal must have been recorded in 2001

var DataPoint = function(date, lat, long) {
    this.date = date;
    this.lat = lat;
    this.long = long;
}

var Seal = function(censusID, date, lat, long){
    this.censusID = censusID;
    this.data = [ new DataPoint(date, lat, long) ];
    this.addDataPoint = (newDate, newLat, newLong) => this.data.push(new DataPoint(newDate, newLat, newLong));
};

//this object will be a dictionary 
//KEY: year, VALUE: array of seals
var sealsByYear = {};

//note to self regarding the data load - in function(data), the data argument is a single row, not the entire file
d3.csv("./data/Elephant Seal Census Data_ANML_.csv", function(data, index) {
    if(data.latitude != "") { //leave out data without lat, long latitudes
        


        //manually check if this is a new seal or if it has been seen in the data already 
        let isNewSeal = !sealArray.some(seal => seal.censusID == data.CensusID );
        
        if(isNewSeal) {
            let newSeal = new Seal(data.CensusID, data.date, data.latitude, data.longitude); //create a new seal object
            sealArray.push(newSeal); //add new seal to the sealArray
            
            //add new seal to the sealsByYear dictionary
            let year = splitDate(data.date).year

            if((typeof sealsByYear[year]) == (undefined || "undefined")) {
                console.log(year + " is not in sealsByYear, so we are starting with " + data.CensusID);
                sealsByYear[year] = [newSeal]; //year key doesn't exist yet, so create and it and start an array for its value
            }
            else if((typeof sealsByYear[year]) == "object") {
                console.log(year + " is already in sealsByYear, so we are adding another data point for " + data.CensusID);
                sealsByYear[year].push(newSeal); //add seal to year's array
            }
            else {
                console.log("Something weird is going on with sealsByYear[year]");   
            }
        }
        else {
            //add this new record to the existing seal's data
            sealArray.find(seal => seal.censusID == data.CensusID).addDataPoint(data.date, data.latitude, data.longitude);

            //do the same for the dictionary
            let year = splitDate(data.date).year;
            sealsByYear[year].find(seal => seal.censusID == data.CensusID).addDataPoint(data.date, data.latitude, data.longitude);
        }

        //update earliestDate
        earliestDate = earlierDate(earliestDate, data.date);


    }
    row++;
    if(row == dataLength-1) {
        whenDataLoaded()
    }
});
function whenDataLoaded() {  
    debug("end of data file reached!");
    console.log("sealsByYear: ");
    console.log(sealsByYear);
    //console.log(sealArray);
    
    //console.log("Earliest date recorded: " + earliestDate);
    //WHEN();

    //working with the picked seals
    sealArray.forEach(seal => {
        if(criteria(seal)) pickedSeals.push(seal); 
    });
    console.log("Picked seals: ");
    console.log(pickedSeals);
    console.log("From the picked seals: ");
    let exampleSeal = pickedSeals[0];
    let minLat = exampleSeal.data[0].lat;
    let maxLat = exampleSeal.data[0].lat;
    let minLong = exampleSeal.data[0].long;
    let maxLong = exampleSeal.data[0].long;
    pickedSeals.forEach(seal => {
        seal.data.forEach(dataPoint => {
            minLat = minLat < dataPoint.lat ? minLat : dataPoint.lat;
            maxLat = maxLat > dataPoint.lat ? maxLat : dataPoint.lat;
            minLong = minLong < dataPoint.long ? minLong : dataPoint.long;
            maxLong = maxLong > dataPoint.long ? maxLong : dataPoint.long;
        })
    }); 
    medianLat = (parseFloat(maxLat) + parseFloat(minLat))/2;
    medianLong = (parseFloat(maxLong) + parseFloat(minLong))/2;
    console.log("Min lat: " + minLat);
    console.log("Max lat: " + maxLat);
    console.log("Median lat: " + medianLat);
    console.log("Min long: " + minLong);
    console.log("Max long: " + maxLong);
    console.log("Median long: " + medianLong);
    addSVG();
}

var medianLat;
var medianLong;
    


//Create and append rectangle element
// svg.append("rect")
// .attr("x", 50)
// .attr("y", 50)
// .attr("width", 20)
// .attr("height", 20)
// .attr("fill", "red");


// We will now be adding squares where the seals are!
// Create SVG element
let width = 1000;
let height = 500;
let addSVG = function() {
    var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0,0)");

    d3.select("#chart")
        .append("text")
        .attr("x", width*0.75)
        .attr("y", height*0.75)
        .text("Ano Point");

    let row = -1;
    let xPadding = width/11;
    let yPadding = height/11; 


    var sliderValue = document.getElementById("myRange").value;
    //let dataYear = d3.select("#year").value;
    var data = sealsByYear[sliderValue];

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
             console.log(data);
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

            console.log("Slider changed to " + year);
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
    .force("collide", d3.forceCollide(10));
