<?php
/*
  Plugin Name: Identic canvas
  Plugin URI: https://emelianovip.ru/2021/02/07/380/
  Description: This plugin creates user avatars in canvas format using their email
  Author: Brahman  <info@emelianovip.ru>
  Author URI: https://emelianovip.ru
  Version: 1.0.0
  License: GPLv2
  Text Domain: identic-canvas
 */


if (!function_exists('add_action')) {
    exit;
}

define('IDENTIC_CANVAS_PLUGIN_URL', plugin_dir_url(__FILE__));

add_action('init', 'identic_canvas_init');

function identic_canvas_init() {
    $identic = new IdenticCanvas();
    $identic->add_actions();

    wp_enqueue_style('identic', IDENTIC_CANVAS_PLUGIN_URL . 'css/identic.css');

    if (is_admin()) {
        add_filter('avatar_defaults', array($identic, 'add_default_avatar_option'));
        add_action('plugins_loaded', array($identic, 'load_plugin_textdomain'));
    }
}

class IdenticCanvas {

    function add_actions() {
        add_filter('get_avatar', array($this, 'get_identic'), 9, 4);
        wp_enqueue_script('identic', IDENTIC_CANVAS_PLUGIN_URL . 'js/identic.js', array('jquery'), '1.1', true);
    }

    function add_default_avatar_option($avatars) {
        $avatars['identic'] = __('Identic (canvas)', 'identic-canvas');
        return $avatars;
    }

    function get_identic($avatar, $user, $size, $default) {

        $email = 'example@example.com';
        if ($default == "identic") {
            if (is_int($user)) {
                // User id
                $user_data = get_user_by('id', $user);
                if (isset($user_data->user_email)) {
                    $email = $user_data->user_email;
                }
            } else if (is_string($user)) {
                // User email
                $email = $user;
            } else if (is_object($user)) {
                // Comment object
                if (isset($user->comment_author_email)) {
                    $email = $user->comment_author_email;
                }
            }
            if ($email) {
                $int_code = $this->smallHashCode($email);
                $avatar = '<canvas class="identic avatar" data-id="' . $int_code . '" width="' . $size . '" height="' . $size . '"></canvas>';
            }
        }
        return $avatar;
    }

    function md5_hex_to_dec($hex_str) {
        $arr = str_split($hex_str, 4);
        foreach ($arr as $grp) {
            $dec[] = str_pad(hexdec($grp), 5, '0', STR_PAD_LEFT);
        }
        return implode('', $dec);
    }

    function smallHashCode($s) {
        $md = md5($s);

        $dec = $this->md5_hex_to_dec($md);
        $str = "" . $dec;
        $dec_arr = array();

        while ($str) {
            $first = substr($str . "", 0, 12);
            $dec_arr[] = $first;
            $str = str_replace($first, '', $str);
        }
        $ret = 0;
        if (count($dec_arr)) {
            foreach ($dec_arr as $value) {
                $ret += $value;
            }
        }

        if (strlen("" . $ret) > 12) {
            $ret = (int) substr("" . $ret . "", 0, 12);
        }

        return $ret;
    }

    function load_plugin_textdomain() {
        load_plugin_textdomain('identic-canvas');
    }

}
