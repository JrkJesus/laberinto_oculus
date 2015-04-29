"use strict";


var TAM_BLOQUE = 8;

var freeCamera, canvas, engine, labScene;
var camPositionInLabyrinth, camRotationInLabyrinth;
var veloc = 0.5;


function cargarLaberinto(nombreDelMapa) 
{

    //--------------------------------
    //--------------------------------
	// leer el fichero y guardarlo en una variable
    //--------------------------------
    //--------------------------------
    var largo, ancho;
	//var mapa = ¿?

    // Crear la escene a la cual le meteremos los elementos del mapa.
    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0));
    scene.gravity = new BABYLON.Vector3(0, -0.8, 0);
    scene.collisionsEnabled = true;


    // Activar camara de vision.
    freeCamera = new BABYLON.FreeCamera("free", new BABYLON.Vector3(0, 5, 0), scene);
    freeCamera.minZ = 1;
    freeCamera.speed = veloc;
    freeCamera.checkCollisions = true;
    freeCamera.applyGravity = true;
    freeCamera.ellipsoid = new BABYLON.Vector3(1, 1, 1);


    // Aplicar Texturas suelo
        // Nota u = ejeX   
        //      v = ejeY
    var groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.emissiveTexture = new BABYLON.Texture("textures/arfilaay.de_tiles-35_d100.jpg", scene);
    groundMaterial.emissiveTexture.uScale = ancho;
    groundMaterial.emissiveTexture.vScale = largo;
    groundMaterial.bumpTexture = new BABYLON.Texture("textures/arfilaay.de_tiles-35_b010.jpg", scene);
    groundMaterial.bumpTexture.uScale = ancho;
    groundMaterial.bumpTexture.vScale = largo;
    groundMaterial.specularTexture = new BABYLON.Texture("textures/arfilaay.de_tiles-35_s100-g100-r100.jpg", scene);
    groundMaterial.specularTexture.uScale = ancho;
    groundMaterial.specularTexture.vScale = largo;
    var ground = BABYLON.Mesh.CreateGround("ground", (ancho + 2) * BLOCK_SIZE, (ancho + 2) * BLOCK_SIZE, 1, scene, false);
                      // Mesh.CreateGround(name,       width,                    height, subdivisions, scene, updatable) 
    ground.material = groundMaterial; 
    ground.checkCollisions = true;
    ground.setPhysicsState({ impostor: BABYLON.PhysicsEngine.PlaneImpostor, mass: 0, friction: 0.5, restitution: 0.7 });


    // Aplicar Textura Cielo
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 800.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene); 
                                                //CubeTexture(rootUrl, scene, extensions, noMipmap)
                                                    // rootUrl: Link of the texture
                                                    // extensions: The cube texture extensions. (Array)
                                                        //Defaults: [_px.jpg, _py.jpg, _pz.jpg, _nx.jpg, _ny.jpg, _nz.jpg]
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;


    // Aplicar Luces
    var light0 = new BABYLON.PointLight("pointlight0", new BABYLON.Vector3(28, 78, 385), scene);
                            //PointLight(name, position, scene)
    light0.diffuse = new BABYLON.Color3(0.5137254901960784, 0.2117647058823529, 0.0941176470588235);
    light0.intensity = 0.2;
    var light1 = new BABYLON.PointLight("pointlight1", new BABYLON.Vector3(382, 96, 4), scene);
    light1.diffuse = new BABYLON.Color3(1, 0.7333333333333333, 0.3568627450980392);
    light1.intensity = 0.2;


    // Crear cubo que formaran el laberinto.
    var cubeTopMaterial = new BABYLON.StandardMaterial("cubeTop", scene);
    cubeTopMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.15);
    var cubeWallMaterial = new BABYLON.StandardMaterial("cubeWalls", scene);
    cubeWallMaterial.emissiveTexture = new BABYLON.Texture("textures/masonry-wall-texture.jpg", scene);
    cubeWallMaterial.bumpTexture = new BABYLON.Texture("textures/masonry-wall-bump-map.jpg", scene);
    cubeWallMaterial.specularTexture = new BABYLON.Texture("textures/masonry-wall-normal-map.jpg", scene);
    var cubeMultiMat = new BABYLON.MultiMaterial("cubeMulti", scene);
    cubeMultiMat.subMaterials.push(cubeTopMaterial);
    cubeMultiMat.subMaterials.push(cubeWallMaterial);

    var soloCube = BABYLON.Mesh.CreateBox("mainCube", BLOCK_SIZE, scene);
    soloCube.subMeshes = [];
    soloCube.subMeshes.push(new BABYLON.SubMesh(0, 0, 4, 0, 6, soloCube));
    soloCube.subMeshes.push(new BABYLON.SubMesh(1, 4, 20, 6, 30, soloCube));
    // same as soloCube.rotation.x = -Math.PI / 2; 
    // but cannon.js needs rotation to be set via Quaternion
    soloCube.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(0, -Math.PI / 2, 0);
    soloCube.material = cubeMultiMat;
    soloCube.checkCollisions = true;
    soloCube.setEnabled(false);
    var cube,x,y;
    for (var fila = 0; fila < mCount; fila++) 
    {
        for (var col = 0; col < mCount; col++) 
        {
            //--------------------------------
            //--------------------------------
            //PONER BIEN!! 
            //--------------------------------
            //--------------------------------
            if (mapa = 'h') 
            {
                cube = soloCube.clone("ClonedCube" + fila + col);
                cube.position = new BABYLON.Vector3(BLOCK_SIZE / 2 + (fila - (mCount / 2)) * BLOCK_SIZE,
                                                    BLOCK_SIZE / 2,
                                                    BLOCK_SIZE / 2 + (col - (mCount / 2)) * BLOCK_SIZE);
            }
            else if (mapa = 'e')
            {
                x = fila;
                y = col;
            }

        }
    } 

    freeCamera.position = new BABYLON.Vector3(x, 5, y);
    //Cambia la posicion a la entrada

    window.addEventListener("keydown", function (event) 
    {
        if (event.keyCode === 79) //codigo de la o
        {
           window.addEventListener("keydown", function (event) 
            {
                switch(event.keyCode) 
                {
                    case /*tecla del obj*/:
                        //creo objeto en freeCampera.position
                        break;
                }
            }, false);
        }
    }, false);

    window.addEventListener("keydown", function (event) 
    {
        if (event.keyCode === 18) //codigo del alt
        {
            veloc=1;  
        }
    }, false);

    window.addEventListener("keyup", function (event) 
    {
        if (event.keyCode === 18) //codigo del alt
        {
            veloc=0.5;  
        }
    }, false);

    return scene;
};


