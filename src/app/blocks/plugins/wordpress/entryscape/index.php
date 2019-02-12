<?php
/*
Plugin Name: EntryScape
Plugin URI: http://entryscape.com
Description: Testing EntryScape integration
Version: 0.0.1
Author: Matthias Palmer
Author URI: https://metasolutions.se/team
License: GPL2
*/
defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

$do_entryscape_config = true;

function entryscape_script_config() {
    $ese = get_option('blocks_extentions');
    if ($ese) {
        wp_enqueue_script('entryscape_extention_script', $ese, array(), null, true);
    }
    $esb = 'https://static.cdn.entryscape.com/blocks/' . get_option('entryscape_base');
    wp_enqueue_script('entryscape_script', $esb . '/app.js', array(), null, true);
/*    wp_enqueue_style('entryscape_css', $esb . '/style.css');
    wp_enqueue_script('jquery');
    if (get_option('entryscape_bootstrap') === 'on') {
       wp_enqueue_script('entryscape_bootstrap', $esb . '/bootstrap.js', array());
       wp_enqueue_style('entryscape_bootstrap', $esb . '/bootstrap.css');
    }
    if (get_option('entryscape_fontawesome') === 'on') {
       wp_enqueue_style('fontawesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
    }*/
    global $do_entryscape_config;
    if ($do_entryscape_config) {
        $do_entryscape_config = false;
        $params = array(
            'entrystore_base' => get_option('entrystore_base'),
            'entryscape_base' => $esb
        );
        if (function_exists('pll_get_post_language')) {
          $params['page_language'] = pll_get_post_language(get_the_ID());
        }
        wp_localize_script( 'entryscape_script', '__entryscape_plugin_config', $params );
    }
};

function entryscape($atts, $content = null ) {
    entryscape_script_config();
    $dataattr = array();
    if (array_key_exists('component', $atts) || array_key_exists('block', $atts)) {
      foreach ($atts as $key => $value) {
        $dataattr[] = 'data-entryscape-' . $key . '="' . $value . '"';
      }

      if (empty($content)) {
        return '<span class="entryscape" data-entryscape="true" ' . join(' ', $dataattr) . '></span>';
      } else {
        return '<script type="text/x-entryscape-handlebar" data-entryscape="true" ' . join(' ', $dataattr) . '>' . html_entity_decode($content) . '</script>';
      }
    } else {
      return '<script data-entryscape="true" type="text/x-entryscape-json">' . html_entity_decode($content) . '</script>';
    }
}
add_shortcode( 'entryscape', 'entryscape' );

require(ABSPATH . 'wp-content/plugins/entryscape/settings.php');

/* Makes sure no auto p and br tags are added to shortcode content
remove_filter( 'the_content', 'wpautop' );
add_filter( 'the_content', 'wpautop' , 12);
*/

add_filter( 'no_texturize_shortcodes', 'shortcodes_to_exempt_from_wptexturize' );
function shortcodes_to_exempt_from_wptexturize( $shortcodes ) {
    $shortcodes[] = 'entryscape';
    return $shortcodes;
}
?>
