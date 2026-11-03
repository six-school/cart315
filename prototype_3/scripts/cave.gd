extends FeluccaSource3D

@export var fx: PackedScene

@onready var player: Node3D = $"../Player"


var noise := FastNoiseLite.new()

@onready var init_pos = position

func _ready() -> void:
	noise.noise_type = FastNoiseLite.TYPE_SIMPLEX
	noise.frequency = 0.05

	part_4.on_hit.connect(func(lane: int, _vel: int) -> void:
		var burst: GPUParticles3D = fx.instantiate()
		add_child(burst)

		var c = Color.from_hsv(float(lane) / 8, 1, 1)

		var pm := burst.process_material.duplicate() as ParticleProcessMaterial
		pm.color = c
		burst.process_material = pm

		burst.emitting = true
		burst.finished.connect(burst.queue_free)
	)

var wander := 5

func _process(_delta: float) -> void:
	var t := Time.get_ticks_msec() / 1000.0

	position = Vector3(
		init_pos.x + noise.get_noise_2d(t, 0.0) * wander,
		init_pos.y + sin(t) / 3,
		init_pos.z + noise.get_noise_2d(t, 100.0) * wander
	)
