"""THE REFRESH — single source of truth for edit timing (seconds, 21.0 s total)."""

DURATION = 21.0
W, H = 1080, 1920

# Picture: (global_start, global_dur, clip, src_in, src_out). Speed = (src_out - src_in) / global_dur.
SEGMENTS = [
    (0.0, 3.0, "S1_t1.mp4", 0.60, 4.04),  # old phone, light reveal, push-in to macro
    (3.0, 4.0, "S2_t2.mp4", 0.00, 4.40),  # screen protector lowers, light ripple clears scratches
    (7.0, 3.0, "S3_t1.mp4", 0.00, 2.45),  # rear module, lens protector attaches (before pull-back)
    (10.0, 4.0, "S4_t1.mp4", 0.70, 4.70),  # clear case, phone seats, edge light
    (14.0, 4.5, "S5_t1.mp4", 0.30, 5.60),  # hero half-turn rear -> front
]
END_CARD_START = 18.5  # last S5 frame held underneath; the overlay floods it white

# Key physical moments in the footage (global time), used to sync SFX.
EVENTS = {
    "protector_seat": 4.97,
    "ripple_end": 5.85,
    "lens_attach": 9.40,
    "case_snap": 11.65,
    "hero_impact": 14.0,
    "flood": 18.5,
}

CUTS_WITH_FLASH = [7.0, 10.0, 14.0]

TITLES = [  # (text, in, out, style)
    ("YOUR PHONE DESERVES BETTER.", 0.45, 2.75, "line"),
    ("CRYSTAL CLEAR.", 5.15, 6.85, "line"),
    ("EVERY DETAIL PROTECTED.", 7.45, 9.85, "line"),
    ("THE PERFECT FIT.", 12.25, 13.85, "line"),
    ("PROTECT.", 14.25, 15.55, "word"),
    ("REFRESH.", 15.65, 16.95, "word"),
    ("REPEAT.", 17.05, 18.30, "word"),
]

END_CARD = {
    "beam": (17.95, 18.55),  # soft beam of light crosses the frame
    "flood": (18.30, 18.60),  # frame floods to white (#FFFFFF)
    "wordmark_in": 18.70,
    "tagline_in": 19.20,
    "subline_in": 19.55,
    "fade_black": (20.60, 21.0),
    "wordmark": "TEKAURA",
    "tagline": "REFRESH YOUR PHONE.",
    "subline": "PROTECT IT. STYLE IT. LOVE IT AGAIN.",
}

VO_LINES = [  # (text, global start)
    ("Your phone deserves better.", 0.50),
    ("A clearer screen.", 5.20),
    ("Protection for every detail.", 7.45),
    ("A fresh new look.", 12.70),
    ("Tekaura.", 18.60),
    ("Refresh your phone.", 19.38),
]

BPM = 120  # section changes (3, 7, 10, 14, 18.5 s) all land on beats
