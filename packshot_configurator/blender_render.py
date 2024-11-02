import bpy
import argparse
import shutil
import datetime
import os
import json


def blender_render(image_destination, file_url, image_height, image_width, horizontal_offset, vertical_offset, scale, myjson):
    try:
        print("--JSON ")
        json_data = json.loads(myjson)
        for key, value in json_data.items():
            print("> {} : {}".format(key, value))

        print("------ ")

        print("--Rendering with settings----")
        print("image_destination: {}".format(image_destination))
        print("file_url: {}".format(file_url))
        print("image_height: {}".format(image_height))
        print("image_width: {}".format(image_width))
        print("horizontal_offset: {}".format(horizontal_offset))
        print("vertical_offset: {}".format(vertical_offset))
        print("scale: {}".format(scale))

        print("Copying base scene file")
        now = datetime.datetime.now()
        time_insert = now.strftime("%c").replace(" ", "_").replace(":","_")

        source_scenefile = "C:\\Users\\siobh\\unbiased-structure\\packshot_configurator\\media\\pump_bottle_experiment_with_label_placement_script_experiments_base.blend"
        source_scenefile_bits = os.path.splitext(source_scenefile)

        destination_scenefile = time_insert.join(source_scenefile_bits)

        shutil.copy2(source_scenefile, destination_scenefile)

        #open the newly copied scene
        bpy.ops.wm.open_mainfile(filepath=destination_scenefile)

        #set the label texture to the uploaded image
        bpy.data.materials["Material.007"].node_tree.nodes["Image Texture.001"].image = bpy.data.images.load("C:/Users/siobh/unbiased-structure/packshot_configurator/{}".format(file_url))

        #Set the initial x scale of the image 
        x_scale = image_width/ image_height
        bpy.data.materials["Material.007"].node_tree.nodes["Mapping.001"].inputs[3].default_value[0] = x_scale

        #Set the offset position of the image
        bpy.data.materials["Material.007"].node_tree.nodes["Mapping.001"].inputs[1].default_value[0] = (horizontal_offset/1024.0)
        bpy.data.materials["Material.007"].node_tree.nodes["Mapping.001"].inputs[1].default_value[1] = (vertical_offset/1024.0)

        #set the image scale
        bpy.data.materials["Material.007"].node_tree.nodes["Mapping.001"].inputs[3].default_value[0] *= scale
        bpy.data.materials["Material.007"].node_tree.nodes["Mapping.001"].inputs[3].default_value[1] *= scale
        bpy.data.materials["Material.007"].node_tree.nodes["Mapping.001"].inputs[3].default_value[2] *= scale

        bpy.context.scene.render.filepath = image_destination  # Update this path

        print(">>> rendering Scene {}".format(destination_scenefile))
        bpy.context.scene.render.engine = 'CYCLES'
        bpy.context.scene.cycles.device = 'GPU' #TODO: benchmark this

        bpy.ops.wm.save_mainfile()
        bpy.ops.render.render(write_still=True)
    
    except Exception as e:
        print(e)

if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("image_destination", type=str)
    parser.add_argument("file_url", type=str)
    parser.add_argument("image_height", type=float)
    parser.add_argument("image_width", type=float)
    parser.add_argument("horizontal_offset", type=float)
    parser.add_argument("vertical_offset", type=float)
    parser.add_argument("scale", type=float)
    parser.add_argument("myjson", type=str)

    args = parser.parse_args()
    
    blender_render(args.image_destination, args.file_url, args.image_height, args.image_width, args.horizontal_offset, args.vertical_offset, args.scale, args.myjson)



    