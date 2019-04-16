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

  return "link-"+source+"-"+target;
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

let dod_origin = [width/3.5, height/2];
let scale = 30;
let xScale = d3.scaleLinear().domain([0,1]).range([dod_origin[0],dod_origin[0]+scale]);
let yScale = d3.scaleLinear().domain([0,1]).range([dod_origin[1]+scale,dod_origin[1]]);
let radius = 8;
let deselect_color = "#1b9e77";
let select_color = "#d95f02";
let default_link_color = "#999";
let default_link_width = 1.5;

let isSelected = [];
let graph = [];
let last_selected = null;

let show_labels = false;
let base_label;

let line = d3.line();
let base_path;

let can_play = true;
let graph_url = './dodecahedron.json';
graph_url = './test.json';

d3.json(graph_url).then(function(data){
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
    .selectAll("line")
    .data(links)
    .join("line")
      .attr("id",d => link_id(d.source,d.target))
      .attr("x1",d => xScale(nodes[d.source].x))
      .attr("x2",d => xScale(nodes[d.target].x))
      .attr("y1",d => yScale(nodes[d.source].y))
      .attr("y2",d => yScale(nodes[d.target].y))
      .attr("stroke", default_link_color)
      .attr("stroke-opacity", 1.0)
      .attr("stroke-width",  default_link_width)
      .on("mouseover", handleLinkMouseOver)
      .on("click", handleLinkMouseClick)
      .on("mouseout", handleLinkMouseOut);

  base_path = svg.append("g")
                .attr("stroke",select_color)
                .attr("stroke-width",3.0)
                .selectAll("line")
              ;
              
  base_node = svg.append("g")
      .attr("stroke", "#333")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("id", function(d, i){ return "node-"+i; })
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", radius)
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


function reset() {
  path = 0;
  last_selected = 0;

  base_link.transition()
      .attr("stroke", default_link_color)
      .attr("stroke-opacity", 1.0)
      .attr("stroke-width",  default_link_width)
     ;

  base_node.transition()
      .attr("fill", "#fff")
      .attr("stroke-width", 1)
      ;
}

function handleMouseOver(d, i) {  // Add interactivity
  if (!can_play)
    return;

  if (last_selected === null)
  {
    d3.select("#node-"+i)
      .attr("stroke", select_color)
      .attr("stroke-width", 2)
    ;
    return;
  }


  if (isSelected[i])
  {
    d3.select("#node-"+i)
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
    d3.select("#node-"+i)
      .attr("stroke", select_color)
      .attr("stroke-width", 2)
    ;
  }
}

function handleMouseOut(d, i) {
    d3.select("#node-"+i)
      .attr("stroke", "#000")
      .attr("stroke-width", 1.0)
  ;
}

function handleMouseClick(d, i) {
  if (!can_play)
    return;

  if ( (!isSelected[i]) && 
       ( 
          (last_selected === null) || 
          (contains(graph[i],last_selected)) 
       )
     )
  {
    if (!(last_selected === null))
    {
      d3.select("#"+link_id(i,last_selected))
        .transition()
        .attr("stroke",select_color)
        .attr("stroke-width",3)
    }

    path.push(i);
    last_selected = i;
    isSelected[i] = true;

    d3.select("#node-"+i)
          .transition()
      .attr("fill", select_color)
      .attr("stroke", "#000")
    .on("end",function(){

      if (path.length == nodes.length)
      {
        can_play = false;
        celebrate();
      }
    });
    

  }
  else if (isSelected[i])
  {

    if (i == last_selected)
    {
      if (path.length>=2)
      {
        d3.select("#"+link_id(last_selected,path[path.length-2]))
          .transition()
          .attr("stroke",default_link_color)
          .attr("stroke-width", default_link_width)
      }

      d3.select("#node-"+i)
        .transition()
        .attr("fill", "#fff")
        .attr("stroke", "#000");
      path.pop();
      isSelected[i] = false;

    }
    else
    {
      for(let j=path.length-1; j>=0 && i!=path[j]; --j)
      {
        if (j-1>=0)
        {
          d3.select("#"+link_id(path[j],path[j-1]))
            .transition()
            .attr("stroke",default_link_color)
            .attr("stroke-width", default_link_width);
        }

        d3.select("#node-"+path[j])
          .transition()
          .attr("fill", "#fff")
          .attr("stroke", "#000");
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

  //console.log(path,last_selected);
  //draw_path();
}

function handleLinkMouseOver(d,i)
{
  let this_link = links[i];
  let this_target_node;
  if (this_link.target == last_selected)
    this_target_node = this_link.source;
  else if (this_link.source == last_selected)
    this_target_node = this_link.target;
  else
    return;

  handleMouseOver("",this_target_node);
}

function handleLinkMouseOut(d,i)
{
  let this_link = links[i];
  let this_target_node;
  if (this_link.target == last_selected)
    this_target_node = this_link.source;
  else if (this_link.source == last_selected)
    this_target_node = this_link.target;
  else
    return;

  handleMouseOut("",this_target_node);
}

function handleLinkMouseClick(d,i)
{
  let this_link = links[i];
  let this_target_node;
  if (this_link.target == last_selected)
    this_target_node = this_link.source;
  else if (this_link.source == last_selected)
    this_target_node = this_link.target;
  else
    return;

  handleMouseClick("",this_target_node);
}

function celebrate()
{
  let celebration = "path";
  can_play = false;

  let link_selection = "";
  let node_selection = "";

  for (let i=0; i<path.length-1; ++i)
  {
    if (link_selection.length > 0)
    {
      link_selection += ",";
      node_selection += ",";
    }

    link_selection += "#" + link_id(path[i],path[i+1]);
    node_selection += "#node-" + path[i];
  }

  node_selection += ",#node-" + path[path.length-1];

  if (contains(graph[path[0]], last_selected))
  {
    celebration = "cycle";
      d3.select("#"+link_id(path[0],last_selected))
        .attr("stroke",select_color)      
        .attr("stroke-width", 3);
    link_selection += ",#" + link_id(path[0],last_selected);
  }

  function repeat(){
    d3.selectAll(node_selection)
      .transition()
      .duration(500)
      .attr("r",2*radius)
      .transition()
      .duration(500)
      .attr("r",radius);

    d3.selectAll(link_selection)
      .transition()
      .duration(500)
      .attr("stroke-width",6)
      .transition()
      .duration(500)
      .attr("stroke-width",3)
      //.on("end",repeat());
  }
  console.log(node_selection);
  console.log(link_selection);

  repeat();
}

function draw_path()
{
  let path_links = [];
  if (path.length >= 2)
  {
    for(let i=0; i<path.length-1; ++i)
    {
      path_links.push({source:path[i], target:path[i+1], id: i});
    }
  }

  console.log(path_links);

  base_path.data(path_links);

  base_path.enter()
    .append("line")
    .attr("x1",d => xScale(nodes[d.source].x))
    .attr("y1",d => yScale(nodes[d.source].y))
    .attr("x2",d => xScale(nodes[d.source].x))
    .attr("y2",d => yScale(nodes[d.source].y))
  .merge(base_path)
  .transition(200)
    .attr("x2",d => xScale(nodes[d.target].x))
    .attr("y2",d => yScale(nodes[d.target].y));

  base_path.exit().remove();
}
