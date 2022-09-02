const board = [];
const images = [];
const cardNumX = 5;
const cardNumY = 5;
const cardSize = 200;
const cardMargin = 10;
const init = () => {
    initFileReader()
    const container = document.createElement("div");
    container.style.position = "relative";
    document.body.appendChild(container);

    for(let y = 0; y < cardNumY; y++){
        board[y] = [];
        for(let x = 0; x < cardNumX; x++){
            const panel = document.createElement("div");
            panel.style.position = `absolute`;
            panel.style.left = `${x * cardSize}px`;
            panel.style.top = `${y * cardSize}px`;
            panel.style.width = `${cardSize-cardMargin}px`;
            panel.style.height = `${cardSize-cardMargin}px`;
            panel.style.backgroundColor = `#f00`;
            panel.style.backgroundSize = `cover`
            panel.imageURL = `url("./assets/00000.png")`
            panel.style.borderRadius = `10px`;
            panel.style.transition = `all 150ms linear`;
            container.appendChild(panel);
            board[y][x] = {panel, color: 0};
            panel.onpointerdown = (e) => {
                e.preventDefault();
                ondown(x, y);
            }
        }
    }
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
        });
        console.log(fileList[e])
        fileReader.readAsDataURL(fileList[e]);
        console.log(images)
    });
}

let isAnimation = false
const flip = async(x, y) => {
    if(x < 0 || y < 0 || x >= cardNumX || y >= cardNumY){
        return;
    }
    isAnimation = true;

    const panel = board[y][x].panel;
    let color = board[y][x].color;
    color = 1 - color;

    panel.style.transform = "perspective(150px) rotateY(0deg)"
    await new Promise(r => setTimeout(r, 150));
    panel.style.backgroundColor = (color) ? "#00f" : "#f00"
    panel.style.backgroundImage = (color) ? panel.imageURL : null
    panel.style.transform = "perspective(150px) rotateY(-90deg)"
    panel.parentElement.appendChild(panel);
    await new Promise(r => setTimeout(r, 50));
    panel.style.backgroundColor = (color) ? "#00f" : "#f00"
    panel.style.transform = "perspective(150px) rotateY(0deg)"
    await new Promise(r => setTimeout(r, 150));

    isAnimation = false;
    board[y][x].color = color
}

let isGameOver = false;
const ondown = (x, y) => {
    if(isAnimation){
        return;
    }
    if(isGameOver){
        return;
    }
    flip(x, y);

    isGameOver = board.flat().every((v) => v.color === 1);
};

window.onload = () => {
    init();
};