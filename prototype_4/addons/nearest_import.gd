@tool
extends EditorScenePostImport

func _post_import(scene: Node) -> Object:
	_set_texture_filter(scene)
	return scene

func _set_texture_filter(node: Node) -> void:
	var mesh_instance := node as MeshInstance3D
	if mesh_instance:
		if mesh_instance.mesh:
			for i in mesh_instance.mesh.get_surface_count():
				var m := mesh_instance.mesh.surface_get_material(i)
				if m is BaseMaterial3D:
					m.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS
	for child in node.get_children():
		_set_texture_filter(child)
