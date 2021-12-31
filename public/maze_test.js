//Don't know where you want this, but the variable "size" is the dynamically
//stored maze size array 
var finalTime = ""
var wonGame = false

class Vertex {
    constructor(value, degree = 0, discovered = false) {
        this.value = value
        this.neighbors = []
        this.degree = degree
        this.discovered = discovered
    }

    toString() {
        return `(${this.value})`
    }

    equals(vertex) {
        if (vertex) {
            if (!vertex instanceof Vertex) return false
            if (this.value != vertex.value) return false
            if (this.degree != vertex.degree) return false
            if (this.discovered != vertex.discovered) return false
        }
        return true
    }

    addNeighbor(vertex) {
        this.neighbors.push(vertex)
        this.degree++
    }

    addNeighborReciprocal(vertex) {
        vertex.addNeighbor(this)
        this.neighbors.push(vertex)
        this.degree++
    }

    removeNeighbor(vertex) {
        this.neighbors.filter((value) => {
            return !value.equals(vertex)
        })
    }

    removeNeighborByIndex(index) {
        if (index < 0 || index >= this.degree) throw new RangeError(`Index out of bounds. (${index})`)

        this.neighbors.splice(index, 1)
        this.degree--
    }

    removeNeighborByIndexReciprocal(index) {
        if (index < 0 || index >= this.degree) throw new RangeError('Index out of bounds.')

        const i = this.neighbors[index].indexOf(this)
        if (i !== -1) {
            this.neighbors[index].removeNeighborByIndex(i)
        }
        this.neighbors.splice(index, 1)
        this.degree--
    }

    indexOf(vertex) {
        for (let i = 0; i < this.degree; i++) {
            if (this.neighbors[i].equals(vertex)) {
                return i
            }
        }
        return -1
    }
}

class Edge {
    constructor() {
        if (arguments.length > 2) throw new SyntaxError('Too many arguments.')

        this.vertices = []
        for (let argument of arguments) {
            this.vertices.push(argument)
        }
        if (this.vertices.length === 2) {
            this.vertices[0].addNeighborReciprocal(this.vertices[1])
        }
    }

    toString() {
        return '{' + this.vertices[0] + ', ' + this.vertices[1] + '}'
    }

    addVertex(vertex) {
        if (this.vertices.length < 2) {
            if (this.vertices.length === 1) {
                vertex.addNeighborReciprocal(this.vertices[0])
            }
            this.vertices.push(vertex)
        }
    }

    removeVertexByIndex(index) {
        if (index < 0 || index >= 2) throw new RangeError('Index out of bounds.')

        if (this.vertices.length === 2) {
            const i = this.vertices[index].indexOf(this.vertices[1 - index])
            this.vertices[index].removeNeighborByIndexReciprocal(i)
        }
        this.vertices.splice(index, 1)
    }

    contains(vertex) {
        if (this.vertices[0].equals(vertex) || this.vertices[1].equals(vertex)) {
            return true
        }
        return false
    }
}

class Graph {
    constructor(vertices = [], edges = []) {
        this.vertices = vertices
        this.edges = edges
        this.order = this.vertices.length
        this.size = this.edges.length
    }

    copy(graph) {
        if (graph instanceof Graph) {
            for (let i = 0; i < graph.order; i++) {
                this.addVertex(new Vertex(graph.vertices[i].value, graph.vertices[i].degree, graph.vertices[i].discovered))
            }
            for (let i = 0; i < graph.size; i++) {
                const j = graph.indexOf(graph.edges[i].vertices[0])
                const k = graph.indexOf(graph.edges[i].vertices[1])
                this.connectVerticesByIndex(j, k)
            }
        }
    }

    toString() {
        let string = 'V: {'
        for (let i = 0; i < this.order - 1; i++) {
            string += this.vertices[i] + ', '
        }
        string += this.vertices[this.order - 1] + '}\n'

        string += 'E: {'
        for (let i = 0; i < this.size - 1; i++) {
            string += this.edges[i] + ', '
        }
        string += this.edges[this.size - 1] + '}\n'
        return string
    }

