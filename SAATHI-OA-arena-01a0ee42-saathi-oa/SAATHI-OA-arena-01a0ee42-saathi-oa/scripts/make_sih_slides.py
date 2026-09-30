#!/usr/bin/env python3
"""
Generate slide graphics for the SAATHI Smart India Hackathon (SIH) presentation.

Outputs (written to ../public/sih-ppt relative to this file):
  sih-textbox-slide.png   16:9 slide whose hero element is a styled text box
  sih-textbox.png         the same text box on a transparent background
  sih-title-slide.png     16:9 title slide (logo mark + text box)

Edit the CONTENT constants below and re-run:
    python3 scripts/make_sih_slides.py
"""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# --------------------------------------------------------------------------
# CONTENT  (edit freely - every word on the slides comes from here)
# --------------------------------------------------------------------------
CONTENT = {
    "event": "SMART INDIA HACKATHON",
    "title": "SAATHI",
    "subtitle": "AI-Assisted Osteoarthritis Screening Support",
    "tagline": "Your companion for healthier movement.",
    "chip": "AI-ASSISTED OSTEOARTHRITIS SCREENING",
    "bullets": [
        "Built for community healthcare workers",
        "Gives a risk estimate, not a diagnosis",
        "Works offline, with guidance and exercises",
    ],
    "footer": "Team SAATHI  ·  Smart India Hackathon",
    "disclaimer": "Screening risk estimate - not a diagnostic system",
}

# --------------------------------------------------------------------------
# PALETTE (sampled from the SAATHI app design system)
# --------------------------------------------------------------------------
PRIMARY = "#00685F"      # deep teal
MINT = "#99EFE5"
MINT_SOFT = "#D5F8F5"
LAVENDER = "#EFF4FF"
BG = "#F8F9FF"
INK = "#12241F"
INK_SOFT = "#3E5A54"
GREY = "#8AA39D"
WHITE = "#FFFFFF"

W, H = 1920, 1080        # 16:9 slide
SCALE = 2                # supersampling factor for crisp edges


# --------------------------------------------------------------------------
# Fonts
# --------------------------------------------------------------------------
def _font_dir() -> Path:
    try:
        import matplotlib

        return Path(matplotlib.__file__).parent / "mpl-data" / "fonts" / "ttf"
    except Exception:
        for cand in (
            "/usr/share/fonts/truetype/dejavu",
            "/usr/share/fonts/dejavu",
            "/Library/Fonts",
        ):
            if os.path.isdir(cand):
                return Path(cand)
        raise SystemExit("No usable font directory found.")


FONT_DIR = _font_dir()


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(str(FONT_DIR / name), size)


# --------------------------------------------------------------------------
# Drawing helpers
# --------------------------------------------------------------------------
def text_w(f: ImageFont.FreeTypeFont, s: str) -> int:
    return f.getbbox(s)[2] - f.getbbox(s)[0]


def draw_tracked(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    s: str,
    f: ImageFont.FreeTypeFont,
    fill: str,
    tracking: int = 0,
) -> int:
    """Draw text with letter-spacing; returns the total width drawn."""
    x, y = xy
    for ch in s:
        draw.text((x, y), ch, font=f, fill=fill)
        x += text_w(f, ch) + tracking
    return x - xy[0] - (tracking if s else 0)


def tracked_w(f: ImageFont.FreeTypeFont, s: str, tracking: int = 0) -> int:
    return sum(text_w(f, ch) for ch in s) + tracking * max(len(s) - 1, 0)


