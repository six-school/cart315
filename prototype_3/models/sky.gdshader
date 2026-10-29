shader_type spatial;
render_mode unshaded, fog_disabled;

uniform sampler2D panorama : source_color, filter_linear_mipmap, repeat_enable;
uniform float energy = 1.0;
uniform float rotation_degrees = 0.0;

void fragment() {
	// Direction from the camera through this pixel, in world space
	vec3 dir = normalize((INV_VIEW_MATRIX * vec4(-VIEW, 0.0)).xyz);

	float u = atan(dir.x, -dir.z) / TAU; // -0.5..0.5, wraps behind the camera's default facing
	float v = acos(clamp(dir.y, -1.0, 1.0)) / PI;

	float u_shifted = fract(u);
	u = fwidth(u) <= fwidth(u_shifted) ? u : u_shifted;

	ALBEDO = texture(panorama, vec2(u + rotation_degrees / 360.0, v)).rgb * energy;
}