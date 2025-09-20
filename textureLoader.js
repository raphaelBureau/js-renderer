export class TextureLoader {
    constructor(rasterizer) {
        this.rasterizer = rasterizer;
        this.images = [];
    }
    Get(imageRef = []) { //image format dosent really matter, it only affects loading speed since everything will be an array
        let result = []; //les images sont pas encore downloaded il faut verifier avec une promise
        for(let i = 0; i< imageRef.length; i++) {
            let img = new Image();
            img.src = "img/" + imageRef[i] + ".png";
            result.push(img);
        }
        console.log(result);
        this.images = result;
        
    }
    Load(callback = () => {}) {
        let ImgLoadCount = 0;
        for(let i =0; i< this.images.length; i++) {
            let Hiddencanvas = document.createElement("canvas"); //goofy method
            let ctx = Hiddencanvas.getContext("2d"); //on print sur le screen et on screenshot pour avoir un array de rgba
            this.images[i].decode().then(() =>{
                ImgLoadCount++;
                if(ImgLoadCount == this.images.length) {
                    this.images.forEach(img => { //je fait ca parceque les images loadent tous en meme temps
                        //certaines vont load plus vite que dautres
                        Hiddencanvas.width = img.width;
                        Hiddencanvas.height = img.height;
                        ctx.drawImage(img,0,0);
                        this.rasterizer.textures.push([ctx.getImageData(0,0,img.width,img.height).data,img.width,img.height]);
                    });
                    callback();
                }
            });
        }
    }
}