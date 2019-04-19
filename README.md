# Hamiltonian Paths and the Icosian Game

Try finding a Hamiltonian path/cycle in the planar dodecahedron Graph (Hamilton's Icosian game).

## Run

First, clone this repository

    git clone https://github.com/explorablesforsfi/hamiltonian-paths.git

Then change to the created directory and start a local webserver

    cd hamiltonian-paths
    python -m "http.server" 1313
    
Go to your browser and navigate to http://localhost:1313 .

![hamiltonian-paths](https://github.com/explorablesforsfi/hamiltonian-paths/raw/master/img/example.gif)

## Modify

Add your own graph as a json-file and load it in `index_html` as `graph_url = './path/to/graph.js'`. This file must be of the following structure:

```json
{
  "links": [
    {
      "source": 0,
      "target": 1
    },
    {
      "source": 0,
      "target": 19
    },
    ...
  ],
  "nodes": [
    {
      "id": 0,
      "x": 0.9510565162951535,
      "y": -0.3090169943749474
    },
    {
      "id": 1,
      "x": 0.5877852522924732,
      "y": 0.8090169943749473
    },
    ...
  ]
}
```

## License

All original code in this repository, i.e. all code which is not in the subdirectory `/libs/` is licensed under the CC 4.0 licence. The subdirectory `/libs/` contains external libraries which are licensed as follows

 
| File name                      | License                                 | Link to repository|
|--------------------------------|-----------------------------------------|-------------------|
| `d3.v5.min.js`                 | BSD 3-Clause "New" or "Revised" License | [d3](https://github.com/d3/d3)|
| `widget.v3.4.js`               | permission to use given by D. Brockmann | [complexity explorables](http://www.complexity-explorables.org) |
