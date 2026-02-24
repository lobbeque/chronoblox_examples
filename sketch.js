var w = 1200;
var h = 750;

var raw_blocks = [];
var raw_edges  = [];
var blocks = {};
var edges  = [];
var timeColorScale = d3.scaleSequential(d3.interpolateYlOrBr)


function preload() {
    raw_blocks = loadTable('./impact_investing_louvain_blocks.csv', 'csv', 'header');
    raw_edges  = loadTable('./impact_investing_louvain_edges.csv', 'csv', 'header');
}

function xScale(x,xmin,xmax) {
    return map(x,xmin,xmax,0,600)
}

function yScale(y,ymin,ymax) {
    return map(y,ymin,ymax,0,400)
}

function zScale(z) {
    return map(z,0.8,0,0,300)
}

function timestampToString(ts) {
    let dt = new Date(0)
    dt.setUTCSeconds(ts)
    let month = (dt.getMonth() + 1).toString()
    if (month.length == 1) {
        month = '0' + month
    }
    let date = month + '/' + (dt.getFullYear().toString()).slice(-2)
    return date
}

function setup() {
    
    createCanvas(w, h, WEBGL);
    addScreenPositionFunction()
    angleMode(DEGREES);

    // coordinates    

    let xs = (raw_blocks.getColumn('x')).map((x) => parseFloat(x))
    let ys = (raw_blocks.getColumn('y')).map((y) => parseFloat(y))

    var xmax = Math.max(...xs)
    var xmin = Math.min(...xs)
    var ymax = Math.max(...ys)
    var ymin = Math.min(...ys)

    // phases

    phases = raw_blocks.getColumn('phase')
    phases = Array.from(new Set(phases))
    phases.sort()
    phases = phases.map((p) => timestampToString(p))
    var timeScaleNormalized = d3.scaleBand(([-1].concat(phases)), [0.3, 1])
    var zmin = phases[0]
    var zmax = phases[phases.length - 1]
    // blocks

    raw_blocks.getRows().forEach(function(b) {
        let id = b.getString(0)
        let phase = timestampToString(id.split("_")[1])
        let x = parseFloat(b.getString(8))
        let y = parseFloat(b.getString(9))
        blocks[id] = {"id":id,"phase":phase,"x":xScale(x,xmin,xmax),"y":yScale(y,ymin,ymax),"z":zScale(timeScaleNormalized(phase)),"color":d3.color(timeColorScale(timeScaleNormalized(phase))).formatHex()}
    })

    // edges

    raw_edges.getRows().forEach(function(e) {
        let source = e.getString(0)
        let target = e.getString(1)
        let type = e.getString(4)
        if (Object.keys(blocks).includes(source) && Object.keys(blocks).includes(target) && type == "sync") {
            let x1 = blocks[source]["x"]
            let y1 = blocks[source]["y"]
            let x2 = blocks[target]["x"]
            let y2 = blocks[target]["y"]        
            let phase = timestampToString(e.getString(3))
            edges.push({"x1":x1,"y1":y1,"x2":x2,"y2":y2,"z":zScale(timeScaleNormalized(phase)),"phase":phase,"color":d3.color(timeColorScale(timeScaleNormalized(phase))).formatHex()})
        }
    })     

}

function draw() {

    //  init
    background("#eeeeee");
    orbitControl();
    if (window.rotation) {
        rotateY(millis() / 1000);
    }

    // draw the axis
    push();
    stroke("#000000");
    line(0,-200,0,0,100,0)
    translate(0, -200, 0)
    cone(5, -15, 16);
    pop();  

    // draw the groups
    push();
    translate(-300, -100, -200)
    strokeWeight(6);
    for (var i = 0; i < Object.keys(blocks).length; i++) {
        let b = Object.values(blocks)[i]
        stroke(b.color);
        point(b.x,b.z,b.y)
    }
    strokeWeight(1);
    for (var i = 0; i < edges.length; i++) {
        let e = edges[i]
        stroke(e.color)
        line(e.x1,e.z,e.y1,e.x2,e.z,e.y2)

    }  
    pop();    


}


/*
 * checkboxes controler 
 */

function clicked(source) {
    switch (source) {
        case 'rotation' :
            window.rotation = ! window.rotation;
            break;                                                                                                                                                                  
    }
}