window.onload = function () {
    canvas = document.getElementById("canvas");

    $("#dialog-form").dialog({
        autoOpen: true,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Create": function () {
                //Creating scene
                labScene = cargarLaberinto($("#name").val());

                labScene.activeCamera.attachControl(canvas);

                // Once the scene is loaded, just register a render loop to render it
                engine.runRenderLoop(function () 
                {
                    labScene.render();
                });

                canvas.className = "offScreen onScreen";
                $(this).dialog("close");
            }
        }
    });

    // Check support
    if (!BABYLON.Engine.isSupported()) {
        window.alert('Browser not supported');
    } else {
        // Babylon
        engine = new BABYLON.Engine(canvas, true);

        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        });
    }
};

var animateCameraPositionAndRotation = function (freeCamera, fromPosition, toPosition, fromRotation, toRotation) 
{

    var animCamPosition = new BABYLON.Animation("animCam", "position", 30,
                                                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                                                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    var keysPosition = [];
    keysPosition.push({
        frame: 0,
        value: fromPosition
    });
    keysPosition.push({
        frame: 100,
        value: toPosition
    });
    animCamPosition.setKeys(keysPosition);

    var animCamRotation = new BABYLON.Animation("animCam", "rotation", 30,
                                                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                                                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    var keysRotation = [];
    keysRotation.push({
        frame: 0,
        value: fromRotation
    });
    keysRotation.push({
        frame: 100,
        value: toRotation
    });
    animCamRotation.setKeys(keysRotation);

    freeCamera.animations.push(animCamPosition);
    freeCamera.animations.push(animCamRotation);

    labScene.beginAnimation(freeCamera, 0, 100, false);
};