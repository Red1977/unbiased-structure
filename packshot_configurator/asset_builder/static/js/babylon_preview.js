const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const sayhello_button = document.getElementById("sayhello_button");
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
var active_mesh = {};
var all_meshes = [];
let server = "https://red1977.github.io/urban-octo-robot/";
const data = document.currentScript.dataset;
const background_image = data.background_image;
const glb_path = data.path_to_glb;

class BackgroundMesh{
    constructor(mesh, scene){
        this.bg_material = new BABYLON.BackgroundMaterial("myMaterial", scene);
        this.bg_material.diffuseTexture = new BABYLON.Texture(server+'/assets/'+background_image, scene);
        this.bg_material.diffuseTexture.vScale = -1.0;
        this.mesh = mesh;
        this.mesh.material = this.bg_material;
        this.mesh.isPickable = true;
        this.actionManager = new BABYLON.ActionManager(scene);
        this.mesh.actionManager = this.actionManager;
        this.deactivate_meshes = this.deactivate_meshes.bind(this);
        this.register_callbacks = this.register_callbacks.bind(this);
        this.sayHello = this.sayHello.bind(this);
        this.register_callbacks();
    }

    sayHello(){
        console.log("hello");
    }

    deactivate_meshes(){
        active_mesh = {};
        console.log("deactivating meshes");
        //set all UIs to invisible
        for (let mesh of all_meshes) {
            mesh.container.isVisible = false;
        }
    }

    register_callbacks(){
        this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, this.deactivate_meshes));
    }
}

class LabelMesh{
    constructor(mesh, DTWidth, DTHeight, gui, scene){
        this.canvas_width = DTWidth;
        this.canvas_height = DTHeight;
        this.gui = gui;
        this.camera = scene.activeCamera;
        mesh.isPickable = true;
        all_meshes.push(this);
        this.mesh = mesh;
        this.mesh.material = new BABYLON.PBRMaterial("pbr", scene);
        this.mesh.material.roughness = 1.0;
        this.actionManager = new BABYLON.ActionManager(scene);
        this.target_texture = new BABYLON.DynamicTexture(mesh.name+" dynamic texture",{ width: DTWidth, height: DTHeight } , scene);
        this.target_texture.hasAlpha = true;
        this.target_texture.updateSamplingMode(BABYLON.Constants.TEXTURE_TRILINEAR_SAMPLINGMODE);
        this.highlight_layer = new BABYLON.HighlightLayer(mesh.name, scene);
        this.mesh.actionManager = this.actionManager;
        this.register_callbacks = this.register_callbacks.bind(this);
        this.highlight = this.highlight.bind(this);
        this.remove_highlight = this.remove_highlight.bind(this);
        this.upload_image_to_texture = this.upload_image_to_texture.bind(this);
        this.set_active_mesh = this.set_active_mesh.bind(this);
        this.update_texture = this.update_texture.bind(this);
        this.take_screenshot = this.take_screenshot.bind(this);

        this.left = new Float32Array([0.0]);
        this.top = new Float32Array([0.0]);

        this.create_gui();
        this.register_callbacks();
        
        
    }

    set_active_mesh(){
        active_mesh = this.mesh;

        //set all UIs invisibly
        for (let mesh of all_meshes) {
            mesh.container.isVisible = false;
        }
        this.container.isVisible = true;
        this.upload_image_to_texture();
    }

    highlight(){
        if (!this.container.isVisible){
            this.highlight_layer.addMesh(this.mesh, BABYLON.Color3.Teal()); 
        }
    }

    remove_highlight(){
        this.highlight_layer.removeAllMeshes();
    }
    
    upload_image_to_texture(){
        const input = document.createElement('input');
        input.type = 'file';

        var img = new Image();
        var image_name_text = this.image_name_text;

        input.onchange = () => {
            const files = Array.from(input.files);
            const file = files[0];

            const reader = new FileReader();
            reader.onload = function (e) {
                    img.src =  e.target.result;
                    image_name_text.text = file.name;
            };
            reader.readAsDataURL(file);
            
        };
        input.click();

        var textureContext = this.target_texture.getContext();
        var textureGround = this.target_texture;
        var label_width = this.canvas_width;
        var label_height = this.canvas_height;

        var left = this.left;
        var top = this.top;

        var tex_u_slider = this.texture_u_slider;
        var tex_v_slider = this.texture_v_slider;
        var size_slider = this.size_slider;
        
        img.onload = function() {
            //Add image to dynamic texture
            textureContext.clearRect(0,0,label_width,label_height);

            left[0] = label_width/2 - this.width/2;
            top[0] = label_height/2 - this.height/2;

            textureContext.drawImage(this, left[0], top[0], this.width, this.height);
            textureGround.update(false);
            tex_u_slider.value = 0.0;
            tex_v_slider.value = 0.0;
            size_slider.value = 1.0;

        }
        this.mesh.material.albedoTexture = textureGround;
        this.mesh.material.useAlphaFromAlbedoTexture = true;
        this.image_name_text = image_name_text;
        this.image = img;

    }

