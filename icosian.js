function contains(arr,elem)
{
  return ! (arr.indexOf(elem) == -1);
}

function link_id(source,target){
  if (source > target)
  {
    let tmp = source;
    source = target;
    target = tmp;
  }

  return "#link-"+source+"-"+target;
}

const width = 600;
const height = 400;
const svg = d3.select('#icosian_container')
              .append("svg")
              .attr('width',width)
              .attr('height',height);

let links, nodes;
let link, node;

let path = [];

let dod_origin = [width/4, height/2];
let scale = 20;
let xScale = d3.scaleLinear().domain([0,1]).range([dod_origin[0],dod_origin[0]+scale]);
let yScale = d3.scaleLinear().domain([0,1]).range([dod_origin[1]+scale,dod_origin[1]]);
let radius = 5;
let select_color = "#1b9e77";
let deselect_color = "#d95f02";

let isSelected = [];
let graph = [];
let last_selected = null;


let show_labels = false;
let base_label;

d3.json('./dodecahedron.json').then(function(data){
  links = data.links.map(d => Object.create(d));
  nodes = data.nodes.map(d => Object.create(d));

  data.nodes.forEach(function(d){
    graph.push([]);
    isSelected.push(false);
  });

  data.links.forEach(function(d){
    console.log(d);
    graph[d.source].push(d.target);
    graph[d.target].push(d.source);
  });

  //Reflect.ownKeys(links).forEach(function (key) {
  //  links.
  //});

  base_link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 1.0)
    .selectAll("line")
    .data(links)
    .join("line")
      .attr("id",d => link_id(d.source,d.target))
      .attr("x1",d => xScale(nodes[d.source].x))
      .attr("x2",d => xScale(nodes[d.target].x))
      .attr("y1",d => yScale(nodes[d.source].y))
      .attr("y2",d => yScale(nodes[d.target].y))
      .attr("stroke-width", 1.5);

  base_node = svg.append("g")
      .attr("stroke", "#333")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("id", function(d, i){ return "node-"+i; })
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .attr("fill", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", handleMouseOver)
      .on("click", handleMouseClick)
      .on("mouseout", handleMouseOut);

  if (show_labels)
  {
    base_label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
        .attr("id", function(d, i){ return "text-"+i; })
        .attr("x", d => xScale(d.x)+scale/4)
        .attr("y", d => yScale(d.y)+scale/4)
        .text(d => d.id);
  }

  base_node.append("title")
      .text(d => d.id);
});


function redraw() {
}

function handleMouseOver(d, i) {  // Add interactivity

  if (last_selected === null)
  {
    d3.select(this)
      .attr("stroke", select_color)
      .attr("stroke-width", 2)
    ;
    return;
  }


  if (isSelected[i])
  {
    d3.select(this)
      .attr("stroke", deselect_color)
      .attr("stroke-width", 2)
    ;
  }
  else if ( (!isSelected[i]) && 
       ( 
          (last_selected === null) || 
          (contains(graph[i],last_selected)) 
       )
     )
  {
    d3.select(this)
      .attr("stroke", select_color)
      .attr("stroke-width", 2)
    ;
  }
}

function handleMouseOut(d, i) {
    d3.select(this)
      .attr("stroke", "#000")
      .attr("stroke-width", 1.0)
  ;
}

function handleMouseClick(d, i) {

  if ( (!isSelected[i]) && 
       ( 
          (last_selected === null) || 
          (contains(graph[i],last_selected)) 
       )
     )
  {
    path.push(i);
    last_selected = i;
    isSelected[i] = true;

    d3.select("#node-"+i)
      .attr("fill", select_color)
      .attr("stroke", deselect_color);

    

  }
  else if (isSelected[i])
  {

    if (i == last_selected)
    {
      d3.select("#node-"+i)
        .attr("fill", "#fff")
        .attr("stroke", select_color);
      path.pop();

    }
    else
    {
      for(let j=path.length-1; j>=0 && i!=path[j]; --j)
      {
        d3.select("#node-"+path[j])
          .attr("fill", "#fff");
        isSelected[path[j]] = false;
        path.pop();
        
      }
    }

    if (path.length > 0)
    {
      last_selected = path[path.length-1];
      isSelected[last_selected] = true;
    }
    else
      last_selected = null;

    
  }
  console.log(path,last_selected);
}

