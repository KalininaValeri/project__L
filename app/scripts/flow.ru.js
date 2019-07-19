/* global cegedim */
'use strict';

cegedim.flow.init({
    'KZ18_LAVOMAX_00_0_START': {
        prev: false,
        next: 'KZ18_LAVOMAX_01_0_PROBLEM',
    },
    'KZ18_LAVOMAX_01_0_PROBLEM': {
        prev: 'KZ18_LAVOMAX_00_0_START',
        next: 'KZ18_LAVOMAX_02_0_COMPLICATIONS',
    },
    'KZ18_LAVOMAX_02_0_COMPLICATIONS': {
        prev: 'KZ18_LAVOMAX_01_0_PROBLEM',
        next: 'KZ18_LAVOMAX_04_0_EFFICIENCY',
    },
    'KZ18_LAVOMAX_03_1_COMPLICATIONS_CAPTION': {
        prev: 'KZ18_LAVOMAX_02_0_COMPLICATIONS',
        next: 'KZ18_LAVOMAX_04_0_EFFICIENCY',
    },
    'KZ18_LAVOMAX_04_0_EFFICIENCY': {
        prev: 'KZ18_LAVOMAX_02_0_COMPLICATIONS',
        next: 'KZ18_LAVOMAX_06_0_INTERFERON',
    },
    'KZ18_LAVOMAX_05_2_FORDOCTORS': {
        prev: 'KZ18_LAVOMAX_04_0_EFFICIENCY',
        next: 'KZ18_LAVOMAX_06_0_INTERFERON',
    },
    'KZ18_LAVOMAX_06_0_INTERFERON': {
        prev: 'KZ18_LAVOMAX_04_0_EFFICIENCY',
        next: 'KZ18_LAVOMAX_07_0_IMMUNETET',
    },
    'KZ18_LAVOMAX_07_0_IMMUNETET': {
        prev: 'KZ18_LAVOMAX_06_0_INTERFERON',
        next: 'KZ18_LAVOMAX_08_0_QUALITY',
    },
    'KZ18_LAVOMAX_08_0_QUALITY': {
        prev: 'KZ18_LAVOMAX_07_0_IMMUNETET',
        next: 'KZ18_LAVOMAX_09_0_AVAILABILITY',
    },
    'KZ18_LAVOMAX_09_0_AVAILABILITY': {
        prev: 'KZ18_LAVOMAX_08_0_QUALITY',
        next: 'KZ18_LAVOMAX_11_0_FEEDBACK_AND_ARTICLE',
    },
    'KZ18_LAVOMAX_10_3_PRICE': {
        prev: 'KZ18_LAVOMAX_09_0_AVAILABILITY',
        next: 'KZ18_LAVOMAX_11_0_FEEDBACK_AND_ARTICLE',
    },
    'KZ18_LAVOMAX_11_0_FEEDBACK_AND_ARTICLE': {
        prev: 'KZ18_LAVOMAX_09_0_AVAILABILITY',
        next: 'KZ18_LAVOMAX_14_0_FORM',
    },
    'KZ18_LAVOMAX_12_4_FEEDBACK': {
        prev: 'KZ18_LAVOMAX_11_0_FEEDBACK_AND_ARTICLE',
        next: 'KZ18_LAVOMAX_13_4_ARTICLE',
    },
    'KZ18_LAVOMAX_13_4_ARTICLE': {
        prev: 'KZ18_LAVOMAX_11_0_FEEDBACK_AND_ARTICLE',
        next: 'KZ18_LAVOMAX_14_0_FORM',
    },
    'KZ18_LAVOMAX_14_0_FORM': {
        prev: 'KZ18_LAVOMAX_11_0_FEEDBACK_AND_ARTICLE',
        next: 'KZ18_LAVOMAX_15_0_CALENDAR',
    },
    'KZ18_LAVOMAX_15_0_CALENDAR': {
        prev: 'KZ18_LAVOMAX_14_0_FORM',
        next: 'KZ18_LAVOMAX_16_0_END',
    },
    'KZ18_LAVOMAX_16_0_END': {
        prev: 'KZ18_LAVOMAX_15_0_CALENDAR',
        next: false,
    },
});
