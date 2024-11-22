
//"https://red1977.github.io/urban-octo-robot/"
//
//server+"/assets/", "pump_bottle_for_babylon_rear_proj_v03.glb"
//
//docs/assets/pump_bottle_render_layers_beauty.png


const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const sayhello_button = document.getElementById("sayhello_button");
const screenshot = document.getElementById("screenshot");
//var horizontal_offset = document.getElementById("horizontal_offset");
//var vertical_offset = document.getElementById("vertical_offset");
//var scale = document.getElementById("scale");
//var texture_input = document.getElementById("texture_input");
//var texture_name = document.getElementById("texture_name");
//var image_height = document.getElementById("image_height");
//var image_width = document.getElementById("image_width");

var num_labels = document.getElementById("num_labels");

var texture_input = [];
var texture_name = [];
var image_height = [];
var image_width = []
var horizontal_offset = [];
var vertical_offset = [];
var scale = [];

for (let i = 0; i < num_labels.value; i++) {
    console.log("setting up texure DOM elements");
    texture_input[i] = document.getElementById("texture_input"+i);
    texture_name[i] = document.getElementById("texture_name"+i);
    image_height[i] = document.getElementById("image_height"+i);
    image_width[i] = document.getElementById("image_width"+i);
    horizontal_offset[i] = document.getElementById("horizontal_offset"+i);
    vertical_offset[i] = document.getElementById("vertical_offset"+i);
    scale[i] = document.getElementById("scale"+i);

}

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
        this.camera = scene.activeCamera;
        this.take_screenshot = this.take_screenshot.bind(this);
        this.register_callbacks();
    }

    sayHello(){
        console.log("hello");
    }

    deactivate_meshes(){
        active_mesh = {};
        console.log("deactivating meshes");
    }

    take_screenshot(){
        //TODO: name and size to be derived from input
        BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, this.camera, {width: 2048, height: 2048, precision: 4},undefined, undefined,64,true,"my2k64PxScreenshot.png");
    }

    register_callbacks(){
        this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, this.deactivate_meshes));
    }
}

class LabelMesh{
    constructor(mesh, DTWidth, DTHeight, scene, label_num){
        this.label_num = label_num;
        this.canvas_width = DTWidth;
        this.canvas_height = DTHeight;
        this.label_moving = false;
        this.texture_uploaded = false;
        this.screen_x = 0;
        this.screen_y = 0;
        this.zoom_amount = 1.0;
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

        this.left = new Float32Array([0.0]);
        this.top = new Float32Array([0.0]);
        this.saved_left = new Float32Array([0.0]);
        this.saved_top = new Float32Array([0.0]);

        this.register_callbacks();
        
        
    }

    set_active_mesh(){
        active_mesh = this.mesh;
        this.upload_image_to_texture();
    }

    highlight(){
        if (!this.container.isVisible && !this.texture_uploaded){
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
        var label_num = this.label_num;

        input.onchange = () => {
            const files = Array.from(input.files);
            const file = files[0];

            const reader = new FileReader();
            reader.onload = function (e) {
                    img.src =  e.target.result;
                    console.log("Label num: " + label_num);
                    texture_input[label_num].value = e.target.result;
                    texture_name[label_num].value = file.name;
            };
            reader.readAsDataURL(file);
            
        };
        input.click();

        var textureContext = this.target_texture.getContext();
        var textureGround = this.target_texture;
        var label_width = this.canvas_width;
        var label_height = this.canvas_height;
        var label_num = this.label_num;

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

            console.log("Label num: " + label_num);
            image_height[label_num].value = this.height;
            image_width[label_num].value = this.width;

            //DOM elements to communicate back to HTML
            horizontal_offset[label_num].value = left[0];
            vertical_offset[label_num].value = top[0];

        }
        this.mesh.material.albedoTexture = textureGround;
        this.mesh.material.useAlphaFromAlbedoTexture = true;
        this.image_name_text = image_name_text;
        this.image = img;

        this.top = top;
        this.left = left;
        this.saved_left = left;
        this.saved_top = top;
        this.saved_blender_top = top[0];
        this.saved_blender_left = left[0];
        this.saved_size = 1.0;
        this.texture_uploaded = true;
        this.image = img;
        this.zoom_amount = 1.0;
        this.remove_highlight();

        scale[label_num].value = 1.0;

    }

