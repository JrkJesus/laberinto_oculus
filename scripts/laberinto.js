"use strict";


var TAM_BLOQUE = 8;

var freeCamera, canvas, engine, labScene, salida;
var camPositionInLabyrinth, camRotationInLabyrinth;
var veloc = 0.5;
var textoDoc;
var vistaAerea = false, oculus, intra, extra;
var inicio;


function cargarLaberinto() 
{   
    //var mapa = ¿?   textoDoc.split("\r\n")[0].split(": ")[1]
    var pasoIntermedio = textoDoc.split("\r\n"),
        ancho = parseInt(pasoIntermedio[0].split(": ")[1]),
        largo = parseInt(pasoIntermedio[1].split(": ")[1]),
        mapa = [];
    for(var index = 2; index<largo+2; index++)
    {
        mapa[index-2] += pasoIntermedio[index];
        mapa[index-2] = mapa[index-2].replace(/undefined/i, "");
    }


    // Crear la escene a la cual le meteremos los elementos del mapa.
    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0));
    scene.gravity = new BABYLON.Vector3(0, -0.8, 0);
    scene.collisionsEnabled = true;


    // Activar camara de vision.
    //https://github.com/BabylonJS/Babylon.js/wiki/05-Cameras
    if (oculus)
        freeCamera = new BABYLON.OculusCamera("Camera", new BABYLON.Vector3(0, 20, -45), scene);
    else
        freeCamera = new BABYLON.FreeCamera("free", new BABYLON.Vector3(0, 5, 0), scene);
    
    freeCamera.minZ = 1;
    freeCamera.speed = veloc;
    freeCamera.checkCollisions = true;
    freeCamera.applyGravity = true;
    freeCamera.ellipsoid = new BABYLON.Vector3(1, 1, 1);


    // Aplicar Texturas suelo
        // Nota u = ejeX   
        //      v = ejeY

        // ALGO FALLA AQUI.
    var groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.emissiveTexture = new BABYLON.Texture("textures/Ground/suelo.jpg", scene);
    groundMaterial.emissiveTexture.uScale = 400;
    groundMaterial.emissiveTexture.vScale = 400;
    groundMaterial.bumpTexture = new BABYLON.Texture("textures/Ground/suelo.jpg", scene);
    groundMaterial.bumpTexture.uScale = 400;
    groundMaterial.bumpTexture.vScale = 400;
    groundMaterial.specularTexture = new BABYLON.Texture("textures/Ground/suelo.jpg", scene);
    groundMaterial.specularTexture.uScale = 400;
    groundMaterial.specularTexture.vScale = 400;
    var ground = BABYLON.Mesh.CreateGround("ground", 400, 400, 1, scene, false);
                      // Mesh.CreateGround(name,       width,                    height, subdivisions, scene, updatable) 
    ground.material = groundMaterial; 
    ground.checkCollisions = true;
    ground.setPhysicsState({ impostor: BABYLON.PhysicsEngine.PlaneImpostor, mass: 0, friction: 0.5, restitution: 0.7 });


    // Aplicar Textura Cielo
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 800.0, scene);
    var cielo = "skyBox";
    if(!extra)
        cielo = "default";
    var skyboxMaterial = new BABYLON.StandardMaterial(cielo, scene);

    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/Skybox/"+cielo, scene); 
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

    //eatmap
    


    // Crear cubo que formaran el laberinto.
    var cubeTopMaterial = new BABYLON.StandardMaterial("cubeTop", scene);
    if (muro)
        cubeTopMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.15);
    else
        cubeTopMaterial.emissiveTexture = new BABYLON.Texture("textures/Ground/suelo.jpg", scene);

    var cubeWallMaterial = new BABYLON.StandardMaterial("cubeWalls", scene);
    cubeWallMaterial.emissiveTexture = new BABYLON.Texture("textures/Wall/ladrillos2.jpg", scene);
    cubeWallMaterial.bumpTexture = new BABYLON.Texture("textures/Wall/ladrillos2.jpg", scene);
    cubeWallMaterial.specularTexture = new BABYLON.Texture("textures/Wall/ladrillos2.jpg", scene);
    var cubeMultiMat = new BABYLON.MultiMaterial("cubeMulti", scene);
    cubeMultiMat.subMaterials.push(cubeTopMaterial);
    cubeMultiMat.subMaterials.push(cubeWallMaterial);

    var soloCube = BABYLON.Mesh.CreateBox("mainCube", TAM_BLOQUE, scene);
    soloCube.subMeshes = [];
    soloCube.subMeshes.push(new BABYLON.SubMesh(0, 0, 4, 0, 6, soloCube));
    soloCube.subMeshes.push(new BABYLON.SubMesh(1, 4, 20, 6, 30, soloCube));
    // same as soloCube.rotation.x = -Math.PI / 2; 
    // but cannon.js needs rotation to be set via Quaternion
    soloCube.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(0, -Math.PI / 2, 0);
    soloCube.material = cubeMultiMat;
    soloCube.checkCollisions = true;
    soloCube.setEnabled(false);
    var cube,x,y,muroC;
    if(muro)
        muroC = 'h';
    else
        muroC = ' ';
    for (var fila = 0; fila < largo; fila++) 
    {
        for (var col = 0; col < ancho; col++) 
        {
            if (mapa[fila].charAt(col).toLowerCase() == muroC) 
            {
                cube = soloCube.clone("ClonedCube" + fila + col);
                
                cube.position = new BABYLON.Vector3(TAM_BLOQUE / 2 + fila * TAM_BLOQUE,
                                                    TAM_BLOQUE/2,
                                                    TAM_BLOQUE / 2 + col * TAM_BLOQUE);
            }
            else if (mapa[fila].charAt(col).toLowerCase() == 'e')
            {
                x = TAM_BLOQUE / 2 + fila * TAM_BLOQUE;
                y = TAM_BLOQUE / 2 + col * TAM_BLOQUE;
                if(!muro)
                {
                    cube = soloCube.clone("ClonedCube" + fila + col);
                
                    cube.position = new BABYLON.Vector3(TAM_BLOQUE / 2 + fila * TAM_BLOQUE,
                                                        TAM_BLOQUE/2,
                                                        TAM_BLOQUE / 2 + col * TAM_BLOQUE);
                }
            }
            else if( mapa[fila].charAt(col).toLowerCase() == 's')
            {
                salida = new BABYLON.Vector3(TAM_BLOQUE / 2 + fila * TAM_BLOQUE, altura, TAM_BLOQUE / 2 + col * TAM_BLOQUE);
                if(!muro)
                {
                    cube = soloCube.clone("ClonedCube" + fila + col);
                
                    cube.position = new BABYLON.Vector3(TAM_BLOQUE / 2 + fila * TAM_BLOQUE,
                                                        TAM_BLOQUE/2,
                                                        TAM_BLOQUE / 2 + col * TAM_BLOQUE);
                }
            }

        }
    } 
    var altura = 5;
    if(!muro)
        altura += TAM_BLOQUE;
    freeCamera.position = new BABYLON.Vector3(x, altura, y);
    //Cambia la posicion a la entrada







    scene.registerBeforeRender(function () {
        if(freeCamera.position == salida)
        {
           var tiempo = inicio -  new Date().getTime();
        }
    });



     window.addEventListener("keydown", function (event) {
        if (event.keyCode === 32) {
            if (!vistaAerea) {
                vistaAerea = true;
                // Saving current position & rotation in the labyrinth
                camPositionInLabyrinth = freeCamera.position;
                camRotationInLabyrinth = freeCamera.rotation;
                animateCameraPositionAndRotation(freeCamera, freeCamera.position,
                    new BABYLON.Vector3(16, 400, 15),
                    freeCamera.rotation,
                    new BABYLON.Vector3(1.4912565104551518, -1.5709696842019767, freeCamera.rotation.z));
            }
            else {
                vistaAerea = false;
                animateCameraPositionAndRotation(freeCamera, freeCamera.position,
                    camPositionInLabyrinth, freeCamera.rotation, camRotationInLabyrinth);
            }
            freeCamera.applyGravity = !vistaAerea;
        }
    }, false);
    /*
    window.addEventListener("keydown", function (event) 
    {
        if (event.keyCode === 79) //codigo de la o
        {
           window.addEventListener("keydown", function (event) 
            {
                switch(event.keyCode) 
                {
                    case tecla del obj:
                        //creo objeto en freeCampera.position
                        break;
                }
            }, false);
        }
    }, false);*/

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
                reader.onload;
                /*
                intra = $('input[name=check1]').is(':checked');
                extra = $('input[name=check2]').is(':checked');*/
                labScene = cargarLaberinto();

                labScene.activeCamera.attachControl(canvas);

                inicio =  new Date().getTime();
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