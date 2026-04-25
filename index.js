const imageInput = document.getElementById("image1");
const image2Input = document.getElementById("image2");
const canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext("2d");

const invisCanvas = document.getElementById("inviscanvas");
const ctx_in = invisCanvas.getContext("2d");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);


const img1 = new Image();
const img2 = new Image();
const i_w = 400;
const i_h = 400;

let t = 0;

const pixel1 = [];
const pixel2 = [];

function getPixelData(x,y, pixels) {
    const index = (y * i_w + x) * 4;
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const alpha = pixels[index + 3];

    return {
        x: x,
        y: y,
        r: red,
        g: green,
        b: blue,
        a: alpha,
        brightness: (red + green + blue) / 3
    }
}

imageInput.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);

        img1.src = url;

        img1.onload = () => {
            ctx.drawImage(img1,0,0, i_w, i_h);

            const imgData = ctx.getImageData(0,0, i_w,i_h);
            const pixels = imgData.data;
            
            for (let j=0; j<i_h; j++) {
                for (let i=0; i<i_w; i++) {
                    pixel1.push(getPixelData(i,j,pixels));
                }
            }

            pixel1.sort((a,b) => a.brightness - b.brightness);

        }
    }
})

image2Input.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        img2.src = url;

        img2.onload = () => {
            ctx_in.drawImage(img2, 0,0, i_w, i_h);

            const imgData = ctx_in.getImageData(0,0,i_w, i_h);
            const pixels = imgData.data;

            for (let j=0; j<i_h; j++) {
                for (let i=0; i<i_w; i++) {
                    pixel2.push(getPixelData(i,j,pixels));
                }
            }

            pixel2.sort((a,b) => a.brightness - b.brightness);
        }
    }
})

function startAnimate() {
    t = clamp(t,0,1);

    if (t > 1) {return}

    ctx.clearRect(0,0, canvas.width, canvas.height);
    Mapping();
    t += 0.005;
    requestAnimationFrame(startAnimate);

}

function Mapping() {
    let color_A = [];
    let pos_B = [];
    const outImageData = new ImageData(i_w, i_h);
    const buffer = outImageData.data;
    const totalPixels = i_w*i_h;

    for (let i=0; i<totalPixels; i++) {

        color_A = pixel1[i];
        pos_B = pixel2[i];

        let x = parseInt(color_A.x + t * (pos_B.x - color_A.x));
        let y = parseInt(color_A.y + t * (pos_B.y - color_A.y));

        const index = (y*i_w + x) * 4;

        buffer[index] = color_A['r'];
        buffer[index + 1] = color_A['g'];
        buffer[index + 2] = color_A['b'];
        buffer[index + 3] = 255;
    }

    ctx.putImageData(outImageData,0,0);
}

function reset() {
    pixel1.length = 0;
    pixel2.length = 0;

    img1.src = '';
    img2.src = '';

    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx_in.clearRect(0,0, invisCanvas.width, invisCanvas.height);

    imageInput.value = '';
    image2Input.value = '';

    t = 0;
}