    update_texture(){        

        //TODO: Also need to apply offset scaling to horizontal offset for Blender

        var textureContext = this.target_texture.getContext();
        textureContext.clearRect(0,0,this.canvas_width, this.canvas_height);

        var image_to_canvas_height_ratio = this.canvas_height / this.image.height;

        var mapped_image_height = (this.image.height * image_to_canvas_height_ratio)-1;
        var mapped_image_width = (this.image.width * image_to_canvas_height_ratio)-1;

        var udiff = (scene.pointerX - this.screen_x) * 2;
        var vdiff = (scene.pointerY - this.screen_y) * 2;

        var left = this.saved_left[0] + udiff;
        var top = this.saved_top[0] + vdiff;
        var blender_top = this.saved_blender_top - vdiff;
        var blender_left = this.saved_blender_left - udiff;

        if(this.saved_size != this.zoom_amount){
            var size_diff = this.zoom_amount - this.saved_size;
            var width_diff = this.canvas_width * size_diff;
            var height_diff = this.canvas_height * size_diff;
            left = this.saved_left - (width_diff/2);
            top = this.saved_top - (height_diff/2);
            blender_top = this.saved_blender_top - (height_diff/2);
            blender_left = this.saved_blender_left - (width_diff/2);
        }

        textureContext.drawImage(this.image,
            left, 
            top, 
            mapped_image_width * this.zoom_amount, 
            mapped_image_height * this.zoom_amount);

        this.target_texture.update(false);

        this.saved_size = this.zoom_amount;
        this.saved_left[0] = left;
        this.saved_top[0] = top;
        this.saved_blender_top = blender_top;
        this.saved_blender_left = blender_left;

        this.screen_x = scene.pointerX;
        this.screen_y = scene.pointerY;

        //set DOM element values to communicate back to HTML for use in Blender
        horizontal_offset[this.label_num].value = left;
        scale[this.label_num].value = this.zoom_amount;
        vertical_offset[this.label_num].value = blender_top;
      
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

            //set up the background object
            background_plane = scene.getMeshByName("image_plane_world");
            background_obj = new BackgroundMesh(background_plane, scene);
            screenshot.addEventListener("click", function(){
                background_obj.take_screenshot();
            });

            //set up label arrays 
            var labels = [];
            var label_meshes = [];

            console.log("Num Labels: " + num_labels.value);

            for (let i = 0; i < num_labels.value; i++) {
                label_meshes.push( scene.getMeshByName("Label") ); //TODO: adjust scene to name Labels with number suffix
                var label = new LabelMesh(label_meshes[i], 1024, 1024, scene, i);
                labels.push(label);
                label_meshes[i].label_object = label;
                label_meshes[i].isLabel = true;
            }

            scene.onPointerObservable.add((pointerInfo) => {      		
                switch (pointerInfo.type) {
                    case BABYLON.PointerEventTypes.POINTERDOWN:
                        if(pointerInfo.pickInfo.hit) {
                            if(pointerInfo.pickInfo.pickedMesh.isLabel){
                                if(pointerInfo.pickInfo.pickedMesh.label_object.texture_uploaded == false){
                                    pointerInfo.pickInfo.pickedMesh.label_object.set_active_mesh();
                                }
                                else{
                                    pointerInfo.pickInfo.pickedMesh.label_object.label_moving = true;
                                    pointerInfo.pickInfo.pickedMesh.label_object.screen_x = scene.pointerX;
                                    pointerInfo.pickInfo.pickedMesh.label_object.screen_y = scene.pointerY;
                                }
                            }
                        }
                        break;
                    case BABYLON.PointerEventTypes.POINTERUP:
                        //TODO ; set all labels to not moving
                        for (let i = 0; i < num_labels.value; i++) {
                            label_meshes[i].label_object.label_moving = false;
                        }
                        break;
                    case BABYLON.PointerEventTypes.POINTERMOVE:
                        //TODO cycle through labels to see which one is moving
                            for (let i = 0; i < num_labels.value; i++) {
                                if(label_meshes[i].label_object.label_moving){
                                    label_meshes[i].label_object.update_texture();
                                }
                            }
                        break;
                    case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
                        if(pointerInfo.pickInfo.hit) {
                            pointerInfo.pickInfo.pickedMesh.label_object.set_active_mesh();
                        }
                        break;
                    case BABYLON.PointerEventTypes.POINTERWHEEL:
                        if(pointerInfo.event.wheelDelta > 0){
                            //alert("zoom in!");
                            pointerInfo.pickInfo.pickedMesh.label_object.zoom_amount =  pointerInfo.pickInfo.pickedMesh.label_object.zoom_amount * 1.1;
                            pointerInfo.pickInfo.pickedMesh.label_object.update_texture();
                        }
                        if(pointerInfo.event.wheelDelta < 0){
                            pointerInfo.pickInfo.pickedMesh.label_object.zoom_amount =  pointerInfo.pickInfo.pickedMesh.label_object.zoom_amount * 0.9;
                            pointerInfo.pickInfo.pickedMesh.label_object.update_texture();
                            //alert("zoom out");
                        }
                        //pointerInfo.pickInfo.pickedMesh.label_object.update_texture();
                        break;
                    
                }
            });

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