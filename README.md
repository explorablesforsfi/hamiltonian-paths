# Hamiltion Paths and the Icosian Game

Try finding a Hamiltonian path/cycle in the planar dodecahedron Graph (Hamilton's Icosian game).

## Run

First, clone this repository

    git clone https://github.com/explorablesforsfi/hamiltonian-paths.git

Then change to the created directory and start a local webserver

    cd hamiltonian-paths
    python -m "http.server" 1313
    
Go to your browser and navigate to http://localhost:1313 .

![output](https://github.com/explorablesforsfi/hamilton-paths/raw/master/img/example.gif)

## License

All original code in this repository, i.e. all code which is not in the subdirectory `/libs/` is licensed under the CC 4.0 licence. The subdirectory `/libs/` contains external libraries which are licensed as follows

 
| File name                      | License                                 | Link to repository|
|--------------------------------|-----------------------------------------|-------------------|
| `d3-color.v1.min.js`           | BSD 3-Clause "New" or "Revised" License | [d3-color](https://github.com/d3/d3-color)|
| `d3-scale-chromatic.v1.min.js` | BSD 3-Clause "New" or "Revised" License | [d3-scale-chromatic](https://github.com/d3/d3-scale-chromatic)|
| `d3.v5.min.js`                 | BSD 3-Clause "New" or "Revised" License | [d3](https://github.com/d3/d3)|
| `widget.v3.4.js`               | permission to use given by D. Brockmann | [complexity explorables](http://www.complexity-explorables.org) |
