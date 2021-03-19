var pickColor = (category) => {
    if(category == "pup" || category == "weanling" || category == "yearling") {
        return "#220C08"; //chocolate black
    }
    else if (category == "adult_female") { 
        return "#9B8576"; //tan
    }
    else if (category == "adult_male") {
        return "#BC8D7D"; //that pink color on their chest
    }
    else {//juvenile or maturing
        return "#EDE9DD"; //cream
    }
};

var pickSize = (category) => {
    if(category == "pup") {
        return 2;
    }
    else if(category == "weanling") {
        return 3;
    }
    else if(category == "yearling") {
        return 5;
    }
    else if(category == "juvenile") {
        return 6;
    }
    else if(category == "adult_female") {
        return 7.5;
    }
    else if(category == "adult_male") {
        return 15;
    }
    else {//classified as SA
        return 7.5;
    }
    
}

//we're going to split up the month by weeks! See what happens
let monthData = function(year, month) {
    let censusArray = sealCensus[year][month];
    let censuses = {
        week1: [], 
        week2: [], 
        week3: [], 
        week4: []
    };

    //assign censuses to weeks
    censusArray.forEach(census => {
        let day = census.date.day;
        let week = Math.ceil( day/7 );

        switch(week) {
            case 1:
                censusArray.week1.push(census);
                break;
            case 2: 
                censusArray.week2.push(census);
                break;
            case 3: 
                censusArray.week3.push(census);
                break;
            case 4: 
                censusArray.week4.push(census);
                break;
            case 5: 
                censusArray.week4.push(census);
                break;
        }
        return censuses;
    });



}

//Add circles where the seals are!
// Create SVG element
let width = 1000;
let height = 500;

