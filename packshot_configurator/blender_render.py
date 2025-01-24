import bpy
import argparse
import shutil
import datetime
import os
import json

def create_material(label_number, mesh):
    """
    """
    #create the material
    label_mat_name = "label{}_material".format(label_number)
    label_mat = bpy.data.materials.new(label_mat_name)
    label_mat.use_nodes = True

    #find the principlbsdf node
    principled_bsdf = label_mat.node_tree.nodes["Principled BSDF"]

    #create image node network
    image_tex = label_mat.node_tree.nodes.new("ShaderNodeTexImage")
    tex_coords = label_mat.node_tree.nodes.new("ShaderNodeTexCoord")
    tex_mapping = label_mat.node_tree.nodes.new("ShaderNodeMapping")

    #put the new nodes in a better layout
    image_tex.location = ()
    principled_bsdf.location = (100, 250)
    image_tex.location = (-250, 250)
    tex_mapping.location = (-500, 250)
    tex_coords.location = (-750, 250)

    #build connections
    label_mat.node_tree.links.new(tex_mapping.inputs['Vector'], tex_coords.outputs['UV'])
    label_mat.node_tree.links.new(image_tex.inputs['Vector'], tex_mapping.outputs['Vector'])
    label_mat.node_tree.links.new(principled_bsdf.inputs['Base Color'], image_tex.outputs['Color'])
    label_mat.node_tree.links.new(principled_bsdf.inputs['Alpha'], image_tex.outputs['Alpha'])



def blender_render(image_destination, label_info):
    try:
        #TODO: loop around label list/ dict structure creating and assigning label materials

        # - unpack the json dict containing label info
        # - assemble shaders and plug in textures
        # - render

        print("--JSON ")
        json_data = json.loads(label_info)

        print("Copying base scene file")
        now = datetime.datetime.now()
        time_insert = now.strftime("%c").replace(" ", "_").replace(":","_")

        #TODO: get this from django at the kick off point
        source_scenefile = "/home/siobhan/dev/media/pump_bottle_multiple_labels_base.blend"
        source_scenefile_bits = os.path.splitext(source_scenefile)

        destination_scenefile = time_insert.join(source_scenefile_bits)

        shutil.copy2(source_scenefile, destination_scenefile)

        #open the newly copied scene
        bpy.ops.wm.open_mainfile(filepath=destination_scenefile)

        label_index = 0
        for label_info in json_data:
            for key, value in label_info.items():
                print("> {} : {}".format(key, value))

            #retrieve values passed through from babylon preview
            file_url = label_info["file_url"]
            image_width = label_info["image_width"]
            image_height = label_info["image_height"]
            horizontal_offset = label_info["horizontal_offset"]
            vertical_offset = label_info["vertical_offset"]
            scale = label_info["scale"]
            #create the material
            label_material = bpy.data.materials.new("label_material")
            label_material.use_nodes = True

            #find the principled bsdf node
            principled_bsdf = label_material.node_tree.nodes["Principled BSDF"]

            #create image node network
            image_tex = label_material.node_tree.nodes.new("ShaderNodeTexImage")
            tex_coords = label_material.node_tree.nodes.new("ShaderNodeTexCoord")
            tex_mapping = label_material.node_tree.nodes.new("ShaderNodeMapping") 

            #node settings
            image_tex.extension = 'CLIP'
            tex_mapping.vector_type = 'TEXTURE'

            # arrange graph nicely
            tex_coords.location = (-1000,150)
            tex_mapping.location = (-750,150)
            image_tex.location = (-250,150)

            #build connections
            label_material.node_tree.links.new(tex_mapping.inputs['Vector'], tex_coords.outputs['UV'])
            label_material.node_tree.links.new(image_tex.inputs['Vector'], tex_mapping.outputs['Vector'])
            label_material.node_tree.links.new(principled_bsdf.inputs['Base Color'], image_tex.outputs['Color'])
            label_material.node_tree.links.new(principled_bsdf.inputs['Alpha'], image_tex.outputs['Alpha'])

            #assign image slot
            print(">>>{}".format(file_url))
            image_tex.image = bpy.data.images.load("/home/siobhan/dev/unbiased-structure/packshot_configurator/{}".format(file_url))

            #Calculate and set image scale
            x_scale = float(image_width)/ float(image_height)
            tex_mapping.inputs[3].default_value[0] = x_scale
            #Set the offset position of the image
            tex_mapping.inputs[1].default_value[0] = (float(horizontal_offset)/1024.0)
            tex_mapping.inputs[1].default_value[1] = (float(vertical_offset)/1024.0)
            #set the image scale
            tex_mapping.inputs[3].default_value[0] *= float(scale)
            tex_mapping.inputs[3].default_value[1] *= float(scale)
            tex_mapping.inputs[3].default_value[2] *= float(scale)

            print(">> finished making the material")

            #Assign material to mesh
            label_mesh = bpy.data.objects["label{}".format(str(label_index))]
            print(label_mesh)
            label_mesh.data.materials.append(label_material)
            label_mesh.active_material_index = len(label_mesh.data.materials)-1

            #Switch of transmission on the label mesh to prevent shadowing onto inside of glass etc
            label_mesh.visible_transmission = False


            label_index = label_index + 1

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
    parser.add_argument("label_info", type=str)

    args = parser.parse_args()
    
    blender_render(args.image_destination, args.label_info)



    