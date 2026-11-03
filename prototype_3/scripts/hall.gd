extends Node3D

@export var fx: PackedScene

@onready var hall: FeluccaSource3D = $"../Main Hall"
@onready var player: Node3D = $"../Player"

var arpPart: FeluccaPart

var noise := FastNoiseLite.new()

func _ready() -> void:
	noise.noise_type = FastNoiseLite.TYPE_SIMPLEX
	noise.frequency = 0.25

	arpPart = hall.part_2
	arpPart.level = 100
	hall.schedule(FeluccaWhen.next_step(arpPart, 1), FeluccaAction.note(arpPart, "C1 E1 F1 G1 A2"))

	arpPart.on_note.connect(func(note: int, _vel: int) -> void:
		var burst: GPUParticles3D = fx.instantiate()
		add_child(burst)

		var t := Time.get_ticks_msec() / 1000.0

		var wander := remap(player.position.y, 0, 10, 1, 5)

		burst.position = Vector3(
			noise.get_noise_2d(t, 0.0) * wander,
			player.position.y + 3 + sin(t) / 2,
			noise.get_noise_2d(t, 100.0) * wander
		)

		var shader_mat := burst.draw_pass_1.surface_get_material(0).duplicate() as ShaderMaterial
		var std := shader_mat.next_pass.duplicate() as StandardMaterial3D

		std.albedo_color = std.albedo_color.lerp(Color.RED, remap(player.position.y, 0, 10, 0, 1))
		shader_mat.next_pass = std
		burst.material_override = shader_mat


		burst.emitting = true
		burst.finished.connect(burst.queue_free)
	)

func _process(_delta: float) -> void:
	var t := roundi(remap(player.position.y, 0, 10, 0, 24))
	if arpPart.transpose != t:
		arpPart.transpose = t
