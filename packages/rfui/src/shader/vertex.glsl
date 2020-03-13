#include <common_vert>
#include <uv_share>
#include <uv_transform_share_define>
#include <uv_transform_vert_define>
#include <normal_share>
#include <worldpos_share>
#include <shadow_share>
#include <morph_target_vert>

void main() {

    #include <begin_position_vert>
    #include <begin_normal_vert>

    #include <morph_vert>
    #include <skinning_vert>
    #include <uv_vert>
    #include <uv_transform_vert>
    #include <normal_vert>
    #include <worldpos_vert>
    #include <shadow_vert>
    #include <position_vert>

		#ifdef O3_HAS_MASK

    v_uv = a_uv;

    #elif defined( O3_NEED_UV ) || defined( O3_HAS_ENVMAP ) || defined( O3_HAS_LIGHTMAP )

    // may need this calculate normal
    v_uv = vec2( 0., 0. );

    #endif

}
