import { Edge } from './graph_class.js'
import { Maze } from './maze_class.js'

const instructionsElement = document.getElementById('instructions-container')
const pauseModalBackdrop = document.getElementById('pause-backdrop')
const pauseButton = document.getElementById('pause-button')
pauseButton.addEventListener('click', pause)
function pause(event) {
    if (!pauseModalBackdrop.classList.contains('pause-backdrop-hidden')) {
        // Unpaused
        pauseModalBackdrop.classList.add('pause-backdrop-hidden')
        pauseButton.textContent = 'Pause'
        startClock()
    } else {
        // Paused
        pauseModalBackdrop.classList.remove('pause-backdrop-hidden')
        pauseButton.textContent = 'Unpause'
        stopClock()
    }
}

const mazeReq = new XMLHttpRequest()
const mazeURL = '/maze.json'
mazeReq.open('GET', mazeURL)
mazeReq.onload = () => {
    let mazeConfig = JSON.parse(mazeReq.response)
    const mazeObject = new Maze(mazeConfig.size[0], mazeConfig.size[1], mazeConfig.size[2], mazeConfig.size[3])
    mazeObject.generate()
    const goal = [mazeConfig.size[0] - 1, mazeConfig.size[1] - 1, mazeConfig.size[2] - 1, mazeConfig.size[3] - 1]

    const winMessage = document.getElementById('win-message-container')

    const sliceTiles = document.querySelectorAll('#slice .row .tile')
    for (let tile of sliceTiles) {
        tile.addEventListener('click', (event) => {
            let toCoord = event.target.dataset.coordinate.split(',')
            toCoord.push(mazeConfig.slice[0], mazeConfig.slice[1])
            toCoord = toCoord.map(value => parseInt(value))
            const toVertex = mazeObject.getVertexByCoordinate(toCoord)
            const i = mazeObject.graph.indexOf(new Edge(mazeObject.playerVertex, toVertex))
            if (i !== -1) {
                mazeObject.movePlayerToCoordinate(toCoord)
                generateSlice()
            }
        })
    }

    const stackTiles = document.querySelectorAll('.stack .tile')
    for (let tile of stackTiles) {
        tile.addEventListener('click', (event) => {
            const tile = event.target
            const stack = tile.parentNode

            const sliceJSON = {
                "z": tile.dataset.z,
                "w": stack.dataset.w
            }
            const sliceReq = new XMLHttpRequest()
            const sliceURL = '/slice'
            sliceReq.open('POST', sliceURL)
            sliceReq.setRequestHeader('Content-Type', 'application/json')
            const sliceReqBody = JSON.stringify(sliceJSON)
            sliceReq.onload = () => {
                generateSlice()
            }
            sliceReq.send(sliceReqBody)
        })
    }

    generateSlice()

    function generateSlice() {
        const mazeReq = new XMLHttpRequest()
        const mazeURL = '/maze.json'
        mazeReq.open('GET', mazeURL)
        mazeReq.onload = () => {
            mazeConfig = JSON.parse(mazeReq.response)

            for (let tile of sliceTiles) {
                for (let arrow of tile.children) {
                    if (!arrow.classList.contains('arrow-hidden')) {
                        arrow.classList.add('arrow-hidden')
                    }
                }
            }

            for (let tile of sliceTiles) {
                tile.classList.remove('player-highlight')
                tile.classList.remove('adjacent-highlight')
                tile.classList.remove('goal-highlight')
                tile.classList.remove('remove-top-border')
                tile.classList.remove('remove-right-border')
                tile.classList.remove('remove-bottom-border')
                tile.classList.remove('remove-left-border')

                let tileCoord = tile.dataset.coordinate.split(',')
                tileCoord.push(mazeConfig.slice[0], mazeConfig.slice[1])
                tileCoord = tileCoord.map(value => parseInt(value))

                const u = mazeObject.getVertexByCoordinate(tileCoord)
                for (let v of u.neighbors) {
                    // u is above v
                    if (u.equals(mazeObject.getAboveVertex(v))) {
                        tile.querySelector('.top.left').classList.remove('arrow-hidden')
                    }

                    // u is below v
                    if (u.equals(mazeObject.getBelowVertex(v))) {
                        tile.querySelector('.bottom.right').classList.remove('arrow-hidden')
                    }

                    // u is beyond v
                    if (u.equals(mazeObject.getBeyondVertex(v))) {
                        tile.querySelector('.top.right').classList.remove('arrow-hidden')
                    }

                    // u is behind v
                    if (u.equals(mazeObject.getBehindVertex(v))) {
                        tile.querySelector('.bottom.left').classList.remove('arrow-hidden')
                    }
                }
            }
            for (let tile of stackTiles) {
                tile.classList.remove('player-highlight')
                tile.classList.remove('adjacent-highlight')
            }

            const playerStackTile = document.getElementById('stack-menu').children[mazeObject.playerPosition[3]].children[mazeObject.playerPosition[2]]
            playerStackTile.classList.add('player-highlight')

            const playerSliceTile = document.getElementById('slice').children[mazeObject.playerPosition[0]].children[mazeObject.playerPosition[1]]
            if (mazeObject.playerPosition[2] == mazeConfig.slice[0] && mazeObject.playerPosition[3] == mazeConfig.slice[1]) {
                playerSliceTile.classList.add('player-highlight')
            }

            const goalStackTile = document.getElementById('stack-menu').children[goal[3]].children[goal[2]]
            goalStackTile.classList.add('goal-highlight')

            const goalSliceTile = document.getElementById('slice').children[goal[0]].children[goal[1]]
            if (goal[2] == mazeConfig.slice[0] && goal[3] == mazeConfig.slice[1]) {
                goalSliceTile.classList.add('goal-highlight')
            }

            for (let edge of mazeObject.graph.edges) {
                const u = edge.vertices[0]
                const uCoord = mazeObject.getCoordinateFromVertex(u)
                const v = edge.vertices[1]
                const vCoord = mazeObject.getCoordinateFromVertex(v)

                if (u.equals(mazeObject.playerVertex) && (uCoord[2] != vCoord[2] || uCoord[3] != vCoord[3])) {
                    const adjacentSlice = document.getElementById('stack-menu').children[vCoord[3]].children[vCoord[2]]
                    adjacentSlice.classList.add('adjacent-highlight')

                    if (vCoord[2] == mazeConfig.slice[0] && vCoord[3] == mazeConfig.slice[1]) {
                        const adjacentTile = document.getElementById('slice').children[uCoord[0]].children[uCoord[1]]
                        adjacentTile.classList.add('adjacent-highlight')
                    }
                } else if (v.equals(mazeObject.playerVertex)  && (uCoord[2] != vCoord[2] || uCoord[3] != vCoord[3])) {
                    const adjacentSlice = document.getElementById('stack-menu').children[uCoord[3]].children[uCoord[2]]
                    adjacentSlice.classList.add('adjacent-highlight')

                    if (uCoord[2] == mazeConfig.slice[0] && uCoord[3] == mazeConfig.slice[1]) {
                        const adjacentTile = document.getElementById('slice').children[uCoord[0]].children[uCoord[1]]
                        adjacentTile.classList.add('adjacent-highlight')
                    }
                }
    
                if (uCoord[2] != mazeConfig.slice[0] || uCoord[3] != mazeConfig.slice[1] || vCoord[2] != mazeConfig.slice[0] || vCoord[3] != mazeConfig.slice[1]) continue
    
                const slice = document.getElementById('slice')
                const uTile = slice.children[uCoord[0]].children[uCoord[1]]
                const vTile = slice.children[vCoord[0]].children[vCoord[1]]
    
                if (u.equals(mazeObject.playerVertex)) {
                    vTile.classList.add('adjacent-highlight')
                }
                if (v.equals(mazeObject.playerVertex)) {
                    uTile.classList.add('adjacent-highlight')
                }

                // u is to the top of v
                if (u.equals(mazeObject.getTopVertex(v))) {
                    uTile.classList.add('remove-bottom-border')
                    vTile.classList.add('remove-top-border')
                }
    
                // u is to the right of v
                if (u.equals(mazeObject.getRightVertex(v))) {
                    uTile.classList.add('remove-left-border')
                    vTile.classList.add('remove-right-border')
                }
    
                // u is to the bottom of v
                if (u.equals(mazeObject.getBottomVertex(v))) {
                    uTile.classList.add('remove-top-border')
                    vTile.classList.add('remove-bottom-border')
                }
    
                // u is to the left of v
                if (u.equals(mazeObject.getLeftVertex(v))) {
                    uTile.classList.add('remove-right-border')
                    vTile.classList.add('remove-left-border')
                }
            }

            if (mazeObject.playerPosition.every((value, index) => value == goal[index])) {
                stopClock()
                const winStateJSON = {
                    "time": parseTime(totalSeconds),
                    "seconds": totalSeconds
                }
                const winReq = new XMLHttpRequest()
                const winReqURL = '/win'
                winReq.open('POST', winReqURL)
                winReq.onload = () => {
                    const updateReq = new XMLHttpRequest()
                    const updateReqURL = '/update'
                    updateReq.open('POST', updateReqURL)
                    updateReq.send()
                }
                winReq.setRequestHeader('Content-Type', 'application/json')
                const winReqBody = JSON.stringify(winStateJSON)
                winReq.send(winReqBody)

                pauseModalBackdrop.classList.remove('pause-backdrop-hidden')
                pauseButton.removeEventListener('click', pause)
                winMessage.classList.remove('win-message-hidden')
                instructionsElement.style.zIndex = -100
            }
        }
        mazeReq.send()
    }
}
mazeReq.send()

const counterElement = document.getElementById('counter')
var totalSeconds = 0
var secondInterval = null
window.addEventListener('load', (event) => {
    pause()
})

function startClock() {
    secondInterval = setInterval(incrementClock, 1000)
}

function incrementClock() {
    totalSeconds++
    counterElement.textContent = parseTime(totalSeconds)
}

function stopClock() {
    clearInterval(secondInterval)
}

function parseTime(seconds) {
    return pad(Math.floor(seconds / 60), 2) + ':' + pad(seconds % 60, 2)
}

function pad(number, length) {
    let string = number.toString()
    while (string.length < length) {
        string = '0' + string
    }
    return string
}
