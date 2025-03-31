# Packshot configurator
Proof of concept to demonstrate 3D scene being configured by a user using a BabylonJS front end then rendered server side by Blender.

# Workflow

Desktop
  * Blender scene is created with 0..n 'label<n>' objects
  * The scene must also have a background plane aligned with the camera
  * The scene is rendered to produce the background image
  * The scene is also exported to `.glb` format

Client Side
  * BabylonJS loads the `.glb` file into a 3D Web scene
  * A `BackgroundMesh` object is created from the camera aligned plane exported in the first step.
    A render of the original scene is applied onto this plane.
  * For each 'label<n>' object found in the scene, a `LabelMesh` object is instantiated.  Users can upload images
    from their computer to be used as textures for these objects.  The user can click and drag to position these label images.
  * The user can then choose to take a screenshot of their scene, this captures an image of the canvas and downloads it.

Server Side
  * If the user chooses to render the scene instead, image and position/ scale data is sent to the server side for rendering with Blender

Client Side
  * Once the render is complete, the resulting image is presented to the user.



See the Javascript front end in action here
https://playground.babylonjs.com/#0V8AHQ#109
