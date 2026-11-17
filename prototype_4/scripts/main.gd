extends Node3D

@onready var hall: FeluccaSource3D = $"Main Hall"
@onready var cave: FeluccaSource3D = $"Cave"
@onready var chamber: FeluccaSource3D = $"Chamber"
@onready var sky: FeluccaSource3D = $"Sky"

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	var project := hall.project
	FeluccaConductor.tempo = project.bpm
	FeluccaConductor.boot_pool()
	FeluccaConductor.play()

	for s: FeluccaSource3D in [chamber, sky]:
		_pulse_on_kicks(s)


func _pulse_on_kicks(s: FeluccaSource3D) -> void:
	var prim := s.get_node("prim") as CSGPrimitive3D
	var light := s.get_node("light") as Light3D
	for part: FeluccaPart in s.parts:
		if part.engine == FeluccaEngine.DRUM:
			part.on_hit.connect(func(lane: int, _velocity: int) -> void:
				if lane == FeluccaLane.KICK:
					prim.scale = Vector3.ONE * 1.4
					create_tween().tween_property(prim, "scale", Vector3.ONE, 0.25)

					var x = randf_range(0, TAU)
					var y = randf_range(0, TAU)
					var z = randf_range(0, TAU)
					prim.rotation = Vector3(x, y, z)

					if light:
						light.light_energy = 4
						create_tween().tween_property(light, "light_energy", 1, 0.25)
			)
