# unbiased-structure
Proof of concept to demonstrate 3D scene being configured by a user using a BabylonJS front end then rendered server side by Blender.

# Workflow

Desktop
  * Blender scene is created with 0..n 'label<n>' objects
  * The scene must also have a background plane aligned with the camera
  * The scene is rendered to produce the background image
  * The scene is also exported to `.glb` format

Client Side
  * BabylonJS loads the 