    addVertex(vertex) {
        this.vertices.push(vertex)
        this.order++
    }

    removeVertexByIndex(index) {
        if (index < 0 || index >= this.order) throw new RangeError('Index out of bounds.')
        const vertex = this.vertices[index]

        this.edges = this.edges.filter((value) => {
            return !value.contains(vertex)
        })
        for (let neighbor of vertex.neighbors) {
            const i = neighbor.indexOf(vertex)
            neighbor.removeNeighborByIndex(i)
        }

        this.vertices.splice(index, 1)
        this.order--
        this.size = this.edges.length
    }

    addEdge(edge) {
        this.edges.push(edge)
        this.size++
    }

    connectVerticesByIndex(i, j) {
        if (i < 0 || j < 0 || i >= this.order || j >= this.order) throw new RangeError('Index out of bounds.')
        this.addEdge(new Edge(this.vertices[i], this.vertices[j]))
    }

    removeEdgeByIndex(index) {
        if (index < 0 || index >= this.size) throw new RangeError('Index out of bounds.')

        this.edges[index].removeVertexByIndex(0)
        this.edges[index].removeVertexByIndex(1)
        this.edges.splice(index, 1)
        this.size--
    }

    removeEdgeBetween(vertex1, vertex2) {
        let index = -1
        for (let i = 0; i < this.size; i++) {
            if (this.edges[i].contains(vertex1) && this.edges[i].contains(vertex2)) {
                index = i
            }
        }
        this.removeEdgeByIndex(index)
    }

    indexOf(object) {
        for (let i = 0; i < this.order; i++) {
            if (this.vertices[i].equals(object)) {
                return i
            }
        }

        for (let i = 0; i < this.size; i++) {
            if (this.edges[i].contains(object.vertices[0]) && this.edges[i].contains(object.vertices[1])) {
                return i
            }
        }
        return -1
    }
}

class Maze {
    constructor(n1, n2, n3, n4) {
        this.dimensions = [n1, n2, n3, n4]
        this.graph = new Graph()
        this.playerVertex = undefined
        this.playerPosition = [0, 0, 0, 0]

        for (let i = 0; i < n1; i++) {
            for (let j = 0; j < n2; j++) {
                for (let k = 0; k < n3; k++) {
                    for (let l = 0; l < n4; l++) {
                        this.graph.addVertex(new Vertex(`${i}|${j}|${k}|${l}`))
                    }
                }
            }
        }

        for (let i = 0; i < n1; i++) {
            for (let j = 0; j < n2; j++) {
                for (let k = 0; k < n3; k++) {
                    for (let l = 0; l < n4; l++) {
                        if ((i - 1) >= 0) {
                            this.graph.connectVerticesByIndex((i - 1)*n2*n3*n4 + j*n3*n4 + k*n4 + l, i*n2*n3*n4 + j*n3*n4 + k*n4 + l)
                        }

                        if ((j - 1) >= 0) {
                            this.graph.connectVerticesByIndex(i*n2*n3*n4 + (j - 1)*n3*n4 + k*n4 + l, i*n2*n3*n4 + j*n3*n4 + k*n4 + l)
                        }

                        if ((k - 1) >= 0) {
                            this.graph.connectVerticesByIndex(i*n2*n3*n4 + j*n3*n4 + (k - 1)*n4 + l, i*n2*n3*n4 + j*n3*n4 + k*n4 + l)
                        }

                        if ((l - 1) >= 0) {
                            this.graph.connectVerticesByIndex(i*n2*n3*n4 + j*n3*n4 + k*n4 + (l - 1), i*n2*n3*n4 + j*n3*n4 + k*n4 + l)
                        }
                    }
                }
            }
        }

        this.playerVertex = this.getVertexByCoordinate(this.playerPosition)
    }