var addSVG = function() {
    debug("in addSVG()");

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
    var dataYear = 1976 + (sliderValue/12)|0;
    var dataMonth = sliderValue%12 < 0 ? sliderValue%12 : 12;
    var dataLocation;
    var data;
    var noCensus = false;

    //var data = sealCensus[dataYear][dataMonth];
    let censusArray = sealCensus[dataYear][dataMonth];
    let census;

    if(censusArray != undefined && censusArray != "undefined") {
        census = censusArray[ Math.floor( Math.random() * censusArray.length ) ];
    }
    else {
        census = []; //no recorded censuses for given month
        noCensus = true;
    }
    
    if(!noCensus) {
        dataLocation = generalLocation(census.location);
        data = census.sealCensusLong;
    }
    else {
        data = census;
    }

    data = fixData(data, dataLocation);
    console.log("Extracted data for the force simulation: ");
    console.log(data);

    let xPadding = width/10;
    let yPadding = height/10;

    //data = [0,1,2,3,4,5,6,7,7,8,9,0,1,2,3,4,5,6,7,8,9,0,9,3,7,9];
    //Create and append circle elements element
    var circles = svg.selectAll(".seal")
    .data(data)
    .enter().append("circle")
    .attr("class", "seal")
    .attr("cx", (d, i) => (i%11) * xPadding)
    //.attr("cx", 250)
    //.attr("cy", 250)
    .attr("cy", (d, i) => (((i/11)|0) + 1) * yPadding)
    .attr("r", d => pickSize(d.type))
    //.attr("fill", (sliderValue % 2 == 0) ? "blue" : "green");
    .attr("fill", d => pickColor(d.type));
    
    //actions for when the slider is updated
    //help from http://bl.ocks.org/kbroman/2044064e9517985f2f25
    d3.select("input[type=range]#myRange").on("input", function() {
            dataYear = 1976 + (this.value/12)|0;

            dataMonth = this.value%12 > 0 ? this.value%12 : 12;

            console.log("Slider updated to " + dataMonth + " " + dataYear);
            
            //var data = sealCensus[dataYear][dataMonth];
            censusArray = sealCensus[dataYear][dataMonth];

            if(censusArray != undefined && censusArray != "undefined") {
                census = censusArray[ Math.floor( Math.random() * censusArray.length ) ];
                noCensus = false;
            }
            else {
                census = []; // no recorded censuses for given month
                noCensus = true;
            }

            if(!noCensus) {
                dataLocation = generalLocation(census.location);
                data = census.sealCensusLong;
            }
            else 
                data = census;

            data = fixData(data, dataLocation);

            //console.log("New data being displayed: ");
            //console.log(data);
            
            //slightly redundant since this is done in autoplay as well
            //BUT we also want this to happen when the user picks a year WITHOUT using the autoplayer
            d3.select("output#year")
               .text(convertSliderValue(this.value));
            

            //update circles with the changes
            //help from http://bl.ocks.org/alansmithy/e984477a741bc56db5a5
            //let circles = d3.selectAll("circle.seal");
            
            circles.data(data);//.join("circle")
            circles.exit().remove(); //remove unneeded circles

            circles.enter().append("circle") 
                .attr("r", d => pickSize(d.type))
                .attr("cx", width/2)
                .attr("cy", height/2)
                .attr("fill", d => pickColor(d.type))
                .attr("id", "new")
                ;//.merge(circles);

            
            //debug("Slider changed to " + year);
            //console.log(this);


            simulation
                .alphaTarget(0.25)
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
        .text("Ano Point");

    //legend container
    svg.append("rect")
        .attr("fill", "white")
        .attr("x", width - 150)
        .attr("y", 10)
        .attr("height", 150)
        .attr("width", 140);

    //black is for pups
    svg.append("rect")
        .attr("fill", "#220C08")
        .attr("x", width - 140)
        .attr("y", 20)
        .attr("height", 25)
        .attr("width", 25);

    svg.append("text")
        .attr("fill", "black")
        .attr("x", width - 105)
        .attr("y", 37)
        .text("Pup, Weanling");
    
    //cream is for juveniles
    svg.append("rect")
        .attr("fill", "#EDE9DD")
        .attr("x", width - 140)
        .attr("y", 50)
        .attr("height", 25)
        .attr("width", 25);
        
    svg.append("text")
        .attr("fill", "black")
        .attr("x", width - 105)
        .attr("y", 67)
        .text("Yearling, Juvenile");

    //tan is for females
    svg.append("rect")
        .attr("fill", "#9B8576")
        .attr("x", width - 140)
        .attr("y", 80)
        .attr("height", 25)
        .attr("width", 25);

    svg.append("text")
        .attr("fill", "black")
        .attr("x", width - 105)
        .attr("y", 97)
        .text("Adult Female");

    //pink/brown is for males
    svg.append("rect")
        .attr("fill", "#BC8D7D")
        .attr("x", width - 140)
        .attr("y", 110)
        .attr("height", 25)
        .attr("width", 25);

    svg.append("text")
        .attr("fill", "black")
        .attr("x", width - 105)
        .attr("y", 127)
        .text("Adult Male");
    
        

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

// bubble cluster physics
// help from https://youtu.be/NTS7uXOxQeM
var forceX = d3.forceX( d => {
        if(d.location == "North Point") { //North Point
            return width*1/3;
        }

        else if(d.location == "Bight Beach North") { //Bight Beach North
            return width*2/3;
        }

        else if(d.location == "Mid Bight Beach") { //Mid Bight Beach
            return width*1/3;
        }

        else {//Other
            return width*2/3;
        }     
    })
    .strength(0.1);
    
var forceY = d3.forceY( d => {
        if(d.location == "North Point" || d.location == "Bight Beach North") {
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
    .force("collide", d3.forceCollide( d => pickSize(d.type) ));


//this function specifically exists to modify the data array for the force simulation
//Uncaught TypeError: Cannot create property 'vx' on string 'SA2'
//the force simulation ONLY accepts objects! So we turn the array of strings, into objects.
function fixData(old, location) {
    let newData;
    console.log("Fixing this data: ");
    console.log(old);
    //create new array where each element is an object with the seal type and where it is
    newData = old.map( seal => {
        return {type: seal, location: location};
    });

    return newData;
}