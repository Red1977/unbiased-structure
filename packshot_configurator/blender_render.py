import bpy
import argparse

def blender_render(image_destination):
  try:
      print("inside bpy")
      scene = bpy.context.scene
      
      scene.render.filepath = image_destination  # Update this path

      try:
        bpy.data.objects.remove(bpy.data.objects["Cube"])
      except:
        pass

      bpy.ops.mesh.primitive_cylinder_add(radius=1, depth=2, enter_editmode=False, align='WORLD', location=(-1, 0, 0), scale=(1, 1, 1))
      bpy.ops.mesh.primitive_ico_sphere_add(radius=1, enter_editmode=False, align='WORLD', location=(1, 0, 0), scale=(1, 1, 1))
      bpy.ops.mesh.primitive_monkey_add(size=2, enter_editmode=False, align='WORLD', location=(0, 0, 1), scale=(0.1, 0.1, 0.1))

      print("render")
      bpy.context.scene.render.engine = 'CYCLES'
      #bpy.context.scene.cycles.device = 'GPU' #TODO: benchmark this

      bpy.ops.render.render(write_still=True)
    
  except Exception as e:
      print(e)

if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("image_destination", type=str)

    args = parser.parse_args()
    
    blender_render(args.image_destination)



    