    update_texture(){
        var textureContext = this.target_texture.getContext();
        textureContext.clearRect(0,0,this.canvas_width, this.canvas_height);

        var left = this.left[0] + this.texture_u_slider.value;
        var top = this.top[0] + this.texture_v_slider.value;

        textureContext.drawImage(this.image,
            left, 
            top, 
            this.image.width * this.size.value, 
            this.image.height * this.size.value);
        
        this.target_texture.update(false);
    }

    take_screenshot(){
        BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, this.camera, {width:1920, height:1920});        
    }
    
    register_callbacks(){
        this.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, this.highlight ));
        this.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, this.remove_highlight));
        this.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, this.set_active_mesh));
    }

    create_gui(){
        // GUI
        const grid = new BABYLON.GUI.Grid();
        grid.width = "250px";
        grid.addColumnDefinition(250, true);
        grid.addRowDefinition(30, true);
        grid.addRowDefinition(30, true);
        grid.addRowDefinition(30, true);
        grid.addRowDefinition(30, true);
        grid.addRowDefinition(30, true);
        grid.addRowDefinition(30, true);
        grid.addRowDefinition(30, true);
        grid.background = "teal";
        grid.isVisible = false;
        grid.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.gui.addControl(grid);

        var text1 = new BABYLON.GUI.TextBlock();
        text1.text = this.mesh.name;
        text1.color = "white";
        text1.fontSize = 24;
        grid.addControl(text1,0,0); 

        var image_name_text = new BABYLON.GUI.TextBlock();
        image_name_text.text = "...";
        grid.addControl(image_name_text,2,0);

        var tex_u = new BABYLON.GUI.Slider();
        tex_u.minimum = -this.canvas_width/2;
        tex_u.maximum = this.canvas_width/2;
        tex_u.value = 0;
        tex_u.height = "20px";
        tex_u.width = "200px";
        tex_u.background = "#84bfa9";
        tex_u.color = "#46bd91";
        tex_u.onValueChangedObservable.add(this.update_texture);

        this.texture_u_slider = tex_u;

        grid.addControl(tex_u,3,0);

        var tex_v = new BABYLON.GUI.Slider();
        tex_v.minimum = -this.canvas_height/2;
        tex_v.maximum = this.canvas_height/2;
        tex_v.value = 0;
        tex_v.height = "20px";
        tex_v.width = "200px";
        tex_v.background = "#84bfa9";
        tex_v.color = "#46bd91";
        tex_v.onValueChangedObservable.add(this.update_texture);

        this.texture_v_slider = tex_v;

        grid.addControl(tex_v,4,0);

        var size = new BABYLON.GUI.Slider();
        size.minimum = 0.0;
        size.maximum = 5.0;
        size.step = 0.1
        size.value = 1.0;
        size.height = "20px";
        size.width = "200px";
        size.background = "#84bfa9";
        size.color = "#46bd91";
        size.onValueChangedObservable.add(this.update_texture);

        this.size = size;

        grid.addControl(size,5,0);

        var screenshot_button = BABYLON.GUI.Button.CreateSimpleButton("but", "Screenshot");
        screenshot_button.width = "200px";
        screenshot_button.height = "20px";
        screenshot_button.color = "white";
        screenshot_button.background = "#84bfa9";
        screenshot_button.onPointerClickObservable.add(this.take_screenshot);

        this.screenshot_button = screenshot_button;
        
        grid.addControl(screenshot_button,6,0);

        this.container = grid;
        this.image_name_text = image_name_text;
        
    }
}


var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, Math.PI / 3, 25, BABYLON.Vector3.Zero(), scene);
	camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.7;

	var groundWidth = 10;
    var groundHeight = 5;

    //Whole screen UI
    var guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI");
    
    console.log("glb_path:");
    console.log(glb_path);

    const container = BABYLON.SceneLoader.LoadAssetContainer(server + "/assets/" , glb_path, scene, function (container) {

            container.addAllToScene();

            //scene camera to one loaded
            scene.activeCamera = container.cameras[0];
            scene.meshes = container.meshes;

            //light the scene using an .env file generated from the blender scene
            var studio_env = BABYLON.CubeTexture.CreateFromPrefilteredData(server + "/assets/gg_modern_industrial_010.env", scene);
            studio_env.name = "studio_env";
            studio_env.gammaSpace = false;
            scene.environmentTexture = studio_env;

            label1 = scene.getMeshByName("Label");

            background_plane = scene.getMeshByName("image_plane_world");
            
            background_obj = new BackgroundMesh(background_plane, scene);
            label_obj = new LabelMesh(label1, 1024*(20/10), 1024, guiTexture, scene);

            
            var pipeline = new BABYLON.DefaultRenderingPipeline(
                "defaultPipeline", // The name of the pipeline
                true, // Do you want the pipeline to use HDR texture?
                scene, // The scene instance
                [scene.activeCamera] // The list of cameras to be attached to
            );

            pipeline.imageProcessingEnabled = false;
            pipeline.samples = 12;

    });

    

    return scene;

};

sayhello_button.addEventListener("click", function(){
    alert("hello");
});

const scene = createScene(); //Call the createScene function
// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
        scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});