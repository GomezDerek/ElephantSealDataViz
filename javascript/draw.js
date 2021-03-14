var pickColor = (category) => {
    if(category == "pup")
        return "#000000";
    else if(category == "weanling")
        return "#DDDDDD"
    else if (category == "yearling")
        return "#DDAADD"
    else 
        return "#7a7a52"
};

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

    //just pick the first census in that month 
    //var data = sealCensus[dataYear][dataMonth];
    var data = sealCensus[dataYear][dataMonth];

    if(data != undefined && data != "undefined") {
        data = data[ Math.floor( Math.random() * data.length ) ];
    }
    else {
        data = [];
    }
    
    dataLocation = generalLocation(data.location);
    data = data.sealCensusLong;
    console.log("Pre-binding data: ");
    console.log(data);

    let xPadding = 10;
    let yPadding = 10;

    //data = [0,1,2,3,4,5,6,7,7,8,9,0,1,2,3,4,5,6,7,8,9,0,9,3,7,9];
    //Create and append circle elements element
    var circles = svg.selectAll(".seal")
    .data(data)
    .enter().append("circle")
    .attr("class", "seal")
    //.attr("cx", (d, i) => (i%11) * xPadding)
    //.attr("cy", (d, i) => (((i/11)|0) + 1) * yPadding)
    .attr("r", 10)
    //.attr("fill", (sliderValue % 2 == 0) ? "blue" : "green");
    .attr("fill", "#7a7a52");
    
    //actions for when the slider is updated
    //help from http://bl.ocks.org/kbroman/2044064e9517985f2f25
    d3.select("input[type=range]#myRange").on("input", function() {
            dataYear = 1976 + (this.value/12)|0;

            dataMonth = this.value%12 < 0 ? this.value%12 : 12;

            //just pick the first census in that month 
            //var data = sealCensus[dataYear][dataMonth];
            data = sealCensus[dataYear][dataMonth];

            if(data != undefined && data != "undefined") {
                data = data[ Math.floor( Math.random() * data.length ) ];
            }
            else {
                data = [];
            }
            
            dataLocation = generalLocation(data.location);
            data = data.sealCensusLong;

             debug(data);
             d3.select("output#year")
               .text(convertSliderValue(this.value));

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

            //debug("Slider changed to " + year);
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
        .text("Ano Point");

    //title text
    /*
    svg.append("text")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + width*2 + ", " + height/30 + ")")
        .text("Elephant Seal Population on the Ano Nuevo Reserve");
        */



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
        if(dataLocation == "North Point") { //North Point
            return width*1/3;
        }

        else if(dataLocation == "Bight Beach North") { //Bight Beach North
            return width*2/3;
        }

        else if(dataLocation == "Mid Bight Beach") { //Mid Bight Beach
            return width*1/3;
        }

        else {//Other
            return width*2/3;
        }     
    })
    .strength(0.1);
    
var forceY = d3.forceY( d => {
        if(dataLocation == "North Point" || dataLocation == "Bight Beach North") {
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