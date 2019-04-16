
var controlbox_width = 400,
	controlbox_height = 400,
	n_grid_x = 24, 
	n_grid_y = 24; 



var controls = d3.selectAll("svg")
	.attr("class","explorable_widgets")


var g = widget.grid(controlbox_width,controlbox_height,n_grid_x,n_grid_y);

var anchors = g.lattice(); // g has a method that returns a lattice with x,y coordinates

// we first define the button parameters

var b1 = { id:"b1", name:"", actions: ["rewind"], value: 0};

// values of these parameters are changed when the widget is activated

// now we generate the button objects and put them into an array, the last button is modified a bit from its default values

var buttons = [
	widget.button(b1).size(45).symbolSize(25).update(reset).fontSize(12)
]
// now we define a block in the control panel where the buttons should be placed

var buttonbox = g.block({x0:22,y0:4,width:20,height:0}).Nx(buttons.length);

// now we draw the buttons into their block

controls.selectAll(".button").data(buttons).enter().append(widget.buttonElement)
	.attr("transform",function(d,i){return "translate("+buttonbox.x(i)+","+buttonbox.y(0)+")"});	
