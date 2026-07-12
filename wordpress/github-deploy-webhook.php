<?php
/**
 * Dispara el workflow de GitHub Actions al guardar/editar un producto.
 *
 * INSTALACIÓN:
 * 1. Crear un token en GitHub: Settings > Developer settings > Fine-grained tokens.
 *    - Repositorio: codigoraul/viman-astro-
 *    - Permiso: "Contents" -> Read and write (necesario para repository_dispatch).
 * 2. Definir el token en wp-config.php (NUNCA pegarlo directo aquí):
 *    define('GITHUB_DEPLOY_TOKEN', 'github_pat_XXXX');
 * 3. Pegar este código en el plugin "Code Snippets" o en functions.php del tema.
 */

add_action('save_post_producto', 'viman_trigger_github_deploy', 10, 3);

function viman_trigger_github_deploy($post_id, $post, $update) {
    // Ignorar autoguardados, revisiones y borradores.
    if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
        return;
    }
    if ($post->post_status !== 'publish') {
        return;
    }
    if (!defined('GITHUB_DEPLOY_TOKEN') || !GITHUB_DEPLOY_TOKEN) {
        error_log('VIMAN deploy: falta GITHUB_DEPLOY_TOKEN en wp-config.php');
        return;
    }

    // Evitar múltiples deploys seguidos: máximo 1 cada 2 minutos.
    if (get_transient('viman_github_deploy_lock')) {
        return;
    }
    set_transient('viman_github_deploy_lock', 1, 2 * MINUTE_IN_SECONDS);

    $response = wp_remote_post(
        'https://api.github.com/repos/codigoraul/viman-astro-/dispatches',
        array(
            'headers' => array(
                'Accept'               => 'application/vnd.github+json',
                'Authorization'        => 'Bearer ' . GITHUB_DEPLOY_TOKEN,
                'X-GitHub-Api-Version' => '2022-11-28',
                'User-Agent'           => 'viman-wordpress',
            ),
            'body' => wp_json_encode(array(
                'event_type' => 'wordpress_update',
            )),
            'timeout' => 15,
        )
    );

    if (is_wp_error($response)) {
        error_log('VIMAN deploy: error al llamar a GitHub - ' . $response->get_error_message());
    } else {
        $code = wp_remote_retrieve_response_code($response);
        if ($code !== 204) {
            error_log('VIMAN deploy: GitHub respondió HTTP ' . $code . ' - ' . wp_remote_retrieve_body($response));
        }
    }
}
