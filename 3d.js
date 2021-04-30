

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

    var FreeCameraKeyboardRotateInput = function () {
        this._keys = [];
        this.keysLeft = [65];
        this.keysRight = [68];
        this.keysUp = [87];
        this.keysDown= [83]
        this.sensibility = 0.005;
      };
      FreeCameraKeyboardRotateInput.prototype.getClassName = function () {
        return "FreeCameraKeyboardRotateInput";
      };
      FreeCameraKeyboardRotateInput.prototype.getSimpleName = function () {
        return "keyboardRotate";
      };
      FreeCameraKeyboardRotateInput.prototype.attachControl = function (noPreventDefault) {
        var _this = this;
        var engine = this.camera.getEngine();
        var element = engine.getInputElement();
        if (!this._onKeyDown) {
          element.tabIndex = 1;
          this._onKeyDown = function (evt) {
            if (_this.keysLeft.indexOf(evt.keyCode) !== -1 || _this.keysRight.indexOf(evt.keyCode) !== -1
               ||_this.keysUp.indexOf(evt.keyCode) !== -1 || _this.keysDown.indexOf(evt.keyCode) !== -1) {
              var index = _this._keys.indexOf(evt.keyCode);
              if (index === -1) {
                _this._keys.push(evt.keyCode);
              }
              if (!noPreventDefault) {
                evt.preventDefault();
              }
            }
          };
          this._onKeyUp = function (evt) {
            if (_this.keysLeft.indexOf(evt.keyCode) !== -1 || _this.keysRight.indexOf(evt.keyCode) !== -1
               ||_this.keysUp.indexOf(evt.keyCode) !== -1 || _this.keysDown.indexOf(evt.keyCode) !== -1) {
              var index = _this._keys.indexOf(evt.keyCode);
              if (index >= 0) {
                _this._keys.splice(index, 1);
              }
              if (!noPreventDefault) {
                evt.preventDefault();
              }
            }
          };
          element.addEventListener("keydown", this._onKeyDown, false);
          element.addEventListener("keyup", this._onKeyUp, false);
          BABYLON.Tools.RegisterTopRootEvents(canvas, [{ name: "blur", handler: this._onLostFocus }]);
        }
      };
      FreeCameraKeyboardRotateInput.prototype.checkInputs = function () {
        if (this._onKeyDown) {
          var camera = this.camera;
          // Keyboard
          for (var index = 0; index < this._keys.length; index++) {
            var keyCode = this._keys[index];
            if (this.keysLeft.indexOf(keyCode) !== -1) {
              camera.cameraRotation.y -= this.sensibility;
            } else if (this.keysRight.indexOf(keyCode) !== -1) {
              camera.cameraRotation.y += this.sensibility;
            }
            if (this.keysUp.indexOf(keyCode) !== -1) {
                camera.cameraRotation.x -= this.sensibility;
              } else if (this.keysDown.indexOf(keyCode) !== -1) {
                camera.cameraRotation.x += this.sensibility;
              }
          }
        }
      };
    camera.inputs.add(new FreeCameraKeyboardRotateInput());


    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
      
    var gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
    
    var panel = new BABYLON.GUI.StackPanel();
    panel.width = "1000px";
    panel.height = "100px";
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    gui.addControl(panel);

    var inputText = new BABYLON.GUI.TextBlock();
    inputText.text = "4;4";
    inputText.color = "white";
    inputText.fontSize = 24;
     panel.addControl(inputText);


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
    
    var pause = BABYLON.GUI.Button.CreateSimpleButton("button", "Pause");
    var isPaused = false;
    pause.top = "100px";
    pause.left = "0px";
    pause.width = "150px";
    pause.height = "50px";
    pause.cornerRadius = 20;
    pause.thickness = 4;
    pause.children[0].color = "#DFF9FB";
    pause.children[0].fontSize = 24;
    pause.color = "#FF7979";
    pause.background = "#007900";
    pause.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    pause.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

    //gui.addControl(slider);
    panel.addControl(pause);
    var reset = BABYLON.GUI.Button.CreateSimpleButton("button", "reset");
    reset.top = "100px";
    reset.left = "0px";
    reset.width = "150px";
    reset.height = "50px";
    reset.cornerRadius = 20;
    reset.thickness = 4;
    reset.children[0].color = "#DFF9FB";
    reset.children[0].fontSize = 24;
    reset.color = "#FF7979";
    reset.background = "#007900";
    reset.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    reset.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    panel.addControl(reset);   

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
                if(state <= 0){
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
        constructor(size,ruleSet){
            this.size = size;
            this.life = 1;
            this.grid = [];
            this.ruleSet = ruleSet;
            this.texture = new BABYLON.StandardMaterial("mat", scene);
            this.texture.diffuseColor = new BABYLON.Color3(.95, .75, .5);
            this.texture.bumpTexture = new BABYLON.Texture("https://i.imgur.com/JIbGEsB.jpg", scene);
            this.textures=[];
            for(let i =0;i<this.life;i++){
                this.textures.push(new BABYLON.StandardMaterial("mat", scene));
                this.textures[i].diffuseColor = new BABYLON.Color3(i/this.life,0,0);
            }
            
            this.createGrid();
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
                            if(this.ruleSet[0].includes(n)){
                                temp[i][j][k] = this.grid[i][k][j].getState();
                                temp[i][j][k]-=1;
                            }
                            else{
                                temp[i][j][k] = 0;
                            }           
                        }
                        else{
                            if(this.ruleSet[1].includes(n)){
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
                        this.grid[i][j][k].update(temp[i][j][k],this.texture);
                        //console.log(this.textures[temp[i][j][k]]);
                        
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

        reset(newRules){
            for(let i = 0;i<size;i++){
                for(let j = 0;j<size;j++){
                    for(let k =0;k<size;k++){
                        this.grid[i][j][k].update(0,this.texture);;
                    }
                }
            }
            this.grid = [];
            this.ruleSet = newRules;
            this.createGrid();
        }

        createGrid(){
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
                        
            // 3d live and born on 4 neighbors
            // Blinker:
            
                // this.grid[3][2][5].update(this.life);
                // this.grid[2][3][6].update(this.life);
                // this.grid[3][3][5].update(this.life);
                // this.grid[2][2][5].update(this.life);
            

          //  a coule of planes
           for(let i =0;i<8;i++){
            for(let j = 0;j<8;j++){
                for(let k = 0;k<8;k++){
                    if(j%2==0){
                        this.grid[20+i][20+j][20+k].update(this.life);
                    }
                    
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
        toString() {
        }

    }


    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;
    ruleSet = [[4,5,6],[4,5,6]];
    var grid = new Grid(size,ruleSet);


    var param = "";
    scene.actionManager = new BABYLON.ActionManager(scene);
    action = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger,function(event) {
         var key = event.sourceEvent.key;      
         console.log(key) ;   
        if (key == "Subtract") { key = "-"; }
        if (key == "Decimal") { key = "."; }

        if (key == "Enter") {
           
		   //do something with your string

        } else if (key == "Backspace") {
            param = param.substring(0, param.length - 1);
              inputText.text = param;
        }
        else if
            (key == "0" || key == "1" || key == "2" || key == "3" || key == "4" || key == "5" ||
            key == "6" || key == "7" || key == "8" || key == "9" || key == "," || key == ";" || key == "-") {

            param += key;
            inputText.text = param;
        }
          }) ;  
    scene.actionManager.registerAction(action);

    reset.onPointerClickObservable.add(function () {
        
       tick = 0;
       let str = inputText.text.split(";");
       let input1 = str[0];
       if(str[0].length>1){
        let input1 = str[0].split(",");
       }
       let input2 = str[1];
       if(str[1].length>1){
        let input2 = str[1].split(",");
       }
       
       

       console.log(input1);
       console.log(input2);

       let newRules = [input1,input2];
    //    for(let i = 0; i<input1.length;i++){
    //        newRules[0].push(input1[i]);
    //    }
    //    for(let i = 0; i<input2.length;i++){
    //     newRules[1].push(input2[i]);
    //     }
        console.log(newRules.toString());
        grid.reset(newRules);
       // grid.updateRules(newRules);
        
    });   
    pause.onPointerClickObservable.add(function () {
        isPaused = !isPaused;
        if(isPaused){
            pause.background = "#EB4D4B";
        } else{
            pause.background = "#007900";
        }
    });
   scene.registerBeforeRender(function () {
       if(tick%updateRate == 0 && !isPaused){
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

