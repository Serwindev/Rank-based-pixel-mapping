const imageInput = document.getElementById("image1");
const image2Input = document.getElementById("image2");
const canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const invisCanvas = document.getElementById("inviscanvas");
const ctx_in = invisCanvas.getContext("2d");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);


const img1 = new Image();
const img2 = new Image();
const i_w = 500;
const i_h = 500;

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
        brightness: 0.3*red + 0.59*green + 0.11*blue
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
    if (t>=0.8) {
        t+=0.01
    } else {t += 0.005;}
    requestAnimationFrame(startAnimate);

}

function Mapping() {
    let color_A = [];
    let pos_B = [];
    const outImageData = new ImageData(i_w, i_h);
    const buffer = outImageData.data;
    const totalPixels = i_w*i_h;
    const k = 15;
    const used = Array.from({length: i_w*i_h}, () => false);

    for (let i=0; i<totalPixels; i++) {
        let best = -1;
        let bestDis = 1000000;
        let start = Math.max(0, i-k);
        let end = Math.min(totalPixels - 1, i+k);

        color_A = pixel1[i];

        for (let j=start; j<end; j++) {
            if (used[j]) {continue;}
            pos_B = pixel2[j];

            let cd = (color_A.r - pos_B.r)**2 + (color_A.g - pos_B.g)**2 + (color_A.b - pos_B.b)**2;

            if (cd < bestDis) {
                bestDis = cd;
                best = j;
            }
        }

        if (best == -1) {
            best = used.indexOf(false);
        }

        used[best] = true;

        pos_B = pixel2[best];
        let x = clamp(Math.round(color_A.x + t * (pos_B.x - color_A.x)), 0, i_w);
        let y = clamp(Math.round(color_A.y + t * (pos_B.y - color_A.y)), 0, i_h);

        const index = (y*i_w + x) * 4;

        buffer[index] = color_A['r'];
        buffer[index + 1] = color_A['g'];
        buffer[index + 2] = color_A['b'];
        buffer[index + 3] = 255;
    }

    ctx.putImageData(outImageData,0,0);
}

function reset() {
    cancelAnimationFrame(startAnimate);
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

function download() {
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.download = "image.png";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }, 'image/png')
}