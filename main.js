let cardInitialized = false;

let container;

// State
trialNum = 0;

const board = [];
const images = [];
const cardNumX = 4;
const cardNumY = 4;
const cardSize = 200;
const cardMargin = 10;
const init = () => {
    initFileReader();
    container = document.createElement("div");
    container.style.position = "relative";
    document.body.appendChild(container);
}

const initFileReader = () => {
    const inputFile = document.createElement("input");
    inputFile.setAttribute("type", "file");
    inputFile.setAttribute("id", "inputFile");
    inputFile.setAttribute("multiple", "true");
    inputFile.addEventListener("change", handleFiles, false);
    document.body.appendChild(inputFile);
}

const handleFiles = (e) => {
    const fileList = e.srcElement.files;

    // https://atmarkit.itmedia.co.jp/ait/articles/1112/16/news135.html
    Object.keys(fileList).forEach((e) => {
        const label = fileList[e].name.split("-")[0];
        console.log(label);

        const fileReader = new FileReader();
        fileReader.addEventListener("load", (e) => {
            images.push({
                label: label
                ,data: e.target.result
            });

            // Check images number
            if(!cardInitialized && images.length >= cardNumX * cardNumY){
                console.log(`meet number images.length: ${images.length}, number: ${cardNumX * cardNumY}`)
                // setup images into cards
                initCards();
                cardInitialized = true;
            }
        });
        console.log(fileList[e])
        fileReader.readAsDataURL(fileList[e]);
        console.log(images)
    });
}

const shuffle = (arrays) => {
    const array = arrays.slice();
    for (let i = array.length - 1; i >= 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
}

const initCards = () => {
    const shuffledImages = shuffle(images);

    for(let y = 0; y < cardNumY; y++){
        board[y] = [];
        for(let x = 0; x < cardNumX; x++){
            console.log(shuffledImages[x+y*cardNumX])
            const panel = document.createElement("div");
            panel.style.textAlign = `center`
            panel.style.fontSize = `24px`
            panel.style.overflowWrap = `break-word`
            panel.style.textShadow = `0px 2px 1px white, 0px -2px 1px white, 2px -2px 1px white, 2px -2px 1px white, -2px -2px 1px white, -2px -2px 1px white`
            panel.style.position = `absolute`;
            panel.style.left = `${x * cardSize}px`;
            panel.style.top = `${y * cardSize}px`;
            panel.style.width = `${cardSize-cardMargin}px`;
            panel.style.height = `${cardSize-cardMargin}px`;
            panel.style.backgroundColor = `#b0c4de`;
            panel.style.backgroundSize = `cover`
            panel.label = shuffledImages[x+y*cardNumX].label;
            panel.imageURL = `url(${shuffledImages[x+y*cardNumX].data})`
            panel.style.borderRadius = `10px`;
            panel.style.transition = `all 150ms linear`;
            container.appendChild(panel);
            board[y][x] = {panel, x: x, y: y, opened: 0, tried: false, paired: false};
            panel.onpointerdown = (e) => {
                e.preventDefault();
                ondown(x, y);
            }
        }
    }
}

let isAnimation = false
const flip = async (x, y) => {
    if(x < 0 || y < 0 || x >= cardNumX || y >= cardNumY){
        return;
    }
    isAnimation = true;

    const panel = board[y][x].panel;
    let opened = board[y][x].opened;
    opened = 1 - opened;

    panel.style.transform = "perspective(150px) rotateY(0deg)"
    await new Promise(r => setTimeout(r, 150));
    panel.style.backgroundColor = (opened) ? "#00f" : "#b0c4de"
    panel.style.backgroundImage = (opened) ? panel.imageURL : null
    panel.style.transform = "perspective(150px) rotateY(-90deg)"
    panel.parentElement.appendChild(panel);
    await new Promise(r => setTimeout(r, 50));
    panel.style.backgroundColor = (opened) ? "#00f" : "#b0c4de"
    panel.style.transform = "perspective(150px) rotateY(0deg)"
    await new Promise(r => setTimeout(r, 150));

    isAnimation = false;
    board[y][x].opened = opened
}

let isGameOver = false;
const ondown = async (x, y) => {
    if(board[y][x].paired){
        return;
    }
    if(isAnimation){
        return;
    }
    if(isGameOver){
        return;
    }
    trialNum++;
    await flip(x, y);

    // ステータス設定
    console.log(`clicked: ${board[y][x].panel.label}`)
    board[y][x].tried = true
    if(trialNum == 2){
        // チャレンジした２枚が同じラベルならクリア扱いとする
        const triedCards = board.flat().filter(e => e.tried);
        console.log(triedCards[0].panel.label);
        const paired = triedCards.every( (currentValue) => currentValue.panel.label == triedCards[0].panel.label );
        if (paired){
            console.log("paired!!")
            triedCards.forEach((e) => {
                e.paired = true;
                e.panel.textContent = e.panel.label;
            });
        }
        
        // オープンしているもののうちクリアしていないものを裏返す。
        console.log(board.flat())
        board.flat().filter(e => e.tried && !e.paired).forEach( (e) => {
            flip(e.x, e.y);
        });

        triedCards.forEach(e => e.tried = false);
        trialNum = 0
    }
    printState()

    isGameOver = board.flat().every((v) => v.opened === 1);
};

const printState = () => {
    board.flat().forEach( e => {
        console.log(`[${e.x}, ${e.y}] label: ${e.panel.label}, opened: ${e.opened}, tried: ${e.tried}, paired:${e.paired}`)
    })
    console.log(`trialNum: ${trialNum}`)
}

window.onload = () => {
    init();
};