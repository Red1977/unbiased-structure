const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const sayhello_button = document.getElementById("sayhello_button");
const texture_input = document.getElementById("texture_input");
const screenshot = document.getElementById("screenshot");
var texture_u = document.getElementById("tex_u");
var texture_v = document.getElementById("tex_v");
var size = document.getElementById("size");
var image_width = document.getElementById("image_width");
var image_height = document.getElementById("image_height");

const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
var active_mesh = {};
var all_meshes = [];
let server = "https://red1977.github.io/urban-octo-robot/";
const data = document.currentScript.dataset;
const background_image = data.background_image;
const label_image = data.label_image;
const glb_path = data.path_to_glb;
const texture_path = data.texture_image;

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
    constructor(mesh, DTWidth, DTHeight, scene){
        this.canvas_width = DTWidth;
        this.canvas_height = DTHeight;
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
        this.saved_left = new Float32Array([0.0]);
        this.saved_top = new Float32Array([0.0]);

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

        /*input.onchange = () => {
            const files = Array.from(input.files);
            const file = files[0];

            const reader = new FileReader();
            reader.onload = function (e) {
                    img.src =  e.target.result;
                    image_name_text.text = file.name;
            };
            reader.readAsDataURL(file);
            
        };
        input.click();*/

        img.src = texture_input.value;

        var textureContext = this.target_texture.getContext();
        var textureGround = this.target_texture;
        var label_width = this.canvas_width;
        var label_height = this.canvas_height;

        var left = this.left;
        var top = this.top;

        
        img.onload = function() {
            //Add image to dynamic texture
            textureContext.clearRect(0,0,label_width,label_height);

            var image_to_canvas_height_ratio = label_height / this.height;

            var mapped_image_height = (this.height * image_to_canvas_height_ratio) - 1;
            var mapped_image_width = (this.width * image_to_canvas_height_ratio) -1 ;

            left[0] = label_width/2 - mapped_image_width/2;
            top[0] = label_height/2 - mapped_image_height/2 ;

            textureContext.drawImage(this, left[0], top[0], mapped_image_width, mapped_image_height);
            textureGround.update(false);

            image_height.value = this.height;
            image_width.value = this.width;

        }
        this.mesh.material.albedoTexture = textureGround;
        this.mesh.material.useAlphaFromAlbedoTexture = true;
        this.image_name_text = image_name_text;
        this.image = img;

        this.top = top;
        this.left = left;
        this.saved_left = left;
        this.saved_top = top;
        this.saved_size = 1.0;
        this.saved_texture_u = 0;
        this.saved_texture_v = 0;

    }

    update_texture(){        

        var textureContext = this.target_texture.getContext();
        textureContext.clearRect(0,0,this.canvas_width, this.canvas_height);

        var image_to_canvas_height_ratio = this.canvas_height / this.image.height;

        var mapped_image_height = (this.image.height * image_to_canvas_height_ratio)-1;
        var mapped_image_width = (this.image.width * image_to_canvas_height_ratio)-1;

        var udiff = texture_u.value - this.saved_texture_u;
        var vdiff = texture_v.value - this.saved_texture_v;

        var left = this.saved_left[0] + udiff;
        var top = this.saved_top[0] + vdiff;

        if(this.saved_size != size.value){
            var size_diff = size.value - this.saved_size;
            var width_diff = this.canvas_width * size_diff;
            var height_diff = this.canvas_height * size_diff;
            left = this.saved_left - (width_diff/2);
            top = this.saved_top - (height_diff/2);
        }

        textureContext.drawImage(this.image,
            left, 
            top, 
            mapped_image_width * size.value, 
            mapped_image_height * size.value);

        this.target_texture.update(false);

        this.saved_size = size.value;
        this.saved_left[0] = left;
        this.saved_top[0] = top;

        this.saved_texture_u = texture_u.value;
        this.saved_texture_v = texture_v.value;
      
    }

    take_screenshot(){
        BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, this.camera, {width:1920, height:1920});        
    }
    
    register_callbacks(){
        //this.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, this.highlight ));
        //this.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, this.remove_highlight));
        //this.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, this.set_active_mesh));
    }
}


var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, Math.PI / 3, 25, BABYLON.Vector3.Zero(), scene);
	camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.7;
    
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
            console.log("start");

            label1 = scene.getMeshByName("Label");

            background_plane = scene.getMeshByName("image_plane_world");
            
            background_obj = new BackgroundMesh(background_plane, scene);
            label_obj = new LabelMesh(label1, 1024, 1024, scene);

            screenshot.addEventListener("click", function(){
                label_obj.take_screenshot();
            });

            texture_u.addEventListener("input", function(){;
                label_obj.update_texture();
            });

            texture_v.addEventListener("input", function(){;
                label_obj.update_texture();
            });

            size.addEventListener("input", function(){;
                label_obj.update_texture();
            });

            if (texture_input.value != ""){
                label_obj.upload_image_to_texture();
            }

            
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

const scene = createScene(); //Call the createScene function
// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
        scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});