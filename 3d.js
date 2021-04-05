

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    var size = 50;
    var tick = 1;
    var updateRate = 100;
    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(size/2, size/2, -20), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    class Cell {
        constructor(xPos,yPos,zPos,state,life,texture){
            this.xPos = xPos;
            this.yPos = yPos;
            this.zPos = zPos;
            this.state = state; 
            this.life=life;
            //this.texture = new BABYLON.StandardMaterial("mat", scene);
            if(this.state>0){
                this.createBody();
                this.body.material = texture; 
            }
        }
        createBody(){
            //this.texture = new BABYLON.StandardMaterial("mat", scene);
            this.body = BABYLON.MeshBuilder.CreateBox("box",{},scene);
            //this.texture.diffuseColor = new BABYLON.Color3(this.state/2,0,0);
            //this.body.material = this.texture; 
            this.body.position.x=this.xPos;
            this.body.position.y=this.yPos;
            this.body.position.z=this.zPos;
        }
        update(state,texture){
            if(state != this.state){
                this.state = state;
                if(this.state == 0){
                    this.body.dispose();
                }
                if(this.state == this.life){
                    this.createBody();
                    this.body.material = texture;
                }
                else if(this.state>0){
                    this.body.material = texture; 
                }
            }
        }

        getState(){
            return this.state;
        }
    }
    class Grid{
        constructor(size){
            this.size = size;
            this.life = 2;
            this.grid = [];
            this.texture = new BABYLON.StandardMaterial("mat", scene);
            this.texture.diffuseColor = new BABYLON.Color3(1,0,0);
            for(let i = 0;i<size;i++){
                this.grid.push([...Array(size)].map(e => Array(size)));
            }
            for(let i = 0;i<size;i++){
                for(let j = 0;j<size;j++){
                    for(let k =0;k<size;k++){
                        this.grid[i][j][k] = new Cell(j,-i,k,0,this.life,this.texture);
                    }
                }
            }
            /*
            3d live and born on 4 neighbors
            Blinker:
            
                this.grid[3][2][5].update(this.life);
                this.grid[2][3][6].update(this.life);
                this.grid[3][3][5].update(this.life);
                this.grid[2][2][5].update(this.life);
            */

            for(let i =0;i<8;i++){
                for(let j = 0;j<8;j++){
                    for(let k = 0;k<8;k++){
                        this.grid[20+i][20+j][20+k].update(this.life);
                    }
                }
            }

            // this.grid[3][2][5].update(1);
            // this.grid[2][1][6].update(1);
            // this.grid[1][3][5].update(1);
            // this.grid[2][3][5].update(1);
            // this.grid[3][3][5].update(1);
            // this.grid[21][20][20].update(this.life);
            // this.grid[20][21][20].update(this.life);
            // this.grid[21][21][20].update(this.life);
            // this.grid[20][20][20].update(this.life);

             //this.grid[11][10][11].update(1);
            // this.grid[10][11][11].update(2);
            // this.grid[11][11][11].update(2);
            // this.grid[10][10][11].update(2);
            //this.grid[3][3][5].update(1);
        }
        mutate() {
            // make a copy of grid and fill it with zeros
            let temp = [];
            for(let i = 0;i<size;i++){
                temp.push([...Array(size)].map(e => Array(size)));
            }
            for(let i = 0;i<size;i++){
                for(let j = 0;j<size;j++){
                    for(let k =0;k<size;k++){
                        temp[i][j][k] = this.grid[i][j][k].getState();
                    }
                }
            }
            for(let i = 0; i<this.size;i++){
                for(let j = 0; j<this.size; j++){
                    for(let k = 0;k<this.size; k++){
                        let n = this.getNeighbors(i, j, k);
                        if(this.grid[i][j][k].getState() > 0){
                            if(n==1 || n==3 || n==5){
                                temp[i][j][k] = this.grid[i][k][j].getState();
                                temp[i][j][k]-=1;
                            }
                            else{
                                temp[i][j][k] = 0;
                            }           
                        }
                        else{
                            if(n == 2 || n==4 || n==6){
                                temp[i][j][k] = this.life;
                            }                   
                        }
                    }
        
                }
            }
            for(let i = 0;i<size;i++){
                for(let j = 0;j<size;j++){
                    for(let k = 0;k<size;k++){
                        //console.log(temp[i][j][k]);
                        this.grid[i][j][k].update(temp[i][j][k],this.texture)
                        
                    }
                }
            }
        }
    
        // Returns the number of neighbors for cell at this.grid[i][j]
        getNeighbors(i, j, k) {
            let neighbors = 0;
            let dirs = [1,-1,0];
            for(let iter =0;iter<3;iter++){
                for(let jiter = 0;jiter <3;jiter++){
                    for(let kiter = 0;kiter <3;kiter++){
                        let checkI = i+dirs[iter];
                        let checkJ = j+dirs[jiter];
                        let checkK = k+dirs[kiter];
                        
                        if(checkI>=0 && checkI<this.size && checkJ>=0 && checkJ<this.size && checkK>=0 &&checkK<this.size){
                            if(this.grid[checkI][checkJ][checkK].getState() > 0 ){
                                neighbors++;
                                if(checkI == i && checkJ == j && checkK ==k){
                                    neighbors-=1;
                                }
                            }
        
                        }
                    }
        
        
                }
        } 
    
        return neighbors;
        }
        toString() {
        }

    }


    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;
    
    var grid = new Grid(size);


    var gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
    
    var panel = new BABYLON.GUI.StackPanel();
    panel.width = "1000px";
    panel.height = "100px";
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    gui.addControl(panel);


    var slider = new BABYLON.GUI.Slider();
    slider.minimum = 10;
    slider.maximum = 250;
    slider.value = updateRate;
    slider.height = "20px";
    slider.width = "200px";
    slider.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

    slider.onValueChangedObservable.add(function(value) {
        //header.text = "Speed: " + slider.value;
        console.log(slider.value);
        updateRate = parseInt(slider.value);
    });
    panel.addControl(slider); 
    
    var button = BABYLON.GUI.Button.CreateSimpleButton("button", "Pause");
    var pause = false;
    button.top = "100px";
    button.left = "0px";
    button.width = "150px";
    button.height = "50px";
    button.cornerRadius = 20;
    button.thickness = 4;
    button.children[0].color = "#DFF9FB";
    button.children[0].fontSize = 24;
    button.color = "#FF7979";
    button.background = "#007900";
    button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    button.onPointerClickObservable.add(function () {
        pause = !pause;
        if(pause){
            button.background = "#EB4D4B";
        } else{
            button.background = "#007900";
        }
    });
    //gui.addControl(slider);
    panel.addControl(button);    
    // Our built-in 'ground' shape.
   // var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);
   scene.registerBeforeRender(function () {
       if(tick%updateRate == 0 && !pause){
           grid.mutate();
           //console.log(grid.toString())
        }
        tick+=1;
   });
    return scene;
};


const scene = createScene(); //Call the createScene function
// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {

        scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});

