const startButton = document.getElementById('start-button')
const playerName = document.getElementById('player-name')
const highScores = document.getElementsByClassName('highscore')

startButton.addEventListener('click', (event) => {
    const mazeSizeElements = document.getElementsByClassName('maze-size')
    const mazeSize = []
    for (let element of mazeSizeElements) {
        mazeSize.push(parseInt(element.value))
    }

    const stateJSON = {
        "name": playerName.value,
        "size": mazeSize
    }
    const stateReq = new XMLHttpRequest()
    const stateURL = '/save'
    stateReq.open('POST', stateURL)
    stateReq.setRequestHeader('Content-Type', 'application/json')
    const stateReqBody = JSON.stringify(stateJSON)
    stateReq.onreadystatechange = () => {
        window.location.href = '/maze'
    }
    stateReq.send(stateReqBody)
})
