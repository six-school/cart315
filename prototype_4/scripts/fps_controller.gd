# kitbashed script
class_name FPSController
extends CharacterBody3D

signal footstep

@export_group("Movement")
@export var walk_speed := 5.0
@export var ground_acceleration := 12.0
@export var ground_friction := 10.0
@export var air_acceleration := 2.0

@export_group("Look")
@export var mouse_sensitivity := 0.002
@export_range(0.0, 90.0) var max_pitch_degrees := 89.0
@export var eye_height := 1.6

@export_group("Steps")
## Tallest ledge the player can walk up or down without falling or getting stuck
@export var max_step_height := 0.35
## How quickly the camera catches up after a step (higher = less smoothing)
@export var step_smoothing := 15.0

@export_group("Headbob")
@export var bob_enabled := true
## Distance travelled per footstep, in meters. Sets the bob cadence.
@export var bob_step_length := 1.6
## Side-to-side (x) and up-and-down (y) bob amplitude, in meters.
@export var bob_amplitude := Vector2(0.025, 0.04)

const _DEFAULT_BINDINGS := {
	&"move_forward": KEY_W,
	&"move_back": KEY_S,
	&"move_left": KEY_A,
	&"move_right": KEY_D,
}

var camera: Camera3D

var _grounded := false
var _step_offset := 0.0  # Camera lag left over from the last step, decays to zero.
var _bob_phase := 0.0  # Advances by PI per footstep.
var _bob_blend := 0.0  # 0..1, fades headbob in and out with speed.


func _ready() -> void:
	_ensure_input_actions()
	_ensure_collision_shape()

	camera = Camera3D.new()
	camera.position.y = eye_height
	add_child(camera)
	camera.make_current()

	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


func _unhandled_input(event: InputEvent) -> void:
	var captured := Input.mouse_mode == Input.MOUSE_MODE_CAPTURED
	if event is InputEventMouseMotion and captured:
		var look: Vector2 = (event as InputEventMouseMotion).screen_relative * mouse_sensitivity
		rotate_y(-look.x)
		var max_pitch := deg_to_rad(max_pitch_degrees)
		camera.rotation.x = clampf(camera.rotation.x - look.y, -max_pitch, max_pitch)
	elif event.is_action_pressed(&"ui_cancel"):
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	elif event is InputEventMouseButton and (event as InputEventMouseButton).pressed and not captured:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


func _physics_process(delta: float) -> void:
	var input := Input.get_vector(&"move_left", &"move_right", &"move_forward", &"move_back")
	var target := transform.basis * Vector3(input.x, 0.0, input.y) * walk_speed

	var was_grounded := is_on_floor()
	var rate := air_acceleration
	if was_grounded:
		rate = ground_acceleration if input != Vector2.ZERO else ground_friction
	else:
		velocity += get_gravity() * delta

	# Frame-rate independent exponential approach towards the target velocity.
	var horizontal := Vector3(velocity.x, 0.0, velocity.z).lerp(target, 1.0 - exp(-rate * delta))
	velocity.x = horizontal.x
	velocity.z = horizontal.z

	var stepped_up := was_grounded and _try_step_up(delta)
	move_and_slide()
	var stepped_down := was_grounded and not stepped_up and _try_step_down()

	_grounded = is_on_floor() or stepped_down
	_update_camera(delta)


## If a too-steep obstacle blocks the move, sweep up, forward and back down.
## Landing on walkable ground higher than we started means it's a step: lift
## the body onto it and let move_and_slide() handle the horizontal motion.
func _try_step_up(delta: float) -> bool:
	var motion := Vector3(velocity.x, 0.0, velocity.z) * delta
	if motion.is_zero_approx():
		return false

	var result := PhysicsTestMotionResult3D.new()
	if not _test_motion(global_transform, motion, result) or _is_floor(result.get_collision_normal()):
		return false  # Nothing in the way, or it's a slope we can already walk up.

	var probe := global_transform
	_test_motion(probe, Vector3.UP * max_step_height, result)
	var rise := result.get_travel().y
	probe.origin += result.get_travel()

	_test_motion(probe, motion, result)
	probe.origin += result.get_travel()

	if not _test_motion(probe, Vector3.DOWN * rise, result) or not _is_floor(result.get_collision_normal()):
		return false
	probe.origin += result.get_travel()

	var height := probe.origin.y - global_position.y
	if height <= 0.01:
		return false  # Blocked by a wall, not a step.

	global_position.y = probe.origin.y
	_add_step_offset(-height)
	return true


## If we just walked off a ledge no taller than a step, snap down onto it
## instead of falling.
func _try_step_down() -> bool:
	if is_on_floor() or velocity.y > 0.0:
		return false

	var result := PhysicsTestMotionResult3D.new()
	if not _test_motion(global_transform, Vector3.DOWN * max_step_height, result) \
			or not _is_floor(result.get_collision_normal()):
		return false

	var drop := result.get_travel().y
	global_position.y += drop
	velocity.y = 0.0
	apply_floor_snap()
	_add_step_offset(-drop)
	return true


func _update_camera(delta: float) -> void:
	# Ease the camera back to eye height after the body teleports up/down a step.
	_step_offset = lerpf(_step_offset, 0.0, 1.0 - exp(-step_smoothing * delta))

	# Real velocity, so pushing against a wall doesn't bob.
	var real := get_real_velocity()
	var speed := Vector2(real.x, real.z).length() if _grounded else 0.0
	var target_blend := clampf(speed / walk_speed, 0.0, 1.0) if bob_enabled else 0.0
	_bob_blend = lerpf(_bob_blend, target_blend, 1.0 - exp(-10.0 * delta))

	var previous_foot := floori(_bob_phase / PI)
	_bob_phase = fmod(_bob_phase + speed * delta / bob_step_length * PI, TAU)
	if floori(_bob_phase / PI) != previous_foot and target_blend > 0.5:
		footstep.emit()

	# Vertical bob dips once per footstep; sway peaks on each foot strike, alternating sides.
	var bob := Vector2(cos(_bob_phase), -cos(2.0 * _bob_phase)) * bob_amplitude * _bob_blend
	camera.position = Vector3(bob.x, eye_height + bob.y + _step_offset, 0.0)


func _add_step_offset(amount: float) -> void:
	var limit := max_step_height * 2.0
	_step_offset = clampf(_step_offset + amount, -limit, limit)


func _test_motion(from: Transform3D, motion: Vector3, result: PhysicsTestMotionResult3D) -> bool:
	var params := PhysicsTestMotionParameters3D.new()
	params.from = from
	params.motion = motion
	params.margin = safe_margin
	return PhysicsServer3D.body_test_motion(get_rid(), params, result)


func _is_floor(normal: Vector3) -> bool:
	return normal.angle_to(up_direction) <= floor_max_angle + 0.01


func _ensure_input_actions() -> void:
	for action: StringName in _DEFAULT_BINDINGS:
		if InputMap.has_action(action):
			continue
		InputMap.add_action(action)
		var key := InputEventKey.new()
		key.physical_keycode = _DEFAULT_BINDINGS[action]
		InputMap.action_add_event(action, key)


func _ensure_collision_shape() -> void:
	for child in get_children():
		if child is CollisionShape3D:
			return
	# A cylinder's flat bottom handles step edges more predictably than a capsule.
	var shape := CylinderShape3D.new()
	shape.radius = 0.35
	shape.height = 1.8
	var collider := CollisionShape3D.new()
	collider.shape = shape
	collider.position.y = shape.height * 0.5
	add_child(collider)
