from PIL import Image
from operator import itemgetter

img = Image.open("./test.jpg")
img2 = Image.open("./IMG_1622.JPG")

width = 200
height = 200
size = (width,height)


def check(img):
    if img.mode == "RGB":
        return
    else: print("The given image isn't a RGB format")

check(img)
check(img2)

out = Image.new("RGB", size, color=(255,255,255))

img = img.resize(size)
img2 = img2.resize(size)

def getPixels(img: Image.Image):
    data = []
    for y in range(height):
        for x in range(width):
            r,g,b = img.getpixel((x,y)) 

            brightness = (r+g+b)/3
            data.append((brightness,x,y,r,g,b))

    return data


def process():
    pixels1 = getPixels(img)
    pixels2 = getPixels(img2)
    
    sorted_A = sorted(pixels1, key=itemgetter(0))
    sorted_B = sorted(pixels2, key=itemgetter(0))

    new_pixels = []
    
    t = 0

    while t<1:
        for i in range(len(pixels1)):
            color_A = sorted_A[i]
            pos_B = sorted_B[i]

            x1,y1 = sorted_A[i][1:3]
            x2,y2 = pos_B[1:3]

            x = int(x1 + t*(x2-x1))
            y = int(y1 + t*(y2-y1))

            out.putpixel((x,y), color_A[3:])
    
        out.save(f"./frames/frame_{t}.jpg","jpeg")
        t += 0.01

process()