    generate() {
        let walls = new Graph()
        walls.copy(this.graph)

        walls.vertices[0].discovered = true
        let s = [walls.vertices[0]]

        while (s.length > 0) {
            const v = s.pop()
            const undiscoveredNeighbors = v.neighbors.filter((value) => {
                return !value.discovered
            })
            if (undiscoveredNeighbors.length > 0) {
                s.push(v)
                const u = undiscoveredNeighbors[Math.floor(Math.random() * undiscoveredNeighbors.length)]
                // Delete the edge between v and u
                walls.removeEdgeBetween(v, u)

                u.discovered = true
                s.push(u)
            }
        }

        for (let i = 0; i < walls.size; i++) {
            const j = walls.indexOf(walls.edges[i].vertices[0])
            const k = walls.indexOf(walls.edges[i].vertices[1])
            this.graph.removeEdgeBetween(this.graph.vertices[j], this.graph.vertices[k])
        }
    }

    movePlayerToCoordinate(coordinate) {
        this.playerPosition = coordinate
        this.playerVertex = this.getVertexByCoordinate(this.playerPosition)
    }

    movePlayerToNeighborByIndex(index) {
        this.playerVertex = this.playerVertex.neighbors[index]
        this.playerPosition = this.getCoordinateFromVertex(this.playerVertex)
    }

    getVertexByCoordinate(coordinate) {
        return this.graph.vertices[coordinate[0]*this.dimensions[1]*this.dimensions[2]*this.dimensions[3] + coordinate[1]*this.dimensions[2]*this.dimensions[3] + coordinate[2]*this.dimensions[3] + coordinate[3]]
    }

    getCoordinateFromVertex(vertex) {
        let a = vertex.value.split('|')
        a.forEach((value, index, array) => { array[index] = parseInt(value) })
        return a
    }

    getTopVertex(vertex) {
        const coordinate = this.getCoordinateFromVertex(vertex)
        coordinate[1] -= 1
        return this.getVertexByCoordinate(coordinate)
    }

    getRightVertex(vertex) {
        const coordinate = this.getCoordinateFromVertex(vertex)
        coordinate[0] += 1
        return this.getVertexByCoordinate(coordinate)
    }

    getBottomVertex(vertex) {
        const coordinate = this.getCoordinateFromVertex(vertex)
        coordinate[1] += 1
        return this.getVertexByCoordinate(coordinate)
    }

    getLeftVertex(vertex) {
        const coordinate = this.getCoordinateFromVertex(vertex)
        coordinate[0] -= 1
        return this.getVertexByCoordinate(coordinate)
    }

    getAboveVertex(vertex) {
        const coordinate = this.getCoordinateFromVertex(vertex)
        coordinate[2] += 1
        return this.getVertexByCoordinate(coordinate)
    }

    getBelowVertex(vertex) {
        const coordinate = this.getCoordinateFromVertex(vertex)
        coordinate[2] -= 1
        return this.getVertexByCoordinate(coordinate)
    }

    getBeyondVertex(vertex) {
        const coordinate = this.getCoordinateFromVertex(vertex)
        coordinate[3] += 1
        return this.getVertexByCoordinate(coordinate)
    }

    getBehindVertex(vertex) {
        const coordinate = this.getCoordinateFromVertex(vertex)
        coordinate[3] -= 1
        return this.getVertexByCoordinate(coordinate)
    }
}

// ===================================================================================================================

let req = new XMLHttpRequest()
req.open('GET', '/size.json')
req.responseType = 'json'
req.send()

