const menuButton = document.getElementById("menu-from-win")

//menuButton.addEventListener('click', function () {

    let reqNames = new XMLHttpRequest()
    reqNames.open('GET', '/size.json')
    reqNames.responseType = 'json'
    reqNames.setRequestHeader('Content-type', "name")
    reqNames.send()
    

    let reqScore = new XMLHttpRequest()
    reqScore.open('GET', '/size.json')
    reqScore.responseType = 'json'
    reqScore.setRequestHeader('Content-type', "score")
    reqScore.send()


    let reqDim = new XMLHttpRequest()
    reqDim.open('GET', '/size.json')
    reqDim.responseType = 'json'
    reqDim.setRequestHeader('Content-type', "dim")
    reqDim.send()

    reqNames.onload = function () {
        const nameArray = reqNames.response;
        test = nameArray

        for (i = 0; i < 5; i++) {
            if (nameArray[i] != null) {
                highScores[i].textContent = nameArray[i]
            }
        }

    }
    reqScore.onload = function () {
        const scoreArray = reqScore.response;
        for (i = 0; i < 5; i++) {
            if (scoreArray[i] != null) {
                highScores[i].textContent += "   - - -   " + scoreArray[i]
            }
        }
    }
    reqDim.onload = function () {
        const dimArray = reqDim.response;
        for (i = 0; i < 5; i++) {
            if (dimArray[i] != null) {
                highScores[i].textContent += "   - - -   (" + dimArray[i] + ")"
            }
        }
    }
//})