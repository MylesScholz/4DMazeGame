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
        if (!vertex) return false
        if (this.value != vertex.value) return false
        if (this.degree != vertex.degree) return false
        if (this.discovered != vertex.discovered) return false
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

export { Vertex, Edge, Graph }
