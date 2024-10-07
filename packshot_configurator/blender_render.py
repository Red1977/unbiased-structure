import bpy
import argparse
import shutil
import datetime
import os


def blender_render(image_destination):
  try:
      print("Copying base scene file")
      now = datetime.datetime.now()
      time_insert = now.strftime("%c").replace(" ", "_").replace(":","_")

      source_scenefile = "C:\\Users\\siobh\\unbiased-structure\\packshot_configurator\\media\\pump_bottle_experiment_with_label_placement_script_experiments.blend"
      source_scenefile_bits = os.path.splitext(source_scenefile)

      destination_scenefile = time_insert.join(source_scenefile_bits)

      shutil.copy2(source_scenefile, destination_scenefile)

      #open the newly copied scene
      bpy.ops.wm.open_mainfile(filepath=destination_scenefile)

      #set the label texture to the uploaded image
      bpy.data.materials["Material.007"].node_tree.nodes["Image Texture.001"].image = bpy.data.images.load("C:\\Users\\siobh\\unbiased-structure\\packshot_configurator\\media\\big_jigglypuff.png")

      #nudge it up a bit for lols
      bpy.data.materials["Material.007"].node_tree.nodes["Mapping.001"].inputs[1].default_value[1] = 0.1
      
      bpy.context.scene.render.filepath = image_destination  # Update this path

      print(">>> rendering Scene")
      bpy.context.scene.render.engine = 'CYCLES'
      bpy.context.scene.cycles.device = 'GPU' #TODO: benchmark this

      bpy.ops.render.render(write_still=True)
    
  except Exception as e:
      print(e)

if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("image_destination", type=str)

    args = parser.parse_args()
    
    blender_render(args.image_destination)



    