req.onload = function() {
    const size = req.response;
    console.log("Maze size: ", size)

    var goal = []

    const numColumns = size[1];
    const numRows = size[0];
    const numLayers = size[2];
    const numStacks = size[3];
    const mazeMap = new Maze(numRows, numColumns, numLayers, numStacks);

    // this array should be used to generate maze walls
    // [right, left, up, down]
    // a '1' indicates no wall in that direction, a '-1' indicates there is a wall in that direction
    var tileLookupArray = make(10, 5);
    // console.log(tileLookupArray);

    // Thank you Mahak Singh! - https://medium.com/@makk.bit/scroll-into-view-if-needed-10a96e0bdb61
    const scrollIntoViewIfNeeded = target => {
        // Target is outside the viewport from the bottom
        if (target.getBoundingClientRect().bottom > window.innerHeight) {
            //  The bottom of the target will be aligned to the bottom of the visible area of the scrollable ancestor.
            target.scrollIntoView(false);
        }

        // Target is outside the view from the top
        if (target.getBoundingClientRect().top < 0) {
            // The top of the target will be aligned to the top of the visible area of the scrollable ancestor
            target.scrollIntoView();
        }
    };

    function parseCoordinateString(coordinate) {
        // 'coordinate' will look something like: '6|7|3|1'
        var values = [-1, -1, -1, -1]
        values[0] = coordinate[0]
        values[1] = coordinate[2]
        values[2] = coordinate[4]
        values[3] = coordinate[6]

        return values;
    }

    function make(dim, lvl, arr) {
        if (lvl === 1) return [-1, -1, -1, -1]; // this is where tilelookuparray values are stored
        if (!lvl) lvl = dim;
        if (!arr) arr = [];
        for (var i = 0, l = dim; i < l; i += 1) {
        arr[i] = make(dim, lvl - 1, arr[i]);
        }
        return arr;
    }

    function createId(x_, y_, z_, w_) {
        var id = x_ + '|' + y_ + '|' + z_ + '|' + w_
        return id;
    }

    function winGame() {
        if (wonGame == false) {
            wonGame = true
            console.log("Game won!")
            stopClock()
            var finalScore = convertTime()
            showWinScreen()

            console.log(finalScore)

            let score = new XMLHttpRequest()
            var url = '/maze/win'
            score.open('POST', url)
            score.setRequestHeader('Content-Type', 'application/json')
            var reqBody = JSON.stringify({finalScore})

            console.log(reqBody)

            score.send(reqBody)
        }


    }

    class Tile extends React.Component {
        constructor(props) {
            super(props);
            this.myRef = React.createRef();
        }
        // [right, left, top, bottom]
        // a '1' indicates no wall in that direction, a '-1' indicates there is a wall in that direction

        highlight(pos) {
            var value = createId(this.props.y, this.props.x, this.props.z, this.props.w)
            var idName = "id" + value

            let x = this.props.x
            let y = this.props.y
            let z = this.props.z
            let w = this.props.w
            let xP = pos[1]
            let yP = pos[0]
            let zP = pos[2]
            let wP = pos[3]
            let xG = goal[1]
            let yG = goal[0]
            let zG = goal[2]
            let wG = goal[3]

            if (xP == xG && yP == yG && zP == zG && wP == wG) {
                var element = document.getElementById(idName)
                if (element != null) scrollIntoViewIfNeeded(element)

                winGame()
                return '#023e8a'
            }

            if (x == xP && y == yP && z == zP && w == wP) {
                console.log("highlighted tile:", tileLookupArray[y][x][z][w])
                var element = document.getElementById(idName)
                if (element != null) scrollIntoViewIfNeeded(element)

                return 'red'
            }

            if (x == xG && y == yG && z == zG && w == wG) {
                return 'yellow'
            }

            // if (tileLookupArray[y][x][z][w] === 1) {
            //     return 'purple'
            // }
        }

        // [right, left, top, bottom]
        renderLeftBorder(x, y, z, w) {
            if (this.props.x == 0) {
                return '1px solid black'
            } else if (tileLookupArray[y][x][z][w][1] == 1) {
                return '0'
            } else {
                return '1px solid black'
            }
        }

        renderRightBorder(x, y, z, w) {
            if (this.props.x == numColumns - 1) {
                return '1px solid black'
            } else if (tileLookupArray[y][x][z][w][0] == 1) {
                return '0'
            } else {
                return '1px solid black'
            }
        }

        renderTopBorder(x, y, z, w) {
            if (this.props.y == 0) {
                return '1px solid black'
            } else if (tileLookupArray[y][x][z][w][2] == 1) {
                // if (x!=0) tileLookupArray[y][x-1][z][w][3] = 1
                return '0'
            } else if (x != 0 && tileLookupArray[y][x-1][z][w][3] == 1) {
                return '1px solid black'
            } else {
                return '1px solid black'
            }
        }

        renderBottomBorder(x, y, z, w) {
            if (this.props.y == numRows - 1) {
                return '1px solid black'
            } else if (tileLookupArray[y][x][z][w][3] == 1) {
                return '0'
            } else if (tileLookupArray[y][x+1][z][w][2] == 1) { //
                return '1px solid black'
            } else {
                return '1px solid black'
            }
        }

        render() {
            var value = createId(this.props.y, this.props.x, this.props.z, this.props.w)
            var idName = "id" + value

            return (
                <button
                    className='tile'
                    id={idName} 
                    style={{
                        background: this.highlight(this.props.player),
                        borderLeft: this.renderLeftBorder(this.props.x, this.props.y, this.props.z, this.props.w),
                        borderRight: this.renderRightBorder(this.props.x, this.props.y, this.props.z, this.props.w),
                        borderTop: this.renderTopBorder(this.props.x, this.props.y, this.props.z, this.props.w),
                        borderBottom: this.renderBottomBorder(this.props.x, this.props.y, this.props.z, this.props.w),
                    }}
                >
                    {}
                </button>
            );
        }
    }

    class Row extends React.Component {
        constructor(props) {
            super(props);
            this.myRef = React.createRef();
        }

        render() {
            var tileIndices = [];

            for (let i = 0; i < numColumns; i++) {
                tileIndices.push(i);
            }

            const tiles = tileIndices.map((index) =>
                <Tile ref={this.myRef} key={index} x={index} y={this.props.y} z={this.props.z} w={this.props.w} player={this.props.player} />
            );

            return tiles;
        }
    }

    class Layer extends React.Component {
        render() {
            var rowIndices = [];

            for (let i = 0; i < numRows; i++) {
                rowIndices.push(i);
            }

            const rows = rowIndices.map((index) =>
                <div key={index} >
                    <Row y={index} z={this.props.z} w={this.props.w} player={this.props.player} />
                </div>
            );

            return rows;
        }
    }

    class Stack extends React.Component {
        render() {
            var layerIndices = [];
            for (let i = 0; i < numLayers; i++) {
                layerIndices.push(i);
            }

            const layers = layerIndices.map((index) =>
                <div key={index} className="layer" style={{padding: '10px', position: 'relative', display: 'table'}}>
                    <Layer z={index} w={this.props.w} player={this.props.player} />
                </div>
            );

            return layers;
        }
    }

    class MazeRenderer extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                playerPosition: [1, 0, 0, 0],
            }

            window.addEventListener('keydown', this.handleKeyInput.bind(this))
            this.generateMaze();
            this.generateGoal();
        }

        generateGoal() {
            goal[0] = Math.floor(Math.random() * (numRows - 1));
            goal[1] = Math.floor(Math.random() * (numColumns - 1));
            goal[2] = Math.floor(Math.random() * (numLayers - 1));
            goal[3] = Math.floor(Math.random() * (numStacks - 1));
            console.log("Goal:", goal)
        }

        generateMaze() {
            mazeMap.generate();
            
            for (let edge of mazeMap.graph.edges) {
                var u = parseCoordinateString(edge.vertices[0].value)
                var v = parseCoordinateString(edge.vertices[1].value)

                var uX = u[0]
                var vX = v[0]
                var uY = u[1]
                var vY = v[1]

                // console.log(edge.vertices)

                // [right, left, top, bottom]
                // If v is above u - u needs no top border, v needs no bottom border
                // Sometimes, vertically adjacent tiles will not allow movement through each other...
                if (uY == vY - 1) {
                    tileLookupArray[u[0]][u[1]][u[2]][u[3]][0] = 1
                    tileLookupArray[v[0]][v[1]][v[2]][v[3]][1] = 1
                }

                // If v is to the right of u - v needs no left border, u needs no right border
                if (uX == vX - 1) {
                    tileLookupArray[u[0]][u[1]][u[2]][u[3]][2] = 1
                    tileLookupArray[v[0]][v[1]][v[2]][v[3]][3] = 1
                }
            }

            // console.log("tileLookupArray", tileLookupArray)

            for (let edge of mazeMap.graph.edges) {
                var u = parseCoordinateString(edge.vertices[0].value)
                var uX = u[0]
                var uY = u[1]
                var uZ = u[2]
                var uW = u[3]
                
                // For every tile, if there is no top wall, force the top-neighbor to have no bottom wall
                // [right, left, top, bottom]
                // a '1' indicates no wall in that direction, a '-1' indicates there is a wall in that direction
                if (tileLookupArray[uX][uY][uZ][uW][2] == 1) {
                    if (uX > 0) {
                        tileLookupArray[uX-1][uY][uZ][uW][3] = 1;
                    }
                }
            }

            for (let edge of mazeMap.graph.edges) {
                var u = parseCoordinateString(edge.vertices[0].value)
                var uX = u[0]
                var uY = u[1]
                var uZ = u[2]
                var uW = u[3]
                
                // If there is no bottom wall, force the bottom-neighbor to have no top wall
                if (tileLookupArray[uX][uY][uZ][uW][3] == 1) {
                    uX = Number.parseInt(uX, 10)
                    if (uX < numRows - 1) {
                        tileLookupArray[uX+1][uY][uZ][uW][2] = 1;
                    }
                }
            }
        }

        handleKeyInput = (e) => {
            const code = e.keyCode ? e.keyCode : e.which;

            // [right, left, up, down]
            // a '1' indicates no wall in that direction, a '-1' indicates there is a wall in that direction
            // Up key
            if (code === 38 && this.state.playerPosition[0] > 0) {
                e.preventDefault()
                var thisTile = tileLookupArray[this.state.playerPosition[0]][this.state.playerPosition[1]][this.state.playerPosition[2]][this.state.playerPosition[3]]
                console.log("thisTile:", thisTile)

                if (thisTile[2] == 1) {
                    console.log("thisTile[2]:", thisTile[2])
                    var newPos = this.state.playerPosition
                    newPos[0] -= 1

                    this.setState({playerPosition: newPos})
                    // console.log("up:", this.state.playerPosition)
                }
            }

            if (code === 40 && this.state.playerPosition[0] < numRows - 1) {
                e.preventDefault()
                var thisTile = tileLookupArray[this.state.playerPosition[0]][this.state.playerPosition[1]][this.state.playerPosition[2]][this.state.playerPosition[3]]
                console.log("thisTile:", thisTile)

                // Wall below
                if (thisTile[3] == 1) {
                    var newPos = this.state.playerPosition
                    newPos[0] += 1

                    this.setState({playerPosition: newPos})
                    // console.log("down:", this.state.playerPosition)
                }
            }

            // Left key
            if (code === 37 && this.state.playerPosition[1] > 0) {
                e.preventDefault()
                var thisTile = tileLookupArray[this.state.playerPosition[0]][this.state.playerPosition[1]][this.state.playerPosition[2]][this.state.playerPosition[3]]
                console.log("thisTile:", thisTile)

                // Wall to the left
                if (thisTile[1] == 1) {
                    var newPos = this.state.playerPosition
                    newPos[1] -= 1

                    this.setState({playerPosition: newPos})
                    // console.log("left:", this.state.playerPosition)
                }
            }

            // Right key
            if (code === 39 && this.state.playerPosition[1] < numColumns - 1) {
                e.preventDefault()
                var thisTile = tileLookupArray[this.state.playerPosition[0]][this.state.playerPosition[1]][this.state.playerPosition[2]][this.state.playerPosition[3]]
                console.log("thisTile:", thisTile)

                // Wall to the right
                if (thisTile[0] == 1) {
                    var newPos = this.state.playerPosition
                    newPos[1] += 1

                    this.setState({playerPosition: newPos})
                    // console.log("right:", this.state.playerPosition)
                }
            }

            // S key
            if (code === 83 && this.state.playerPosition[2] < numLayers - 1) {
                e.preventDefault()
                var newPos = this.state.playerPosition
                newPos[2] += 1

                this.setState({playerPosition: newPos})
                // console.log("S:", this.state.playerPosition)
            }

            // W key
            if (code === 87 && this.state.playerPosition[2] > 0) {
                e.preventDefault()
                var newPos = this.state.playerPosition
                newPos[2] -= 1

                this.setState({playerPosition: newPos})
                // console.log("W:", this.state.playerPosition)
            }

            // D key
            if (code === 68 && this.state.playerPosition[3] < numStacks - 1) {
                e.preventDefault()
                var newPos = this.state.playerPosition
                newPos[3] += 1

                this.setState({playerPosition: newPos})
                // console.log("D:", this.state.playerPosition)
            }

            // A key
            if (code === 65 && this.state.playerPosition[3] > 0) {
                e.preventDefault()
                var newPos = this.state.playerPosition
                newPos[3] -= 1

                this.setState({playerPosition: newPos})
                // console.log("D:", this.state.playerPosition)
            }
        }
        
        render() {
            var stackIndices = [];
            for (let i = 0; i < numStacks; i++) {
                stackIndices.push(i);
            }

            const stacks = stackIndices.map((index) =>
                <div key={index} className="stacks" style={{margin: '10px', position: 'relative', display: 'inline-table'}}>
                    <Stack w={index} player={this.state.playerPosition} />
                </div>
            );

            return stacks;
        }
    }

    // ===========================

    ReactDOM.render(
        <MazeRenderer />,
        document.getElementById('root')
    );

    var tiles = document.getElementsByClassName('tile')
    for (let tile of tiles) {
        tile.style.removeProperty('border-width')
    }
}

