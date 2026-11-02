extends AudioStreamPlayer3D

@export var falloff: Curve
## Measure distance on the horizontal plane only, making the shape an
## infinitely tall column instead of a sphere.
@export var ignore_y := false

## Gain is curve_y ^ exponent; 1.67 is roughly perceived loudness.
var exponent := 1.67

var full_volume_linear: float

var _radius: float


func _ready() -> void:
  full_volume_linear = volume_linear

  # confusingly, ATTENUATION_DISABLED doesn't actually disable attentuation. we
  # have to do that AND set max_distance to 0 to fully control falloff.
  _radius = max_distance
  if _radius <= 0.0:
    push_warning("%s: set max_distance above 0 to use the falloff curve." % name)
    set_process(false)
    return
  attenuation_model = ATTENUATION_DISABLED
  max_distance = 0.0


func _process(_delta: float) -> void:
  var cam := get_viewport().get_camera_3d()
  if cam == null:
    return
  var offset := cam.global_position - global_position
  if ignore_y:
    offset.y = 0.0
  var x := offset.length() / _radius
  if x >= 1.0:
    volume_linear = 0.0
    return
  var y := falloff.sample_baked(x) if falloff else 1.0
  volume_linear = full_volume_linear * pow(clampf(y, 0.0, 1.0), exponent)
