// DOM elements
let container;

// State
let cardInitialized = false;
let trialNum = 0;
let isGameOver = false;
let isInAnimation = false
const board = [];
const images = [];

// Parameteres
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

/**
 * When image files are uploaded, store them into images array in basde64 format.
 * @param {Event} e 
 */
const handleFiles = (e) => {
    const fileList = e.target.files;
    Object.keys(fileList).forEach((e) => {
        const label = fileList[e].name.split("-")[0];
        const fileReader = new FileReader();
        fileReader.addEventListener("load", (e) => {
            images.push({
                label: label
                ,data: e.target.result
            });
            if(!cardInitialized && images.length >= cardNumX * cardNumY){
                initCards();
                cardInitialized = true;
            }
        });
        fileReader.readAsDataURL(fileList[e]);
    });
}

/**
 * 
 * @param {Array} arr
 * @returns {Array} arr is shuffled 
 */
const shuffle = (arr) => {
    const array = arr.slice();
    for (let i = array.length - 1; i >= 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
}

/**
 * Generate card objects and push them into board array.
 */
const initCards = () => {
    const shuffledImages = shuffle(images);

    for(let y = 0; y < cardNumY; y++){
        board[y] = [];
        for(let x = 0; x < cardNumX; x++){
            const card = document.createElement("div");
            styleCard(card, x, y);
            card.label = shuffledImages[x+y*cardNumX].label;
            card.imageURL = `url(${shuffledImages[x+y*cardNumX].data})`
            card.onpointerdown = (e) => {
                e.preventDefault();
                ondown(x, y);
            }
            container.appendChild(card);
            board[y][x] = {card, x: x, y: y, opened: false, tried: false, paired: false};
        }
    }
}

const styleCard = (card, x, y) => {
    card.style.textAlign = `center`
    card.style.fontSize = `24px`
    card.style.overflowWrap = `break-word`
    card.style.textShadow = `0px 2px 1px white, 0px -2px 1px white, 2px -2px 1px white, 2px -2px 1px white, -2px -2px 1px white, -2px -2px 1px white`
    card.style.position = `absolute`;
    card.style.left = `${x * cardSize}px`;
    card.style.top = `${y * cardSize}px`;
    card.style.width = `${cardSize-cardMargin}px`;
    card.style.height = `${cardSize-cardMargin}px`;
    card.style.backgroundColor = `#b0c4de`;
    card.style.backgroundSize = `cover`
    card.style.borderRadius = `10px`;
    card.style.transition = `all 150ms linear`;
}

/**
 * Flip a card 
 * @param {*} x x-coordinate of the clicked card
 * @param {*} y y-coordinate of the clicked card
 * @returns None
 */
const flip = async (x, y) => {
    isInAnimation = true;

    const card = board[y][x].card;
    let opened = board[y][x].opened;
    opened = !opened;

    card.style.transform = "perspective(150px) rotateY(0deg)"
    await new Promise(r => setTimeout(r, 150));
    card.style.backgroundImage = (opened) ? card.imageURL : null
    card.style.transform = "perspective(150px) rotateY(-90deg)"
    card.parentElement.appendChild(card);   // tweak: prevent animation
    await new Promise(r => setTimeout(r, 50));
    card.style.transform = "perspective(150px) rotateY(0deg)"
    await new Promise(r => setTimeout(r, 150));

    isInAnimation = false;
    board[y][x].opened = opened
}

/**
 * Callback function invoked when a card in (x, y) is clicked
 * @param {int} x x-coordinate of the clicked card
 * @param {int} y y-coordinate of the clicked card
 * @returns None
 * @todo early return as to prohibit click selected card again
 */
const ondown = async (x, y) => {
    if(board[y][x].tried){
        return
    }
    if(board[y][x].paired){
        return;
    }
    if(isInAnimation){
        return;
    }
    if(isGameOver){
        return;
    }
    await flip(x, y);
    
    trialNum++;
    board[y][x].tried = true
    if(trialNum == 2){
        judgeTriedCards();
    }
    printState();
    
    isGameOver = board.flat().every((v) => v.opened);
};

/**
 * Judge if 2 tried cards are paired and change their state depends on the judgement result.
 */
const judgeTriedCards = () => {
    const triedCards = board.flat().filter(e => e.tried);
    const paired = triedCards.every( (currentValue) => currentValue.card.label == triedCards[0].card.label );        
    triedCards.forEach((e) => {
        if(paired){
            e.paired = true;
            e.card.textContent = e.card.label;
        }else{
            flip(e.x, e.y)
        }
        e.tried = false;
    });
    trialNum = 0;
}

/**
 * [Debug] Output each card information
 */
const printState = () => {
    board.flat().forEach( e => {
        console.log(`[${e.x}, ${e.y}] label: ${e.card.label}, opened: ${e.opened}, tried: ${e.tried}, paired:${e.paired}`)
    })
    console.log(`trialNum: ${trialNum}`)
}

window.onload = () => {
    init();
};