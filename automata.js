

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    var size = 50;

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(size/2, size/2, -20), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    class Cell {
        constructor(xPos,yPos,zPos,state){
            this.xPos = xPos;
            this.yPos = yPos;
            this.zPos = zPos;
            this.state = state; 
            if(this.state==1)
                this.createBody();
        }
        createBody(){
            this.body = BABYLON.MeshBuilder.CreateBox("box",{},scene);
            this.body.position.x=this.xPos;
            this.body.position.y=this.yPos;
            this.body.position.z=this.zPos;
        }
        update(state){
            if(state != this.state){
                this.state = state;
                if(this.state == 0){
                    this.body.dispose();
                }
                if(this.state == 1){
                    this.createBody();
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
            this.grid =  [...Array(size)].map(e => Array(size));
            for(let i = 0;i<size;i++){
                for(let j = 0;j<size;j++){
                    this.grid[i][j] = new Cell(j,-i,0,0)
                }
            }
            this.grid[3][2].update(1);
            this.grid[2][1].update(1);
            this.grid[1][3].update(1);
            this.grid[2][3].update(1);
            this.grid[3][3].update(1);
        }
        mutate() {
            // make a copy of grid and fill it with zeros
            let temp = new Array(this.size);
            for (let i = 0; i < this.size; i++) {
                temp[i] = new Array(this.size);
                temp[i].fill(0);
            }
            for(let i = 0; i<this.size;i++){
                for(let j = 0; j<this.size; j++){
                    let n = this.getNeighbors(i, j);
                    if(this.grid[i][j].getState() == 1){
                        if(n==3|| n ==2){
                            temp[i][j] = 1;
                        }            
                    }
                    else{
                        if(n == 3){
                            temp[i][j] = 1;
                        }                    
                    }
    
                }
            }
            for(let i = 0;i<size;i++){
                for(let j = 0;j<size;j++){
                    this.grid[i][j].update(temp[i][j])
                }
            }
        }
    
        // Returns the number of neighbors for cell at this.grid[i][j]
        getNeighbors(i, j) {
            let neighbors = 0;
            let dirs = [1,-1,0];
            for(let iter =0;iter<3;iter++){
                for(let jiter = 0;jiter <3;jiter++){
    
                    let checkI = i+dirs[iter];
                    let checkJ = j+dirs[jiter];
                    
                    if(checkI>=0 && checkI<this.size && checkJ>=0 && checkJ<this.size){
                        if(this.grid[checkI][checkJ].getState() == 1){
                            neighbors++;
                            if(checkI == i && checkJ == j){
                                neighbors-=1;
                            }
                        }
    
                    }
    
    
                }
        } 
    
        return neighbors;
        }
        toString() {
            let str = '\n';
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (this.grid[i][j].getState() === 0) {
                        str += ' . ';
                    } else {
                        str += ' X ';
                    }
                }
                str += "\n";
            }
            return str;
        }

    }


    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;
    
    var grid = new Grid(size);
    console.log(grid.toString())
    // Our built-in 'sphere' shape.


    // Our built-in 'ground' shape.
   // var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);
   var tick = 1;
   scene.registerBeforeRender(function () {
       if(tick%50 == 0){
           grid.mutate();
           console.log(grid.toString())
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

