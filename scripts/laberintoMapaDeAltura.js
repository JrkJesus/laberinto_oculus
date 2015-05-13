"use strict";


var TAM_BLOQUE = 8;

var freeCamera, canvas, engine, labScene;
var camPositionInLabyrinth, camRotationInLabyrinth;
var veloc = 0.5;
var textoDoc;
var vistaAerea = false,
    oculus = true;


function cargarLaberinto(nombreMapa) 
{   
    var scene = new BABYLON.Scene(engine);

    // Light
    var light0 = new BABYLON.PointLight("pointlight0", new BABYLON.Vector3(28, 78, 385), scene);
                            //PointLight(name, position, scene)
    light0.diffuse = new BABYLON.Color3(0.5137254901960784, 0.2117647058823529, 0.0941176470588235);
    light0.intensity = 0.2;
    var light1 = new BABYLON.PointLight("pointlight1", new BABYLON.Vector3(382, 96, 4), scene);
    light1.diffuse = new BABYLON.Color3(1, 0.7333333333333333, 0.3568627450980392);
    light1.intensity = 0.2;

    // Camera

    //https://github.com/BabylonJS/Babylon.js/wiki/05-Cameras
/*
    freeCamera = new BABYLON.OculusCamera("Oculus", new BABYLON.Vector3(0, 5, 0), scene);
    freeCamera.minZ = 1;
    freeCamera.speed = veloc;
    freeCamera.checkCollisions = true;
    freeCamera.applyGravity = true;
    freeCamera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
*/
    //arc camera
    freeCamera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 100, BABYLON.Vector3.Zero(), scene);
    freeCamera.lowerBetaLimit = 0.1;
    freeCamera.upperBetaLimit = (Math.PI / 2) * 0.9;
    freeCamera.lowerRadiusLimit = 30;
    freeCamera.upperRadiusLimit = 150;
    freeCamera.attachControl(canvas, true);
    

    // Ground

    //https://github.com/BabylonJS/Babylon.js/wiki/Advanced-Texturing
    //http://blogs.msdn.com/b/eternalcoding/archive/2013/07/10/babylon-js-using-multi-materials.aspx

    var groundTopMaterial = new BABYLON.StandardMaterial("groundTop", scene);
    groundTopMaterial.bumpTexture = new BABYLON.Texture("textures/Wall/bump.jpg", scene);

    var groundWallMaterial = new BABYLON.StandardMaterial("groundWalls", scene);
    groundWallMaterial.emissiveTexture = new BABYLON.Texture("textures/Wall/ladrillos2.jpg", scene);

    var groundMaterial = new BABYLON.MultiMaterial("groundMulti", scene);
    groundMaterial.subMaterials.push(groundTopMaterial);
    groundMaterial.subMaterials.push(groundWallMaterial);

    //groundMaterial.diffuseTexture = new BABYLON.Texture("textures/Wall/ladrillos.jpg", scene);
    //groundMaterial.bumpTexture = new BABYLON.Texture("textures/Wall/ladrillos", scene);
    //groundMaterial.specularTexture = new BABYLON.Texture("textures/Wall/ladrillos2", scene);

    var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "mapas/default.jpg", 200, 200, 125, 0, 5, scene, false);
    ground.material = groundMaterial;

    //Sphere to see the light's position

    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 800.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/Skybox/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

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
                //reader.onload;
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