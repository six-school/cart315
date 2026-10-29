extends Node3D

@onready var a: FeluccaSource3D = $A
@onready var b: FeluccaSource3D = $B

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	var project := a.project
	FeluccaConductor.tempo = project.bpm
	FeluccaConductor.boot_pool()
	FeluccaConductor.play()
	a.play()
	b.play()
	var t := create_tween().set_loops()
	t.tween_method(func(bpm: float) -> void: FeluccaConductor.tempo = bpm, float(project.bpm), 80.0, 8.0).set_delay(4.0)
	t.tween_method(func(bpm: float) -> void: FeluccaConductor.tempo = bpm, 80.0, float(project.bpm), 8.0).set_delay(4.0)
	for s: FeluccaSource3D in [a, b]:
		_pulse_on_kicks(s)

func _pulse_on_kicks(s: FeluccaSource3D) -> void:
	var sphere := s.get_node("orb") as CSGSphere3D
	for part: FeluccaPart in s.parts:
		if part.engine == FeluccaPart.Engine.ENGINE_DRUM:
			part.on_hit.connect(func(lane: int, _velocity: int) -> void:
				if lane == FeluccaPart.Lane.LANE_KICK:
					sphere.scale = Vector3.ONE * 1.4
					create_tween().tween_property(sphere, "scale", Vector3.ONE, 0.25)
			)