def wrap(f: ImageFont.FreeTypeFont, s: str, max_w: int) -> list[str]:
    words, lines, cur = s.split(), [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if text_w(f, trial) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def wrap_balanced(f: ImageFont.FreeTypeFont, s: str, max_w: int) -> list[str]:
    """Wrap into the fewest lines that fit, then rebalance the word counts so
    no line is a lonely orphan (e.g. a single short word on the last line)."""
    words = s.split()
    if not words:
        return []
    n = len(words)
    space = text_w(f, " ")
    widths = [text_w(f, w) for w in words]

    def line_w(chunk: list[int]) -> int:
        return sum(widths[i] for i in chunk) + space * (len(chunk) - 1)

    for n_lines in range(1, n + 1):
        base, extra = divmod(n, n_lines)
        chunks, start = [], 0
        for i in range(n_lines):
            take = base + (1 if i < extra else 0)
            chunks.append(list(range(start, start + take)))
            start += take
        if all(line_w(c) <= max_w for c in chunks):
            return [" ".join(words[i] for i in c) for c in chunks]
    return wrap(f, s, max_w)


def fit_one_line(
    s: str, max_w: int, start: int, minimum: int, bold: bool = False
) -> tuple[ImageFont.FreeTypeFont, int]:
    """Largest font size <= start that keeps s on a single line."""
    size = start
    while size > minimum and text_w(font(size, bold), s) > max_w:
        size -= 2
    return font(size, bold), size


def gradient(size: tuple[int, int], stops: list[tuple[float, tuple[int, int, int]]]) -> Image.Image:
    """Horizontal gradient image. stops = [(pos 0..1, (r,g,b)), ...]"""
    w, h = size
    grad = Image.new("RGB", (w, 1))
    px = grad.load()
    for x in range(w):
        t = x / max(w - 1, 1)
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                k = 0 if p1 == p0 else (t - p0) / (p1 - p0)
                px[x, 0] = tuple(int(c0[j] + (c1[j] - c0[j]) * k) for j in range(3))
                break
        else:
            px[x, 0] = stops[-1][1]
    return grad.resize((w, h))


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def soft_blobs(img: Image.Image, spec: list[tuple[tuple[int, int], int, str, int]]) -> None:
    """Paste blurred translucent circles onto img (in place)."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for (cx, cy), r, colour, alpha in spec:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=hex_rgb(colour) + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(90))
    img.alpha_composite(layer)


def card(
    size: tuple[int, int],
    radius: int,
    pad: int = 90,
    fill: str = WHITE,
    border: tuple[str, int] | None = (MINT_SOFT, 3),
    shadow: tuple[int, int, int] = (26, 10, 34),
) -> Image.Image:
    """Rounded-rectangle card with a soft drop shadow, returned as RGBA.

    The returned image is padded by `pad` on every side; the card's top-left
    inside that padding is (pad, pad).
    """
    w, h = size
    img = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        [pad, pad + shadow[1], pad + w, pad + h + shadow[1]],
        radius=radius,
        fill=(15, 40, 36, shadow[2]),
    )
    sh = sh.filter(ImageFilter.GaussianBlur(shadow[0]))
    img.alpha_composite(sh)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([pad, pad, pad + w, pad + h], radius=radius, fill=fill)
    if border:
        d.rounded_rectangle(
            [pad, pad, pad + w, pad + h],
            radius=radius,
            outline=hex_rgb(border[0]) + (255,),
            width=border[1],
        )
    return img


def accent_bar(
    card_img: Image.Image, pad: int, card_w: int, card_h: int, width: int, inset: int
) -> None:
    """Rounded gradient accent bar along the left edge of a card."""
    bar_h = card_h - 2 * inset
    grad = gradient((width, bar_h), [(0.0, hex_rgb(PRIMARY)), (1.0, hex_rgb(MINT))])
    mask = Image.new("L", (width, bar_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, width, bar_h], radius=width // 2, fill=255)
    card_img.paste(grad, (pad + inset, pad + inset), mask)


def fit_image(img: Image.Image, max_w: int, max_h: int) -> Image.Image:
    """Uniformly downscale img so it fits inside max_w x max_h."""
    k = min(max_w / img.width, max_h / img.height, 1.0)
    if k >= 1.0:
        return img
    return img.resize((max(1, int(img.width * k)), max(1, int(img.height * k))), Image.LANCZOS)


# --------------------------------------------------------------------------
# The text box itself (shared by every output)
# --------------------------------------------------------------------------
def render_text_box(scale: int = 1, card_w: int = 1240) -> Image.Image:
    """Render the styled text box card (plus shadow padding) at `scale`."""
    s = scale
    pad_x, pad_y = 96 * s, 68 * s
    bar = 14 * s
    cw_total = card_w * s
    inner_w = cw_total - pad_x * 2 - bar - 40 * s

    f_eyebrow = font(28 * s, bold=True)
    f_title = font(128 * s, bold=True)
    f_body = font(38 * s)
    f_sub, _ = fit_one_line(CONTENT["subtitle"], inner_w, 52 * s, 34 * s, bold=True)

    bullet_lines = [wrap_balanced(f_body, b, inner_w - 46 * s) for b in CONTENT["bullets"]]
    bullet_gap = 28 * s
    body_h = sum(len(ls) * (46 * s) for ls in bullet_lines) + bullet_gap * (len(bullet_lines) - 1)

    card_h = (
        pad_y * 2
        + 32 * s            # eyebrow
        + 42 * s            # gap
        + 146 * s           # title
        + 30 * s            # gap
        + 60 * s            # rule
        + 26 * s            # gap
        + 60 * s            # subtitle
        + 28 * s            # gap
        + body_h            # bullets
    )

    img = card((cw_total, card_h), radius=34 * s, pad=90 * s)
    accent_bar(img, 90 * s, cw_total, card_h, width=bar, inset=56 * s)

    d = ImageDraw.Draw(img)
    ox, oy = 90 * s, 90 * s
    x = ox + pad_x + bar + 40 * s
    y = oy + pad_y

    draw_tracked(d, (x, y), CONTENT["event"], f_eyebrow, PRIMARY, tracking=6 * s)
    y += 32 * s + 42 * s

    draw_tracked(d, (x, y), CONTENT["title"], f_title, PRIMARY, tracking=10 * s)
    y += 146 * s + 30 * s

    d.rounded_rectangle([x, y, x + 150 * s, y + 8 * s], radius=4 * s, fill=hex_rgb(MINT) + (255,))
    y += 60 * s

    d.text((x, y), CONTENT["subtitle"], font=f_sub, fill=INK)
    y += 60 * s + 28 * s

    for ls in bullet_lines:
        for i, line in enumerate(ls):
            if i == 0:
                d.ellipse(
                    [x + 4 * s, y + 15 * s, x + 22 * s, y + 33 * s],
                    fill=hex_rgb(MINT) + (255,),
                )
            d.text((x + 46 * s, y), line, font=f_body, fill=INK_SOFT)
            y += 46 * s
        y += bullet_gap

    return img


# --------------------------------------------------------------------------
# Outputs
# --------------------------------------------------------------------------
def assets_dir() -> Path:
    return Path(__file__).resolve().parent.parent / "src" / "assets"


def out_dir() -> Path:
    d = Path(__file__).resolve().parent.parent / "public" / "sih-ppt"
    d.mkdir(parents=True, exist_ok=True)
    return d


def make_transparent_textbox() -> None:
    img = render_text_box(scale=SCALE)
    pad = 90 * SCALE
    img.crop((pad, pad, img.width - pad, img.height - pad)).save(out_dir() / "sih-textbox.png")
    print("wrote sih-textbox.png")


def make_textbox_slide() -> None:
    s = SCALE
    Wd, Hd = W * s, H * s
    slide = Image.new("RGBA", (Wd, Hd), hex_rgb(BG) + (255,))

    soft_blobs(
        slide,
        [
            ((int(Wd * 0.95), int(Hd * 0.06)), 430 * s, MINT, 70),
            ((int(Wd * 0.05), int(Hd * 1.03)), 470 * s, LAVENDER, 90),
            ((int(Wd * 0.55), int(Hd * 1.18)), 390 * s, MINT_SOFT, 70),
        ],
    )
    strip = gradient((Wd, 16 * s), [(0.0, hex_rgb(PRIMARY)), (0.55, hex_rgb(MINT)), (1.0, hex_rgb(LAVENDER))])
    slide.paste(strip, (0, 0))

    # hero text box, fitted into its slot
    slot = (int(1120 * s), int(690 * s))
    box = fit_image(render_text_box(scale=s), slot[0], slot[1])
    slide.alpha_composite(box, (int(140 * s), int(215 * s)))

    # right-hand logo panel
    panel_w, panel_h = int(430 * s), int(500 * s)
    px, py = int(Wd - 140 * s - panel_w), int(215 * s)
    panel = Image.new("RGBA", (panel_w, panel_h), (0, 0, 0, 0))
    ImageDraw.Draw(panel).rounded_rectangle(
        [0, 0, panel_w, panel_h], radius=34 * s, fill=hex_rgb(MINT_SOFT) + (205,)
    )
    logo_path = assets_dir() / "saathi-logo.png"
    if logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
        target_w = int(panel_w * 0.74)
        logo = logo.resize((target_w, int(logo.height * target_w / logo.width)), Image.LANCZOS)
        panel.alpha_composite(logo, ((panel_w - logo.width) // 2, (panel_h - logo.height) // 2))
    slide.alpha_composite(panel, (px, py))

    # footer
    d = ImageDraw.Draw(slide)
    f_foot = font(34 * s)
    d.text((140 * s, Hd - 92 * s), CONTENT["footer"], font=f_foot, fill=INK_SOFT)
    dim = "16:9  ·  1920 x 1080"
    d.text((Wd - 140 * s - text_w(f_foot, dim), Hd - 92 * s), dim, font=f_foot, fill=GREY)

    slide.convert("RGB").resize((W, H), Image.LANCZOS).save(out_dir() / "sih-textbox-slide.png")
    print("wrote sih-textbox-slide.png")


def make_title_slide() -> None:
    s = SCALE
    Wd, Hd = W * s, H * s
    slide = Image.new("RGBA", (Wd, Hd), hex_rgb(BG) + (255,))

    soft_blobs(
        slide,
        [
            ((int(Wd * 0.10), int(Hd * 0.12)), 430 * s, MINT, 60),
            ((int(Wd * 0.93), int(Hd * 0.88)), 490 * s, LAVENDER, 90),
            ((int(Wd * 0.5), int(-Hd * 0.06)), 380 * s, MINT_SOFT, 80),
        ],
    )
    strip = gradient((Wd, 16 * s), [(0.0, hex_rgb(PRIMARY)), (0.55, hex_rgb(MINT)), (1.0, hex_rgb(LAVENDER))])
    slide.paste(strip, (0, 0))

    d = ImageDraw.Draw(slide)

    # logo mark
    mark_path = assets_dir() / "saathi-mark.png"
    if mark_path.exists():
        mark = Image.open(mark_path).convert("RGBA")
        target_w = int(250 * s)
        mark = mark.resize((target_w, int(mark.height * target_w / mark.width)), Image.LANCZOS)
        slide.alpha_composite(mark, ((Wd - mark.width) // 2, int(105 * s)))

    # big title
    f_title = font(148 * s, bold=True)
    tw = tracked_w(f_title, CONTENT["title"], 16 * s)
    draw_tracked(
        d, ((Wd - tw) // 2, int(345 * s)), CONTENT["title"], f_title, PRIMARY, tracking=16 * s
    )

    # tagline
    f_tag = font(50 * s)
    tag = CONTENT["tagline"]
    d.text(((Wd - text_w(f_tag, tag)) // 2, int(545 * s)), tag, font=f_tag, fill=INK)

    # rule
    d.rounded_rectangle(
        [(Wd // 2 - 150 * s, int(645 * s)), (Wd // 2 + 150 * s, int(653 * s))],
        radius=4 * s,
        fill=hex_rgb(MINT) + (255,),
    )

    # chip
    f_chip = font(30 * s, bold=True)
    cw = tracked_w(f_chip, CONTENT["chip"], 4 * s) + 90 * s
    cx, cy = (Wd - cw) // 2, int(700 * s)
    d.rounded_rectangle([cx, cy, cx + cw, cy + 72 * s], radius=36 * s, fill=hex_rgb(MINT_SOFT) + (255,))
    draw_tracked(d, (cx + 45 * s, cy + 18 * s), CONTENT["chip"], f_chip, PRIMARY, tracking=4 * s)

    # event line
    f_ev = font(38 * s, bold=True)
    ev = CONTENT["event"]
    draw_tracked(
        d, ((Wd - tracked_w(f_ev, ev, 6 * s)) // 2, int(830 * s)), ev, f_ev, INK_SOFT, tracking=6 * s
    )

    # footer disclaimer
    f_foot = font(30 * s)
    disc = CONTENT["disclaimer"]
    d.text(((Wd - text_w(f_foot, disc)) // 2, Hd - 96 * s), disc, font=f_foot, fill=GREY)

    slide.convert("RGB").resize((W, H), Image.LANCZOS).save(out_dir() / "sih-title-slide.png")
    print("wrote sih-title-slide.png")


if __name__ == "__main__":
    make_transparent_textbox()
    make_textbox_slide()
    make_title_slide()
