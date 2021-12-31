import { Vertex, Edge, Graph } from './graph_class.js'

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
        let current = walls.vertices[0]
        let unvisited = []
        for (let i = 1; i < walls.order; i++) {
            unvisited.push(walls.vertices[i])
        }

        while (unvisited.length > 0) {
            const u = current.neighbors[Math.floor(Math.random() * current.neighbors.length)]
            if (!u.discovered) {
                walls.removeEdgeBetween(current, u)
                u.discovered = true
                unvisited.splice(unvisited.indexOf(u), 1)
            }
            current = u
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
        coordinate[0] -= 1
        return this.getVertexByCoordinate(coordinate)
    }

    getRightVertex(vertex) {
        const coordinate = this.getCoordinateFromVertex(vertex)
        coordinate[1] += 1
        return this.getVertexByCoordinate(coordinate)
    }

    getBottomVertex(vertex) {
        const coordinate = this.getCoordinateFromVertex(vertex)
        coordinate[0] += 1
        return this.getVertexByCoordinate(coordinate)
    }

    getLeftVertex(vertex) {
        const coordinate = this.getCoordinateFromVertex(vertex)
        coordinate[1] -= 1
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

export { Maze }