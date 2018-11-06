<?php

// Define and register settings via settings api
// ---------------------------------------------
function addField($id, $title, $callback) {
    $page = 'entryscape-settings';
    $section = 'default';

    add_settings_field( $id, $title, $callback, $page, $section); 	
    register_setting( $page, $id );
}

function entryscape_settings_api_init() {
    add_settings_section( 
        'default', 
        'EntryScape Settings', 
        'entryscape_settings_default_section_rendering', 
        'entryscape-settings'
    );

    addField('entrystore_base', 'EntryScape API URL', 'entrystore_base_FR');
    addField('entryscape_base', 'EntryScape Blocks version', 'entryscape_base_FR');
    addField('entryscape_bootstrap', 'Include Bootstrap', 'entryscape_bootstrap_FR');
    addField('entryscape_fontawesome', 'Include Font Awesome', 'entryscape_fontawesome_FR');
    addField('blocks_extentions', 'EntryScape Blocks extension URL', 'blocks_extentions_FR');
}
add_action( 'admin_init', 'entryscape_settings_api_init' );

function entryscape_settings_default_section_rendering() {
}

// Render individual fields
// ------------------------
function entrystore_base_FR() {
    echo '<input name="entrystore_base" id="entrystore_base" type="text" value="' . get_option( 'entrystore_base' ) . '" />';
}
function entryscape_base_FR() {
    echo '<input name="entryscape_base" id="entryscape_base" type="text" value="' . get_option( 'entryscape_base' ) . '" />';
}

function entryscape_bootstrap_FR() {
    echo '<input name="entryscape_bootstrap" id="entryscape_bootstrap" type="checkbox"' . (get_option( 'entryscape_bootstrap' ) === 'on' ? 'checked' : '') .'/>';
}

function entryscape_fontawesome_FR() {
    echo '<input name="entryscape_fontawesome" id="entryscape_fontawesome" type="checkbox"' . (get_option(
    'entryscape_fontawesome' ) === 'on' ? 'checked' : '') .'/>';
}

function blocks_extentions_FR() {
    echo '<input name="blocks_extentions" id="blocks_extentions" type="text" value="' . get_option( 'blocks_extentions' ) . '" />';
}

// Add entryscape settings into menu
// ---------------------------------
function entryscape_settings_add_page() {
    $page_title = 'EntryScape settings';
    $menu_title = 'EntryScape';
    $capability = 'manage_options';
    $menu_slug = 'entryscape-settings';
    $function = 'entryscape_settings_display';

    add_options_page( $page_title, $menu_title, $capability, $menu_slug, $function);
}
add_action('admin_menu', 'entryscape_settings_add_page');

// EntryScape settings page rendering via settings-api
// ---------------------------------------------------
function entryscape_settings_display() {
    echo '<form method="POST" action="options.php">';
    settings_fields( 'entryscape-settings' );
    do_settings_sections( 'entryscape-settings' );
    submit_button();
    echo '</form>';
}

?>