var secOnes = document.getElementById("secOnes")
var secTens = document.getElementById("secTens")
var minOnes = document.getElementById("minOnes")
var minTens = document.getElementById("minTens")
var crntSecOnes = 0
var crntSecTens = 0
var crntMinOnes = 0
var crntMinTens = 0
var totalSecs = 0
var oneSecond = null

// Starts the stopwatch
var startClock = window.addEventListener("load", function () {
    oneSecond = setInterval(incTime, 1000)
    console.log("Clock start")
});

// Displays current elapsed time on maze.html
function incTime() {
    totalSecs++
    console.log("One second has passed")

    if (crntSecOnes == 9) {
        secOnes.textContent = 0
        crntSecOnes = 0
        crntSecTens++
        secTens.textContent = crntSecTens

        if (crntSecTens > 5) {
            secTens.textContent = 0
            crntSecTens = 0
            crntMinOnes++
            minOnes.textContent = crntMinOnes

            if (crntMinOnes > 9) {
                minOnes.textContent = 0
                crntMinOnes = 0
                crntMinTens++
                minTens.textContent = crntMinTens
            }
        }
    }
    else {
        crntSecOnes++
        secOnes.textContent = crntSecOnes
    }
}


// Stops the stopwatch
function stopClock() {
    clearInterval(oneSecond)
}

// Returns current elapsed seconds whenever it is called
function getTime() {
    return totalSecs
}

function convertTime() {
    var minutes = 0
    var seconds = 0

    if ((totalSecs % 60) > 0) {
        minutes = Math.floor(totalSecs / 60)
    }
    else {
        minutes = totalSecs / 60 
    }

    seconds = totalSecs % 60

    var minString = minutes.toString()
    var secString = seconds.toString()

    if (seconds < 10) {
        finalTime = minString + ":0" + secString
    }
    else {
        finalTime = minString + ":" + secString
    }

    return finalTime
}

/***************WIN SCREEN*********************************/

function showWinScreen() {
    window.location.href = "http://localhost:3000/win"
}

/***************PAUSE BUTTON******************************** */


var pauseButton = document.getElementById('pause-button')
var pauseModal = document.getElementById('pause-backdrop')
pauseButton.addEventListener('click', function () {
    pauseModal.classList.add("not-hidden")
    
    
    
})

document.addEventListener('keypress', function () {
    pauseModal.classList.remove("not-hidden")
    
})