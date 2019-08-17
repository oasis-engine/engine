attribute vec3 a_position;

#ifdef O3_HAS_UV

attribute vec2 a_uv;

#endif

#ifdef O3_HAS_NORMAL

attribute vec3 a_normal;

#endif

#ifdef O3_HAS_TANGENT

attribute vec4 a_tangent;

#endif

#ifdef O3_HAS_VERTEXCOLOR

attribute vec4 a_color;

#endif

#if defined( O3_HAS_SKIN ) && defined( O3_JOINTS_NUM )

attribute vec4 a_joint;
attribute vec4 a_weight;
uniform mat4 u_jointMatrix[ O3_JOINTS_NUM ];

#endif

uniform mat4 u_localMat;
uniform mat4 u_modelMat;
uniform mat4 u_viewMat;
uniform mat4 u_projMat;
uniform mat4 u_MVMat;
uniform mat4 u_MVPMat;
uniform mat3 u_normalMat;
uniform vec3 u_cameraPos;
uniform float u_time;
