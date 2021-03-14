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
    this.sealCensus = [sealCount];
    this.sealCensusLong = [];
    this.addSealCount = (sealCount) => {
        this.sealCensus.push(sealCount); //add sealCount to sealCensus
        for(let i=0; i<sealCount.amount; i++) { 
            //add a single element for each seal to sealCensusLong
            this.sealCensusLong.push(sealCount.category);
        }
    }
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



//this is very incomplete, atm we are ignoring areas with little recordings
var generalLocation = function(X) { //x = location
    if(
        X=="ND"
        || X=="NoD"
    )
        return "North Point"

    else if(
        X=="BBN"
    )
        return "Bight Beach North"

    else if(
        X=="BBS"
    ) 
        return "Mid Bight Beach"

    else if (
        X == "ML-AP"
        || X == "AP"
        || X == "SB"
        || X == "An Pt"
        || X == "So Pt B C"
        || X == "So Pt B W"
        || X == "So Pt D"
        || X == "TS"
        || X == "SPtD"
        || X == "SPtBW"
        )
        return "Ano Point"
    else {
        let locatons = ["North Point", "Bight Beach North", "Mid Bight Beach", "Ano Point"];
        return locations[  Math.floor( Math.random() * locations.length ) ];
    }

} 





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
    //console.log(row + ": " + data.date);
    if(row == dataLength-2 ) {
        whenDataLoaded()
    }
});
function whenDataLoaded() {        
    debug("end of data file reached!");
    console.log("Seal census: ");
    console.log(sealCensus);

    addSVG();
} 