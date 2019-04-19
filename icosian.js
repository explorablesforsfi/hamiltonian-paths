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

const width = 400;
const height = 400;
const svg = d3.select('#icosian_container')
              .append("svg")
              .attr('width',width)
              .attr('height',height);

let links, nodes;
let link, node;

let path = [];

let dod_origin = [width/2, height/2];
let scale = 30;
let xScale = d3.scaleLinear().domain([0,1]).range([dod_origin[0],dod_origin[0]+scale]);
let yScale = d3.scaleLinear().domain([0,1]).range([dod_origin[1]+scale,dod_origin[1]]);
let radius = 8;
let deselect_color = "#333";
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
let celebration_duration = 250;
let celebration_ease = d3.easeCircleInOut;
let celebration_line = d3.line().x(d=>d[0]).y(d=>d[1]).curve(d3.curveBasis);
let celebration_path;
let celebration_text;
// funky celebration
let celeb_data_0 = [[1.2*width/3.5,height/5],[1.2*width/2,height/20],[2.6*width/3.5,height/5]];
let celeb_data_1 = [[1.2*width/3.5,height/5],[0.8*width/2,height/20],[2.6*width/3.5,height/5]];
//not so funky celebration
celeb_data_0 = [[width/5,height/8],[width,height/8]];
celeb_data_1 = [[width/2.5,height/8],[width,height/8]];


// load the data and create the svg elements

d3.json(graph_url).then(function(data){
  links = data.links.map(d => Object.create(d));
  nodes = data.nodes.map(d => Object.create(d));

  data.nodes.forEach(function(d){
    graph.push([]);
    isSelected.push(false);
  });

  data.links.forEach(function(d){
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

  celebration_path = svg.append("g")
    .attr("stroke-width",1)
    .attr("stroke","rgba(0,0,0,0)")
    .attr("fill","rgba(0,0,0,0)")
    .append("path")
    .attr("d",celebration_line(celeb_data_0))
    .attr("id","celeb")
  ;
              
  celebration_text = svg.append("text")
    .attr("font-family", "Helvetica")
    .attr("id","celeb-text")
    .append("textPath")
    .attr("xlink:href","#celeb");

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
  path.length = 0;
  last_selected = null;
  can_play = true;
  isSelected = nodes.map(n => false)

  base_link.transition()
      .attr("stroke", default_link_color)
      .attr("stroke-opacity", 1.0)
      .attr("stroke-width",  default_link_width)
     ;

  base_node.transition()
      .attr("fill", "#fff")
      .attr("stroke-width", 1)
      .attr("r",radius)
      ;

  celebration_text
      .text("")
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
      .style("cursor", "pointer"); 
    ;
    return;
  }


  if (isSelected[i])
  {
    d3.select("#node-"+i)
      .attr("stroke", deselect_color)
      .attr("stroke-width", 2)
      .style("cursor", "pointer"); 
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
      .style("cursor", "pointer"); 
    ;
    d3.select("#"+link_id(i,last_selected))
      .attr("stroke",select_color)
      .attr("stroke-width",2)
      .style("cursor", "pointer"); 
  }
}

function handleMouseOut(d, i) {
    d3.select("#node-"+i)
      .attr("stroke", "#333")
      .attr("stroke-width", 1.0)
      .style("cursor", "default"); 
  ;
  if ( (!isSelected[i]) && 
       ( 
          (last_selected === null) || 
          (contains(graph[i],last_selected)) 
       )
     )
  {
    d3.select("#"+link_id(i,last_selected))
      .attr("stroke",default_link_color)
      .attr("stroke-width",default_link_width)
      .style("cursor", "pointer"); 
  }
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
      let link_selection = "#"+link_id(i,last_selected);
      d3.select(link_selection)
        .transition()
        .attr("stroke",select_color)
        .attr("stroke-width",3)
    }

    path.push(i);
    last_selected = i;
    isSelected[i] = true;

    if ((path.length == nodes.length) && (contains(graph[path[0]], last_selected)))
    {
      let link_selection = "#"+link_id(path[0],last_selected);
      d3.select(link_selection)
        .transition()
        .attr("stroke",select_color)
        .attr("stroke-width",3);
    }

    d3.select("#node-"+i)
          .transition()
      .attr("fill", select_color)
      .attr("stroke", "#333")
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
        .attr("stroke", "#333");
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
          .attr("stroke", "#333");
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

  handleMouseOut(d,i);
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
    link_selection += ",#" + link_id(path[0],last_selected);
  }
  celebration_text
    .text("YOU FOUND A "+celebration.toUpperCase()+"!")
    ;

  function repeat(){
    d3.select("#celeb-text")
      .transition()
      .ease(celebration_ease)
      .duration(celebration_duration)
      .attr('fill',select_color)
      //.attr("transform","rotate(180 "+dod_origin[0]+" "+dod_origin[1]+")")
      .transition()
      .ease(celebration_ease)
      .duration(celebration_duration)
      .attr('fill','#000')
      //.attr("transform","rotate(360 "+dod_origin[0]+" "+dod_origin[1]+")")
    ;



    d3.select("#celeb")
      .transition()
      .ease(celebration_ease)
      .duration(celebration_duration)
      .attr("d",celebration_line(celeb_data_1))
      .transition()
      .ease(celebration_ease)
      .duration(celebration_duration)
      .attr("d",celebration_line(celeb_data_0))
    ;

      
    d3.selectAll(node_selection)
      .transition()
      .ease(celebration_ease)
      .duration(celebration_duration)
      .attr("r",Math.sqrt(2)*radius)
      .transition()
      .ease(celebration_ease)
      .duration(celebration_duration)
      .attr("r",radius);

    d3.selectAll(link_selection)
      .transition()
      .ease(celebration_ease)
      .duration(celebration_duration)
      .attr("stroke-width",7)
      .transition()
      .ease(celebration_ease)
      .duration(celebration_duration)
      .attr("stroke-width",3)
      .on("end",function(){
        d3.timeout(repeat,0);
      });
  }

  repeat();
}

// maybe later
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
